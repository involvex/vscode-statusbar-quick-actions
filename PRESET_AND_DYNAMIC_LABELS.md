# Preset System and Dynamic Labels

This document describes the new preset system and dynamic label features added to the StatusBar Quick Actions extension.

## Overview

The extension has been enhanced with two major features:

1. **Preset System**: Save and load predefined button configurations
2. **Dynamic Labels**: Display live information in button labels (time, git status, URLs, etc.)

---

## Preset System

### What are Presets?

Presets allow you to save your current button configuration and quickly apply it later. This is useful for:

- Switching between different development contexts (frontend, backend, testing, etc.)
- Sharing configurations with team members
- Maintaining different setups for different projects
- Quick recovery if configuration gets corrupted

### Preset Features

#### 1. Save Current Configuration as Preset

Save your current button setup with a name and description:

```typescript
// Via Command Palette
"StatusBar Quick Actions: Manage Presets" → "Create New Preset"
```

Each preset stores:

- All button configurations
- Theme settings (if customized)
- Metadata (creation date, modification date, tags)

#### 2. Apply Presets

Load a saved preset with three application modes:

- **Replace**: Remove all current buttons and replace with preset buttons
- **Merge**: Merge preset buttons with current buttons (overwrites buttons with same ID)
- **Append**: Add preset buttons to current buttons (generates new IDs for conflicts)

When applying a preset, you'll see an impact preview showing:

- Number of buttons to be added
- Number of buttons to be modified
- Number of buttons to be removed

#### 3. Preset Management

Access via `StatusBar Quick Actions: Edit Button` → `Manage Presets`:

- **Create New Preset**: Save current configuration
- **Apply Preset**: Load a saved preset
- **View All Presets**: Browse and manage all saved presets
- **Export Preset**: Export a preset to a JSON file
- **Import Preset**: Import a preset from a JSON file

### Preset Storage

Presets are stored in VSCode's global state and persist across:

- VSCode restarts
- Workspace changes
- Extension updates

### Preset File Format

Exported presets use the following JSON structure:

```json
{
  "id": "preset_1234567890",
  "name": "My Development Setup",
  "description": "Standard buttons for Node.js development",
  "buttons": [
    {
      "id": "build",
      "text": "Build",
      "command": {
        "type": "npm",
        "script": "build"
      }
      // ... other button properties
    }
  ],
  "theme": {
    // optional theme configuration
  },
  "metadata": {
    "created": "2025-01-01T00:00:00.000Z",
    "modified": "2025-01-01T00:00:00.000Z",
    "author": "optional",
    "tags": ["development", "nodejs"]
  }
}
```

---

## Dynamic Labels

### What are Dynamic Labels?

Dynamic labels allow buttons to display live, automatically updating information instead of static text. This enables buttons to show:

- Current time/date
- Git branch name or status
- Content fetched from URLs
- Environment variables
- Custom computed values

### Dynamic Label Types

#### 1. Time-based Labels

Display current time or date with custom formatting:

```json
{
  "id": "clock",
  "text": "Time",
  "dynamicLabel": {
    "type": "time",
    "format": "HH:mm:ss",
    "refreshInterval": 1000,
    "template": "🕐 ${value}"
  },
  "command": {
    "type": "vscode",
    "command": "workbench.action.showCommands"
  }
}
```

**Format Tokens:**

- `YYYY` - Full year (2025)
- `YY` - Short year (25)
- `MM` - Month (01-12)
- `DD` - Day (01-31)
- `HH` - Hours 24-hour (00-23)
- `hh` - Hours 12-hour (01-12)
- `mm` - Minutes (00-59)
- `ss` - Seconds (00-59)
- `A` - AM/PM uppercase
- `a` - am/pm lowercase

#### 2. URL-based Labels

Fetch and display content from URLs:

```json
{
  "id": "api-status",
  "text": "API Status",
  "dynamicLabel": {
    "type": "url",
    "url": "https://api.example.com/status",
    "refreshInterval": 30000,
    "fallback": "Unknown",
    "template": "API: ${value}"
  },
  "command": {
    "type": "shell",
    "command": "curl https://api.example.com/status"
  }
}
```

**Features:**

- Automatically parses JSON responses
- Truncates long text responses (max 100 chars)
- 5-second timeout for requests
- Supports both HTTP and HTTPS

#### 3. Environment Variable Labels

Display environment variable values:

```json
{
  "id": "node-env",
  "text": "Environment",
  "dynamicLabel": {
    "type": "env",
    "envVar": "NODE_ENV",
    "fallback": "development",
    "template": "ENV: ${value}"
  },
  "command": {
    "type": "shell",
    "command": "echo $NODE_ENV"
  }
}
```

#### 4. Git Information Labels

Display git repository information:

```json
{
  "id": "git-branch",
  "text": "Branch",
  "dynamicLabel": {
    "type": "git",
    "gitInfo": "branch",
    "refreshInterval": 5000,
    "template": "⎇ ${value}"
  },
  "command": {
    "type": "shell",
    "command": "git status"
  }
}
```

**Git Info Types:**

- `branch` - Current branch name
- `status` - Working tree status (number of changes or "Clean")
- `remote` - Remote repository name

#### 5. Custom Labels (Reserved for Future)

Placeholder for user-defined custom functions:

```json
{
  "id": "custom",
  "text": "Custom",
  "dynamicLabel": {
    "type": "custom",
    "customFunction": "myCustomFunction",
    "fallback": "N/A"
  }
}
```

_Note: Custom functions are not yet implemented but are reserved for future extension._

### Dynamic Label Properties

All dynamic label configurations support these properties:

| Property          | Type   | Required | Description                                                  |
| ----------------- | ------ | -------- | ------------------------------------------------------------ |
| `type`            | string | Yes      | Label type: "time", "url", "env", "git", "custom"            |
| `format`          | string | No       | Format string (for "time" type)                              |
| `url`             | string | No       | URL to fetch from (for "url" type)                           |
| `envVar`          | string | No       | Environment variable name (for "env" type)                   |
| `gitInfo`         | string | No       | Git info type (for "git" type): "branch", "status", "remote" |
| `customFunction`  | string | No       | Function name (for "custom" type)                            |
| `refreshInterval` | number | No       | Auto-refresh interval in milliseconds (0 = no auto-refresh)  |
| `fallback`        | string | No       | Fallback value if evaluation fails                           |
| `template`        | string | No       | Template string with `${value}` placeholder                  |

### Refresh Behavior

Dynamic labels can be configured to refresh automatically:

- **Manual refresh**: Set `refreshInterval` to `0` or omit it
- **Auto-refresh**: Set `refreshInterval` to milliseconds (e.g., `1000` for every second)
- **On-demand refresh**: Labels refresh when button configuration changes

### Error Handling

If a dynamic label fails to evaluate:

1. The fallback value is used (if provided)
2. Error is logged to console
3. Button remains functional with fallback text
4. Refresh continues attempting if interval is set

---

## API Reference

### ConfigManager Methods

```typescript
// Apply a preset to current configuration
async applyPreset(preset: PresetConfig, mode: PresetApplicationMode): Promise<void>

// Get impact preview of applying a preset
getPresetImpact(preset: PresetConfig, mode: PresetApplicationMode): {
  added: number;
  modified: number;
  removed: number;
  total: number;
}

// Validate preset before application
validatePresetApplication(preset: PresetConfig): {
  isValid: boolean;
  errors: string[];
}
```

### PresetManager Methods

```typescript
// Get all presets
getAllPresets(): PresetConfig[]

// Get a preset by ID
getPreset(presetId: string): PresetConfig | null

// Save a preset
async savePreset(preset: PresetConfig): Promise<void>

// Delete a preset
async deletePreset(presetId: string): Promise<void>

// Create preset from current config
async createPresetFromConfig(
  name: string,
  description: string,
  currentConfig: ExtensionConfig,
  tags?: string[]
): Promise<PresetConfig>

// Apply preset to config
applyPreset(
  preset: PresetConfig,
  currentConfig: ExtensionConfig,
  mode: PresetApplicationMode
): ExtensionConfig

// Export/Import presets
async exportPreset(preset: PresetConfig): Promise<void>
async importPreset(): Promise<PresetConfig | null>

// Duplicate preset
async duplicatePreset(presetId: string): Promise<PresetConfig | null>

// Search presets
searchPresets(query: string): PresetConfig[]
```

### DynamicLabelManager Methods

```typescript
// Evaluate a dynamic label
async evaluateLabel(buttonId: string, field: DynamicLabelField): Promise<string>

// Get label state
getLabelState(buttonId: string): DynamicLabelState | undefined

// Force refresh a label
async refreshLabel(buttonId: string): Promise<string | null>

// Stop refresh timer
stopRefreshTimer(buttonId: string): void

// Clear label state
clearLabelState(buttonId: string): void
```

---

## Commands

The following commands are available in the Command Palette:

- `StatusBar Quick Actions: Manage Presets` - Open preset management UI
- `StatusBar Quick Actions: Apply Preset` - Quick apply a preset
- `StatusBar Quick Actions: Save As Preset` - Save current config as preset
- `StatusBar Quick Actions: Edit Button` - Main settings menu (includes preset management)

---

## Examples

### Example 1: Development Environment Preset

```json
{
  "id": "preset_dev",
  "name": "Development Environment",
  "description": "Standard buttons for active development",
  "buttons": [
    {
      "id": "dev_server",
      "text": "Dev Server",
      "command": { "type": "npm", "script": "dev" },
      "icon": { "id": "server" }
    },
    {
      "id": "build",
      "text": "Build",
      "command": { "type": "npm", "script": "build" },
      "icon": { "id": "package" }
    },
    {
      "id": "test",
      "text": "Test",
      "command": { "type": "npm", "script": "test" },
      "icon": { "id": "beaker" }
    }
  ]
}
```

### Example 2: Time Display Button

```json
{
  "id": "clock",
  "text": "Loading...",
  "tooltip": "Current Time",
  "dynamicLabel": {
    "type": "time",
    "format": "HH:mm:ss",
    "refreshInterval": 1000,
    "template": "🕐 ${value}"
  },
  "command": {
    "type": "vscode",
    "command": "workbench.action.showCommands"
  },
  "alignment": "right",
  "priority": 1000
}
```

### Example 3: Git Branch Display

```json
{
  "id": "git_branch",
  "text": "Branch",
  "tooltip": "Current Git Branch",
  "dynamicLabel": {
    "type": "git",
    "gitInfo": "branch",
    "refreshInterval": 5000,
    "fallback": "No Git",
    "template": "⎇ ${value}"
  },
  "command": {
    "type": "shell",
    "command": "git status"
  },
  "alignment": "left",
  "priority": 500
}
```

---

## Best Practices

### Presets

1. **Naming**: Use descriptive names that indicate the purpose (e.g., "Frontend Development", "Testing Environment")
2. **Documentation**: Add detailed descriptions to help others understand the preset's purpose
3. **Tagging**: Use tags to organize presets by category or project
4. **Version Control**: Export important presets and commit them to version control
5. **Team Sharing**: Share preset files with team members for consistent setups

### Dynamic Labels

1. **Refresh Intervals**: Choose appropriate intervals to balance freshness with performance
   - Time: 1000ms (1 second) for clocks
   - Git: 5000ms (5 seconds) for branch info
   - URLs: 30000ms (30 seconds) or more for external APIs
2. **Fallbacks**: Always provide fallback values for graceful degradation
3. **Templates**: Use templates to add context (icons, prefixes) to values
4. **Error Handling**: Monitor console for errors if labels aren't updating
5. **Performance**: Limit the number of auto-refreshing labels to avoid performance impact

---

## Troubleshooting

### Presets Not Saving

- Check if you have write permissions
- Verify the preset name is unique
- Check console for error messages

### Dynamic Labels Not Updating

- Verify `refreshInterval` is set and greater than 0
- Check if the label type configuration is correct
- Look for errors in the console
- Ensure required dependencies are available (e.g., Git extension for git labels)

### URL Labels Timeout

- Check network connectivity
- Verify the URL is accessible
- Consider increasing the timeout (currently hardcoded to 5 seconds)
- Use a fallback value for offline scenarios

### Git Labels Not Working

- Ensure Git extension is installed and enabled
- Verify you're in a Git repository
- Check if the Git extension API is available

---

## Future Enhancements

Potential future improvements:

1. **Custom Functions**: Allow users to define custom JavaScript functions for labels
2. **Preset Categories**: Organize presets into categories
3. **Preset Sharing**: Built-in marketplace or sharing system
4. **More Label Types**: Weather, system metrics, API responses with JSONPath
5. **Conditional Labels**: Show different values based on conditions
6. **Label Animations**: Transition effects for changing values
7. **Preset Templates**: Pre-built presets for common scenarios

---

## Migration Guide

If you're upgrading from a version without these features:

1. **No Action Required**: Existing configurations continue to work unchanged
2. **Optional**: Create presets from your existing configurations for easier management
3. **Optional**: Add dynamic labels to existing buttons for live information

The new features are fully backward compatible and opt-in.
