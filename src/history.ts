/**
 * Command history management for StatusBar Quick Actions
 */

import { CommandHistoryEntry, ExecutionResult } from "./types";

export class HistoryManager {
  private history: CommandHistoryEntry[] = [];
  private maxEntries = 100;

  /**
   * Add a command execution to history
   */
  public addEntry(
    buttonId: string,
    command: string,
    result: ExecutionResult,
  ): void {
    const entry: CommandHistoryEntry = {
      id: this.generateId(),
      buttonId,
      command,
      result,
    };

    this.history.unshift(entry);

    // Limit history size
    if (this.history.length > this.maxEntries) {
      this.history = this.history.slice(0, this.maxEntries);
    }
  }

  /**
   * Get all history entries
   */
  public getHistory(): CommandHistoryEntry[] {
    return [...this.history];
  }

  /**
   * Get history entries for a specific button
   */
  public getHistoryForButton(buttonId: string): CommandHistoryEntry[] {
    return this.history.filter((entry) => entry.buttonId === buttonId);
  }

  /**
   * Clear all history
   */
  public clearHistory(): void {
    this.history = [];
  }

  /**
   * Get statistics
   */
  public getStatistics(): {
    totalCommands: number;
    successfulCommands: number;
    failedCommands: number;
    averageExecutionTime: number;
  } {
    const totalCommands = this.history.length;
    const successfulCommands = this.history.filter(
      (entry) => entry.result.code === 0,
    ).length;
    const failedCommands = totalCommands - successfulCommands;

    const executionTimes = this.history
      .filter((entry) => entry.result.duration > 0)
      .map((entry) => entry.result.duration);

    const averageExecutionTime =
      executionTimes.length > 0
        ? executionTimes.reduce((sum, time) => sum + time, 0) /
          executionTimes.length
        : 0;

    return {
      totalCommands,
      successfulCommands,
      failedCommands,
      averageExecutionTime: Math.round(averageExecutionTime),
    };
  }

  /**
   * Search history entries
   */
  public searchHistory(query: string): CommandHistoryEntry[] {
    const lowerQuery = query.toLowerCase();
    return this.history.filter(
      (entry) =>
        entry.command.toLowerCase().includes(lowerQuery) ||
        entry.buttonId.toLowerCase().includes(lowerQuery) ||
        entry.result.stdout.toLowerCase().includes(lowerQuery),
    );
  }

  /**
   * Export history to JSON
   */
  public exportHistory(): string {
    return JSON.stringify(this.history, null, 2);
  }

  /**
   * Import history from JSON
   */
  public importHistory(jsonData: string): void {
    try {
      const importedEntries = JSON.parse(jsonData) as CommandHistoryEntry[];
      this.history = [...importedEntries, ...this.history];

      // Limit after import
      if (this.history.length > this.maxEntries) {
        this.history = this.history.slice(0, this.maxEntries);
      }
    } catch (error) {
      console.error("Failed to import history:", error);
    }
  }

  /**
   * Set maximum number of entries to keep
   */
  public setMaxEntries(maxEntries: number): void {
    this.maxEntries = maxEntries;

    // Trim history if necessary
    if (this.history.length > maxEntries) {
      this.history = this.history.slice(0, maxEntries);
    }
  }

  /**
   * Generate unique ID for history entry
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get most frequently used commands
   */
  public getMostUsedCommands(
    limit = 10,
  ): { command: string; count: number; buttonId: string }[] {
    const commandCounts = new Map<
      string,
      { count: number; buttonId: string }
    >();

    this.history.forEach((entry) => {
      const key = entry.command;
      const existing = commandCounts.get(key);

      if (existing) {
        existing.count++;
      } else {
        commandCounts.set(key, { count: 1, buttonId: entry.buttonId });
      }
    });

    return Array.from(commandCounts.entries())
      .map(([command, data]) => ({
        command,
        count: data.count,
        buttonId: data.buttonId,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }
}
