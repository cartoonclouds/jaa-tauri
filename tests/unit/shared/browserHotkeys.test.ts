import { shouldBlockBrowserHotkey } from "@shared/utils/browserHotkeys";
import { describe, expect, it } from "vitest";

type BrowserHotkeyEvent = Pick<
  KeyboardEvent,
  "key" | "ctrlKey" | "metaKey" | "altKey" | "shiftKey"
>;

function mockEvent(overrides: Partial<BrowserHotkeyEvent>): BrowserHotkeyEvent {
  return {
    key: "",
    ctrlKey: false,
    metaKey: false,
    altKey: false,
    shiftKey: false,
    ...overrides,
  };
}

describe("shouldBlockBrowserHotkey", () => {
  it("allows Ctrl+S and Cmd+S so app-level save handlers can run", () => {
    expect(
      shouldBlockBrowserHotkey(mockEvent({ key: "s", ctrlKey: true })),
    ).toBe(false);

    expect(
      shouldBlockBrowserHotkey(mockEvent({ key: "S", metaKey: true })),
    ).toBe(false);
  });

  it("continues to block other modified browser shortcuts", () => {
    expect(
      shouldBlockBrowserHotkey(mockEvent({ key: "p", ctrlKey: true })),
    ).toBe(true);

    expect(
      shouldBlockBrowserHotkey(
        mockEvent({ key: "s", ctrlKey: true, shiftKey: true }),
      ),
    ).toBe(true);
  });

  it("blocks function-key shortcuts", () => {
    expect(shouldBlockBrowserHotkey(mockEvent({ key: "F5" }))).toBe(true);
  });
});
