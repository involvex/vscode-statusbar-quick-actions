# Basic Configuration

Learn the fundamentals of configuring **StatusBar Quick Actions** buttons, from simple setups to more advanced options.

## 📋 Configuration Structure

The extension configuration is stored under the `statusbarQuickActions` key in your VS Code settings:

```json
{
  "statusbarQuickActions": {
    "buttons": [...],
    "settings": {
      "debug": false,
      "output": {...},
      "performance": {...}
    }
  }
}
```

## 🎯 Button Configuration

### Minimal Button Configuration

A button requires only three properties:

```json
{
  "id": "my-button",
  "text": "Click Me",
  "command": {
    "type": "shell",
    "command": "echo"
  }
}
```

### Complete Button Configuration

```json
{
  "id": "npm-dev-server",
  "text": "$(play) Dev Server",
  "tooltip": "Start the development server",
  "icon": {
    "id": "play",
    "animation": "spin"
  },
  "command": {
    "type": "npm",
    "script": "dev",
    "args": ["--host", "0.0.0.0"]
  },
  "enabled": true,
  "alignment": "left",
  "priority": 100,
  "colors": {
    "foreground": "#ffffff",
    "background": "#007acc"
  },
  "execution": {
    "foreground": false,
    "showProgress": true,
    "timeout": 300000,
    "notifications": {
      "showSuccess": true,
      "showError": true,
      "showOutput": false
    }
  },
  "visibility": {
    "conditions": [
      {
        "type": "fileType",
        "patterns": ["*.js", "*.ts", "*.jsx", "*.tsx"]
      }
    ],
    "debounceMs": 300
  },
  "workingDirectory": "${workspaceFolder}",
  "environment": {
    "NODE_ENV": "development"
  },
  "history": {
    "enabled": true,
    "maxEntries": 20
  }
}
```

## 🔧 Command Types

### Package Manager Commands

#### npm Scripts

```json
{
  "command": {
    "type": "npm",
    "script": "dev"
  }
}
```

#### yarn Scripts

```json
{
  "command": {
    "type": "yarn",
    "script": "build"
  }
}
```

#### pnpm Scripts

```json
{
  "command": {
    "type": "pnpm",
    "script": "test"
  }
}
```

#### bun Scripts

```json
{
  "command": {
    "type": "bun",
    "script": "dev"
  }
}
```

#### Auto-Detection

```json
{
  "command": {
    "type": "detect",
    "script": "dev"
  }
}
```

### Shell Commands

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

#### Complex Shell Commands

```json
{
  "command": {
    "type": "shell",
    "command": "npm",
    "args": ["run", "build", "&&", "npm", "run", "test"]
  }
}
```

#### With Environment Variables

```json
{
  "command": {
    "type": "shell",
    "command": "export",
    "args": ["NODE_ENV=production", "&&", "npm", "start"]
  }
}
```

### GitHub CLI Commands

```json
{
  "command": {
    "type": "github",
    "command": "pr",
    "args": ["create", "--fill"]
  }
}
```

### VS Code Commands

```json
{
  "command": {
    "type": "vscode",
    "command": "editor.action.formatDocument"
  }
}
```

### NPX Commands

```json
{
  "command": {
    "type": "npx",
    "script": "create-react-app"
  }
}
```

### Bunx Commands

```json
{
  "command": {
    "type": "bunx",
    "script": "vite"
  }
}
```

## 🎨 Icon Configuration

### Using Codicons

```json
{
  "icon": {
    "id": "play",
    "animation": "spin"
  }
}
```

### Popular Icons

- `$(play)` - Play button
- `$(stop)` - Stop button
- `$(sync)` - Sync/refresh
- `$(package)` - Package/box
- `$(beaker)` - Test tube
- `$(git-branch)` - Git branch
- `$(git-commit)` - Git commit
- `$(cloud-upload)` - Upload to cloud
- `$(cloud-download)` - Download from cloud
- `$(terminal)` - Terminal

### Icon Animations

- `"spin"` - Rotating animation
- `"pulse"` - Pulsing animation
- `null` - No animation

### Material Icons (Alternative)

```json
{
  "icon": {
    "id": "play_arrow",
    "library": "material",
    "variant": "outlined",
    "size": "medium"
  }
}
```

## ⚙️ Execution Settings

### Foreground vs Background

```json
{
  "execution": {
    "foreground": true, // Blocks UI, shows output
    "foreground": false // Non-blocking, shows progress only
  }
}
```

### Progress Notifications

```json
{
  "execution": {
    "showProgress": true,
    "timeout": 300000 // 5 minutes
  }
}
```

### Custom Notifications

```json
{
  "execution": {
    "notifications": {
      "showSuccess": true, // Show success messages
      "showError": true, // Show error messages
      "showOutput": false // Don't show output in notifications
    }
  }
}
```

## 📍 Positioning and Appearance

### Alignment

```json
{
  "alignment": "left", // Left side of status bar
  "alignment": "right" // Right side of status bar
}
```

### Priority (Positioning)

```json
{
  "priority": 100 // Lower numbers = closer to edge
}
```

### Custom Colors

```json
{
  "colors": {
    "foreground": "#ffffff", // Text color
    "background": "#007acc" // Background color
  }
}
```

### Theme Colors

```json
{
  "colors": {
    "foreground": "statusBarItem.foreground", // Use theme color
    "background": "statusBarItem.background" // Use theme color
  }
}
```

## 🌍 Working Directory and Environment

### Custom Working Directory

```json
{
  "workingDirectory": "${workspaceFolder}/src"
}
```

### Environment Variables

```json
{
  "environment": {
    "NODE_ENV": "development",
    "API_URL": "http://localhost:3000",
    "DEBUG": "app:*"
  }
}
```

### Combined Example

```json
{
  "workingDirectory": "${workspaceFolder}",
  "environment": {
    "NODE_ENV": "production"
  },
  "command": {
    "type": "shell",
    "command": "node",
    "args": ["server.js"]
  }
}
```

## 📊 History Tracking

### Enable History

```json
{
  "history": {
    "enabled": true,
    "maxEntries": 20
  }
}
```

### History Commands

- `StatusBar Quick Actions: View History` - View all execution history
- `StatusBar Quick Actions: Clear History` - Clear all history

## 🔧 Configuration Methods

### Method 1: VS Code Settings UI

1. **Open Settings** (`Ctrl+,`)
2. **Search** "StatusBar Quick Actions"
3. **Find** "statusbarQuickActions.buttons"
4. **Edit** the JSON array

### Method 2: Direct File Editing

#### User Settings (Global)

- **Windows**: `%APPDATA%\Code\User\settings.json`
- **macOS**: `~/Library/Application Support/Code/User/settings.json`
- **Linux**: `~/.config/Code/User/settings.json`

#### Workspace Settings (Project-specific)

- **Location**: `<project>/.vscode/settings.json`

### Method 3: Command Palette

1. **Open Command Palette** (`Ctrl+Shift+P`)
2. **Run**: `StatusBar Quick Actions: Edit Button`
3. **Use** interactive menus to configure

### Method 4: Configuration CLI

```bash
# Run the interactive CLI
bun run dev:cli
# or
npm run dev:cli
```

## 📝 Configuration Validation

The extension validates your configuration and provides helpful error messages:

### Common Validation Errors

1. **Missing Required Properties**

   ```json
   // ❌ Missing 'id'
   {
     "text": "Button",
     "command": { "type": "shell", "command": "echo" }
   }
   ```

2. **Invalid Command Type**

   ```json
   // ❌ Invalid type
   {
     "id": "button",
     "text": "Button",
     "command": { "type": "invalid", "script": "test" }
   }
   ```

3. **Empty Display Text**
   ```json
   // ❌ Empty text and no icon
   {
     "id": "button",
     "text": "",
     "command": { "type": "shell", "command": "echo" }
   }
   ```

### Validation Success Indicators

- ✅ Buttons appear in status bar immediately
- ✅ No error notifications
- ✅ Commands execute successfully
- ✅ Output panel shows execution results

## 🎯 Best Practices

### 1. Use Descriptive IDs

```json
{
  "id": "npm-dev-server", // ✅ Good
  "id": "button1" // ❌ Avoid
}
```

### 2. Provide Tooltips

```json
{
  "tooltip": "Start the development server for testing" // ✅ Helpful
}
```

### 3. Set Appropriate Priorities

```json
{
  "priority": 100, // Most important buttons
  "priority": 500 // Less important buttons
}
```

### 4. Use Background Execution

```json
{
  "execution": {
    "foreground": false, // ✅ Don't block UI
    "showProgress": true // ✅ Show progress
  }
}
```

### 5. Configure Timeouts

```json
{
  "execution": {
    "timeout": 300000 // 5 minutes for long operations
  }
}
```

## 🔍 Debug Configuration

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

### Debug Output

With debug mode enabled, you'll see:

- Configuration validation details
- Command execution logs
- Visibility check results
- Performance metrics

### Access Debug Information

1. **Output Panel**: "StatusBar Quick Actions" channel
2. **Developer Tools**: `F12` → Console tab

## 🎉 Example: Complete Node.js Setup

```json
{
  "statusbarQuickActions": {
    "buttons": [
      {
        "id": "npm-install",
        "text": "$(cloud-download) Install",
        "tooltip": "Install dependencies",
        "command": { "type": "npm", "script": "install" },
        "alignment": "left",
        "priority": 100
      },
      {
        "id": "npm-dev",
        "text": "$(play) Dev",
        "tooltip": "Start development server",
        "command": { "type": "npm", "script": "dev" },
        "alignment": "left",
        "priority": 200,
        "execution": {
          "foreground": true,
          "showProgress": true,
          "timeout": 0
        }
      },
      {
        "id": "npm-build",
        "text": "$(package) Build",
        "tooltip": "Build for production",
        "command": { "type": "npm", "script": "build" },
        "alignment": "left",
        "priority": 300,
        "execution": {
          "foreground": false,
          "showProgress": true,
          "timeout": 300000
        }
      },
      {
        "id": "npm-test",
        "text": "$(beaker) Test",
        "tooltip": "Run tests",
        "command": { "type": "npm", "script": "test" },
        "alignment": "left",
        "priority": 400,
        "execution": {
          "foreground": false,
          "showProgress": true,
          "timeout": 300000
        }
      }
    ],
    "settings": {
      "debug": false,
      "output": {
        "enabled": true,
        "mode": "per-button"
      },
      "performance": {
        "visibilityDebounceMs": 300,
        "cacheResults": true
      }
    }
  }
}
```

## 🚀 Next Steps

Now that you understand basic configuration:

1. **Learn Advanced Features**: [Visibility Conditions](VISIBILITY_CONDITIONS.md)
2. **Explore Presets**: [Preset System](PRESET_AND_DYNAMIC_LABELS.md)
3. **Check Examples**: [Sample Configurations](SAMPLE-CONFIGURATIONS.md)
4. **Optimize Performance**: [Performance Optimizations](PERFORMANCE_OPTIMIZATIONS.md)

---

_Ready to make your buttons smarter? Check out [Visibility Conditions](VISIBILITY_CONDITIONS.md)!_

_Last updated: December 2024_
