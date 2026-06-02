import {
  parseTrimmedWithSchema,
  parseWithSchema,
} from "@shared/utils/zodValidation";
import { describe, expect, it } from "vitest";
import { z } from "zod";

describe("parseWithSchema", () => {
  it("returns parsed data for valid input", () => {
    const schema = z.object({ name: z.string().min(1) });

    const result = parseWithSchema(schema, { name: "alpha" });

    expect(result).toEqual({ name: "alpha" });
  });

  it("throws prefixed error message for invalid input", () => {
    const schema = z.object({ name: z.string().min(2) });

    expect(() =>
      parseWithSchema(schema, { name: "a" }, { messagePrefix: "Invalid" }),
    ).toThrow(/Invalid:/);
  });

  it("throws first issue message when configured", () => {
    const schema = z.object({ name: z.string().min(2) });

    expect(() =>
      parseWithSchema(
        schema,
        { name: "a" },
        { useFirstIssueMessage: true, fallbackMessage: "Fallback" },
      ),
    ).toThrow();
  });

  it("trims selected string fields before parsing", () => {
    const schema = z.object({ name: z.string().min(2), note: z.string() });

    const result = parseTrimmedWithSchema(
      schema,
      { name: "  alpha  ", note: "  keep  " },
      ["name"],
    );

    expect(result).toEqual({ name: "alpha", note: "  keep  " });
  });
});
