import { TotalOffers } from "@modules/statistics/domain/executables/totalOffers";
import { createFailingDb, createMockDb } from "@testUtils/dbTestUtils";
import { describe, expect, it } from "vitest";

describe("TotalOffers", () => {
  it("returns count and positive trend", async () => {
    const { db } = createMockDb([{ totalOffers: 5 }]);
    const executable = new TotalOffers(db);

    const initialView = executable.toView();
    expect(initialView.value).toBe(0);
    expect(initialView.trendTone).toBe("neutral");

    await expect(executable.execute()).resolves.toBe(5);

    const view = executable.toView();
    expect(view.id).toBe(TotalOffers.id);
    expect(view.value).toBe(5);
    expect(view.trendTone).toBe("positive");
  });

  it("propagates database errors", async () => {
    const executable = new TotalOffers(
      createFailingDb(new Error("select failed")),
    );

    await expect(executable.execute()).rejects.toThrow("select failed");
  });
});
