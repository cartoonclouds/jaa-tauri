import {
  temporalDateFromUnknown,
  temporalToIsoString,
  temporalToLocalParts,
} from "@shared/utils/temporal";
import { describe, expect, it } from "vitest";

function expectLocalDateTime(value: string): void {
  const parsed = temporalDateFromUnknown(value);
  const localParts = temporalToLocalParts(parsed);
  expect(localParts.year).toBe(2025);
  expect(localParts.month).toBe(12);
  expect(localParts.day).toBe(28);
  expect(localParts.hour).toBe(20);
  expect(localParts.minute).toBe(14);
}

const localDateTimeInputs = ["2025-12-28T20:14", "2025-12-28 20:14"] as const;

describe("temporal date parsing", () => {
  it("parses sqlite UTC datetime values with a space separator", () => {
    const parsed = temporalDateFromUnknown("2026-06-09 09:28:08");
    expect(temporalToIsoString(parsed)).toBe("2026-06-09T09:28:08Z");
  });

  it("parses sqlite UTC datetime values with fractional seconds", () => {
    const parsed = temporalDateFromUnknown("2026-06-09 09:28:08.123");
    expect(temporalToIsoString(parsed)).toBe("2026-06-09T09:28:08.123Z");
  });

  it.each(localDateTimeInputs)(
    "parses local datetime values without timezone from %s",
    (value) => {
      expectLocalDateTime(value);
    },
  );
});
