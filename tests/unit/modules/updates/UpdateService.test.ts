import { beforeEach, describe, expect, it, vi } from "vitest";
import { UpdateService } from "@modules/updates";

const { checkMock, sendInfoNotificationMock } = vi.hoisted(() => ({
  checkMock: vi.fn(),
  sendInfoNotificationMock: vi.fn(async () => ({ success: true })),
}));

vi.mock("@tauri-apps/plugin-updater", () => ({
  check: checkMock,
}));

vi.mock("@modules/notifications", () => ({
  sendInfoNotification: sendInfoNotificationMock,
}));

describe("UpdateService", () => {
  const originalWindow = globalThis.window;

  beforeEach(() => {
    vi.clearAllMocks();
    // Ensure browser-like environment for tests.
    (globalThis as unknown as { window: Window }).window = {} as Window;
  });

  afterEach(() => {
    (globalThis as unknown as { window: Window | undefined }).window =
      originalWindow;
  });

  it("returns no update when server has none", async () => {
    checkMock.mockResolvedValueOnce(null);

    const result = await UpdateService.getInstance().checkForUpdates();

    expect(result.hasUpdate).toBe(false);
    expect(sendInfoNotificationMock).not.toHaveBeenCalled();
  });

  it("notifies user when update is available", async () => {
    checkMock.mockResolvedValueOnce({
      version: "1.2.0",
      currentVersion: "1.1.0",
      date: "2026-05-17",
      body: "Bug fixes and improvements",
    });

    const result = await UpdateService.getInstance().checkForUpdates(true);

    expect(result.hasUpdate).toBe(true);
    expect(result.update?.version).toBe("1.2.0");
    expect(sendInfoNotificationMock).toHaveBeenCalledTimes(1);
  });

  it("does not notify when notify flag is false", async () => {
    checkMock.mockResolvedValueOnce({
      version: "1.2.0",
      currentVersion: "1.1.0",
      date: "2026-05-17",
      body: "Bug fixes and improvements",
    });

    const result = await UpdateService.getInstance().checkForUpdates(false);

    expect(result.hasUpdate).toBe(true);
    expect(sendInfoNotificationMock).not.toHaveBeenCalled();
  });

  it("returns an error when check fails", async () => {
    checkMock.mockRejectedValueOnce(new Error("Server unavailable"));

    const result = await UpdateService.getInstance().checkForUpdates();

    expect(result.hasUpdate).toBe(false);
    expect(result.error).toBe("Server unavailable");
  });
});
