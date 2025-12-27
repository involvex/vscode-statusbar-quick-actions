/**
 * Output panel management for StatusBar Quick Actions
 */

import * as vscode from "vscode";
import { OutputPanelConfig } from "./types";

/**
 * Manages output panels for command execution with streaming support
 */
export class OutputPanelManager {
  private panels: Map<string, vscode.OutputChannel>;
  private sharedPanel: vscode.OutputChannel | null;
  private config: OutputPanelConfig;
  private outputHistory: Map<string, string[]>;

  constructor(config: OutputPanelConfig) {
    this.config = config;
    this.panels = new Map();
    this.sharedPanel = null;
    this.outputHistory = new Map();
  }

  /**
   * Get or create an output panel for a button
   */
  public getOrCreatePanel(
    buttonId: string,
    buttonName: string,
  ): vscode.OutputChannel {
    if (this.config.mode === "shared") {
      return this.getSharedPanel();
    }

    // Per-button mode
    if (!this.panels.has(buttonId)) {
      const panel = vscode.window.createOutputChannel(
        `StatusBar: ${buttonName}`,
      );
      this.panels.set(buttonId, panel);
    }

    return this.panels.get(buttonId)!;
  }

  /**
   * Get or create the shared output panel
   */
  private getSharedPanel(): vscode.OutputChannel {
    if (!this.sharedPanel) {
      this.sharedPanel = vscode.window.createOutputChannel(
        "StatusBar Quick Actions",
      );
    }
    return this.sharedPanel;
  }

  /**
   * Append output to a panel
   */
  public appendOutput(
    buttonId: string,
    data: string,
    type: "stdout" | "stderr",
  ): void {
    const panel =
      this.config.mode === "shared"
        ? this.getSharedPanel()
        : this.panels.get(buttonId);

    if (!panel) {
      console.warn(`Output panel not found for button ${buttonId}`);
      return;
    }

    const formattedOutput = this.formatOutput(data, type);
    panel.append(formattedOutput);

    // Add to history if preservation is enabled
    if (this.config.preserveHistory) {
      this.addToHistory(buttonId, formattedOutput);
    }

    // Trim panel if max lines exceeded
    this.trimPanelIfNeeded(buttonId);
  }

  /**
   * Append a line to the output panel
   */
  public appendLine(
    buttonId: string,
    data: string,
    type: "stdout" | "stderr",
  ): void {
    const panel =
      this.config.mode === "shared"
        ? this.getSharedPanel()
        : this.panels.get(buttonId);

    if (!panel) {
      console.warn(`Output panel not found for button ${buttonId}`);
      return;
    }

    const formattedOutput = this.formatOutput(data, type);
    panel.appendLine(formattedOutput);

    // Add to history
    if (this.config.preserveHistory) {
      this.addToHistory(buttonId, formattedOutput + "\n");
    }
  }

  /**
   * Clear a specific panel
   */
  public clearPanel(buttonId: string): void {
    const panel =
      this.config.mode === "shared"
        ? this.getSharedPanel()
        : this.panels.get(buttonId);

    if (panel) {
      panel.clear();
    }

    // Clear history
    this.outputHistory.delete(buttonId);
  }

  /**
   * Show a panel
   */
  public showPanel(buttonId: string, preserveFocus = false): void {
    const panel =
      this.config.mode === "shared"
        ? this.getSharedPanel()
        : this.panels.get(buttonId);

    if (panel) {
      panel.show(preserveFocus);
    }
  }

  /**
   * Hide a panel
   */
  public hidePanel(buttonId: string): void {
    const panel =
      this.config.mode === "shared"
        ? this.getSharedPanel()
        : this.panels.get(buttonId);

    if (panel) {
      panel.hide();
    }
  }

  /**
   * Format output based on configuration
   */
  private formatOutput(data: string, type: "stdout" | "stderr"): string {
    let output = data;

    // Handle formatting mode
    switch (this.config.format) {
      case "raw":
        // Strip ANSI codes
        output = this.stripAnsiCodes(data);
        break;

      case "formatted":
        // Strip ANSI codes and add timestamp
        output = this.stripAnsiCodes(data);
        if (this.config.showTimestamps) {
          const timestamp = this.getTimestamp();
          // Only add timestamp to non-empty lines
          if (output.trim()) {
            output = `[${timestamp}] ${output}`;
          }
        }
        break;

      case "ansi":
        // Preserve ANSI codes
        if (this.config.showTimestamps && output.trim()) {
          const timestamp = this.getTimestamp();
          output = `[${timestamp}] ${output}`;
        }
        break;
    }

    // Add error prefix for stderr
    if (type === "stderr" && output.trim()) {
      output = `[ERROR] ${output}`;
    }

    return output;
  }

  /**
   * Strip ANSI color codes from text
   */
  private stripAnsiCodes(text: string): string {
    // eslint-disable-next-line no-control-regex
    return text.replace(/\x1b\[[0-9;]*m/g, "");
  }

  /**
   * Get formatted timestamp
   */
  private getTimestamp(): string {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const seconds = String(now.getSeconds()).padStart(2, "0");
    return `${hours}:${minutes}:${seconds}`;
  }

  /**
   * Add output to history
   */
  private addToHistory(buttonId: string, output: string): void {
    if (!this.outputHistory.has(buttonId)) {
      this.outputHistory.set(buttonId, []);
    }

    const history = this.outputHistory.get(buttonId)!;
    history.push(output);

    // Trim history if needed
    if (history.length > this.config.maxLines) {
      history.splice(0, history.length - this.config.maxLines);
    }
  }

  /**
   * Trim panel content if max lines exceeded
   */
  private trimPanelIfNeeded(buttonId: string): void {
    // Note: VSCode OutputChannel doesn't provide direct line count access
    // This is a placeholder for future optimization if needed
    // The history tracking serves as a workaround for now

    // Check if history exceeds max lines and trim if needed
    const history = this.outputHistory.get(buttonId);
    if (history && history.length > this.config.maxLines) {
      history.splice(0, history.length - this.config.maxLines);
    }
  }

  /**
   * Get output history for a button
   */
  public getHistory(buttonId: string): string[] {
    return this.outputHistory.get(buttonId) || [];
  }

  /**
   * Clear history for a button
   */
  public clearHistory(buttonId: string): void {
    this.outputHistory.delete(buttonId);
  }

  /**
   * Clear all history
   */
  public clearAllHistory(): void {
    this.outputHistory.clear();
  }

  /**
   * Update configuration
   */
  public updateConfig(config: OutputPanelConfig): void {
    this.config = config;

    // If switching modes, clean up existing panels
    if (config.mode === "shared" && this.panels.size > 0) {
      // Dispose per-button panels
      this.panels.forEach((panel) => panel.dispose());
      this.panels.clear();
    } else if (config.mode === "per-button" && this.sharedPanel) {
      // Dispose shared panel
      this.sharedPanel.dispose();
      this.sharedPanel = null;
    }
  }

  /**
   * Get current configuration
   */
  public getConfig(): OutputPanelConfig {
    return { ...this.config };
  }

  /**
   * Check if output panel is enabled
   */
  public isEnabled(): boolean {
    return this.config.enabled;
  }

  /**
   * Get panel for a button (if exists)
   */
  public getPanel(buttonId: string): vscode.OutputChannel | null {
    if (this.config.mode === "shared") {
      return this.sharedPanel;
    }
    return this.panels.get(buttonId) || null;
  }

  /**
   * Check if a panel exists for a button
   */
  public hasPanel(buttonId: string): boolean {
    if (this.config.mode === "shared") {
      return this.sharedPanel !== null;
    }
    return this.panels.has(buttonId);
  }

  /**
   * Get all panel IDs
   */
  public getPanelIds(): string[] {
    return Array.from(this.panels.keys());
  }

  /**
   * Dispose of a specific panel
   */
  public disposePanel(buttonId: string): void {
    const panel = this.panels.get(buttonId);
    if (panel) {
      panel.dispose();
      this.panels.delete(buttonId);
    }

    // Clear history
    this.outputHistory.delete(buttonId);
  }

  /**
   * Dispose of all panels
   */
  public dispose(): void {
    // Dispose all per-button panels
    this.panels.forEach((panel) => panel.dispose());
    this.panels.clear();

    // Dispose shared panel
    if (this.sharedPanel) {
      this.sharedPanel.dispose();
      this.sharedPanel = null;
    }

    // Clear all history
    this.outputHistory.clear();
  }

  /**
   * Get statistics about output panels
   */
  public getStatistics(): {
    panelCount: number;
    mode: string;
    totalHistoryLines: number;
  } {
    let totalHistoryLines = 0;
    this.outputHistory.forEach((history) => {
      totalHistoryLines += history.length;
    });

    return {
      panelCount: this.config.mode === "shared" ? 1 : this.panels.size,
      mode: this.config.mode,
      totalHistoryLines,
    };
  }

  /**
   * Export history to string
   */
  public exportHistory(buttonId: string): string {
    const history = this.getHistory(buttonId);
    return history.join("");
  }

  /**
   * Export all history to string
   */
  public exportAllHistory(): Record<string, string> {
    const result: Record<string, string> = {};
    this.outputHistory.forEach((history, buttonId) => {
      result[buttonId] = history.join("");
    });
    return result;
  }
}
