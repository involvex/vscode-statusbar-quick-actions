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
  dynamicLabel?: DynamicLabelField; // Dynamic label configuration
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

/**
 * Dynamic label field configuration
 */
export interface DynamicLabelField {
  type: "time" | "url" | "env" | "git" | "custom";
  format?: string; // For time: date-time format string
  url?: string; // For url: URL to fetch from
  envVar?: string; // For env: environment variable name
  gitInfo?: "branch" | "status" | "remote"; // For git: git information type
  customFunction?: string; // For custom: function name to evaluate
  refreshInterval?: number; // Refresh interval in milliseconds (0 = no auto-refresh)
  fallback?: string; // Fallback value if evaluation fails
  template?: string; // Template string with ${placeholder} syntax
}

/**
 * Preset configuration for button sets
 */
export interface PresetConfig {
  id: string;
  name: string;
  description?: string;
  buttons: StatusBarButtonConfig[];
  theme?: ThemeConfig;
  metadata?: {
    created: Date;
    modified: Date;
    author?: string;
    tags?: string[];
  };
}

/**
 * Preset application mode
 */
export type PresetApplicationMode = "replace" | "merge" | "append";

/**
 * Dynamic label state
 */
export interface DynamicLabelState {
  fieldConfig: DynamicLabelField;
  lastValue: string;
  lastUpdated: Date;
  refreshTimer?: NodeJS.Timeout;
  error?: string;
}

/**
 * Diagnostic issue severity levels
 */
export type DiagnosticSeverity = "error" | "warning" | "info" | "performance";

/**
 * Diagnostic issue category
 */
export type DiagnosticCategory =
  | "configuration"
  | "performance"
  | "compatibility"
  | "memory"
  | "startup"
  | "execution"
  | "validation"
  | "extension";

/**
 * Configuration validation issue
 */
export interface DiagnosticIssue {
  id: string;
  category: DiagnosticCategory;
  severity: DiagnosticSeverity;
  title: string;
  description: string;
  affectedButtons?: string[];
  autoFixable?: boolean;
  fixAction?: () => Promise<void>;
  recommendation?: string;
  code?: string;
  details?: Record<string, unknown>;
}

/**
 * Performance metrics for extension operations
 */
export interface PerformanceMetrics {
  startupTime: number; // milliseconds
  memoryUsage: {
    used: number; // bytes
    total: number; // bytes
    percentage: number;
  };
  commandExecutionLatency: {
    average: number;
    min: number;
    max: number;
    last: number;
    samples: number;
  };
  configurationLoadTime: number;
  buttonCreationTime: number;
  historyQueriesPerMinute: number;
  cacheHitRate: number;
  timestamp: Date;
}

/**
 * Diagnostic context and environment information
 */
export interface DiagnosticContext {
  extensionVersion: string;
  vscodeVersion: string;
  platform: string;
  architecture: string;
  workspacePath?: string;
  userSettings: Record<string, unknown>;
  workspaceSettings: Record<string, unknown>;
  installedExtensions: string[];
  activeExtensions: string[];
  buttonCount: number;
  configurationSize: number; // bytes
  workspaceFolders: number;
  timestamp: Date;
}

/**
 * Performance trend analysis
 */
export interface TrendAnalysis {
  metric: string;
  direction: "improving" | "degrading" | "stable";
  changePercent: number;
  confidence: number; // 0-1
  period: string; // e.g., "24h", "7d"
  baseline?: number;
  currentValue: number;
  description: string;
}

/**
 * Performance anomaly detection result
 */
export interface AnomalyDetection {
  metric: string;
  isAnomaly: boolean;
  anomalyScore: number; // 0-1
  severity: "low" | "medium" | "high" | "critical";
  description: string;
  expectedRange: {
    min: number;
    max: number;
  };
  actualValue: number;
  timestamp: Date;
  recommendation?: string;
}

/**
 * Complete diagnostic report
 */
export interface DiagnosticReport {
  id: string;
  timestamp: Date;
  context: DiagnosticContext;
  issues: DiagnosticIssue[];
  performance: PerformanceMetrics;
  trends: TrendAnalysis[];
  anomalies: AnomalyDetection[];
  recommendations: string[];
  summary: {
    totalIssues: number;
    criticalIssues: number;
    autoFixableIssues: number;
    performanceScore: number; // 0-100
    healthStatus: "excellent" | "good" | "fair" | "poor" | "critical";
    requiresRestart?: boolean;
  };
}

/**
 * Doctor command options
 */
export interface DoctorOptions {
  verbose?: boolean;
  interactive?: boolean;
  exportReport?: boolean;
  fixIssues?: boolean;
  performanceTest?: boolean;
  includeTrends?: boolean;
  includeAnomalies?: boolean;
  outputPath?: string;
  categories?: DiagnosticCategory[];
}

/**
 * System information for diagnostics
 */
export interface SystemInfo {
  os: {
    platform: string;
    release: string;
    arch: string;
    type: string;
  };
  node: {
    version: string;
    arch: string;
    platform: string;
  };
  vscode: {
    version: string;
    commit: string;
    date: string;
    electronVersion: string;
    architecture: string;
  };
  memory: {
    total: number;
    free: number;
    used: number;
    percentage: number;
  };
  cpu: {
    model: string;
    speed: number;
    count: number;
  };
}

/**
 * Git API interface for VS Code Git extension
 */
export interface GitApi {
  git: {
    exec: (args: string[]) => Promise<{ stdout: string; stderr: string }>;
  };
}
