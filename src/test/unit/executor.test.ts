/**
 * Unit tests for CommandExecutor
 * Tests command execution functionality with mocked child_process
 */

import { describe, it, expect, beforeEach, afterEach } from "bun:test";
import { CommandExecutor } from "../../executor";
import { mockCommandRegistry } from "../mocks/child-process";
import type { ButtonCommand, ExecutionOptions } from "../../types";

describe("CommandExecutor", () => {
  let executor: CommandExecutor;

  beforeEach(() => {
    executor = new CommandExecutor();
    mockCommandRegistry.clear();
  });

  afterEach(() => {
    mockCommandRegistry.clear();
  });

  describe("NPM Commands", () => {
    it("should execute npm command successfully", async () => {
      const command: ButtonCommand = {
        type: "npm",
        script: "test",
      };

      mockCommandRegistry.register("npm run test", "Tests passed", "", 0, 100);

      const result = await executor.execute(command, {});

      expect(result.code).toBe(0);
      expect(result.command).toContain("npm run test");
    });

    it("should handle npm command failure", async () => {
      const command: ButtonCommand = {
        type: "npm",
        script: "build",
      };

      mockCommandRegistry.register("npm run build", "", "Build failed", 1, 100);

      const result = await executor.execute(command, {});

      expect(result.code).toBe(1);
      expect(result.stderr).toContain("Build failed");
    });
  });

  describe("Yarn Commands", () => {
    it("should execute yarn command without 'run' prefix", async () => {
      const command: ButtonCommand = {
        type: "yarn",
        script: "build",
      };

      mockCommandRegistry.register(
        "yarn build",
        "Build successful",
        "",
        0,
        100,
      );

      const result = await executor.execute(command, {});

      expect(result.code).toBe(0);
      expect(result.command).toBe("yarn build");
    });
  });

  describe("Bun Commands", () => {
    it("should execute bun command successfully", async () => {
      const command: ButtonCommand = {
        type: "bun",
        script: "dev",
      };

      mockCommandRegistry.register(
        "bun run dev",
        "Dev server started",
        "",
        0,
        100,
      );

      const result = await executor.execute(command, {});

      expect(result.code).toBe(0);
      expect(result.command).toContain("bun run dev");
    });
  });

  describe("Shell Commands", () => {
    it("should execute shell command successfully", async () => {
      const command: ButtonCommand = {
        type: "shell",
        command: "echo 'Hello World'",
      };

      mockCommandRegistry.register(
        "echo 'Hello World'",
        "Hello World",
        "",
        0,
        50,
      );

      const result = await executor.execute(command, {});

      expect(result.code).toBe(0);
      expect(result.duration).toBeGreaterThan(0);
    });

    it("should handle shell command with arguments", async () => {
      const command: ButtonCommand = {
        type: "shell",
        command: "echo",
        args: ["test", "message"],
      };

      mockCommandRegistry.register(
        "echo test message",
        "test message",
        "",
        0,
        50,
      );

      const result = await executor.execute(command, {});

      expect(result.code).toBe(0);
      expect(result.command).toContain("echo test message");
    });
  });

  describe("VSCode Commands", () => {
    it("should execute VSCode command successfully", async () => {
      const command: ButtonCommand = {
        type: "vscode",
        command: "workbench.action.openSettings",
      };

      const result = await executor.execute(command, {});

      expect(result.code).toBe(0);
      expect(result.stdout).toContain("VSCode command executed successfully");
    });
  });

  describe("Execution Options", () => {
    it("should use custom working directory", async () => {
      const command: ButtonCommand = {
        type: "shell",
        command: "pwd",
      };

      const options: ExecutionOptions = {
        workingDirectory: "/custom/path",
      };

      mockCommandRegistry.register("pwd", "/custom/path", "", 0, 50);

      const result = await executor.execute(command, options);

      expect(result.code).toBe(0);
    });

    it("should merge environment variables", async () => {
      const command: ButtonCommand = {
        type: "shell",
        command: "echo $CUSTOM_VAR",
      };

      const options: ExecutionOptions = {
        environment: {
          CUSTOM_VAR: "test-value",
        },
      };

      mockCommandRegistry.register("echo $CUSTOM_VAR", "test-value", "", 0, 50);

      const result = await executor.execute(command, options);

      expect(result.code).toBe(0);
    });

    it("should respect timeout option", async () => {
      const command: ButtonCommand = {
        type: "shell",
        command: "long-running-task",
      };

      const options: ExecutionOptions = {
        timeout: 1000,
      };

      mockCommandRegistry.register(
        "long-running-task",
        "",
        "Command timed out",
        -1,
        1000,
      );

      const result = await executor.execute(command, options);

      expect(result.duration).toBeGreaterThanOrEqual(1000);
    });
  });

  describe("Error Handling", () => {
    it("should handle command not found", async () => {
      const command: ButtonCommand = {
        type: "shell",
        command: "nonexistent-command",
      };

      mockCommandRegistry.registerError(
        "nonexistent-command",
        new Error("Command not found"),
      );

      const result = await executor.execute(command, {});

      expect(result.code).not.toBe(0);
      expect(result.stderr).toContain("Command not found");
    });

    it("should capture stderr on command failure", async () => {
      const command: ButtonCommand = {
        type: "npm",
        script: "failing-script",
      };

      mockCommandRegistry.register(
        "npm run failing-script",
        "",
        "Error: Script failed with exit code 1",
        1,
        100,
      );

      const result = await executor.execute(command, {});

      expect(result.code).toBe(1);
      expect(result.stderr).toContain("Script failed");
    });
  });

  describe("Performance", () => {
    it("should measure execution duration accurately", async () => {
      const command: ButtonCommand = {
        type: "shell",
        command: "sleep 0.1",
      };

      mockCommandRegistry.register("sleep 0.1", "", "", 0, 100);

      const result = await executor.execute(command, {});

      expect(result.duration).toBeGreaterThanOrEqual(100);
      expect(result.timestamp).toBeInstanceOf(Date);
    });
  });
});
