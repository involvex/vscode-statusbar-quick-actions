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
import { VisibilityManager } from "./visibility";
import { MaterialIconManager } from "./material-icons";
import { OutputPanelManager } from "./output-panel";
import { PresetManager } from "./preset-manager";
import { DynamicLabelManager } from "./dynamic-label";

/**
 * Main extension class
 */
export class StatusBarQuickActionsExtension {
  private context: vscode.ExtensionContext;
  private configManager: ConfigManager;
  private commandExecutor: CommandExecutor;
  private themeManager: ThemeManager;
  private visibilityManager!: VisibilityManager;
  private materialIconManager!: MaterialIconManager;
  private outputPanelManager!: OutputPanelManager;
  private presetManager!: PresetManager;
  private dynamicLabelManager!: DynamicLabelManager;
  private buttonStates: Map<string, ButtonState> = new Map<
    string,
    ButtonState
  >();
  private disposables: vscode.Disposable[] = [];
  private editorChangeListener: vscode.Disposable | null = null;
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

    // Dispose new managers
    if (this.outputPanelManager) {
      this.outputPanelManager.dispose();
    }
    if (this.visibilityManager) {
      this.visibilityManager.dispose();
    }
    if (this.presetManager) {
      this.presetManager.dispose();
    }
    if (this.dynamicLabelManager) {
      this.dynamicLabelManager.dispose();
    }

    this.isActivated = false;
    console.log("StatusBar Quick Actions extension deactivated");
  }

  /**
   * Initialize all managers
   */
  private async initializeManagers(): Promise<void> {
    try {
      // Initialize configuration manager
      this.configManager.initialize(this.context);
      console.log("ConfigManager initialized successfully");

      // Initialize theme manager
      await this.themeManager.initialize(this.context);
      console.log("ThemeManager initialized successfully");

      // Initialize Material Icons Manager
      this.materialIconManager = new MaterialIconManager();
      console.log("MaterialIconManager initialized successfully");

      // Initialize Output Panel Manager with config
      const outputConfig = this.configManager.getConfigValue(
        "settings.output",
        this.getDefaultOutputConfig(),
      );
      this.outputPanelManager = new OutputPanelManager(outputConfig);
      console.log("OutputPanelManager initialized successfully");

      // Initialize Visibility Manager with debounce config
      const performanceConfig = this.configManager.getConfigValue(
        "settings.performance",
        this.getDefaultPerformanceConfig(),
      );
      this.visibilityManager = new VisibilityManager(
        performanceConfig.visibilityDebounceMs,
      );
      console.log("VisibilityManager initialized successfully");

      // Initialize Preset Manager
      this.presetManager = new PresetManager();
      this.presetManager.initialize(this.context);
      console.log("PresetManager initialized successfully");

      // Initialize Dynamic Label Manager
      this.dynamicLabelManager = new DynamicLabelManager();
      await this.dynamicLabelManager.initialize();
      console.log("DynamicLabelManager initialized successfully");

      // Setup dynamic label refresh callback
      this.dynamicLabelManager.onLabelRefresh = (buttonId) => {
        this.refreshButtonLabel(buttonId);
      };

      // Setup editor change listener for debounced visibility checks
      this.setupEditorChangeListener();
      console.log("Editor change listener setup successfully");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      console.error("Failed to initialize managers:", errorMessage);
      vscode.window.showErrorMessage(
        `StatusBar Quick Actions: Failed to initialize - ${errorMessage}`,
      );
      throw error; // Re-throw to prevent activation from completing
    }
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

    // Preset management commands
    this.disposables.push(
      vscode.commands.registerCommand(
        "statusbarQuickActions.managePresets",
        this.managePresets.bind(this),
      ),
    );

    this.disposables.push(
      vscode.commands.registerCommand(
        "statusbarQuickActions.applyPreset",
        this.applyPresetCommand.bind(this),
      ),
    );

    this.disposables.push(
      vscode.commands.registerCommand(
        "statusbarQuickActions.saveAsPreset",
        this.saveAsPreset.bind(this),
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
    console.log("Updating configuration with buttons:", config.buttons.length);

    // Debug: Log each button configuration
    config.buttons.forEach((button, index) => {
      console.log(
        `Button ${index}: ${button.id} - ${button.text || "no text"}`,
        button,
      );
    });

    // Validate configuration first
    const validation = this.configManager.validateConfig(config);
    if (!validation.isValid) {
      const errorMessage = `Invalid button configuration:\n${validation.errors.join("\n")}`;
      console.error(errorMessage);
      vscode.window.showErrorMessage(
        `StatusBar Quick Actions: Configuration validation failed. Check console for details.`,
      );
      // Show detailed error in output channel
      const outputChannel = vscode.window.createOutputChannel(
        "StatusBar Quick Actions - Errors",
      );
      outputChannel.appendLine("Configuration Validation Errors:");
      validation.errors.forEach((error) =>
        outputChannel.appendLine(`  - ${error}`),
      );
      outputChannel.show(true);
    }

    // Remove existing statusbar items
    this.buttonStates.forEach((state) => {
      state.item.dispose();
    });
    this.buttonStates.clear();

    // Create new statusbar items (even if validation failed, try to create valid ones)
    let createdCount = 0;
    let failedCount = 0;
    let disabledCount = 0;

    for (const buttonConfig of config.buttons) {
      if (buttonConfig.enabled === false) {
        console.log(`Button ${buttonConfig.id} is disabled, skipping creation`);
        disabledCount++;
        continue;
      }

      const created = await this.createStatusBarItem(buttonConfig);
      if (created) {
        createdCount++;
      } else {
        failedCount++;
      }
    }

    // Log summary
    console.log(
      `StatusBar Quick Actions: Created ${createdCount} buttons, ${failedCount} failed, ${disabledCount} disabled`,
    );

    // Show notification if no buttons were created
    if (createdCount === 0 && config.buttons.length > 0) {
      vscode.window.showWarningMessage(
        `StatusBar Quick Actions: No buttons could be created. Check the output panel for errors.`,
      );
    }
  }

  /**
   * Create a statusbar item for a button configuration
   * @returns true if button was created successfully, false otherwise
   */
  private async createStatusBarItem(
    buttonConfig: StatusBarButtonConfig,
  ): Promise<boolean> {
    try {
      console.log(`Creating status bar item for button: ${buttonConfig.id}`);

      // Validate button configuration
      if (!buttonConfig.id) {
        console.error(`Button ${buttonConfig.id || "unknown"} missing ID`);
        throw new Error("Button ID is required");
      }
      if (!buttonConfig.text && !buttonConfig.icon) {
        console.error(`Button ${buttonConfig.id} missing both text and icon`);
        throw new Error("Either button text or icon is required");
      }
      if (!buttonConfig.command) {
        console.error(`Button ${buttonConfig.id} missing command`);
        throw new Error("Button command is required");
      }

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
      console.log(
        `Created status bar item for button ${buttonConfig.id} with alignment ${alignment} and priority ${priority}`,
      );

      // Set button properties
      const displayText = this.getButtonDisplayText(buttonConfig);
      console.log(`Button ${buttonConfig.id} display text: "${displayText}"`);
      if (!displayText || displayText.trim() === "") {
        console.error(`Button ${buttonConfig.id} has empty display text`);
        throw new Error("Button display text cannot be empty");
      }
      statusBarItem.text = displayText;
      statusBarItem.tooltip =
        buttonConfig.tooltip || buttonConfig.text || "Quick Action";
      statusBarItem.command = `statusbarQuickActions.execute_${buttonConfig.id}`;
      console.log(
        `Button ${buttonConfig.id} command: ${statusBarItem.command}`,
      );

      // Apply theme colors
      this.themeManager.applyThemeToStatusBarItem(statusBarItem);

      // Set accessibility properties
      statusBarItem.accessibilityInformation = {
        label:
          buttonConfig.tooltip ||
          buttonConfig.text ||
          `Button ${buttonConfig.id}`,
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
          ariaLabel:
            buttonConfig.tooltip ||
            buttonConfig.text ||
            `Button ${buttonConfig.id}`,
          focusOrder: priority,
        },
      };

      this.buttonStates.set(buttonConfig.id, buttonState);
      this.disposables.push(statusBarItem);

      // Initialize dynamic label if configured
      if (buttonConfig.dynamicLabel) {
        await this.refreshButtonLabel(buttonConfig.id);
      }

      statusBarItem.show();

      console.log(`Button ${buttonConfig.id} shown successfully`);
      console.log(
        `Successfully created button: ${buttonConfig.id} (${buttonConfig.text})`,
      );
      return true;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      console.error(
        `Failed to create statusbar item for button ${buttonConfig.id}:`,
        errorMessage,
      );
      vscode.window.showErrorMessage(
        `Failed to create button "${buttonConfig.text || buttonConfig.id}": ${errorMessage}`,
      );
      return false;
    }
  }

  /**
   * Get display text for button (text or icon)
   */
  private getButtonDisplayText(buttonConfig: StatusBarButtonConfig): string {
    if (buttonConfig.icon) {
      // Resolve Material icons to Codicons if needed
      const resolvedIconId = this.materialIconManager.resolveIcon(
        buttonConfig.icon,
      );

      const iconPrefix =
        buttonConfig.icon.animation === "spin"
          ? `$(${resolvedIconId}~spin)`
          : buttonConfig.icon.animation === "pulse"
            ? `$(${resolvedIconId}~pulse)`
            : `$(${resolvedIconId})`;
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

      // Add streaming support if output panel is enabled
      const outputConfig = this.outputPanelManager.getConfig();
      if (outputConfig.enabled) {
        // Ensure panel exists
        this.outputPanelManager.getOrCreatePanel(buttonId, config.text);

        if (outputConfig.clearOnRun) {
          this.outputPanelManager.clearPanel(buttonId);
        }

        executionOptions.streaming = {
          enabled: true,
          onStdout: (data) => {
            this.outputPanelManager.appendOutput(buttonId, data, "stdout");
          },
          onStderr: (data) => {
            this.outputPanelManager.appendOutput(buttonId, data, "stderr");
          },
        };

        this.outputPanelManager.showPanel(buttonId, true);
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
        label: "$(archive) Manage Presets",
        description: "Save, load, or manage configuration presets",
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
      case "$(archive) Manage Presets":
        await this.managePresets();
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
      { label: "npx", description: "Run npx command" },
      { label: "pnpx", description: "Run pnpx command" },
      { label: "bunx", description: "Run bunx command" },
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
        commandType.label === "npx" ||
        commandType.label === "pnpx" ||
        commandType.label === "bunx" ||
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
          | "npx"
          | "pnpx"
          | "bunx"
          | "shell"
          | "github"
          | "vscode"
          | "task"
          | "detect",
        script: [
          "npm",
          "yarn",
          "pnpm",
          "bun",
          "bunx",
          "npx",
          "pnpx",
          "detect",
        ].includes(commandType.label)
          ? command
          : undefined,
        command: ![
          "npm",
          "yarn",
          "pnpm",
          "bun",
          "bunx",
          "npx",
          "pnpx",
          "detect",
        ].includes(commandType.label)
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

  /**
   * Get default output panel configuration
   */
  private getDefaultOutputConfig() {
    return {
      enabled: true,
      mode: "per-button" as const,
      format: "formatted" as const,
      clearOnRun: false,
      showTimestamps: true,
      preserveHistory: true,
      maxLines: 1000,
    };
  }

  /**
   * Get default performance configuration
   */
  private getDefaultPerformanceConfig() {
    return {
      visibilityDebounceMs: 300,
      enableVirtualization: false,
      cacheResults: true,
    };
  }

  /**
   * Setup editor change listener for debounced visibility checks
   */
  private setupEditorChangeListener(): void {
    this.editorChangeListener = vscode.window.onDidChangeActiveTextEditor(
      () => {
        // Debounced visibility check for all buttons
        this.buttonStates.forEach((buttonState, buttonId) => {
          if (buttonState.config.visibility) {
            const customDebounce = buttonState.config.visibility.debounceMs;

            this.visibilityManager.checkVisibilityDebounced(
              buttonId,
              buttonState.config.visibility,
              customDebounce,
              (isVisible) => {
                // Update button visibility
                if (isVisible) {
                  buttonState.item.show();
                } else {
                  buttonState.item.hide();
                }
              },
            );
          }
        });
      },
    );

    this.disposables.push(this.editorChangeListener);
  }

  /**
   * Manage presets UI
   */
  private async managePresets(): Promise<void> {
    const items: vscode.QuickPickItem[] = [
      {
        label: "$(add) Create New Preset",
        description: "Save current configuration as a preset",
      },
      {
        label: "$(archive) Apply Preset",
        description: "Load a saved preset",
      },
      {
        label: "$(list-unordered) View All Presets",
        description: "Browse and manage saved presets",
      },
      {
        label: "$(export) Export Preset",
        description: "Export a preset to a file",
      },
      {
        label: "$(import) Import Preset",
        description: "Import a preset from a file",
      },
    ];

    const selected = await vscode.window.showQuickPick(items, {
      placeHolder: "Preset Management",
      matchOnDescription: true,
    });

    if (!selected) {
      return;
    }

    switch (selected.label) {
      case "$(add) Create New Preset":
        await this.saveAsPreset();
        break;
      case "$(archive) Apply Preset":
        await this.applyPresetCommand();
        break;
      case "$(list-unordered) View All Presets":
        await this.viewAllPresets();
        break;
      case "$(export) Export Preset":
        await this.exportPresetCommand();
        break;
      case "$(import) Import Preset":
        await this.importPresetCommand();
        break;
    }
  }

  /**
   * Save current configuration as a preset
   */
  private async saveAsPreset(): Promise<void> {
    const name = await vscode.window.showInputBox({
      prompt: "Enter preset name",
      placeHolder: "e.g., My Development Setup",
      validateInput: (value) => (value ? null : "Name is required"),
    });

    if (!name) {
      return;
    }

    const description = await vscode.window.showInputBox({
      prompt: "Enter preset description (optional)",
      placeHolder: "e.g., Standard buttons for Node.js development",
    });

    try {
      const currentConfig = this.configManager.getConfig();
      await this.presetManager.createPresetFromConfig(
        name,
        description || "",
        currentConfig,
      );

      vscode.window.showInformationMessage(
        `✅ Preset "${name}" created successfully!`,
      );
    } catch (error) {
      vscode.window.showErrorMessage(`Failed to create preset: ${error}`);
    }
  }

  /**
   * Apply a preset command
   */
  private async applyPresetCommand(): Promise<void> {
    const presets = this.presetManager.getAllPresets();

    if (presets.length === 0) {
      vscode.window.showInformationMessage("No presets available yet.");
      return;
    }

    const items = presets.map((preset) => ({
      label: preset.name,
      description: preset.description,
      detail: `${preset.buttons.length} buttons · Created ${preset.metadata?.created.toLocaleDateString()}`,
      preset,
    }));

    const selected = await vscode.window.showQuickPick(items, {
      placeHolder: "Select a preset to apply",
      matchOnDescription: true,
      matchOnDetail: true,
    });

    if (!selected) {
      return;
    }

    // Ask for application mode
    const modeItems: vscode.QuickPickItem[] = [
      {
        label: "Replace",
        description: "Replace all current buttons with preset buttons",
      },
      {
        label: "Merge",
        description:
          "Merge preset buttons with current buttons (overwrite duplicates)",
      },
      {
        label: "Append",
        description: "Add preset buttons to current buttons",
      },
    ];

    const modeSelected = await vscode.window.showQuickPick(modeItems, {
      placeHolder: "How should the preset be applied?",
    });

    if (!modeSelected) {
      return;
    }

    const mode = modeSelected.label.toLowerCase() as
      | "replace"
      | "merge"
      | "append";

    // Show impact preview
    const impact = this.configManager.getPresetImpact(selected.preset, mode);
    const confirm = await vscode.window.showWarningMessage(
      `Apply preset "${selected.preset.name}"?\n\nImpact:\n• ${impact.added} buttons added\n• ${impact.modified} buttons modified\n• ${impact.removed} buttons removed`,
      { modal: true },
      "Yes, Apply",
      "No",
    );

    if (confirm !== "Yes, Apply") {
      return;
    }

    try {
      await this.configManager.applyPreset(selected.preset, mode);
      vscode.window.showInformationMessage(
        `✅ Preset "${selected.preset.name}" applied successfully!`,
      );
    } catch (error) {
      vscode.window.showErrorMessage(`Failed to apply preset: ${error}`);
    }
  }

  /**
   * View all presets
   */
  private async viewAllPresets(): Promise<void> {
    const presets = this.presetManager.getAllPresets();

    if (presets.length === 0) {
      vscode.window.showInformationMessage("No presets available yet.");
      return;
    }

    const items = presets.map((preset) => ({
      label: preset.name,
      description: `${preset.buttons.length} buttons`,
      detail: preset.description,
      buttons: [
        {
          iconPath: new vscode.ThemeIcon("edit"),
          tooltip: "Rename Preset",
        },
        {
          iconPath: new vscode.ThemeIcon("copy"),
          tooltip: "Duplicate Preset",
        },
        {
          iconPath: new vscode.ThemeIcon("trash"),
          tooltip: "Delete Preset",
        },
      ],
      preset,
    }));

    const selected = await vscode.window.showQuickPick(items, {
      placeHolder: "Manage Presets",
      matchOnDescription: true,
      matchOnDetail: true,
    });

    if (selected) {
      // For now, just apply the preset if selected
      await this.applyPresetCommand();
    }
  }

  /**
   * Export preset command
   */
  private async exportPresetCommand(): Promise<void> {
    const presets = this.presetManager.getAllPresets();

    if (presets.length === 0) {
      vscode.window.showInformationMessage("No presets available to export.");
      return;
    }

    const items = presets.map((preset) => ({
      label: preset.name,
      description: `${preset.buttons.length} buttons`,
      preset,
    }));

    const selected = await vscode.window.showQuickPick(items, {
      placeHolder: "Select a preset to export",
    });

    if (!selected) {
      return;
    }

    try {
      await this.presetManager.exportPreset(selected.preset);
    } catch (error) {
      vscode.window.showErrorMessage(`Failed to export preset: ${error}`);
    }
  }

  /**
   * Import preset command
   */
  private async importPresetCommand(): Promise<void> {
    try {
      const preset = await this.presetManager.importPreset();
      if (preset) {
        // Optionally ask if they want to apply it immediately
        const apply = await vscode.window.showInformationMessage(
          `Preset "${preset.name}" imported. Apply it now?`,
          "Yes",
          "No",
        );

        if (apply === "Yes") {
          await this.configManager.applyPreset(preset, "replace");
        }
      }
    } catch (error) {
      vscode.window.showErrorMessage(`Failed to import preset: ${error}`);
    }
  }

  /**
   * Refresh a button's dynamic label
   */
  private async refreshButtonLabel(buttonId: string): Promise<void> {
    const buttonState = this.buttonStates.get(buttonId);
    if (!buttonState || !buttonState.config.dynamicLabel) {
      return;
    }

    try {
      const newLabel = await this.dynamicLabelManager.evaluateLabel(
        buttonId,
        buttonState.config.dynamicLabel,
      );

      // Update button text with dynamic label
      if (buttonState.config.icon) {
        // If icon exists, append label after icon
        const iconText = this.getButtonDisplayText(buttonState.config);
        buttonState.item.text = `${iconText} ${newLabel}`;
      } else {
        // Replace text entirely
        buttonState.item.text = newLabel;
      }
    } catch (error) {
      console.error(`Failed to refresh label for ${buttonId}:`, error);
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
