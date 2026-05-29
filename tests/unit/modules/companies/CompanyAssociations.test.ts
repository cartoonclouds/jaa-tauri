import { CompanyRepository } from "@modules/companies";
import { describe, expect, it, vi } from "vitest";

function mockDb() {
  return {
    select: vi.fn(async () => []),
    execute: vi.fn(async () => ({ rowsAffected: 1 })),
    transaction: vi.fn(async (callback: (tx: unknown) => Promise<unknown>) =>
      callback(null),
    ),
  };
}

describe("CompanyRepository associations", () => {
  it("derives application status without relying on applications.status column", async () => {
    const db = mockDb();
    db.select = vi.fn(async () => [
      {
        id: "app-1",
        title: "Frontend Engineer",
        status: "offer",
        applied_at: "2026-05-01T10:00:00.000Z",
      },
    ]);

    const repository = new CompanyRepository(db as never);
    const applications =
      await repository.listAssociatedApplications("company-1");

    expect(applications).toEqual([
      {
        id: "app-1",
        title: "Frontend Engineer",
        status: "offer",
        appliedAt: "2026-05-01T10:00:00.000Z",
      },
    ]);

    expect(db.select).toHaveBeenCalledTimes(1);
    const [query] = db.select.mock.calls[0] as [string, unknown[]];
    expect(query).toContain("CASE");
    expect(query).toContain("AS status");
    expect(query).toContain("applications.deleted_at IS NULL");
    expect(query).not.toContain("applications.status");
  });

  it("falls back to saved status when derived value is missing", async () => {
    const db = mockDb();
    db.select = vi.fn(async () => [
      {
        id: "app-2",
        title: "Backend Engineer",
        status: null,
        applied_at: null,
      },
    ]);

    const repository = new CompanyRepository(db as never);
    const applications =
      await repository.listAssociatedApplications("company-2");

    expect(applications).toEqual([
      {
        id: "app-2",
        title: "Backend Engineer",
        status: "saved",
        appliedAt: null,
      },
    ]);
  });
});
