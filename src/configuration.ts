/**
 * Configuration management for StatusBar Quick Actions
 */

import * as vscode from "vscode";
import {
  StatusBarButtonConfig,
  ExtensionConfig,
  ThemeConfig,
  NotificationConfig,
  CommandHistoryEntry,
} from "./types";

/**
 * Configuration Manager
 * Handles reading, writing, and watching configuration changes
 */
export class ConfigManager {
  private static readonly CONFIG_SECTION = "statusbarQuickActions";
  private static readonly GLOBAL_STATE_KEY = "statusbarQuickActions.history";

  private context: vscode.ExtensionContext | null = null;
  private onChangeCallbacks: ((config: ExtensionConfig) => void)[] = [];
  private configChangeListener: vscode.Disposable | null = null;

  /**
   * Initialize the configuration manager
   */
  public initialize(context: vscode.ExtensionContext): void {
    this.context = context;
    this.setupConfigurationWatching();
  }

  /**
   * Get the current configuration
   */
  public getConfig(): ExtensionConfig {
    const config = vscode.workspace.getConfiguration(
      ConfigManager.CONFIG_SECTION,
    );

    return {
      buttons: config.get("buttons", []),
      theme: config.get("theme", this.getDefaultThemeConfig()),
      notifications: config.get(
        "notifications",
        this.getDefaultNotificationConfig(),
      ),
      history: config.get("history", true),
      autoDetect: config.get("autoDetect", true),
    };
  }

  /**
   * Set a configuration value
   */
  public async setConfig<T>(key: string, value: T): Promise<void> {
    const config = vscode.workspace.getConfiguration(
      ConfigManager.CONFIG_SECTION,
    );
    await config.update(key, value, vscode.ConfigurationTarget.Workspace);
  }

  /**
   * Get a specific configuration value
   */
  public getConfigValue<T>(key: string, defaultValue: T): T {
    const config = vscode.workspace.getConfiguration(
      ConfigManager.CONFIG_SECTION,
    );
    return config.get(key, defaultValue);
  }

  /**
   * Add a callback for configuration changes
   */
  public onConfigurationChanged(
    callback: (config: ExtensionConfig) => void,
  ): vscode.Disposable {
    this.onChangeCallbacks.push(callback);

    return {
      dispose: () => {
        const index = this.onChangeCallbacks.indexOf(callback);
        if (index > -1) {
          this.onChangeCallbacks.splice(index, 1);
        }
      },
    };
  }

  /**
   * Set up configuration change watching
   */
  private setupConfigurationWatching(): void {
    if (!this.context) {
      return;
    }

    this.configChangeListener = vscode.workspace.onDidChangeConfiguration(
      (event) => {
        if (event.affectsConfiguration(ConfigManager.CONFIG_SECTION)) {
          const newConfig = this.getConfig();
          this.onChangeCallbacks.forEach((callback) => {
            try {
              callback(newConfig);
            } catch (error) {
              console.error("Error in configuration change callback:", error);
            }
          });
        }
      },
    );

    if (this.context) {
      this.context.subscriptions.push(this.configChangeListener);
    }
  }

  /**
   * Get default theme configuration
   */
  private getDefaultThemeConfig(): ThemeConfig {
    return {
      mode: "auto",
      dark: {
        button: {
          foreground: "#ffffff",
          background: "#6c757d",
        },
        executing: {
          foreground: "#ffffff",
          background: "#007acc",
        },
        error: {
          foreground: "#ffffff",
          background: "#dc3545",
        },
      },
      light: {
        button: {
          foreground: "#ffffff",
          background: "#6c757d",
        },
        executing: {
          foreground: "#ffffff",
          background: "#007acc",
        },
        error: {
          foreground: "#ffffff",
          background: "#dc3545",
        },
      },
      highContrast: {
        button: {
          foreground: "#ffffff",
          background: "#000000",
        },
        executing: {
          foreground: "#000000",
          background: "#ffff00",
        },
        error: {
          foreground: "#ffffff",
          background: "#ff0000",
        },
      },
    };
  }

  /**
   * Get default notification configuration
   */
  private getDefaultNotificationConfig(): NotificationConfig {
    return {
      showSuccess: true,
      showError: true,
      showProgress: true,
      position: "bottom-right",
      duration: 5000,
      includeOutput: false,
    };
  }

  /**
   * Validate configuration
   */
  public validateConfig(config: ExtensionConfig): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    // Validate buttons
    if (!Array.isArray(config.buttons)) {
      errors.push("Buttons must be an array");
    } else {
      config.buttons.forEach((button, index) => {
        if (!button.id || typeof button.id !== "string") {
          errors.push(`Button ${index}: ID is required and must be a string`);
        }
        if (!button.text && !button.icon) {
          errors.push(`Button ${index}: Either text or icon is required`);
        }
        if (!button.command || typeof button.command !== "object") {
          errors.push(
            `Button ${index}: Command is required and must be an object`,
          );
        } else {
          // Validate command structure
          if (!button.command.type) {
            errors.push(`Button ${index}: Command type is required`);
          }
          // Validate that package manager commands have a script
          if (
            [
              "npm",
              "yarn",
              "pnpm",
              "bun",
              "bunx",
              "npx",
              "pnpx",
              "detect",
            ].includes(button.command.type) &&
            !button.command.script
          ) {
            errors.push(
              `Button ${index}: Script is required for ${button.command.type} commands`,
            );
          }
          // Validate that non-package manager commands have a command string
          if (
            ["shell", "github", "vscode", "task"].includes(
              button.command.type,
            ) &&
            !button.command.command
          ) {
            errors.push(
              `Button ${index}: Command string is required for ${button.command.type} commands`,
            );
          }
        }
      });
    }

    // Validate theme configuration
    if (config.theme) {
      if (
        !["auto", "dark", "light", "highContrast"].includes(config.theme.mode)
      ) {
        errors.push("Theme mode must be auto, dark, light, or highContrast");
      }
    }

    // Validate notification configuration
    if (config.notifications) {
      if (config.notifications.duration && config.notifications.duration < 0) {
        errors.push("Notification duration must be a positive number");
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Get button configuration by ID
   */
  public getButtonConfig(buttonId: string): StatusBarButtonConfig | null {
    const config = this.getConfig();
    return config.buttons.find((button) => button.id === buttonId) || null;
  }

  /**
   * Update a specific button configuration
   */
  public async updateButtonConfig(
    buttonId: string,
    updates: Partial<StatusBarButtonConfig>,
  ): Promise<void> {
    const config = this.getConfig();
    const buttonIndex = config.buttons.findIndex(
      (button) => button.id === buttonId,
    );

    if (buttonIndex === -1) {
      throw new Error(`Button with ID '${buttonId}' not found`);
    }

    const updatedButton = { ...config.buttons[buttonIndex], ...updates };
    config.buttons[buttonIndex] = updatedButton;

    await this.setConfig("buttons", config.buttons);
  }

  /**
   * Add a new button configuration
   */
  public async addButtonConfig(button: StatusBarButtonConfig): Promise<void> {
    const config = this.getConfig();

    // Check for duplicate IDs
    if (config.buttons.some((b) => b.id === button.id)) {
      throw new Error(`Button with ID '${button.id}' already exists`);
    }

    config.buttons.push(button);
    await this.setConfig("buttons", config.buttons);
  }

  /**
   * Remove a button configuration
   */
  public async removeButtonConfig(buttonId: string): Promise<void> {
    const config = this.getConfig();
    const filteredButtons = config.buttons.filter(
      (button) => button.id !== buttonId,
    );

    if (filteredButtons.length === config.buttons.length) {
      throw new Error(`Button with ID '${buttonId}' not found`);
    }

    await this.setConfig("buttons", filteredButtons);
  }

  /**
   * Get command history
   */
  public getCommandHistory(): CommandHistoryEntry[] {
    if (!this.context) {
      return [];
    }
    return this.context.globalState.get(ConfigManager.GLOBAL_STATE_KEY, []);
  }

  /**
   * Add command to history
   */
  public async addToHistory(entry: CommandHistoryEntry): Promise<void> {
    if (!this.context) {
      return;
    }

    const history = this.getCommandHistory();
    history.unshift(entry);

    // Keep only last 100 entries
    if (history.length > 100) {
      history.splice(100);
    }

    await this.context.globalState.update(
      ConfigManager.GLOBAL_STATE_KEY,
      history,
    );
  }

  /**
   * Clear command history
   */
  public async clearHistory(): Promise<void> {
    if (!this.context) {
      return;
    }

    await this.context.globalState.update(ConfigManager.GLOBAL_STATE_KEY, []);
  }

  /**
   * Dispose of resources
   */
  public dispose(): void {
    if (this.configChangeListener) {
      this.configChangeListener.dispose();
    }
  }
}
