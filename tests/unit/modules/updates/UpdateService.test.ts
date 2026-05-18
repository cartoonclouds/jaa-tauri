import { UpdateService } from "@modules/updates";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { checkMock, sendInfoNotificationMock } = vi.hoisted(() => ({
  checkMock: vi.fn(),
  sendInfoNotificationMock: vi.fn(async () => ({ success: true })),
}));

const createMockUpdate = (overrides?: {
  downloadAndInstall?: (onEvent?: (event: unknown) => void) => Promise<void>;
}) => ({
  version: "1.2.0",
  currentVersion: "1.1.0",
  date: "2026-05-17",
  body: "Bug fixes and improvements",
  downloadAndInstall:
    overrides?.downloadAndInstall ?? vi.fn(async () => Promise.resolve()),
});

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
    checkMock.mockResolvedValueOnce(createMockUpdate());

    const result = await UpdateService.getInstance().checkForUpdates(true);

    expect(result.hasUpdate).toBe(true);
    expect(result.update?.version).toBe("1.2.0");
    expect(sendInfoNotificationMock).toHaveBeenCalledTimes(1);
  });

  it("does not notify when notify flag is false", async () => {
    checkMock.mockResolvedValueOnce(createMockUpdate());

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

  it("installs a pending update", async () => {
    const downloadAndInstall = vi.fn(async () => Promise.resolve());

    checkMock.mockResolvedValueOnce(
      createMockUpdate({
        downloadAndInstall,
      }),
    );

    const service = UpdateService.getInstance();
    await service.checkForUpdates(false);

    const result = await service.installPendingUpdate();

    expect(downloadAndInstall).toHaveBeenCalledTimes(1);
    expect(result).toEqual({ success: true });
    expect(service.hasPendingUpdate()).toBe(false);
  });

  it("returns an error when installing without a pending update", async () => {
    checkMock.mockResolvedValueOnce(null);

    const service = UpdateService.getInstance();
    await service.checkForUpdates(false);
    const result = await service.installPendingUpdate();

    expect(result.success).toBe(false);
    expect(result.error).toBe("No pending update to install");
  });

  it("tracks download progress during install", async () => {
    const downloadAndInstall = vi.fn(
      async (onEvent?: (event: unknown) => void) => {
        onEvent?.({ event: "Started", data: { contentLength: 100 } });
        onEvent?.({ event: "Progress", data: { chunkLength: 25 } });
        onEvent?.({ event: "Progress", data: { chunkLength: 75 } });
        onEvent?.({ event: "Finished" });
      },
    );

    checkMock.mockResolvedValueOnce(
      createMockUpdate({
        downloadAndInstall,
      }),
    );

    const service = UpdateService.getInstance();
    await service.checkForUpdates(false);

    const progressEvents: {
      downloadedBytes: number;
      contentLength: number | null;
    }[] = [];
    const result = await service.installPendingUpdate((progress) => {
      progressEvents.push(progress);
    });

    expect(result.success).toBe(true);
    expect(progressEvents).toEqual([
      { downloadedBytes: 0, contentLength: 100 },
      { downloadedBytes: 25, contentLength: 100 },
      { downloadedBytes: 100, contentLength: 100 },
    ]);
  });
});
