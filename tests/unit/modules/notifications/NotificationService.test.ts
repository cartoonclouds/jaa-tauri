import { describe, it, expect, beforeEach, vi } from "vitest";
import { NotificationService } from "@modules/notifications/application/services/NotificationService";
import { NotificationSeverity } from "@modules/notifications";

// Mock the infrastructure layer
vi.mock("@infra/tauri/notifications", () => ({
  sendTauriNotification: vi.fn(async () => ({
    success: true,
    id: "123",
  })),
  isNotificationSupported: vi.fn(async () => true),
}));

describe("NotificationService", () => {
  let service: NotificationService;

  beforeEach(() => {
    // Get a fresh instance for each test
    service = NotificationService.getInstance();
  });

  it("should be a singleton", () => {
    const instance1 = NotificationService.getInstance();
    const instance2 = NotificationService.getInstance();
    expect(instance1).toBe(instance2);
  });

  describe("initialize", () => {
    it("should initialize and check support", async () => {
      await service.initialize();
      expect(service.isSupported()).toBe(true);
    });
  });

  describe("send", () => {
    beforeEach(async () => {
      await service.initialize();
    });

    it("should send a notification", async () => {
      const result = await service.send({
        title: "Test",
        body: "Body",
      });

      expect(result.success).toBe(true);
      expect(result.id).toBe("123");
    });

    it("should fail when notifications are not supported", async () => {
      const unsupportedService = NotificationService.getInstance();
      // Manually set support to false
      (unsupportedService as any).supported = false;

      const result = await unsupportedService.send({
        title: "Test",
        body: "Body",
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe("Notifications not supported");
    });
  });

  describe("convenience methods", () => {
    beforeEach(async () => {
      await service.initialize();
    });

    it("should send info notification", async () => {
      const result = await service.sendInfo("Info Title", "Info Body");
      expect(result.success).toBe(true);
    });

    it("should send success notification", async () => {
      const result = await service.sendSuccess("Success Title", "Success Body");
      expect(result.success).toBe(true);
    });

    it("should send warning notification", async () => {
      const result = await service.sendWarning("Warning Title", "Warning Body");
      expect(result.success).toBe(true);
    });

    it("should send error notification", async () => {
      const result = await service.sendError("Error Title", "Error Body");
      expect(result.success).toBe(true);
    });
  });

  describe("sendRich", () => {
    beforeEach(async () => {
      await service.initialize();
    });

    it("should send rich notification with severity", async () => {
      const result = await service.sendRich({
        id: "1",
        title: "Rich Title",
        body: "Rich Body",
        severity: NotificationSeverity.SUCCESS,
        timestamp: new Date(),
      });

      expect(result.success).toBe(true);
    });

    it("should handle optional properties", async () => {
      const result = await service.sendRich({
        id: "1",
        title: "Title",
        body: "Body",
        icon: "/icon.png",
        badge: "/badge.png",
      });

      expect(result.success).toBe(true);
    });
  });
});
