# Command Execution

Learn how **StatusBar Quick Actions** executes different types of commands with advanced options for customization, error handling, and performance optimization.

## 🎯 Command Execution Overview

The extension supports **11 different command types** with comprehensive execution options, progress tracking, and error handling.

## 🔧 Supported Command Types

### 1. Package Manager Scripts

#### npm Scripts

```json
{
  "command": {
    "type": "npm",
    "script": "dev"
  }
}
```

**Executes**: `npm run dev`

#### yarn Scripts

```json
{
  "command": {
    "type": "yarn",
    "script": "build"
  }
}
```

**Executes**: `yarn run build`

#### pnpm Scripts

```json
{
  "command": {
    "type": "pnpm",
    "script": "test"
  }
}
```

**Executes**: `pnpm run test`

#### bun Scripts

```json
{
  "command": {
    "type": "bun",
    "script": "dev"
  }
}
```

**Executes**: `bun run dev`

### 2. Shell Commands

#### Basic Shell Command

```json
{
  "command": {
    "type": "shell",
    "command": "echo",
    "args": ["Hello", "World"]
  }
}
```

**Executes**: `echo Hello World`

#### Complex Shell Commands

```json
{
  "command": {
    "type": "shell",
    "command": "bash",
    "args": ["-c", "npm run build && npm run test"]
  }
}
```

**Executes**: `bash -c "npm run build && npm run test"`

#### Environment Variables

```json
{
  "command": {
    "type": "shell",
    "command": "export",
    "args": ["NODE_ENV=production", "&&", "npm", "start"]
  }
}
```

**Executes**: `export NODE_ENV=production && npm start`

### 3. GitHub CLI Commands

```json
{
  "command": {
    "type": "github",
    "command": "pr",
    "args": ["create", "--fill"]
  }
}
```

**Executes**: `gh pr create --fill`

#### Popular GitHub Commands

```json
{
  "id": "gh-status",
  "text": "$(github) Status",
  "command": {
    "type": "github",
    "command": "pr",
    "args": ["list", "--state", "open"]
  }
}
```

```json
{
  "id": "gh-issues",
  "text": "$(issue) Issues",
  "command": {
    "type": "github",
    "command": "issue",
    "args": ["list", "--assignee", "@me"]
  }
}
```

### 4. VS Code Commands

```json
{
  "command": {
    "type": "vscode",
    "command": "editor.action.formatDocument"
  }
}
```

**Executes**: Built-in VS Code command

#### Common VS Code Commands

```json
{
  "id": "toggle-terminal",
  "text": "$(terminal) Terminal",
  "command": {
    "type": "vscode",
    "command": "workbench.action.terminal.toggleTerminal"
  }
}
```

```json
{
  "id": "show-explorer",
  "text": "$(files) Explorer",
  "command": {
    "type": "vscode",
    "command": "workbench.view.explorer"
  }
}
```

### 5. Auto-Detection Commands

```json
{
  "command": {
    "type": "detect",
    "script": "dev"
  }
}
```

**Behavior**: Automatically detects package manager based on lock files:

- `yarn.lock` → Uses `yarn run`
- `pnpm-lock.yaml` → Uses `pnpm run`
- `bun.lockb` → Uses `bun run`
- `package-lock.json` or default → Uses `npm run`

### 6. NPX Commands

```json
{
  "command": {
    "type": "npx",
    "script": "create-react-app"
  }
}
```

**Executes**: `npx create-react-app`

### 7. PNX Commands

```json
{
  "command": {
    "type": "pnpx",
    "script": "vite"
  }
}
```

**Executes**: `pnpx vite`

### 8. Bunx Commands

```json
{
  "command": {
    "type": "bunx",
    "script": "typescript"
  }
}
```

**Executes**: `bunx typescript`

## ⚙️ Execution Options

### Foreground vs Background Execution

#### Foreground Execution (Blocking)

```json
{
  "execution": {
    "foreground": true
  }
}
```

**Behavior**:

- Command output appears in terminal
- User sees real-time execution
- UI is blocked during execution
- Good for interactive commands

#### Background Execution (Non-blocking)

```json
{
  "execution": {
    "foreground": false
  }
}
```

**Behavior**:

- Command runs silently
- Progress indicator shows only
- UI remains responsive
- Good for build/test commands

### Progress Notifications

```json
{
  "execution": {
    "showProgress": true,
    "timeout": 300000
  }
}
```

**Progress Indicators**:

- VS Code progress notification
- Status bar animation
- Success/error notifications

### Timeout Configuration

```json
{
  "execution": {
    "timeout": 300000 // 5 minutes
  }
}
```

**Timeout Behavior**:

- Command terminates after timeout
- User receives timeout notification
- Prevents hung processes

### Notification Settings

```json
{
  "execution": {
    "notifications": {
      "showSuccess": true, // Show success messages
      "showError": true, // Show error messages
      "showOutput": false // Don't include output in notifications
    }
  }
}
```

## 🔄 Command Execution Flow

### 1. Pre-execution Phase

```
Validation → Environment Setup → Working Directory → Command Preparation
```

### 2. Execution Phase

```
Process Spawn → Output Capture → Progress Updates → Result Collection
```

### 3. Post-execution Phase

```
Result Processing → History Update → Notification Display → Cleanup
```

## 📊 Output Handling

### Output Panel Integration

```json
{
  "statusbarQuickActions": {
    "settings": {
      "output": {
        "enabled": true,
        "mode": "per-button", // or "shared"
        "format": "formatted", // "raw", "formatted", "ansi"
        "clearOnRun": false,
        "showTimestamps": true,
        "maxLines": 1000
      }
    }
  }
}
```

### Output Modes

#### Per-Button Mode

- Separate output panel for each button
- Easy to track specific command output
- Better for development workflows

#### Shared Mode

- One panel for all commands
- Unified command history
- Better for simple workflows

### Output Formats

#### Raw Format

```
Command output exactly as received
```

#### Formatted Format

```
[14:32:15] npm run dev
> Starting development server...

Local: http://localhost:3000/
Ready in 1.2s
```

#### ANSI Format

```
Preserves ANSI color codes
Good for colored terminal output
```

## 🔍 Command Context

### Working Directory

```json
{
  "workingDirectory": "${workspaceFolder}"
}
```

**Supported Variables**:

- `${workspaceFolder}` - Current workspace root
- `${fileBasename}` - Current file name
- `${fileDirname}` - Current file directory
- `${relativeFile}` - Relative file path

### Environment Variables

```json
{
  "environment": {
    "NODE_ENV": "development",
    "API_URL": "http://localhost:3000",
    "DEBUG": "app:*",
    "PATH": "/custom/path:$PATH"
  }
}
```

### Combined Example

```json
{
  "workingDirectory": "${workspaceFolder}/src",
  "environment": {
    "NODE_ENV": "production",
    "API_URL": "https://api.example.com"
  },
  "command": {
    "type": "shell",
    "command": "node",
    "args": ["server.js"]
  }
}
```

## 📈 Performance Optimization

### Background Execution Best Practices

```json
{
  "id": "build-app",
  "text": "$(package) Build",
  "command": { "type": "npm", "script": "build" },
  "execution": {
    "foreground": false, // Don't block UI
    "showProgress": true, // Show progress
    "timeout": 600000 // 10 minutes for builds
  }
}
```

### Quick Commands

```json
{
  "id": "lint-check",
  "text": "$(check) Lint",
  "command": { "type": "npm", "script": "lint" },
  "execution": {
    "foreground": false,
    "showProgress": false, // No progress for quick commands
    "timeout": 30000 // 30 seconds
  }
}
```

## 🛡️ Error Handling

### Automatic Error Handling

The extension provides comprehensive error handling:

1. **Command Not Found**
   - Helpful error message
   - Suggestions for installation
   - Links to documentation

2. **Script Not Found**
   - Lists available scripts
   - Shows package.json location
   - Suggests checking script names

3. **Permission Errors**
   - File permission issues
   - Working directory access
   - Suggestions for resolution

4. **Timeout Errors**
   - Clear timeout notification
   - Option to increase timeout
   - Process termination confirmation

### Custom Error Handling

```json
{
  "id": "custom-command",
  "text": "Custom Task",
  "command": {
    "type": "shell",
    "command": "node",
    "args": ["custom-script.js"]
  },
  "execution": {
    "notifications": {
      "showError": true,
      "showOutput": true // Show error details
    }
  }
}
```

## 📋 Command Examples

### Development Workflow

```json
[
  {
    "id": "dev-server",
    "text": "$(play) Dev",
    "command": { "type": "npm", "script": "dev" },
    "execution": {
      "foreground": true,
      "showProgress": true,
      "timeout": 0
    }
  },
  {
    "id": "build-prod",
    "text": "$(package) Build",
    "command": { "type": "npm", "script": "build" },
    "execution": {
      "foreground": false,
      "showProgress": true,
      "timeout": 300000
    }
  },
  {
    "id": "run-tests",
    "text": "$(beaker) Test",
    "command": { "type": "npm", "script": "test" },
    "execution": {
      "foreground": false,
      "showProgress": true,
      "timeout": 300000
    }
  }
]
```

### Git Workflow

```json
[
  {
    "id": "git-status",
    "text": "$(git-branch) Status",
    "command": {
      "type": "shell",
      "command": "git",
      "args": ["status", "--porcelain"]
    },
    "execution": {
      "foreground": false,
      "showProgress": false
    }
  },
  {
    "id": "git-commit",
    "text": "$(git-commit) Commit",
    "command": {
      "type": "shell",
      "command": "git",
      "args": ["commit", "-m", "${input:commitMessage}"]
    },
    "execution": {
      "foreground": true,
      "showProgress": true,
      "timeout": 60000
    }
  }
]
```

### Docker Workflow

```json
[
  {
    "id": "docker-build",
    "text": "$(package) Build",
    "command": {
      "type": "shell",
      "command": "docker",
      "args": ["build", "-t", "${input:imageName}", "."]
    },
    "execution": {
      "foreground": false,
      "showProgress": true,
      "timeout": 600000
    }
  },
  {
    "id": "docker-run",
    "text": "$(play) Run",
    "command": {
      "type": "shell",
      "command": "docker",
      "args": ["run", "-d", "${input:containerName}"]
    },
    "execution": {
      "foreground": true,
      "showProgress": true,
      "timeout": 30000
    }
  }
]
```

## 🎛️ Advanced Configuration

### Streaming Output

For real-time command monitoring:

```json
{
  "execution": {
    "streaming": {
      "enabled": true,
      "onStdout": (data) => console.log('STDOUT:', data),
      "onStderr": (data) => console.log('STDERR:', data),
      "onProgress": (percent) => console.log('Progress:', percent)
    }
  }
}
```

### Process Management

```json
{
  "execution": {
    "foreground": true,
    "showProgress": true,
    "timeout": 0, // No timeout
    "killOnCancel": true // Kill process on cancellation
  }
}
```

## 🚀 Performance Tips

### 1. Use Background Execution

```json
{
  "execution": {
    "foreground": false // Keep UI responsive
  }
}
```

### 2. Set Appropriate Timeouts

```json
{
  "execution": {
    "timeout": 60000 // 1 minute for quick commands
  }
}
```

### 3. Disable Progress for Quick Commands

```json
{
  "execution": {
    "showProgress": false // No progress for < 5 second commands
  }
}
```

### 4. Use Auto-Detection

```json
{
  "command": {
    "type": "detect", // Automatically choose package manager
    "script": "dev"
  }
}
```

## 🔧 Troubleshooting Commands

### Enable Debug Mode

```json
{
  "statusbarQuickActions": {
    "settings": {
      "debug": true
    }
  }
}
```

### Check Output Panel

1. **View Menu** → **Output**
2. **Select**: "StatusBar Quick Actions"
3. **Check**: Command execution logs

### Common Issues

#### Command Not Found

- **Check**: Package manager installation
- **Verify**: PATH environment variable
- **Test**: Command in terminal first

#### Script Not Found

- **Check**: package.json exists
- **Verify**: Script name is correct
- **Ensure**: Dependencies are installed

#### Permission Denied

- **Check**: File permissions
- **Verify**: Working directory access
- **Try**: Running as administrator (Windows)

## 🎉 Summary

You now understand:

- ✅ All 11 command types supported
- ✅ Execution options and best practices
- ✅ Output handling and formatting
- ✅ Error handling and troubleshooting
- ✅ Performance optimization techniques

**Next Steps**: Learn
