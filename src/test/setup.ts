/**
 * Global test setup
 * This file runs before all tests to configure the test environment
 */

import { mock } from "bun:test";
import { promisify as actualPromisify } from "util";
import { vscode } from "./mocks/vscode";
import { childProcess, execPromise } from "./mocks/child-process";

// Set test environment variables
process.env.NODE_ENV = "test";
process.env.VSCODE_TEST_MODE = "true";

// Global test timeout (reserved for future use)
const _DEFAULT_TIMEOUT = 5000;

// Mock VSCode module globally before any tests run
mock.module("vscode", () => ({ default: vscode, ...vscode }));

// Mock child_process module globally for command execution tests
mock.module("child_process", () => ({
  default: childProcess,
  ...childProcess,
}));

// Mock util.promisify to return our execPromise directly
mock.module("util", () => ({
  promisify: (fn: any) => {
    // If promisifying exec, return our execPromise
    if (fn === childProcess.exec || fn.name === "exec") {
      return execPromise;
    }
    // Otherwise use the real promisify
    return actualPromisify(fn);
  },
}));

// Mock console methods in test mode to reduce noise (optional)
const originalConsoleLog = console.log;
const originalConsoleError = console.error;

// Restore console on exit
process.on("exit", () => {
  console.log = originalConsoleLog;
  console.error = originalConsoleError;
});
