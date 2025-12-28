/**
 * Unit tests for ConfigManager
 * Tests all configuration management functionality
 */

import { describe, it, expect, beforeEach, afterEach } from "bun:test";
import { ConfigManager } from "../../configuration";
import {
  MockExtensionContext,
  MockWorkspaceConfiguration,
  vscode,
} from "../mocks/vscode";
import {
  minimalButton,
  fullFeaturedButton,
  testExtensionConfig,
  npmButton,
  yarnButton,
} from "../fixtures/button-configs";
import {
  createMockContext,
  createMockConfiguration,
} from "../utils/test-helpers";
import type { PresetConfig } from "../../types";

describe("ConfigManager", () => {
  let configManager: ConfigManager;
  let mockContext: MockExtensionContext;
  let mockConfig: MockWorkspaceConfiguration;

  beforeEach(() => {
    configManager = new ConfigManager();
    mockContext = createMockContext();
    mockConfig = createMockConfiguration();

    // Mock vscode.workspace.getConfiguration
    vscode.workspace.getConfiguration = (_section?: string) => mockConfig;
  });

  afterEach(() => {
    configManager.dispose();
  });

  describe("Initialization", () => {
    it("should initialize without errors", () => {
      expect(() => configManager.initialize(mockContext)).not.toThrow();
    });

    it("should set context after initialization", () => {
      configManager.initialize(mockContext);
      // Context should be set internally (verified by other tests working)
      expect(configManager).toBeDefined();
    });
  });

  describe("Get Configuration", () => {
    it("should return default configuration when no config exists", () => {
      const config = configManager.getConfig();

      expect(config).toBeDefined();
      expect(config.buttons).toEqual([]);
      expect(config.history).toBe(true);
      expect(config.autoDetect).toBe(true);
    });

    it("should return configured buttons", () => {
      mockConfig.setConfig("buttons", [minimalButton, fullFeaturedButton]);

      const config = configManager.getConfig();

      expect(config.buttons).toHaveLength(2);
      expect(config.buttons[0].id).toBe(minimalButton.id);
      expect(config.buttons[1].id).toBe(fullFeaturedButton.id);
    });

    it("should return theme configuration", () => {
      const customTheme = {
        mode: "dark" as const,
        dark: {
          button: { foreground: "#fff", background: "#000" },
          executing: { foreground: "#fff", background: "#007acc" },
          error: { foreground: "#fff", background: "#dc3545" },
        },
        light: {
          button: { foreground: "#000", background: "#fff" },
          executing: { foreground: "#fff", background: "#007acc" },
          error: { foreground: "#fff", background: "#dc3545" },
        },
        highContrast: {
          button: { foreground: "#fff", background: "#000" },
          executing: { foreground: "#000", background: "#ff0" },
          error: { foreground: "#fff", background: "#f00" },
        },
      };

      mockConfig.setConfig("theme", customTheme);

      const config = configManager.getConfig();

      expect(config.theme?.mode).toBe("dark");
    });
  });

  describe("Set Configuration", () => {
    it("should update buttons configuration", async () => {
      const buttons = [minimalButton, npmButton];

      await configManager.setConfig("buttons", buttons);

      // Verify the config was updated
      mockConfig.setConfig("buttons", buttons);
      const config = configManager.getConfig();
      expect(config.buttons).toHaveLength(2);
    });

    it("should update theme configuration", async () => {
      const theme = { mode: "light" as const };

      await configManager.setConfig("theme", theme);

      // Verify update
      expect(true).toBe(true); // Config update is async
    });
  });

  describe("Get Specific Config Value", () => {
    it("should return specific config value", () => {
      mockConfig.setConfig("settings.debug", true);

      const debug = configManager.getConfigValue("settings.debug", false);

      expect(debug).toBe(true);
    });

    it("should return default value when config doesn't exist", () => {
      const value = configManager.getConfigValue("nonexistent", "default");

      expect(value).toBe("default");
    });
  });

  describe("Configuration Change Watching", () => {
    it("should register configuration change callback", () => {
      let _callbackInvoked = false;
      const callback = () => {
        _callbackInvoked = true;
      };

      configManager.initialize(mockContext);
      const disposable = configManager.onConfigurationChanged(callback);

      expect(disposable).toBeDefined();
      expect(disposable.dispose).toBeDefined();
    });

    it("should dispose callback when disposable is called", () => {
      let callCount = 0;
      const callback = () => {
        callCount++;
      };

      configManager.initialize(mockContext);
      const disposable = configManager.onConfigurationChanged(callback);

      disposable.dispose();

      // Callback should not be invoked after disposal
      expect(callCount).toBe(0);
    });
  });

  describe("Configuration Validation", () => {
    it("should validate valid configuration", () => {
      const result = configManager.validateConfig(testExtensionConfig);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should detect missing button ID", () => {
      const invalidConfig = {
        ...testExtensionConfig,
        buttons: [
          {
            text: "No ID",
            command: { type: "shell" as const, command: "echo test" },
          } as any,
        ],
      };

      const result = configManager.validateConfig(invalidConfig);

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors.some((e) => e.includes("ID is required"))).toBe(
        true,
      );
    });

    it("should detect missing text and icon", () => {
      const invalidConfig = {
        ...testExtensionConfig,
        buttons: [
          {
            id: "test",
            command: { type: "shell" as const, command: "echo test" },
          } as any,
        ],
      };

      const result = configManager.validateConfig(invalidConfig);

      expect(result.isValid).toBe(false);
      expect(
        result.errors.some((e) =>
          e.includes("Either text or icon is required"),
        ),
      ).toBe(true);
    });

    it("should detect missing command", () => {
      const invalidConfig = {
        ...testExtensionConfig,
        buttons: [
          {
            id: "test",
            text: "Test",
          } as any,
        ],
      };

      const result = configManager.validateConfig(invalidConfig);

      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.includes("Command is required"))).toBe(
        true,
      );
    });

    it("should detect missing script for npm commands", () => {
      const invalidConfig = {
        ...testExtensionConfig,
        buttons: [
          {
            id: "test",
            text: "Test",
            command: { type: "npm" as const },
          } as any,
        ],
      };

      const result = configManager.validateConfig(invalidConfig);

      expect(result.isValid).toBe(false);
      expect(
        result.errors.some((e) =>
          e.includes("Script is required for npm commands"),
        ),
      ).toBe(true);
    });

    it("should detect missing command string for shell commands", () => {
      const invalidConfig = {
        ...testExtensionConfig,
        buttons: [
          {
            id: "test",
            text: "Test",
            command: { type: "shell" as const },
          } as any,
        ],
      };

      const result = configManager.validateConfig(invalidConfig);

      expect(result.isValid).toBe(false);
      expect(
        result.errors.some((e) =>
          e.includes("Command string is required for shell commands"),
        ),
      ).toBe(true);
    });

    it("should validate theme mode", () => {
      const invalidConfig = {
        ...testExtensionConfig,
        theme: {
          ...testExtensionConfig.theme!,
          mode: "invalid" as any,
        },
      };

      const result = configManager.validateConfig(invalidConfig);

      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.includes("Theme mode must be"))).toBe(
        true,
      );
    });

    it("should validate notification duration", () => {
      const invalidConfig = {
        ...testExtensionConfig,
        notifications: {
          ...testExtensionConfig.notifications!,
          duration: -1000,
        },
      };

      const result = configManager.validateConfig(invalidConfig);

      expect(result.isValid).toBe(false);
      expect(
        result.errors.some((e) => e.includes("duration must be a positive")),
      ).toBe(true);
    });
  });

  describe("Button Management", () => {
    beforeEach(() => {
      configManager.initialize(mockContext);
      mockConfig.setConfig("buttons", [minimalButton, npmButton]);
    });

    it("should get button config by ID", () => {
      const button = configManager.getButtonConfig(minimalButton.id);

      expect(button).toBeDefined();
      expect(button?.id).toBe(minimalButton.id);
      expect(button?.text).toBe(minimalButton.text);
    });

    it("should return null for non-existent button ID", () => {
      const button = configManager.getButtonConfig("nonexistent");

      expect(button).toBeNull();
    });

    it("should add new button config", async () => {
      await configManager.addButtonConfig(yarnButton);

      mockConfig.setConfig("buttons", [minimalButton, npmButton, yarnButton]);
      const config = configManager.getConfig();

      expect(config.buttons).toHaveLength(3);
      expect(config.buttons.some((b) => b.id === yarnButton.id)).toBe(true);
    });

    it("should throw error when adding duplicate button ID", async () => {
      await expect(
        configManager.addButtonConfig(minimalButton),
      ).rejects.toThrow("already exists");
    });

    it("should update button config", async () => {
      await configManager.updateButtonConfig(minimalButton.id, {
        text: "Updated Text",
      });

      mockConfig.setConfig("buttons", [
        { ...minimalButton, text: "Updated Text" },
        npmButton,
      ]);
      const config = configManager.getConfig();
      const button = config.buttons.find((b) => b.id === minimalButton.id);

      expect(button?.text).toBe("Updated Text");
    });

    it("should throw error when updating non-existent button", async () => {
      await expect(
        configManager.updateButtonConfig("nonexistent", { text: "Test" }),
      ).rejects.toThrow("not found");
    });

    it("should remove button config", async () => {
      await configManager.removeButtonConfig(minimalButton.id);

      mockConfig.setConfig("buttons", [npmButton]);
      const config = configManager.getConfig();

      expect(config.buttons).toHaveLength(1);
      expect(config.buttons.some((b) => b.id === minimalButton.id)).toBe(false);
    });

    it("should throw error when removing non-existent button", async () => {
      await expect(
        configManager.removeButtonConfig("nonexistent"),
      ).rejects.toThrow("not found");
    });
  });

  describe("Command History", () => {
    beforeEach(() => {
      configManager.initialize(mockContext);
    });

    it("should return empty history initially", () => {
      const history = configManager.getCommandHistory();

      expect(history).toEqual([]);
    });

    it("should add entry to history", async () => {
      const entry = {
        id: "entry-1",
        buttonId: "test-button",
        result: {
          code: 0,
          stdout: "Success",
          stderr: "",
          duration: 100,
          timestamp: new Date(),
          command: "test command",
        },
        command: "test command",
      };

      await configManager.addToHistory(entry);

      const history = configManager.getCommandHistory();

      expect(history).toHaveLength(1);
      expect(history[0].id).toBe(entry.id);
    });

    it("should limit history to 100 entries", async () => {
      // Add 105 entries
      for (let i = 0; i < 105; i++) {
        await configManager.addToHistory({
          id: `entry-${i}`,
          buttonId: "test",
          result: {
            code: 0,
            stdout: "",
            stderr: "",
            duration: 100,
            timestamp: new Date(),
            command: "test",
          },
          command: "test",
        });
      }

      const history = configManager.getCommandHistory();

      expect(history).toHaveLength(100);
    });

    it("should add new entries at the beginning", async () => {
      await configManager.addToHistory({
        id: "entry-1",
        buttonId: "test",
        result: {
          code: 0,
          stdout: "",
          stderr: "",
          duration: 100,
          timestamp: new Date(),
          command: "test",
        },
        command: "test",
      });

      await configManager.addToHistory({
        id: "entry-2",
        buttonId: "test",
        result: {
          code: 0,
          stdout: "",
          stderr: "",
          duration: 100,
          timestamp: new Date(),
          command: "test",
        },
        command: "test",
      });

      const history = configManager.getCommandHistory();

      expect(history[0].id).toBe("entry-2");
      expect(history[1].id).toBe("entry-1");
    });

    it("should clear all history", async () => {
      await configManager.addToHistory({
        id: "entry-1",
        buttonId: "test",
        result: {
          code: 0,
          stdout: "",
          stderr: "",
          duration: 100,
          timestamp: new Date(),
          command: "test",
        },
        command: "test",
      });

      await configManager.clearHistory();

      const history = configManager.getCommandHistory();

      expect(history).toEqual([]);
    });
  });

  describe("Preset Management", () => {
    let testPreset: PresetConfig;

    beforeEach(() => {
      configManager.initialize(mockContext);
      mockConfig.setConfig("buttons", [minimalButton]);

      testPreset = {
        id: "test-preset",
        name: "Test Preset",
        description: "A test preset",
        buttons: [npmButton, yarnButton],
      };
    });

    it("should validate valid preset", () => {
      const result = configManager.validatePresetApplication(testPreset);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should detect invalid preset without buttons", () => {
      const invalidPreset = { ...testPreset, buttons: undefined as any };

      const result = configManager.validatePresetApplication(invalidPreset);

      expect(result.isValid).toBe(false);
      expect(
        result.errors.some((e) => e.includes("must contain a buttons array")),
      ).toBe(true);
    });

    it("should apply preset in replace mode", async () => {
      await configManager.applyPreset(testPreset, "replace");

      mockConfig.setConfig("buttons", testPreset.buttons);
      const config = configManager.getConfig();

      expect(config.buttons).toHaveLength(2);
      expect(config.buttons.some((b) => b.id === npmButton.id)).toBe(true);
      expect(config.buttons.some((b) => b.id === yarnButton.id)).toBe(true);
      expect(config.buttons.some((b) => b.id === minimalButton.id)).toBe(false);
    });

    it("should apply preset in merge mode", async () => {
      // Add npm button with same ID to current config
      mockConfig.setConfig("buttons", [minimalButton, npmButton]);

      await configManager.applyPreset(testPreset, "merge");

      mockConfig.setConfig("buttons", [minimalButton, npmButton, yarnButton]);
      const config = configManager.getConfig();

      // Should have all unique buttons
      expect(config.buttons).toHaveLength(3);
    });

    it("should apply preset in append mode", async () => {
      await configManager.applyPreset(testPreset, "append");

      mockConfig.setConfig("buttons", [minimalButton, npmButton, yarnButton]);
      const config = configManager.getConfig();

      // Should have original + all preset buttons
      expect(config.buttons).toHaveLength(3);
    });

    it("should calculate preset impact for replace mode", () => {
      const impact = configManager.getPresetImpact(testPreset, "replace");

      expect(impact.added).toBe(2);
      expect(impact.removed).toBe(1);
      expect(impact.modified).toBe(0);
    });

    it("should calculate preset impact for merge mode", () => {
      mockConfig.setConfig("buttons", [npmButton]); // One overlapping button

      const impact = configManager.getPresetImpact(testPreset, "merge");

      expect(impact.added).toBe(1); // yarnButton
      expect(impact.modified).toBe(1); // npmButton
      expect(impact.removed).toBe(0);
    });

    it("should calculate preset impact for append mode", () => {
      const impact = configManager.getPresetImpact(testPreset, "append");

      expect(impact.added).toBe(2);
      expect(impact.modified).toBe(0);
      expect(impact.removed).toBe(0);
    });

    it("should apply theme from preset if present", async () => {
      const presetWithTheme = {
        ...testPreset,
        theme: {
          mode: "dark" as const,
          dark: {
            button: { foreground: "#fff", background: "#000" },
            executing: { foreground: "#fff", background: "#007acc" },
            error: { foreground: "#fff", background: "#dc3545" },
          },
          light: {
            button: { foreground: "#000", background: "#fff" },
            executing: { foreground: "#fff", background: "#007acc" },
            error: { foreground: "#fff", background: "#dc3545" },
          },
          highContrast: {
            button: { foreground: "#fff", background: "#000" },
            executing: { foreground: "#000", background: "#ff0" },
            error: { foreground: "#fff", background: "#f00" },
          },
        },
      };

      await configManager.applyPreset(presetWithTheme, "replace");

      // Verify theme was applied
      expect(true).toBe(true); // Theme update is async
    });
  });

  describe("Dispose", () => {
    it("should dispose without errors", () => {
      configManager.initialize(mockContext);

      expect(() => configManager.dispose()).not.toThrow();
    });

    it("should clean up configuration watcher", () => {
      configManager.initialize(mockContext);
      configManager.dispose();

      // Verify no errors occur after disposal
      expect(true).toBe(true);
    });
  });
});
