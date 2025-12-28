/**
 * Test fixtures for button configurations
 * Provides sample button configurations for testing
 */

import type {
  StatusBarButtonConfig,
  ExtensionConfig,
  ExecutionResult,
} from "../../types";

/**
 * Minimal valid button configuration
 */
export const minimalButton: StatusBarButtonConfig = {
  id: "test-button-1",
  text: "Test Button",
  command: {
    type: "shell",
    command: "echo 'Hello World'",
  },
};

/**
 * Full-featured button configuration
 */
export const fullFeaturedButton: StatusBarButtonConfig = {
  id: "test-button-full",
  text: "$(rocket) Build",
  tooltip: "Build the project",
  icon: {
    id: "rocket",
    animation: "spin",
  },
  command: {
    type: "npm",
    script: "build",
    args: ["--production"],
  },
  enabled: true,
  alignment: "left",
  priority: 100,
  colors: {
    foreground: "#00ff00",
    background: "#000000",
  },
  execution: {
    foreground: false,
    showProgress: true,
    timeout: 30000,
    notifications: {
      showSuccess: true,
      showError: true,
      showOutput: false,
    },
  },
  visibility: {
    conditions: [
      {
        type: "fileType",
        patterns: ["*.ts", "*.js"],
      },
      {
        type: "gitStatus",
        status: "repository",
      },
    ],
  },
  workingDirectory: "/workspace",
  environment: {
    NODE_ENV: "production",
  },
  history: {
    enabled: true,
    maxEntries: 20,
  },
};

/**
 * Button with different command types
 */
export const npmButton: StatusBarButtonConfig = {
  id: "npm-test",
  text: "NPM Test",
  command: {
    type: "npm",
    script: "test",
  },
};

export const yarnButton: StatusBarButtonConfig = {
  id: "yarn-build",
  text: "Yarn Build",
  command: {
    type: "yarn",
    script: "build",
  },
};

export const bunButton: StatusBarButtonConfig = {
  id: "bun-dev",
  text: "Bun Dev",
  command: {
    type: "bun",
    script: "dev",
  },
};

export const shellButton: StatusBarButtonConfig = {
  id: "shell-ls",
  text: "List Files",
  command: {
    type: "shell",
    command: "ls -la",
  },
};

export const vscodeButton: StatusBarButtonConfig = {
  id: "vscode-cmd",
  text: "Open Settings",
  command: {
    type: "vscode",
    command: "workbench.action.openSettings",
  },
};

export const taskButton: StatusBarButtonConfig = {
  id: "task-build",
  text: "Run Task",
  command: {
    type: "task",
    command: "build",
  },
};

export const detectButton: StatusBarButtonConfig = {
  id: "detect-build",
  text: "Auto Build",
  command: {
    type: "detect",
    script: "build",
  },
};

/**
 * Button with visibility conditions
 */
export const visibilityButton: StatusBarButtonConfig = {
  id: "visibility-test",
  text: "Conditional Button",
  command: {
    type: "shell",
    command: "echo 'visible'",
  },
  visibility: {
    conditions: [
      {
        type: "fileType",
        patterns: ["*.ts", "*.tsx"],
      },
      {
        type: "fileExists",
        path: "package.json",
      },
      {
        type: "gitStatus",
        status: "repository",
      },
      {
        type: "workspaceFolder",
        folders: ["my-project"],
      },
    ],
  },
};

/**
 * Button with inverted visibility conditions
 */
export const invertedVisibilityButton: StatusBarButtonConfig = {
  id: "inverted-visibility",
  text: "Inverted Conditional",
  command: {
    type: "shell",
    command: "echo 'inverted'",
  },
  visibility: {
    conditions: [
      {
        type: "fileType",
        patterns: ["*.md"],
        invert: true, // Show when NOT a markdown file
      },
    ],
  },
};

/**
 * Disabled button
 */
export const disabledButton: StatusBarButtonConfig = {
  id: "disabled-button",
  text: "Disabled",
  command: {
    type: "shell",
    command: "echo 'disabled'",
  },
  enabled: false,
};

/**
 * Button with custom environment variables
 */
export const envButton: StatusBarButtonConfig = {
  id: "env-button",
  text: "Environment Test",
  command: {
    type: "shell",
    command: "echo $CUSTOM_VAR",
  },
  environment: {
    CUSTOM_VAR: "test-value",
    NODE_ENV: "test",
  },
};

/**
 * Complete extension configuration for testing
 */
export const testExtensionConfig: ExtensionConfig = {
  buttons: [
    minimalButton,
    fullFeaturedButton,
    npmButton,
    yarnButton,
    bunButton,
    shellButton,
    vscodeButton,
  ],
  history: true,
  autoDetect: true,
  settings: {
    debug: false,
    accessibility: {
      keyboardNavigation: true,
      highContrast: false,
    },
    output: {
      enabled: true,
      mode: "per-button",
      format: "formatted",
      clearOnRun: false,
      showTimestamps: true,
      preserveHistory: true,
      maxLines: 1000,
    },
    performance: {
      visibilityDebounceMs: 300,
      enableVirtualization: false,
      cacheResults: true,
    },
  },
};

/**
 * Minimal extension configuration
 */
export const minimalExtensionConfig: ExtensionConfig = {
  buttons: [minimalButton],
  history: true,
  autoDetect: false,
};

/**
 * Empty extension configuration
 */
export const emptyExtensionConfig: ExtensionConfig = {
  buttons: [],
  history: false,
  autoDetect: false,
};

/**
 * Mock execution results for testing
 */
export const successfulExecution: ExecutionResult = {
  code: 0,
  stdout: "Command executed successfully",
  stderr: "",
  duration: 150,
  timestamp: new Date("2024-01-01T12:00:00Z"),
  command: "npm run build",
};

export const failedExecution: ExecutionResult = {
  code: 1,
  stdout: "",
  stderr: "Error: Command failed",
  duration: 100,
  timestamp: new Date("2024-01-01T12:00:00Z"),
  command: "npm run test",
};

export const timeoutExecution: ExecutionResult = {
  code: -1,
  stdout: "Partial output...",
  stderr: "Command timed out after 30000ms",
  duration: 30000,
  timestamp: new Date("2024-01-01T12:00:00Z"),
  command: "npm run long-task",
};

/**
 * Collection of all button fixtures
 */
export const allButtonFixtures = {
  minimal: minimalButton,
  fullFeatured: fullFeaturedButton,
  npm: npmButton,
  yarn: yarnButton,
  bun: bunButton,
  shell: shellButton,
  vscode: vscodeButton,
  task: taskButton,
  detect: detectButton,
  visibility: visibilityButton,
  invertedVisibility: invertedVisibilityButton,
  disabled: disabledButton,
  env: envButton,
};

/**
 * Collection of all config fixtures
 */
export const allConfigFixtures = {
  test: testExtensionConfig,
  minimal: minimalExtensionConfig,
  empty: emptyExtensionConfig,
};

/**
 * Collection of all execution result fixtures
 */
export const allExecutionFixtures = {
  success: successfulExecution,
  failed: failedExecution,
  timeout: timeoutExecution,
};
