/**
 * Optimized Command Executor for StatusBar Quick Actions
 * Features: Command caching, lazy loading, package manager detection caching, and performance monitoring
 */

import {
  ExecutionResult,
  ExecutionOptions,
  ButtonCommand,
  GitApi,
} from "./types";
import * as vscode from "vscode";
import { exec, spawn } from "child_process";
import { promisify } from "util";
import * as path from "path";
import * as fs from "fs";
import { PerformanceMonitor } from "./utils/performance-monitor";

const execAsync = promisify(exec);

interface CachedResult {
  result: ExecutionResult;
  timestamp: number;
}

interface CachedPackageManager {
  manager: string;
  timestamp: number;
}

/**
 * Optimized Command Executor with caching and performance monitoring
 */
export class OptimizedCommandExecutor {
  private performanceMonitor: PerformanceMonitor;

  // Caching for command results
  private commandCache = new Map<string, CachedResult>();
  private readonly CACHE_TTL = 60000; // 1 minute
  private readonly MAX_CACHE_SIZE = 100;

  // Caching for package manager detection
  private packageManagerCache = new Map<string, CachedPackageManager>();
  private readonly PM_CACHE_TTL = 300000; // 5 minutes

  // Lazy loading for Git API
  private gitApi: GitApi | null = null;
  private gitApiPromise: Promise<GitApi | null> | null = null;

  // Command availability cache
  private commandAvailabilityCache = new Map<
    string,
    { result: boolean; timestamp: number }
  >();
  private readonly AVAILABILITY_CACHE_TTL = 120000; // 2 minutes

  constructor(performanceMonitor?: PerformanceMonitor) {
    this.performanceMonitor = performanceMonitor || new PerformanceMonitor();
  }

  /**
   * Execute a command with intelligent caching
   */
  public async execute(
    command: ButtonCommand,
    options: ExecutionOptions & { force?: boolean } = {},
  ): Promise<ExecutionResult> {
    const stopTimer = this.performanceMonitor.startTimer("command_execution");

    try {
      // Check cache first (unless forced)
      if (!options.force) {
        const cacheKey = this.getCacheKey(command, options);
        const cached = this.commandCache.get(cacheKey);
        if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
          this.performanceMonitor.recordMetric("command_cache_hit", 1);
          return cached.result;
        }
      }

      // If streaming is enabled, use executeWithStreaming
      if (options.streaming?.enabled) {
        const result = await this.executeWithStreaming(command, options);
        this.cacheResult(command, options, result);
        return result;
      }

      // Otherwise, use optimized exec logic
      const result = await this.executeOptimized(command, options);
      this.cacheResult(command, options, result);

      return result;
    } finally {
      stopTimer();
    }
  }

  /**
   * Execute command with streaming output
   */
  public async executeWithStreaming(
    command: ButtonCommand,
    options: ExecutionOptions,
  ): Promise<ExecutionResult> {
    const stopTimer = this.performanceMonitor.startTimer("streaming_execution");

    try {
      const startTime = Date.now();
      const { cmd, args, fullCommand } = this.buildCommand(command);

      const cwd =
        options.workingDirectory ||
        vscode.workspace.workspaceFolders?.[0]?.uri.fsPath ||
        process.cwd();
      const env = { ...process.env, ...options.environment };

      return new Promise((resolve, reject) => {
        const child = spawn(cmd, args, {
          cwd,
          env,
          shell: true,
          windowsHide: true,
        });

        let stdout = "";
        let stderr = "";

        // Handle stdout data
        child.stdout?.on("data", (data) => {
          const text = data.toString();
          stdout += text;
          if (options.streaming?.onStdout) {
            options.streaming.onStdout(text);
          }
        });

        // Handle stderr data
        child.stderr?.on("data", (data) => {
          const text = data.toString();
          stderr += text;
          if (options.streaming?.onStderr) {
            options.streaming.onStderr(text);
          }
        });

        // Handle process exit
        child.on("close", (code) => {
          resolve({
            code: code || 0,
            stdout: stdout.trim(),
            stderr: stderr.trim(),
            duration: Date.now() - startTime,
            timestamp: new Date(),
            command: fullCommand,
          });
        });

        // Handle errors
        child.on("error", (error) => {
          reject(error);
        });

        // Timeout handling
        if (options.timeout) {
          setTimeout(() => {
            child.kill();
            reject(
              new Error(`Command execution timeout after ${options.timeout}ms`),
            );
          }, options.timeout);
        }
      });
    } finally {
      stopTimer();
    }
  }

  /**
   * Check if a command type is available with caching
   */
  public async isCommandAvailable(commandType: string): Promise<boolean> {
    const cacheKey = `availability_${commandType}`;
    const cached = this.commandAvailabilityCache.get(cacheKey);

    if (cached && typeof cached === "object" && "timestamp" in cached) {
      const cacheEntry = cached as { result: boolean; timestamp: number };
      if (Date.now() - cacheEntry.timestamp < this.AVAILABILITY_CACHE_TTL) {
        return cacheEntry.result;
      }
    }

    const stopTimer = this.performanceMonitor.startTimer(
      "command_availability_check",
    );

    try {
      const checkCmd = process.platform === "win32" ? "where" : "which";
      await execAsync(`${checkCmd} ${commandType}`, {
        windowsHide: true,
      });

      this.commandAvailabilityCache.set(cacheKey, {
        result: true,
        timestamp: Date.now(),
      });
      return true;
    } catch {
      this.commandAvailabilityCache.set(cacheKey, {
        result: false,
        timestamp: Date.now(),
      });
      return false;
    } finally {
      stopTimer();
    }
  }

  /**
   * Get available package managers with caching
   */
  public async getAvailablePackageManagers(): Promise<string[]> {
    const cacheKey = "available_package_managers";
    const cached = this.packageManagerCache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < this.PM_CACHE_TTL) {
      return [cached.manager]; // Return single cached manager
    }

    const stopTimer = this.performanceMonitor.startTimer(
      "package_manager_detection",
    );

    try {
      const managers: string[] = [];
      const commands = ["npm", "yarn", "pnpm", "bun"];

      // Check availability in parallel for better performance
      const availabilityChecks = await Promise.all(
        commands.map((cmd) => this.isCommandAvailable(cmd)),
      );

      for (let i = 0; i < commands.length; i++) {
        if (availabilityChecks[i]) {
          managers.push(commands[i]);
        }
      }

      // Cache the first available manager for quick access
      if (managers.length > 0) {
        this.packageManagerCache.set(cacheKey, {
          manager: managers[0],
          timestamp: Date.now(),
        });
      }

      return managers;
    } finally {
      stopTimer();
    }
  }

  /**
   * Detect package manager with aggressive caching
   */
  public async detectPackageManager(
    workspacePath?: string,
  ): Promise<string | null> {
    if (!workspacePath) {
      workspacePath = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath || "";
    }

    if (!workspacePath) {
      return null;
    }

    const cacheKey = `pm_detect_${workspacePath}`;
    const cached = this.packageManagerCache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < this.PM_CACHE_TTL) {
      return cached.manager;
    }

    const stopTimer = this.performanceMonitor.startTimer(
      "package_manager_detection",
    );

    try {
      // Check for lock files in priority order
      const lockFiles = [
        { file: "bun.lockb", manager: "bun" },
        { file: "pnpm-lock.yaml", manager: "pnpm" },
        { file: "yarn.lock", manager: "yarn" },
        { file: "package-lock.json", manager: "npm" },
      ];

      for (const { file, manager } of lockFiles) {
        const lockPath = path.join(workspacePath, file);
        if (fs.existsSync(lockPath)) {
          // Verify the package manager is actually available
          if (await this.isCommandAvailable(manager)) {
            // Cache the result
            this.packageManagerCache.set(cacheKey, {
              manager,
              timestamp: Date.now(),
            });
            return manager;
          }
        }
      }

      // Fallback: check if package.json exists and return first available manager
      const packageJsonPath = path.join(workspacePath, "package.json");
      if (fs.existsSync(packageJsonPath)) {
        const availableManagers = await this.getAvailablePackageManagers();
        const firstManager = availableManagers[0] || null;

        if (firstManager) {
          this.packageManagerCache.set(cacheKey, {
            manager: firstManager,
            timestamp: Date.now(),
          });
        }

        return firstManager;
      }

      return null;
    } finally {
      stopTimer();
    }
  }

  /**
   * Execute Git operations with lazy loading
   */
  public async executeGitCommand(
    args: string[],
  ): Promise<{ stdout: string; stderr: string }> {
    const stopTimer = this.performanceMonitor.startTimer(
      "git_command_execution",
    );

    try {
      const gitApi = await this.getGitAPI();
      if (!gitApi) {
        throw new Error("Git extension not available");
      }

      // Use git API if available, otherwise fall back to command line
      if (gitApi.git && gitApi.git.exec) {
        return await gitApi.git.exec(args);
      } else {
        // Fallback to command line execution
        const { stdout, stderr } = await execAsync(`git ${args.join(" ")}`);
        return { stdout: stdout.toString(), stderr: stderr.toString() };
      }
    } finally {
      stopTimer();
    }
  }

  /**
   * Get performance metrics
   */
  public getPerformanceMetrics() {
    return this.performanceMonitor.getAllMetrics();
  }

  /**
   * Clear all caches
   */
  public clearCaches(): void {
    this.commandCache.clear();
    this.packageManagerCache.clear();
    this.commandAvailabilityCache.clear();
  }

  /**
   * Get cache statistics
   */
  public getCacheStatistics(): {
    commandCacheSize: number;
    packageManagerCacheSize: number;
    availabilityCacheSize: number;
    totalCachedCommands: number;
  } {
    return {
      commandCacheSize: this.commandCache.size,
      packageManagerCacheSize: this.packageManagerCache.size,
      availabilityCacheSize: this.commandAvailabilityCache.size,
      totalCachedCommands: this.commandCache.size,
    };
  }

  // Private methods

  private async executeOptimized(
    command: ButtonCommand,
    options: ExecutionOptions,
  ): Promise<ExecutionResult> {
    const startTime = Date.now();
    const timeout = options.timeout || 30000;

    try {
      let cmd: string;
      let args: string[] = [];
      let fullCommand: string;

      // Process different command types with optimization
      switch (command.type) {
        case "npm":
          cmd = "npm";
          args = ["run", command.script || ""];
          fullCommand = `${cmd} ${args.join(" ")}`;
          break;
        case "yarn":
          cmd = "yarn";
          args = [command.script || ""];
          fullCommand = `${cmd} ${args.join(" ")}`;
          break;
        case "pnpm":
          cmd = "pnpm";
          args = ["run", command.script || ""];
          fullCommand = `${cmd} ${args.join(" ")}`;
          break;
        case "bun":
          cmd = "bun";
          args = ["run", command.script || ""];
          fullCommand = `${cmd} ${args.join(" ")}`;
          break;
        case "bunx":
          cmd = "bunx";
          args = [command.script || ""].concat(command.args || []);
          fullCommand = `${cmd} ${args.join(" ")}`;
          break;
        case "npx":
          cmd = "npx";
          args = [command.script || ""].concat(command.args || []);
          fullCommand = `${cmd} ${args.join(" ")}`;
          break;
        case "pnpx":
          cmd = "pnpx";
          args = [command.script || ""].concat(command.args || []);
          fullCommand = `${cmd} ${args.join(" ")}`;
          break;
        case "github":
          cmd = "gh";
          args = [command.command || ""].concat(command.args || []);
          fullCommand = `${cmd} ${args.join(" ")}`;
          break;
        case "vscode":
          // Execute VSCode command
          await vscode.commands.executeCommand(
            command.command || "",
            ...(command.args || []),
          );
          return {
            code: 0,
            stdout: "VSCode command executed successfully",
            stderr: "",
            duration: Date.now() - startTime,
            timestamp: new Date(),
            command: command.command || "",
          };
        case "task": {
          // Execute VSCode task with caching
          const tasks = await vscode.tasks.fetchTasks();
          const task = tasks.find((t) => t.name === command.command);
          if (task) {
            await vscode.tasks.executeTask(task);
            return {
              code: 0,
              stdout: `Task '${command.command}' started successfully`,
              stderr: "",
              duration: Date.now() - startTime,
              timestamp: new Date(),
              command: command.command || "",
            };
          } else {
            throw new Error(`Task '${command.command}' not found`);
          }
        }
        case "detect": {
          // Auto-detect package manager with caching
          const workspacePath =
            options.workingDirectory ||
            vscode.workspace.workspaceFolders?.[0]?.uri.fsPath ||
            "";
          const detectedPm = await this.detectPackageManager(workspacePath);
          if (!detectedPm) {
            throw new Error("Could not detect package manager");
          }
          cmd = detectedPm;
          args =
            detectedPm === "yarn"
              ? [command.script || ""]
              : ["run", command.script || ""];
          fullCommand = `${cmd} ${args.join(" ")}`;
          break;
        }
        case "shell":
        default:
          cmd = command.command || "";
          args = command.args || [];
          fullCommand = args.length > 0 ? `${cmd} ${args.join(" ")}` : cmd;
          break;
      }

      // Execute using child_process with optimized settings
      const cwd =
        options.workingDirectory ||
        vscode.workspace.workspaceFolders?.[0]?.uri.fsPath ||
        process.cwd();
      const env = { ...process.env, ...options.environment };

      try {
        const { stdout, stderr } = await execAsync(fullCommand, {
          cwd,
          env,
          timeout,
          maxBuffer: 10 * 1024 * 1024, // 10MB buffer
          windowsHide: true,
        });

        return {
          code: 0,
          stdout: stdout.toString().trim(),
          stderr: stderr.toString().trim(),
          duration: Date.now() - startTime,
          timestamp: new Date(),
          command: fullCommand,
        };
      } catch (execError: unknown) {
        // exec throws on non-zero exit code
        const error = execError as Error & {
          code?: number;
          stdout?: string;
          stderr?: string;
          message?: string;
        };
        return {
          code: error.code || -1,
          stdout: error.stdout?.toString().trim() || "",
          stderr: error.stderr?.toString().trim() || error.message || "",
          duration: Date.now() - startTime,
          timestamp: new Date(),
          command: fullCommand,
        };
      }
    } catch (error) {
      return {
        code: -1,
        stdout: "",
        stderr: error instanceof Error ? error.message : String(error),
        duration: Date.now() - startTime,
        timestamp: new Date(),
        command: command.command || "",
      };
    }
  }

  private buildCommand(command: ButtonCommand): {
    cmd: string;
    args: string[];
    fullCommand: string;
  } {
    let cmd: string;
    let args: string[] = [];
    let fullCommand: string;

    switch (command.type) {
      case "npm":
        cmd = "npm";
        args = ["run", command.script || ""];
        fullCommand = `${cmd} ${args.join(" ")}`;
        break;
      case "yarn":
        cmd = "yarn";
        args = [command.script || ""];
        fullCommand = `${cmd} ${args.join(" ")}`;
        break;
      case "pnpm":
        cmd = "pnpm";
        args = ["run", command.script || ""];
        fullCommand = `${cmd} ${args.join(" ")}`;
        break;
      case "bun":
        cmd = "bun";
        args = ["run", command.script || ""];
        fullCommand = `${cmd} ${args.join(" ")}`;
        break;
      case "bunx":
        cmd = "bunx";
        args = [command.script || ""].concat(command.args || []);
        fullCommand = `${cmd} ${args.join(" ")}`;
        break;
      case "npx":
        cmd = "npx";
        args = [command.script || ""].concat(command.args || []);
        fullCommand = `${cmd} ${args.join(" ")}`;
        break;
      case "pnpx":
        cmd = "pnpx";
        args = [command.script || ""].concat(command.args || []);
        fullCommand = `${cmd} ${args.join(" ")}`;
        break;
      case "github":
        cmd = "gh";
        args = [command.command || ""].concat(command.args || []);
        fullCommand = `${cmd} ${args.join(" ")}`;
        break;
      case "shell":
      default:
        cmd = command.command || "";
        args = command.args || [];
        fullCommand = args.length > 0 ? `${cmd} ${args.join(" ")}` : cmd;
        break;
    }

    return { cmd, args, fullCommand };
  }

  private getCacheKey(
    command: ButtonCommand,
    options: ExecutionOptions,
  ): string {
    const parts = [
      command.type,
      command.script || command.command || "",
      JSON.stringify(command.args || []),
      options.workingDirectory || "",
      JSON.stringify(options.environment || {}),
    ];
    return parts.join("|");
  }

  private cacheResult(
    command: ButtonCommand,
    options: ExecutionOptions,
    result: ExecutionResult,
  ): void {
    // Only cache successful results
    if (result.code === 0) {
      const cacheKey = this.getCacheKey(command, options);

      // Implement LRU behavior
      if (this.commandCache.size >= this.MAX_CACHE_SIZE) {
        const firstKey = this.commandCache.keys().next().value;
        if (firstKey !== undefined) {
          this.commandCache.delete(firstKey);
        }
      }

      this.commandCache.set(cacheKey, {
        result,
        timestamp: Date.now(),
      });
    }
  }

  private async getGitAPI(): Promise<GitApi | null> {
    if (this.gitApi) {
      return this.gitApi;
    }

    if (this.gitApiPromise) {
      return this.gitApiPromise;
    }

    this.gitApiPromise = this.initializeGitAPI();
    this.gitApi = await this.gitApiPromise;
    this.gitApiPromise = null;

    return this.gitApi;
  }

  private async initializeGitAPI(): Promise<GitApi | null> {
    return new Promise((resolve) => {
      const gitExtension = vscode.extensions.getExtension("vscode.git");
      if (!gitExtension) {
        resolve(null);
        return;
      }

      if (gitExtension.isActive && gitExtension.exports) {
        resolve(gitExtension.exports);
      } else if (gitExtension.exports) {
        resolve(gitExtension.exports);
      } else {
        // Wait for activation
        const timeout = setTimeout(() => resolve(null), 5000);
        Promise.resolve(gitExtension.activate())
          .then(() => {
            clearTimeout(timeout);
            resolve(gitExtension.exports || null);
          })
          .catch(() => {
            clearTimeout(timeout);
            resolve(null);
          });
      }
    });
  }
}
