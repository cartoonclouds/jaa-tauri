import { createEmptyApplicationFormValues } from "@modules/applications";
import { ApplicationEventFlowStatus } from "@modules/applications/types/enums";
import { describe, expect, it } from "vitest";

describe("createEmptyApplicationFormValues", () => {
  it("defaults event flow status to applied", () => {
    const values = createEmptyApplicationFormValues();

    expect(values.eventFlowStatus).toBe(ApplicationEventFlowStatus.Applied);
  });
});
