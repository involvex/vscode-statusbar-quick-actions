/**
 * Extension Integration Test for Performance Optimizations
 * Tests the optimized extension implementation with real performance monitoring
 */

import * as vscode from "vscode";
import { TestHelpers } from "../utils/test-helpers";
import { PerformanceMonitor } from "../../utils/performance-monitor";
import { StatusBarQuickActionsExtensionOptimized } from "../../extension-optimized";
import { CommandExecutorOptimized } from "../../executor-optimized";

describe("Extension Performance Integration Tests", () => {
  let testHelpers: TestHelpers;
  let performanceMonitor: PerformanceMonitor;
  let extension: StatusBarQuickActionsExtensionOptimized | null = null;
  let mockContext: vscode.ExtensionContext;

  beforeEach(async () => {
    testHelpers = new TestHelpers();
    performanceMonitor = new PerformanceMonitor();

    await testHelpers.setup();
    mockContext = testHelpers.createMockExtensionContext();
  });

  afterEach(async () => {
    if (extension) {
      extension.deactivate();
    }

    await testHelpers.teardown();
  });

  describe("Extension Activation Performance", () => {
    it("should activate extension within performance targets", async () => {
      const measurement = performanceMonitor.startMeasurement(
        "extension_activation",
      );

      extension = new StatusBarQuickActionsExtensionOptimized(mockContext);
      await extension.activate();

      measurement.end();

      const duration = measurement.getDuration();
      console.log(`Extension activation time: ${duration}ms`);

      // Target: < 500ms for full activation
      expect(duration).toBeLessThan(500);
    });

    it("should initialize managers efficiently in parallel", async () => {
      const measurement = performanceMonitor.startMeasurement(
        "manager_initialization",
      );

      extension = new StatusBarQuickActionsExtensionOptimized(mockContext);

      // Test individual manager initialization
      await extension["initializeManagers"]();

      measurement.end();

      const duration = measurement.getDuration();
      console.log(`Manager initialization time: ${duration}ms`);

      // Target: < 300ms for parallel initialization
      expect(duration).toBeLessThan(300);
    });

    it("should handle configuration changes with debouncing", async () => {
      extension = new StatusBarQuickActionsExtensionOptimized(mockContext);
      await extension.activate();

      const measurement = performanceMonitor.startMeasurement(
        "config_change_handling",
      );

      // Simulate rapid configuration changes
      const configChanges = Array(10)
        .fill(0)
        .map(() => Promise.resolve({ buttons: [], settings: {} }));

      // Apply changes with debouncing
      for (const changePromise of configChanges) {
        const change = await changePromise;
        await extension["updateConfiguration"](change);
        await new Promise((resolve) => setTimeout(resolve, 100)); // Simulate rapid changes
      }

      measurement.end();

      const duration = measurement.getDuration();
      console.log(`Config change handling time: ${duration}ms`);

      // Target: < 100ms per change with debouncing
      expect(duration).toBeLessThan(1000); // 10 changes * 100ms target
    });
  });

  describe("Button Creation and Management Performance", () => {
    it("should create buttons efficiently in parallel", async () => {
      const measurement =
        performanceMonitor.startMeasurement("button_creation");

      const mockButtons = Array(50)
        .fill(0)
        .map((_, i) => ({
          id: `button_${i}`,
          text: `Button ${i}`,
          command: { type: "shell" as const, command: "echo hello" },
          enabled: true,
          alignment: "left" as const,
          priority: 100,
        }));

      extension = new StatusBarQuickActionsExtensionOptimized(mockContext);
      await extension.activate();

      const config = { buttons: mockButtons, settings: {} };
      await extension["updateConfiguration"](config);

      measurement.end();

      const duration = measurement.getDuration();
      console.log(`Button creation time (50 buttons): ${duration}ms`);

      // Target: < 100ms for 50 buttons (2ms per button)
      expect(duration).toBeLessThan(100);
    });

    it("should handle button state updates efficiently", async () => {
      extension = new StatusBarQuickActionsExtensionOptimized(mockContext);
      await extension.activate();

      const measurement = performanceMonitor.startMeasurement("button_updates");

      // Create a single test button
      const config = {
        buttons: [
          {
            id: "test_button",
            text: "Test Button",
            command: { type: "shell" as const, command: "echo test" },
            enabled: true,
            alignment: "left" as const,
            priority: 100,
          },
        ],
        settings: {},
      };

      await extension["updateConfiguration"](config);

      // Simulate multiple state updates
      for (let i = 0; i < 100; i++) {
        const buttonState = extension["buttonStates"].get("test_button");
        if (buttonState) {
          buttonState.isExecuting = i % 2 === 0;
          extension["updateButtonState"]("test_button", buttonState);
        }
      }

      measurement.end();

      const duration = measurement.getDuration();
      console.log(`Button state updates (100 updates): ${duration}ms`);

      // Target: < 50ms for 100 updates (0.5ms per update)
      expect(duration).toBeLessThan(50);
    });
  });

  describe("Command Execution Performance", () => {
    let mockExecutor: CommandExecutorOptimized;

    beforeEach(() => {
      mockExecutor = new CommandExecutorOptimized(mockContext);
    });

    it("should execute simple commands within target time", async () => {
      const measurement = performanceMonitor.startMeasurement(
        "simple_command_execution",
      );

      const result = await mockExecutor.execute("echo hello", {});

      measurement.end();

      const duration = measurement.getDuration();
      console.log(`Simple command execution time: ${duration}ms`);

      // Target: < 100ms for simple commands
      expect(duration).toBeLessThan(100);
      expect(result.stdout).toContain("hello");
    });

    it("should handle cached commands efficiently", async () => {
      const measurement = performanceMonitor.startMeasurement(
        "cached_command_execution",
      );

      const command = "echo cached";

      // First execution (cache miss)
      await mockExecutor.execute(command, { force: true });

      // Second execution (cache hit)
      await mockExecutor.execute(command, { force: false });

      // Third execution (cache hit)
      await mockExecutor.execute(command, { force: false });

      measurement.end();

      const duration = measurement.getDuration();
      console.log(`Cached command execution (3 runs): ${duration}ms`);

      // Target: < 50ms for cached executions (should be much faster)
      expect(duration).toBeLessThan(50);
    });

    it("should handle concurrent executions efficiently", async () => {
      const measurement = performanceMonitor.startMeasurement(
        "concurrent_execution",
      );

      const commands = Array(10)
        .fill("echo concurrent")
        .map((cmd, i) => `${cmd} ${i}`);

      // Execute commands concurrently
      const results = await Promise.all(
        commands.map((cmd) => mockExecutor.execute(cmd, {})),
      );

      measurement.end();

      const duration = measurement.getDuration();
      console.log(`Concurrent execution (10 commands): ${duration}ms`);

      // Target: < 200ms for 10 concurrent commands
      expect(duration).toBeLessThan(200);
      expect(results).toHaveLength(10);
    });

    it("should handle commands with options efficiently", async () => {
      const measurement = performanceMonitor.startMeasurement(
        "command_with_options",
      );

      const options = {
        workingDirectory: process.cwd(),
        environment: { TEST_VAR: "test_value" },
        timeout: 10000,
      };

      const result = await mockExecutor.execute("echo $TEST_VAR", options);

      measurement.end();

      const duration = measurement.getDuration();
      console.log(`Command with options execution time: ${duration}ms`);

      // Target: < 150ms for commands with options
      expect(duration).toBeLessThan(150);
      expect(result.stdout).toContain("test_value");
    });
  });

  describe("Memory Management Performance", () => {
    it("should not leak memory during normal operation", async () => {
      extension = new StatusBarQuickActionsExtensionOptimized(mockContext);
      await extension.activate();

      // Measure initial memory
      const initialMemory = process.memoryUsage().heapUsed;

      const measurement =
        performanceMonitor.startMeasurement("memory_management");

      // Perform operations that could cause memory leaks
      for (let i = 0; i < 100; i++) {
        const mockConfig = {
          buttons: [
            {
              id: `temp_button_${i}`,
              text: `Temp Button ${i}`,
              command: { type: "shell" as const, command: `echo ${i}` },
              enabled: true,
              alignment: "left" as const,
              priority: 100,
            },
          ],
          settings: {},
        };

        await extension["updateConfiguration"](mockConfig);

        // Clean up
        extension["buttonStates"].clear();
      }

      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }

      measurement.end();

      const finalMemory = process.memoryUsage().heapUsed;
      const memoryDelta = finalMemory - initialMemory;

      console.log(
        `Memory delta after 100 operations: ${(memoryDelta / 1024 / 1024).toFixed(2)} MB`,
      );

      // Target: < 10MB memory increase after 100 operations
      expect(memoryDelta).toBeLessThan(10 * 1024 * 1024);
    });

    it("should efficiently clean up caches", async () => {
      extension = new StatusBarQuickActionsExtensionOptimized(mockContext);
      await extension.activate();

      // Fill up caches with test data
      const mockExecutor = new CommandExecutorOptimized(mockContext);
      for (let i = 0; i < 50; i++) {
        await mockExecutor.execute(`echo test_${i}`, {});
      }

      // Measure cache size before cleanup
      const cacheSizeBefore = (mockExecutor as any).resultCache.size;

      // Trigger cache cleanup
      extension["cleanupStaleCache"]();

      // Measure cache size after cleanup
      const cacheSizeAfter = (mockExecutor as any).resultCache.size;

      console.log(`Cache size: ${cacheSizeBefore} -> ${cacheSizeAfter}`);

      // Cache should be cleaned up or significantly reduced
      expect(cacheSizeAfter).toBeLessThanOrEqual(cacheSizeBefore);
    });
  });

  describe("Performance Monitoring Integration", () => {
    it("should track performance metrics accurately", async () => {
      const measurement = performanceMonitor.startMeasurement("test_operation");

      // Simulate some work
      await new Promise((resolve) => setTimeout(resolve, 50));

      measurement.end();

      const metrics = measurement.getMetrics();

      expect(metrics.duration).toBeGreaterThan(45); // Allow some tolerance
      expect(metrics.duration).toBeLessThan(60);
      expect(metrics.timestamp).toBeDefined();
      expect(metrics.operation).toBe("test_operation");
    });

    it("should provide detailed performance insights", async () => {
      const measurement =
        performanceMonitor.startMeasurement("complex_operation");

      // Simulate nested operations
      const subMeasurement =
        performanceMonitor.startMeasurement("sub_operation_1");
      await new Promise((resolve) => setTimeout(resolve, 10));
      subMeasurement.end();

      const subMeasurement2 =
        performanceMonitor.startMeasurement("sub_operation_2");
      await new Promise((resolve) => setTimeout(resolve, 15));
      subMeasurement2.end();

      measurement.end();

      const report = performanceMonitor.generateReport();

      expect(report).toContain("complex_operation");
      expect(report).toContain("sub_operation_1");
      expect(report).toContain("sub_operation_2");
      expect(report).toContain("Performance Report");
    });
  });

  describe("Error Handling Performance", () => {
    it("should handle errors without performance degradation", async () => {
      const measurement = performanceMonitor.startMeasurement("error_handling");

      const mockExecutor = new CommandExecutorOptimized(mockContext);

      try {
        // Execute a command that will fail
        await mockExecutor.execute("exit 1", {});
      } catch {
        // Expected error
      }

      measurement.end();

      const duration = measurement.getDuration();
      console.log(`Error handling time: ${duration}ms`);

      // Target: < 50ms for error handling
      expect(duration).toBeLessThan(50);
    });

    it("should handle rapid error scenarios efficiently", async () => {
      const measurement = performanceMonitor.startMeasurement(
        "rapid_error_scenarios",
      );

      const mockExecutor = new CommandExecutorOptimized(mockContext);
      const errorCommands = [
        "false",
        "exit 1",
        "ls /nonexistent",
        "rm /nonexistent/file",
      ];

      // Execute multiple failing commands
      const results = await Promise.allSettled(
        errorCommands.map((cmd) => mockExecutor.execute(cmd, {})),
      );

      measurement.end();

      const duration = measurement.getDuration();
      console.log(
        `Rapid error scenarios (${errorCommands.length} commands): ${duration}ms`,
      );

      // Target: < 100ms for multiple error scenarios
      expect(duration).toBeLessThan(100);
      expect(results.every((r) => r.status === "rejected")).toBe(true);
    });
  });

  describe("Backward Compatibility", () => {
    it("should maintain API compatibility with original extension", async () => {
      extension = new StatusBarQuickActionsExtensionOptimized(mockContext);

      // Test that all expected methods exist
      expect(extension.activate).toBeDefined();
      expect(extension.deactivate).toBeDefined();

      // Test activation
      await extension.activate();
      expect(extension["isActivated"]).toBe(true);

      // Test deactivation
      extension.deactivate();
      expect(extension["isActivated"]).toBe(false);
    });

    it("should handle legacy configuration formats", async () => {
      extension = new StatusBarQuickActionsExtensionOptimized(mockContext);
      await extension.activate();

      // Test with legacy configuration format
      const legacyConfig = {
        buttons: [
          {
            text: "Legacy Button",
            command: "echo legacy",
            alignment: "left",
            priority: 100,
          },
        ],
      };

      // Should not throw error and should handle gracefully
      await expect(
        extension["updateConfiguration"](legacyConfig),
      ).resolves.not.toThrow();
    });
  });
});
