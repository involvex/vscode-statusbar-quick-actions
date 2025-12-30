/**
 * Enhanced Performance Monitoring Suite
 * Advanced performance tracking and optimization utilities
 */

import * as vscode from "vscode";

export interface PerformanceMetrics {
  memoryUsage: {
    usedHeapSize: number;
    totalHeapSize: number;
    heapSizeLimit: number;
    external: number;
    arrayBuffers: number;
  };
  operationTimings: Map<string, number[]>;
  cacheHitRates: Map<string, { hits: number; misses: number }>;
  executionTimes: Map<
    string,
    { min: number; max: number; avg: number; count: number }
  >;
  errorRates: Map<string, { errors: number; total: number }>;
  uiResponsiveness: {
    renderTimes: number[];
    inputLatency: number[];
    eventProcessingTimes: number[];
  };
  resourceUtilization: {
    cpuUsage: number;
    memoryPressure: "low" | "medium" | "high";
    activeTimers: number;
    activeIntervals: number;
  };
}

export interface PerformanceThreshold {
  operation: string;
  warningMs: number;
  criticalMs: number;
  description: string;
}

export interface PerformanceAlert {
  timestamp: Date;
  level: "warning" | "critical";
  operation: string;
  duration: number;
  threshold: number;
  message: string;
  context?: Record<string, unknown>;
}

export interface CacheStatistics {
  name: string;
  size: number;
  maxSize: number;
  hitRate: number;
  missRate: number;
  evictionCount: number;
  lastAccess: number;
}

export class EnhancedPerformanceMonitor {
  private context: vscode.ExtensionContext;
  private metrics: PerformanceMetrics;
  private thresholds = new Map<string, PerformanceThreshold>();
  private alerts: PerformanceAlert[] = [];
  private outputChannel: vscode.OutputChannel;
  private monitoringActive = false;
  private monitoringInterval?: NodeJS.Timeout;
  private memorySnapshots: { timestamp: number; usage: number }[] = [];
  private maxSnapshots = 100; // Keep last 100 snapshots

  // Performance counters for different operations
  private operationCounters = new Map<string, number>();
  private errorCounters = new Map<string, number>();

  // Real-time monitoring
  private realTimeMetrics = {
    lastUpdate: Date.now(),
    operationsPerSecond: 0,
    averageResponseTime: 0,
    errorRate: 0,
    memoryGrowth: 0,
  };

  constructor(context: vscode.ExtensionContext) {
    this.context = context;
    this.metrics = this.initializeMetrics();
    this.outputChannel = vscode.window.createOutputChannel(
      "StatusBar Quick Actions - Performance",
    );
    this.setupThresholds();
  }

  /**
   * Initialize performance metrics structure
   */
  private initializeMetrics(): PerformanceMetrics {
    return {
      memoryUsage: {
        usedHeapSize: 0,
        totalHeapSize: 0,
        heapSizeLimit: 0,
        external: 0,
        arrayBuffers: 0,
      },
      operationTimings: new Map(),
      cacheHitRates: new Map(),
      executionTimes: new Map(),
      errorRates: new Map(),
      uiResponsiveness: {
        renderTimes: [],
        inputLatency: [],
        eventProcessingTimes: [],
      },
      resourceUtilization: {
        cpuUsage: 0,
        memoryPressure: "low",
        activeTimers: 0,
        activeIntervals: 0,
      },
    };
  }

  /**
   * Setup performance thresholds for monitoring
   */
  private setupThresholds(): void {
    const defaultThresholds: PerformanceThreshold[] = [
      {
        operation: "button_creation",
        warningMs: 100,
        criticalMs: 250,
        description: "Time to create a statusbar button",
      },
      {
        operation: "command_execution",
        warningMs: 50,
        criticalMs: 100,
        description: "Time to execute a button command",
      },
      {
        operation: "configuration_update",
        warningMs: 200,
        criticalMs: 500,
        description: "Time to update configuration",
      },
      {
        operation: "visibility_check",
        warningMs: 16, // ~60fps
        criticalMs: 33, // ~30fps
        description: "Time for visibility condition check",
      },
      {
        operation: "history_load",
        warningMs: 20,
        criticalMs: 50,
        description: "Time to load command history",
      },
      {
        operation: "memory_cleanup",
        warningMs: 100,
        criticalMs: 200,
        description: "Time for memory cleanup operations",
      },
    ];

    defaultThresholds.forEach((threshold) => {
      this.thresholds.set(threshold.operation, threshold);
    });
  }

  /**
   * Start performance monitoring
   */
  public startMonitoring(): void {
    if (this.monitoringActive) {
      return;
    }

    this.monitoringActive = true;
    this.log("Performance monitoring started");

    // Monitor every 5 seconds for real-time metrics
    this.monitoringInterval = setInterval(() => {
      this.collectRealTimeMetrics();
      this.checkThresholds();
      this.cleanupOldAlerts();
    }, 5000);

    // Take initial memory snapshot
    this.takeMemorySnapshot();
  }

  /**
   * Stop performance monitoring
   */
  public stopMonitoring(): void {
    if (!this.monitoringActive) {
      return;
    }

    this.monitoringActive = false;
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
    }
    this.log("Performance monitoring stopped");
  }

  /**
   * Record operation timing
   */
  public recordOperation(
    operation: string,
    duration: number,
    context?: Record<string, unknown>,
  ): void {
    // Update operation timings
    if (!this.metrics.operationTimings.has(operation)) {
      this.metrics.operationTimings.set(operation, []);
    }

    const timings = this.metrics.operationTimings.get(operation)!;
    timings.push(duration);

    // Keep only last 1000 measurements per operation
    if (timings.length > 1000) {
      timings.splice(0, timings.length - 1000);
    }

    // Update execution time statistics
    this.updateExecutionTimeStats(operation, duration);

    // Record counter
    this.operationCounters.set(
      operation,
      (this.operationCounters.get(operation) || 0) + 1,
    );

    // Check thresholds
    this.checkThreshold(operation, duration);

    // Log critical operations
    if (duration > 100) {
      this.log(
        `Slow operation detected: ${operation} took ${duration.toFixed(2)}ms`,
        context,
      );
    }
  }

  /**
   * Record cache hit/miss
   */
  public recordCacheAccess(cacheName: string, hit: boolean): void {
    if (!this.metrics.cacheHitRates.has(cacheName)) {
      this.metrics.cacheHitRates.set(cacheName, { hits: 0, misses: 0 });
    }

    const stats = this.metrics.cacheHitRates.get(cacheName)!;
    if (hit) {
      stats.hits++;
    } else {
      stats.misses++;
    }
  }

  /**
   * Record error occurrence
   */
  public recordError(operation: string, error: Error | string): void {
    if (!this.metrics.errorRates.has(operation)) {
      this.metrics.errorRates.set(operation, { errors: 0, total: 0 });
    }

    const stats = this.metrics.errorRates.get(operation)!;
    stats.errors++;
    stats.total++;

    this.errorCounters.set(
      operation,
      (this.errorCounters.get(operation) || 0) + 1,
    );

    this.log(`Error in ${operation}: ${error}`, { error: error.toString() });
  }

  /**
   * Record UI responsiveness metrics
   */
  public recordUIMetric(
    type: "render" | "input" | "event",
    duration: number,
  ): void {
    switch (type) {
      case "render":
        this.metrics.uiResponsiveness.renderTimes.push(duration);
        if (this.metrics.uiResponsiveness.renderTimes.length > 100) {
          this.metrics.uiResponsiveness.renderTimes.shift();
        }
        break;
      case "input":
        this.metrics.uiResponsiveness.inputLatency.push(duration);
        if (this.metrics.uiResponsiveness.inputLatency.length > 100) {
          this.metrics.uiResponsiveness.inputLatency.shift();
        }
        break;
      case "event":
        this.metrics.uiResponsiveness.eventProcessingTimes.push(duration);
        if (this.metrics.uiResponsiveness.eventProcessingTimes.length > 100) {
          this.metrics.uiResponsiveness.eventProcessingTimes.shift();
        }
        break;
    }
  }

  /**
   * Update execution time statistics
   */
  private updateExecutionTimeStats(operation: string, duration: number): void {
    if (!this.metrics.executionTimes.has(operation)) {
      this.metrics.executionTimes.set(operation, {
        min: duration,
        max: duration,
        avg: duration,
        count: 1,
      });
    } else {
      const stats = this.metrics.executionTimes.get(operation)!;
      stats.count++;
      stats.min = Math.min(stats.min, duration);
      stats.max = Math.max(stats.max, duration);
      stats.avg = (stats.avg * (stats.count - 1) + duration) / stats.count;
    }
  }

  /**
   * Check performance threshold
   */
  private checkThreshold(operation: string, duration: number): void {
    const threshold = this.thresholds.get(operation);
    if (!threshold) {
      return;
    }

    if (duration >= threshold.criticalMs) {
      this.addAlert({
        timestamp: new Date(),
        level: "critical",
        operation,
        duration,
        threshold: threshold.criticalMs,
        message: `${operation} exceeded critical threshold (${duration.toFixed(2)}ms >= ${threshold.criticalMs}ms)`,
      });
    } else if (duration >= threshold.warningMs) {
      this.addAlert({
        timestamp: new Date(),
        level: "warning",
        operation,
        duration,
        threshold: threshold.warningMs,
        message: `${operation} exceeded warning threshold (${duration.toFixed(2)}ms >= ${threshold.warningMs}ms)`,
      });
    }
  }

  /**
   * Add performance alert
   */
  private addAlert(alert: PerformanceAlert): void {
    this.alerts.push(alert);

    // Keep only last 50 alerts
    if (this.alerts.length > 50) {
      this.alerts.splice(0, this.alerts.length - 50);
    }

    // Show notification for critical alerts
    if (alert.level === "critical") {
      vscode.window.showErrorMessage(`Performance Alert: ${alert.message}`);
    }
  }

  /**
   * Collect real-time metrics
   */
  private collectRealTimeMetrics(): void {
    const now = Date.now();
    const deltaTime = now - this.realTimeMetrics.lastUpdate;

    if (deltaTime > 0) {
      // Calculate operations per second
      let totalOps = 0;
      this.operationCounters.forEach((count) => {
        totalOps += count;
      });
      this.realTimeMetrics.operationsPerSecond = (totalOps / deltaTime) * 1000;

      // Calculate average response time
      let totalTime = 0;
      let totalCount = 0;
      this.metrics.executionTimes.forEach((stats) => {
        totalTime += stats.avg * stats.count;
        totalCount += stats.count;
      });
      this.realTimeMetrics.averageResponseTime =
        totalCount > 0 ? totalTime / totalCount : 0;

      // Calculate error rate
      let totalErrors = 0;
      let totalOperations = 0;
      this.metrics.errorRates.forEach((stats) => {
        totalErrors += stats.errors;
        totalOperations += stats.total;
      });
      this.realTimeMetrics.errorRate =
        totalOperations > 0 ? (totalErrors / totalOperations) * 100 : 0;
    }

    this.realTimeMetrics.lastUpdate = now;

    // Update memory usage
    this.updateMemoryUsage();
    this.takeMemorySnapshot();
  }

  /**
   * Update memory usage metrics
   */
  private updateMemoryUsage(): void {
    if (typeof process !== "undefined" && process.memoryUsage) {
      const memUsage = process.memoryUsage();
      this.metrics.memoryUsage = {
        usedHeapSize: memUsage.heapUsed,
        totalHeapSize: memUsage.heapTotal,
        heapSizeLimit: memUsage.heapTotal || 0,
        external: memUsage.external,
        arrayBuffers: memUsage.arrayBuffers || 0,
      };

      // Determine memory pressure
      const usagePercent = (memUsage.heapUsed / memUsage.heapTotal) * 100;
      if (usagePercent > 90) {
        this.metrics.resourceUtilization.memoryPressure = "high";
      } else if (usagePercent > 70) {
        this.metrics.resourceUtilization.memoryPressure = "medium";
      } else {
        this.metrics.resourceUtilization.memoryPressure = "low";
      }
    }
  }

  /**
   * Take memory snapshot for trend analysis
   */
  private takeMemorySnapshot(): void {
    const usage = this.metrics.memoryUsage.usedHeapSize;
    this.memorySnapshots.push({
      timestamp: Date.now(),
      usage,
    });

    if (this.memorySnapshots.length > this.maxSnapshots) {
      this.memorySnapshots.shift();
    }

    // Calculate memory growth trend
    if (this.memorySnapshots.length >= 10) {
      const recent = this.memorySnapshots.slice(-10);
      const trend = recent[recent.length - 1].usage - recent[0].usage;
      this.realTimeMetrics.memoryGrowth = trend / 9; // Average growth per sample
    }
  }

  /**
   * Check all thresholds
   */
  private checkThresholds(): void {
    this.metrics.executionTimes.forEach((stats, operation) => {
      if (stats.avg > 0) {
        this.checkThreshold(operation, stats.avg);
      }
    });
  }

  /**
   * Clean up old alerts
   */
  private cleanupOldAlerts(): void {
    const oneHourAgo = Date.now() - 3600000; // 1 hour
    this.alerts = this.alerts.filter(
      (alert) => alert.timestamp.getTime() > oneHourAgo,
    );
  }

  /**
   * Get comprehensive performance report
   */
  public getPerformanceReport(): string {
    const report: string[] = [];

    report.push("=== Performance Report ===");
    report.push(`Generated: ${new Date().toISOString()}`);
    report.push("");

    // Memory usage
    report.push("Memory Usage:");
    const mem = this.metrics.memoryUsage;
    report.push(`  Heap Used: ${this.formatBytes(mem.usedHeapSize)}`);
    report.push(`  Heap Total: ${this.formatBytes(mem.totalHeapSize)}`);
    report.push(
      `  Usage: ${((mem.usedHeapSize / mem.totalHeapSize) * 100).toFixed(1)}%`,
    );
    report.push(
      `  Pressure: ${this.metrics.resourceUtilization.memoryPressure}`,
    );
    report.push("");

    // Operation timings
    report.push("Operation Performance:");
    this.metrics.executionTimes.forEach((stats, operation) => {
      report.push(`  ${operation}:`);
      report.push(`    Avg: ${stats.avg.toFixed(2)}ms`);
      report.push(`    Min: ${stats.min.toFixed(2)}ms`);
      report.push(`    Max: ${stats.max.toFixed(2)}ms`);
      report.push(`    Count: ${stats.count}`);
    });
    report.push("");

    // Cache statistics
    report.push("Cache Performance:");
    this.metrics.cacheHitRates.forEach((stats, cacheName) => {
      const total = stats.hits + stats.misses;
      const hitRate = total > 0 ? (stats.hits / total) * 100 : 0;
      report.push(
        `  ${cacheName}: ${hitRate.toFixed(1)}% hit rate (${stats.hits}h/${stats.misses}m)`,
      );
    });
    report.push("");

    // Error rates
    report.push("Error Rates:");
    this.metrics.errorRates.forEach((stats, operation) => {
      const errorRate =
        stats.total > 0 ? (stats.errors / stats.total) * 100 : 0;
      report.push(
        `  ${operation}: ${errorRate.toFixed(1)}% (${stats.errors}/${stats.total})`,
      );
    });
    report.push("");

    // Real-time metrics
    report.push("Real-time Metrics:");
    report.push(
      `  Operations/sec: ${this.realTimeMetrics.operationsPerSecond.toFixed(1)}`,
    );
    report.push(
      `  Avg Response: ${this.realTimeMetrics.averageResponseTime.toFixed(2)}ms`,
    );
    report.push(`  Error Rate: ${this.realTimeMetrics.errorRate.toFixed(1)}%`);
    report.push(
      `  Memory Growth: ${this.formatBytes(this.realTimeMetrics.memoryGrowth)}/sample`,
    );
    report.push("");

    // Recent alerts
    if (this.alerts.length > 0) {
      report.push("Recent Alerts:");
      this.alerts.slice(-5).forEach((alert) => {
        report.push(`  ${alert.level.toUpperCase()}: ${alert.message}`);
      });
    }

    return report.join("\n");
  }

  /**
   * Get cache statistics
   */
  public getCacheStatistics(): CacheStatistics[] {
    const statistics: CacheStatistics[] = [];

    this.metrics.cacheHitRates.forEach((stats, cacheName) => {
      const total = stats.hits + stats.misses;
      const hitRate = total > 0 ? (stats.hits / total) * 100 : 0;

      statistics.push({
        name: cacheName,
        size: total,
        maxSize: 1000, // Default max size
        hitRate,
        missRate: 100 - hitRate,
        evictionCount: 0, // Would need to track this
        lastAccess: Date.now(),
      });
    });

    return statistics;
  }

  /**
   * Export performance data
   */
  public exportData(): unknown {
    return {
      timestamp: new Date().toISOString(),
      metrics: {
        memoryUsage: this.metrics.memoryUsage,
        executionTimes: Object.fromEntries(this.metrics.executionTimes),
        cacheHitRates: Object.fromEntries(this.metrics.cacheHitRates),
        errorRates: Object.fromEntries(this.metrics.errorRates),
        uiResponsiveness: this.metrics.uiResponsiveness,
        resourceUtilization: this.metrics.resourceUtilization,
      },
      realTimeMetrics: this.realTimeMetrics,
      alerts: this.alerts,
      memorySnapshots: this.memorySnapshots,
    };
  }

  /**
   * Show performance report in output channel
   */
  public showReport(): void {
    this.outputChannel.clear();
    this.outputChannel.appendLine(this.getPerformanceReport());
    this.outputChannel.show();
  }

  /**
   * Clear all metrics
   */
  public clearMetrics(): void {
    this.metrics = this.initializeMetrics();
    this.alerts = [];
    this.memorySnapshots = [];
    this.operationCounters.clear();
    this.errorCounters.clear();
    this.realTimeMetrics = {
      lastUpdate: Date.now(),
      operationsPerSecond: 0,
      averageResponseTime: 0,
      errorRate: 0,
      memoryGrowth: 0,
    };
    this.log("Performance metrics cleared");
  }

  /**
   * Log message to output channel
   */
  private log(message: string, context?: Record<string, unknown>): void {
    const timestamp = new Date().toISOString();
    const contextStr = context ? ` ${JSON.stringify(context)}` : "";
    this.outputChannel.appendLine(`[${timestamp}] ${message}${contextStr}`);
  }

  /**
   * Format bytes to human readable format
   */
  private formatBytes(bytes: number): string {
    if (bytes === 0) {
      return "0 B";
    }
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  }

  /**
   * Dispose resources
   */
  public dispose(): void {
    this.stopMonitoring();
    this.outputChannel.dispose();
  }
}

/**
 * Performance decorator for automatic timing
 */
export function performanceMonitor(
  monitor: EnhancedPerformanceMonitor,
  operation: string,
  context?: Record<string, unknown>,
) {
  return function (
    target: unknown,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: unknown[]) {
      const startTime = performance.now();

      try {
        const result = await originalMethod.apply(this, args);
        const endTime = performance.now();
        const duration = endTime - startTime;

        monitor.recordOperation(operation, duration, context);
        return result;
      } catch (error) {
        monitor.recordError(operation, error as Error);
        throw error;
      }
    };

    return descriptor;
  };
}

/**
 * Async performance decorator
 */
export function asyncPerformanceMonitor(
  monitor: EnhancedPerformanceMonitor,
  operation: string,
  context?: Record<string, unknown>,
) {
  return function (
    target: unknown,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: unknown[]) {
      const startTime = performance.now();

      try {
        const result = await originalMethod.apply(this, args);
        const endTime = performance.now();
        const duration = endTime - startTime;

        monitor.recordOperation(operation, duration, context);
        return result;
      } catch (error) {
        monitor.recordError(operation, error as Error);
        throw error;
      }
    };

    return descriptor;
  };
}
