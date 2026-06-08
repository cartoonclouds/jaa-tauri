import { OfferRate } from "@modules/statistics/domain/executables/offerRate";
import { createFailingDb, createMockDb } from "../../../shared/utils/dbTestUtils";
import { describe, expect, it } from "vitest";

describe("OfferRate", () => {
  it("computes offer rate and positive points trend", async () => {
    const { db } = createMockDb([
      {
        offers: 4,
        applied: 8,
        offers_last_30: 3,
        applied_last_30: 4,
        offers_previous_30: 1,
        applied_previous_30: 4,
      },
    ]);
    const executable = new OfferRate(db);

    expect(executable.toView().trendValue).toBeUndefined();

    await expect(executable.execute()).resolves.toBe(50);

    const view = executable.toView();
    expect(view.id).toBe(OfferRate.id);
    expect(view.value).toBe(50);
    expect(view.suffix).toBe("%");
    expect(view.trendLabel).toBe("vs previous 30-day offer rate");
    expect(view.trendValue).toBe("+50pp");
    expect(view.trendTone).toBe("positive");
  });

  it("propagates database errors", async () => {
    const executable = new OfferRate(
      createFailingDb(new Error("select failed")),
    );

    await expect(executable.execute()).rejects.toThrow("select failed");
  });
});

