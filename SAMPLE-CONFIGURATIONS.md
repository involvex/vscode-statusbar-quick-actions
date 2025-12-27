# StatusBar Quick Actions - Sample Configurations

This document provides comprehensive sample configurations for various development workflows and project types.

## Table of Contents

1. [Basic JavaScript/Node.js](#basic-javascriptnodejs)
2. [React/TypeScript Project](#reacttypescript-project)
3. [Python Development](#python-development)
4. [Git Operations](#git-operations)
5. [Docker Workflows](#docker-workflows)
6. [Multi-Service Applications](#multi-service-applications)
7. [Advanced Use Cases](#advanced-use-cases)

---

## Basic JavaScript/Node.js

Perfect for npm/yarn/pnpm/bun package management and basic development tasks.

```json
{
  "statusbarQuickActions": {
    "buttons": [
      {
        "id": "npm-install",
        "text": "$(cloud-download) Install",
        "tooltip": "Install npm dependencies",
        "command": {
          "type": "npm",
          "script": "install"
        },
        "enabled": true,
        "alignment": "left",
        "priority": 100,
        "execution": {
          "foreground": true,
          "showProgress": true,
          "timeout": 300000
        }
      },
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
        "command": {
          "type": "npm",
          "script": "build"
        },
        "enabled": true,
        "alignment": "left",
        "priority": 300,
        "execution": {
          "foreground": true,
          "showProgress": true,
          "timeout": 600000
        }
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
        "priority": 400,
        "execution": {
          "foreground": false,
          "showProgress": true,
          "timeout": 300000
        }
      }
    ]
  }
}
```

---

## React/TypeScript Project

Comprehensive React/TypeScript development workflow with TypeScript support.

```json
{
  "statusbarQuickActions": {
    "buttons": [
      {
        "id": "react-dev",
        "text": "$(triangle-right) Start",
        "tooltip": "Start React development server",
        "command": {
          "type": "npm",
          "script": "dev"
        },
        "enabled": true,
        "alignment": "left",
        "priority": 100,
        "execution": {
          "foreground": true,
          "showProgress": true
        },
        "visibility": {
          "conditions": [
            {
              "type": "fileType",
              "patterns": ["*.tsx", "*.ts", "*.jsx", "*.js"]
            }
          ]
        }
      },
      {
        "id": "react-build",
        "text": "$(package) Build",
        "tooltip": "Build React app for production",
        "command": {
          "type": "npm",
          "script": "build"
        },
        "enabled": true,
        "alignment": "left",
        "priority": 200,
        "execution": {
          "foreground": false,
          "showProgress": true,
          "timeout": 600000
        }
      },
      {
        "id": "react-test",
        "text": "$(beaker) Test",
        "tooltip": "Run React tests with coverage",
        "command": {
          "type": "npm",
          "script": "test -- --coverage"
        },
        "enabled": true,
        "alignment": "left",
        "priority": 300,
        "execution": {
          "foreground": false,
          "showProgress": true,
          "timeout": 300000
        }
      },
      {
        "id": "react-storybook",
        "text": "$(book) Storybook",
        "tooltip": "Start Storybook development server",
        "command": {
          "type": "npm",
          "script": "storybook"
        },
        "enabled": true,
        "alignment": "right",
        "priority": 100,
        "execution": {
          "foreground": true,
          "showProgress": true
        },
        "visibility": {
          "conditions": [
            {
              "type": "fileExists",
              "path": ".storybook"
            }
          ]
        }
      },
      {
        "id": "ts-check",
        "text": "$(symbol-constructor) Type Check",
        "tooltip": "Run TypeScript type checking",
        "command": {
          "type": "npm",
          "script": "type-check"
        },
        "enabled": true,
        "alignment": "right",
        "priority": 200,
        "execution": {
          "foreground": false,
          "showProgress": true
        }
      }
    ]
  }
}
```

---

## Python Development

Python-focused configuration with virtual environment support and testing.

```json
{
  "statusbarQuickActions": {
    "buttons": [
      {
        "id": "python-run",
        "text": "$(play) Run",
        "tooltip": "Run current Python file",
        "command": {
          "type": "shell",
          "command": "python",
          "args": ["${fileBasename}"]
        },
        "enabled": true,
        "alignment": "left",
        "priority": 100,
        "execution": {
          "foreground": true,
          "showProgress": true,
          "timeout": 60000
        },
        "visibility": {
          "conditions": [
            {
              "type": "fileType",
              "patterns": ["*.py"]
            }
          ]
        }
      },
      {
        "id": "python-test",
        "text": "$(beaker) Test",
        "tooltip": "Run pytest",
        "command": {
          "type": "shell",
          "command": "pytest",
          "args": ["-v"]
        },
        "enabled": true,
        "alignment": "left",
        "priority": 200,
        "execution": {
          "foreground": false,
          "showProgress": true,
          "timeout": 300000
        },
        "visibility": {
          "conditions": [
            {
              "type": "fileExists",
              "path": "pytest.ini"
            }
          ]
        }
      },
      {
        "id": "python-format",
        "text": "$(symbol-number) Format",
        "tooltip": "Format Python code with black",
        "command": {
          "type": "shell",
          "command": "black",
          "args": ["."]
        },
        "enabled": true,
        "alignment": "right",
        "priority": 100,
        "execution": {
          "foreground": false,
          "showProgress": true,
          "timeout": 120000
        },
        "visibility": {
          "conditions": [
            {
              "type": "fileType",
              "patterns": ["*.py"]
            }
          ]
        }
      },
      {
        "id": "python-lint",
        "text": "$(warning) Lint",
        "tooltip": "Run pylint",
        "command": {
          "type": "shell",
          "command": "pylint",
          "args": ["."]
        },
        "enabled": true,
        "alignment": "right",
        "priority": 200,
        "execution": {
          "foreground": false,
          "showProgress": true,
          "timeout": 120000
        },
        "visibility": {
          "conditions": [
            {
              "type": "fileType",
              "patterns": ["*.py"]
            }
          ]
        }
      },
      {
        "id": "python-venv",
        "text": "$(symbol-class) Venv",
        "tooltip": "Activate virtual environment",
        "command": {
          "type": "shell",
          "command": "source",
          "args": [
            "venv/bin/activate",
            "&&",
            "echo",
            "Virtual environment activated"
          ]
        },
        "enabled": true,
        "alignment": "right",
        "priority": 300,
        "execution": {
          "foreground": true,
          "showProgress": true,
          "timeout": 10000
        },
        "visibility": {
          "conditions": [
            {
              "type": "fileExists",
              "path": "venv"
            }
          ]
        }
      }
    ]
  }
}
```

---

## Git Operations

Git workflow buttons for repository management and common GitHub actions.

```json
{
  "statusbarQuickActions": {
    "buttons": [
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
        "alignment": "left",
        "priority": 100,
        "execution": {
          "foreground": false,
          "showProgress": false
        },
        "visibility": {
          "conditions": [
            {
              "type": "gitStatus",
              "status": "repository"
            }
          ]
        }
      },
      {
        "id": "git-commit",
        "text": "$(git-commit) Commit",
        "tooltip": "Commit changes with message",
        "command": {
          "type": "shell",
          "command": "git",
          "args": ["commit", "-m", "${input:commitMessage}"]
        },
        "enabled": true,
        "alignment": "left",
        "priority": 200,
        "execution": {
          "foreground": true,
          "showProgress": true,
          "timeout": 60000
        },
        "visibility": {
          "conditions": [
            {
              "type": "gitStatus",
              "status": "dirty"
            }
          ]
        }
      },
      {
        "id": "git-push",
        "text": "$(cloud-upload) Push",
        "tooltip": "Push to remote repository",
        "command": {
          "type": "shell",
          "command": "git",
          "args": ["push", "origin", "HEAD"]
        },
        "enabled": true,
        "alignment": "left",
        "priority": 300,
        "execution": {
          "foreground": false,
          "showProgress": true,
          "timeout": 120000
        },
        "visibility": {
          "conditions": [
            {
              "type": "gitStatus",
              "status": "ahead"
            }
          ]
        }
      },
      {
        "id": "git-pull",
        "text": "$(cloud-download) Pull",
        "tooltip": "Pull from remote repository",
        "command": {
          "type": "shell",
          "command": "git",
          "args": ["pull", "--rebase"]
        },
        "enabled": true,
        "alignment": "left",
        "priority": 400,
        "execution": {
          "foreground": false,
          "showProgress": true,
          "timeout": 120000
        },
        "visibility": {
          "conditions": [
            {
              "type": "gitStatus",
              "status": "repository"
            }
          ]
        }
      },
      {
        "id": "gh-pr-create",
        "text": "$(git-pull-request) PR",
        "tooltip": "Create GitHub Pull Request",
        "command": {
          "type": "github",
          "command": "pr",
          "args": ["create", "--fill"]
        },
        "enabled": true,
        "alignment": "right",
        "priority": 100,
        "execution": {
          "foreground": true,
          "showProgress": true,
          "timeout": 60000
        },
        "visibility": {
          "conditions": [
            {
              "type": "gitStatus",
              "status": "ahead"
            }
          ]
        }
      }
    ]
  }
}
```

---

## Docker Workflows

Container management and deployment buttons for Docker-based projects.

```json
{
  "statusbarQuickActions": {
    "buttons": [
      {
        "id": "docker-build",
        "text": "$(package) Build",
        "tooltip": "Build Docker image",
        "command": {
          "type": "shell",
          "command": "docker",
          "args": ["build", "-t", "${input:imageName}", "."]
        },
        "enabled": true,
        "alignment": "left",
        "priority": 100,
        "execution": {
          "foreground": false,
          "showProgress": true,
          "timeout": 600000
        },
        "visibility": {
          "conditions": [
            {
              "type": "fileExists",
              "path": "Dockerfile"
            }
          ]
        }
      },
      {
        "id": "docker-run",
        "text": "$(play) Run",
        "tooltip": "Run Docker container",
        "command": {
          "type": "shell",
          "command": "docker",
          "args": [
            "run",
            "-d",
            "--name",
            "${input:containerName}",
            "${input:imageName}"
          ]
        },
        "enabled": true,
        "alignment": "left",
        "priority": 200,
        "execution": {
          "foreground": true,
          "showProgress": true,
          "timeout": 30000
        },
        "visibility": {
          "conditions": [
            {
              "type": "fileExists",
              "path": "Dockerfile"
            }
          ]
        }
      },
      {
        "id": "docker-logs",
        "text": "$(list-ordered) Logs",
        "tooltip": "View container logs",
        "command": {
          "type": "shell",
          "command": "docker",
          "args": ["logs", "-f", "${input:containerName}"]
        },
        "enabled": true,
        "alignment": "left",
        "priority": 300,
        "execution": {
          "foreground": true,
          "showProgress": false,
          "timeout": 0
        }
      },
      {
        "id": "docker-compose-up",
        "text": "$(play-circle) Compose Up",
        "tooltip": "Start services with docker-compose",
        "command": {
          "type": "shell",
          "command": "docker-compose",
          "args": ["up", "-d"]
        },
        "enabled": true,
        "alignment": "right",
        "priority": 100,
        "execution": {
          "foreground": false,
          "showProgress": true,
          "timeout": 300000
        },
        "visibility": {
          "conditions": [
            {
              "type": "fileExists",
              "path": "docker-compose.yml"
            }
          ]
        }
      },
      {
        "id": "docker-clean",
        "text": "$(trash) Clean",
        "tooltip": "Clean up Docker resources",
        "command": {
          "type": "shell",
          "command": "docker",
          "args": ["system", "prune", "-f"]
        },
        "enabled": true,
        "alignment": "right",
        "priority": 200,
        "execution": {
          "foreground": false,
          "showProgress": true,
          "timeout": 120000
        }
      }
    ]
  }
}
```

---

## Multi-Service Applications

Complex applications with multiple services and environments.

```json
{
  "statusbarQuickActions": {
    "buttons": [
      {
        "id": "service-api",
        "text": "API $(play)",
        "tooltip": "Start API service",
        "command": {
          "type": "shell",
          "command": "npm",
          "args": ["run", "dev:api"]
        },
        "enabled": true,
        "alignment": "left",
        "priority": 100,
        "execution": {
          "foreground": true,
          "showProgress": true,
          "timeout": 0
        },
        "visibility": {
          "conditions": [
            {
              "type": "workspaceFolder",
              "folders": ["api", "backend", "server"]
            }
          ]
        }
      },
      {
        "id": "service-frontend",
        "text": "Web $(play)",
        "tooltip": "Start frontend service",
        "command": {
          "type": "shell",
          "command": "npm",
          "args": ["run", "dev:frontend"]
        },
        "enabled": true,
        "alignment": "left",
        "priority": 200,
        "execution": {
          "foreground": true,
          "showProgress": true,
          "timeout": 0
        },
        "visibility": {
          "conditions": [
            {
              "type": "workspaceFolder",
              "folders": ["frontend", "web", "client"]
            }
          ]
        }
      },
      {
        "id": "env-dev",
        "text": "Dev",
        "tooltip": "Switch to development environment",
        "command": {
          "type": "shell",
          "command": "export",
          "args": [
            "NODE_ENV=development",
            "&&",
            "echo",
            "Development environment set"
          ]
        },
        "enabled": true,
        "alignment": "right",
        "priority": 100,
        "execution": {
          "foreground": true,
          "showProgress": true,
          "timeout": 10000
        }
      },
      {
        "id": "env-prod",
        "text": "Prod",
        "tooltip": "Switch to production environment",
        "command": {
          "type": "shell",
          "command": "export",
          "args": [
            "NODE_ENV=production",
            "&&",
            "echo",
            "Production environment set"
          ]
        },
        "enabled": true,
        "alignment": "right",
        "priority": 200,
        "execution": {
          "foreground": true,
          "showProgress": true,
          "timeout": 10000
        }
      },
      {
        "id": "services-all",
        "text": "All $(rocket)",
        "tooltip": "Start all services",
        "command": {
          "type": "shell",
          "command": "concurrently",
          "args": [
            "\"npm run dev:api\"",
            "\"npm run dev:frontend\"",
            "\"npm run dev:worker\""
          ]
        },
        "enabled": true,
        "alignment": "left",
        "priority": 50,
        "execution": {
          "foreground": true,
          "showProgress": true,
          "timeout": 0
        }
      }
    ]
  }
}
```

---

## Advanced Use Cases

### Conditional Visibility with Git Status

```json
{
  "statusbarQuickActions": {
    "buttons": [
      {
        "id": "deploy-production",
        "text": "$(rocket) Deploy",
        "tooltip": "Deploy to production",
        "command": {
          "type": "shell",
          "command": "npm",
          "args": ["run", "deploy:prod"]
        },
        "enabled": true,
        "alignment": "right",
        "priority": 100,
        "execution": {
          "foreground": false,
          "showProgress": true,
          "timeout": 300000
        },
        "visibility": {
          "conditions": [
            {
              "type": "gitStatus",
              "status": "clean"
            },
            {
              "type": "fileType",
              "patterns": ["package.json"]
            },
            {
              "type": "workspaceFolder",
              "folders": ["main", "master"],
              "invert": true
            }
          ]
        }
      }
    ]
  }
}
```

### Custom Environment Variables

```json
{
  "statusbarQuickActions": {
    "buttons": [
      {
        "id": "custom-env-run",
        "text": "$(symbol-property) Run",
        "tooltip": "Run with custom environment",
        "command": {
          "type": "shell",
          "command": "node",
          "args": ["app.js"]
        },
        "enabled": true,
        "alignment": "left",
        "priority": 100,
        "execution": {
          "foreground": true,
          "showProgress": true,
          "timeout": 60000
        },
        "workingDirectory": "${workspaceFolder}",
        "environment": {
          "NODE_ENV": "development",
          "API_URL": "http://localhost:3000",
          "DEBUG": "app:*"
        }
      }
    ]
  }
}
```

### VSCode Command Integration

```json
{
  "statusbarQuickActions": {
    "buttons": [
      {
        "id": "format-document",
        "text": "$(symbol-number) Format",
        "tooltip": "Format current document",
        "command": {
          "type": "vscode",
          "command": "editor.action.formatDocument"
        },
        "enabled": true,
        "alignment": "right",
        "priority": 100,
        "execution": {
          "foreground": true,
          "showProgress": true,
          "timeout": 30000
        }
      },
      {
        "id": "toggle-terminal",
        "text": "$(terminal) Toggle",
        "tooltip": "Toggle integrated terminal",
        "command": {
          "type": "vscode",
          "command": "workbench.action.terminal.toggleTerminal"
        },
        "enabled": true,
        "alignment": "right",
        "priority": 200,
        "execution": {
          "foreground": true,
          "showProgress": false
        }
      }
    ]
  }
}
```

---

## Tips and Best Practices

### 1. Button Priority

- **Left side (low priority numbers)**: 100-500
- **Right side (high priority numbers)**: 100-500
- Higher numbers appear further from the edge

### 2. Execution Settings

- **Foreground**: User sees command output in terminal
- **Background**: Command runs silently, shows progress only
- **Timeout**: Set to 0 for unlimited (long-running commands)

### 3. Visibility Conditions

- Use multiple conditions for complex logic
- Combine with `invert: true` for exclusion patterns
- File type patterns support wildcards (_.js, _.test.\*)

### 4. Icon Animations

- `spin`: Spinning animation for loading states
- `pulse`: Pulsing animation for notifications
- Use `null` for no animation

### 5. Environment Variables

- Define project-specific environment variables
- Use VS Code variables like `${workspaceFolder}`, `${fileBasename}`
- Combine shell commands with environment setup

### 6. Package Manager Auto-Detection

- Set command type to "detect" for automatic package manager detection
- Extension will choose between npm, yarn, pnpm, or bun based on lock files

---

## Troubleshooting

### Common Issues

1. **Button not showing**: Check visibility conditions and file associations
2. **Command not found**: Verify package manager installation and PATH
3. **Permission errors**: Check file permissions and working directory
4. **Timeout errors**: Increase timeout value for slow commands

### Debug Mode

Enable debug mode in settings:

```json
{
  "statusbarQuickActions": {
    "settings": {
      "debug": true
    }
  }
}
```

This will show detailed error messages and command execution logs in the output panel.

---

_Last updated: December 2024_
_Extension version: 1.0.0_
