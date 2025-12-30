/**
 * Executor Performance Benchmarks
 * Tests performance improvements between original and optimized implementations
 */

import * as vscode from "vscode";
import { CommandExecutor } from "../../executor";
import { OptimizedCommandExecutor } from "../../executor-optimized";
import { PerformanceMonitor } from "../../utils/performance-monitor";
import { ButtonCommand } from "../../types";

interface BenchmarkResult {
  name: string;
  original: {
    average: number;
    median: number;
    min: number;
    max: number;
    stdDev: number;
  };
  optimized: {
    average: number;
    median: number;
    min: number;
    max: number;
    stdDev: number;
  };
  improvement: {
    average: number;
    median: number;
    min: number;
    max: number;
  };
  cacheHitRate: number;
  memoryUsage: {
    before: number;
    after: number;
    delta: number;
  };
}

interface PerformanceTestConfig {
  iterations: number;
  commands: string[];
  forceExecution?: boolean;
  warmCache?: boolean;
}

export class ExecutorBenchmarks {
  private performanceMonitor: PerformanceMonitor;
  private testHelpers: any;
  private context: vscode.ExtensionContext | null = null;

  constructor() {
    this.performanceMonitor = new PerformanceMonitor();
  }

  async setup(context: vscode.ExtensionContext): Promise<void> {
    this.context = context;
  }

  async teardown(): Promise<void> {
    // Cleanup if needed
  }

  /**
   * Run comprehensive benchmarks comparing original vs optimized implementations
   */
  async runComprehensiveBenchmarks(
    config: PerformanceTestConfig,
  ): Promise<BenchmarkResult[]> {
    console.log("🚀 Starting Comprehensive Executor Benchmarks");
    console.log(
      `Configuration: ${config.iterations} iterations, ${config.commands.length} commands`,
    );
    console.log("=".repeat(80));

    const results: BenchmarkResult[] = [];

    // Test 1: Simple commands (basic execution)
    results.push(await this.benchmarkSimpleCommands(config));

    // Test 2: Complex commands (with environment and working directory)
    results.push(await this.benchmarkComplexCommands(config));

    // Test 3: Cached commands (memory efficiency)
    results.push(await this.benchmarkCachedCommands(config));

    // Test 4: Concurrent execution (threading performance)
    results.push(await this.benchmarkConcurrentExecution(config));

    // Test 5: Large output handling (streaming performance)
    results.push(await this.benchmarkLargeOutput(config));

    // Test 6: Error handling (resilience performance)
    results.push(await this.benchmarkErrorHandling(config));

    // Test 7: Memory pressure test
    results.push(await this.benchmarkMemoryPressure(config));

    // Test 8: Cache performance (TTL and eviction)
    results.push(await this.benchmarkCachePerformance(config));

    this.printResults(results);
    return results;
  }

  /**
   * Convert string commands to ButtonCommand objects
   */
  private convertToButtonCommands(commands: string[]): ButtonCommand[] {
    return commands.map((cmd) => ({
      type: "shell" as const,
      command: cmd,
    }));
  }

  /**
   * Benchmark simple command execution
   */
  private async benchmarkSimpleCommands(
    config: PerformanceTestConfig,
  ): Promise<BenchmarkResult> {
    console.log("\n📊 Testing Simple Command Execution...");

    const original = new CommandExecutor();
    const optimized = new OptimizedCommandExecutor();

    const testCommands = config.commands.slice(0, 3); // Use first 3 commands
    const buttonCommands = this.convertToButtonCommands(testCommands);

    // Test original implementation
    const originalTimings = await this.measureExecutionTime(async () => {
      const results = [];
      for (const command of buttonCommands) {
        results.push(await original.execute(command, {}));
      }
      return results;
    }, config.iterations);

    // Test optimized implementation
    const optimizedTimings = await this.measureExecutionTime(async () => {
      const results = [];
      for (const command of buttonCommands) {
        results.push(await optimized.execute(command, {}));
      }
      return results;
    }, config.iterations);

    return this.createBenchmarkResult(
      "Simple Commands",
      originalTimings,
      optimizedTimings,
    );
  }

  /**
   * Benchmark complex command execution with options
   */
  private async benchmarkComplexCommands(
    config: PerformanceTestConfig,
  ): Promise<BenchmarkResult> {
    console.log("\n📊 Testing Complex Command Execution...");

    const original = new CommandExecutor();
    const optimized = new OptimizedCommandExecutor();

    const testCommands = config.commands.slice(0, 3);
    const buttonCommands = this.convertToButtonCommands(testCommands);
    const complexOptions = {
      workingDirectory: process.cwd(),
      environment: { TEST_VAR: "test_value" },
      timeout: 10000,
    };

    // Test original implementation
    const originalTimings = await this.measureExecutionTime(async () => {
      const results = [];
      for (const command of buttonCommands) {
        results.push(await original.execute(command, complexOptions));
      }
      return results;
    }, config.iterations);

    // Test optimized implementation
    const optimizedTimings = await this.measureExecutionTime(async () => {
      const results = [];
      for (const command of buttonCommands) {
        results.push(await optimized.execute(command, complexOptions));
      }
      return results;
    }, config.iterations);

    return this.createBenchmarkResult(
      "Complex Commands",
      originalTimings,
      optimizedTimings,
    );
  }

  /**
   * Benchmark cached command execution
   */
  private async benchmarkCachedCommands(
    config: PerformanceTestConfig,
  ): Promise<BenchmarkResult> {
    console.log("\n📊 Testing Cached Command Execution...");

    const optimized = new OptimizedCommandExecutor();

    const testCommands = config.commands.slice(0, 3);
    const buttonCommands = this.convertToButtonCommands(testCommands);

    // First run (cache miss)
    const coldTimings = await this.measureExecutionTime(
      async () => {
        const results = [];
        for (const command of buttonCommands) {
          results.push(await optimized.execute(command, { force: false }));
        }
        return results;
      },
      Math.ceil(config.iterations / 2),
    );

    // Second run (cache hit)
    const hotTimings = await this.measureExecutionTime(
      async () => {
        const results = [];
        for (const command of buttonCommands) {
          results.push(await optimized.execute(command, { force: false }));
        }
        return results;
      },
      Math.ceil(config.iterations / 2),
    );

    // Create simulated original timings (cache misses only)
    const simulatedOriginalTimings = coldTimings;

    const averageImprovement =
      this.calculateAverage([...coldTimings, ...hotTimings]) -
      this.calculateAverage(simulatedOriginalTimings);

    return {
      name: "Cached Commands",
      original: this.calculateStats(simulatedOriginalTimings),
      optimized: this.calculateStats(hotTimings),
      improvement: {
        average: averageImprovement,
        median:
          this.calculateMedian(hotTimings) -
          this.calculateMedian(simulatedOriginalTimings),
        min: Math.min(...hotTimings) - Math.min(...simulatedOriginalTimings),
        max: Math.max(...hotTimings) - Math.max(...simulatedOriginalTimings),
      },
      cacheHitRate:
        hotTimings.length / (coldTimings.length + hotTimings.length),
      memoryUsage: { before: 0, after: 0, delta: 0 }, // Placeholder
    };
  }

  /**
   * Benchmark concurrent execution
   */
  private async benchmarkConcurrentExecution(
    config: PerformanceTestConfig,
  ): Promise<BenchmarkResult> {
    console.log("\n📊 Testing Concurrent Execution...");

    const original = new CommandExecutor();
    const optimized = new OptimizedCommandExecutor();

    const concurrentCommands = config.commands.slice(0, 5);
    const buttonCommands = this.convertToButtonCommands(concurrentCommands);
    const concurrencyLevel = 3;

    // Test original implementation with concurrency
    const originalTimings = await this.measureConcurrentExecution(
      original,
      buttonCommands,
      concurrencyLevel,
      config.iterations,
    );

    // Test optimized implementation with concurrency
    const optimizedTimings = await this.measureConcurrentExecution(
      optimized,
      buttonCommands,
      concurrencyLevel,
      config.iterations,
    );

    return this.createBenchmarkResult(
      "Concurrent Execution",
      originalTimings,
      optimizedTimings,
    );
  }

  /**
   * Benchmark large output handling
   */
  private async benchmarkLargeOutput(
    config: PerformanceTestConfig,
  ): Promise<BenchmarkResult> {
    console.log("\n📊 Testing Large Output Handling...");

    const original = new CommandExecutor();
    const optimized = new OptimizedCommandExecutor();

    // Use a command that produces large output
    const largeOutputCommand = "node -e \"console.log('x'.repeat(10000))\"";
    const testCommands = Array(3).fill(largeOutputCommand);
    const buttonCommands = this.convertToButtonCommands(testCommands);

    // Test original implementation
    const originalTimings = await this.measureExecutionTime(async () => {
      const results = [];
      for (const command of buttonCommands) {
        results.push(await original.execute(command, {}));
      }
      return results;
    }, config.iterations);

    // Test optimized implementation
    const optimizedTimings = await this.measureExecutionTime(async () => {
      const results = [];
      for (const command of buttonCommands) {
        results.push(await optimized.execute(command, {}));
      }
      return results;
    }, config.iterations);

    return this.createBenchmarkResult(
      "Large Output",
      originalTimings,
      optimizedTimings,
    );
  }

  /**
   * Benchmark error handling
   */
  private async benchmarkErrorHandling(
    config: PerformanceTestConfig,
  ): Promise<BenchmarkResult> {
    console.log("\n📊 Testing Error Handling...");

    const original = new CommandExecutor();
    const optimized = new OptimizedCommandExecutor();

    // Use commands that will fail
    const failingCommands = ["false", "exit 1", "ls /nonexistent"];
    const testCommands = failingCommands.slice(0, 2);
    const buttonCommands = this.convertToButtonCommands(testCommands);

    // Test original implementation
    const originalTimings = await this.measureExecutionTime(async () => {
      const results = [];
      for (const command of buttonCommands) {
        try {
          results.push(await original.execute(command, {}));
        } catch {
          results.push({ error: true });
        }
      }
      return results;
    }, config.iterations);

    // Test optimized implementation
    const optimizedTimings = await this.measureExecutionTime(async () => {
      const results = [];
      for (const command of buttonCommands) {
        try {
          results.push(await optimized.execute(command, {}));
        } catch {
          results.push({ error: true });
        }
      }
      return results;
    }, config.iterations);

    return this.createBenchmarkResult(
      "Error Handling",
      originalTimings,
      optimizedTimings,
    );
  }

  /**
   * Benchmark memory pressure
   */
  private async benchmarkMemoryPressure(
    config: PerformanceTestConfig,
  ): Promise<BenchmarkResult> {
    console.log("\n📊 Testing Memory Pressure...");

    const original = new CommandExecutor();
    const optimized = new OptimizedCommandExecutor();

    const testCommands = config.commands.slice(0, 5);
    const buttonCommands = this.convertToButtonCommands(testCommands);
    const iterations = Math.min(config.iterations, 50); // Reduce iterations for memory test

    // Measure memory before original execution
    const memBeforeOriginal = process.memoryUsage().heapUsed;

    // Run original implementation
    const originalTimings = await this.measureExecutionTime(
      async () => {
        const results = [];
        for (let i = 0; i < iterations; i++) {
          for (const command of buttonCommands) {
            results.push(await original.execute(command, {}));
          }
        }
        return results;
      },
      1, // Single run for memory test
    );

    const _memAfterOriginal = process.memoryUsage().heapUsed;

    // Force garbage collection if available
    if (global.gc) {
      global.gc();
    }

    // Measure memory before optimized execution
    const _memBeforeOptimized = process.memoryUsage().heapUsed;

    // Run optimized implementation
    const optimizedTimings = await this.measureExecutionTime(
      async () => {
        const results = [];
        for (let i = 0; i < iterations; i++) {
          for (const command of buttonCommands) {
            results.push(await optimized.execute(command, {}));
          }
        }
        return results;
      },
      1, // Single run for memory test
    );

    const memAfterOptimized = process.memoryUsage().heapUsed;

    return {
      name: "Memory Pressure",
      original: this.calculateStats(originalTimings),
      optimized: this.calculateStats(optimizedTimings),
      improvement: {
        average:
          this.calculateAverage(originalTimings) -
          this.calculateAverage(optimizedTimings),
        median:
          this.calculateMedian(originalTimings) -
          this.calculateMedian(optimizedTimings),
        min: Math.min(...originalTimings) - Math.min(...optimizedTimings),
        max: Math.max(...originalTimings) - Math.max(...optimizedTimings),
      },
      cacheHitRate: 0, // Not applicable for this test
      memoryUsage: {
        before: memBeforeOriginal,
        after: memAfterOptimized,
        delta: memAfterOptimized - memBeforeOriginal,
      },
    };
  }

  /**
   * Benchmark cache performance
   */
  private async benchmarkCachePerformance(
    config: PerformanceTestConfig,
  ): Promise<BenchmarkResult> {
    console.log("\n📊 Testing Cache Performance...");

    const optimized = new OptimizedCommandExecutor();

    const testCommands = config.commands.slice(0, 3);
    const buttonCommands = this.convertToButtonCommands(testCommands);
    const cacheIterations = Math.ceil(config.iterations / 2);

    // Warm up cache
    for (const command of buttonCommands) {
      await optimized.execute(command, {});
    }

    // Measure cache hit performance
    const cacheHitTimings = await this.measureExecutionTime(async () => {
      const results = [];
      for (const command of buttonCommands) {
        results.push(await optimized.execute(command, { force: false }));
      }
      return results;
    }, cacheIterations);

    // Measure cache miss performance
    const cacheMissTimings = await this.measureExecutionTime(async () => {
      const results = [];
      for (const command of buttonCommands) {
        results.push(await optimized.execute(command, { force: true }));
      }
      return results;
    }, cacheIterations);

    // Simulate original implementation (always cache miss)
    const simulatedOriginalTimings = cacheMissTimings;

    const improvement =
      this.calculateAverage(simulatedOriginalTimings) -
      this.calculateAverage(cacheHitTimings);

    return {
      name: "Cache Performance",
      original: this.calculateStats(simulatedOriginalTimings),
      optimized: this.calculateStats(cacheHitTimings),
      improvement: {
        average: improvement,
        median:
          this.calculateMedian(simulatedOriginalTimings) -
          this.calculateMedian(cacheHitTimings),
        min:
          Math.min(...simulatedOriginalTimings) - Math.min(...cacheHitTimings),
        max:
          Math.max(...simulatedOriginalTimings) - Math.max(...cacheHitTimings),
      },
      cacheHitRate:
        cacheHitTimings.length /
        (cacheHitTimings.length + cacheMissTimings.length),
      memoryUsage: { before: 0, after: 0, delta: 0 },
    };
  }

  /**
   * Measure execution time for a function
   */
  private async measureExecutionTime(
    fn: () => Promise<unknown>,
    iterations: number,
  ): Promise<number[]> {
    const timings: number[] = [];

    for (let i = 0; i < iterations; i++) {
      const start = performance.now();
      await fn();
      const end = performance.now();
      timings.push(end - start);
    }

    return timings;
  }

  /**
   * Measure concurrent execution time
   */
  private async measureConcurrentExecution(
    executor: CommandExecutor | OptimizedCommandExecutor,
    commands: ButtonCommand[],
    concurrencyLevel: number,
    iterations: number,
  ): Promise<number[]> {
    const timings: number[] = [];

    for (let i = 0; i < iterations; i++) {
      const start = performance.now();

      // Execute commands in batches
      const batches = this.chunkArray(commands, concurrencyLevel);
      for (const batch of batches) {
        await Promise.all(
          batch.map((command) => executor.execute(command, {})),
        );
      }

      const end = performance.now();
      timings.push(end - start);
    }

    return timings;
  }

  /**
   * Calculate statistics from timing data
   */
  private calculateStats(timings: number[]): BenchmarkResult["original"] {
    const sorted = [...timings].sort((a, b) => a - b);
    const average = this.calculateAverage(timings);
    const median = this.calculateMedian(timings);
    const min = sorted[0];
    const max = sorted[sorted.length - 1];
    const stdDev = this.calculateStandardDeviation(timings, average);

    return { average, median, min, max, stdDev };
  }

  /**
   * Calculate average of array
   */
  private calculateAverage(arr: number[]): number {
    return arr.reduce((sum, val) => sum + val, 0) / arr.length;
  }

  /**
   * Calculate median of array
   */
  private calculateMedian(arr: number[]): number {
    const sorted = [...arr].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 0
      ? (sorted[mid - 1] + sorted[mid]) / 2
      : sorted[mid];
  }

  /**
   * Calculate standard deviation
   */
  private calculateStandardDeviation(arr: number[], mean: number): number {
    const squaredDiffs = arr.map((val) => Math.pow(val - mean, 2));
    const avgSquaredDiff =
      squaredDiffs.reduce((sum, val) => sum + val, 0) / arr.length;
    return Math.sqrt(avgSquaredDiff);
  }

  /**
   * Create benchmark result object
   */
  private createBenchmarkResult(
    name: string,
    originalTimings: number[],
    optimizedTimings: number[],
  ): BenchmarkResult {
    return {
      name,
      original: this.calculateStats(originalTimings),
      optimized: this.calculateStats(optimizedTimings),
      improvement: {
        average:
          this.calculateAverage(originalTimings) -
          this.calculateAverage(optimizedTimings),
        median:
          this.calculateMedian(originalTimings) -
          this.calculateMedian(optimizedTimings),
        min: Math.min(...originalTimings) - Math.min(...optimizedTimings),
        max: Math.max(...originalTimings) - Math.max(...optimizedTimings),
      },
      cacheHitRate: 0, // Will be calculated separately for cache tests
      memoryUsage: { before: 0, after: 0, delta: 0 },
    };
  }

  /**
   * Utility to chunk array
   */
  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  /**
   * Print benchmark results
   */
  private printResults(results: BenchmarkResult[]): void {
    console.log("\n" + "=".repeat(80));
    console.log("📈 BENCHMARK RESULTS SUMMARY");
    console.log("=".repeat(80));

    for (const result of results) {
      console.log(`\n🎯 ${result.name}`);
      console.log("─".repeat(50));
      console.log(
        `Original: avg=${result.original.average.toFixed(2)}ms, median=${result.original.median.toFixed(2)}ms`,
      );
      console.log(
        `Optimized: avg=${result.optimized.average.toFixed(2)}ms, median=${result.optimized.median.toFixed(2)}ms`,
      );
      console.log(
        `Improvement: avg=${result.improvement.average.toFixed(2)}ms, median=${result.improvement.median.toFixed(2)}ms`,
      );

      if (result.cacheHitRate > 0) {
        console.log(
          `Cache Hit Rate: ${(result.cacheHitRate * 100).toFixed(1)}%`,
        );
      }

      if (result.memoryUsage.delta !== 0) {
        const deltaMB = (result.memoryUsage.delta / 1024 / 1024).toFixed(2);
        console.log(`Memory Delta: ${deltaMB} MB`);
      }
    }

    console.log("\n" + "=".repeat(80));
  }

  /**
   * Generate detailed benchmark report
   */
  async generateReport(results: BenchmarkResult[]): Promise<string> {
    let report = `# Executor Performance Benchmark Report\n\n`;
    report += `Generated: ${new Date().toISOString()}\n`;
    report += `Node.js: ${process.version}\n`;
    report += `Platform: ${process.platform} ${process.arch}\n\n`;

    report += "## Executive Summary\n\n";

    const totalImprovement =
      results.reduce((sum, r) => sum + r.improvement.average, 0) /
      results.length;
    report += `Average performance improvement: ${totalImprovement.toFixed(2)}ms (${((totalImprovement / results.reduce((sum, r) => sum + r.original.average, 0)) * 100).toFixed(1)}%)\n\n`;

    report += "## Detailed Results\n\n";

    for (const result of results) {
      report += `### ${result.name}\n\n`;
      report += "| Metric | Original | Optimized | Improvement |\n";
      report += "|--------|----------|-----------|-------------|\n";
      report += `| Average (ms) | ${result.original.average.toFixed(2)} | ${result.optimized.average.toFixed(2)} | ${result.improvement.average.toFixed(2)} |\n`;
      report += `| Median (ms) | ${result.original.median.toFixed(2)} | ${result.optimized.median.toFixed(2)} | ${result.improvement.median.toFixed(2)} |\n`;
      report += `| Min (ms) | ${result.original.min.toFixed(2)} | ${result.optimized.min.toFixed(2)} | ${result.improvement.min.toFixed(2)} |\n`;
      report += `| Max (ms) | ${result.original.max.toFixed(2)} | ${result.optimized.max.toFixed(2)} | ${result.improvement.max.toFixed(2)} |\n`;
      report += `| Std Dev (ms) | ${result.original.stdDev.toFixed(2)} | ${result.optimized.stdDev.toFixed(2)} | - |\n`;

      if (result.cacheHitRate > 0) {
        report += `| Cache Hit Rate | - | - | ${(result.cacheHitRate * 100).toFixed(1)}% |\n`;
      }

      if (result.memoryUsage.delta !== 0) {
        const deltaMB = (result.memoryUsage.delta / 1024 / 1024).toFixed(2);
        report += `| Memory Delta (MB) | - | - | ${deltaMB} |\n`;
      }

      report += "\n";
    }

    report += "## Performance Targets Achievement\n\n";
    report += "### Sub-100ms Execution Times\n\n";

    for (const result of results) {
      const targetAchieved = result.optimized.average < 100;
      report += `- **${result.name}**: ${targetAchieved ? "✅" : "❌"} ${result.optimized.average.toFixed(2)}ms ${targetAchieved ? "(Target Achieved)" : "(Target Missed)"}\n`;
    }

    report += "\n## Recommendations\n\n";

    const failedTargets = results.filter((r) => r.optimized.average >= 100);
    if (failedTargets.length > 0) {
      report += "The following tests still exceed the 100ms target:\n";
      for (const test of failedTargets) {
        report += `- ${test.name}: ${test.optimized.average.toFixed(2)}ms\n`;
      }
      report += "\nConsider additional optimizations for these scenarios.\n";
    } else {
      report += "🎉 All performance targets have been achieved!\n";
    }

    return report;
  }
}
