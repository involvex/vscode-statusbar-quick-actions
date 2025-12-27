/**
 * Command executor for StatusBar Quick Actions
 */

import { ExecutionResult, ExecutionOptions, ButtonCommand } from "./types";
import * as vscode from "vscode";
import { exec } from "child_process";
import { promisify } from "util";
import * as path from "path";
import * as fs from "fs";

const execAsync = promisify(exec);

export class CommandExecutor {
  /**
   * Execute a command
   */
  public async execute(
    command: ButtonCommand,
    options: ExecutionOptions,
  ): Promise<ExecutionResult> {
    const startTime = Date.now();
    const timeout = options.timeout || 30000;

    try {
      let cmd: string;
      let args: string[] = [];
      let fullCommand: string;

      // Process different command types
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
          // Execute VSCode task
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
          // Auto-detect package manager and run script
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

      // Execute using child_process for proper output capture
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
        const error = execError as {
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

  /**
   * Check if a command type is available
   */
  public async isCommandAvailable(commandType: string): Promise<boolean> {
    try {
      const checkCmd = process.platform === "win32" ? "where" : "which";
      await execAsync(`${checkCmd} ${commandType}`, {
        windowsHide: true,
      });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get available package managers
   */
  public async getAvailablePackageManagers(): Promise<string[]> {
    const managers: string[] = [];
    const commands = ["npm", "yarn", "pnpm", "bun"];

    for (const manager of commands) {
      if (await this.isCommandAvailable(manager)) {
        managers.push(manager);
      }
    }

    return managers;
  }

  /**
   * Detect package manager from workspace
   */
  public async detectPackageManager(
    workspacePath: string,
  ): Promise<string | null> {
    if (!workspacePath) {
      workspacePath = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath || "";
    }

    if (!workspacePath) {
      return null;
    }

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
            return manager;
          }
        }
      }

      // Fallback: check if package.json exists and return first available manager
      const packageJsonPath = path.join(workspacePath, "package.json");
      if (fs.existsSync(packageJsonPath)) {
        const availableManagers = await this.getAvailablePackageManagers();
        return availableManagers[0] || null;
      }

      return null;
    } catch (error) {
      console.error("Error detecting package manager:", error);
      return null;
    }
  }
}
