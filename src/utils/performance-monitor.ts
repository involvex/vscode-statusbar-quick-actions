/**
 * Performance monitoring utilities for StatusBar Quick Actions
 * Provides metrics collection, alerting, and performance tracking
 */

export interface PerformanceMetrics {
  average: number;
  median: number;
  p95: number;
  p99: number;
  min: number;
  max: number;
  count: number;
}

export interface PerformanceAlert {
  operation: string;
  duration: number;
  threshold: number;
  timestamp: Date;
  message: string;
}

/**
 * Performance Monitor
 * Collects and analyzes performance metrics for extension operations
 */
export class PerformanceMonitor {
  private metrics = new Map<string, number[]>();
  private alerts: PerformanceAlert[] = [];
  private readonly MAX_SAMPLES = 100;
  private readonly MAX_ALERTS = 50;
  private readonly listeners: ((alert: PerformanceAlert) => void)[] = [];

  // Performance thresholds (in milliseconds)
  private readonly thresholds: Record<string, number> = {
    extension_activation: 100,
    button_creation: 20,
    configuration_update: 30,
    command_execution: 100,
    editor_change: 5,
    dynamic_label: 50,
    visibility_check: 10,
    theme_application: 15,
    output_panel_operation: 25,
    preset_operation: 75,
  };

  /**
   * Start a performance timer for an operation
   * @returns A function to call when the operation completes
   */
  public startTimer(operation: string): () => void {
    const start = performance.now();
    return () => {
      const duration = performance.now() - start;
      this.recordMetric(operation, duration);
    };
  }

  /**
   * Record a performance metric
   */
  public recordMetric(operation: string, duration: number): void {
    if (!this.metrics.has(operation)) {
      this.metrics.set(operation, []);
    }

    const samples = this.metrics.get(operation)!;
    samples.push(duration);

    // Limit sample size
    if (samples.length > this.MAX_SAMPLES) {
      samples.shift();
    }

    // Check for performance alerts
    const threshold = this.getThreshold(operation);
    if (duration > threshold) {
      this.createAlert(operation, duration, threshold);
    }
  }

  /**
   * Record multiple metrics at once (batch operation)
   */
  public recordBatchMetrics(metrics: Record<string, number>): void {
    for (const [operation, duration] of Object.entries(metrics)) {
      this.recordMetric(operation, duration);
    }
  }

  /**
   * Get performance metrics for an operation
   */
  public getMetrics(operation: string): PerformanceMetrics {
    const samples = this.metrics.get(operation) || [];
    if (samples.length === 0) {
      return {
        average: 0,
        median: 0,
        p95: 0,
        p99: 0,
        min: 0,
        max: 0,
        count: 0,
      };
    }

    const sorted = [...samples].sort((a, b) => a - b);
    const avg = samples.reduce((a, b) => a + b, 0) / samples.length;

    return {
      average: Math.round(avg * 100) / 100,
      median: sorted[Math.floor(sorted.length / 2)],
      p95: sorted[Math.floor(sorted.length * 0.95)],
      p99: sorted[Math.floor(sorted.length * 0.99)],
      min: sorted[0],
      max: sorted[sorted.length - 1],
      count: samples.length,
    };
  }

  /**
   * Get all performance metrics
   */
  public getAllMetrics(): Record<string, PerformanceMetrics> {
    const result: Record<string, PerformanceMetrics> = {};
    for (const operation of this.metrics.keys()) {
      result[operation] = this.getMetrics(operation);
    }
    return result;
  }

  /**
   * Get recent alerts
   */
  public getAlerts(limit = 20): PerformanceAlert[] {
    return this.alerts.slice(-limit);
  }

  /**
   * Add a performance alert listener
   */
  public addAlertListener(listener: (alert: PerformanceAlert) => void): void {
    this.listeners.push(listener);
  }

  /**
   * Remove a performance alert listener
   */
  public removeAlertListener(
    listener: (alert: PerformanceAlert) => void,
  ): void {
    const index = this.listeners.indexOf(listener);
    if (index > -1) {
      this.listeners.splice(index, 1);
    }
  }

  /**
   * Clear all metrics and alerts
   */
  public clear(): void {
    this.metrics.clear();
    this.alerts = [];
  }

  /**
   * Export metrics as JSON
   */
  public exportMetrics(): string {
    return JSON.stringify(
      {
        metrics: this.getAllMetrics(),
        alerts: this.alerts,
        timestamp: new Date().toISOString(),
      },
      null,
      2,
    );
  }

  /**
   * Get performance summary report
   */
  public getSummaryReport(): string {
    const metrics = this.getAllMetrics();
    const lines: string[] = [];

    lines.push("=== Performance Summary ===");
    lines.push(`Generated: ${new Date().toISOString()}`);
    lines.push("");

    // Overall performance status
    const slowOperations = Object.entries(metrics)
      .filter(([_, m]) => m.average > this.getThreshold(_))
      .sort((a, b) => b[1].average - a[1].average);

    if (slowOperations.length === 0) {
      lines.push("✅ All operations performing within acceptable limits");
    } else {
      lines.push(
        `⚠️  ${slowOperations.length} operations exceeding thresholds:`,
      );
      for (const [operation, metrics] of slowOperations) {
        const threshold = this.getThreshold(operation);
        lines.push(
          `  ${operation}: ${metrics.average}ms (threshold: ${threshold}ms)`,
        );
      }
    }

    lines.push("");

    // Detailed metrics
    lines.push("=== Detailed Metrics ===");
    for (const [operation, operationMetrics] of Object.entries(metrics)) {
      const threshold = this.getThreshold(operation);
      const status = operationMetrics.average <= threshold ? "✅" : "⚠️";

      lines.push(`${status} ${operation}:`);
      lines.push(`  Average: ${operationMetrics.average}ms`);
      lines.push(`  Median: ${operationMetrics.median}ms`);
      lines.push(`  P95: ${operationMetrics.p95}ms`);
      lines.push(`  P99: ${operationMetrics.p99}ms`);
      lines.push(
        `  Range: ${operationMetrics.min}ms - ${operationMetrics.max}ms`,
      );
      lines.push(`  Samples: ${operationMetrics.count}`);
      lines.push("");
    }

    // Recent alerts
    if (this.alerts.length > 0) {
      lines.push(`=== Recent Alerts (${this.alerts.length}) ===`);
      const recentAlerts = this.alerts.slice(-10);
      for (const alert of recentAlerts) {
        lines.push(
          `${alert.timestamp.toISOString()}: ${alert.operation} took ${alert.duration}ms (threshold: ${alert.threshold}ms)`,
        );
      }
    }

    return lines.join("\n");
  }

  /**
   * Create a performance alert
   */
  private createAlert(
    operation: string,
    duration: number,
    threshold: number,
  ): void {
    const alert: PerformanceAlert = {
      operation,
      duration,
      threshold,
      timestamp: new Date(),
      message: `${operation} exceeded performance threshold: ${duration}ms > ${threshold}ms`,
    };

    this.alerts.push(alert);

    // Limit alert history
    if (this.alerts.length > this.MAX_ALERTS) {
      this.alerts.shift();
    }

    // Notify listeners
    this.listeners.forEach((listener) => {
      try {
        listener(alert);
      } catch (error) {
        console.error("Error in performance alert listener:", error);
      }
    });
  }

  /**
   * Get threshold for an operation
   */
  private getThreshold(operation: string): number {
    return this.thresholds[operation] || 100;
  }

  /**
   * Set custom threshold for an operation
   */
  public setThreshold(operation: string, threshold: number): void {
    this.thresholds[operation] = threshold;
  }

  /**
   * Get operation count
   */
  public getOperationCount(operation: string): number {
    return (this.metrics.get(operation) || []).length;
  }

  /**
   * Get total operations count
   */
  public getTotalOperationCount(): number {
    let total = 0;
    for (const samples of this.metrics.values()) {
      total += samples.length;
    }
    return total;
  }
}

/**
 * Performance decorator for automatic timing
 */
export function measurePerformance(
  monitor: PerformanceMonitor,
  operation: string,
) {
  return function (
    target: object,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (this: object, ...args: unknown[]) {
      const stopTimer = monitor.startTimer(operation);
      try {
        const result = await originalMethod.apply(this, args);
        return result;
      } finally {
        stopTimer();
      }
    };

    return descriptor;
  };
}

/**
 * Utility class for cache cleanup management
 */
export class CacheCleanupManager {
  private cleanupTasks: {
    name: string;
    cleanup: () => void;
    lastRun: number;
    interval: number;
  }[] = [];

  /**
   * Add a cache for automatic cleanup
   */
  public addCache(
    name: string,
    cache: Map<unknown, { timestamp: number }>,
    maxAge: number,
    interval = 30000,
  ): void {
    this.cleanupTasks.push({
      name,
      cleanup: () => this.cleanupCache(cache, maxAge),
      lastRun: 0,
      interval,
    });
  }

  /**
   * Add a custom cleanup task
   */
  public addTask(name: string, cleanup: () => void, interval = 30000): void {
    this.cleanupTasks.push({
      name,
      cleanup,
      lastRun: 0,
      interval,
    });
  }

  /**
   * Run cleanup for all caches
   */
  public cleanup(): void {
    const now = Date.now();
    let cleanedCount = 0;
    let totalRemoved = 0;

    for (const task of this.cleanupTasks) {
      if (now - task.lastRun >= task.interval) {
        const initialSize = this.getCacheSize(task.name);
        task.cleanup();
        task.lastRun = now;

        const finalSize = this.getCacheSize(task.name);
        const removed = initialSize - finalSize;
        totalRemoved += removed;
        cleanedCount++;

        if (removed > 0) {
          console.debug(
            `Cache cleanup (${task.name}): removed ${removed} entries`,
          );
        }
      }
    }

    if (cleanedCount > 0) {
      console.debug(
        `Cache cleanup completed: ${cleanedCount} tasks, ${totalRemoved} entries removed`,
      );
    }
  }

  /**
   * Force cleanup for a specific cache
   */
  public cleanupNow(name: string): void {
    const task = this.cleanupTasks.find((t) => t.name === name);
    if (task) {
      task.cleanup();
      task.lastRun = Date.now();
    }
  }

  /**
   * Get cache size (helper method)
   */
  private getCacheSize(_cacheName: string): number {
    // This is a placeholder - in real implementation, we'd need to track cache references
    return 0;
  }

  /**
   * Clean up expired entries from a cache
   */
  private cleanupCache(
    cache: Map<unknown, { timestamp: number }>,
    maxAge: number,
  ): void {
    const now = Date.now();
    const toDelete: unknown[] = [];

    for (const [key, value] of cache.entries()) {
      if (value && typeof value === "object" && "timestamp" in value) {
        const timestamp = (value as { timestamp: number }).timestamp;
        if (now - timestamp > maxAge) {
          toDelete.push(key);
        }
      }
    }

    for (const key of toDelete) {
      cache.delete(key);
    }
  }

  /**
   * Get statistics about cleanup tasks
   */
  public getStats(): {
    taskCount: number;
    tasksRun: number;
    totalIntervals: number;
  } {
    const now = Date.now();
    let tasksRun = 0;
    let totalIntervals = 0;

    for (const _task of this.cleanupTasks) {
      totalIntervals++;
      if (now - _task.lastRun < _task.interval) {
        tasksRun++;
      }
    }

    return {
      taskCount: this.cleanupTasks.length,
      tasksRun,
      totalIntervals,
    };
  }
}
