/**
 * Notification management for StatusBar Quick Actions
 */

import * as vscode from "vscode";
import { NotificationConfig, ExecutionResult } from "./types";

export class NotificationManager {
  private config: NotificationConfig;

  constructor(config: NotificationConfig) {
    this.config = config;
  }

  /**
   * Show success notification
   */
  public showSuccess(buttonText: string, result: ExecutionResult): void {
    if (!this.config.showSuccess) {
      return;
    }

    const message = this.getSuccessMessage(buttonText, result);

    vscode.window
      .showInformationMessage(message, "View Details")
      .then((selection) => {
        if (selection === "View Details") {
          this.showDetails(result);
        }
      });
  }

  /**
   * Show error notification
   */
  public showError(buttonText: string, error: string | Error): void {
    if (!this.config.showError) {
      return;
    }

    const message = `${buttonText}: ${error instanceof Error ? error.message : error}`;

    vscode.window
      .showErrorMessage(message, "View Details")
      .then((selection) => {
        if (selection === "View Details") {
          const errorDetails =
            error instanceof Error ? error.stack || error.message : error;
          vscode.window.showErrorMessage(errorDetails, { modal: true });
        }
      });
  }

  /**
   * Show progress notification
   */
  public showProgress(buttonText: string): void {
    if (!this.config.showProgress) {
      return;
    }

    vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title: `Executing: ${buttonText}`,
        cancellable: false,
      },
      async (_progress) => {
        // Progress will be updated by the caller
        return new Promise<void>((resolve) => {
          // This would be resolved when the command completes
          resolve();
        });
      },
    );
  }

  /**
   * Show warning notification
   */
  public showWarning(message: string, details?: string): void {
    const fullMessage = details ? `${message}\n${details}` : message;
    vscode.window.showWarningMessage(fullMessage);
  }

  /**
   * Show info notification
   */
  public showInfo(message: string, details?: string): void {
    const fullMessage = details ? `${message}\n${details}` : message;
    vscode.window.showInformationMessage(fullMessage);
  }

  /**
   * Show notification with custom actions
   */
  public showCustomNotification(
    type: "info" | "warning" | "error",
    message: string,
    actions: string[],
  ): Thenable<string | undefined> {
    switch (type) {
      case "error":
        return vscode.window.showErrorMessage(message, ...actions);
      case "warning":
        return vscode.window.showWarningMessage(message, ...actions);
      default:
        return vscode.window.showInformationMessage(message, ...actions);
    }
  }

  /**
   * Update configuration
   */
  public updateConfig(config: NotificationConfig): void {
    this.config = config;
  }

  /**
   * Get success message
   */
  private getSuccessMessage(
    buttonText: string,
    result: ExecutionResult,
  ): string {
    const duration = result.duration ? ` in ${result.duration}ms` : "";
    const output =
      this.config.includeOutput && result.stdout
        ? `: ${result.stdout.substring(0, 50)}${result.stdout.length > 50 ? "..." : ""}`
        : "";

    return `✅ ${buttonText} completed successfully${duration}${output}`;
  }

  /**
   * Show execution details
   */
  private showDetails(result: ExecutionResult): void {
    const output = `Command Output:\n${result.stdout}\n\nErrors:\n${result.stderr}`;
    vscode.window.showInformationMessage(output, { modal: true });
  }

  /**
   * Show progress update
   */
  public updateProgress(_increment: number, _message?: string): void {
    // This would be called to update an existing progress notification
    // Implementation depends on how progress is tracked
  }

  /**
   * Dismiss notifications
   */
  public dismissAll(): void {
    // VSCode doesn't provide a way to dismiss specific notifications
    // This would be a no-op for now
  }

  /**
   * Check if notifications are enabled
   */
  public areNotificationsEnabled(): boolean {
    return (
      this.config.showSuccess ||
      this.config.showError ||
      this.config.showProgress
    );
  }

  /**
   * Get notification statistics
   */
  public getStats(): {
    successEnabled: boolean;
    errorEnabled: boolean;
    progressEnabled: boolean;
    position: string;
    duration: number;
  } {
    return {
      successEnabled: this.config.showSuccess,
      errorEnabled: this.config.showError,
      progressEnabled: this.config.showProgress,
      position: this.config.position,
      duration: this.config.duration,
    };
  }
}
