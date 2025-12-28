# Installation Guide

This guide covers all the ways to install **StatusBar Quick Actions** in VS Code.

## 📋 Prerequisites

- **Visual Studio Code**: Version 1.107.0 or later
- **Operating System**: Windows 10+, macOS 10.14+, or Linux
- **Node.js**: Version 14+ (for npm/yarn/pnpm/bun commands)
- **Git**: For Git-related functionality (optional)

## 🚀 Installation Methods

### Method 1: VS Code Marketplace (Recommended)

1. **Open VS Code**
2. **Open Extensions View**
   - `Ctrl+Shift+X` (Windows/Linux)
   - `Cmd+Shift+X` (macOS)
   - Or click the Extensions icon in the Activity Bar

3. **Search for Extension**

   ```
   StatusBar Quick Actions
   ```

4. **Install Extension**
   - Click the "Install" button
   - Wait for installation to complete
   - Click "Reload" when prompted

### Method 2: Command Line Installation

If you have the extension package (.vsix file):

```bash
# Install from VSIX file
code --install-extension path/to/statusbar-quick-actions-0.14.0.vsix

# Or using the full path
"C:\Program Files\Microsoft VS Code\Code.exe" --install-extension statusbar-quick-actions-0.14.0.vsix
```

### Method 3: Development Installation

For developers who want to work on the extension:

```bash
# Clone the repository
git clone https://github.com/involvex/vscode-statusbar-quick-actions.git
cd vscode-statusbar-quick-actions

# Install dependencies
npm install
# or
bun install

# Build the extension
npm run compile
# or
bun run compile

# Install in development mode
npm run package:install
# or
bun run package:install
```

## ✅ Verification

After installation, verify the extension is working:

1. **Check Extensions**
   - Open Extensions view (`Ctrl+Shift+X`)
   - Search for "StatusBar Quick Actions"
   - Verify it shows "Enabled"

2. **Check Commands**
   - Open Command Palette (`Ctrl+Shift+P`)
   - Type "StatusBar Quick Actions"
   - You should see available commands

3. **Test Basic Functionality**
   - A welcome message should appear on first activation
   - Status bar should remain responsive
   - No error notifications should appear

## 🔧 Post-Installation Setup

### 1. Configure Your First Button

The extension provides a helpful wizard to get started:

1. **Open Command Palette** (`Ctrl+Shift+P`)
2. **Run Command**: `StatusBar Quick Actions: Edit Button`
3. **Select**: "Add New Button"
4. **Follow the prompts** to create your first button

### 2. Quick Configuration with Presets

For common workflows, use built-in presets:

1. **Open Command Palette** (`Ctrl+Shift+P`)
2. **Run Command**: `StatusBar Quick Actions: Manage Presets`
3. **Select**: "Apply Preset"
4. **Choose** from available presets:
   - Node.js Development
   - React Development
   - Git Workflow
   - Python Development

### 3. Access Settings

Configure the extension through VS Code settings:

1. **Open Settings** (`Ctrl+,`)
2. **Search**: "StatusBar Quick Actions"
3. **Configure** your preferences

## 🛠️ Configuration Locations

The extension supports two configuration scopes:

### User Settings (Global)

- **Location**: `%APPDATA%\Code\User\settings.json` (Windows)
- **Location**: `~/Library/Application Support/Code/User/settings.json` (macOS)
- **Location**: `~/.config/Code/User/settings.json` (Linux)
- **Applies to**: All VS Code workspaces

### Workspace Settings (Project-specific)

- **Location**: `<workspace>/.vscode/settings.json`
- **Applies to**: Current project only
- **Overrides**: User settings

## 📦 Package Manager Dependencies

Depending on your button configurations, you may need these tools installed:

### Required for Package Manager Commands

```bash
# npm (usually pre-installed with Node.js)
npm --version

# yarn (optional)
npm install -g yarn

# pnpm (optional)
npm install -g pnpm

# bun (optional)
curl -fsSL https://bun.sh/install | bash
```

### Required for Git Operations

```bash
# Git CLI
git --version

# GitHub CLI (optional, for GitHub commands)
gh --version
```

### Required for Docker Commands

```bash
# Docker CLI
docker --version

# Docker Compose (if using compose)
docker-compose --version
```

## 🔍 Troubleshooting Installation

### Extension Not Appearing

**Symptoms**: Extension doesn't show in Extensions view

**Solutions**:

1. **Reload VS Code**: `Ctrl+Shift+P` → "Developer: Reload Window"
2. **Check Version**: Ensure VS Code 1.107.0+
3. **Clear Cache**: Delete `%APPDATA%\Code\User\workspaceStorage`
4. **Reinstall**: Uninstall and reinstall from marketplace

### Installation Failed

**Symptoms**: Error during installation

**Solutions**:

1. **Check Permissions**: Run VS Code as administrator (Windows)
2. **Check Disk Space**: Ensure sufficient disk space
3. **Disable Antivirus**: Temporarily disable antivirus software
4. **Manual Install**: Try manual installation with .vsix file

### Commands Not Available

**Symptoms**: Extension commands don't appear

**Solutions**:

1. **Check Activation**: Extension should activate on startup
2. **Enable Extension**: Verify it's enabled in Extensions view
3. **Check Console**: Open Developer Tools (`F12`) for errors
4. **Restart VS Code**: Complete restart may be needed

### Performance Issues

**Symptoms**: VS Code becomes slow after installation

**Solutions**:

1. **Update Extension**: Ensure you have the latest version
2. **Check Configuration**: Reduce number of buttons initially
3. **Disable Debug Mode**: Turn off debug logging
4. **Performance Settings**: Adjust visibility debounce settings

## 🔄 Updating the Extension

### Automatic Updates

VS Code automatically updates extensions when:

- Automatic updates are enabled (default)
- VS Code restarts
- You manually check for updates

### Manual Updates

1. **Open Extensions View** (`Ctrl+Shift+X`)
2. **Find StatusBar Quick Actions**
3. **Click**: "Update" if available
4. **Reload** when prompted

### Update to Pre-release Versions

1. **Open Extensions View**
2. **Find StatusBar Quick Actions**
3. **Click**: Gear icon → "Switch to Pre-release Version"
4. **Reload** extension

## 🗑️ Uninstallation

If you need to uninstall the extension:

1. **Open Extensions View** (`Ctrl+Shift+X`)
2. **Find StatusBar Quick Actions**
3. **Click**: "Uninstall"
4. **Reload** when prompted

### Clean Uninstall (Advanced)

```bash
# Remove extension completely
rm -rf ~/.vscode/extensions/involvex.statusbar-quick-actions

# Clear configuration (optional)
# User settings: ~/.config/Code/User/settings.json
# Workspace settings: .vscode/settings.json
```

## 📞 Support

If you encounter issues during installation:

- **Documentation**: Check this comprehensive guide
- **Issues**: [GitHub Issues](https://github.com/involvex/vscode-statusbar-quick-actions/issues)
- **Discussions**: [GitHub Discussions](https://github.com/involvex/vscode-statusbar-quick-actions/discussions)

---

**Next Steps**: Once installed, proceed to the [Quick Start Guide](QUICK_START.md) to configure your first buttons.

_Last updated: December 2024_
