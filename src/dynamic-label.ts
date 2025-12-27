/**
 * Dynamic Label Management for StatusBar Quick Actions
 * Handles dynamic label evaluation and refresh
 */

import * as vscode from "vscode";
import * as https from "https";
import * as http from "http";
import { DynamicLabelField, DynamicLabelState } from "./types";

/**
 * Dynamic Label Manager
 * Evaluates and refreshes dynamic labels
 */
export class DynamicLabelManager {
  private labelStates = new Map<string, DynamicLabelState>();
  private gitExtension: unknown = null;

  /**
   * Initialize the dynamic label manager
   */
  public async initialize(): Promise<void> {
    // Try to get Git extension
    try {
      const gitExt = vscode.extensions.getExtension("vscode.git");
      if (gitExt) {
        this.gitExtension = gitExt.isActive
          ? gitExt.exports
          : await gitExt.activate();
      }
    } catch (error) {
      console.warn("Git extension not available:", error);
    }
  }

  /**
   * Evaluate a dynamic label field
   */
  public async evaluateLabel(
    buttonId: string,
    field: DynamicLabelField,
  ): Promise<string> {
    try {
      let value: string;

      switch (field.type) {
        case "time":
          value = this.evaluateTimeLabel(field);
          break;
        case "url":
          value = await this.evaluateUrlLabel(field);
          break;
        case "env":
          value = this.evaluateEnvLabel(field);
          break;
        case "git":
          value = await this.evaluateGitLabel(field);
          break;
        case "custom":
          value = this.evaluateCustomLabel(field);
          break;
        default:
          value = field.fallback || "N/A";
      }

      // Apply template if provided
      if (field.template) {
        value = this.applyTemplate(field.template, value);
      }

      // Update state
      const state: DynamicLabelState = {
        fieldConfig: field,
        lastValue: value,
        lastUpdated: new Date(),
      };

      // Setup refresh timer if needed
      if (field.refreshInterval && field.refreshInterval > 0) {
        this.setupRefreshTimer(buttonId, field);
      }

      this.labelStates.set(buttonId, state);

      return value;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      console.error(`Failed to evaluate dynamic label for ${buttonId}:`, error);

      // Update state with error
      const state: DynamicLabelState = {
        fieldConfig: field,
        lastValue: field.fallback || "Error",
        lastUpdated: new Date(),
        error: errorMessage,
      };
      this.labelStates.set(buttonId, state);

      return field.fallback || "Error";
    }
  }

  /**
   * Evaluate time-based label
   */
  private evaluateTimeLabel(field: DynamicLabelField): string {
    const now = new Date();
    const format = field.format || "HH:mm:ss";

    try {
      return this.formatDate(now, format);
    } catch (error) {
      console.error("Failed to format time:", error);
      return now.toLocaleTimeString();
    }
  }

  /**
   * Format date according to pattern
   */
  private formatDate(date: Date, format: string): string {
    const pad = (n: number) => String(n).padStart(2, "0");

    const replacements: Record<string, string> = {
      YYYY: String(date.getFullYear()),
      YY: String(date.getFullYear()).slice(-2),
      MM: pad(date.getMonth() + 1),
      DD: pad(date.getDate()),
      HH: pad(date.getHours()),
      hh: pad(date.getHours() % 12 || 12),
      mm: pad(date.getMinutes()),
      ss: pad(date.getSeconds()),
      A: date.getHours() >= 12 ? "PM" : "AM",
      a: date.getHours() >= 12 ? "pm" : "am",
    };

    let result = format;
    for (const [pattern, value] of Object.entries(replacements)) {
      result = result.replace(new RegExp(pattern, "g"), value);
    }

    return result;
  }

  /**
   * Evaluate URL-based label
   */
  private async evaluateUrlLabel(field: DynamicLabelField): Promise<string> {
    if (!field.url) {
      throw new Error("URL is required for url-type dynamic label");
    }

    return new Promise((resolve, reject) => {
      const url = new URL(field.url!);
      const client = url.protocol === "https:" ? https : http;

      const request = client.get(field.url!, (response) => {
        let data = "";

        response.on("data", (chunk) => {
          data += chunk;
        });

        response.on("end", () => {
          try {
            // Try to parse as JSON first
            const json = JSON.parse(data);
            resolve(JSON.stringify(json));
          } catch {
            // Return raw text if not JSON
            resolve(data.trim().substring(0, 100)); // Limit to 100 chars
          }
        });
      });

      request.on("error", (error) => {
        reject(error);
      });

      request.setTimeout(5000, () => {
        request.destroy();
        reject(new Error("Request timeout"));
      });
    });
  }

  /**
   * Evaluate environment variable label
   */
  private evaluateEnvLabel(field: DynamicLabelField): string {
    if (!field.envVar) {
      throw new Error("Environment variable name is required");
    }

    const value = process.env[field.envVar];
    if (value === undefined) {
      throw new Error(`Environment variable '${field.envVar}' not found`);
    }

    return value;
  }

  /**
   * Evaluate Git-based label
   */
  private async evaluateGitLabel(field: DynamicLabelField): Promise<string> {
    if (!this.gitExtension) {
      throw new Error("Git extension not available");
    }

    if (!field.gitInfo) {
      throw new Error("Git info type is required");
    }

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const git = (this.gitExtension as any).getAPI(1);
      if (git.repositories.length === 0) {
        throw new Error("No Git repository found");
      }

      const repo = git.repositories[0];

      switch (field.gitInfo) {
        case "branch":
          return repo.state.HEAD?.name || "Unknown";
        case "status": {
          const changes =
            repo.state.workingTreeChanges.length +
            repo.state.indexChanges.length;
          return changes > 0 ? `${changes} changes` : "Clean";
        }
        case "remote":
          return repo.state.HEAD?.upstream?.remote || "No remote";
        default:
          throw new Error(`Unknown git info type: ${field.gitInfo}`);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to get git info: ${errorMessage}`);
    }
  }

  /**
   * Evaluate custom label (placeholder for future extension)
   */
  private evaluateCustomLabel(field: DynamicLabelField): string {
    if (!field.customFunction) {
      throw new Error("Custom function name is required");
    }

    // Placeholder for custom function evaluation
    // In a real implementation, this could load and execute user-defined functions
    throw new Error(
      `Custom functions not yet implemented: ${field.customFunction}`,
    );
  }

  /**
   * Apply template to value
   */
  private applyTemplate(template: string, value: string): string {
    return template.replace(/\$\{value\}/g, value);
  }

  /**
   * Setup automatic refresh timer for a label
   */
  private setupRefreshTimer(buttonId: string, field: DynamicLabelField): void {
    // Clear existing timer if any
    const existingState = this.labelStates.get(buttonId);
    if (existingState?.refreshTimer) {
      clearInterval(existingState.refreshTimer);
    }

    // Only setup timer if refresh interval is positive
    if (!field.refreshInterval || field.refreshInterval <= 0) {
      return;
    }

    // Setup new timer
    const timer = setInterval(async () => {
      try {
        await this.evaluateLabel(buttonId, field);
        // Emit event or callback to update button display
        this.onLabelRefresh?.(buttonId);
      } catch (error) {
        console.error(`Failed to refresh label for ${buttonId}:`, error);
      }
    }, field.refreshInterval);

    // Update state with timer
    const state = this.labelStates.get(buttonId);
    if (state) {
      state.refreshTimer = timer;
    }
  }

  /**
   * Callback for label refresh (to be set by extension)
   */
  public onLabelRefresh?: (buttonId: string) => void;

  /**
   * Get label state
   */
  public getLabelState(buttonId: string): DynamicLabelState | undefined {
    return this.labelStates.get(buttonId);
  }

  /**
   * Stop refresh timer for a button
   */
  public stopRefreshTimer(buttonId: string): void {
    const state = this.labelStates.get(buttonId);
    if (state?.refreshTimer) {
      clearInterval(state.refreshTimer);
      state.refreshTimer = undefined;
    }
  }

  /**
   * Stop all refresh timers
   */
  public stopAllRefreshTimers(): void {
    for (const [buttonId] of this.labelStates) {
      this.stopRefreshTimer(buttonId);
    }
  }

  /**
   * Force refresh a label
   */
  public async refreshLabel(buttonId: string): Promise<string | null> {
    const state = this.labelStates.get(buttonId);
    if (!state) {
      return null;
    }

    return await this.evaluateLabel(buttonId, state.fieldConfig);
  }

  /**
   * Clear label state
   */
  public clearLabelState(buttonId: string): void {
    this.stopRefreshTimer(buttonId);
    this.labelStates.delete(buttonId);
  }

  /**
   * Dispose of resources
   */
  public dispose(): void {
    this.stopAllRefreshTimers();
    this.labelStates.clear();
  }
}
