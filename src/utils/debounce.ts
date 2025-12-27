/**
 * Debounce utility for StatusBar Quick Actions
 */

/**
 * Creates a debounced function that delays invoking func until after wait milliseconds
 * have elapsed since the last time the debounced function was invoked
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number,
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) {
      clearTimeout(timeout);
    }

    timeout = setTimeout(later, wait);
  };
}

/**
 * Manages debounced visibility checks for buttons
 */
export class DebouncedVisibilityChecker {
  private debouncedChecks: Map<string, (...args: unknown[]) => void>;
  private defaultDelay: number;

  constructor(defaultDelay: number) {
    this.debouncedChecks = new Map();
    this.defaultDelay = defaultDelay;
  }

  /**
   * Get or create a debounced check function for a button
   */
  public getDebouncedCheck(
    buttonId: string,
    checkFn: () => void,
    customDelay?: number,
  ): () => void {
    const key = buttonId;
    if (!this.debouncedChecks.has(key)) {
      const delay = customDelay ?? this.defaultDelay;
      this.debouncedChecks.set(key, debounce(checkFn, delay));
    }
    return this.debouncedChecks.get(key)!;
  }

  /**
   * Remove a debounced check function for a button
   */
  public removeDebouncedCheck(buttonId: string): void {
    this.debouncedChecks.delete(buttonId);
  }

  /**
   * Clear all debounced check functions
   */
  public clear(): void {
    this.debouncedChecks.clear();
  }

  /**
   * Dispose of all resources
   */
  public dispose(): void {
    this.clear();
  }

  /**
   * Get the number of registered debounced checks
   */
  public size(): number {
    return this.debouncedChecks.size;
  }

  /**
   * Check if a debounced check exists for a button
   */
  public has(buttonId: string): boolean {
    return this.debouncedChecks.has(buttonId);
  }
}
