/**
 * StatusBar Quick Actions Extension
 * A comprehensive extension for customizable statusbar buttons
 */

import * as vscode from "vscode";
import * as fs from "fs";
import {
  StatusBarButtonConfig,
  ExtensionConfig,
  ButtonState,
  ExecutionResult,
  ExecutionOptions,
} from "./types";
import { ConfigManager } from "./configuration";
import { CommandExecutor } from "./executor";
import { ThemeManager } from "./theme";

/**
 * Main extension class
 */
export class StatusBarQuickActionsExtension {
  private context: vscode.ExtensionContext;
  private configManager: ConfigManager;
  private commandExecutor: CommandExecutor;
  private themeManager: ThemeManager;
  private buttonStates: Map<string, ButtonState> = new Map<
    string,
    ButtonState
  >();
  private disposables: vscode.Disposable[] = [];
  private isActivated = false;

  constructor(context: vscode.ExtensionContext) {
    this.context = context;
    this.configManager = new ConfigManager();
    this.commandExecutor = new CommandExecutor();
    this.themeManager = new ThemeManager();
  }

  /**
   * Activate the extension
   */
  public async activate(): Promise<void> {
    if (this.isActivated) {
      return;
    }

    try {
      // Initialize managers
      await this.initializeManagers();

      // Register commands
      this.registerCommands();

      // Set up configuration watching
      this.setupConfigurationWatching();

      // Load initial configuration
      await this.loadConfiguration();

      this.isActivated = true;
      console.log("StatusBar Quick Actions extension activated successfully");

      // Show welcome message on first activation
      if (!this.context.globalState.get("hasBeenActivated")) {
        await this.showWelcomeMessage();
        await this.context.globalState.update("hasBeenActivated", true);
      }
    } catch (error) {
      console.error(
        "Failed to activate StatusBar Quick Actions extension:",
        error,
      );
      vscode.window.showErrorMessage(
        `Failed to activate StatusBar Quick Actions: ${error}`,
      );
    }
  }

  /**
   * Deactivate the extension
   */
  public deactivate(): void {
    if (!this.isActivated) {
      return;
    }

    // Dispose of all resources
    this.disposables.forEach((disposable) => disposable.dispose());
    this.buttonStates.clear();

    this.isActivated = false;
    console.log("StatusBar Quick Actions extension deactivated");
  }

  /**
   * Initialize all managers
   */
  private async initializeManagers(): Promise<void> {
    this.configManager.initialize(this.context);
    await this.themeManager.initialize(this.context);
  }

  /**
   * Register extension commands
   */
  private registerCommands(): void {
    // Edit button command
    this.disposables.push(
      vscode.commands.registerCommand(
        "statusbarQuickActions.editButton",
        this.editButton.bind(this),
      ),
    );

    // View history command
    this.disposables.push(
      vscode.commands.registerCommand(
        "statusbarQuickActions.viewHistory",
        this.viewHistory.bind(this),
      ),
    );

    // Clear history command
    this.disposables.push(
      vscode.commands.registerCommand(
        "statusbarQuickActions.clearHistory",
        this.clearHistory.bind(this),
      ),
    );

    // Register individual button commands
    this.registerButtonCommands();
  }

  /**
   * Register commands for each button
   */
  private registerButtonCommands(): void {
    const config = this.configManager.getConfig();
    config.buttons.forEach((button) => {
      const commandId = `statusbarQuickActions.execute_${button.id}`;
      this.disposables.push(
        vscode.commands.registerCommand(commandId, () =>
          this.executeButton(button.id),
        ),
      );
    });
  }

  /**
   * Set up configuration change watching
   */
  private setupConfigurationWatching(): void {
    this.disposables.push(
      this.configManager.onConfigurationChanged(async (newConfig) => {
        await this.updateConfiguration(newConfig);
      }),
    );
  }

  /**
   * Load configuration and create statusbar items
   */
  private async loadConfiguration(): Promise<void> {
    const config = this.configManager.getConfig();
    await this.updateConfiguration(config);
  }

  /**
   * Update configuration and recreate statusbar items
   */
  private async updateConfiguration(config: ExtensionConfig): Promise<void> {
    // Remove existing statusbar items
    this.buttonStates.forEach((state) => {
      state.item.dispose();
    });
    this.buttonStates.clear();

    // Create new statusbar items
    for (const buttonConfig of config.buttons) {
      if (buttonConfig.enabled) {
        await this.createStatusBarItem(buttonConfig);
      }
    }
  }

  /**
   * Create a statusbar item for a button configuration
   */
  private async createStatusBarItem(
    buttonConfig: StatusBarButtonConfig,
  ): Promise<void> {
    try {
      // Create statusbar item
      const alignment =
        buttonConfig.alignment === "left"
          ? vscode.StatusBarAlignment.Left
          : vscode.StatusBarAlignment.Right;
      const priority = buttonConfig.priority ?? 100;

      const statusBarItem = vscode.window.createStatusBarItem(
        alignment,
        priority,
      );

      // Set button properties
      statusBarItem.text = this.getButtonDisplayText(buttonConfig);
      statusBarItem.tooltip = buttonConfig.tooltip || buttonConfig.text;
      statusBarItem.command = `statusbarQuickActions.execute_${buttonConfig.id}`;

      // Apply theme colors
      this.themeManager.applyThemeToStatusBarItem(statusBarItem);

      // Set accessibility properties
      statusBarItem.accessibilityInformation = {
        label: buttonConfig.tooltip || buttonConfig.text,
        role: "button",
      };

      // Load history for this button
      const history = await this.loadHistory(buttonConfig.id);

      // Create complete button state
      const buttonState: ButtonState = {
        item: statusBarItem,
        config: buttonConfig,
        isExecuting: false,
        history: history,
        accessibility: {
          role: "button",
          ariaLabel: buttonConfig.tooltip || buttonConfig.text,
          focusOrder: priority,
        },
      };

      this.buttonStates.set(buttonConfig.id, buttonState);
      this.disposables.push(statusBarItem);
      statusBarItem.show();
    } catch (error) {
      console.error(
        `Failed to create statusbar item for button ${buttonConfig.id}:`,
        error,
      );
    }
  }

  /**
   * Get display text for button (text or icon)
   */
  private getButtonDisplayText(buttonConfig: StatusBarButtonConfig): string {
    if (buttonConfig.icon) {
      const iconPrefix =
        buttonConfig.icon.animation === "spin"
          ? "$(sync~spin)"
          : buttonConfig.icon.animation === "pulse"
            ? "$(sync~pulse)"
            : `${buttonConfig.icon.id}`;
      return iconPrefix;
    }
    return buttonConfig.text;
  }

  /**
   * Execute a button command
   */
  private async executeButton(buttonId: string): Promise<void> {
    const buttonState = this.buttonStates.get(buttonId);
    if (!buttonState || buttonState.isExecuting) {
      return;
    }

    const config = buttonState.config;

    try {
      // Set executing state
      buttonState.isExecuting = true;
      this.updateButtonState(buttonId, buttonState);

      // Show progress if enabled
      if (config.execution?.showProgress) {
        this.showProgress(buttonId);
      }

      // Prepare execution options
      const executionOptions: ExecutionOptions = {
        workingDirectory: config.workingDirectory,
        environment: config.environment,
      };

      if (config.execution?.timeout) {
        executionOptions.timeout = config.execution.timeout;
      }

      // Execute the command
      const result = await this.commandExecutor.execute(
        config.command,
        executionOptions,
      );

      // Update button state
      buttonState.isExecuting = false;
      buttonState.lastResult = result;

      // Add to history if enabled
      if (config.history?.enabled !== false) {
        await this.addToHistory(buttonId, result);
      }

      this.updateButtonState(buttonId, buttonState);

      // Show result
      await this.showExecutionResult(buttonId, result);
    } catch (error) {
      buttonState.isExecuting = false;
      this.updateButtonState(buttonId, buttonState);

      const errorResult: ExecutionResult = {
        code: -1,
        stdout: "",
        stderr: error instanceof Error ? error.message : String(error),
        duration: 0,
        timestamp: new Date(),
        command: "Unknown",
      };

      buttonState.lastResult = errorResult;
      this.updateButtonState(buttonId, buttonState);

      await this.showExecutionError(buttonId, error);
    }
  }

  /**
   * Update button state in UI
   */
  private updateButtonState(buttonId: string, buttonState: ButtonState): void {
    const config = buttonState.config;

    if (buttonState.isExecuting) {
      // Show executing state
      if (config.icon?.animation) {
        buttonState.item.text =
          config.icon.animation === "spin"
            ? "$(sync~spin)"
            : config.icon.animation === "pulse"
              ? "$(sync~pulse)"
              : this.getButtonDisplayText(config);
      } else {
        buttonState.item.text = `$(sync~spin) ${config.text}`;
      }
    } else {
      // Show normal state
      buttonState.item.text = this.getButtonDisplayText(config);
    }

    // Update tooltip with last result if available
    if (buttonState.lastResult) {
      const result = buttonState.lastResult;
      const status = result.code === 0 ? "✅" : "❌";
      const duration = result.duration ? ` (${result.duration}ms)` : "";
      buttonState.item.tooltip = `${config.tooltip || config.text}\n${status} Last run: ${result.timestamp.toLocaleTimeString()}${duration}`;
    } else {
      buttonState.item.tooltip = config.tooltip || config.text;
    }

    buttonState.item.show();
  }

  /**
   * Show progress indicator
   */
  private showProgress(buttonId: string): void {
    const buttonState = this.buttonStates.get(buttonId);
    if (!buttonState) {
      return;
    }

    // Use VS Code's built-in progress API for better integration
    vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title: `Executing: ${buttonState.config.text}`,
        cancellable: false,
      },
      async (progress) => {
        // Simulate progress (in a real implementation, this would be updated by the command executor)
        for (let i = 0; i <= 100; i += 10) {
          if (!buttonState.isExecuting) {
            break;
          }
          progress.report({ increment: 10, message: `${i}%` });
          await new Promise((resolve) => setTimeout(resolve, 200));
        }
      },
    );
  }

  /**
   * Show execution result
   */
  private async showExecutionResult(
    buttonId: string,
    result: ExecutionResult,
  ): Promise<void> {
    const buttonState = this.buttonStates.get(buttonId);
    if (!buttonState) {
      return;
    }

    const config = buttonState.config;

    // Show success notification
    if (result.code === 0) {
      const message = this.getResultMessage(result);
      vscode.window
        .showInformationMessage(`✅ ${config.text}: ${message}`, "View Output")
        .then((selection) => {
          if (selection === "View Output") {
            this.showOutput(result);
          }
        });
    }
  }

  /**
   * Show execution error
   */
  private async showExecutionError(
    buttonId: string,
    error: unknown,
  ): Promise<void> {
    const buttonState = this.buttonStates.get(buttonId);
    if (!buttonState) {
      return;
    }

    const config = buttonState.config;
    const errorMessage = error instanceof Error ? error.message : String(error);
    vscode.window
      .showErrorMessage(`❌ ${config.text}: ${errorMessage}`, "View Details")
      .then((selection) => {
        if (selection === "View Details") {
          vscode.window.showErrorMessage(errorMessage, { modal: true });
        }
      });
  }

  /**
   * Get result message for display
   */
  private getResultMessage(result: ExecutionResult): string {
    const showTime = true;
    const timeStr =
      showTime && result.duration ? ` in ${result.duration}ms` : "";

    if (result.stdout && result.stdout.trim()) {
      const output = result.stdout.trim().split("\n")[0];
      return output.length > 100
        ? `${output.substring(0, 100)}...${timeStr}`
        : `${output}${timeStr}`;
    }

    return `Completed successfully${timeStr}`;
  }

  /**
   * Show command output
   */
  private showOutput(result: ExecutionResult): void {
    const output = `Command Output:\n${result.stdout}\n\nErrors:\n${result.stderr}`;
    vscode.window.showInformationMessage(output, { modal: true });
  }

  /**
   * Edit button configuration - Main settings menu
   */
  private async editButton(): Promise<void> {
    const mainMenuItems: vscode.QuickPickItem[] = [
      {
        label: "$(add) Add New Button",
        description: "Create a new status bar button",
      },
      {
        label: "$(edit) Edit Existing Button",
        description: "Modify an existing button configuration",
      },
      {
        label: "$(trash) Delete Button",
        description: "Remove a button from the status bar",
      },
      {
        label: "$(copy) Duplicate Button",
        description: "Create a copy of an existing button",
      },
      {
        label: "$(sync) Toggle Button",
        description: "Enable or disable a button",
      },
      {
        label: "$(settings-gear) Open Full Settings",
        description: "Open VS Code settings page",
      },
      {
        label: "$(export) Export Configuration",
        description: "Export all button configurations to a file",
      },
      {
        label: "$(import) Import Configuration",
        description: "Import button configurations from a file",
      },
    ];

    const selected = await vscode.window.showQuickPick(mainMenuItems, {
      placeHolder: "StatusBar Quick Actions - Settings",
      matchOnDescription: true,
    });

    if (!selected) {
      return;
    }

    switch (selected.label) {
      case "$(add) Add New Button":
        await this.addNewButton();
        break;
      case "$(edit) Edit Existing Button":
        await this.selectAndEditButton();
        break;
      case "$(trash) Delete Button":
        await this.deleteButton();
        break;
      case "$(copy) Duplicate Button":
        await this.duplicateButton();
        break;
      case "$(sync) Toggle Button":
        await this.toggleButton();
        break;
      case "$(settings-gear) Open Full Settings":
        vscode.commands.executeCommand(
          "workbench.action.openSettings",
          "@ext:involvex.statusbar-quick-actions",
        );
        break;
      case "$(export) Export Configuration":
        await this.exportConfiguration();
        break;
      case "$(import) Import Configuration":
        await this.importConfiguration();
        break;
    }
  }

  /**
   * Add a new button interactively
   */
  private async addNewButton(): Promise<void> {
    // Get button text
    const text = await vscode.window.showInputBox({
      prompt: "Enter button text (supports emojis)",
      placeHolder: "e.g., Build 🔨",
      validateInput: (value) => (value ? null : "Button text is required"),
    });

    if (!text) {
      return;
    }

    // Get command type
    const commandTypes: vscode.QuickPickItem[] = [
      { label: "npm", description: "Run npm script" },
      { label: "yarn", description: "Run yarn script" },
      { label: "pnpm", description: "Run pnpm script" },
      { label: "bun", description: "Run bun script" },
      { label: "shell", description: "Run shell command" },
      { label: "vscode", description: "Run VS Code command" },
      { label: "task", description: "Run VS Code task" },
      { label: "github", description: "Run GitHub CLI command" },
      { label: "detect", description: "Auto-detect package manager" },
    ];

    const commandType = await vscode.window.showQuickPick(commandTypes, {
      placeHolder: "Select command type",
    });

    if (!commandType) {
      return;
    }

    // Get command/script
    const command = await vscode.window.showInputBox({
      prompt:
        commandType.label === "npm" ||
        commandType.label === "yarn" ||
        commandType.label === "pnpm" ||
        commandType.label === "bun" ||
        commandType.label === "detect"
          ? "Enter script name"
          : "Enter command",
      placeHolder:
        commandType.label === "npm" ? "e.g., build" : 'e.g., echo "Hello"',
      validateInput: (value) => (value ? null : "Command is required"),
    });

    if (!command) {
      return;
    }

    // Generate unique ID
    const id = `button_${Date.now()}`;

    // Create new button configuration
    const newButton: StatusBarButtonConfig = {
      id,
      text,
      tooltip: text,
      command: {
        type: commandType.label as
          | "npm"
          | "yarn"
          | "pnpm"
          | "bun"
          | "shell"
          | "github"
          | "vscode"
          | "task"
          | "detect",
        script: ["npm", "yarn", "pnpm", "bun", "detect"].includes(
          commandType.label,
        )
          ? command
          : undefined,
        command: !["npm", "yarn", "pnpm", "bun", "detect"].includes(
          commandType.label,
        )
          ? command
          : undefined,
      },
      enabled: true,
      alignment: "left",
      priority: 100,
    };

    // Add to configuration
    const config = this.configManager.getConfig();
    config.buttons.push(newButton);
    await this.configManager.setConfig("buttons", config.buttons);

    vscode.window.showInformationMessage(
      `✅ Button "${text}" added successfully!`,
    );
  }

  /**
   * Select and edit an existing button
   */
  private async selectAndEditButton(): Promise<void> {
    const config = this.configManager.getConfig();
    if (config.buttons.length === 0) {
      vscode.window.showInformationMessage("No buttons configured yet.");
      return;
    }

    const items = config.buttons.map((button) => ({
      label: button.text,
      description: button.command.type,
      detail: button.tooltip,
      button: button,
    }));

    const selected = await vscode.window.showQuickPick(items, {
      placeHolder: "Select a button to edit",
    });

    if (selected) {
      vscode.commands.executeCommand(
        "workbench.action.openSettings",
        `@ext:involvex.statusbar-quick-actions buttons`,
      );
    }
  }

  /**
   * Delete a button
   */
  private async deleteButton(): Promise<void> {
    const config = this.configManager.getConfig();
    if (config.buttons.length === 0) {
      vscode.window.showInformationMessage("No buttons configured yet.");
      return;
    }

    const items = config.buttons.map((button) => ({
      label: button.text,
      description: button.command.type,
      detail: button.id,
    }));

    const selected = await vscode.window.showQuickPick(items, {
      placeHolder: "Select a button to delete",
    });

    if (!selected) {
      return;
    }

    const confirm = await vscode.window.showWarningMessage(
      `Delete button "${selected.label}"?`,
      { modal: true },
      "Yes, Delete",
      "No",
    );

    if (confirm === "Yes, Delete") {
      const updatedButtons = config.buttons.filter(
        (b) => b.id !== selected.detail,
      );
      await this.configManager.setConfig("buttons", updatedButtons);
      vscode.window.showInformationMessage(
        `✅ Button "${selected.label}" deleted`,
      );
    }
  }

  /**
   * Duplicate a button
   */
  private async duplicateButton(): Promise<void> {
    const config = this.configManager.getConfig();
    if (config.buttons.length === 0) {
      vscode.window.showInformationMessage("No buttons configured yet.");
      return;
    }

    const items = config.buttons.map((button) => ({
      label: button.text,
      description: button.command.type,
      button: button,
    }));

    const selected = await vscode.window.showQuickPick(items, {
      placeHolder: "Select a button to duplicate",
    });

    if (!selected) {
      return;
    }

    const newButton = {
      ...selected.button,
      id: `button_${Date.now()}`,
      text: `${selected.button.text} (Copy)`,
    };

    config.buttons.push(newButton);
    await this.configManager.setConfig("buttons", config.buttons);
    vscode.window.showInformationMessage(`✅ Button duplicated successfully!`);
  }

  /**
   * Toggle button enabled state
   */
  private async toggleButton(): Promise<void> {
    const config = this.configManager.getConfig();
    if (config.buttons.length === 0) {
      vscode.window.showInformationMessage("No buttons configured yet.");
      return;
    }

    const items = config.buttons.map((button) => ({
      label: button.text,
      description: button.enabled ? "$(check) Enabled" : "$(x) Disabled",
      button: button,
    }));

    const selected = await vscode.window.showQuickPick(items, {
      placeHolder: "Select a button to toggle",
    });

    if (!selected) {
      return;
    }

    const buttonIndex = config.buttons.findIndex(
      (b) => b.id === selected.button.id,
    );
    config.buttons[buttonIndex].enabled = !config.buttons[buttonIndex].enabled;

    await this.configManager.setConfig("buttons", config.buttons);
    const status = config.buttons[buttonIndex].enabled ? "enabled" : "disabled";
    vscode.window.showInformationMessage(
      `✅ Button "${selected.label}" ${status}`,
    );
  }

  /**
   * Export configuration to file
   */
  private async exportConfiguration(): Promise<void> {
    const config = this.configManager.getConfig();

    const uri = await vscode.window.showSaveDialog({
      filters: { JSON: ["json"] },
      defaultUri: vscode.Uri.file("statusbar-quick-actions-config.json"),
    });

    if (uri) {
      fs.writeFileSync(uri.fsPath, JSON.stringify(config, null, 2));
      vscode.window.showInformationMessage(
        `✅ Configuration exported to ${uri.fsPath}`,
      );
    }
  }

  /**
   * Import configuration from file
   */
  private async importConfiguration(): Promise<void> {
    const uri = await vscode.window.showOpenDialog({
      filters: { JSON: ["json"] },
      canSelectMany: false,
    });

    if (uri && uri[0]) {
      try {
        const content = fs.readFileSync(uri[0].fsPath, "utf8");
        const importedConfig = JSON.parse(content);

        const merge = await vscode.window.showQuickPick(
          ["Replace All", "Merge with Existing"],
          { placeHolder: "Import mode" },
        );

        if (!merge) {
          return;
        }

        if (merge === "Replace All") {
          await this.configManager.setConfig(
            "buttons",
            importedConfig.buttons || [],
          );
        } else {
          const config = this.configManager.getConfig();
          const mergedButtons = [
            ...config.buttons,
            ...(importedConfig.buttons || []),
          ];
          await this.configManager.setConfig("buttons", mergedButtons);
        }

        vscode.window.showInformationMessage(
          "✅ Configuration imported successfully!",
        );
      } catch (error) {
        vscode.window.showErrorMessage(
          `Failed to import configuration: ${error}`,
        );
      }
    }
  }

  /**
   * Add execution result to history
   */
  private async addToHistory(
    buttonId: string,
    result: ExecutionResult,
  ): Promise<void> {
    try {
      const historyKey = `history_${buttonId}`;
      const history: ExecutionResult[] = this.context.globalState.get(
        historyKey,
        [],
      );

      // Add new result
      history.unshift(result);

      // Limit history size (default 20, configurable per button)
      const buttonState = this.buttonStates.get(buttonId);
      const maxEntries = buttonState?.config.history?.maxEntries || 20;
      while (history.length > maxEntries) {
        history.pop();
      }

      // Save to global state
      await this.context.globalState.update(historyKey, history);

      // Also update button state for quick access
      if (buttonState) {
        buttonState.history = history;
      }
    } catch (error) {
      console.error(
        `Failed to add execution to history for button ${buttonId}:`,
        error,
      );
    }
  }

  /**
   * Load history from global state
   */
  private async loadHistory(buttonId: string): Promise<ExecutionResult[]> {
    try {
      const historyKey = `history_${buttonId}`;
      return this.context.globalState.get(historyKey, []);
    } catch (error) {
      console.error(`Failed to load history for button ${buttonId}:`, error);
      return [];
    }
  }

  /**
   * Get all history entries across all buttons
   */
  private async getAllHistory(): Promise<Map<string, ExecutionResult[]>> {
    const allHistory = new Map<string, ExecutionResult[]>();

    for (const [buttonId] of this.buttonStates) {
      const history = await this.loadHistory(buttonId);
      if (history.length > 0) {
        allHistory.set(buttonId, history);
      }
    }

    return allHistory;
  }

  /**
   * View command history
   */
  private async viewHistory(): Promise<void> {
    const allHistory = await this.getAllHistory();

    if (allHistory.size === 0) {
      vscode.window.showInformationMessage("No command history available yet.");
      return;
    }

    // Create quick pick items from history
    const items: vscode.QuickPickItem[] = [];

    for (const [buttonId, history] of allHistory) {
      const buttonState = this.buttonStates.get(buttonId);
      const buttonName = buttonState?.config.text || buttonId;

      items.push({
        label: `$(inbox) ${buttonName}`,
        kind: vscode.QuickPickItemKind.Separator,
      });

      history.forEach((entry) => {
        const status = entry.code === 0 ? "$(check)" : "$(error)";
        const time = entry.timestamp.toLocaleString();
        const duration = entry.duration ? ` (${entry.duration}ms)` : "";

        items.push({
          label: `${status} ${entry.command}`,
          description: `${time}${duration}`,
          detail: entry.stderr || entry.stdout?.substring(0, 100),
          buttons: [
            {
              iconPath: new vscode.ThemeIcon("output"),
              tooltip: "View Full Output",
            },
          ],
        });
      });
    }

    // Show quick pick
    const selected = await vscode.window.showQuickPick(items, {
      placeHolder: "Command Execution History",
      matchOnDescription: true,
      matchOnDetail: true,
    });

    if (selected && selected.detail) {
      // Show detailed output in a new text document
      const doc = await vscode.workspace.openTextDocument({
        content: `Command: ${selected.label}\nTime: ${selected.description}\n\nOutput:\n${selected.detail}`,
        language: "text",
      });
      await vscode.window.showTextDocument(doc);
    }
  }

  /**
   * Clear command history
   */
  private async clearHistory(): Promise<void> {
    const confirm = await vscode.window.showWarningMessage(
      "Are you sure you want to clear all command history?",
      { modal: true },
      "Yes, Clear History",
      "No",
    );

    if (confirm === "Yes, Clear History") {
      try {
        // Clear history for all buttons
        for (const [buttonId, buttonState] of this.buttonStates) {
          const historyKey = `history_${buttonId}`;
          await this.context.globalState.update(historyKey, []);
          buttonState.history = [];
        }

        vscode.window.showInformationMessage(
          "✅ Command history cleared successfully",
        );
      } catch (error) {
        vscode.window.showErrorMessage(`Failed to clear history: ${error}`);
      }
    }
  }

  /**
   * Show welcome message on first activation
   */
  private async showWelcomeMessage(): Promise<void> {
    const config = this.configManager.getConfig();

    if (config.buttons.length === 0) {
      vscode.window
        .showInformationMessage(
          "👋 Welcome to StatusBar Quick Actions! Configure your first button in Settings.",
          "Open Settings",
        )
        .then((selection) => {
          if (selection === "Open Settings") {
            vscode.commands.executeCommand(
              "workbench.action.openSettings",
              "@ext:statusbar-quick-actions",
            );
          }
        });
    }
  }
}

/**
 * Extension activation function
 */
export function activate(context: vscode.ExtensionContext): void {
  console.log("Activating StatusBar Quick Actions extension...");

  const extension = new StatusBarQuickActionsExtension(context);
  context.subscriptions.push({
    dispose: () => extension.deactivate(),
  });

  extension.activate();
}

/**
 * Extension deactivation function
 */
export function deactivate(): void {
  console.log("Deactivating StatusBar Quick Actions extension...");
}
