#!/usr/bin/env bun

/**
 * Statusbar Quick Actions Configuration CLI
 *
 * A modern CLI tool for managing the Statusbar Quick Actions VSCode extension.
 * Provides installation, uninstallation, and configuration management capabilities.
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { homedir } from "os";
import consoleClear from "console-clear";
import pkg from "../package.json";
import type { StatusBarButtonConfig, ExtensionConfig } from "./types";

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/** Menu option definition */
interface MenuOption {
  readonly key: string;
  readonly label: string;
  readonly description: string;
  readonly action: () => Promise<void> | void;
  readonly requiresConfirmation?: boolean;
}

/** User input validation result */
interface ValidationResult {
  readonly isValid: boolean;
  readonly value?: string;
  readonly error?: string;
  readonly suggestion?: string;
}

/** Application state interface */
interface ApplicationState {
  isRunning: boolean;
  operationCount: number;
  startTime: number;
}

/** Settings location */
type SettingsLocation = "user" | "workspace";

/** VSCode Settings structure */
interface VSCodeSettings {
  [key: string]: unknown;
  "statusbarQuickActions.buttons"?: StatusBarButtonConfig[];
  "statusbarQuickActions.settings.debug"?: boolean;
  "statusbarQuickActions.settings.theme"?: unknown;
  "statusbarQuickActions.settings.output"?: unknown;
  "statusbarQuickActions.settings.performance"?: unknown;
}

/** Preset definition */
interface Preset {
  name: string;
  description: string;
  buttons: StatusBarButtonConfig[];
  metadata?: {
    created: Date;
    modified: Date;
    author?: string;
  };
}

// ============================================================================
// CONSTANTS AND CONFIGURATION
// ============================================================================

const CONFIG = {
  banner: "=".repeat(50),
  appName: "Statusbar Quick Actions - Config CLI",
  separator: "\n",
  version: pkg.version,
  maxRetries: 3,
  timeoutMs: 30000,
  colors: {
    primary: "\x1b[36m", // Cyan
    success: "\x1b[32m", // Green
    error: "\x1b[31m", // Red
    warning: "\x1b[33m", // Yellow
    reset: "\x1b[0m", // Reset
    bold: "\x1b[1m", // Bold
    dim: "\x1b[2m", // Dim
  },
} as const;

/** Preset definitions */
const BUILTIN_PRESETS: Record<string, Preset> = {
  "node-dev": {
    name: "Node.js Development",
    description: "Common Node.js development tasks",
    buttons: [
      {
        id: "npm_start",
        text: "▶️ Start",
        tooltip: "Start the application",
        command: { type: "npm", script: "start" },
        enabled: true,
        alignment: "left",
        priority: 100,
      },
      {
        id: "npm_test",
        text: "🧪 Test",
        tooltip: "Run tests",
        command: { type: "npm", script: "test" },
        enabled: true,
        alignment: "left",
        priority: 99,
      },
      {
        id: "npm_build",
        text: "🔨 Build",
        tooltip: "Build the project",
        command: { type: "npm", script: "build" },
        enabled: true,
        alignment: "left",
        priority: 98,
      },
    ],
    metadata: {
      created: new Date(),
      modified: new Date(),
      author: "StatusBar Quick Actions",
    },
  },
  "bun-dev": {
    name: "Bun Development",
    description: "Common Bun development tasks",
    buttons: [
      {
        id: "bun_dev",
        text: "⚡ Dev",
        tooltip: "Start development server",
        command: { type: "bun", script: "dev" },
        enabled: true,
        alignment: "left",
        priority: 100,
      },
      {
        id: "bun_test",
        text: "🧪 Test",
        tooltip: "Run tests with Bun",
        command: { type: "bun", script: "test" },
        enabled: true,
        alignment: "left",
        priority: 99,
      },
      {
        id: "bun_build",
        text: "🔨 Build",
        tooltip: "Build with Bun",
        command: { type: "bun", script: "build" },
        enabled: true,
        alignment: "left",
        priority: 98,
      },
    ],
    metadata: {
      created: new Date(),
      modified: new Date(),
      author: "StatusBar Quick Actions",
    },
  },
  "git-workflow": {
    name: "Git Workflow",
    description: "Common Git operations",
    buttons: [
      {
        id: "git_status",
        text: "📊 Status",
        tooltip: "Show git status",
        command: { type: "shell", command: "git status" },
        enabled: true,
        alignment: "right",
        priority: 100,
      },
      {
        id: "git_pull",
        text: "⬇️ Pull",
        tooltip: "Pull from remote",
        command: { type: "shell", command: "git pull" },
        enabled: true,
        alignment: "right",
        priority: 99,
      },
      {
        id: "git_push",
        text: "⬆️ Push",
        tooltip: "Push to remote",
        command: { type: "shell", command: "git push" },
        enabled: true,
        alignment: "right",
        priority: 98,
      },
    ],
    metadata: {
      created: new Date(),
      modified: new Date(),
      author: "StatusBar Quick Actions",
    },
  },
};

/** Menu options with enhanced descriptions */
const MENU_OPTIONS: readonly MenuOption[] = [
  {
    key: "1",
    label: "View Current Configuration",
    description: "Display current button configurations",
    action: viewCurrentConfiguration,
    requiresConfirmation: false,
  },
  {
    key: "2",
    label: "Apply Preset",
    description: "Apply a built-in preset configuration",
    action: applyPreset,
    requiresConfirmation: true,
  },
  {
    key: "3",
    label: "Add Button",
    description: "Add a new button to the status bar",
    action: addButton,
    requiresConfirmation: false,
  },
  {
    key: "4",
    label: "Remove Button",
    description: "Remove a button from the status bar",
    action: removeButton,
    requiresConfirmation: true,
  },
  {
    key: "5",
    label: "Toggle Debug Mode",
    description: "Enable or disable debug logging",
    action: toggleDebugMode,
    requiresConfirmation: false,
  },
  {
    key: "6",
    label: "Export Configuration",
    description: "Export current configuration to a file",
    action: exportConfiguration,
    requiresConfirmation: false,
  },
  {
    key: "7",
    label: "Import Configuration",
    description: "Import configuration from a file",
    action: importConfiguration,
    requiresConfirmation: true,
  },
  {
    key: "8",
    label: "Reset to Defaults",
    description: "Reset all settings to default values",
    action: resetToDefaults,
    requiresConfirmation: true,
  },
  {
    key: "9",
    label: "Help",
    description: "Show help and usage information",
    action: showHelp,
    requiresConfirmation: false,
  },
] as const;

// ============================================================================
// CUSTOM ERROR TYPES
// ============================================================================

/** Base application error */
export class ConfigCLIError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly suggestion?: string,
  ) {
    super(message);
    this.name = "ConfigCLIError";
  }
}

/** Input validation error */
export class ValidationError extends ConfigCLIError {
  constructor(message: string, suggestion?: string) {
    super(message, "VALIDATION_ERROR", suggestion);
    this.name = "ValidationError";
  }
}

/** Operation timeout error */
export class TimeoutError extends ConfigCLIError {
  constructor(operation: string, timeoutMs: number) {
    super(
      `${operation} operation timed out after ${timeoutMs}ms`,
      "TIMEOUT_ERROR",
    );
    this.name = "TimeoutError";
  }
}

/** Settings file error */
export class SettingsError extends ConfigCLIError {
  constructor(message: string, suggestion?: string) {
    super(message, "SETTINGS_ERROR", suggestion);
    this.name = "SettingsError";
  }
}

// ============================================================================
// UTILITY CLASSES
// ============================================================================

/** Enhanced console UI with colors and formatting */
class ConsoleUI {
  /** Clear the console screen */
  static clear(): void {
    consoleClear(true);
  }

  /** Print colored text */
  private static printColored(text: string, color: string): void {
    console.log(`${color}${text}${CONFIG.colors.reset}`);
  }

  /** Print the application banner */
  static printBanner(): void {
    const { colors } = CONFIG;
    console.log(`${colors.primary}${CONFIG.banner}${CONFIG.colors.reset}`);
    console.log(
      `${colors.bold}${colors.primary}${CONFIG.appName} v${CONFIG.version}${CONFIG.colors.reset}`,
    );
    console.log(`${colors.primary}${CONFIG.banner}${CONFIG.colors.reset}`);
    console.log(CONFIG.separator);
  }

  /** Print the main menu */
  static printMenu(): void {
    console.log("What would you like to do?", CONFIG.separator);

    for (const option of MENU_OPTIONS) {
      console.log(`  ${option.key}. ${option.label} - ${option.description}`);
    }

    console.log(CONFIG.banner);
    console.log("Enter your choice (or 'q' to quit): ");
  }

  /** Print an error message */
  static printError(message: string, suggestion?: string): void {
    this.printColored(`❌ ${message}`, CONFIG.colors.error);
    if (suggestion) {
      this.printColored(`💡 ${suggestion}`, CONFIG.colors.warning);
    }
    console.log(CONFIG.separator);
  }

  /** Print a success message */
  static printSuccess(message: string): void {
    this.printColored(`✅ ${message}`, CONFIG.colors.success);
    console.log(CONFIG.separator);
  }

  /** Print a warning message */
  static printWarning(message: string): void {
    this.printColored(`⚠️  ${message}`, CONFIG.colors.warning);
    console.log(CONFIG.separator);
  }

  /** Print an info message */
  static printInfo(message: string): void {
    this.printColored(`ℹ️  ${message}`, CONFIG.colors.primary);
    console.log(CONFIG.separator);
  }

  /** Print divider line */
  static printDivider(char = "─"): void {
    console.log(char.repeat(50));
  }

  /** Print a table */
  static printTable(headers: string[], rows: string[][]): void {
    const colWidths = headers.map((h, i) =>
      Math.max(h.length, ...rows.map((r) => (r[i] || "").length)),
    );

    // Print header
    const headerRow = headers.map((h, i) => h.padEnd(colWidths[i])).join(" | ");
    console.log(headerRow);
    console.log(colWidths.map((w) => "─".repeat(w)).join("─┼─"));

    // Print rows
    rows.forEach((row) => {
      console.log(
        row.map((cell, i) => (cell || "").padEnd(colWidths[i])).join(" | "),
      );
    });
  }
}

/** Settings manager for VSCode settings files */
class SettingsManager {
  private static getUserSettingsPath(): string {
    const platform = process.platform;
    let settingsDir: string;

    if (platform === "win32") {
      settingsDir = join(
        process.env.APPDATA || join(homedir(), "AppData", "Roaming"),
        "Code",
        "User",
      );
    } else if (platform === "darwin") {
      settingsDir = join(
        homedir(),
        "Library",
        "Application Support",
        "Code",
        "User",
      );
    } else {
      settingsDir = join(homedir(), ".config", "Code", "User");
    }

    return join(settingsDir, "settings.json");
  }

  private static getWorkspaceSettingsPath(): string {
    // Assume current working directory is the workspace
    const workspaceRoot = process.cwd();
    return join(workspaceRoot, ".vscode", "settings.json");
  }

  static getSettingsPath(location: SettingsLocation): string {
    return location === "user"
      ? this.getUserSettingsPath()
      : this.getWorkspaceSettingsPath();
  }

  static readSettings(location: SettingsLocation): VSCodeSettings {
    const settingsPath = this.getSettingsPath(location);

    if (!existsSync(settingsPath)) {
      // Create settings file if it doesn't exist
      const settingsDir = dirname(settingsPath);
      if (!existsSync(settingsDir)) {
        mkdirSync(settingsDir, { recursive: true });
      }
      writeFileSync(settingsPath, "{}", "utf-8");
      return {};
    }

    try {
      const content = readFileSync(settingsPath, "utf-8");
      // Remove comments and trailing commas (VSCode allows these in settings.json)
      const cleanedContent = content
        .replace(/\/\/.*$/gm, "") // Remove single-line comments
        .replace(/\/\*[\s\S]*?\*\//g, "") // Remove multi-line comments
        .replace(/,(\s*[}\]])/g, "$1"); // Remove trailing commas

      return JSON.parse(cleanedContent);
    } catch (error) {
      throw new SettingsError(
        `Failed to read settings from ${settingsPath}: ${error instanceof Error ? error.message : String(error)}`,
        "Check if the file is valid JSON",
      );
    }
  }

  static writeSettings(
    location: SettingsLocation,
    settings: VSCodeSettings,
  ): void {
    const settingsPath = this.getSettingsPath(location);
    const settingsDir = dirname(settingsPath);

    if (!existsSync(settingsDir)) {
      mkdirSync(settingsDir, { recursive: true });
    }

    try {
      const content = JSON.stringify(settings, null, 2);
      writeFileSync(settingsPath, content, "utf-8");
    } catch (error) {
      throw new SettingsError(
        `Failed to write settings to ${settingsPath}: ${error instanceof Error ? error.message : String(error)}`,
        "Check if you have write permissions",
      );
    }
  }

  static getButtons(location: SettingsLocation): StatusBarButtonConfig[] {
    const settings = this.readSettings(location);
    return settings["statusbarQuickActions.buttons"] || [];
  }

  static setButtons(
    location: SettingsLocation,
    buttons: StatusBarButtonConfig[],
  ): void {
    const settings = this.readSettings(location);
    settings["statusbarQuickActions.buttons"] = buttons;
    this.writeSettings(location, settings);
  }

  static getDebugMode(location: SettingsLocation): boolean {
    const settings = this.readSettings(location);
    return settings["statusbarQuickActions.settings.debug"] || false;
  }

  static setDebugMode(location: SettingsLocation, enabled: boolean): void {
    const settings = this.readSettings(location);
    settings["statusbarQuickActions.settings.debug"] = enabled;
    this.writeSettings(location, settings);
  }
}

/** Enhanced input validator with better error handling */
class InputValidator {
  /** Validate user choice input */
  static validateChoice(input: string): ValidationResult {
    const trimmedInput = input.trim().toLowerCase();

    // Handle empty input
    if (!trimmedInput) {
      return {
        isValid: false,
        error: "Please enter a valid choice",
        suggestion: `Type a number (1-${MENU_OPTIONS.length}) or 'q' to quit`,
      };
    }

    // Handle quit commands
    if (this.isQuitCommand(trimmedInput)) {
      return { isValid: false, value: "quit" };
    }

    // Validate against menu options
    const option = MENU_OPTIONS.find((opt) => opt.key === trimmedInput);

    if (option) {
      return { isValid: true, value: trimmedInput };
    }

    // Provide helpful suggestions for invalid input
    const suggestions = this.getSuggestions(trimmedInput);

    return {
      isValid: false,
      error: `Invalid choice '${input}'`,
      suggestion:
        suggestions.length > 0
          ? `Did you mean: ${suggestions.join(", ")}?`
          : `Please select a valid option (1-${MENU_OPTIONS.length}) or 'q' to quit`,
    };
  }

  /** Check if input is a quit command */
  private static isQuitCommand(input: string): boolean {
    return ["q", "quit", "exit", "x"].includes(input);
  }

  /** Get suggestions for invalid input using fuzzy matching */
  private static getSuggestions(input: string): string[] {
    const suggestions: string[] = [];

    // Check for numeric input
    if (/^\d+$/.test(input)) {
      const num = parseInt(input, 10);
      if (num > 0 && num <= MENU_OPTIONS.length + 5) {
        suggestions.push(`${num}`);
      }
    }

    // Check for partial matches with menu options
    for (const option of MENU_OPTIONS) {
      if (option.label.toLowerCase().includes(input) || option.key === input) {
        suggestions.push(option.key);
      }
    }

    return suggestions.slice(0, 3);
  }
}

/** Enhanced input handler with timeout and retry logic */
class InputHandler {
  /** Get user input with timeout */
  static async getInput(
    timeoutMs: number = CONFIG.timeoutMs,
  ): Promise<string | null> {
    try {
      // Check for command line arguments first (non-interactive mode)
      if (process.argv.length > 2) {
        const arg = process.argv[2];
        return arg;
      }

      // Interactive mode with stdin using Promise with timeout
      return await Promise.race([
        new Promise<string>((resolve) => {
          const stdin = process.stdin;
          stdin.setEncoding("utf-8");
          stdin.once("data", (data) => {
            resolve(data.toString().trim());
          });
        }),
        new Promise<never>((_, reject) => {
          setTimeout(() => {
            reject(new TimeoutError("Input", timeoutMs));
          }, timeoutMs);
        }),
      ]);
    } catch (error) {
      if (error instanceof TimeoutError) {
        ConsoleUI.printError("Input timeout", "Please try again");
      } else {
        ConsoleUI.printError(
          "Failed to read input",
          "Please check your terminal configuration",
        );
      }
      return null;
    }
  }

  /** Get confirmation from user */
  static async getConfirmation(message: string): Promise<boolean> {
    console.log(`${message} (y/N): `);
    const input = await this.getInput(10000);

    if (!input) {
      return false;
    }

    return ["y", "yes", "yeah", "yep"].includes(input.toLowerCase());
  }

  /** Prompt for settings location */
  static async promptLocation(): Promise<SettingsLocation> {
    console.log("\nSelect settings location:");
    console.log("  1. User settings (global)");
    console.log("  2. Workspace settings (project-specific)");
    console.log("\nChoice (1 or 2): ");

    const input = await this.getInput(10000);

    if (input === "2") {
      return "workspace";
    }
    return "user";
  }
}

// ============================================================================
// OPERATION HANDLERS
// ============================================================================

/** View current configuration */
async function viewCurrentConfiguration(): Promise<void> {
  ConsoleUI.clear();
  ConsoleUI.printBanner();

  const location = await InputHandler.promptLocation();
  const buttons = SettingsManager.getButtons(location);
  const debugMode = SettingsManager.getDebugMode(location);

  ConsoleUI.printDivider();
  console.log(`Configuration (${location} settings)`);
  ConsoleUI.printDivider();
  console.log();

  console.log(`Debug Mode: ${debugMode ? "✅ Enabled" : "❌ Disabled"}`);
  console.log(`Total Buttons: ${buttons.length}`);
  console.log();

  if (buttons.length === 0) {
    ConsoleUI.printWarning("No buttons configured");
    return;
  }

  ConsoleUI.printDivider();
  console.log("Buttons:");
  ConsoleUI.printDivider();

  const rows = buttons.map((btn, idx) => [
    `${idx + 1}`,
    btn.id,
    btn.text,
    btn.command.type,
    btn.enabled === false ? "❌" : "✅",
  ]);

  ConsoleUI.printTable(["#", "ID", "Text", "Type", "Enabled"], rows);
}

/** Apply a preset configuration */
async function applyPreset(): Promise<void> {
  ConsoleUI.clear();
  ConsoleUI.printBanner();

  console.log("Available Presets:");
  ConsoleUI.printDivider();

  const presetKeys = Object.keys(BUILTIN_PRESETS);
  presetKeys.forEach((key, idx) => {
    const preset = BUILTIN_PRESETS[key];
    console.log(`  ${idx + 1}. ${preset.name}`);
    console.log(
      `     ${CONFIG.colors.dim}${preset.description}${CONFIG.colors.reset}`,
    );
    console.log(
      `     ${CONFIG.colors.dim}${preset.buttons.length} buttons${CONFIG.colors.reset}`,
    );
    console.log();
  });

  console.log("Select preset (1-" + presetKeys.length + "): ");
  const input = await InputHandler.getInput(10000);

  if (!input) {
    ConsoleUI.printWarning("Operation cancelled");
    return;
  }

  const index = parseInt(input, 10) - 1;
  if (index < 0 || index >= presetKeys.length) {
    ConsoleUI.printError("Invalid selection");
    return;
  }

  const presetKey = presetKeys[index];
  const preset = BUILTIN_PRESETS[presetKey];

  ConsoleUI.printInfo(`Selected: ${preset.name}`);

  const location = await InputHandler.promptLocation();
  const existingButtons = SettingsManager.getButtons(location);

  if (existingButtons.length > 0) {
    console.log("\nMerge mode:");
    console.log("  1. Replace all (removes existing buttons)");
    console.log("  2. Append (adds to existing buttons)");
    console.log("  3. Merge (replaces buttons with same ID)");
    console.log("\nChoice (1-3): ");

    const mergeInput = await InputHandler.getInput(10000);
    let buttons: StatusBarButtonConfig[] = [];

    switch (mergeInput) {
      case "1":
        buttons = preset.buttons;
        break;
      case "2":
        buttons = [...existingButtons, ...preset.buttons];
        break;
      case "3": {
        const mergedMap = new Map(existingButtons.map((b) => [b.id, b]));
        preset.buttons.forEach((b) => mergedMap.set(b.id, b));
        buttons = Array.from(mergedMap.values());
        break;
      }
      default:
        ConsoleUI.printWarning("Invalid choice, operation cancelled");
        return;
    }

    SettingsManager.setButtons(location, buttons);
  } else {
    SettingsManager.setButtons(location, preset.buttons);
  }

  ConsoleUI.printSuccess(
    `Preset "${preset.name}" applied to ${location} settings`,
  );
}

/** Add a new button */
async function addButton(): Promise<void> {
  ConsoleUI.clear();
  ConsoleUI.printBanner();

  const location = await InputHandler.promptLocation();

  console.log("Button ID (unique identifier): ");
  const id = await InputHandler.getInput(10000);
  if (!id) {
    ConsoleUI.printWarning("Operation cancelled");
    return;
  }

  console.log("Button text (what shows on status bar): ");
  const text = await InputHandler.getInput(10000);
  if (!text) {
    ConsoleUI.printWarning("Operation cancelled");
    return;
  }

  console.log("Tooltip (hover text): ");
  const tooltip = (await InputHandler.getInput(10000)) || text;

  console.log("\nCommand type:");
  console.log("  1. npm    2. yarn    3. pnpm    4. bun");
  console.log("  5. shell  6. vscode  7. task    8. detect");
  console.log("\nChoice (1-8): ");

  const typeInput = await InputHandler.getInput(10000);
  const typeMap: Record<string, string> = {
    "1": "npm",
    "2": "yarn",
    "3": "pnpm",
    "4": "bun",
    "5": "shell",
    "6": "vscode",
    "7": "task",
    "8": "detect",
  };

  const commandType = typeMap[typeInput || ""] || "shell";

  console.log(
    `\n${commandType === "shell" || commandType === "vscode" || commandType === "task" ? "Command" : "Script name"}: `,
  );
  const commandValue = await InputHandler.getInput(10000);
  if (!commandValue) {
    ConsoleUI.printWarning("Operation cancelled");
    return;
  }

  const button: StatusBarButtonConfig = {
    id,
    text,
    tooltip,
    command:
      commandType === "shell" ||
      commandType === "vscode" ||
      commandType === "task"
        ? {
            type: commandType as "shell" | "vscode" | "task",
            command: commandValue,
          }
        : {
            type: commandType as
              | "npm"
              | "yarn"
              | "pnpm"
              | "bun"
              | "npx"
              | "pnpx"
              | "bunx"
              | "detect",
            script: commandValue,
          },
    enabled: true,
    alignment: "left",
    priority: 100,
  };

  const buttons = SettingsManager.getButtons(location);
  buttons.push(button);
  SettingsManager.setButtons(location, buttons);

  ConsoleUI.printSuccess(`Button "${text}" added to ${location} settings`);
}

/** Remove a button */
async function removeButton(): Promise<void> {
  ConsoleUI.clear();
  ConsoleUI.printBanner();

  const location = await InputHandler.promptLocation();
  const buttons = SettingsManager.getButtons(location);

  if (buttons.length === 0) {
    ConsoleUI.printWarning("No buttons to remove");
    return;
  }

  console.log("Select button to remove:");
  ConsoleUI.printDivider();

  buttons.forEach((btn, idx) => {
    console.log(`  ${idx + 1}. ${btn.text} (${btn.id})`);
  });

  console.log(`\nChoice (1-${buttons.length}): `);
  const input = await InputHandler.getInput(10000);

  if (!input) {
    ConsoleUI.printWarning("Operation cancelled");
    return;
  }

  const index = parseInt(input, 10) - 1;
  if (index < 0 || index >= buttons.length) {
    ConsoleUI.printError("Invalid selection");
    return;
  }

  const removedButton = buttons[index];
  buttons.splice(index, 1);
  SettingsManager.setButtons(location, buttons);

  ConsoleUI.printSuccess(
    `Button "${removedButton.text}" removed from ${location} settings`,
  );
}

/** Toggle debug mode */
async function toggleDebugMode(): Promise<void> {
  ConsoleUI.clear();
  ConsoleUI.printBanner();

  const location = await InputHandler.promptLocation();
  const currentDebugMode = SettingsManager.getDebugMode(location);

  ConsoleUI.printInfo(
    `Debug mode is currently ${currentDebugMode ? "enabled" : "disabled"}`,
  );

  const confirmed = await InputHandler.getConfirmation(
    `${currentDebugMode ? "Disable" : "Enable"} debug mode?`,
  );

  if (!confirmed) {
    ConsoleUI.printWarning("Operation cancelled");
    return;
  }

  SettingsManager.setDebugMode(location, !currentDebugMode);
  ConsoleUI.printSuccess(
    `Debug mode ${!currentDebugMode ? "enabled" : "disabled"} in ${location} settings`,
  );
}

/** Export configuration */
async function exportConfiguration(): Promise<void> {
  ConsoleUI.clear();
  ConsoleUI.printBanner();

  const location = await InputHandler.promptLocation();
  const buttons = SettingsManager.getButtons(location);

  console.log("Export file path (e.g., config.json): ");
  const filePath = await InputHandler.getInput(10000);

  if (!filePath) {
    ConsoleUI.printWarning("Operation cancelled");
    return;
  }

  const exportData: ExtensionConfig = {
    buttons,
    history: true,
    autoDetect: false,
    settings: {
      debug: SettingsManager.getDebugMode(location),
    },
  };

  try {
    writeFileSync(filePath, JSON.stringify(exportData, null, 2), "utf-8");
    ConsoleUI.printSuccess(`Configuration exported to ${filePath}`);
  } catch (error) {
    ConsoleUI.printError(
      `Failed to export: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

/** Import configuration */
async function importConfiguration(): Promise<void> {
  ConsoleUI.clear();
  ConsoleUI.printBanner();

  console.log("Import file path: ");
  const filePath = await InputHandler.getInput(10000);

  if (!filePath) {
    ConsoleUI.printWarning("Operation cancelled");
    return;
  }

  if (!existsSync(filePath)) {
    ConsoleUI.printError("File not found");
    return;
  }

  try {
    const content = readFileSync(filePath, "utf-8");
    const importedConfig: ExtensionConfig = JSON.parse(content);

    if (!importedConfig.buttons || !Array.isArray(importedConfig.buttons)) {
      ConsoleUI.printError("Invalid configuration file");
      return;
    }

    const location = await InputHandler.promptLocation();
    const existingButtons = SettingsManager.getButtons(location);

    if (existingButtons.length > 0) {
      console.log("\nImport mode:");
      console.log("  1. Replace all");
      console.log("  2. Merge");
      console.log("\nChoice (1-2): ");

      const mergeInput = await InputHandler.getInput(10000);

      if (mergeInput === "2") {
        const mergedButtons = [...existingButtons, ...importedConfig.buttons];
        SettingsManager.setButtons(location, mergedButtons);
      } else {
        SettingsManager.setButtons(location, importedConfig.buttons);
      }
    } else {
      SettingsManager.setButtons(location, importedConfig.buttons);
    }

    ConsoleUI.printSuccess(
      `Configuration imported to ${location} settings (${importedConfig.buttons.length} buttons)`,
    );
  } catch (error) {
    ConsoleUI.printError(
      `Failed to import: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

/** Reset to defaults */
async function resetToDefaults(): Promise<void> {
  ConsoleUI.clear();
  ConsoleUI.printBanner();

  const location = await InputHandler.promptLocation();
  const confirmed = await InputHandler.getConfirmation(
    `Reset ${location} settings to defaults? This will remove all buttons.`,
  );

  if (!confirmed) {
    ConsoleUI.printWarning("Operation cancelled");
    return;
  }

  SettingsManager.setButtons(location, []);
  SettingsManager.setDebugMode(location, false);

  ConsoleUI.printSuccess(`${location} settings reset to defaults`);
}

/** Enhanced help system */
async function showHelp(): Promise<void> {
  ConsoleUI.clear();
  ConsoleUI.printBanner();

  ConsoleUI.printDivider();
  console.log("Help & Usage Guide");
  ConsoleUI.printDivider();
  console.log();

  console.log("Available Operations:");
  ConsoleUI.printDivider();

  for (const option of MENU_OPTIONS) {
    console.log(`  ${option.key}. ${option.label}`);
    console.log(`     ${option.description}`);
    if (option.requiresConfirmation) {
      ConsoleUI.printWarning("     Requires confirmation");
    }
    console.log();
  }

  ConsoleUI.printDivider();
  console.log("Settings Locations:");
  ConsoleUI.printDivider();
  console.log("  • User settings: Global settings for all workspaces");
  console.log("  • Workspace settings: Project-specific settings");
  console.log();

  ConsoleUI.printDivider();
  console.log("Built-in Presets:");
  ConsoleUI.printDivider();
  Object.values(BUILTIN_PRESETS).forEach((preset) => {
    console.log(`  • ${preset.name}: ${preset.description}`);
  });
  console.log();

  ConsoleUI.printDivider();
}

// ============================================================================
// MAIN APPLICATION CLASS
// ============================================================================

/** Main CLI application controller */
class ConfigCLI {
  private state: ApplicationState = {
    isRunning: true,
    operationCount: 0,
    startTime: Date.now(),
  };

  /** Run the main application loop */
  async run(): Promise<void> {
    ConsoleUI.clear();
    ConsoleUI.printBanner();

    try {
      while (this.state.isRunning) {
        this.displayMainMenu();
        const input = await InputHandler.getInput();

        if (!input) {
          this.handleQuit("Input timeout");
          break;
        }

        await this.processInput(input);
      }
    } catch (error) {
      this.handleError(error);
      this.state.isRunning = false;
    }
  }

  /** Display main menu and get user choice */
  private displayMainMenu(): void {
    ConsoleUI.printMenu();
  }

  /** Process user input and execute corresponding action */
  private async processInput(input: string): Promise<void> {
    const validation = InputValidator.validateChoice(input);

    if (!validation.isValid) {
      if (validation.value === "quit") {
        this.handleQuit("User requested exit");
        return;
      }

      ConsoleUI.printError(validation.error!, validation.suggestion);
      console.log("Press Enter to try again...");
      await InputHandler.getInput(10000);
      ConsoleUI.clear();
      ConsoleUI.printBanner();
      return;
    }

    await this.executeChoice(validation.value!);

    // Show pause prompt for operations that modify settings
    if (!["1", "9"].includes(validation.value!)) {
      console.log("\nPress Enter to return to menu...");
      await InputHandler.getInput(15000);
    }

    // Clear screen and show menu again
    ConsoleUI.clear();
    ConsoleUI.printBanner();
  }

  /** Execute the selected menu option */
  private async executeChoice(choice: string): Promise<void> {
    const option = MENU_OPTIONS.find((opt) => opt.key === choice);

    if (!option) {
      ConsoleUI.printError("Invalid option selected");
      return;
    }

    // Handle confirmation for destructive operations
    if (option.requiresConfirmation) {
      const confirmed = await InputHandler.getConfirmation(
        `Are you sure you want to ${option.label.toLowerCase()}?`,
      );

      if (!confirmed) {
        ConsoleUI.printWarning(`${option.label} cancelled`);
        return;
      }
    }

    try {
      this.state.operationCount++;
      await option.action();
    } catch (error) {
      ConsoleUI.printError(
        `${option.label} operation failed`,
        error instanceof ConfigCLIError ? error.suggestion : "Please try again",
      );
    }
  }

  /** Handle application quit */
  private handleQuit(reason?: string): void {
    const duration = Date.now() - this.state.startTime;
    const message = reason ? `${reason}. ` : "";

    ConsoleUI.clear();
    ConsoleUI.printBanner();
    ConsoleUI.printSuccess(
      `${message}Thank you for using Config CLI! Operations: ${this.state.operationCount}, Duration: ${Math.round(duration)}ms`,
    );

    this.state.isRunning = false;
  }

  /** Handle unexpected errors */
  private handleError(error: unknown): void {
    ConsoleUI.clear();
    ConsoleUI.printBanner();

    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    const errorCode =
      error instanceof ConfigCLIError ? error.code : "UNKNOWN_ERROR";

    ConsoleUI.printError(
      `An unexpected error occurred: ${errorMessage}`,
      "Please report this issue with the error code below",
    );

    console.log(`Error Code: ${errorCode}`);
    console.log(`Timestamp: ${new Date().toISOString()}`);
    ConsoleUI.printDivider();
  }
}

// ============================================================================
// APPLICATION ENTRY POINT
// ============================================================================

/** Main application entry point */
async function main(): Promise<void> {
  try {
    const cli = new ConfigCLI();
    await cli.run();
  } catch (error) {
    console.error("Failed to start application:", error);
    process.exit(1);
  }
}

// ============================================================================
// GLOBAL ERROR HANDLERS
// ============================================================================

/** Handle unhandled promise rejections */
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
  console.error("This might be due to an unhandled async operation");
  process.exit(1);
});

/** Handle uncaught exceptions */
process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
  console.error("The application encountered a critical error and must exit");
  process.exit(1);
});

/** Handle SIGINT (Ctrl+C) gracefully */
process.on("SIGINT", () => {
  ConsoleUI.printWarning(
    "Received interrupt signal. Shutting down gracefully...",
  );
  process.exit(0);
});

// ============================================================================
// START APPLICATION
// ============================================================================

// Start the application
main().catch((error) => {
  console.error("Fatal error during application startup:", error);
  process.exit(1);
});
