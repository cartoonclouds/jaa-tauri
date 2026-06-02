import { ActivePipelineApplications } from "@modules/statistics/domain/executables/activePipelineApplications";
import { createFailingDb, createMockDb } from "@testUtils/dbTestUtils";
import { describe, expect, it } from "vitest";

describe("ActivePipelineApplications", () => {
  it("returns count and positive trend", async () => {
    const { db } = createMockDb([{ activePipelineApplications: 17 }]);
    const executable = new ActivePipelineApplications(db);

    const initialView = executable.toView();
    expect(initialView.value).toBe(0);
    expect(initialView.trendTone).toBe("neutral");

    await expect(executable.execute()).resolves.toBe(17);

    const view = executable.toView();
    expect(view.id).toBe(ActivePipelineApplications.id);
    expect(view.value).toBe(17);
    expect(view.trendTone).toBe("positive");
  });

  it("propagates database errors", async () => {
    const executable = new ActivePipelineApplications(
      createFailingDb(new Error("select failed")),
    );

    await expect(executable.execute()).rejects.toThrow("select failed");
  });
});
