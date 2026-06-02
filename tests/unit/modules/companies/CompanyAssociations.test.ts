import { CompanyRepository } from "@modules/companies";
import { createMockDbWithOptions } from "@testUtils/dbTestUtils";
import { describe, expect, it } from "vitest";

function mockDb() {
  const { db, selectMock } = createMockDbWithOptions();

  return {
    db,
    selectMock,
  };
}

describe("CompanyRepository associations", () => {
  it("derives application status without relying on applications.status column", async () => {
    const { db, selectMock } = mockDb();
    selectMock.mockImplementation(() =>
      Promise.resolve([
        {
          id: "app-1",
          title: "Frontend Engineer",
          status: "offer",
          applied_at: "2026-05-01T10:00:00.000Z",
        },
      ]),
    );

    const repository = new CompanyRepository(db);
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

    expect(selectMock).toHaveBeenCalledTimes(1);
    const query = selectMock.mock.calls[0]?.[0];
    if (typeof query !== "string") {
      throw new Error("Expected SQL query to be passed to db.select");
    }
    expect(query).toContain("CASE");
    expect(query).toContain("AS status");
    expect(query).toContain("applications.deleted_at IS NULL");
    expect(query).not.toContain("applications.status");
  });

  it("falls back to saved status when derived value is missing", async () => {
    const { db, selectMock } = mockDb();
    selectMock.mockImplementation(() =>
      Promise.resolve([
        {
          id: "app-2",
          title: "Backend Engineer",
          status: null,
          applied_at: null,
        },
      ]),
    );

    const repository = new CompanyRepository(db);
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
