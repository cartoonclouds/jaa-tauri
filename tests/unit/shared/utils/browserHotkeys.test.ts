import { shouldBlockBrowserHotkey } from "@shared/utils/browserHotkeys";
import { describe, expect, it } from "vitest";

describe("shouldBlockBrowserHotkey", () => {
  it("returns true for function keys", () => {
    expect(
      shouldBlockBrowserHotkey({
        key: "F5",
        ctrlKey: false,
        metaKey: false,
        altKey: false,
      }),
    ).toBe(true);
  });

  it("returns true for Ctrl/Cmd/Alt modified combinations", () => {
    expect(
      shouldBlockBrowserHotkey({
        key: "r",
        ctrlKey: true,
        metaKey: false,
        altKey: false,
      }),
    ).toBe(true);

    expect(
      shouldBlockBrowserHotkey({
        key: "r",
        ctrlKey: false,
        metaKey: true,
        altKey: false,
      }),
    ).toBe(true);

    expect(
      shouldBlockBrowserHotkey({
        key: "ArrowLeft",
        ctrlKey: false,
        metaKey: false,
        altKey: true,
      }),
    ).toBe(true);
  });

  it("returns false for regular unmodified keys", () => {
    expect(
      shouldBlockBrowserHotkey({
        key: "a",
        ctrlKey: false,
        metaKey: false,
        altKey: false,
      }),
    ).toBe(false);
  });
});
