# Keyboard Shortcuts Reference

Complete reference for **StatusBar Quick Actions** keyboard shortcuts and navigation techniques for maximum productivity.

## ⌨️ Default Keyboard Shortcuts

### Extension Commands

| Command          | Windows/Linux                                              | macOS                                                     | Description                         |
| ---------------- | ---------------------------------------------------------- | --------------------------------------------------------- | ----------------------------------- |
| Navigate Buttons | `Ctrl+Shift+B`                                             | `Cmd+Shift+B`                                             | Navigate through status bar buttons |
| Edit Button      | `Ctrl+Shift+P` → "StatusBar Quick Actions: Edit Button"    | `Cmd+Shift+P` → "StatusBar Quick Actions: Edit Button"    | Open button configuration menu      |
| View History     | `Ctrl+Shift+P` → "StatusBar Quick Actions: View History"   | `Cmd+Shift+P` → "StatusBar Quick Actions: View History"   | View command execution history      |
| Clear History    | `Ctrl+Shift+P` → "StatusBar Quick Actions: Clear History"  | `Cmd+Shift+P` → "StatusBar Quick Actions: Clear History"  | Clear command history               |
| Manage Presets   | `Ctrl+Shift+P` → "StatusBar Quick Actions: Manage Presets" | `Cmd+Shift+P` → "StatusBar Quick Actions: Manage Presets" | Open preset management              |

### Status Bar Navigation

| Action           | Key Combination    | Description                            |
| ---------------- | ------------------ | -------------------------------------- |
| Focus Status Bar | `Ctrl+Shift+B`     | Focus status bar for button navigation |
| Next Button      | `Tab` or `→`       | Move to next button                    |
| Previous Button  | `Shift+Tab` or `←` | Move to previous button                |
| Activate Button  | `Enter` or `Space` | Execute focused button                 |
| Escape Menu      | `Esc`              | Close any open menu                    |

## 🎯 Navigation Workflows

### Quick Button Execution

#### Method 1: Direct Shortcut

1. **Press**: `Ctrl+Shift+B` (Windows/Linux) or `Cmd+Shift+B` (macOS)
2. **Navigate**: Use `Tab` and `Shift+Tab` to find your button
3. **Execute**: Press `Enter` to activate

#### Method 2: Command Palette

1. **Press**: `Ctrl+Shift+P` (Windows/Linux) or `Cmd+Shift+P` (macOS)
2. **Type**: `StatusBar Quick Actions`
3. **Select**: Command from dropdown
4. **Execute**: Follow on-screen prompts

### Button Management

#### Edit Configuration

1. **Press**: `Ctrl+Shift+P`
2. **Type**: `StatusBar Quick Actions: Edit Button`
3. **Select**: Action from menu:
   - `Add New Button`
   - `Edit Existing Button`
   - `Delete Button`
   - `Duplicate Button`
   - `Toggle Button`

#### Preset Management

1. **Press**: `Ctrl+Shift+P`
2. **Type**: `StatusBar Quick Actions: Manage Presets`
3. **Select**: Action:
   - `Create New Preset`
   - `Apply Preset`
   - `View All Presets`
   - `Export Preset`
   - `Import Preset`

## ♿ Accessibility Features

### Screen Reader Support

#### ARIA Labels

- All buttons have descriptive `aria-label` attributes
- Tooltip text is announced on focus
- Button states (enabled/disabled/executing) are announced

#### Keyboard Navigation

- Full keyboard accessibility
- Proper focus order
- No mouse required for any operation

#### High Contrast Support

- Automatic high contrast detection
- Enhanced visual indicators
- Clear focus indicators

### Keyboard Navigation Patterns

#### Standard Navigation

```
Ctrl+Shift+B → Tab/Shift+Tab → Enter → Esc
     ↓              ↓           ↓        ↓
Focus SB    Navigate    Execute   Close
StatusBar            Buttons   Command  Menu
```

#### Command Palette Flow

```
Ctrl+Shift+P → Type Command → Enter → Follow Prompts
     ↓              ↓           ↓          ↓
  Open CP     Find Command  Select   Configure
```

## 🔧 Custom Keyboard Shortcuts

### Creating Custom Shortcuts

You can create custom keyboard shortcuts in VS Code settings:

```json
{
  "keybindings": [
    {
      "key": "alt+1",
      "command": "statusbarQuickActions.execute_npm-dev",
      "when": "editorTextFocus"
    },
    {
      "key": "alt+2",
      "command": "statusbarQuickActions.execute_npm-build",
      "when": "editorTextFocus"
    },
    {
      "key": "alt+3",
      "command": "statusbarQuickActions.execute_npm-test",
      "when": "editorTextFocus"
    }
  ]
}
```

### Shortcut Patterns

#### Number Shortcuts (1-9)

```json
{
  "key": "alt+1",
  "command": "statusbarQuickActions.execute_button-id-1"
}
```

#### Letter Shortcuts

```json
{
  "key": "ctrl+alt+d",
  "command": "statusbarQuickActions.execute_dev-server"
}
```

#### Function Keys

```json
{
  "key": "f5",
  "command": "statusbarQuickActions.execute_npm-dev"
}
```

### Conditional Shortcuts

#### Context-Specific Shortcuts

```json
{
  "key": "ctrl+alt+b",
  "command": "statusbarQuickActions.execute_build",
  "when": "editorTextFocus && resourceExtname == .js"
}
```

#### Workspace-Specific Shortcuts

```json
{
  "key": "ctrl+alt+t",
  "command": "statusbarQuickActions.execute_test",
  "when": "workspaceFolder.name =~ /frontend/"
}
```

## 🎛️ Advanced Navigation

### Multi-Button Selection

#### Sequential Execution

1. **Navigate**: Use `Tab` to move through buttons
2. **Select**: Hold `Ctrl` and press `Enter` on multiple buttons
3. **Execute**: Release `Ctrl` to execute selected buttons

#### Batch Operations

```json
{
  "command": {
    "type": "shell",
    "command": "npm",
    "args": ["run", "build", "&&", "npm", "run", "test"]
  }
}
```

### Menu Navigation

#### Quick Pick Menus

- **Navigate**: Arrow keys (`↑` `↓`)
- **Select**: `Enter`
- **Multi-select**: `Ctrl+Enter`
- **Search**: Type to filter items
- **Cancel**: `Esc`

#### Input Boxes

- **Navigate**: `Tab` (between fields)
- **Complete**: `Enter`
- **Cancel**: `Esc`
- **History**: `↑` `↓` (previous inputs)

## 📱 Mobile and Touch

### Touch Navigation

- **Tap**: Execute button
- **Long Press**: Show context menu
- **Swipe**: Navigate between buttons (if supported)

### Responsive Design

- Buttons automatically resize for small screens
- Touch-friendly button sizes
- Simplified menus on mobile

## 🔍 Finding Shortcuts

### Command Palette Search

1. **Press**: `Ctrl+Shift+P`
2. **Type**: `StatusBar Quick Actions`
3. **View**: All available commands with their shortcuts

### Keyboard Shortcuts Editor

1. **Open**: `File` → `Preferences` → `Keyboard Shortcuts`
2. **Search**: `statusbarQuickActions`
3. **View**: Current shortcuts
4. **Edit**: Double-click to modify

### Quick Help

1. **Focus**: Status bar (`Ctrl+Shift+B`)
2. **Press**: `F1` for help
3. **View**: Available actions

## 🚀 Productivity Tips

### 1. Create Number Shortcuts

```json
{
  "keybindings": [
    { "key": "alt+1", "command": "statusbarQuickActions.execute_npm-dev" },
    { "key": "alt+2", "command": "statusbarQuickActions.execute_npm-build" },
    { "key": "alt+3", "command": "statusbarQuickActions.execute_npm-test" }
  ]
}
```

### 2. Use Context Shortcuts

```json
{
  "keybindings": [
    {
      "key": "f5",
      "command": "statusbarQuickActions.execute_dev-server",
      "when": "resourceExtname == .js"
    }
  ]
}
```

### 3. Workspace-Specific Shortcuts

```json
{
  "keybindings": [
    {
      "key": "ctrl+alt+r",
      "command": "statusbarQuickActions.execute-react-dev",
      "when": "workspaceFolder.name =~ /react/"
    }
  ]
}
```

### 4. Quick Preset Switching

```json
{
  "keybindings": [
    { "key": "alt+q", "command": "statusbarQuickActions.applyPreset" },
    { "key": "alt+s", "command": "statusbarQuickActions.saveAsPreset" }
  ]
}
```

## 📋 Shortcut Cheat Sheet

### Essential Shortcuts

```
Ctrl+Shift+B     → Focus Status Bar
Ctrl+Shift+P     → Open Command Palette
Tab/Shift+Tab    → Navigate Buttons
Enter            → Execute Button
Esc              → Close Menu
```

### Extension Commands

```
StatusBar Quick Actions: Edit Button
StatusBar Quick Actions: View History
StatusBar Quick Actions: Clear History
StatusBar Quick Actions: Manage Presets
```

### Custom Shortcuts (Recommended)

```
Alt+1-9         → Execute buttons 1-9
Ctrl+Alt+B      → Build project
Ctrl+Alt+T      → Run tests
Ctrl+Alt+D      → Development server
F5              → Start development
```

## 🔧 Troubleshooting Shortcuts

### Shortcuts Not Working

#### Check Keyboard Layout

1. **Verify**: Keyboard layout is correct
2. **Test**: Shortcuts in different applications
3. **Reset**: Keyboard shortcuts in VS Code

#### Extension Not Active

1. **Check**: Extension is enabled
2. **Verify**: Extension is loaded
3. **Reload**: VS Code window

#### Conflicts with Other Extensions

1. **Check**: `File` → `Preferences` → `Keyboard Shortcuts`
2. **Search**: Conflicting shortcuts
3. **Resolve**: Remove or modify conflicts

### Creating Shortcuts

#### Step 1: Open Settings

```
File → Preferences → Keyboard Shortcuts
```

#### Step 2: Find Extension Commands

```
Search: "statusbarQuickActions"
```

#### Step 3: Add Custom Shortcut

```
Click "+" next to command
Enter key combination
Press Enter
```

#### Step 4: Test Shortcut

```
Use shortcut in editor
Verify it works as expected
```

## 🎯 Best Practices

### 1. Consistent Shortcut Patterns

- Use `Alt+` for custom shortcuts
- Use `Ctrl+Alt+` for less common actions
- Use function keys for primary actions

### 2. Context-Aware Shortcuts

- Different shortcuts for different file types
- Workspace-specific shortcuts
- Role-based shortcut sets

### 3. Memorable Shortcuts

- Use letter shortcuts (`Alt+D` for dev)
- Use number shortcuts (`Alt+1`, `Alt+2`)
- Use function keys for main actions

### 4. Documentation

- Document your custom shortcuts
- Share shortcuts with team
- Create shortcut reference sheets

## 🎉 Summary

You now know:

- ✅ Default keyboard shortcuts
- ✅ Navigation workflows
- ✅ Accessibility features
- ✅ How to create custom shortcuts
- ✅ Troubleshooting techniques

**Next Steps**: Learn about [Configuration Reference](CONFIGURATION_REFERENCE.md) for advanced setup options.

---

_Master the keyboard and boost your productivity with StatusBar Quick Actions!_

_Last updated: December 2024_
