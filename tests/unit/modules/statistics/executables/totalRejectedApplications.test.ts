import { TotalRejectedApplications } from "@modules/statistics/domain/executables/totalRejectedApplications";
import { createFailingDb, createMockDb } from "../../../shared/utils/dbTestUtils";
import { describe, expect, it } from "vitest";

describe("TotalRejectedApplications", () => {
  it("returns count and positive trend", async () => {
    const { db } = createMockDb([{ totalRejectedApplications: 8 }]);
    const executable = new TotalRejectedApplications(db);

    const initialView = executable.toView();
    expect(initialView.value).toBe(0);
    expect(initialView.trendTone).toBe("neutral");

    await expect(executable.execute()).resolves.toBe(8);

    const view = executable.toView();
    expect(view.id).toBe(TotalRejectedApplications.id);
    expect(view.value).toBe(8);
    expect(view.trendTone).toBe("positive");
  });

  it("propagates database errors", async () => {
    const executable = new TotalRejectedApplications(
      createFailingDb(new Error("select failed")),
    );

    await expect(executable.execute()).rejects.toThrow("select failed");
  });
});

