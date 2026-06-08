import { ApplicationsOfferPrevious30Days } from "@modules/statistics/domain/executables/applicationsOfferPrevious30Days";
import { createFailingDb, createMockDb } from "../../../shared/utils/dbTestUtils";
import { describe, expect, it } from "vitest";

describe("ApplicationsOfferPrevious30Days", () => {
  it("returns count and positive trend", async () => {
    const { db } = createMockDb([{ applicationsOfferPrevious30Days: 4 }]);
    const executable = new ApplicationsOfferPrevious30Days(db);

    const initialView = executable.toView();
    expect(initialView.value).toBe(0);
    expect(initialView.trendTone).toBe("neutral");

    await expect(executable.execute()).resolves.toBe(4);

    const view = executable.toView();
    expect(view.id).toBe(ApplicationsOfferPrevious30Days.id);
    expect(view.value).toBe(4);
    expect(view.trendTone).toBe("positive");
  });

  it("propagates database errors", async () => {
    const executable = new ApplicationsOfferPrevious30Days(
      createFailingDb(new Error("select failed")),
    );

    await expect(executable.execute()).rejects.toThrow("select failed");
  });
});

