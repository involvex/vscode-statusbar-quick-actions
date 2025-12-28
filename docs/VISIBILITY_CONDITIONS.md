# Visibility Conditions

Learn how to make **StatusBar Quick Actions** buttons appear contextually based on your current file, workspace, or project state. Smart visibility conditions help reduce clutter and show relevant buttons when you need them.

## 🎯 Overview

Visibility conditions allow buttons to:

- **Appear automatically** when relevant to your current context
- **Hide when not needed** to reduce visual clutter
- **Adapt to your workflow** based on file types and project state
- **Improve productivity** by showing contextually relevant actions

## 🔧 Condition Types

### 1. File Type Patterns

Show buttons based on the current file's extension or type.

#### Basic File Patterns

```json
{
  "visibility": {
    "conditions": [
      {
        "type": "fileType",
        "patterns": ["*.js", "*.ts", "*.jsx", "*.tsx"]
      }
    ]
  }
}
```

#### JavaScript/TypeScript Project

```json
{
  "id": "react-dev",
  "text": "$(triangle-right) Start",
  "command": { "type": "npm", "script": "dev" },
  "visibility": {
    "conditions": [
      {
        "type": "fileType",
        "patterns": ["*.js", "*.jsx", "*.ts", "*.tsx"]
      }
    ]
  }
}
```

#### Python-Specific Buttons

```json
{
  "id": "python-run",
  "text": "$(play) Run",
  "command": {
    "type": "shell",
    "command": "python",
    "args": ["${fileBasename}"]
  },
  "visibility": {
    "conditions": [
      {
        "type": "fileType",
        "patterns": ["*.py"]
      }
    ]
  }
}
```

#### Multiple File Types

```json
{
  "id": "docker-commands",
  "text": "$(docker) Docker",
  "command": { "type": "shell", "command": "docker" },
  "visibility": {
    "conditions": [
      {
        "type": "fileType",
        "patterns": ["*.py", "*.js", "*.ts", "Dockerfile", "docker-compose.yml"]
      }
    ]
  }
}
```

### 2. File Existence

Show buttons when specific files or directories exist in your workspace.

#### Dockerfile Detection

```json
{
  "id": "docker-build",
  "text": "$(package) Build",
  "command": {
    "type": "shell",
    "command": "docker",
    "args": ["build", "-t", "${input:imageName}", "."]
  },
  "visibility": {
    "conditions": [
      {
        "type": "fileExists",
        "path": "Dockerfile"
      }
    ]
  }
}
```

#### Package Manager Detection

```json
{
  "id": "npm-install",
  "text": "$(cloud-download) Install",
  "command": { "type": "npm", "script": "install" },
  "visibility": {
    "conditions": [
      {
        "type": "fileExists",
        "path": "package.json"
      }
    ]
  }
}
```

#### Virtual Environment Detection

```json
{
  "id": "python-venv",
  "text": "$(symbol-class) Venv",
  "command": {
    "type": "shell",
    "command": "source",
    "args": ["venv/bin/activate", "&&", "echo", "Venv activated"]
  },
  "visibility": {
    "conditions": [
      {
        "type": "fileExists",
        "path": "venv"
      },
      {
        "type": "fileExists",
        "path": "requirements.txt"
      }
    ]
  }
}
```

#### Storybook Detection

```json
{
  "id": "storybook-dev",
  "text": "$(book) Storybook",
  "command": { "type": "npm", "script": "storybook" },
  "visibility": {
    "conditions": [
      {
        "type": "fileExists",
        "path": ".storybook"
      }
    ]
  }
}
```

### 3. Git Repository Status

Show buttons based on the current Git repository state.

#### Repository Detection

```json
{
  "id": "git-init",
  "text": "$(git-branch) Init Git",
  "command": { "type": "shell", "command": "git", "args": ["init"] },
  "visibility": {
    "conditions": [
      {
        "type": "gitStatus",
        "status": "repository"
      }
    ]
  }
}
```

#### Dirty Repository (Changes Present)

```json
{
  "id": "git-commit",
  "text": "$(git-commit) Commit",
  "command": {
    "type": "shell",
    "command": "git",
    "args": ["commit", "-m", "${input:commitMessage}"]
  },
  "visibility": {
    "conditions": [
      {
        "type": "gitStatus",
        "status": "dirty"
      }
    ]
  }
}
```

#### Clean Repository (No Changes)

```json
{
  "id": "git-deploy",
  "text": "$(rocket) Deploy",
  "command": { "type": "shell", "command": "npm", "args": ["run", "deploy"] },
  "visibility": {
    "conditions": [
      {
        "type": "gitStatus",
        "status": "clean"
      }
    ]
  }
}
```

#### Ahead of Remote

```json
{
  "id": "git-push",
  "text": "$(cloud-upload) Push",
  "command": { "type": "shell", "command": "git", "args": ["push"] },
  "visibility": {
    "conditions": [
      {
        "type": "gitStatus",
        "status": "ahead"
      }
    ]
  }
}
```

#### Behind Remote

```json
{
  "id": "git-pull",
  "text": "$(cloud-download) Pull",
  "command": {
    "type": "shell",
    "command": "git",
    "args": ["pull", "--rebase"]
  },
  "visibility": {
    "conditions": [
      {
        "type": "gitStatus",
        "status": "behind"
      }
    ]
  }
}
```

### 4. Workspace Folder Detection

Show buttons based on the current workspace folder structure.

#### Multi-Root Workspace

```json
{
  "id": "api-dev",
  "text": "$(play) API",
  "command": { "type": "npm", "script": "dev" },
  "visibility": {
    "conditions": [
      {
        "type": "workspaceFolder",
        "folders": ["api", "backend", "server"]
      }
    ]
  }
}
```

#### Frontend-Specific

```json
{
  "id": "frontend-dev",
  "text": "$(globe) Frontend",
  "command": { "type": "npm", "script": "dev" },
  "visibility": {
    "conditions": [
      {
        "type": "workspaceFolder",
        "folders": ["frontend", "web", "client", "ui"]
      }
    ]
  }
}
```

#### Root Folder Detection

```json
{
  "id": "workspace-root",
  "text": "$(home) Root",
  "command": {
    "type": "shell",
    "command": "code",
    "args": ["${workspaceFolder}"]
  },
  "visibility": {
    "conditions": [
      {
        "type": "workspaceFolder",
        "folders": ["."]
      }
    ]
  }
}
```

## 🔄 Advanced Condition Logic

### Multiple Conditions (AND Logic)

All conditions must be met for the button to appear.

```json
{
  "id": "production-deploy",
  "text": "$(rocket) Deploy Prod",
  "command": {
    "type": "shell",
    "command": "npm",
    "args": ["run", "deploy:prod"]
  },
  "visibility": {
    "conditions": [
      {
        "type": "fileType",
        "patterns": ["*.js", "*.ts"]
      },
      {
        "type": "gitStatus",
        "status": "clean"
      },
      {
        "type": "fileExists",
        "path": "Dockerfile"
      }
    ]
  }
}
```

### Inverted Conditions (NOT Logic)

Use `invert: true` to show buttons when conditions are NOT met.

#### Hide on Master Branch

```json
{
  "id": "feature-deploy",
  "text": "$(rocket) Deploy Feature",
  "command": {
    "type": "shell",
    "command": "npm",
    "args": ["run", "deploy:feature"]
  },
  "visibility": {
    "conditions": [
      {
        "type": "gitStatus",
        "status": "ahead",
        "invert": false
      },
      {
        "type": "workspaceFolder",
        "folders": ["main", "master"],
        "invert": true
      }
    ]
  }
}
```

#### Only in Development

```json
{
  "id": "debug-mode",
  "text": "$(bug) Debug",
  "command": {
    "type": "shell",
    "command": "node",
    "args": ["--inspect", "app.js"]
  },
  "visibility": {
    "conditions": [
      {
        "type": "fileExists",
        "path": ".env.development",
        "invert": false
      },
      {
        "type": "fileExists",
        "path": ".env.production",
        "invert": true
      }
    ]
  }
}
```

### Complex Condition Examples

#### React Development Environment

```json
{
  "id": "react-workflow",
  "text": "$(triangle-right) React Dev",
  "command": { "type": "npm", "script": "dev" },
  "visibility": {
    "conditions": [
      {
        "type": "fileType",
        "patterns": ["*.jsx", "*.tsx", "*.js", "*.ts"]
      },
      {
        "type": "fileExists",
        "path": "package.json"
      }
    ],
    "debounceMs": 500
  }
}
```

#### Production Deployment Only

```json
{
  "id": "prod-deploy",
  "text": "$(rocket) Prod Deploy",
  "command": {
    "type": "shell",
    "command": "npm",
    "args": ["run", "deploy:production"]
  },
  "visibility": {
    "conditions": [
      {
        "type": "gitStatus",
        "status": "clean"
      },
      {
        "type": "workspaceFolder",
        "folders": ["main", "master"]
      },
      {
        "type": "fileExists",
        "path": ".env.production"
      }
    ]
  }
}
```

## ⚡ Performance Optimization

### Debouncing Visibility Checks

Reduce CPU usage by debouncing visibility checks:

```json
{
  "visibility": {
    "conditions": [...],
    "debounceMs": 300  // Wait 300ms before checking
  }
}
```

### Recommended Debounce Values

| Use Case          | Debounce | Description                     |
| ----------------- | -------- | ------------------------------- |
| File Type         | 100ms    | Quick response for file changes |
| File Existence    | 1000ms   | Less frequent checks            |
| Git Status        | 500ms    | Moderate response time          |
| Workspace Folders | 300ms    | Balanced performance            |

### Caching Strategy

Enable result caching for better performance:

```json
{
  "statusbarQuickActions": {
    "settings": {
      "performance": {
        "cacheResults": true,
        "visibilityDebounceMs": 300
      }
    }
  }
}
```

## 📊 Condition Evaluation

### Evaluation Order

1. **File Type** → Current file extension check
2. **File Existence** → Workspace file/directory scan
3. **Git Status** → Repository state check
4. **Workspace Folders** → Current folder detection

### Performance Impact

| Condition Type    | CPU Impact | Frequency           |
| ----------------- | ---------- | ------------------- |
| File Type         | Low        | Every file change   |
| File Existence    | Medium     | File/folder changes |
| Git Status        | High       | Status changes      |
| Workspace Folders | Low        | Folder changes      |

## 🎯 Real-World Examples

### Full-Stack JavaScript Project

```json
{
  "statusbarQuickActions": {
    "buttons": [
      {
        "id": "npm-dev",
        "text": "$(triangle-right) Dev",
        "command": { "type": "npm", "script": "dev" },
        "visibility": {
          "conditions": [
            {
              "type": "fileType",
              "patterns": ["*.js", "*.jsx", "*.ts", "*.tsx"]
            },
            { "type": "fileExists", "path": "package.json" }
          ]
        }
      },
      {
        "id": "python-run",
        "text": "$(play) Run",
        "command": {
          "type": "shell",
          "command": "python",
          "args": ["${fileBasename}"]
        },
        "visibility": {
          "conditions": [{ "type": "fileType", "patterns": ["*.py"] }]
        }
      },
      {
        "id": "docker-build",
        "text": "$(package) Docker",
        "command": {
          "type": "shell",
          "command": "docker-compose",
          "args": ["up", "--build"]
        },
        "visibility": {
          "conditions": [{ "type": "fileExists", "path": "docker-compose.yml" }]
        }
      },
      {
        "id": "git-workflow",
        "text": "$(git-branch) Git",
        "command": { "type": "shell", "command": "git", "args": ["status"] },
        "visibility": {
          "conditions": [{ "type": "gitStatus", "status": "repository" }]
        }
      }
    ]
  }
}
```

### Team Development Workflow

```json
{
  "id": "team-deploy",
  "text": "$(people) Team Deploy",
  "command": {
    "type": "shell",
    "command": "npm",
    "args": ["run", "deploy:team"]
  },
  "visibility": {
    "conditions": [
      {
        "type": "gitStatus",
        "status": "ahead"
      },
      {
        "type": "workspaceFolder",
        "folders": ["frontend", "backend"],
        "invert": true
      },
      {
        "type": "fileExists",
        "path": ".github/workflows"
      }
    ]
  }
}
```

## 🔍 Debugging Visibility

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

1. **View** → **Output**
2. **Select**: "StatusBar Quick Actions"
3. **Look for**: Visibility check logs

### Manual Testing

1. **Open File** in each type you want to test
2. **Switch Branches** to test Git conditions
3. **Create/Delete Files** to test existence conditions
4. **Check Button Appearance** matches expectations

## 🛠️ Troubleshooting

### Buttons Not Appearing

#### Check Condition Configuration

```json
{
  "visibility": {
    "conditions": [
      {
        "type": "fileType",
        "patterns": ["*.js"]  // ✅ Correct
        "pattern": "*.js"     // ❌ Wrong property
      }
    ]
  }
}
```

#### Verify File Associations

- Check if file extensions are registered
- Test with known file types
- Verify workspace configuration

#### Enable Debug Logging

- Turn on debug mode
- Check output panel for errors
- Verify condition evaluation logs

### Performance Issues

#### Reduce Debounce

```json
{
  "visibility": {
    "debounceMs": 100 // Reduce from default 300ms
  }
}
```

#### Disable Unused Conditions

```json
{
  "visibility": {
    "conditions": [
      // Only necessary conditions
    ]
  }
}
```

#### Use Background Execution

```json
{
  "execution": {
    "foreground": false // Non-blocking checks
  }
}
```

## 🎉 Best Practices

### 1. Use Appropriate Debounce

- **File Type**: 100-200ms
- **Git Status**: 500-1000ms
- **File Existence**: 300-500ms

### 2. Minimize Conditions

- Use only necessary conditions
- Combine related checks
- Avoid redundant patterns

### 3. Test Thoroughly

- Test each condition type
- Verify inverted logic
- Check performance impact

### 4. Document Complex Logic

```json
{
  "id": "complex-condition",
  "text": "Special Button",
  "visibility": {
    "description": "Shows only in development with TypeScript files",
    "conditions": [
      // ... conditions
    ]
  }
}
```

## 🚀 Next Steps

Now that you understand visibility conditions:

1. **Learn Advanced Features**: [Dynamic Labels](PRESET_AND_DYNAMIC_LABELS.md)
2. **Explore Performance**: [Performance Optimizations](PERFORMANCE_OPTIMIZATIONS.md)
3. **Check Examples**: [Sample Configurations](SAMPLE-CONFIGURATIONS.md)
4. **Master Configuration**: [Configuration Reference](CONFIGURATION_REFERENCE.md)

---

_Smart visibility conditions help declutter your workspace while keeping relevant actions at your fingertips!_

_Last updated: December 2024_
