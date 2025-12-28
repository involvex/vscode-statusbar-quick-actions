# CLI Tool Guide

Learn how to use the **StatusBar Quick Actions** Command-Line Interface (CLI) tool for managing configurations without opening VS Code settings.

## 🎯 Overview

The CLI tool provides a powerful command-line interface for:

- **Managing configurations** without VS Code UI
- **Applying presets** quickly
- **Importing/exporting** configurations
- **Debugging** and troubleshooting
- **Bulk operations** on button configurations

## 🚀 Getting Started

### Running the CLI

#### Using bun (Recommended)

```bash
bun run dev:cli
```

#### Using npm

```bash
npm run dev:cli
```

#### Using Node.js directly

```bash
node out/config-cli.js
```

### CLI Modes

The CLI provides an interactive menu-driven interface:

```
┌─────────────────────────────────────────┐
│  StatusBar Quick Actions CLI Tool      │
├─────────────────────────────────────────┤
│  1. View Current Configuration          │
│  2. Apply Preset                        │
│  3. Add Button                          │
│  4. Remove Button                       │
│  5. Toggle Debug Mode                   │
│  6. Export Configuration                │
│  7. Import Configuration                │
│  8. Apply Label Preset                  │
│  9. Configure Performance               │
│  10. Reset to Defaults                  │
│  11. Help                               │
│  0. Exit                                │
└─────────────────────────────────────────┘
Select an option:
```

## 📋 CLI Commands

### 1. View Current Configuration

Displays all configured buttons with their properties:

```
Current Configuration:
┌─────────────────────────────────────────────────────────────────┐
│ ID: npm-dev                    Type: npm                       │
│ Text: $(play) Dev                                                    │
│ Script: dev                                                        │
│ Status: Enabled                    Priority: 100                │
├─────────────────────────────────────────────────────────────────┤
│ ID: git-status                  Type: shell                    │
│ Text: $(git-branch) Status                                            │
│ Command: git status --porcelain                                    │
│ Status: Enabled                    Priority: 200                │
└─────────────────────────────────────────────────────────────────┘

Debug Mode: Disabled
Total Buttons: 2
```

### 2. Apply Preset

Apply pre-built button configurations:

```
┌─────────────────────────────────────────┐
│  Apply Preset                          │
├─────────────────────────────────────────┤
│  1. Node.js Development                │
│  2. React Development                  │
│  3. Python Development                 │
│  4. Git Workflow                       │
│  5. Docker Workflow                    │
│  6. Custom Preset                      │
└─────────────────────────────────────────┘

Select preset to apply:
```

#### Preset Application Modes

- **Replace All**: Removes all existing buttons
- **Append**: Adds to existing buttons
- **Merge**: Replaces buttons with same ID

```
Impact Preview:
• 3 buttons will be added
• 1 button will be modified
• 0 buttons will be removed

Apply preset "Node.js Development"? (y/N):
```

### 3. Add Button

Interactive wizard to create new buttons:

```
┌─────────────────────────────────────────┐
│  Add New Button                        │
├─────────────────────────────────────────┤
│  Step 1: Button Properties             │
└─────────────────────────────────────────┘

Enter button text (supports emojis): $(play) Dev Server
Enter tooltip (optional): Start development server
```

#### Command Type Selection

```
┌─────────────────────────────────────────┐
│  Select Command Type                   │
├─────────────────────────────────────────┤
│  1. npm script                         │
│  2. yarn script                        │
│  3. pnpm script                        │
│  4. bun script                         │
│  5. npx command                        │
│  6. pnpx command                       │
│  7. bunx command                       │
│  8. shell command                      │
│  9. github cli                         │
│  10. vscode command                    │
│  11. auto-detect                       │
└─────────────────────────────────────────┘
```

#### Command Configuration

For npm/yarn/pnpm/bun scripts:

```
Enter script name: dev
```

For shell commands:

```
Enter command: npm
Enter arguments (space-separated): run build
```

#### Advanced Options

```
┌─────────────────────────────────────────┐
│  Advanced Options (Optional)           │
├─────────────────────────────────────────┤
│  1. Set alignment (left/right)         │
│  2. Set priority (0-1000)              │
│  3. Configure visibility conditions    │
│  4. Set custom colors                  │
│  5. Configure execution options        │
│  6. Skip advanced options              │
└─────────────────────────────────────────┘
```

### 4. Remove Button

Delete buttons from configuration:

```
┌─────────────────────────────────────────┐
│  Remove Button                         │
├─────────────────────────────────────────┤
│  1. npm-dev ($(play) Dev)              │
│  2. git-status ($(git-branch) Status)  │
│  3. npm-build ($(package) Build)       │
└─────────────────────────────────────────┘

Select button to remove:
```

#### Confirmation

```
Warning: This will permanently delete the button "npm-dev".
Are you sure you want to continue? (y/N): y

✅ Button "npm-dev" removed successfully
```

### 5. Toggle Debug Mode

Enable or disable debug logging:

```
Current debug mode: Disabled

Enable debug mode? (y/N): y

✅ Debug mode enabled
```

**Debug Mode Effects**:

- Detailed logging in output panel
- Extended error messages
- Performance metrics
- Visibility check logs

### 6. Export Configuration

Save current configuration to a JSON file:

```
┌─────────────────────────────────────────┐
│  Export Configuration                  │
├─────────────────────────────────────────┤
│  Location:                             │
│  1. Current directory                  │
│  2. Desktop                            │
│  3. Custom path                        │
└─────────────────────────────────────────┘
```

#### Export Options

```
Enter filename (without extension): my-statusbar-config
Select export format:
1. JSON (human-readable)
2. JSON (minified)

Export successful: my-statusbar-config.json
```

### 7. Import Configuration

Load configuration from a JSON file:

```
┌─────────────────────────────────────────┐
│  Import Configuration                  │
├─────────────────────────────────────────┤
│  Source:                               │
│  1. File selection                     │
│  2. Paste JSON directly                │
│  3. Import from URL                    │
└─────────────────────────────────────────┘
```

#### Import Modes

- **Replace All**: Replace entire configuration
- **Merge**: Merge with existing (overwrite duplicates)
- **Append**: Add to existing (generate new IDs for conflicts)

```
Import preview:
• 3 buttons will be added
• 2 buttons will be modified
• 1 button will be removed

Select import mode:
1. Replace All
2. Merge
3. Append

Apply import? (y/N):
```

### 8. Apply Label Preset

Add dynamic labels to buttons for real-time information:

```
┌─────────────────────────────────────────┐
│  Apply Label Preset                    │
├─────────────────────────────────────────┤
│  Button Selection:                     │
│  1. npm-dev ($(play) Dev)              │
│  2. git-status ($(git-branch) Status)  │
└─────────────────────────────────────────┘
```

#### Label Preset Types

```
┌─────────────────────────────────────────┐
│  Label Preset Types                    │
├─────────────────────────────────────────┤
│  1. Git Branch Name                    │
│  2. Git Repository Status              │
│  3. Git Remote URL                     │
│  4. Current Time                       │
│  5. Environment Variable               │
│  6. NPM Package Version                │
│  7. Custom Label                       │
└─────────────────────────────────────────┘
```

#### Git Presets

**Git Branch**:

```
Git branch preset applied to "npm-dev"
Button now shows: $(git-branch) main
Updates automatically when branch changes
```

**Git Status**:

```
Git status preset applied to "npm-dev"
Button now shows: $(git-commit) Clean
Updates automatically when repository changes
```

#### Package Presets

**NPM Package Version**:

```
Enter package name: react
Label preset "NPM Package Version" applied
Button now shows: $(package) v18.2.0
Updates every 5 minutes
```

### 9. Configure Performance

Optimize extension performance:

```
┌─────────────────────────────────────────┐
│  Configure Performance                 │
├─────────────────────────────────────────┤
│  1. Visibility Debounce                │
│  2. Virtualization                     │
│  3. Result Caching                     │
│  4. Apply Performance Preset           │
│  5. Performance Test                   │
└─────────────────────────────────────────┘
```

#### Visibility Debounce

```
Current debounce: 300ms

Adjust visibility debounce (0-5000ms): 500

✅ Visibility debounce updated to 500ms
```

#### Performance Presets

```
┌─────────────────────────────────────────┐
│  Performance Presets                   │
├─────────────────────────────────────────┤
│  1. Balanced (300ms, caching on)       │
│  2. Fast (100ms, caching on, v-on)     │
│  3. Minimal (0ms, caching off)         │
│  4. Custom                             │
└─────────────────────────────────────────┘
```

**Preset Details**:

- **Balanced**: Best for most users
- **Fast**: Maximum responsiveness
- **Minimal**: For debugging/testing

#### Performance Test

```
Running performance test...

Results:
• Activation time: 245ms
• Button creation: 23ms (8 buttons)
• Memory usage: 45MB
• Cache hit rate: 87%

Performance: ✅ Good
```

### 10. Reset to Defaults

Remove all buttons and reset settings:

```
┌─────────────────────────────────────────┐
│  Reset to Defaults                     │
├─────────────────────────────────────────┤
│  This will:                            │
│  • Remove all configured buttons       │
│  • Reset all settings to defaults      │
│  • Clear all presets                   │
│  • Remove debug mode                   │
│                                        │
│  ⚠️  This action cannot be undone!     │
└─────────────────────────────────────────┘

Are you sure you want to reset? (type 'RESET' to confirm):

✅ Configuration reset to defaults
```

### 11. Help

Display comprehensive help and usage information:

```
┌─────────────────────────────────────────┐
│  Help & Documentation                  │
├─────────────────────────────────────────┤
│  Quick Commands:                       │
│  • bun run dev:cli  (start CLI)        │
│  • Ctrl+C        (exit CLI)            │
│                                        │
│  Documentation:                        │
│  • Configuration Reference             │
│  • Sample Configurations               │
│  • Troubleshooting Guide               │
│                                        │
│  Support:                              │
│  • GitHub Issues                       │
│  • GitHub Discussions                  │
│                                        │
│  Online:                               │
│  • Extension Homepage                  │
│  • Documentation Site                  │
└─────────────────────────────────────────┘
```

## 🔧 Advanced CLI Features

### Batch Operations

#### Bulk Button Creation

```bash
# Create multiple buttons from a template
echo "Creating React development buttons..."
# Follow interactive prompts for each button
```

#### Configuration Migration

```bash
# Export from one project, import to another
1. Export current config
2. Switch to new project
3. Import configuration
4. Apply project-specific presets
```

### Non-Interactive Mode

#### Command Line Arguments

```bash
# Future enhancement: command line arguments
statusbar-cli --preset nodejs --export config.json
statusbar-cli --add-button --type npm --script dev
statusbar-cli --toggle-debug
```

#### Script Integration

```bash
#!/bin/bash
# Automated setup script
echo "Setting up StatusBar Quick Actions..."
bun run dev:cli << EOF
2
1
1
0
EOF
```

### Configuration Validation

#### Syntax Checking

```
Validating configuration...

✅ No syntax errors found
✅ All command types valid
✅ Button IDs unique
✅ Priority values valid

Configuration is valid
```

#### Schema Validation

```
Checking against schema...

⚠️  Warning: Button "test" has unknown property "customOption"
❌ Error: Button "broken" missing required property "command"
❌ Error: Invalid command type "invalidType"

Please fix these issues before applying the configuration
```

## 🎛️ Settings Management

### User vs Workspace Settings

#### Settings Location Selection

```
┌─────────────────────────────────────────┐
│  Settings Location                     │
├─────────────────────────────────────────┤
│  1. User Settings (Global)             │
│     ~/.config/Code/User/settings.json  │
│                                        │
│  2. Workspace Settings (Project)       │
│     ./.vscode/settings.json            │
└─────────────────────────────────────────┘
```

#### Configuration Scope

**User Settings (Global)**:

- Applies to all VS Code workspaces
- Stored in user profile directory
- Best for personal preferences

**Workspace Settings (Project-specific)**:

- Only applies to current project
- Stored in project .vscode folder
- Best for team configurations

### Configuration Backup

#### Automatic Backups

```
Backup created: config-backup-20241228.json
Location: ~/.vscode-statusbar-backups/
Total backups kept: 5
```

#### Manual Backup

```
Creating manual backup...

Backup saved: my-config-backup.json
Restore with: Import Configuration
```

## 🔍 Debugging and Troubleshooting

### Debug Mode Features

#### Extended Logging

```bash
Debug mode enabled

[DEBUG] Configuration loaded: 2 buttons
[DEBUG] Visibility check: npm-dev (true)
[DEBUG] Command execution: npm run dev
[DEBUG] Result: Success (0)
```

#### Performance Metrics

```
Performance Metrics:
• Memory usage: 45.2MB
• Cache efficiency: 87%
• Visibility checks: 156 (avg 23ms)
• Command executions: 23
```

### Configuration Diagnosis

#### Common Issues Detection

```
Running configuration diagnosis...

⚠️  Issue: Button "test" references non-existent script "missing"
   Solution: Add script to package.json or update button config

⚠️  Issue: High visibility check frequency detected
   Solution: Increase debounce setting

✅ No critical issues found
```

## 📊 Status and Progress

### Progress Indicators

#### Multi-step Operations

```
Applying preset "Node.js Development"...
[████████████████████████████████] 100%

Progress:
✓ Validating configuration
✓ Creating buttons (3/3)
✓ Setting visibility conditions
✓ Applying theme colors
✓ Updating UI

✅ Preset applied successfully!
```

#### Progress Feedback

```
Exporting configuration...
[████████░░░░░░░░░░░░░░░░░░░░░░] 45%

Current file: my-config.json
Buttons processed: 2/5
Estimated time remaining: 5 seconds
```

### Status Messages

#### Success Messages

```
✅ Configuration saved successfully
✅ Button "npm-dev" created
✅ Preset "Node.js Development" applied
✅ Debug mode enabled
```

#### Error Messages

```
❌ Error: Invalid JSON syntax
❌ Error: Button ID "duplicate" already exists
❌ Error: Command type "invalid" not supported
❌ Error: Permission denied writing to file
```

#### Warning Messages

```
⚠️  Warning: Button "test" has no visibility conditions
⚠️  Warning: High number of buttons detected (15+)
⚠️  Warning: Debug mode may impact performance
```

## 🚀 Integration Examples

### Project Setup Automation

#### React Project Setup

```bash
#!/bin/bash
# setup-react.sh

echo "Setting up StatusBar Quick Actions for React project..."

# Start CLI and configure React workflow
bun run dev:cli << EOF
2
2
1
0
EOF

echo "React development buttons configured!"
```

#### Team Onboarding

```bash
#!/bin/bash
# team-setup.sh

# Export team configuration
bun run dev:cli << EOF
6
1
team-config
1
0
EOF

echo "Team configuration exported to team-config.json"
```

### CI/CD Integration

#### Automated Configuration Validation

```yaml
# GitHub Actions workflow
- name: Validate StatusBar Configuration
  run: |
    # Check if CLI tool validates configuration
    echo "Checking configuration syntax..."
    # Future: cli --validate-config
```

## 🎯 Best Practices

### 1. Regular Backups

```bash
# Export configuration before major changes
bun run dev:cli
# Select option 6 (Export Configuration)
```

### 2. Use Presets for Consistency

```bash
# Apply standard presets for common workflows
bun run dev:cli
# Select option 2 (Apply Preset)
```

### 3. Enable Debug Mode for Testing

```bash
# Enable during configuration testing
bun run dev:cli
# Select option 5 (Toggle Debug Mode)
```

### 4. Performance Optimization

```bash
# Configure performance settings
bun run dev:cli
# Select option 9 (Configure Performance)
# Choose appropriate preset
```

## 🎉 Summary

The CLI tool provides powerful command-line access to all StatusBar Quick Actions functionality:

- ✅ **Interactive Menu Interface** - Easy to use
- ✅ **Full Configuration Management** - Create, edit, delete buttons
- ✅ **Preset System Integration** - Apply and manage presets
- ✅ **Performance Optimization** - Tune settings for your needs
- ✅ **Import/Export** - Share configurations across projects
- ✅ **Debug and Troubleshooting** - Diagnose and fix issues

**Next Steps**:

- Learn about [Configuration Reference](CONFIGURATION_REFERENCE.md) for advanced options
- Explore [Sample Configurations](SAMPLE-CONFIGURATIONS.md) for inspiration
- Check out [Contributing Guidelines](CONTRIBUTING.md) to improve the CLI tool

---

_Master the CLI tool to manage your StatusBar Quick Actions configuration like a pro!_

_Last updated: December 2024_
