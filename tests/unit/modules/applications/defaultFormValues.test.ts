import { createEmptyApplicationFormValues } from "@modules/applications";
import { describe, expect, it } from "vitest";

describe("createEmptyApplicationFormValues", () => {
  it("defaults status to saved", () => {
    const values = createEmptyApplicationFormValues();

    expect(values.status.value).toBe("saved");
  });
});
