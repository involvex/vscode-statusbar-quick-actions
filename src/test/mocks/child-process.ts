/**
 * Mock child_process module for testing command execution
 */

export interface MockExecOptions {
  cwd?: string;
  env?: Record<string, string>;
  timeout?: number;
  maxBuffer?: number;
  killSignal?: string;
  windowsHide?: boolean;
}

export interface MockExecResult {
  stdout: string;
  stderr: string;
}

export interface MockExecError extends Error {
  code?: number;
  killed?: boolean;
  signal?: string;
  cmd?: string;
}

/**
 * Mock command registry for controlling test behavior
 */
export class MockCommandRegistry {
  private commands = new Map<
    string,
    {
      stdout: string;
      stderr: string;
      exitCode: number;
      duration: number;
      error?: Error;
    }
  >();

  /**
   * Register a mock command response
   */
  register(
    command: string,
    stdout = "",
    stderr = "",
    exitCode = 0,
    duration = 100,
  ): void {
    this.commands.set(command, { stdout, stderr, exitCode, duration });
  }

  /**
   * Register a command that will throw an error
   */
  registerError(command: string, error: Error): void {
    this.commands.set(command, {
      stdout: "",
      stderr: error.message,
      exitCode: 1,
      duration: 0,
      error,
    });
  }

  /**
   * Get registered command response
   */
  get(command: string):
    | {
        stdout: string;
        stderr: string;
        exitCode: number;
        duration: number;
        error?: Error;
      }
    | undefined {
    // Try exact match first
    if (this.commands.has(command)) {
      return this.commands.get(command);
    }

    // Try partial match (for commands with arguments)
    for (const [key, value] of this.commands.entries()) {
      if (command.startsWith(key) || key.startsWith(command)) {
        return value;
      }
    }

    return undefined;
  }

  /**
   * Clear all registered commands
   */
  clear(): void {
    this.commands.clear();
  }

  /**
   * Check if command is registered
   */
  has(command: string): boolean {
    return this.get(command) !== undefined;
  }
}

// Global command registry
export const mockCommandRegistry = new MockCommandRegistry();

/**
 * Mock exec function
 */
export function exec(
  command: string,
  options?: MockExecOptions,
  callback?: (
    error: MockExecError | null,
    stdout: string,
    stderr: string,
  ) => void,
): any {
  const registered = mockCommandRegistry.get(command);

  // Simulate async execution
  setTimeout(() => {
    if (!registered) {
      // Default success response for unregistered commands
      const stdout = `Mock output for: ${command}`;
      const stderr = "";

      if (callback) {
        callback(null, stdout, stderr);
      }
      return;
    }

    const { stdout, stderr, exitCode, duration, error } = registered;

    // Simulate command execution time
    setTimeout(() => {
      if (error || exitCode !== 0) {
        const execError = error || new Error(stderr);
        (execError as MockExecError).code = exitCode;
        (execError as MockExecError).cmd = command;

        if (callback) {
          callback(execError as MockExecError, stdout, stderr);
        }
      } else {
        if (callback) {
          callback(null, stdout, stderr);
        }
      }
    }, duration);
  }, 0);

  // Return mock ChildProcess
  return {
    stdout: {
      on: (_event: string, _handler: (data: any) => void) => {},
    },
    stderr: {
      on: (_event: string, _handler: (data: any) => void) => {},
    },
    on: (_event: string, _handler: (code: number) => void) => {},
    kill: (_signal?: string) => {},
  };
}

/**
 * Promisified version of exec
 */
export function execPromise(
  command: string,
  options?: MockExecOptions,
): Promise<MockExecResult> {
  return new Promise((resolve, reject) => {
    exec(command, options, (error, stdout, stderr) => {
      if (error) {
        reject(error);
      } else {
        resolve({ stdout, stderr });
      }
    });
  });
}

/**
 * Mock spawn function
 */
export function spawn(
  command: string,
  args: string[] = [],
  _options?: MockExecOptions,
): any {
  const fullCommand = `${command} ${args.join(" ")}`.trim();
  const registered = mockCommandRegistry.get(fullCommand);

  const stdout = registered?.stdout || `Mock spawn output for: ${fullCommand}`;
  const stderr = registered?.stderr || "";
  const exitCode = registered?.exitCode || 0;

  return {
    stdout: {
      on: (event: string, handler: (data: Buffer) => void) => {
        if (event === "data") {
          setTimeout(() => handler(Buffer.from(stdout)), 10);
        }
      },
      setEncoding: (_encoding: string) => {},
    },
    stderr: {
      on: (event: string, handler: (data: Buffer) => void) => {
        if (event === "data" && stderr) {
          setTimeout(() => handler(Buffer.from(stderr)), 10);
        }
      },
      setEncoding: (_encoding: string) => {},
    },
    on: (event: string, handler: (code?: number) => void) => {
      if (event === "close" || event === "exit") {
        setTimeout(() => handler(exitCode), 20);
      }
    },
    kill: (_signal?: string) => true,
    pid: Math.floor(Math.random() * 10000),
  };
}

/**
 * Export mock child_process module
 */
export const childProcess = {
  exec,
  execPromise,
  spawn,
};
