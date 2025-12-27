/**
 * TypeScript type definitions for StatusBar Quick Actions Extension
 */

import * as vscode from "vscode";

/**
 * Button command configuration
 */
export interface ButtonCommand {
  type:
    | "npm"
    | "yarn"
    | "pnpm"
    | "bun"
    | "shell"
    | "github"
    | "vscode"
    | "task"
    | "bunx"
    | "npx"
    | "pnpx"
    | "detect";
  script?: string;
  command?: string;
  args?: string[];
}

/**
 * Icon configuration
 */
export interface IconConfig {
  id: string;
  animation?: "spin" | "pulse" | null;
  library?: "vscode" | "material";
  variant?: "outlined" | "filled" | "rounded" | "sharp" | "two-tone";
  size?: "small" | "medium" | "large";
}

/**
 * Button colors
 */
export interface ButtonColors {
  foreground?: string;
  background?: string;
}

/**
 * Execution behavior configuration
 */
export interface ExecutionConfig {
  foreground?: boolean;
  showProgress?: boolean;
  timeout?: number;
  notifications?: {
    showSuccess?: boolean;
    showError?: boolean;
    showOutput?: boolean;
  };
}

/**
 * Visibility condition
 */
export interface VisibilityCondition {
  type: "fileType" | "fileExists" | "gitStatus" | "workspaceFolder";
  patterns?: string[];
  path?: string;
  status?: "repository" | "clean" | "dirty" | "ahead" | "behind";
  folders?: string[];
  invert?: boolean;
}

/**
 * Visibility configuration
 */
export interface VisibilityConfig {
  conditions: VisibilityCondition[];
  debounceMs?: number;
}

/**
 * History tracking configuration
 */
export interface HistoryConfig {
  enabled?: boolean;
  maxEntries?: number;
}

/**
 * Output panel configuration
 */
export interface OutputPanelConfig {
  enabled: boolean;
  mode: "per-button" | "shared";
  format: "raw" | "formatted" | "ansi";
  clearOnRun: boolean;
  showTimestamps: boolean;
  preserveHistory: boolean;
  maxLines: number;
}

/**
 * Performance configuration
 */
export interface PerformanceConfig {
  visibilityDebounceMs: number;
  enableVirtualization: boolean;
  cacheResults: boolean;
}

/**
 * Theme color configuration
 */
export interface ThemeColorConfig {
  foreground: string;
  background: string;
}

/**
 * Theme configuration
 */
export interface ThemeConfig {
  mode: "auto" | "dark" | "light" | "highContrast";
  dark: {
    button: ThemeColorConfig;
    executing: ThemeColorConfig;
    error: ThemeColorConfig;
  };
  light: {
    button: ThemeColorConfig;
    executing: ThemeColorConfig;
    error: ThemeColorConfig;
  };
  highContrast: {
    button: ThemeColorConfig;
    executing: ThemeColorConfig;
    error: ThemeColorConfig;
  };
}

/**
 * Notification configuration
 */
export interface NotificationConfig {
  showSuccess: boolean;
  showError: boolean;
  showProgress: boolean;
  position: "top-left" | "top-right" | "bottom-left" | "bottom-right";
  duration: number;
  includeOutput: boolean;
}

/**
 * Button state interface
 */
export interface ButtonState {
  item: vscode.StatusBarItem;
  config: StatusBarButtonConfig;
  isExecuting: boolean;
  lastResult?: ExecutionResult;
  history: ExecutionResult[];
  accessibility: {
    role: string;
    ariaLabel: string;
    focusOrder: number;
  };
}

/**
 * StatusBar button configuration
 */
export interface StatusBarButtonConfig {
  id: string;
  text: string;
  tooltip?: string;
  icon?: IconConfig;
  command: ButtonCommand;
  enabled?: boolean;
  alignment?: "left" | "right";
  priority?: number;
  colors?: ButtonColors;
  execution?: ExecutionConfig;
  visibility?: VisibilityConfig;
  workingDirectory?: string;
  environment?: Record<string, string>;
  history?: HistoryConfig;
}

/**
 * Extension configuration
 */
export interface ExtensionConfig {
  buttons: StatusBarButtonConfig[];
  theme?: ThemeConfig;
  notifications?: NotificationConfig;
  history: boolean;
  autoDetect: boolean;
  settings?: {
    debug?: boolean;
    accessibility?: {
      keyboardNavigation?: boolean;
      highContrast?: boolean;
    };
    output?: OutputPanelConfig;
    performance?: PerformanceConfig;
    icons?: {
      library: "vscode" | "material";
      defaultVariant: string;
      defaultSize: string;
    };
  };
}

/**
 * Command execution result
 */
export interface ExecutionResult {
  code: number;
  stdout: string;
  stderr: string;
  duration: number;
  timestamp: Date;
  command: string;
}

/**
 * Command history entry
 */
export interface CommandHistoryEntry {
  id: string;
  buttonId: string;
  result: ExecutionResult;
  command: string;
}

/**
 * Execution options
 */
export interface ExecutionOptions {
  workingDirectory?: string;
  environment?: Record<string, string>;
  timeout?: number;
  streaming?: {
    enabled: boolean;
    onStdout?: (data: string) => void;
    onStderr?: (data: string) => void;
    onProgress?: (percent: number) => void;
  };
}

/**
 * Visibility context
 */
export interface VisibilityContext {
  activeFile?: vscode.Uri;
  activeFileName?: string;
  activeFileExtension?: string;
  workspaceFolders?: vscode.WorkspaceFolder[];
  gitStatus?: {
    repository: boolean;
    clean: boolean;
    ahead: boolean;
    behind: boolean;
  };
}

/**
 * Notification types
 */
export type NotificationType =
  | "success"
  | "error"
  | "warning"
  | "info"
  | "progress";

/**
 * Progress notification data
 */
export interface ProgressNotification {
  increment?: number;
  message?: string;
}

/**
 * Configuration validation result
 */
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Menu category for nested settings
 */
export interface MenuCategory {
  id: string;
  label: string;
  icon: string;
  description: string;
  items: MenuCategoryItem[];
}

/**
 * Menu category item
 */
export interface MenuCategoryItem {
  id: string;
  label: string;
  description?: string;
  action: () => Promise<void>;
}

/**
 * Button event types
 */
export type ButtonEvent = "click" | "hover" | "focus" | "blur";
