import { ApplicationsAppliedPrevious30Days } from "@modules/statistics/domain/executables/applicationsAppliedPrevious30Days";
import { createFailingDb, createMockDb } from "../../../shared/utils/dbTestUtils";
import { describe, expect, it } from "vitest";

describe("ApplicationsAppliedPrevious30Days", () => {
  it("returns count and positive trend", async () => {
    const { db } = createMockDb([{ applicationsAppliedPrevious30Days: 2 }]);
    const executable = new ApplicationsAppliedPrevious30Days(db);

    const initialView = executable.toView();
    expect(initialView.value).toBe(0);
    expect(initialView.trendTone).toBe("neutral");

    await expect(executable.execute()).resolves.toBe(2);

    const view = executable.toView();
    expect(view.id).toBe(ApplicationsAppliedPrevious30Days.id);
    expect(view.value).toBe(2);
    expect(view.trendTone).toBe("positive");
  });

  it("propagates database errors", async () => {
    const executable = new ApplicationsAppliedPrevious30Days(
      createFailingDb(new Error("select failed")),
    );

    await expect(executable.execute()).rejects.toThrow("select failed");
  });
});

