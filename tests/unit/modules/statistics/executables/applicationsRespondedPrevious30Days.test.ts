import { ApplicationsRespondedPrevious30Days } from "@modules/statistics/domain/executables/applicationsRespondedPrevious30Days";
import { createFailingDb, createMockDb } from "@testUtils/dbTestUtils";
import { describe, expect, it } from "vitest";

describe("ApplicationsRespondedPrevious30Days", () => {
  it("returns count and positive trend", async () => {
    const { db } = createMockDb([{ applicationsRespondedPrevious30Days: 1 }]);
    const executable = new ApplicationsRespondedPrevious30Days(db);

    const initialView = executable.toView();
    expect(initialView.value).toBe(0);
    expect(initialView.trendTone).toBe("neutral");

    await expect(executable.execute()).resolves.toBe(1);

    const view = executable.toView();
    expect(view.id).toBe(ApplicationsRespondedPrevious30Days.id);
    expect(view.value).toBe(1);
    expect(view.trendTone).toBe("positive");
  });

  it("propagates database errors", async () => {
    const executable = new ApplicationsRespondedPrevious30Days(
      createFailingDb(new Error("select failed")),
    );

    await expect(executable.execute()).rejects.toThrow("select failed");
  });
});
