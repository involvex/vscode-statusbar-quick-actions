/**
 * Test utilities and helper functions
 * Provides common testing utilities for all test suites
 */

import {
  MockExtensionContext,
  MockWorkspaceConfiguration,
} from "../mocks/vscode";
import type { StatusBarButtonConfig, ExecutionResult } from "../../types";

/**
 * Create a mock ExtensionContext for testing
 */
export function createMockContext(): MockExtensionContext {
  return new MockExtensionContext();
}

/**
 * Create a mock workspace configuration with default values
 */
export function createMockConfiguration(
  initialConfig?: Record<string, any>,
): MockWorkspaceConfiguration {
  const config = new MockWorkspaceConfiguration();

  if (initialConfig) {
    Object.entries(initialConfig).forEach(([key, value]) => {
      config.setConfig(key, value);
    });
  }

  return config;
}

/**
 * Wait for a specified amount of time (for async operations)
 */
export function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Wait for a condition to be true (polling)
 */
export async function waitFor(
  condition: () => boolean,
  timeout = 5000,
  interval = 100,
): Promise<void> {
  const startTime = Date.now();

  while (!condition()) {
    if (Date.now() - startTime > timeout) {
      throw new Error(`Timeout waiting for condition after ${timeout}ms`);
    }
    await wait(interval);
  }
}

/**
 * Create a mock button with default values
 */
export function createMockButton(
  overrides?: Partial<StatusBarButtonConfig>,
): StatusBarButtonConfig {
  return {
    id: `test-button-${Date.now()}`,
    text: "Test Button",
    command: {
      type: "shell",
      command: "echo 'test'",
    },
    enabled: true,
    alignment: "left",
    priority: 100,
    ...overrides,
  };
}

/**
 * Create a mock execution result
 */
export function createMockExecutionResult(
  overrides?: Partial<ExecutionResult>,
): ExecutionResult {
  return {
    code: 0,
    stdout: "Success",
    stderr: "",
    duration: 100,
    timestamp: new Date(),
    command: "test command",
    ...overrides,
  };
}

/**
 * Assert that two objects are deeply equal
 */
export function deepEqual<T>(actual: T, expected: T, message?: string): void {
  const actualJson = JSON.stringify(actual, null, 2);
  const expectedJson = JSON.stringify(expected, null, 2);

  if (actualJson !== expectedJson) {
    throw new Error(
      message ||
        `Objects are not equal:\nExpected: ${expectedJson}\nActual: ${actualJson}`,
    );
  }
}

/**
 * Assert that a value is truthy
 */
export function assert(value: unknown, message?: string): asserts value {
  if (!value) {
    throw new Error(message || `Assertion failed: ${value}`);
  }
}

/**
 * Assert that two values are equal
 */
export function assertEqual<T>(actual: T, expected: T, message?: string): void {
  if (actual !== expected) {
    throw new Error(message || `Expected ${expected}, but got ${actual}`);
  }
}

/**
 * Assert that an array contains a specific value
 */
export function assertContains<T>(
  array: T[],
  value: T,
  message?: string,
): void {
  if (!array.includes(value)) {
    throw new Error(message || `Array does not contain ${value}`);
  }
}

/**
 * Assert that an error is thrown
 */
export async function assertThrows(
  fn: () => unknown | Promise<unknown>,
  message?: string,
): Promise<Error> {
  try {
    await fn();
    throw new Error(message || "Expected function to throw, but it didn't");
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.includes("Expected function to throw")
    ) {
      throw error;
    }
    return error as Error;
  }
}

/**
 * Assert that an error is NOT thrown
 */
export async function assertDoesNotThrow(
  fn: () => unknown | Promise<unknown>,
  message?: string,
): Promise<void> {
  try {
    await fn();
  } catch (error) {
    throw new Error(
      message || `Expected function not to throw, but it threw: ${error}`,
    );
  }
}

/**
 * Create a spy function that tracks calls
 */
export function createSpy<T extends (...args: unknown[]) => unknown>(
  implementation?: T,
): T & { calls: unknown[][]; callCount: number; reset: () => void } {
  const calls: unknown[][] = [];

  const spy = ((...args: unknown[]) => {
    calls.push(args);
    return implementation?.(...args);
  }) as T & { calls: unknown[][]; callCount: number; reset: () => void };

  Object.defineProperty(spy, "calls", {
    get: () => calls,
  });

  Object.defineProperty(spy, "callCount", {
    get: () => calls.length,
  });

  spy.reset = () => {
    calls.length = 0;
  };

  return spy;
}

/**
 * Measure execution time of a function
 */
export async function measureTime<T>(
  fn: () => Promise<T> | T,
): Promise<{ result: T; duration: number }> {
  const start = Date.now();
  const result = await fn();
  const duration = Date.now() - start;

  return { result, duration };
}

/**
 * Generate a unique ID for testing
 */
export function generateId(prefix = "test"): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Mock Date.now() for consistent timestamps in tests
 */
export function mockDateNow(fixedTimestamp?: number): () => void {
  const original = Date.now;
  const fixed = fixedTimestamp || Date.now();

  Date.now = () => fixed;

  return () => {
    Date.now = original;
  };
}

/**
 * Create a mock timer for testing time-based functionality
 */
export class MockTimer {
  private timers = new Map<symbol, { callback: () => void; delay: number }>();
  private currentTime = 0;

  setTimeout(callback: () => void, delay: number): symbol {
    const id = Symbol("timer");
    this.timers.set(id, { callback, delay: this.currentTime + delay });
    return id;
  }

  clearTimeout(id: symbol): void {
    this.timers.delete(id);
  }

  tick(ms: number): void {
    this.currentTime += ms;

    for (const [id, timer] of this.timers.entries()) {
      if (timer.delay <= this.currentTime) {
        timer.callback();
        this.timers.delete(id);
      }
    }
  }

  reset(): void {
    this.timers.clear();
    this.currentTime = 0;
  }
}

/**
 * Helper to test performance benchmarks
 */
export class PerformanceTester {
  private measurements = new Map<string, number[]>();

  async measure<T>(
    name: string,
    fn: () => Promise<T> | T,
    iterations = 1,
  ): Promise<{ avg: number; min: number; max: number; results: T[] }> {
    const times: number[] = [];
    const results: T[] = [];

    for (let i = 0; i < iterations; i++) {
      const { result, duration } = await measureTime(fn);
      times.push(duration);
      results.push(result);
    }

    this.measurements.set(name, times);

    return {
      avg: times.reduce((a, b) => a + b, 0) / times.length,
      min: Math.min(...times),
      max: Math.max(...times),
      results,
    };
  }

  getResults(name: string): number[] | undefined {
    return this.measurements.get(name);
  }

  clear(): void {
    this.measurements.clear();
  }

  assertPerformance(name: string, maxAvgMs: number, message?: string): void {
    const times = this.measurements.get(name);
    if (!times) {
      throw new Error(`No measurements found for "${name}"`);
    }

    const avg = times.reduce((a, b) => a + b, 0) / times.length;

    if (avg > maxAvgMs) {
      throw new Error(
        message ||
          `Performance assertion failed for "${name}": average ${avg}ms exceeds maximum ${maxAvgMs}ms`,
      );
    }
  }
}

/**
 * Helper to capture console output during tests
 */
export class ConsoleCapture {
  private originalLog: typeof console.log;
  private originalError: typeof console.error;
  private originalWarn: typeof console.warn;
  private logs: string[] = [];
  private errors: string[] = [];
  private warnings: string[] = [];

  constructor() {
    this.originalLog = console.log;
    this.originalError = console.error;
    this.originalWarn = console.warn;
  }

  start(): void {
    console.log = (...args: unknown[]) => {
      this.logs.push(args.map(String).join(" "));
    };

    console.error = (...args: unknown[]) => {
      this.errors.push(args.map(String).join(" "));
    };

    console.warn = (...args: unknown[]) => {
      this.warnings.push(args.map(String).join(" "));
    };
  }

  stop(): void {
    console.log = this.originalLog;
    console.error = this.originalError;
    console.warn = this.originalWarn;
  }

  getLogs(): string[] {
    return [...this.logs];
  }

  getErrors(): string[] {
    return [...this.errors];
  }

  getWarnings(): string[] {
    return [...this.warnings];
  }

  clear(): void {
    this.logs = [];
    this.errors = [];
    this.warnings = [];
  }
}
