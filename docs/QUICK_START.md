# Quick Start Guide

Get up and running with **StatusBar Quick Actions** in just 5 minutes! This guide will help you create your first buttons and see immediate productivity gains.

## 🎯 What You'll Learn

- Create your first status bar button
- Configure a basic npm script button
- Set up a Git workflow button
- Understand the essential configuration options

## ⚡ 5-Minute Setup

### Step 1: Access Extension Commands (30 seconds)

1. **Open Command Palette**
   - `Ctrl+Shift+P` (Windows/Linux)
   - `Cmd+Shift+P` (macOS)

2. **Type**: `StatusBar Quick Actions: Edit Button`

3. **Select** the command from the dropdown

### Step 2: Create Your First Button (1 minute)

1. **Choose**: "Add New Button" from the menu

2. **Enter Button Text**: `$(play) Dev`

3. **Select Command Type**: `npm`

4. **Enter Script Name**: `dev`

5. **Confirm** - The button should appear in your status bar!

### Step 3: Test Your Button (30 seconds)

1. **Click** the new button in the status bar
2. **Watch** as it executes your `npm run dev` command
3. **See** the progress notification and output

### Step 4: Add a Git Button (1 minute)

Repeat the process with these settings:

1. **Button Text**: `$(git-branch) Status`
2. **Command Type**: `shell`
3. **Command**: `git`
4. **Arguments**: `status --porcelain`

### Step 5: Explore Settings (2 minutes)

1. **Open Settings** (`Ctrl+,`)
2. **Search**: `StatusBar Quick Actions`
3. **Adjust** any preferences you find

## 🔧 Basic Configuration Example

Here's a complete basic configuration to copy and paste:

```json
{
  "statusbarQuickActions": {
    "buttons": [
      {
        "id": "npm-dev",
        "text": "$(play) Dev",
        "tooltip": "Start development server",
        "command": {
          "type": "npm",
          "script": "dev"
        },
        "enabled": true,
        "alignment": "left",
        "priority": 100
      },
      {
        "id": "npm-build",
        "text": "$(package) Build",
        "tooltip": "Build for production",
        "command": {
          "type": "npm",
          "script": "build"
        },
        "enabled": true,
        "alignment": "left",
        "priority": 200
      },
      {
        "id": "npm-test",
        "text": "$(beaker) Test",
        "tooltip": "Run tests",
        "command": {
          "type": "npm",
          "script": "test"
        },
        "enabled": true,
        "alignment": "left",
        "priority": 300
      },
      {
        "id": "git-status",
        "text": "$(git-branch) Status",
        "tooltip": "Show Git status",
        "command": {
          "type": "shell",
          "command": "git",
          "args": ["status", "--porcelain"]
        },
        "enabled": true,
        "alignment": "right",
        "priority": 100
      }
    ]
  }
}
```

## 🎨 Button Properties Explained

### Required Properties

| Property  | Description                    | Example            |
| --------- | ------------------------------ | ------------------ |
| `id`      | Unique identifier              | `"npm-dev"`        |
| `text`    | Display text (supports emojis) | `"$(play) Dev"`    |
| `command` | Command configuration          | See examples above |

### Common Optional Properties

| Property    | Description          | Default     | Example                            |
| ----------- | -------------------- | ----------- | ---------------------------------- |
| `tooltip`   | Hover tooltip        | Button text | `"Start development server"`       |
| `enabled`   | Button enabled state | `true`      | `true` or `false`                  |
| `alignment` | Status bar position  | `"left"`    | `"left"` or `"right"`              |
| `priority`  | Display order        | `100`       | `100` (higher = further from edge) |

## 🚀 Common Button Types

### Package Manager Scripts

```json
{
  "id": "npm-start",
  "text": "$(play) Start",
  "command": {
    "type": "npm",
    "script": "start"
  }
}
```

### Shell Commands

```json
{
  "id": "docker-logs",
  "text": "$(list-ordered) Logs",
  "command": {
    "type": "shell",
    "command": "docker",
    "args": ["logs", "-f", "my-container"]
  }
}
```

### Git Operations

```json
{
  "id": "git-commit",
  "text": "$(git-commit) Commit",
  "command": {
    "type": "shell",
    "command": "git",
    "args": ["commit", "-m", "${input:commitMessage}"]
  }
}
```

### VS Code Commands

```json
{
  "id": "format-document",
  "text": "$(symbol-number) Format",
  "command": {
    "type": "vscode",
    "command": "editor.action.formatDocument"
  }
}
```

## 📋 Next Steps

### Learn More About:

- **Advanced Configuration**: See [Configuration Reference](CONFIGURATION_REFERENCE.md)
- **Visibility Conditions**: Make buttons appear contextually ([Visibility Conditions](VISIBILITY_CONDITIONS.md))
- **Presets**: Save and share configurations ([Preset System](PRESET_AND_DYNAMIC_LABELS.md))
- **Sample Configurations**: Ready-made setups ([Sample Configurations](SAMPLE-CONFIGURATIONS.md))

### Try These Presets:

1. **Node.js Development**: npm start, test, build, lint
2. **React Development**: dev server, build, test, storybook
3. **Git Workflow**: status, commit, push, pull, PR creation

## 🔧 Configuration Methods

### Method 1: Settings UI

1. Open Settings (`Ctrl+,`)
2. Search "StatusBar Quick Actions"
3. Edit buttons array in JSON

### Method 2: Command Palette

1. `Ctrl+Shift+P` → "StatusBar Quick Actions: Edit Button"
2. Use interactive menus to configure

### Method 3: Configuration CLI

```bash
# Run the CLI tool
bun run dev:cli

# Or with npm
npm run dev:cli
```

### Method 4: Direct File Edit

1. Open your settings file:
   - User: `%APPDATA%\Code\User\settings.json`
   - Workspace: `.vscode/settings.json`
2. Add configuration under `"statusbarQuickActions"`

## ⚡ Pro Tips

### 1. Use Icons

- **VS Code Codicons**: `$(icon-name)`
- **Examples**: `$(play)`, `$(package)`, `$(beaker)`, `$(git-branch)`
- **Full list**: [VS Code Codicons](https://microsoft.github.io/vscode-codicons/)

### 2. Set Priorities

- **Left side**: Use 100-500 (100 = closest to edge)
- **Right side**: Use 100-500 (100 = closest to edge)
- **Higher numbers** = further from edge

### 3. Use Execution Settings

```json
{
  "execution": {
    "foreground": false, // Don't block UI
    "showProgress": true, // Show progress indicator
    "timeout": 300000 // 5 minute timeout
  }
}
```

### 4. Enable Debug Mode

```json
{
  "statusbarQuickActions": {
    "settings": {
      "debug": true
    }
  }
}
```

## 🎯 Common Use Cases

### JavaScript/Node.js Project

```json
[
  {
    "id": "install",
    "text": "$(cloud-download) Install",
    "command": { "type": "npm", "script": "install" }
  },
  {
    "id": "dev",
    "text": "$(play) Dev",
    "command": { "type": "npm", "script": "dev" }
  },
  {
    "id": "build",
    "text": "$(package) Build",
    "command": { "type": "npm", "script": "build" }
  }
]
```

### React Project

```json
[
  {
    "id": "dev",
    "text": "$(triangle-right) Start",
    "command": { "type": "npm", "script": "dev" }
  },
  {
    "id": "build",
    "text": "$(package) Build",
    "command": { "type": "npm", "script": "build" }
  }
]
```

### Git Repository

```json
[
  {
    "id": "status",
    "text": "$(git-branch) Status",
    "command": { "type": "shell", "command": "git", "args": ["status"] }
  },
  {
    "id": "push",
    "text": "$(cloud-upload) Push",
    "command": { "type": "shell", "command": "git", "args": ["push"] }
  }
]
```

## 🆘 Troubleshooting

### Button Not Showing

- Check if `enabled: true`
- Verify `alignment` and `priority` settings
- Enable debug mode to see errors

### Command Not Working

- Verify package manager is installed
- Check if script exists in package.json
- Test command in terminal first

### Performance Issues

- Reduce number of buttons initially
- Adjust visibility debounce settings
- Check [Performance Optimizations](PERFORMANCE_OPTIMIZATIONS.md)

## 🎉 Congratulations!

You've successfully set up StatusBar Quick Actions! You now have:

- ✅ Working status bar buttons
- ✅ Basic command execution
- ✅ Understanding of configuration structure
- ✅ Foundation for advanced features

**Next Steps**: Explore the [Sample Configurations](SAMPLE-CONFIGURATIONS.md) for more advanced setups, or dive into [Configuration Reference](CONFIGURATION_REFERENCE.md) for detailed options.

---

_Ready to become a power user? Check out the [Configuration Reference](CONFIGURATION_REFERENCE.md) next!_

_Last updated: December 2024_
