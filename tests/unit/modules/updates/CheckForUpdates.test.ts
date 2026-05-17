import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  checkForUpdates,
  checkForUpdatesSilently,
} from "@modules/updates/application/use-cases/CheckForUpdates";

const checkForUpdatesMock = vi.fn();

vi.mock("@modules/updates/application/services/UpdateService", () => ({
  UpdateService: {
    getInstance: () => ({
      checkForUpdates: checkForUpdatesMock,
    }),
  },
}));

describe("CheckForUpdates Use Cases", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("checks for updates and notifies by default", async () => {
    checkForUpdatesMock.mockResolvedValueOnce({ hasUpdate: true });

    const result = await checkForUpdates();

    expect(result.hasUpdate).toBe(true);
    expect(checkForUpdatesMock).toHaveBeenCalledWith(true);
  });

  it("checks for updates silently", async () => {
    checkForUpdatesMock.mockResolvedValueOnce({ hasUpdate: false });

    const result = await checkForUpdatesSilently();

    expect(result.hasUpdate).toBe(false);
    expect(checkForUpdatesMock).toHaveBeenCalledWith(false);
  });
});
