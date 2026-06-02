import { ApplicationsOfferLast30Days } from "@modules/statistics/domain/executables/applicationsOfferLast30Days";
import { createFailingDb, createMockDb } from "@testUtils/dbTestUtils";
import { describe, expect, it } from "vitest";

describe("ApplicationsOfferLast30Days", () => {
  it("returns count and positive trend", async () => {
    const { db } = createMockDb([{ applicationsOfferLast30Days: 3 }]);
    const executable = new ApplicationsOfferLast30Days(db);

    const initialView = executable.toView();
    expect(initialView.value).toBe(0);
    expect(initialView.trendTone).toBe("neutral");

    await expect(executable.execute()).resolves.toBe(3);

    const view = executable.toView();
    expect(view.id).toBe(ApplicationsOfferLast30Days.id);
    expect(view.value).toBe(3);
    expect(view.trendTone).toBe("positive");
  });

  it("propagates database errors", async () => {
    const executable = new ApplicationsOfferLast30Days(
      createFailingDb(new Error("select failed")),
    );

    await expect(executable.execute()).rejects.toThrow("select failed");
  });
});
