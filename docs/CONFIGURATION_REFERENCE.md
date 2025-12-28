# Configuration Reference

Complete reference for all **StatusBar Quick Actions** configuration options, settings, and advanced customization possibilities.

## 📋 Configuration Structure

### Root Configuration

```json
{
  "statusbarQuickActions": {
    "buttons": [],
    "settings": {
      "debug": false,
      "output": {...},
      "performance": {...},
      "icons": {...}
    },
    "theme": {...},
    "notifications": {...}
  }
}
```

## 🎯 Button Configuration

### Required Properties

#### `id`

- **Type**: `string`
- **Required**: `true`
- **Description**: Unique identifier for the button
- **Constraints**: Must be unique across all buttons
- **Pattern**: `^[a-zA-Z0-9_-]+$`

```json
{
  "id": "npm-dev-server"
}
```

#### `text`

- **Type**: `string`
- **Required**: `true` (unless `icon` is provided)
- **Description**: Display text (supports emojis and icons)
- **Examples**: `"$(play) Dev"`, `"Build 🔨"`, `"Test ⚡"`

```json
{
  "text": "$(play) Development Server"
}
```

#### `command`

- **Type**: `object`
- **Required**: `true`
- **Description**: Command to execute

**Command Object Structure**:

```json
{
  "command": {
    "type": "npm|yarn|pnpm|bun|shell|github|vscode|task|npx|pnpx|bunx|detect",
    "script": "string", // For package manager commands
    "command": "string", // For shell and other commands
    "args": ["string"] // Additional arguments
  }
}
```

### Optional Properties

#### `tooltip`

- **Type**: `string`
- **Required**: `false`
- **Default**: Button `text`
- **Description**: Tooltip shown on hover

```json
{
  "tooltip": "Start the development server with hot reload"
}
```

#### `icon`

- **Type**: `object`
- **Required**: `false`
- **Description**: Icon configuration for the button

```json
{
  "icon": {
    "id": "play",
    "animation": "spin|pulse|null",
    "library": "vscode|material",
    "variant": "outlined|filled|rounded|sharp|two-tone",
    "size": "small|medium|large"
  }
}
```

#### `enabled`

- **Type**: `boolean`
- **Required**: `false`
- **Default**: `true`
- **Description**: Whether the button is enabled

```json
{
  "enabled": true
}
```

#### `alignment`

- **Type**: `string`
- **Required**: `false`
- **Default**: `"left"`
- **Description**: Position in status bar
- **Values**: `"left"`, `"right"`

```json
{
  "alignment": "right"
}
```

#### `priority`

- **Type**: `number`
- **Required**: `false`
- **Default**: `100`
- **Description**: Display order (higher = further from edge)
- **Range**: `0` to `1000`

```json
{
  "priority": 200
}
```

#### `colors`

- **Type**: `object`
- **Required**: `false`
- **Description**: Custom colors for the button

```json
{
  "colors": {
    "foreground": "#ffffff",
    "background": "#007acc"
  }
}
```

#### `execution`

- **Type**: `object`
- **Required**: `false`
- **Description**: Execution behavior configuration

```json
{
  "execution": {
    "foreground": false,
    "showProgress": true,
    "timeout": 300000,
    "notifications": {
      "showSuccess": true,
      "showError": true,
      "showOutput": false
    }
  }
}
```

#### `visibility`

- **Type**: `object`
- **Required**: `false`
- **Description**: Visibility conditions

```json
{
  "visibility": {
    "conditions": [],
    "debounceMs": 300
  }
}
```

#### `workingDirectory`

- **Type**: `string`
- **Required**: `false`
- **Description**: Working directory for command execution
- **Variables**: `${workspaceFolder}`, `${fileBasename}`, etc.

```json
{
  "workingDirectory": "${workspaceFolder}/src"
}
```

#### `environment`

- **Type**: `object`
- **Required**: `false`
- **Description**: Environment variables for command execution

```json
{
  "environment": {
    "NODE_ENV": "development",
    "API_URL": "http://localhost:3000"
  }
}
```

#### `history`

- **Type**: `object`
- **Required**: `false`
- **Description**: History tracking configuration

```json
{
  "history": {
    "enabled": true,
    "maxEntries": 20
  }
}
```

#### `dynamicLabel`

- **Type**: `object`
- **Required**: `false`
- **Description**: Dynamic label configuration

```json
{
  "dynamicLabel": {
    "type": "time|url|env|git|custom",
    "format": "HH:mm:ss",
    "url": "https://api.example.com/status",
    "envVar": "NODE_ENV",
    "gitInfo": "branch|status|remote",
    "customFunction": "myFunction",
    "refreshInterval": 5000,
    "fallback": "Unknown",
    "template": "${value}"
  }
}
```

## ⚙️ Settings Configuration

### `debug`

- **Type**: `boolean`
- **Default**: `false`
- **Description**: Enable debug logging

```json
{
  "settings": {
    "debug": true
  }
}
```

### `output`

- **Type**: `object`
- **Description**: Output panel configuration

```json
{
  "settings": {
    "output": {
      "enabled": true,
      "mode": "per-button|shared",
      "format": "raw|formatted|ansi",
      "clearOnRun": false,
      "showTimestamps": true,
      "preserveHistory": true,
      "maxLines": 1000
    }
  }
}
```

#### Output Configuration Properties

| Property          | Type      | Default        | Description                    |
| ----------------- | --------- | -------------- | ------------------------------ |
| `enabled`         | `boolean` | `true`         | Enable output panel            |
| `mode`            | `string`  | `"per-button"` | Panel mode: separate or shared |
| `format`          | `string`  | `"formatted"`  | Output formatting              |
| `clearOnRun`      | `boolean` | `false`        | Clear panel before execution   |
| `showTimestamps`  | `boolean` | `true`         | Show timestamps                |
| `preserveHistory` | `boolean` | `true`         | Keep history across runs       |
| `maxLines`        | `number`  | `1000`         | Maximum lines to keep          |

### `performance`

- **Type**: `object`
- **Description**: Performance optimization settings

```json
{
  "settings": {
    "performance": {
      "visibilityDebounceMs": 300,
      "enableVirtualization": false,
      "cacheResults": true
    }
  }
}
```

#### Performance Configuration Properties

| Property               | Type      | Default | Description                           |
| ---------------------- | --------- | ------- | ------------------------------------- |
| `visibilityDebounceMs` | `number`  | `300`   | Debounce delay for visibility checks  |
| `enableVirtualization` | `boolean` | `false` | Enable virtualization for large lists |
| `cacheResults`         | `boolean` | `true`  | Cache visibility evaluation results   |

### `icons`

- **Type**: `object`
- **Description**: Icon configuration

```json
{
  "settings": {
    "icons": {
      "library": "vscode|material",
      "defaultVariant": "outlined|filled|rounded|sharp|two-tone",
      "defaultSize": "small|medium|large"
    }
  }
}
```

#### Icon Configuration Properties

| Property         | Type     | Default      | Description                        |
| ---------------- | -------- | ------------ | ---------------------------------- |
| `library`        | `string` | `"vscode"`   | Icon library to use                |
| `defaultVariant` | `string` | `"outlined"` | Default variant for Material icons |
| `defaultSize`    | `string` | `"medium"`   | Default icon size                  |

## 🎨 Theme Configuration

### `theme`

- **Type**: `object`
- **Description**: Theme configuration for the extension

```json
{
  "theme": {
    "mode": "auto|dark|light|highContrast",
    "dark": {
      "button": {
        "foreground": "#ffffff",
        "background": "#6c757d"
      },
      "executing": {
        "foreground": "#ffffff",
        "background": "#007acc"
      },
      "error": {
        "foreground": "#ffffff",
        "background": "#dc3545"
      }
    },
    "light": {
      "button": {
        "foreground": "#333333",
        "background": "#e9ecef"
      },
      "executing": {
        "foreground": "#ffffff",
        "background": "#007acc"
      },
      "error": {
        "foreground": "#ffffff",
        "background": "#dc3545"
      }
    },
    "highContrast": {
      "button": {
        "foreground": "#ffffff",
        "background": "#000000"
      },
      "executing": {
        "foreground": "#ffffff",
        "background": "#0066cc"
      },
      "error": {
        "foreground": "#ffffff",
        "background": "#cc0000"
      }
    }
  }
}
```

### Theme Modes

#### `auto`

- Automatically detects VS Code theme
- Uses `dark` or `light` configuration

#### `dark`

- Forces dark theme regardless of VS Code theme

#### `light`

- Forces light theme regardless of VS Code theme

#### `highContrast`

- High contrast mode for accessibility
- Enhanced colors for better visibility

## 🔔 Notification Configuration

### `notifications`

- **Type**: `object`
- **Description**: Global notification settings

```json
{
  "notifications": {
    "showSuccess": true,
    "showError": true,
    "showProgress": true,
    "position": "top-left|top-right|bottom-left|bottom-right",
    "duration": 5000,
    "includeOutput": false
  }
}
```

#### Notification Properties

| Property        | Type      | Default          | Description                     |
| --------------- | --------- | ---------------- | ------------------------------- |
| `showSuccess`   | `boolean` | `true`           | Show success notifications      |
| `showError`     | `boolean` | `true`           | Show error notifications        |
| `showProgress`  | `boolean` | `true`           | Show progress notifications     |
| `position`      | `string`  | `"bottom-right"` | Notification position           |
| `duration`      | `number`  | `5000`           | Duration in milliseconds        |
| `includeOutput` | `boolean` | `false`          | Include output in notifications |

## 📊 Command Types Reference

### Package Manager Commands

#### `npm`

```json
{
  "command": {
    "type": "npm",
    "script": "dev"
  }
}
```

#### `yarn`

```json
{
  "command": {
    "type": "yarn",
    "script": "build"
  }
}
```

#### `pnpm`

```json
{
  "command": {
    "type": "pnpm",
    "script": "test"
  }
}
```

#### `bun`

```json
{
  "command": {
    "type": "bun",
    "script": "dev"
  }
}
```

#### `detect`

```json
{
  "command": {
    "type": "detect",
    "script": "dev"
  }
}
```

### Shell Commands

#### Basic Shell

```json
{
  "command": {
    "type": "shell",
    "command": "echo",
    "args": ["Hello", "World"]
  }
}
```

#### Complex Shell

```json
{
  "command": {
    "type": "shell",
    "command": "bash",
    "args": ["-c", "npm run build && npm run test"]
  }
}
```

### Other Command Types

#### GitHub CLI

```json
{
  "command": {
    "type": "github",
    "command": "pr",
    "args": ["create", "--fill"]
  }
}
```

#### VS Code Commands

```json
{
  "command": {
    "type": "vscode",
    "command": "editor.action.formatDocument"
  }
}
```

#### NPX Commands

```json
{
  "command": {
    "type": "npx",
    "script": "create-react-app"
  }
}
```

## 🔍 Visibility Conditions Reference

### `fileType`

```json
{
  "type": "fileType",
  "patterns": ["*.js", "*.ts", "*.jsx", "*.tsx"]
}
```

### `fileExists`

```json
{
  "type": "fileExists",
  "path": "Dockerfile"
}
```

### `gitStatus`

```json
{
  "type": "gitStatus",
  "status": "repository|clean|dirty|ahead|behind"
}
```

### `workspaceFolder`

```json
{
  "type": "workspaceFolder",
  "folders": ["api", "backend", "frontend"]
}
```

### Condition Inversion

```json
{
  "type": "gitStatus",
  "status": "dirty",
  "invert": true
}
```

## 🎭 Dynamic Label Types

### Time Labels

```json
{
  "dynamicLabel": {
    "type": "time",
    "format": "HH:mm:ss",
    "refreshInterval": 1000,
    "template": "🕐 ${value}"
  }
}
```

### URL Labels

```json
{
  "dynamicLabel": {
    "type": "url",
    "url": "https://api.example.com/status",
    "refreshInterval": 30000,
    "fallback": "Unknown",
    "template": "API: ${value}"
  }
}
```

### Environment Variable Labels

```json
{
  "dynamicLabel": {
    "type": "env",
    "envVar": "NODE_ENV",
    "fallback": "development",
    "template": "ENV: ${value}"
  }
}
```

### Git Information Labels

```json
{
  "dynamicLabel": {
    "type": "git",
    "gitInfo": "branch|status|remote",
    "refreshInterval": 5000,
    "fallback": "No Git",
    "template": "⎇ ${value}"
  }
}
```

### Custom Labels (Future)

```json
{
  "dynamicLabel": {
    "type": "custom",
    "customFunction": "myCustomFunction",
    "fallback": "N/A"
  }
}
```

## 📝 Complete Example Configuration

```json
{
  "statusbarQuickActions": {
    "buttons": [
      {
        "id": "npm-dev",
        "text": "$(play) Dev",
        "tooltip": "Start development server",
        "icon": {
          "id": "play",
          "animation": "spin"
        },
        "command": {
          "type": "npm",
          "script": "dev"
        },
        "enabled": true,
        "alignment": "left",
        "priority": 100,
        "colors": {
          "foreground": "#ffffff",
          "background": "#007acc"
        },
        "execution": {
          "foreground": true,
          "showProgress": true,
          "timeout": 0,
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
            },
            {
              "type": "fileExists",
              "path": "package.json"
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
        },
        "dynamicLabel": {
          "type": "git",
          "gitInfo": "branch",
          "refreshInterval": 5000,
          "fallback": "main",
          "template": "⎇ ${value}"
        }
      }
    ],
    "settings": {
      "debug": false,
      "output": {
        "enabled": true,
        "mode": "per-button",
        "format": "formatted",
        "clearOnRun": false,
        "showTimestamps": true,
        "preserveHistory": true,
        "maxLines": 1000
      },
      "performance": {
        "visibilityDebounceMs": 300,
        "enableVirtualization": false,
        "cacheResults": true
      },
      "icons": {
        "library": "vscode",
        "defaultVariant": "outlined",
        "defaultSize": "medium"
      }
    },
    "theme": {
      "mode": "auto",
      "dark": {
        "button": {
          "foreground": "#ffffff",
          "background": "#6c757d"
        },
        "executing": {
          "foreground": "#ffffff",
          "background": "#007acc"
        },
        "error": {
          "foreground": "#ffffff",
          "background": "#dc3545"
        }
      },
      "light": {
        "button": {
          "foreground": "#333333",
          "background": "#e9ecef"
        },
        "executing": {
          "foreground": "#ffffff",
          "background": "#007acc"
        },
        "error": {
          "foreground": "#ffffff",
          "background": "#dc3545"
        }
      },
      "highContrast": {
        "button": {
          "foreground": "#ffffff",
          "background": "#000000"
        },
        "executing": {
          "foreground": "#ffffff",
          "background": "#0066cc"
        },
        "error": {
          "foreground": "#ffffff",
          "background": "#cc0000"
        }
      }
    },
    "notifications": {
      "showSuccess": true,
      "showError": true,
      "showProgress": true,
      "position": "bottom-right",
      "duration": 5000,
      "includeOutput": false
    }
  }
}
```

## 🔧 Configuration Validation

### Required Properties Check

- Every button must have `id`, `text` or `icon`, and `command`
- Button IDs must be unique
- Command types must be valid

### Type Validation

- All properties must match their specified types
- Arrays must contain valid elements
- Objects must have valid structure

### Constraint Validation

- Priority values must be between 0 and 1000
- Timeout values must be positive numbers
- File patterns must be valid glob patterns

### Error Reporting

Configuration errors are reported in:

- **Output Panel**: "StatusBar Quick Actions" channel
- **VS Code Notifications**: Error messages with details
- **Status Bar**: Visual indicators for invalid buttons

## 🚀 Best Practices

### 1. Use Descriptive IDs

```json
{
  "id": "npm-dev-server" // ✅ Good
}
```

### 2. Provide Helpful Tooltips

```json
{
  "tooltip": "Start the development server for testing" // ✅ Helpful
}
```

### 3. Set Appropriate Priorities

```json
{
  "priority": 100 // Most important
}
```

### 4. Use Background Execution

```json
{
  "execution": {
    "foreground": false // ✅ Don't block UI
  }
}
```

### 5. Configure Timeouts

```json
{
  "execution": {
    "timeout": 300000 // 5 minutes for builds
  }
}
```

## 🎉 Summary

This reference covers all configuration options available in StatusBar Quick Actions:

- ✅ Complete button configuration options
- ✅ All supported command types
- ✅ Visibility condition types
- ✅ Dynamic label configurations
- ✅ Theme and appearance settings
- ✅ Performance optimization options
- ✅ Notification and output settings

**Next Steps**: Explore [Sample Configurations](SAMPLE-CONFIGURATIONS.md) for practical examples, or learn about [CLI Tool](CLI_TOOL.md) for command-line configuration.

---

_This is your complete reference for configuring StatusBar Quick Actions exactly how you need it!_

_Last updated: December 2024_
