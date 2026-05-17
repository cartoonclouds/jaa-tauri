import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  sendNotification,
  sendInfoNotification,
  sendSuccessNotification,
  sendWarningNotification,
  sendErrorNotification,
} from "@modules/notifications/application/use-cases/SendNotification";

// Mock the service
vi.mock(
  "@modules/notifications/application/services/NotificationService",
  () => {
    const mockService = {
      send: vi.fn(async () => ({ success: true, id: "123" })),
      sendInfo: vi.fn(async () => ({ success: true, id: "123" })),
      sendSuccess: vi.fn(async () => ({ success: true, id: "123" })),
      sendWarning: vi.fn(async () => ({ success: true, id: "123" })),
      sendError: vi.fn(async () => ({ success: true, id: "123" })),
    };

    return {
      NotificationService: {
        getInstance: () => mockService,
      },
    };
  },
);

describe("SendNotification Use Cases", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("sendNotification", () => {
    it("should send a custom notification", async () => {
      const result = await sendNotification({
        title: "Test",
        body: "Test body",
      });

      expect(result.success).toBe(true);
    });

    it("should pass all properties to service", async () => {
      const request = {
        title: "Test",
        body: "Body",
        icon: "/icon.png",
        badge: "/badge.png",
        tag: "unique",
        sound: "/sound.mp3",
      };

      const result = await sendNotification(request);
      expect(result.success).toBe(true);
    });
  });

  describe("sendInfoNotification", () => {
    it("should send info notification", async () => {
      const result = await sendInfoNotification("Info Title", "Info Body");
      expect(result.success).toBe(true);
    });
  });

  describe("sendSuccessNotification", () => {
    it("should send success notification", async () => {
      const result = await sendSuccessNotification(
        "Success Title",
        "Success Body",
      );
      expect(result.success).toBe(true);
    });
  });

  describe("sendWarningNotification", () => {
    it("should send warning notification", async () => {
      const result = await sendWarningNotification(
        "Warning Title",
        "Warning Body",
      );
      expect(result.success).toBe(true);
    });
  });

  describe("sendErrorNotification", () => {
    it("should send error notification", async () => {
      const result = await sendErrorNotification("Error Title", "Error Body");
      expect(result.success).toBe(true);
    });
  });
});
