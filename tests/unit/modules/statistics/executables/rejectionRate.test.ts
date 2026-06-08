import { RejectionRate } from "@modules/statistics/domain/executables/rejectionRate";
import { createFailingDb, createMockDb } from "../../../shared/utils/dbTestUtils";
import { describe, expect, it } from "vitest";

describe("RejectionRate", () => {
  it("computes rejection percentage and card metadata", async () => {
    const { db } = createMockDb([{ rejected: 4, applied: 8 }]);
    const executable = new RejectionRate(db);

    const initialView = executable.toView();
    expect(initialView.value).toBe(0);
    expect(initialView.trendTone).toBe("neutral");

    await expect(executable.execute()).resolves.toBe(50);

    const view = executable.toView();
    expect(view.id).toBe(RejectionRate.id);
    expect(view.value).toBe(50);
    expect(view.suffix).toBe("%");
    expect(view.trendTone).toBe("positive");
  });

  it("propagates database errors", async () => {
    const executable = new RejectionRate(
      createFailingDb(new Error("select failed")),
    );

    await expect(executable.execute()).rejects.toThrow("select failed");
  });
});

