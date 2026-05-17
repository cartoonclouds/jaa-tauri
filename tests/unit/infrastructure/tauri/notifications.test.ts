import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  sendTauriNotification,
  isNotificationSupported,
} from "@infra/tauri/notifications";

// Mock Tauri plugin
const mockSendNotification = vi.fn();
const mockIsPermissionGranted = vi.fn();
const mockRequestPermission = vi.fn();

vi.mock("@tauri-apps/plugin-notification", () => ({
  sendNotification: mockSendNotification,
  isPermissionGranted: mockIsPermissionGranted,
  requestPermission: mockRequestPermission,
}));

describe("Tauri Notifications Adapter", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("sendTauriNotification", () => {
    it("should send notification successfully", async () => {
      mockSendNotification.mockResolvedValue(undefined);

      const result = await sendTauriNotification({
        title: "Test",
        body: "Test body",
      });

      expect(result.success).toBe(true);
      expect(result.id).toBeDefined();
      expect(mockSendNotification).toHaveBeenCalledWith({
        title: "Test",
        body: "Test body",
        icon: undefined,
        sound: undefined,
      });
    });

    it("should include all properties in request", async () => {
      mockSendNotification.mockResolvedValue(undefined);

      const request = {
        title: "Title",
        body: "Body",
        icon: "/icon.png",
        sound: "/sound.mp3",
      };

      await sendTauriNotification(request);

      expect(mockSendNotification).toHaveBeenCalledWith({
        title: "Title",
        body: "Body",
        icon: "/icon.png",
        sound: "/sound.mp3",
      });
    });

    it("should handle errors gracefully", async () => {
      const error = new Error("Notification failed");
      mockSendNotification.mockRejectedValue(error);

      const result = await sendTauriNotification({
        title: "Test",
        body: "Test body",
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe("Notification failed");
    });

    it("should handle non-Error exceptions", async () => {
      mockSendNotification.mockRejectedValue("Unknown error");

      const result = await sendTauriNotification({
        title: "Test",
        body: "Test body",
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe("Unknown error");
    });
  });

  describe("isNotificationSupported", () => {
    it("should return true when permission is granted", async () => {
      mockIsPermissionGranted.mockResolvedValue(true);

      const supported = await isNotificationSupported();

      expect(supported).toBe(true);
      expect(mockRequestPermission).not.toHaveBeenCalled();
    });

    it("should request permission when not granted", async () => {
      mockIsPermissionGranted.mockResolvedValue(false);
      mockRequestPermission.mockResolvedValue(undefined);

      const supported = await isNotificationSupported();

      expect(supported).toBe(true);
      expect(mockRequestPermission).toHaveBeenCalled();
    });

    it("should handle permission request errors", async () => {
      mockIsPermissionGranted.mockResolvedValue(false);
      mockRequestPermission.mockRejectedValue(new Error("Permission denied"));

      const supported = await isNotificationSupported();

      expect(supported).toBe(false);
    });

    it("should return false when in non-browser environment", async () => {
      // Mock window being undefined
      const originalWindow = global.window;
      (global as any).window = undefined;

      const supported = await isNotificationSupported();

      expect(supported).toBe(false);

      // Restore
      (global as any).window = originalWindow;
    });

    it("should return false on import errors", async () => {
      mockIsPermissionGranted.mockRejectedValue(
        new Error("Plugin not available"),
      );

      const supported = await isNotificationSupported();

      expect(supported).toBe(false);
    });
  });
});
