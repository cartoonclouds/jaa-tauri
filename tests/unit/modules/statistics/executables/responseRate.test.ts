import { ResponseRate } from "@modules/statistics/domain/executables/responseRate";
import { createFailingDb, createMockDb } from "../../../shared/utils/dbTestUtils";
import { describe, expect, it } from "vitest";


describe("ResponseRate", () => {
  it("computes response rate and negative points trend", async () => {
    const { db } = createMockDb([
      {
        responded: 4,
        applied: 8,
        responded_last_30: 1,
        applied_last_30: 4,
        responded_previous_30: 3,
        applied_previous_30: 4,
      },
    ]);
    const executable = new ResponseRate(db);

    expect(executable.toView().trendValue).toBeUndefined();

    await expect(executable.execute()).resolves.toBe(50);

    const view = executable.toView();
    expect(view.id).toBe(ResponseRate.id);
    expect(view.value).toBe(50);
    expect(view.suffix).toBe("%");
    expect(view.trendLabel).toBe("vs previous 30-day response rate");
    expect(view.trendValue).toBe("-50pp");
    expect(view.trendTone).toBe("negative");
  });

  it("propagates database errors", async () => {
    const executable = new ResponseRate(
      createFailingDb(new Error("select failed")),
    );

    await expect(executable.execute()).rejects.toThrow("select failed");
  });
});

