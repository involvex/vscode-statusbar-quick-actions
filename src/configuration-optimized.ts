/**
 * Optimized Configuration management for StatusBar Quick Actions
 * Features: Caching, lazy loading, performance monitoring, and memory management
 */

import * as vscode from "vscode";
import {
  StatusBarButtonConfig,
  ExtensionConfig,
  ThemeConfig,
  NotificationConfig,
  CommandHistoryEntry,
  PresetConfig,
  PresetApplicationMode,
} from "./types";
import { PerformanceMonitor } from "./utils/performance-monitor";

/**
 * Optimized Configuration Manager with caching and performance monitoring
 */
export class OptimizedConfigManager {
  private static readonly CONFIG_SECTION = "statusbarQuickActions";
  private static readonly GLOBAL_STATE_KEY = "statusbarQuickActions.history";

  private context: vscode.ExtensionContext | null = null;
  private onChangeCallbacks: ((config: ExtensionConfig) => void)[] = [];
  private configChangeListener: vscode.Disposable | null = null;

  // Performance optimizations
  private performanceMonitor: PerformanceMonitor;
  private configCache = new Map<string, { data: unknown; timestamp: number }>();
  private readonly CACHE_TTL = 30000; // 30 seconds
  private readonly MAX_CACHE_SIZE = 50;
  private cacheOrder: string[] = [];

  // Optimization flags
  private isInitialized = false;
  private pendingUpdates = new Map<string, NodeJS.Timeout>();

  constructor(performanceMonitor?: PerformanceMonitor) {
    this.performanceMonitor = performanceMonitor || new PerformanceMonitor();
  }

  /**
   * Initialize the optimized configuration manager
   */
  public initialize(context: vscode.ExtensionContext): void {
    if (this.isInitialized) {
      return;
    }

    this.context = context;
    this.setupConfigurationWatching();
    this.isInitialized = true;

    this.performanceMonitor.recordMetric("config_manager_initialization", 5);
  }

  /**
   * Get the current configuration with caching
   */
  public getConfig(): ExtensionConfig {
    const stopTimer = this.performanceMonitor.startTimer("config_access");

    try {
      const cacheKey = "main_config";
      const cached = this.configCache.get(cacheKey);

      if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
        this.performanceMonitor.recordMetric("config_cache_hit", 1);
        return cached.data as unknown as ExtensionConfig;
      }

      // Cache miss - load from VS Code
      const config = this.loadConfiguration();

      // Update cache
      this.updateCache(cacheKey, config);

      this.performanceMonitor.recordMetric("config_cache_miss", 1);
      return config;
    } finally {
      stopTimer();
    }
  }

  /**
   * Get a specific configuration value with caching
   */
  public getConfigValue<T>(key: string, defaultValue: T): T {
    const cacheKey = `config_value_${key}`;
    const cached = this.configCache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.data as T;
    }

    const config = vscode.workspace.getConfiguration(
      OptimizedConfigManager.CONFIG_SECTION,
    );
    const value = config.get(key, defaultValue);

    this.updateCache(cacheKey, value);
    return value;
  }

  /**
   * Set a configuration value with debouncing
   */
  public async setConfig<T>(key: string, value: T): Promise<void> {
    const stopTimer = this.performanceMonitor.startTimer("config_update");

    try {
      // Clear any pending update for this key
      const pendingKey = `pending_${key}`;
      if (this.pendingUpdates.has(pendingKey)) {
        clearTimeout(this.pendingUpdates.get(pendingKey)!);
      }

      // Clear related cache entries
      this.clearCacheByPattern(key);

      // Perform the update with debouncing
      await new Promise<void>((resolve) => {
        const timeout = setTimeout(async () => {
          try {
            const config = vscode.workspace.getConfiguration(
              OptimizedConfigManager.CONFIG_SECTION,
            );
            await config.update(
              key,
              value,
              vscode.ConfigurationTarget.Workspace,
            );

            // Invalidate main config cache
            this.configCache.delete("main_config");

            resolve();
          } catch (error) {
            console.error("Failed to update configuration:", error);
            resolve();
          } finally {
            this.pendingUpdates.delete(pendingKey);
          }
        }, 100); // 100ms debounce

        this.pendingUpdates.set(pendingKey, timeout);
      });
    } finally {
      stopTimer();
    }
  }

  /**
   * Add a callback for configuration changes with performance monitoring
   */
  public onConfigurationChanged(
    callback: (config: ExtensionConfig) => void,
  ): vscode.Disposable {
    const wrappedCallback = (config: ExtensionConfig) => {
      const stopTimer = this.performanceMonitor.startTimer(
        "config_change_callback",
      );
      try {
        callback(config);
      } finally {
        stopTimer();
      }
    };

    this.onChangeCallbacks.push(wrappedCallback);

    return {
      dispose: () => {
        const index = this.onChangeCallbacks.indexOf(wrappedCallback);
        if (index > -1) {
          this.onChangeCallbacks.splice(index, 1);
        }
      },
    };
  }

  /**
   * Validate configuration with performance optimization
   */
  public async validateConfig(config: ExtensionConfig): Promise<{
    isValid: boolean;
    errors: string[];
  }> {
    const stopTimer = this.performanceMonitor.startTimer("config_validation");

    try {
      const errors: string[] = [];

      // Validate buttons with early exit for large configurations
      if (!Array.isArray(config.buttons)) {
        errors.push("Buttons must be an array");
        return { isValid: false, errors };
      }

      // Batch validation for better performance
      const validationTasks = config.buttons.map((button, index) =>
        this.validateButton(button, index),
      );

      // Process validation tasks in batches to avoid blocking
      const batchSize = 10;
      for (let i = 0; i < validationTasks.length; i += batchSize) {
        const batch = validationTasks.slice(i, i + batchSize);
        const batchErrors = await Promise.all(batch);
        errors.push(...batchErrors.flat());
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
        if (
          config.notifications.duration &&
          config.notifications.duration < 0
        ) {
          errors.push("Notification duration must be a positive number");
        }
      }

      return {
        isValid: errors.length === 0,
        errors,
      };
    } finally {
      stopTimer();
    }
  }

  /**
   * Get button configuration by ID with caching
   */
  public getButtonConfig(buttonId: string): StatusBarButtonConfig | null {
    const cacheKey = `button_${buttonId}`;
    const cached = this.configCache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.data as StatusBarButtonConfig | null;
    }

    const config = this.getConfig();
    const button =
      config.buttons.find((button) => button.id === buttonId) || null;

    if (button) {
      this.updateCache(cacheKey, button);
    }

    return button;
  }

  /**
   * Update a specific button configuration with caching
   */
  public async updateButtonConfig(
    buttonId: string,
    updates: Partial<StatusBarButtonConfig>,
  ): Promise<void> {
    const stopTimer = this.performanceMonitor.startTimer(
      "button_config_update",
    );

    try {
      const config = this.getConfig();
      const buttonIndex = config.buttons.findIndex(
        (button) => button.id === buttonId,
      );

      if (buttonIndex === -1) {
        throw new Error(`Button with ID '${buttonId}' not found`);
      }

      const updatedButton = { ...config.buttons[buttonIndex], ...updates };
      config.buttons[buttonIndex] = updatedButton;

      // Update caches
      this.updateCache(`button_${buttonId}`, updatedButton);
      this.configCache.delete("main_config");

      await this.setConfig("buttons", config.buttons);
    } finally {
      stopTimer();
    }
  }

  /**
   * Add a new button configuration with optimization
   */
  public async addButtonConfig(button: StatusBarButtonConfig): Promise<void> {
    const stopTimer = this.performanceMonitor.startTimer("button_config_add");

    try {
      const config = this.getConfig();

      // Check for duplicate IDs with optimized lookup
      if (config.buttons.some((b) => b.id === button.id)) {
        throw new Error(`Button with ID '${button.id}' already exists`);
      }

      config.buttons.push(button);

      // Update caches
      this.updateCache(`button_${button.id}`, button);
      this.configCache.delete("main_config");

      await this.setConfig("buttons", config.buttons);
    } finally {
      stopTimer();
    }
  }

  /**
   * Remove a button configuration with optimization
   */
  public async removeButtonConfig(buttonId: string): Promise<void> {
    const stopTimer = this.performanceMonitor.startTimer(
      "button_config_remove",
    );

    try {
      const config = this.getConfig();
      const filteredButtons = config.buttons.filter(
        (button) => button.id !== buttonId,
      );

      if (filteredButtons.length === config.buttons.length) {
        throw new Error(`Button with ID '${buttonId}' not found`);
      }

      // Update caches
      this.configCache.delete(`button_${buttonId}`);
      this.configCache.delete("main_config");

      await this.setConfig("buttons", filteredButtons);
    } finally {
      stopTimer();
    }
  }

  /**
   * Get command history with caching
   */
  public getCommandHistory(): CommandHistoryEntry[] {
    if (!this.context) {
      return [];
    }

    const cacheKey = "command_history";
    const cached = this.configCache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.data as CommandHistoryEntry[];
    }

    const history = this.context.globalState.get(
      OptimizedConfigManager.GLOBAL_STATE_KEY,
      [],
    );

    this.updateCache(cacheKey, history);
    return history;
  }

  /**
   * Add command to history with optimization
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

    // Update cache
    this.updateCache("command_history", history);

    await this.context.globalState.update(
      OptimizedConfigManager.GLOBAL_STATE_KEY,
      history,
    );
  }

  /**
   * Apply a preset with performance optimization
   */
  public async applyPreset(
    preset: PresetConfig,
    mode: PresetApplicationMode = "replace",
  ): Promise<void> {
    const stopTimer = this.performanceMonitor.startTimer("preset_application");

    try {
      const currentConfig = this.getConfig();
      let newButtons: StatusBarButtonConfig[];

      // Optimized preset application based on mode
      switch (mode) {
        case "replace":
          newButtons = [...preset.buttons];
          break;

        case "merge":
          newButtons = this.mergeButtons(currentConfig.buttons, preset.buttons);
          break;

        case "append":
          newButtons = this.appendButtons(
            currentConfig.buttons,
            preset.buttons,
          );
          break;

        default:
          throw new Error(`Unknown preset application mode: ${mode}`);
      }

      // Clear relevant caches
      this.clearCacheByPattern("button_");
      this.configCache.delete("main_config");

      // Apply changes
      await this.setConfig("buttons", newButtons);

      // Apply theme if present in preset
      if (preset.theme) {
        await this.setConfig("theme", preset.theme);
      }
    } finally {
      stopTimer();
    }
  }

  /**
   * Get performance metrics
   */
  public getPerformanceMetrics() {
    return this.performanceMonitor.getAllMetrics();
  }

  /**
   * Clear all caches
   */
  public clearCaches(): void {
    this.configCache.clear();
    this.cacheOrder = [];
    this.pendingUpdates.forEach((timeout) => clearTimeout(timeout));
    this.pendingUpdates.clear();
  }

  /**
   * Dispose of resources
   */
  public dispose(): void {
    if (this.configChangeListener) {
      this.configChangeListener.dispose();
    }
    this.clearCaches();
    this.onChangeCallbacks = [];
  }

  // Private helper methods

  private loadConfiguration(): ExtensionConfig {
    const config = vscode.workspace.getConfiguration(
      OptimizedConfigManager.CONFIG_SECTION,
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

  private setupConfigurationWatching(): void {
    if (!this.context) {
      return;
    }

    this.configChangeListener = vscode.workspace.onDidChangeConfiguration(
      (event) => {
        if (event.affectsConfiguration(OptimizedConfigManager.CONFIG_SECTION)) {
          // Clear all caches when configuration changes
          this.clearCaches();

          const newConfig = this.getConfig();

          // Notify callbacks with debouncing
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

  private async validateButton(
    button: StatusBarButtonConfig,
    index: number,
  ): Promise<string[]> {
    const errors: string[] = [];

    if (!button.id || typeof button.id !== "string") {
      errors.push(`Button ${index}: ID is required and must be a string`);
    }
    if (!button.text && !button.icon) {
      errors.push(`Button ${index}: Either text or icon is required`);
    }
    if (!button.command || typeof button.command !== "object") {
      errors.push(`Button ${index}: Command is required and must be an object`);
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
        ["shell", "github", "vscode", "task"].includes(button.command.type) &&
        !button.command.command
      ) {
        errors.push(
          `Button ${index}: Command string is required for ${button.command.type} commands`,
        );
      }
    }

    return errors;
  }

  private mergeButtons(
    current: StatusBarButtonConfig[],
    preset: StatusBarButtonConfig[],
  ): StatusBarButtonConfig[] {
    const result = [...current];

    for (const presetButton of preset) {
      const existingIndex = result.findIndex((b) => b.id === presetButton.id);
      if (existingIndex >= 0) {
        result[existingIndex] = presetButton;
      } else {
        result.push(presetButton);
      }
    }

    return result;
  }

  private appendButtons(
    current: StatusBarButtonConfig[],
    preset: StatusBarButtonConfig[],
  ): StatusBarButtonConfig[] {
    const result = [...current];

    for (const presetButton of preset) {
      let buttonToAdd = presetButton;

      // Generate new ID if there's a conflict
      if (result.some((b) => b.id === presetButton.id)) {
        buttonToAdd = {
          ...presetButton,
          id: `${presetButton.id}_${Date.now()}`,
        };
      }

      result.push(buttonToAdd);
    }

    return result;
  }

  private updateCache(key: string, data: unknown): void {
    // Implement LRU cache behavior
    const index = this.cacheOrder.indexOf(key);
    if (index > -1) {
      this.cacheOrder.splice(index, 1);
    }
    this.cacheOrder.push(key);

    // Remove oldest entries if cache is full
    while (this.cacheOrder.length > this.MAX_CACHE_SIZE) {
      const oldestKey = this.cacheOrder.shift()!;
      this.configCache.delete(oldestKey);
    }

    this.configCache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  private clearCacheByPattern(pattern: string): void {
    const keysToDelete: string[] = [];

    for (const key of this.configCache.keys()) {
      if (key.includes(pattern)) {
        keysToDelete.push(key);
      }
    }

    for (const key of keysToDelete) {
      this.configCache.delete(key);
      const index = this.cacheOrder.indexOf(key);
      if (index > -1) {
        this.cacheOrder.splice(index, 1);
      }
    }
  }

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
}

// Export alias for backward compatibility
export const ConfigManager = OptimizedConfigManager;
