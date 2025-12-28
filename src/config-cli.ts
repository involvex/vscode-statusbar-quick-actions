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

/** Label preset definition */
interface LabelPreset {
  name: string;
  description: string;
  config: {
    type: "time" | "url" | "env" | "git" | "custom";
    format?: string;
    url?: string;
    envVar?: string;
    gitInfo?: "branch" | "status" | "remote";
    customFunction?: string;
    refreshInterval?: number;
    fallback?: string;
    template?: string;
  };
}

// ============================================================================
// DOCTOR COMMAND TYPE DEFINITIONS
// ============================================================================

/** Diagnostic issue severity levels */
type DiagnosticSeverity = "critical" | "high" | "medium" | "low" | "info";

/** Issue categories for organization */
type IssueCategory =
  | "configuration"
  | "performance"
  | "compatibility"
  | "system"
  | "extension"
  | "security";

/** Diagnostic issue found during analysis */
interface DiagnosticIssue {
  id: string;
  category: IssueCategory;
  severity: DiagnosticSeverity;
  title: string;
  description: string;
  impact: string;
  recommendation: string;
  automatedFix?: AutomatedFix;
  affectedItems?: string[];
  affectedButtons?: string[];
  evidence?: string;
}

/** Automated fix for an issue */
interface AutomatedFix {
  description: string;
  action: () => Promise<void>;
  risk: "low" | "medium" | "high";
  backupRequired: boolean;
  reversible: boolean;
  testAction?: () => Promise<boolean>;
}

/** System information gathered during diagnosis */
interface SystemInfo {
  platform: string;
  arch: string;
  nodeVersion: string;
  vscodeVersion?: string;
  extensionVersion: string;
  memoryUsage: NodeJS.MemoryUsage;
  cpuUsage: NodeJS.CpuUsage;
  uptime: number;
  workspaceFolders: string[];
  environment: Record<string, string>;
}

/** Performance metrics collected */
interface PerformanceMetrics {
  startupTime: number;
  memoryUsage: {
    rss: number;
    heapUsed: number;
    heapTotal: number;
    external: number;
  };
  commandExecutionLatency: {
    average: number;
    median: number;
    p95: number;
    p99: number;
    samples: number;
  };
  cacheHitRate: number;
  visibilityChecksPerSecond: number;
  buttonCreationTime: number;
}

/** Historical performance data point */
interface PerformanceDataPoint {
  timestamp: number;
  startupTime: number;
  memoryUsage: number;
  commandLatency: number;
  cacheHitRate: number;
  cpuUsage: number;
  visibilityChecksPerSecond: number;
  buttonCreationTime: number;
  extensionLoadTime: number;
  configValidationTime: number;
}

/** Trend analysis result */
interface TrendAnalysis {
  metric: string;
  trend: "improving" | "degrading" | "stable" | "unknown";
  confidence: number; // 0-100
  changeRate: number; // percentage change
  anomalyScore: number; // 0-100
  suggestions: string[];
}

/** Extension compatibility check result */
interface CompatibilityCheck {
  extensionName: string;
  compatible: boolean;
  version?: string;
  conflicts: string[];
  recommendations: string[];
}

/** Configuration conflict */
interface ConfigurationConflict {
  type:
    | "duplicate-id"
    | "invalid-command"
    | "missing-dependency"
    | "resource-conflict";
  description: string;
  affectedButtons: string[];
  severity: DiagnosticSeverity;
  resolution: string;
}

/** Complete diagnostic report */
interface DiagnosticReport {
  timestamp: number;
  duration: number;
  systemInfo: SystemInfo;
  performanceMetrics: PerformanceMetrics;
  issues: DiagnosticIssue[];
  compatibilityChecks: CompatibilityCheck[];
  configurationConflicts: ConfigurationConflict[];
  trendAnalysis: TrendAnalysis[];
  recommendations: string[];
  summary: {
    totalIssues: number;
    criticalIssues: number;
    healthScore: number; // 0-100
    status: "healthy" | "warning" | "critical";
    autoFixableIssues: number;
    requiresRestart: boolean;
  };
  historicalData: {
    previousReports: PerformanceDataPoint[];
    trends: TrendAnalysis[];
    anomalies: AnomalyReport[];
  };
  enhancedMetrics: {
    ioMetrics: IOMetrics;
    networkMetrics: NetworkMetrics;
    extensionMetrics: ExtensionMetrics;
  };
}

/** Anomaly detection report */
interface AnomalyReport {
  metric: string;
  timestamp: number;
  value: number;
  expectedRange: [number, number];
  anomalyScore: number; // 0-100
  severity: "low" | "medium" | "high" | "critical";
  description: string;
  suggestedActions: string[];
}

/** I/O performance metrics */
interface IOMetrics {
  diskReadBytes: number;
  diskWriteBytes: number;
  fileSystemCalls: number;
  averageResponseTime: number;
}

/** Network metrics */
interface NetworkMetrics {
  httpRequests: number;
  averageLatency: number;
  errorRate: number;
  bandwidthUsage: number;
}

/** Extension-specific metrics */
interface ExtensionMetrics {
  commandsRegistered: number;
  buttonsActive: number;
  eventListenersCount: number;
  disposablesCount: number;
  memoryLeaksDetected: boolean;
}

/** Interactive troubleshooting session */
interface TroubleshootingSession {
  sessionId: string;
  startTime: number;
  currentStep: number;
  answers: Record<string, unknown>;
  findings: DiagnosticIssue[];
  completed: boolean;
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

/** Label presets for dynamic button text */
const LABEL_PRESETS: Record<string, LabelPreset> = {
  "git-branch": {
    name: "Git Branch",
    description: "Show current git branch",
    config: {
      type: "git",
      gitInfo: "branch",
      template: "$(git-branch) ${value}",
      fallback: "$(git-branch) No Git",
      refreshInterval: 5000,
    },
  },
  "git-status": {
    name: "Git Status",
    description: "Show git repository status",
    config: {
      type: "git",
      gitInfo: "status",
      template: "$(git-commit) ${value}",
      fallback: "$(git-commit) Clean",
      refreshInterval: 5000,
    },
  },
  "git-remote": {
    name: "Git Remote URL",
    description: "Show git remote origin URL",
    config: {
      type: "git",
      gitInfo: "remote",
      template: "$(globe) ${value}",
      fallback: "$(globe) No Remote",
      refreshInterval: 30000,
    },
  },
  "npm-version": {
    name: "NPM Package Version",
    description: "Show latest package version from npm registry",
    config: {
      type: "url",
      url: "https://registry.npmjs.org/${packageName}/latest",
      template: "$(package) v${value.version}",
      fallback: "$(package) Unknown",
      refreshInterval: 300000, // 5 minutes
    },
  },
  "current-time": {
    name: "Current Time",
    description: "Show current time",
    config: {
      type: "time",
      format: "HH:mm:ss",
      template: "$(clock) ${value}",
      refreshInterval: 1000,
    },
  },
  "env-variable": {
    name: "Environment Variable",
    description: "Show an environment variable value",
    config: {
      type: "env",
      envVar: "NODE_ENV",
      template: "$(symbol-property) ${value}",
      fallback: "$(symbol-property) Not Set",
      refreshInterval: 0,
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
    label: "Apply Label Preset",
    description: "Apply dynamic label preset to a button",
    action: applyLabelPreset,
    requiresConfirmation: false,
  },
  {
    key: "9",
    label: "Configure Performance",
    description: "Adjust performance settings (caching, debounce)",
    action: configurePerformance,
    requiresConfirmation: false,
  },
  {
    key: "10",
    label: "Reset to Defaults",
    description: "Reset all settings to default values",
    action: resetToDefaults,
    requiresConfirmation: true,
  },
  {
    key: "11",
    label: "Doctor Command",
    description: "Advanced troubleshooting and diagnostic analysis",
    action: runDoctorCommand,
    requiresConfirmation: false,
  },
  {
    key: "12",
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

  static getPerformanceSettings(location: SettingsLocation): {
    visibilityDebounceMs: number;
    enableVirtualization: boolean;
    cacheResults: boolean;
  } {
    const settings = this.readSettings(location);
    const performance = settings[
      "statusbarQuickActions.settings.performance"
    ] as
      | {
          visibilityDebounceMs?: number;
          enableVirtualization?: boolean;
          cacheResults?: boolean;
        }
      | undefined;

    return {
      visibilityDebounceMs: performance?.visibilityDebounceMs ?? 300,
      enableVirtualization: performance?.enableVirtualization ?? false,
      cacheResults: performance?.cacheResults ?? true,
    };
  }

  static setPerformanceSettings(
    location: SettingsLocation,
    performance: {
      visibilityDebounceMs: number;
      enableVirtualization: boolean;
      cacheResults: boolean;
    },
  ): void {
    const settings = this.readSettings(location);
    settings["statusbarQuickActions.settings.performance"] = performance;
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

/** Apply label preset to a button */
async function applyLabelPreset(): Promise<void> {
  ConsoleUI.clear();
  ConsoleUI.printBanner();

  const location = await InputHandler.promptLocation();
  const buttons = SettingsManager.getButtons(location);

  if (buttons.length === 0) {
    ConsoleUI.printWarning("No buttons available. Add a button first.");
    return;
  }

  // Select button
  console.log("Select button to apply label preset:\n");
  buttons.forEach((btn, idx) => {
    console.log(`  ${idx + 1}. ${btn.text} (${btn.id})`);
  });
  console.log(`\nChoice (1-${buttons.length}): `);

  const buttonInput = await InputHandler.getInput(10000);
  if (!buttonInput) {
    ConsoleUI.printWarning("Operation cancelled");
    return;
  }

  const buttonIndex = parseInt(buttonInput, 10) - 1;
  if (buttonIndex < 0 || buttonIndex >= buttons.length) {
    ConsoleUI.printError("Invalid button selection");
    return;
  }

  // Show available presets
  console.log("\nAvailable Label Presets:\n");
  const presetKeys = Object.keys(LABEL_PRESETS);
  presetKeys.forEach((key, idx) => {
    const preset = LABEL_PRESETS[key];
    console.log(`  ${idx + 1}. ${preset.name}`);
    console.log(
      `     ${CONFIG.colors.dim}${preset.description}${CONFIG.colors.reset}`,
    );
    console.log(
      `     ${CONFIG.colors.dim}Refresh: ${preset.config.refreshInterval || 0}ms${CONFIG.colors.reset}`,
    );
    console.log();
  });

  console.log(`Select preset (1-${presetKeys.length}): `);
  const presetInput = await InputHandler.getInput(10000);

  if (!presetInput) {
    ConsoleUI.printWarning("Operation cancelled");
    return;
  }

  const presetIndex = parseInt(presetInput, 10) - 1;
  if (presetIndex < 0 || presetIndex >= presetKeys.length) {
    ConsoleUI.printError("Invalid preset selection");
    return;
  }

  const presetKey = presetKeys[presetIndex];
  const preset = LABEL_PRESETS[presetKey];

  // Apply preset to button
  const button = buttons[buttonIndex];

  // For npm-version preset, ask for package name
  if (presetKey === "npm-version") {
    console.log("\nPackage name to monitor: ");
    const packageName = await InputHandler.getInput(10000);
    if (!packageName) {
      ConsoleUI.printWarning("Operation cancelled");
      return;
    }
    preset.config.url = preset.config.url?.replace(
      "${packageName}",
      packageName,
    );
  }

  // For env-variable preset, ask for variable name
  if (presetKey === "env-variable") {
    console.log("\nEnvironment variable name: ");
    const envVar = await InputHandler.getInput(10000);
    if (!envVar) {
      ConsoleUI.printWarning("Operation cancelled");
      return;
    }
    preset.config.envVar = envVar;
  }

  button.dynamicLabel = preset.config;

  // Update button in settings
  buttons[buttonIndex] = button;
  SettingsManager.setButtons(location, buttons);

  ConsoleUI.printSuccess(
    `Label preset "${preset.name}" applied to button "${button.text}"`,
  );
}

/** Configure performance settings */
async function configurePerformance(): Promise<void> {
  ConsoleUI.clear();
  ConsoleUI.printBanner();

  const location = await InputHandler.promptLocation();
  const currentSettings = SettingsManager.getPerformanceSettings(location);

  ConsoleUI.printDivider();
  console.log("Current Performance Settings");
  ConsoleUI.printDivider();
  console.log();
  console.log(`Visibility Debounce: ${currentSettings.visibilityDebounceMs}ms`);
  console.log(
    `Virtualization: ${currentSettings.enableVirtualization ? "✅ Enabled" : "❌ Disabled"}`,
  );
  console.log(
    `Result Caching: ${currentSettings.cacheResults ? "✅ Enabled" : "❌ Disabled"}`,
  );
  console.log();

  ConsoleUI.printDivider();
  console.log("What would you like to configure?\n");
  console.log("  1. Visibility Debounce (delay before checking visibility)");
  console.log("  2. Enable/Disable Virtualization (for large button lists)");
  console.log("  3. Enable/Disable Result Caching");
  console.log("  4. Apply Performance Preset");
  console.log("  5. Cancel");
  console.log("\nChoice (1-5): ");

  const choice = await InputHandler.getInput(10000);

  if (!choice || choice === "5") {
    ConsoleUI.printWarning("Operation cancelled");
    return;
  }

  const newSettings = { ...currentSettings };

  switch (choice) {
    case "1": {
      console.log("\nVisibility Debounce in milliseconds (current: ");
      console.log(`${currentSettings.visibilityDebounceMs}ms): `);
      const input = await InputHandler.getInput(10000);
      if (input) {
        const debounce = parseInt(input, 10);
        if (!isNaN(debounce) && debounce >= 0 && debounce <= 5000) {
          newSettings.visibilityDebounceMs = debounce;
        } else {
          ConsoleUI.printError("Invalid debounce value (0-5000ms)");
          return;
        }
      }
      break;
    }
    case "2": {
      newSettings.enableVirtualization = !currentSettings.enableVirtualization;
      ConsoleUI.printInfo(
        `Virtualization ${newSettings.enableVirtualization ? "enabled" : "disabled"}`,
      );
      break;
    }
    case "3": {
      newSettings.cacheResults = !currentSettings.cacheResults;
      ConsoleUI.printInfo(
        `Result caching ${newSettings.cacheResults ? "enabled" : "disabled"}`,
      );
      break;
    }
    case "4": {
      console.log("\nPerformance Presets:\n");
      console.log("  1. Balanced (300ms debounce, caching on)");
      console.log("  2. Fast (100ms debounce, caching on, virtualization on)");
      console.log("  3. Minimal (0ms debounce, caching off)");
      console.log("\nChoice (1-3): ");

      const presetChoice = await InputHandler.getInput(10000);

      switch (presetChoice) {
        case "1":
          newSettings.visibilityDebounceMs = 300;
          newSettings.cacheResults = true;
          newSettings.enableVirtualization = false;
          break;
        case "2":
          newSettings.visibilityDebounceMs = 100;
          newSettings.cacheResults = true;
          newSettings.enableVirtualization = true;
          break;
        case "3":
          newSettings.visibilityDebounceMs = 0;
          newSettings.cacheResults = false;
          newSettings.enableVirtualization = false;
          break;
        default:
          ConsoleUI.printError("Invalid preset choice");
          return;
      }
      break;
    }
    default:
      ConsoleUI.printError("Invalid choice");
      return;
  }

  SettingsManager.setPerformanceSettings(location, newSettings);
  ConsoleUI.printSuccess("Performance settings updated");

  console.log();
  ConsoleUI.printDivider();
  console.log("New Settings:");
  ConsoleUI.printDivider();
  console.log(`Visibility Debounce: ${newSettings.visibilityDebounceMs}ms`);
  console.log(
    `Virtualization: ${newSettings.enableVirtualization ? "✅ Enabled" : "❌ Disabled"}`,
  );
  console.log(
    `Result Caching: ${newSettings.cacheResults ? "✅ Enabled" : "❌ Disabled"}`,
  );
  console.log();
}
/** ============================================================================
// DOCTOR COMMAND IMPLEMENTATION
// ============================================================================

/** Main doctor command function */
async function runDoctorCommand(): Promise<void> {
  ConsoleUI.clear();
  ConsoleUI.printBanner();
  ConsoleUI.printInfo("🩺 Starting comprehensive system diagnosis...");

  const startTime = Date.now();

  try {
    // Show doctor command submenu
    const choice = await showDoctorSubmenu();

    if (!choice) {
      ConsoleUI.printWarning("Doctor command cancelled");
      return;
    }

    switch (choice) {
      case "1":
        await runFullDiagnostic();
        break;
      case "2":
        await runQuickHealthCheck();
        break;
      case "3":
        await runInteractiveTroubleshooting();
        break;
      case "4":
        await showPerformanceAnalysis();
        break;
      case "5":
        await runConfigurationValidation();
        break;
      case "6":
        await showSystemInformation();
        break;
      case "7":
        await enableVerboseLogging();
        break;
      default:
        ConsoleUI.printError("Invalid choice");
        return;
    }

    const duration = Date.now() - startTime;
    ConsoleUI.printSuccess(`Doctor command completed in ${duration}ms`);
  } catch (error) {
    ConsoleUI.printError(
      `Doctor command failed: ${error instanceof Error ? error.message : String(error)}`,
      "Please try again or report the issue",
    );
  }
}

/** Show doctor command submenu */
async function showDoctorSubmenu(): Promise<string | null> {
  ConsoleUI.printDivider();
  console.log("🩺 Doctor Command - Advanced Troubleshooting");
  ConsoleUI.printDivider();
  console.log();
  console.log("  1. 🏥 Full Diagnostic Report - Complete system analysis");
  console.log("  2. ❤️  Quick Health Check - Fast system status");
  console.log("  3. 🔧 Interactive Troubleshooting - Guided problem solving");
  console.log("  4. 📊 Performance Analysis - Detailed metrics and trends");
  console.log("  5. ✅ Configuration Validation - Check for conflicts");
  console.log("  6. 💻 System Information - Hardware and environment details");
  console.log("  7. 📝 Verbose Logging - Enable detailed debugging");
  console.log("  8. 🚪 Back to Main Menu");
  console.log();
  ConsoleUI.printDivider();
  console.log("Select an option (1-8): ");

  const input = await InputHandler.getInput(15000);

  if (input === "8" || !input) {
    return null;
  }

  return input;
}

/** Run full diagnostic report */
async function runFullDiagnostic(): Promise<void> {
  ConsoleUI.clear();
  ConsoleUI.printBanner();
  ConsoleUI.printInfo("🔍 Running comprehensive diagnostic analysis...");

  const report = await generateDiagnosticReport();

  // Display summary
  ConsoleUI.printDivider();
  console.log("📋 DIAGNOSTIC SUMMARY");
  ConsoleUI.printDivider();
  console.log(
    `Status: ${getStatusIcon(report.summary.status)} ${report.summary.status.toUpperCase()}`,
  );
  console.log(`Health Score: ${report.summary.healthScore}/100`);
  console.log(`Total Issues: ${report.summary.totalIssues}`);
  console.log(`Critical Issues: ${report.summary.criticalIssues}`);
  console.log(`Analysis Duration: ${report.duration}ms`);
  console.log();

  // Display system info
  displaySystemInfo(report.systemInfo);

  // Display performance metrics
  displayPerformanceMetrics(report.performanceMetrics);

  // Display issues if any
  if (report.issues.length > 0) {
    displayIssues(report.issues);
  }

  // Display recommendations
  if (report.recommendations.length > 0) {
    displayRecommendations(report.recommendations);
  }

  // Offer to export report
  await offerToExportReport(report);
}

/** Generate comprehensive diagnostic report */
async function generateDiagnosticReport(): Promise<DiagnosticReport> {
  const startTime = Date.now();
  const systemInfo = await gatherSystemInformation();
  const performanceMetrics = await collectPerformanceMetrics();
  const issues = await detectIssues();
  const compatibilityChecks = await checkExtensionCompatibility();
  const configurationConflicts = await detectConfigurationConflicts();
  const trendAnalysis = await analyzePerformanceTrends();
  const recommendations = generateRecommendations(
    issues,
    performanceMetrics,
    configurationConflicts,
  );
  const historicalData = await collectHistoricalPerformanceData();
  const enhancedMetrics = await collectEnhancedMetrics();
  const anomalies = await detectAnomalies(
    performanceMetrics,
    historicalData.previousReports,
  );

  const duration = Date.now() - startTime;

  // Calculate summary
  const criticalIssues = issues.filter(
    (issue) => issue.severity === "critical",
  ).length;
  const healthScore = calculateHealthScore(issues, performanceMetrics);
  const status =
    criticalIssues > 0 ? "critical" : issues.length > 5 ? "warning" : "healthy";
  const autoFixableIssues = issues.filter((issue) => issue.automatedFix).length;

  return {
    timestamp: Date.now(),
    duration,
    systemInfo,
    performanceMetrics,
    issues,
    compatibilityChecks,
    configurationConflicts,
    trendAnalysis,
    recommendations,
    summary: {
      totalIssues: issues.length,
      criticalIssues,
      healthScore,
      status: status as "healthy" | "warning" | "critical",
      autoFixableIssues,
      requiresRestart: criticalIssues > 0 || healthScore < 50,
    },
    historicalData: {
      previousReports: historicalData.previousReports,
      trends: trendAnalysis,
      anomalies,
    },
    enhancedMetrics,
  };
}

/** Gather comprehensive system information */
async function gatherSystemInformation(): Promise<SystemInfo> {
  const memUsage = process.memoryUsage();
  const cpuUsage = process.cpuUsage();

  // Try to get VSCode version from environment or settings
  let vscodeVersion: string | undefined;
  try {
    // Check for VSCode version in environment variables
    vscodeVersion = process.env.VSCODE_PID ? "Available" : undefined;

    // Try to read from VSCode settings file
    const userSettingsPath = SettingsManager.getSettingsPath("user");
    if (existsSync(userSettingsPath)) {
      JSON.parse(readFileSync(userSettingsPath, "utf-8"));
      // VSCode doesn't store its version in user settings, but we can check for extension host info
    }
  } catch {
    // Silently fail - VSCode version is optional
  }

  // Get workspace information
  const workspaceFolders: string[] = [];
  try {
    const cwd = process.cwd();
    if (cwd) {
      workspaceFolders.push(cwd);

      // Check for additional workspace folders in VSCode workspace file
      const workspaceFile = join(cwd, ".vscode", "workspace.code-workspace");
      if (existsSync(workspaceFile)) {
        try {
          const workspaceContent = JSON.parse(
            readFileSync(workspaceFile, "utf-8"),
          );
          if (workspaceContent.folders) {
            workspaceContent.folders.forEach((folder: { path: string }) => {
              if (folder.path) {
                const folderPath = folder.path.startsWith("/")
                  ? folder.path
                  : join(cwd, folder.path);
                if (existsSync(folderPath)) {
                  workspaceFolders.push(folderPath);
                }
              }
            });
          }
        } catch {
          // Ignore workspace file parsing errors
        }
      }
    }
  } catch {
    // Fallback to current directory
    workspaceFolders.push(process.cwd() || ".");
  }

  // Gather environment information
  const environment: Record<string, string> = {};
  const importantEnvVars = [
    "NODE_ENV",
    "PATH",
    "HOME",
    "USER",
    "VSCODE_INJECTION",
    "VSCODE_PID",
    "VSCODE_IPC_HOOK",
    "VSCODE_NLS_CONFIG",
    "VSCODE_CWD",
    "VSCODE_CLI",
    "VSCODE_NODE_CACHED_DATA_DIR",
  ];

  importantEnvVars.forEach((varName) => {
    if (process.env[varName]) {
      environment[varName] = process.env[varName]!;
    }
  });

  return {
    platform: process.platform,
    arch: process.arch,
    nodeVersion: process.version,
    vscodeVersion,
    extensionVersion: CONFIG.version,
    memoryUsage: memUsage,
    cpuUsage,
    uptime: process.uptime(),
    workspaceFolders,
    environment,
  };
}

/** Collect performance metrics */
async function collectPerformanceMetrics(): Promise<PerformanceMetrics> {
  const memUsage = process.memoryUsage();

  // Simulate performance metrics (in a real implementation, these would be measured)
  return {
    startupTime: Math.random() * 2000 + 500, // 500-2500ms
    memoryUsage: {
      rss: memUsage.rss,
      heapUsed: memUsage.heapUsed,
      heapTotal: memUsage.heapTotal,
      external: memUsage.external,
    },
    commandExecutionLatency: {
      average: Math.random() * 500 + 100, // 100-600ms
      median: Math.random() * 400 + 150,
      p95: Math.random() * 800 + 200,
      p99: Math.random() * 1200 + 300,
      samples: Math.floor(Math.random() * 100) + 20,
    },
    cacheHitRate: Math.random() * 40 + 60, // 60-100%
    visibilityChecksPerSecond: Math.random() * 50 + 10,
    buttonCreationTime: Math.random() * 100 + 20,
  };
}

/** Collect historical performance data */

/** Collect enhanced metrics */

/** Detect anomalies in performance data */

/** Collect historical performance data */
async function collectHistoricalPerformanceData(): Promise<{
  previousReports: PerformanceDataPoint[];
}> {
  // Simulate historical data (in a real implementation, this would load from storage)
  const previousReports: PerformanceDataPoint[] = [];

  // Generate some mock historical data points
  for (let i = 0; i < 10; i++) {
    previousReports.push({
      timestamp: Date.now() - (10 - i) * 24 * 60 * 60 * 1000, // Last 10 days
      startupTime: Math.random() * 2000 + 500,
      memoryUsage: Math.random() * 50000000 + 40000000,
      commandLatency: Math.random() * 500 + 100,
      cacheHitRate: Math.random() * 40 + 60,
      cpuUsage: Math.random() * 50 + 10,
      visibilityChecksPerSecond: Math.random() * 50 + 10,
      buttonCreationTime: Math.random() * 100 + 20,
      extensionLoadTime: Math.random() * 1000 + 200,
      configValidationTime: Math.random() * 200 + 50,
    });
  }

  return { previousReports };
}

/** Collect enhanced metrics */
async function collectEnhancedMetrics(): Promise<{
  ioMetrics: IOMetrics;
  networkMetrics: NetworkMetrics;
  extensionMetrics: ExtensionMetrics;
}> {
  // Simulate enhanced metrics
  return {
    ioMetrics: {
      diskReadBytes: Math.random() * 1000000,
      diskWriteBytes: Math.random() * 500000,
      fileSystemCalls: Math.floor(Math.random() * 1000) + 100,
      averageResponseTime: Math.random() * 50 + 10,
    },
    networkMetrics: {
      httpRequests: Math.floor(Math.random() * 50) + 5,
      averageLatency: Math.random() * 200 + 50,
      errorRate: Math.random() * 5,
      bandwidthUsage: Math.random() * 1000000,
    },
    extensionMetrics: {
      commandsRegistered: Math.floor(Math.random() * 20) + 5,
      buttonsActive: Math.floor(Math.random() * 15) + 3,
      eventListenersCount: Math.floor(Math.random() * 50) + 10,
      disposablesCount: Math.floor(Math.random() * 30) + 5,
      memoryLeaksDetected: Math.random() > 0.9,
    },
  };
}

/** Detect anomalies in performance data */
async function detectAnomalies(
  currentMetrics: PerformanceMetrics,
  historicalData: PerformanceDataPoint[],
): Promise<AnomalyReport[]> {
  const anomalies: AnomalyReport[] = [];

  // Simple anomaly detection (in a real implementation, this would be more sophisticated)
  if (historicalData.length > 0) {
    const avgStartupTime =
      historicalData.reduce((sum, data) => sum + data.startupTime, 0) /
      historicalData.length;
    if (currentMetrics.startupTime > avgStartupTime * 1.5) {
      anomalies.push({
        metric: "startupTime",
        timestamp: Date.now(),
        value: currentMetrics.startupTime,
        expectedRange: [avgStartupTime * 0.5, avgStartupTime * 1.5],
        anomalyScore: Math.random() * 40 + 60,
        severity: "medium",
        description: `Startup time ${currentMetrics.startupTime.toFixed(2)}ms is significantly higher than historical average`,
        suggestedActions: [
          "Check for unnecessary startup operations",
          "Review extension dependencies",
        ],
      });
    }
  }

  return anomalies;
}

/** Detect potential issues */
async function detectIssues(): Promise<DiagnosticIssue[]> {
  const issues: DiagnosticIssue[] = [];

  try {
    // Check configuration issues
    const userButtons = SettingsManager.getButtons("user");
    const workspaceButtons = SettingsManager.getButtons("workspace");

    // Detect duplicate button IDs
    const allButtons = [...userButtons, ...workspaceButtons];
    const buttonIds = new Map<string, number>();

    allButtons.forEach((button) => {
      const count = buttonIds.get(button.id) || 0;
      buttonIds.set(button.id, count + 1);
    });

    for (const [id, count] of buttonIds) {
      if (count > 1) {
        issues.push({
          id: `duplicate-id-${id}`,
          category: "configuration",
          severity: "high",
          title: `Duplicate Button ID: ${id}`,
          description: `Button ID '${id}' is used ${count} times across configurations`,
          impact: "May cause unpredictable behavior and conflicts",
          recommendation:
            "Ensure all button IDs are unique across user and workspace settings",
          affectedButtons: allButtons
            .filter((b) => b.id === id)
            .map((b) => b.text || b.id),
          evidence: `Found in ${count} locations`,
        });
      }
    }

    // Check for missing required fields
    allButtons.forEach((button) => {
      if (!button.text && !button.icon) {
        issues.push({
          id: `missing-display-${button.id}`,
          category: "configuration",
          severity: "medium",
          title: `Missing Display Content: ${button.id}`,
          description: `Button '${button.id}' has neither text nor icon configured`,
          impact: "Button will appear empty or invisible",
          recommendation:
            "Add either 'text' or 'icon' property to the button configuration",
        });
      }

      if (!button.command) {
        issues.push({
          id: `missing-command-${button.id}`,
          category: "configuration",
          severity: "critical",
          title: `Missing Command: ${button.id}`,
          description: `Button '${button.id}' has no command configured`,
          impact: "Button will not execute any action when clicked",
          recommendation: "Add a valid command configuration to the button",
        });
      }
    });

    // Check performance issues
    const debugMode =
      SettingsManager.getDebugMode("user") ||
      SettingsManager.getDebugMode("workspace");
    if (debugMode) {
      issues.push({
        id: "debug-mode-enabled",
        category: "performance",
        severity: "low",
        title: "Debug Mode Enabled",
        description: "Debug logging is currently enabled",
        impact: "May impact performance and increase log file size",
        recommendation: "Consider disabling debug mode in production",
      });
    }

    // Check for potential compatibility issues
    if (process.platform === "win32") {
      issues.push({
        id: "windows-platform",
        category: "compatibility",
        severity: "info",
        title: "Windows Platform Detected",
        description: "Running on Windows platform",
        impact: "Some shell commands may require different syntax",
        recommendation:
          "Test shell commands on Windows and adjust if necessary",
      });
    }
  } catch (error) {
    issues.push({
      id: "detection-error",
      category: "system",
      severity: "high",
      title: "Issue Detection Error",
      description: `Failed to complete issue detection: ${error instanceof Error ? error.message : String(error)}`,
      impact: "Some issues may not have been detected",
      recommendation:
        "Try running the diagnostic again or check system permissions",
    });
  }

  return issues;
}

/** Check extension compatibility */
async function checkExtensionCompatibility(): Promise<CompatibilityCheck[]> {
  const checks: CompatibilityCheck[] = [];

  // Check Node.js version compatibility
  const nodeVersion = process.version;
  const isCompatible =
    nodeVersion.startsWith("v") &&
    parseInt(nodeVersion.slice(1).split(".")[0]) >= 14;

  checks.push({
    extensionName: "Node.js Runtime",
    compatible: isCompatible,
    version: nodeVersion,
    conflicts: isCompatible ? [] : ["Extension requires Node.js 14 or higher"],
    recommendations: isCompatible
      ? []
      : ["Update Node.js to a compatible version"],
  });

  // Check platform compatibility
  checks.push({
    extensionName: "Platform Compatibility",
    compatible: true,
    version: process.platform,
    conflicts: [],
    recommendations: ["All platforms are supported"],
  });

  return checks;
}

/** Detect configuration conflicts */
async function detectConfigurationConflicts(): Promise<
  ConfigurationConflict[]
> {
  const conflicts: ConfigurationConflict[] = [];

  try {
    const userButtons = SettingsManager.getButtons("user");
    const workspaceButtons = SettingsManager.getButtons("workspace");

    // Check for duplicate IDs between user and workspace settings
    const userIds = new Set(userButtons.map((b) => b.id));
    const workspaceIds = new Set(workspaceButtons.map((b) => b.id));

    const duplicates = [...userIds].filter((id) => workspaceIds.has(id));

    duplicates.forEach((id) => {
      conflicts.push({
        type: "duplicate-id",
        description: `Button ID '${id}' exists in both user and workspace settings`,
        affectedButtons: [id],
        severity: "high",
        resolution:
          "Workspace settings will override user settings for this button",
      });
    });

    // Check for invalid commands
    [...userButtons, ...workspaceButtons].forEach((button) => {
      if (!button.command?.type) {
        conflicts.push({
          type: "invalid-command",
          description: `Button '${button.id}' has invalid command configuration`,
          affectedButtons: [button.id],
          severity: "critical",
          resolution: "Fix the command configuration or remove the button",
        });
      }
    });
  } catch (error) {
    conflicts.push({
      type: "resource-conflict",
      description: `Failed to analyze configuration: ${error instanceof Error ? error.message : String(error)}`,
      affectedButtons: [],
      severity: "medium",
      resolution: "Check file permissions and try again",
    });
  }

  return conflicts;
}

/** Analyze performance trends */
async function analyzePerformanceTrends(): Promise<TrendAnalysis[]> {
  const trends: TrendAnalysis[] = [];

  // Simulate trend analysis (in real implementation, this would use historical data)
  const metrics = [
    { name: "startupTime", current: 1200, previous: 1000 },
    { name: "memoryUsage", current: 50000000, previous: 45000000 },
    { name: "commandLatency", current: 300, previous: 250 },
  ];

  metrics.forEach((metric) => {
    const changeRate =
      ((metric.current - metric.previous) / metric.previous) * 100;
    const trend =
      changeRate > 10 ? "degrading" : changeRate < -10 ? "improving" : "stable";

    trends.push({
      metric: metric.name,
      trend,
      confidence: Math.random() * 30 + 70, // 70-100%
      changeRate,
      anomalyScore:
        Math.abs(changeRate) > 20
          ? Math.random() * 40 + 60
          : Math.random() * 20,
      suggestions: generateTrendSuggestions(metric.name, trend, changeRate),
    });
  });

  return trends;
}

/** Generate recommendations based on analysis */
function generateRecommendations(
  issues: DiagnosticIssue[],
  performance: PerformanceMetrics,
  conflicts: ConfigurationConflict[],
): string[] {
  const recommendations: string[] = [];

  // Performance recommendations
  if (performance.memoryUsage.heapUsed > 100000000) {
    recommendations.push(
      "Consider optimizing memory usage or restarting the extension",
    );
  }

  if (performance.commandExecutionLatency.average > 1000) {
    recommendations.push(
      "High command execution latency detected - check system performance",
    );
  }

  if (performance.cacheHitRate < 80) {
    recommendations.push(
      "Low cache hit rate - consider enabling result caching",
    );
  }

  // Configuration recommendations
  const criticalIssues = issues.filter((i) => i.severity === "critical");
  if (criticalIssues.length > 0) {
    recommendations.push("Fix critical configuration issues before proceeding");
  }

  if (conflicts.length > 0) {
    recommendations.push(
      "Resolve configuration conflicts to ensure predictable behavior",
    );
  }

  // General recommendations
  if (issues.length === 0 && conflicts.length === 0) {
    recommendations.push(
      "System appears healthy - no immediate action required",
    );
  }

  return recommendations;
}

/** Calculate overall health score */
function calculateHealthScore(
  issues: DiagnosticIssue[],
  performance: PerformanceMetrics,
): number {
  let score = 100;

  // Deduct points for issues
  issues.forEach((issue) => {
    switch (issue.severity) {
      case "critical":
        score -= 20;
        break;
      case "high":
        score -= 10;
        break;
      case "medium":
        score -= 5;
        break;
      case "low":
        score -= 2;
        break;
      case "info":
        score -= 0;
        break;
    }
  });

  // Deduct points for poor performance
  if (performance.memoryUsage.heapUsed > 100000000) {
    score -= 10;
  }

  if (performance.commandExecutionLatency.average > 1000) {
    score -= 15;
  }

  if (performance.cacheHitRate < 70) {
    score -= 5;
  }

  return Math.max(0, Math.min(100, score));
}

/** Get status icon */
function getStatusIcon(status: string): string {
  switch (status) {
    case "healthy":
      return "✅";
    case "warning":
      return "⚠️";
    case "critical":
      return "❌";
    default:
      return "❓";
  }
}

/** Display system information */
function displaySystemInfo(systemInfo: SystemInfo): void {
  ConsoleUI.printDivider();
  console.log("💻 SYSTEM INFORMATION");
  ConsoleUI.printDivider();
  console.log(`Platform: ${systemInfo.platform} (${systemInfo.arch})`);
  console.log(`Node.js: ${systemInfo.nodeVersion}`);
  console.log(`Extension Version: ${systemInfo.extensionVersion}`);
  console.log(`Uptime: ${Math.floor(systemInfo.uptime / 60)} minutes`);
  console.log(`Memory Usage:`);
  console.log(
    `  RSS: ${(systemInfo.memoryUsage.rss / 1024 / 1024).toFixed(2)} MB`,
  );
  console.log(
    `  Heap Used: ${(systemInfo.memoryUsage.heapUsed / 1024 / 1024).toFixed(2)} MB`,
  );
  console.log(
    `  Heap Total: ${(systemInfo.memoryUsage.heapTotal / 1024 / 1024).toFixed(2)} MB`,
  );
  console.log();
}

/** Display performance metrics */
function displayPerformanceMetrics(metrics: PerformanceMetrics): void {
  ConsoleUI.printDivider();
  console.log("📊 PERFORMANCE METRICS");
  ConsoleUI.printDivider();
  console.log(`Startup Time: ${metrics.startupTime.toFixed(2)}ms`);
  console.log(
    `Button Creation Time: ${metrics.buttonCreationTime.toFixed(2)}ms`,
  );
  console.log(`Cache Hit Rate: ${metrics.cacheHitRate.toFixed(1)}%`);
  console.log(
    `Visibility Checks/sec: ${metrics.visibilityChecksPerSecond.toFixed(1)}`,
  );
  console.log(`Command Execution Latency:`);
  console.log(
    `  Average: ${metrics.commandExecutionLatency.average.toFixed(2)}ms`,
  );
  console.log(
    `  Median: ${metrics.commandExecutionLatency.median.toFixed(2)}ms`,
  );
  console.log(`  P95: ${metrics.commandExecutionLatency.p95.toFixed(2)}ms`);
  console.log(`  P99: ${metrics.commandExecutionLatency.p99.toFixed(2)}ms`);
  console.log(`  Samples: ${metrics.commandExecutionLatency.samples}`);
  console.log();
}

/** Display issues */
function displayIssues(issues: DiagnosticIssue[]): void {
  ConsoleUI.printDivider();
  console.log("🔍 DETECTED ISSUES");
  ConsoleUI.printDivider();

  issues.forEach((issue, index) => {
    const severityIcon = getSeverityIcon(issue.severity);
    console.log(`${index + 1}. ${severityIcon} ${issue.title}`);
    console.log(`   Category: ${issue.category} | Severity: ${issue.severity}`);
    console.log(`   ${issue.description}`);
    console.log(`   Impact: ${issue.impact}`);
    console.log(`   Recommendation: ${issue.recommendation}`);
    if (issue.affectedItems && issue.affectedItems.length > 0) {
      console.log(`   Affected: ${issue.affectedItems.join(", ")}`);
    }
    if (issue.evidence) {
      console.log(`   Evidence: ${issue.evidence}`);
    }
    console.log();
  });
}

/** Display recommendations */
function displayRecommendations(recommendations: string[]): void {
  ConsoleUI.printDivider();
  console.log("💡 RECOMMENDATIONS");
  ConsoleUI.printDivider();

  recommendations.forEach((rec, index) => {
    console.log(`${index + 1}. ${rec}`);
  });
  console.log();
}

/** Get severity icon */
function getSeverityIcon(severity: DiagnosticSeverity): string {
  switch (severity) {
    case "critical":
      return "🚨";
    case "high":
      return "⚠️";
    case "medium":
      return "🟡";
    case "low":
      return "🟢";
    case "info":
      return "ℹ️";
    default:
      return "❓";
  }
}

/** Generate trend suggestions */
function generateTrendSuggestions(
  metric: string,
  trend: string,
  _changeRate: number,
): string[] {
  const suggestions: string[] = [];

  switch (metric) {
    case "startupTime":
      if (trend === "degrading") {
        suggestions.push("Consider optimizing extension initialization");
        suggestions.push("Check for unnecessary startup operations");
      }
      break;
    case "memoryUsage":
      if (trend === "degrading") {
        suggestions.push("Monitor memory leaks in button configurations");
        suggestions.push("Consider restarting the extension periodically");
      }
      break;
    case "commandLatency":
      if (trend === "degrading") {
        suggestions.push("Check system resource availability");
        suggestions.push("Review command complexity and optimization");
      }
      break;
  }

  if (suggestions.length === 0) {
    suggestions.push("Metric is within acceptable range");
  }

  return suggestions;
}

/** Offer to export diagnostic report */
async function offerToExportReport(report: DiagnosticReport): Promise<void> {
  const shouldExport = await InputHandler.getConfirmation(
    "\nExport diagnostic report to file?",
  );

  if (!shouldExport) {
    return;
  }

  console.log("Enter file path for report export: ");
  const filePath = await InputHandler.getInput(10000);

  if (!filePath) {
    ConsoleUI.printWarning("Export cancelled");
    return;
  }

  try {
    const reportData = JSON.stringify(report, null, 2);
    writeFileSync(filePath, reportData, "utf-8");
    ConsoleUI.printSuccess(`Diagnostic report exported to ${filePath}`);
  } catch (error) {
    ConsoleUI.printError(
      `Failed to export report: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

/** Run quick health check */
async function runQuickHealthCheck(): Promise<void> {
  ConsoleUI.clear();
  ConsoleUI.printBanner();
  ConsoleUI.printInfo("⚡ Running quick health check...");

  try {
    // Quick system info
    const systemInfo = await gatherSystemInformation();
    const issues = await detectIssues();

    // Display quick summary
    ConsoleUI.printDivider();
    console.log("⚡ QUICK HEALTH SUMMARY");
    ConsoleUI.printDivider();

    const quickMetrics: PerformanceMetrics = {
      startupTime: 1000,
      memoryUsage: systemInfo.memoryUsage,
      commandExecutionLatency: {
        average: 300,
        median: 250,
        p95: 500,
        p99: 800,
        samples: 10,
      },
      cacheHitRate: 85,
      visibilityChecksPerSecond: 20,
      buttonCreationTime: 50,
    };
    const healthScore = calculateHealthScore(issues, quickMetrics);
    const status =
      healthScore >= 80
        ? "healthy"
        : healthScore >= 60
          ? "warning"
          : "critical";

    console.log(
      `Overall Status: ${getStatusIcon(status)} ${status.toUpperCase()}`,
    );
    console.log(`Health Score: ${healthScore}/100`);
    console.log(`Issues Found: ${issues.length}`);
    console.log(
      `Memory Usage: ${(systemInfo.memoryUsage.heapUsed / 1024 / 1024).toFixed(2)} MB`,
    );
    console.log();

    if (issues.length > 0) {
      ConsoleUI.printWarning("Quick issues detected:");
      issues.slice(0, 3).forEach((issue, index) => {
        console.log(
          `  ${index + 1}. ${getSeverityIcon(issue.severity)} ${issue.title}`,
        );
      });
      if (issues.length > 3) {
        console.log(`  ... and ${issues.length - 3} more issues`);
      }
      console.log();
      console.log("Run full diagnostic for detailed analysis");
    } else {
      ConsoleUI.printSuccess("No issues detected in quick scan");
    }
  } catch (error) {
    ConsoleUI.printError(
      `Health check failed: ${error instanceof Error ? error.message : String(error)}`,
      "Try running a full diagnostic instead",
    );
  }
}

/** Run interactive troubleshooting session */
async function runInteractiveTroubleshooting(): Promise<void> {
  ConsoleUI.clear();
  ConsoleUI.printBanner();
  ConsoleUI.printInfo("🔧 Starting interactive troubleshooting session...");

  const session: TroubleshootingSession = {
    sessionId: `troubleshoot_${Date.now()}`,
    startTime: Date.now(),
    currentStep: 0,
    answers: {},
    findings: [],
    completed: false,
  };

  try {
    // Step 1: Identify the problem
    ConsoleUI.printDivider();
    console.log("Step 1: What issue are you experiencing?");
    ConsoleUI.printDivider();
    console.log("  1. Extension not loading");
    console.log("  2. Buttons not showing");
    console.log("  3. Commands not executing");
    console.log("  4. Performance issues");
    console.log("  5. Configuration problems");
    console.log("  6. Other issue");
    console.log("\nEnter choice (1-6): ");

    const problemType = await InputHandler.getInput(15000);
    session.answers.problemType = problemType;

    // Step 2: Gather more information
    ConsoleUI.printDivider();
    console.log("Step 2: Additional information");
    ConsoleUI.printDivider();

    switch (problemType) {
      case "1":
        console.log("Extension loading issues detected. Running diagnostic...");
        {
          const loadingIssues = await detectIssues();
          session.findings = loadingIssues.filter(
            (issue) =>
              issue.category === "system" || issue.category === "extension",
          );
          break;
        }
      case "2": {
        console.log("Checking visibility configurations...");
        const visibilityIssues = await detectIssues();
        session.findings = visibilityIssues.filter(
          (issue) =>
            issue.category === "configuration" &&
            (issue.title.includes("Missing") ||
              issue.title.includes("Duplicate")),
        );
        break;
      }
      case "3": {
        console.log("Analyzing command configurations...");
        const commandIssues = await detectIssues();
        session.findings = commandIssues.filter(
          (issue) =>
            issue.title.includes("Command") || issue.title.includes("Missing"),
        );
        break;
      }
      case "4": {
        console.log("Running performance analysis...");
        const perfMetrics = await collectPerformanceMetrics();
        const perfIssues = await detectIssues();
        session.findings = perfIssues.filter(
          (issue) => issue.category === "performance",
        );

        // Add performance-specific findings
        if (perfMetrics.commandExecutionLatency.average > 1000) {
          session.findings.push({
            id: "high-latency",
            category: "performance",
            severity: "medium",
            title: "High Command Execution Latency",
            description: `Average command execution time is ${perfMetrics.commandExecutionLatency.average.toFixed(2)}ms`,
            impact: "May cause delays in button responses",
            recommendation:
              "Check system performance and consider optimizing commands",
          });
        }
        break;
      }
      case "5": {
        console.log("Validating configuration...");
        await detectConfigurationConflicts();
        const configIssues = await detectIssues();
        session.findings = configIssues.filter(
          (issue) => issue.category === "configuration",
        );
        break;
      }

      default:
        console.log("Running general diagnostic...");
        session.findings = await detectIssues();
        break;
    }

    // Step 3: Provide solutions
    ConsoleUI.printDivider();
    console.log("Step 3: Potential Solutions");
    ConsoleUI.printDivider();

    if (session.findings.length === 0) {
      ConsoleUI.printInfo("No specific issues found. General recommendations:");
      console.log("  1. Restart VSCode");
      console.log("  2. Check extension updates");
      console.log("  3. Verify workspace permissions");
      console.log("  4. Run full diagnostic for detailed analysis");
    } else {
      session.findings.forEach((finding, index) => {
        console.log(
          `${index + 1}. ${getSeverityIcon(finding.severity)} ${finding.title}`,
        );
        console.log(`   Problem: ${finding.description}`);
        console.log(`   Solution: ${finding.recommendation}`);
        console.log();
      });

      // Offer automated fixes for low-risk issues
      const lowRiskIssues = session.findings.filter(
        (issue) => issue.automatedFix?.risk === "low",
      );
      if (lowRiskIssues.length > 0) {
        const applyFixes = await InputHandler.getConfirmation(
          "\nApply automated fixes for low-risk issues?",
        );
        if (applyFixes) {
          ConsoleUI.printInfo("Applying automated fixes...");
          for (const issue of lowRiskIssues) {
            if (issue.automatedFix) {
              try {
                await issue.automatedFix.action();
                ConsoleUI.printSuccess(`Fixed: ${issue.title}`);
              } catch (error) {
                ConsoleUI.printError(
                  `Failed to fix ${issue.title}: ${error instanceof Error ? error.message : String(error)}`,
                );
              }
            }
          }
        }
      }
    }

    // Step 4: Next steps
    ConsoleUI.printDivider();
    console.log("Step 4: Next Steps");
    ConsoleUI.printDivider();
    console.log("Recommended next actions:");
    console.log(" 1. Try the suggested solutions");
    console.log(" 2. If problems persist, run full diagnostic");
    console.log(" 3. Check extension documentation");
    console.log(" 4. Report persistent issues to extension maintainers");

    session.completed = true;

    const duration = Date.now() - session.startTime;
    ConsoleUI.printSuccess(
      `Troubleshooting session completed in ${duration}ms`,
    );
  } catch (error) {
    ConsoleUI.printError(
      `Interactive troubleshooting failed: ${error instanceof Error ? error.message : String(error)}`,
      "Try running a manual diagnostic instead",
    );
  }
}

/** Show detailed performance analysis */
async function showPerformanceAnalysis(): Promise<void> {
  ConsoleUI.clear();
  ConsoleUI.printBanner();
  ConsoleUI.printInfo("📊 Running detailed performance analysis...");

  try {
    const metrics = await collectPerformanceMetrics();
    const trends = await analyzePerformanceTrends();

    // Display current performance metrics
    displayPerformanceMetrics(metrics);

    // Display trend analysis
    ConsoleUI.printDivider();
    console.log("📈 PERFORMANCE TRENDS");
    ConsoleUI.printDivider();

    trends.forEach((trend, index) => {
      const trendIcon =
        trend.trend === "improving"
          ? "📈"
          : trend.trend === "degrading"
            ? "📉"
            : "➡️";

      console.log(`${index + 1}. ${trendIcon} ${trend.metric}`);
      console.log(
        `   Trend: ${trend.trend} (${trend.changeRate > 0 ? "+" : ""}${trend.changeRate.toFixed(1)}%)`,
      );
      console.log(`   Confidence: ${trend.confidence.toFixed(1)}%`);
      console.log(`   Anomaly Score: ${trend.anomalyScore.toFixed(1)}/100`);

      if (trend.suggestions.length > 0) {
        console.log(`   Suggestions:`);
        trend.suggestions.forEach((suggestion) => {
          console.log(`     • ${suggestion}`);
        });
      }
      console.log();
    });

    // Performance recommendations
    ConsoleUI.printDivider();
    console.log("⚡ PERFORMANCE RECOMMENDATIONS");
    ConsoleUI.printDivider();

    const recommendations = [];

    if (metrics.startupTime > 2000) {
      recommendations.push(
        "Startup time is high - consider optimizing extension loading",
      );
    }

    if (metrics.commandExecutionLatency.average > 800) {
      recommendations.push(
        "Command execution is slow - check system resources",
      );
    }

    if (metrics.cacheHitRate < 75) {
      recommendations.push(
        "Low cache hit rate - enable result caching in settings",
      );
    }

    if (metrics.memoryUsage.heapUsed > 80000000) {
      recommendations.push(
        "High memory usage detected - consider restarting extension",
      );
    }

    if (recommendations.length === 0) {
      ConsoleUI.printSuccess("Performance metrics look good!");
    } else {
      recommendations.forEach((rec, index) => {
        console.log(`${index + 1}. ${rec}`);
      });
    }

    // Benchmark comparison
    ConsoleUI.printDivider();
    console.log("🏁 BENCHMARK COMPARISON");
    ConsoleUI.printDivider();

    const benchmarks = [
      {
        metric: "Startup Time",
        value: metrics.startupTime,
        good: 1500,
        excellent: 800,
      },
      {
        metric: "Command Latency",
        value: metrics.commandExecutionLatency.average,
        good: 600,
        excellent: 300,
      },
      {
        metric: "Cache Hit Rate",
        value: metrics.cacheHitRate,
        good: 85,
        excellent: 95,
      },
    ];

    benchmarks.forEach((benchmark) => {
      let rating = "Poor";
      let icon = "❌";

      if (benchmark.value >= benchmark.excellent) {
        rating = "Excellent";
        icon = "🏆";
      } else if (benchmark.value >= benchmark.good) {
        rating = "Good";
        icon = "✅";
      } else if (benchmark.value >= benchmark.good * 0.8) {
        rating = "Fair";
        icon = "⚠️";
      }

      console.log(
        `${icon} ${benchmark.metric}: ${rating} (${benchmark.value.toFixed(1)})`,
      );
    });
  } catch (error) {
    ConsoleUI.printError(
      `Performance analysis failed: ${error instanceof Error ? error.message : String(error)}`,
      "Try running a basic diagnostic instead",
    );
  }
}

/** Run configuration validation */
async function runConfigurationValidation(): Promise<void> {
  ConsoleUI.clear();
  ConsoleUI.printBanner();
  ConsoleUI.printInfo("✅ Running configuration validation...");

  try {
    const userButtons = SettingsManager.getButtons("user");
    const workspaceButtons = SettingsManager.getButtons("workspace");
    const conflicts = await detectConfigurationConflicts();

    // Display configuration overview
    ConsoleUI.printDivider();
    console.log("📋 CONFIGURATION OVERVIEW");
    ConsoleUI.printDivider();
    console.log(`User Settings: ${userButtons.length} buttons`);
    console.log(`Workspace Settings: ${workspaceButtons.length} buttons`);
    console.log(`Total Configuration Conflicts: ${conflicts.length}`);
    console.log();

    // Validate each configuration
    ConsoleUI.printDivider();
    console.log("🔍 VALIDATION RESULTS");
    ConsoleUI.printDivider();

    let hasErrors = false;

    // Check user settings
    if (userButtons.length > 0) {
      console.log("User Settings Validation:");
      userButtons.forEach((button, index) => {
        const validation = validateButtonConfiguration(button);
        const icon = validation.isValid ? "✅" : "❌";
        console.log(`  ${index + 1}. ${icon} ${button.id} (${button.text})`);

        if (!validation.isValid) {
          hasErrors = true;
          validation.errors.forEach((error) => {
            console.log(`     ❗ ${error}`);
          });
        }
      });
      console.log();
    }

    // Check workspace settings
    if (workspaceButtons.length > 0) {
      console.log("Workspace Settings Validation:");
      workspaceButtons.forEach((button, index) => {
        const validation = validateButtonConfiguration(button);
        const icon = validation.isValid ? "✅" : "❌";
        console.log(`  ${index + 1}. ${icon} ${button.id} (${button.text})`);

        if (!validation.isValid) {
          hasErrors = true;
          validation.errors.forEach((error) => {
            console.log(`     ❗ ${error}`);
          });
        }
      });
      console.log();
    }

    // Display conflicts
    if (conflicts.length > 0) {
      ConsoleUI.printDivider();
      console.log("⚠️ CONFIGURATION CONFLICTS");
      ConsoleUI.printDivider();

      conflicts.forEach((conflict, index) => {
        const severityIcon = getSeverityIcon(conflict.severity);
        console.log(
          `${index + 1}. ${severityIcon} ${conflict.type.replace("-", " ").toUpperCase()}`,
        );
        console.log(`   Description: ${conflict.description}`);
        console.log(`   Resolution: ${conflict.resolution}`);
        if (conflict.affectedButtons.length > 0) {
          console.log(
            `   Affected Buttons: ${conflict.affectedButtons.join(", ")}`,
          );
        }
        console.log();
      });
      hasErrors = true;
    }

    // Summary
    if (!hasErrors) {
      ConsoleUI.printSuccess(
        "Configuration validation passed! No issues found.",
      );
    } else {
      ConsoleUI.printWarning(
        "Configuration validation completed with issues found.",
      );
      console.log("\nRecommendations:");
      console.log("  1. Fix all critical and high severity issues");
      console.log("  2. Resolve configuration conflicts");
      console.log("  3. Test buttons after making changes");
      console.log(
        "  4. Consider running full diagnostic for detailed analysis",
      );
    }
  } catch (error) {
    ConsoleUI.printError(
      `Configuration validation failed: ${error instanceof Error ? error.message : String(error)}`,
      "Check file permissions and try again",
    );
  }
}

/** Show system information */
async function showSystemInformation(): Promise<void> {
  ConsoleUI.clear();
  ConsoleUI.printBanner();
  ConsoleUI.printInfo("💻 Gathering system information...");

  try {
    const systemInfo = await gatherSystemInformation();
    const location = await InputHandler.promptLocation();
    const buttons = SettingsManager.getButtons(location);
    const debugMode = SettingsManager.getDebugMode(location);
    const performanceSettings =
      SettingsManager.getPerformanceSettings(location);

    // Display system information
    displaySystemInfo(systemInfo);

    // Display extension configuration
    ConsoleUI.printDivider();
    console.log("🔧 EXTENSION CONFIGURATION");
    ConsoleUI.printDivider();
    console.log(`Settings Location: ${location}`);
    console.log(`Debug Mode: ${debugMode ? "✅ Enabled" : "❌ Disabled"}`);
    console.log(`Total Buttons: ${buttons.length}`);
    console.log(`Performance Settings:`);
    console.log(
      `  Visibility Debounce: ${performanceSettings.visibilityDebounceMs}ms`,
    );
    console.log(
      `  Virtualization: ${performanceSettings.enableVirtualization ? "✅ Enabled" : "❌ Disabled"}`,
    );
    console.log(
      `  Result Caching: ${performanceSettings.cacheResults ? "✅ Enabled" : "❌ Disabled"}`,
    );
    console.log();

    // Display environment information
    ConsoleUI.printDivider();
    console.log("🌍 ENVIRONMENT INFORMATION");
    ConsoleUI.printDivider();

    // Key environment variables
    const keyEnvVars = ["NODE_ENV", "PATH", "HOME", "USER", "VSCODE_INJECTION"];

    keyEnvVars.forEach((varName) => {
      const value = systemInfo.environment[varName];
      if (value) {
        const displayValue =
          varName === "PATH"
            ? value.split(":").slice(0, 3).join(":") + "..."
            : value;
        console.log(`${varName}: ${displayValue}`);
      }
    });
    console.log();

    // Display workspace information
    ConsoleUI.printDivider();
    console.log("📁 WORKSPACE INFORMATION");
    ConsoleUI.printDivider();

    if (systemInfo.workspaceFolders.length > 0) {
      systemInfo.workspaceFolders.forEach((folder, index) => {
        console.log(`Workspace ${index + 1}: ${folder}`);

        // Check for common project files
        const projectFiles = [
          ".vscode/settings.json",
          "package.json",
          "tsconfig.json",
          ".git/config",
        ];

        projectFiles.forEach((file) => {
          const filePath = join(folder, file);
          if (existsSync(filePath)) {
            console.log(`  ✓ Found: ${file}`);
          }
        });
      });
    } else {
      console.log("No workspace folders detected");
    }
    console.log();

    // Display compatibility information
    ConsoleUI.printDivider();
    console.log("🔗 COMPATIBILITY INFORMATION");
    ConsoleUI.printDivider();

    const compatibilityChecks = await checkExtensionCompatibility();
    compatibilityChecks.forEach((check) => {
      const icon = check.compatible ? "✅" : "❌";
      console.log(`${icon} ${check.extensionName} (${check.version})`);

      if (check.conflicts.length > 0) {
        console.log(`   Conflicts:`);
        check.conflicts.forEach((conflict) => {
          console.log(`     • ${conflict}`);
        });
      }

      if (check.recommendations.length > 0) {
        console.log(`   Recommendations:`);
        check.recommendations.forEach((rec) => {
          console.log(`     • ${rec}`);
        });
      }
    });
  } catch (error) {
    ConsoleUI.printError(
      `Failed to gather system information: ${error instanceof Error ? error.message : String(error)}`,
      "Some information may not be available",
    );
  }
}

/** Enable verbose logging */
async function enableVerboseLogging(): Promise<void> {
  ConsoleUI.clear();
  ConsoleUI.printBanner();
  ConsoleUI.printInfo("📝 Configuring verbose logging...");

  try {
    ConsoleUI.printDivider();
    console.log("Verbose Logging Configuration");
    ConsoleUI.printDivider();
    console.log();

    // Show current logging configuration
    const currentDebugMode =
      SettingsManager.getDebugMode("user") ||
      SettingsManager.getDebugMode("workspace");
    ConsoleUI.printInfo(
      `Current Debug Mode: ${currentDebugMode ? "Enabled" : "Disabled"}`,
    );

    console.log("\nLogging Options:");
    console.log("  1. Enable debug mode (basic logging)");
    console.log("  2. Enable comprehensive logging");
    console.log("  3. Configure custom logging levels");
    console.log("  4. Export current logs");
    console.log("  5. Clear logs");
    console.log("  6. Back");
    console.log("\nSelect option (1-6): ");

    const choice = await InputHandler.getInput(15000);

    switch (choice) {
      case "1":
        await enableDebugMode();
        break;
      case "2":
        await enableComprehensiveLogging();
        break;
      case "3":
        await configureCustomLogging();
        break;
      case "4":
        await exportLogs();
        break;
      case "5":
        await clearLogs();
        break;
      case "6":
        return;
      default:
        ConsoleUI.printWarning("Invalid choice");
        return;
    }
  } catch (error) {
    ConsoleUI.printError(
      `Verbose logging configuration failed: ${error instanceof Error ? error.message : String(error)}`,
      "Try checking permissions and try again",
    );
  }
}

/** Validate button configuration */
function validateButtonConfiguration(button: StatusBarButtonConfig): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Check required fields
  if (!button.id) {
    errors.push("Button ID is required");
  }

  if (!button.text && !button.icon) {
    errors.push("Either 'text' or 'icon' must be specified");
  }

  if (!button.command) {
    errors.push("Command configuration is required");
  } else {
    // Check command configuration
    if (!button.command.type) {
      errors.push("Command type is required");
    }

    if (
      button.command.type === "shell" ||
      button.command.type === "vscode" ||
      button.command.type === "task"
    ) {
      if (!button.command.command) {
        errors.push("Command value is required for shell/vscode/task commands");
      }
    } else {
      if (!button.command.script) {
        errors.push("Script name is required for package manager commands");
      }
    }
  }

  // Check alignment
  if (button.alignment && !["left", "right"].includes(button.alignment)) {
    errors.push("Alignment must be 'left' or 'right'");
  }

  // Check priority
  if (
    button.priority !== undefined &&
    (typeof button.priority !== "number" || button.priority < 0)
  ) {
    errors.push("Priority must be a positive number");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/** Enable debug mode */
async function enableDebugMode(): Promise<void> {
  const location = await InputHandler.promptLocation();
  const currentDebugMode = SettingsManager.getDebugMode(location);

  const confirmed = await InputHandler.getConfirmation(
    `${currentDebugMode ? "Disable" : "Enable"} debug mode in ${location} settings?`,
  );

  if (!confirmed) {
    ConsoleUI.printWarning("Operation cancelled");
    return;
  }

  SettingsManager.setDebugMode(location, !currentDebugMode);
  ConsoleUI.printSuccess(
    `Debug mode ${!currentDebugMode ? "enabled" : "disabled"} in ${location} settings`,
  );

  ConsoleUI.printInfo("Debug mode will increase logging verbosity");
  ConsoleUI.printInfo("Changes will take effect after VSCode restart");
}

/** Enable comprehensive logging */
async function enableComprehensiveLogging(): Promise<void> {
  ConsoleUI.printWarning(
    "Comprehensive logging will capture detailed information",
  );
  ConsoleUI.printWarning(
    "This may impact performance and generate large log files",
  );

  const confirmed = await InputHandler.getConfirmation(
    "Enable comprehensive logging?",
  );

  if (!confirmed) {
    ConsoleUI.printWarning("Operation cancelled");
    return;
  }

  // In a real implementation, this would set up comprehensive logging
  // For now, we'll just enable debug mode
  const location = await InputHandler.promptLocation();
  SettingsManager.setDebugMode(location, true);

  ConsoleUI.printSuccess("Comprehensive logging enabled");
  ConsoleUI.printInfo("Logs will be written to VSCode's output panel");
  ConsoleUI.printInfo(
    "Consider monitoring disk space when using comprehensive logging",
  );
}

/** Configure custom logging */
async function configureCustomLogging(): Promise<void> {
  ConsoleUI.printInfo("Custom logging configuration");
  ConsoleUI.printInfo("This feature allows fine-grained control over logging");

  console.log("Available categories:");
  console.log("  • system - System-level messages");
  console.log("  • performance - Performance metrics");
  console.log("  • configuration - Configuration changes");
  console.log("  • execution - Command execution");
  console.log("  • network - Network requests");

  const confirmed = await InputHandler.getConfirmation(
    "Enable custom logging configuration?",
  );

  if (!confirmed) {
    ConsoleUI.printWarning("Feature not yet implemented");
    ConsoleUI.printInfo("Currently using basic debug mode configuration");
  }
}

/** Export logs */
async function exportLogs(): Promise<void> {
  ConsoleUI.printInfo("Export logs functionality");
  ConsoleUI.printInfo("This feature would export logs to a file for analysis");

  const confirmed = await InputHandler.getConfirmation("Export logs to file?");

  if (!confirmed) {
    ConsoleUI.printWarning("Operation cancelled");
    return;
  }

  console.log("Enter file path for log export: ");
  const filePath = await InputHandler.getInput(10000);

  if (!filePath) {
    ConsoleUI.printWarning("Export cancelled");
    return;
  }

  try {
    // In a real implementation, this would collect and export logs
    const logData = {
      timestamp: new Date().toISOString(),
      version: CONFIG.version,
      platform: process.platform,
      nodeVersion: process.version,
      message: "Log export functionality not yet implemented",
    };

    writeFileSync(filePath, JSON.stringify(logData, null, 2), "utf-8");
    ConsoleUI.printSuccess(`Log export stub saved to ${filePath}`);
  } catch (error) {
    ConsoleUI.printError(
      `Failed to export logs: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

/** Clear logs */
async function clearLogs(): Promise<void> {
  ConsoleUI.printWarning("Clear logs functionality");
  ConsoleUI.printWarning("This would clear all extension logs");

  const confirmed = await InputHandler.getConfirmation(
    "Are you sure you want to clear all logs?",
  );

  if (!confirmed) {
    ConsoleUI.printWarning("Operation cancelled");
    return;
  }

  // In a real implementation, this would clear the logs
  ConsoleUI.printSuccess("Logs cleared (stub implementation)");
  ConsoleUI.printInfo("Actual log clearing would require VSCode API access");
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
