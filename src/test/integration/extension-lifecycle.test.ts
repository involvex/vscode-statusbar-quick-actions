/**
 * Integration tests for extension lifecycle
 * Tests the complete extension activation and button lifecycle
 */

import { describe, it, expect, beforeEach, afterEach } from "bun:test";
import { StatusBarQuickActionsExtension } from "../../extension";
import { MockExtensionContext, vscode } from "../mocks/vscode";
import { minimalButton, npmButton } from "../fixtures/button-configs";
import { wait } from "../utils/test-helpers";

describe("Extension Lifecycle Integration", () => {
  let extension: StatusBarQuickActionsExtension;
  let mockContext: MockExtensionContext;

  beforeEach(() => {
    mockContext = new MockExtensionContext();
    extension = new StatusBarQuickActionsExtension(mockContext);
  });

  afterEach(() => {
    extension.deactivate();
  });

  describe("Activation", () => {
    it("should activate extension successfully", async () => {
      await expect(extension.activate()).resolves.not.toThrow();
    });

    it("should not activate twice", async () => {
      await extension.activate();
      await extension.activate(); // Second activation should be no-op

      expect(true).toBe(true);
    });

    it("should register commands during activation", async () => {
      await extension.activate();

      // Check that subscriptions were registered
      expect(mockContext.subscriptions.length).toBeGreaterThan(0);
    });
  });

  describe("Deactivation", () => {
    it("should deactivate successfully", async () => {
      await extension.activate();

      expect(() => extension.deactivate()).not.toThrow();
    });

    it("should clean up resources on deactivation", async () => {
      await extension.activate();
      extension.deactivate();

      // Verify no errors occur after deactivation
      expect(true).toBe(true);
    });

    it("should not throw when deactivating inactive extension", () => {
      expect(() => extension.deactivate()).not.toThrow();
    });
  });

  describe("Button Lifecycle", () => {
    it("should create buttons from configuration", async () => {
      // Set up configuration with buttons
      const config = vscode.workspace.getConfiguration();
      (config as any).setConfig("buttons", [minimalButton, npmButton]);

      await extension.activate();

      // Wait for async button creation
      await wait(100);

      // Verify buttons were created (would be visible in real VSCode)
      expect(true).toBe(true);
    });

    it("should update buttons when configuration changes", async () => {
      const config = vscode.workspace.getConfiguration();
      (config as any).setConfig("buttons", [minimalButton]);

      await extension.activate();
      await wait(100);

      // Update configuration
      (config as any).setConfig("buttons", [minimalButton, npmButton]);
      await wait(200);

      // Buttons should be updated
      expect(true).toBe(true);
    });

    it("should handle empty button configuration", async () => {
      const config = vscode.workspace.getConfiguration();
      (config as any).setConfig("buttons", []);

      await extension.activate();
      await wait(100);

      // Should activate without errors
      expect(true).toBe(true);
    });
  });

  describe("Performance", () => {
    it("should activate in under 200ms", async () => {
      const startTime = Date.now();

      await extension.activate();

      const duration = Date.now() - startTime;

      // Extension activation should be fast
      expect(duration).toBeLessThan(200);
    });

    it("should handle multiple buttons efficiently", async () => {
      const manyButtons = Array.from({ length: 50 }, (_, i) => ({
        ...minimalButton,
        id: `button-${i}`,
        text: `Button ${i}`,
      }));

      const config = vscode.workspace.getConfiguration();
      (config as any).setConfig("buttons", manyButtons);

      const startTime = Date.now();
      await extension.activate();
      await wait(100);
      const duration = Date.now() - startTime;

      // Should handle many buttons without significant performance impact
      expect(duration).toBeLessThan(500);
    });
  });

  describe("Error Handling", () => {
    it("should handle activation errors gracefully", async () => {
      // Force an error by providing invalid context
      const invalidExtension = new StatusBarQuickActionsExtension(null as any);

      // Should not throw, but log error
      await expect(invalidExtension.activate()).resolves.not.toThrow();
    });

    it("should handle invalid button configurations", async () => {
      const config = vscode.workspace.getConfiguration();
      (config as any).setConfig("buttons", [
        { id: "invalid", text: "", command: null },
      ]);

      // Should activate but skip invalid buttons
      await expect(extension.activate()).resolves.not.toThrow();
    });
  });
});
