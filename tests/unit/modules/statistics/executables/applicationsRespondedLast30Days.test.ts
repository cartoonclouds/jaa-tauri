import { ApplicationsRespondedLast30Days } from "@modules/statistics/domain/executables/applicationsRespondedLast30Days";
import { createFailingDb, createMockDb } from "../../../shared/utils/dbTestUtils";
import { describe, expect, it } from "vitest";

describe("ApplicationsRespondedLast30Days", () => {
  it("returns count and positive trend", async () => {
    const { db } = createMockDb([{ applicationsRespondedLast30Days: 6 }]);
    const executable = new ApplicationsRespondedLast30Days(db);

    const initialView = executable.toView();
    expect(initialView.value).toBe(0);
    expect(initialView.trendTone).toBe("neutral");

    await expect(executable.execute()).resolves.toBe(6);

    const view = executable.toView();
    expect(view.id).toBe(ApplicationsRespondedLast30Days.id);
    expect(view.value).toBe(6);
    expect(view.trendTone).toBe("positive");
  });

  it("propagates database errors", async () => {
    const executable = new ApplicationsRespondedLast30Days(
      createFailingDb(new Error("select failed")),
    );

    await expect(executable.execute()).rejects.toThrow("select failed");
  });
});

