/**
 * Visibility management for StatusBar Quick Actions
 */

import {
  VisibilityContext,
  VisibilityConfig,
  VisibilityCondition,
} from "./types";
import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs";
import { DebouncedVisibilityChecker } from "./utils/debounce";

export class VisibilityManager {
  private debouncedChecker: DebouncedVisibilityChecker;
  private visibilityCache: Map<string, boolean>;

  constructor(defaultDebounceMs = 300) {
    this.debouncedChecker = new DebouncedVisibilityChecker(defaultDebounceMs);
    this.visibilityCache = new Map();
  }
  /**
   * Check if a button should be visible based on current context
   */
  public isVisible(
    buttonConfig: VisibilityConfig,
    context: VisibilityContext,
  ): boolean {
    if (!buttonConfig.conditions || buttonConfig.conditions.length === 0) {
      return true;
    }

    // All conditions must be met (AND logic)
    return buttonConfig.conditions.every((condition) => {
      const result = this.evaluateCondition(condition, context);
      // Apply invert logic if specified
      return condition.invert ? !result : result;
    });
  }

  /**
   * Evaluate a single visibility condition
   */
  private evaluateCondition(
    condition: VisibilityCondition,
    context: VisibilityContext,
  ): boolean {
    switch (condition.type) {
      case "fileType":
        return this.checkFileTypeCondition(condition, context);
      case "fileExists":
        return this.checkFileExistsCondition(condition, context);
      case "gitStatus":
        return this.checkGitStatusCondition(condition, context);
      case "workspaceFolder":
        return this.checkWorkspaceFolderCondition(condition, context);
      default:
        return false;
    }
  }

  /**
   * Get current visibility context
   */
  public getCurrentContext(): VisibilityContext {
    const activeTextEditor = vscode.window.activeTextEditor;
    const activeFile = activeTextEditor?.document.uri;
    const fileName = activeTextEditor?.document.fileName;
    const extension = activeTextEditor?.document.languageId;

    return {
      activeFile,
      activeFileName: fileName,
      activeFileExtension: extension,
      workspaceFolders: [...(vscode.workspace.workspaceFolders || [])],
    };
  }

  /**
   * Check file type condition
   */
  private checkFileTypeCondition(
    condition: VisibilityCondition,
    context: VisibilityContext,
  ): boolean {
    if (!condition.patterns || !context.activeFileName) {
      return false;
    }

    const fileName = path.basename(context.activeFileName);
    const fileExt = context.activeFileExtension;

    return condition.patterns.some((pattern: string) => {
      // Check if pattern is a glob pattern
      if (pattern.includes("*") || pattern.includes("?")) {
        return this.simpleGlobMatch(fileName, pattern);
      }
      // Check if pattern is an extension
      else if (pattern.startsWith(".")) {
        return fileName.endsWith(pattern);
      }
      // Check if pattern matches language ID
      else {
        return fileExt === pattern;
      }
    });
  }

  /**
   * Check file exists condition
   */
  private checkFileExistsCondition(
    condition: VisibilityCondition,
    _context: VisibilityContext,
  ): boolean {
    if (!condition.path) {
      return false;
    }

    const workspaceFolder = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
    if (!workspaceFolder) {
      return false;
    }

    const fullPath = path.isAbsolute(condition.path)
      ? condition.path
      : path.join(workspaceFolder, condition.path);

    return fs.existsSync(fullPath);
  }

  /**
   * Check git status condition
   */
  private checkGitStatusCondition(
    condition: VisibilityCondition,
    _context: VisibilityContext,
  ): boolean {
    if (!condition.status) {
      return false;
    }

    const gitExtension = vscode.extensions.getExtension("vscode.git");
    if (!gitExtension) {
      return false;
    }

    const git = gitExtension.exports.getAPI(1);
    const repo = git.repositories[0];

    if (!repo) {
      return condition.status === "repository" ? false : true;
    }

    switch (condition.status) {
      case "repository":
        return true;
      case "clean":
        return (
          repo.state.workingTreeChanges.length === 0 &&
          repo.state.indexChanges.length === 0
        );
      case "dirty":
        return (
          repo.state.workingTreeChanges.length > 0 ||
          repo.state.indexChanges.length > 0
        );
      case "ahead":
        return (repo.state.HEAD?.ahead || 0) > 0;
      case "behind":
        return (repo.state.HEAD?.behind || 0) > 0;
      default:
        return false;
    }
  }

  /**
   * Check workspace folder condition
   */
  private checkWorkspaceFolderCondition(
    condition: VisibilityCondition,
    context: VisibilityContext,
  ): boolean {
    if (!condition.folders || !context.workspaceFolders) {
      return false;
    }

    return context.workspaceFolders.some((folder) =>
      condition.folders?.includes(folder.name),
    );
  }

  /**
   * Check visibility with debouncing
   */
  public checkVisibilityDebounced(
    buttonId: string,
    buttonConfig: VisibilityConfig,
    customDebounce?: number,
    callback?: (isVisible: boolean) => void,
  ): void {
    const checkFn = () => {
      const context = this.getCurrentContext();
      const isVisible = this.isVisible(buttonConfig, context);
      this.visibilityCache.set(buttonId, isVisible);
      if (callback) {
        callback(isVisible);
      }
    };

    // Use per-button custom debounce if specified, otherwise use global default
    const delay = customDebounce ?? buttonConfig.debounceMs;

    const debouncedCheck = this.debouncedChecker.getDebouncedCheck(
      buttonId,
      checkFn,
      delay,
    );

    debouncedCheck();
  }

  /**
   * Get cached visibility result for a button
   */
  public getCachedVisibility(buttonId: string): boolean | undefined {
    return this.visibilityCache.get(buttonId);
  }

  /**
   * Simple glob pattern matching (replaces minimatch for basic patterns)
   */
  private simpleGlobMatch(text: string, pattern: string): boolean {
    // Convert glob pattern to regex
    let regexPattern = pattern
      .replace(/\./g, "\\.") // Escape dots
      .replace(/\*/g, ".*") // Replace * with .*
      .replace(/\?/g, ".") // Replace ? with .
      .replace(/\+\//g, ".*\\/"); // Handle path separators

    // Ensure full string match
    regexPattern = `^${regexPattern}$`;

    try {
      const regex = new RegExp(regexPattern, "i"); // Case insensitive
      return regex.test(text);
    } catch (error) {
      console.warn(`Invalid glob pattern: ${pattern}`, error);
      return false;
    }
  }

  /**
   * Clear cached visibility for a button
   */
  public clearCachedVisibility(buttonId: string): void {
    this.visibilityCache.delete(buttonId);
  }

  /**
   * Clear all cached visibility results
   */
  public clearAllCachedVisibility(): void {
    this.visibilityCache.clear();
  }

  /**
   * Update visibility when editor changes
   */
  public onEditorChanged(): void {
    // This would trigger re-evaluation of button visibility
    // Implementation would depend on how the main extension handles this
  }

  /**
   * Dispose of resources
   */
  public dispose(): void {
    this.debouncedChecker.dispose();
    this.visibilityCache.clear();
  }
}
