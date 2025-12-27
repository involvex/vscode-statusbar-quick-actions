# StatusBar Quick Actions

A comprehensive VSCode extension that provides highly customizable statusbar buttons for executing user-defined scripts and commands.

## Features

### 🚀 **Universal Command Execution**

- **Package Manager Scripts**: Support for npm, yarn, pnpm, and bun
- **GitHub CLI Integration**: Execute GitHub commands directly from statusbar
- **Custom Shell Scripts**: Run any shell command with environment variables
- **VSCode Commands**: Execute built-in VSCode commands
- **Auto-Detection**: Automatically detect package managers from lock files

### 🎨 **Modern Theme System**

- **Dark/Light Mode**: Automatic theme detection from VSCode
- **High Contrast Support**: Accessibility-first design
- **Custom Color Palettes**: Configurable colors for different button states
- **StatusBar Integration**: Seamless integration with VSCode themes

### 👁️ **Smart Visibility Conditions**

- **File Type Patterns**: Show buttons based on current file type
- **Git Repository Status**: Conditional display based on repository state
- **Workspace Folder Detection**: Context-aware button visibility
- **File/Directory Existence**: Dynamic button configuration

### ⚡ **Enterprise-Grade Features**

- **Real-time Progress**: Visual feedback during command execution
- **Error Handling**: Comprehensive error management with user-friendly messages
- **Command History**: Track and analyze command execution patterns
- **Timeout Management**: Configurable execution timeouts
- **Background Execution**: Run commands in background with progress indicators

### ♿ **Accessibility Support**

- **Keyboard Navigation**: Full keyboard accessibility
- **Screen Reader Compatibility**: ARIA labels and descriptions
- **High Contrast Mode**: Optimized for accessibility needs
- **Focus Management**: Proper focus order and indicators

## Installation

1. **From VS Code**: Search for "StatusBar Quick Actions" in the Extensions view
2. **From VSIX**: Download the extension package and install via `code --install-extension`
3. **Development**: Clone the repository and install locally

## Quick Start

### Basic Configuration

1. Open VS Code Settings (`Ctrl+,` or `Cmd+,`)
2. Search for "StatusBar Quick Actions"
3. Configure your first button:

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
      }
    ]
  }
}
```

### Sample Configurations

The extension includes comprehensive sample configurations for various project types:

- **JavaScript/Node.js**: npm scripts, testing, building
- **React/TypeScript**: Development server, builds, testing
- **Python Development**: Virtual environments, testing, formatting
- **Git Operations**: Status, commit, push, pull workflows
- **Docker Workflows**: Container management and deployment

See `SAMPLE-CONFIGURATIONS.md` for detailed examples.

## Configuration Options

### Button Configuration

```json
{
  "id": "unique-button-id",
  "text": "$(icon) Button Text",
  "tooltip": "Tooltip description",
  "command": {
    "type": "npm|yarn|pnpm|bun|shell|github|vscode|detect",
    "script": "package-script-name",
    "command": "shell-command",
    "args": ["arg1", "arg2"]
  },
  "enabled": true,
  "alignment": "left|right",
  "priority": 100,
  "colors": {
    "foreground": "#ffffff",
    "background": "#6c757d"
  },
  "execution": {
    "foreground": true,
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
        "type": "fileType|fileExists|gitStatus|workspaceFolder",
        "patterns": ["*.js", "*.ts"],
        "status": "clean|dirty|ahead|behind",
        "folders": ["src", "test"],
        "invert": false
      }
    ]
  },
  "workingDirectory": "${workspaceFolder}",
  "environment": {
    "NODE_ENV": "development",
    "API_URL": "http://localhost:3000"
  }
}
```

### Theme Configuration

```json
{
  "statusbarQuickActions": {
    "theme": {
      "mode": "auto|dark|light|highContrast",
      "dark": {
        "button": { "foreground": "#ffffff", "background": "#6c757d" },
        "executing": { "foreground": "#ffffff", "background": "#007acc" },
        "error": { "foreground": "#ffffff", "background": "#dc3545" }
      },
      "light": {
        /* same structure */
      },
      "highContrast": {
        /* same structure */
      }
    }
  }
}
```

### Notification Configuration

```json
{
  "statusbarQuickActions": {
    "notifications": {
      "showSuccess": true,
      "showError": true,
      "showProgress": true,
      "position": "top-left|top-right|bottom-left|bottom-right",
      "duration": 5000,
      "includeOutput": false
    }
  }
}
```

## Command Types

### Package Manager Scripts

```json
{
  "command": {
    "type": "npm",
    "script": "dev"
  }
}
```

### Shell Commands

```json
{
  "command": {
    "type": "shell",
    "command": "echo",
    "args": ["Hello", "World"]
  }
}
```

### GitHub CLI

```json
{
  "command": {
    "type": "github",
    "command": "pr",
    "args": ["create", "--fill"]
  }
}
```

### VSCode Commands

```json
{
  "command": {
    "type": "vscode",
    "command": "editor.action.formatDocument"
  }
}
```

### Auto-Detection

```json
{
  "command": {
    "type": "detect",
    "script": "dev"
  }
}
```

## Visibility Conditions

### File Type Patterns

```json
{
  "conditions": [
    {
      "type": "fileType",
      "patterns": ["*.js", "*.ts", "*.jsx", "*.tsx"]
    }
  ]
}
```

### Git Repository Status

```json
{
  "conditions": [
    {
      "type": "gitStatus",
      "status": "dirty"
    }
  ]
}
```

### Workspace Folders

```json
{
  "conditions": [
    {
      "type": "workspaceFolder",
      "folders": ["api", "frontend"]
    }
  ]
}
```

### File Existence

```json
{
  "conditions": [
    {
      "type": "fileExists",
      "path": "Dockerfile"
    }
  ]
}
```

## Commands

The extension provides several commands:

- `statusbarQuickActions.editButton`: Edit button configuration
- `statusbarQuickActions.viewHistory`: View command execution history
- `statusbarQuickActions.clearHistory`: Clear command history

## Keyboard Shortcuts

- **Alt+1-9**: Execute buttons 1-9 (configurable)
- **F1**: Show command palette with extension commands

## Development Workflows

### JavaScript/Node.js

```json
{
  "buttons": [
    {
      "id": "npm-install",
      "text": "$(cloud-download) Install",
      "command": { "type": "npm", "script": "install" }
    },
    {
      "id": "npm-test",
      "text": "$(beaker) Test",
      "command": { "type": "npm", "script": "test" }
    }
  ]
}
```

### React Development

```json
{
  "buttons": [
    {
      "id": "react-dev",
      "text": "$(triangle-right) Start",
      "command": { "type": "npm", "script": "dev" },
      "visibility": {
        "conditions": [{ "type": "fileType", "patterns": ["*.tsx", "*.ts"] }]
      }
    }
  ]
}
```

### Git Workflow

```json
{
  "buttons": [
    {
      "id": "git-status",
      "text": "$(git-branch) Status",
      "command": { "type": "shell", "command": "git", "args": ["status"] }
    },
    {
      "id": "git-commit",
      "text": "$(git-commit) Commit",
      "command": {
        "type": "shell",
        "command": "git",
        "args": ["commit", "-m", "${input:commitMessage}"]
      }
    }
  ]
}
```

## Advanced Features

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

### Working Directory

```json
{
  "workingDirectory": "${workspaceFolder}/src"
}
```

### Timeout Configuration

```json
{
  "execution": {
    "timeout": 300000,
    "showProgress": true
  }
}
```

## Troubleshooting

### Common Issues

1. **Button not showing**
   - Check visibility conditions
   - Verify file associations
   - Enable debug mode in settings

2. **Command not found**
   - Verify package manager installation
   - Check PATH environment variable
   - Ensure script exists in package.json

3. **Permission errors**
   - Check file permissions
   - Verify working directory access
   - Run VS Code as administrator (Windows)

### Debug Mode

Enable debug mode for detailed logging:

```json
{
  "statusbarQuickActions": {
    "settings": {
      "debug": true
    }
  }
}
```

### Output Panel

Check the "StatusBar Quick Actions" output channel for:

- Command execution logs
- Error messages
- Configuration validation results

## API Integration

### VSCode Tasks Integration

The extension can integrate with VSCode's task system:

```json
{
  "command": {
    "type": "shell",
    "command": "code",
    "args": ["--task", "build"]
  }
}
```

### Custom Extensions

Developers can extend the extension by:

- Adding new command types
- Implementing custom visibility conditions
- Creating theme variants
- Adding notification providers

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

### Development Setup

```bash
# Clone the repository
git clone https://github.com/yourusername/vscode-statusbar-quick-actions.git

# Install dependencies
cd vscode-statusbar-quick-actions
npm install

# Build the extension
npm run compile

# Run in development mode
npm run watch
```

### Code Style

- Use TypeScript with strict mode
- Follow ESLint configuration
- Write comprehensive tests
- Document public APIs

## License

MIT License - see LICENSE file for details.

## Changelog

### v1.0.0

- Initial release
- Universal command execution
- Modern theme system
- Smart visibility conditions
- Comprehensive sample configurations
- Accessibility support
- Enterprise-grade error handling

## Support

- **Issues**: Report bugs and feature requests on GitHub
- **Documentation**: Comprehensive guides and samples
- **Community**: Join discussions and share configurations

---

**Made with ❤️ for the VS Code community**

_Streamline your development workflow with intelligent statusbar actions._
