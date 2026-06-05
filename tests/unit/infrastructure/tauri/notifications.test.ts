import {
  isNotificationSupported,
  sendTauriNotification,
} from "@infra/tauri/notifications";
import { beforeEach, describe, expect, it, vi } from "vitest";

class NotificationTestError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NotificationTestError";
  }
}

const { mockSendNotification, mockIsPermissionGranted, mockRequestPermission } =
  vi.hoisted(() => ({
    mockSendNotification: vi.fn(),
    mockIsPermissionGranted: vi.fn(),
    mockRequestPermission: vi.fn(),
  }));

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
      mockIsPermissionGranted.mockResolvedValue(true);
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
      mockIsPermissionGranted.mockResolvedValue(true);
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
      mockIsPermissionGranted.mockResolvedValue(true);
      const error = new Error("Notification failed");
      mockSendNotification.mockImplementation(() => {
        throw error;
      });

      const result = await sendTauriNotification({
        title: "Test",
        body: "Test body",
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe("Notification failed");
    });

    it("should handle non-Error exceptions", async () => {
      mockIsPermissionGranted.mockResolvedValue(true);
      mockSendNotification.mockImplementation(() => {
        throw new NotificationTestError("Unknown error");
      });

      const result = await sendTauriNotification({
        title: "Test",
        body: "Test body",
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe("Unknown error");
    });

    it("should request permission before sending when not already granted", async () => {
      mockIsPermissionGranted.mockResolvedValue(false);
      mockRequestPermission.mockResolvedValue("granted");
      mockSendNotification.mockResolvedValue(undefined);

      const result = await sendTauriNotification({
        title: "Test",
        body: "Test body",
      });

      expect(result.success).toBe(true);
      expect(mockRequestPermission).toHaveBeenCalled();
      expect(mockSendNotification).toHaveBeenCalled();
    });

    it("should return an error when permission is denied", async () => {
      mockIsPermissionGranted.mockResolvedValue(false);
      mockRequestPermission.mockResolvedValue("denied");

      const result = await sendTauriNotification({
        title: "Test",
        body: "Test body",
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe("Notification permission not granted");
      expect(mockSendNotification).not.toHaveBeenCalled();
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
      mockRequestPermission.mockResolvedValue("granted");

      const supported = await isNotificationSupported();

      expect(supported).toBe(true);
      expect(mockRequestPermission).toHaveBeenCalled();
    });

    it("should return false when permission is denied", async () => {
      mockIsPermissionGranted.mockResolvedValue(false);
      mockRequestPermission.mockResolvedValue("denied");

      const supported = await isNotificationSupported();

      expect(supported).toBe(false);
    });

    it("should handle permission request errors", async () => {
      mockIsPermissionGranted.mockResolvedValue(false);
      mockRequestPermission.mockRejectedValue(new Error("Permission denied"));

      const supported = await isNotificationSupported();

      expect(supported).toBe(false);
    });

    it("should return false when in non-browser environment", async () => {
      const originalWindowDescriptor = Object.getOwnPropertyDescriptor(
        globalThis,
        "window",
      );
      Object.defineProperty(globalThis, "window", {
        value: undefined,
        configurable: true,
      });

      const supported = await isNotificationSupported();

      expect(supported).toBe(false);

      if (originalWindowDescriptor) {
        Object.defineProperty(globalThis, "window", originalWindowDescriptor);
      }
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
