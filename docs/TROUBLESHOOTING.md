# Troubleshooting Guide

Comprehensive troubleshooting guide for **StatusBar Quick Actions** covering common issues, solutions, and debugging techniques.

## 🚨 Common Issues & Solutions

### 1. Extension Not Loading

#### Symptoms

- Extension doesn't appear in Extensions view
- No commands available in Command Palette
- Status bar remains unchanged

#### Solutions

**Method 1: Reload VS Code**

1. **Open Command Palette** (`Ctrl+Shift+P`)
2. **Run**: `Developer: Reload Window`
3. **Wait** for reload to complete

**Method 2: Check Extension Status**

1. **Open Extensions View** (`Ctrl+Shift+X`)
2. **Search**: "StatusBar Quick Actions"
3. **Verify**: Extension shows "Enabled"
4. **Check**: No error indicators

**Method 3: Reinstall Extension**

1. **Uninstall** current version
2. **Restart** VS Code
3. **Install** latest version from marketplace

**Method 4: Clear Extension Cache**

```bash
# Windows
rmdir /s "%APPDATA%\Code\User\workspaceStorage"

# macOS
rm -rf ~/Library/Application\ Support/Code/User/workspaceStorage

# Linux
rm -rf ~/.config/Code/User/workspaceStorage
```

### 2. Buttons Not Showing

#### Symptoms

- Extension loads but no buttons appear
- Configuration exists but buttons are invisible

#### Solutions

**Check Configuration**

```json
{
  "statusbarQuickActions": {
    "buttons": [
      {
        "id": "test-button",
        "text": "Test Button",
        "command": {
          "type": "shell",
          "command": "echo"
        },
        "enabled": true // Must be true or omitted
      }
    ]
  }
}
```

**Verify Button Properties**

- `enabled` must be `true` or omitted
- `text` or `icon` must be provided
- `command` must be properly configured
- Unique `id` required

**Enable Debug Mode**

```json
{
  "statusbarQuickActions": {
    "settings": {
      "debug": true
    }
  }
}
```

**Check Visibility Conditions**

```json
{
  "visibility": {
    "conditions": [
      {
        "type": "fileType",
        "patterns": ["*.js"]
      }
    ]
  }
}
```

### 3. Commands Not Executing

#### Symptoms

- Buttons appear but clicking does nothing
- No output or error messages
- Commands fail silently

#### Solutions

**Test Commands Manually**

1. **Open Terminal** (`Ctrl+` `)
2. **Test command**: `npm run dev` (or your command)
3. **Verify**: Command works in terminal
4. **Check**: Required tools are installed

**Check Package Manager Installation**

```bash
# Test each package manager
npm --version
yarn --version
pnpm --version
bun --version
```

**Verify Script Names**

```json
{
  "command": {
    "type": "npm",
    "script": "dev" // Must exist in package.json
  }
}
```

**Check Working Directory**

```json
{
  "workingDirectory": "${workspaceFolder}"
}
```

**Test with Simple Command**

```json
{
  "id": "test-echo",
  "text": "Test",
  "command": {
    "type": "shell",
    "command": "echo",
    "args": ["Hello World"]
  }
}
```

### 4. Performance Issues

#### Symptoms

- VS Code becomes slow after installing extension
- High CPU usage
- Delayed button responses

#### Solutions

**Reduce Button Count**

- Start with 2-3 buttons
- Add more gradually
- Use visibility conditions to reduce clutter

**Optimize Performance Settings**

```json
{
  "statusbarQuickActions": {
    "settings": {
      "performance": {
        "visibilityDebounceMs": 500, // Increase from default 300ms
        "cacheResults": true, // Enable caching
        "enableVirtualization": true // For 10+ buttons
      }
    }
  }
}
```

**Disable Debug Mode**

```json
{
  "statusbarQuickActions": {
    "settings": {
      "debug": false // Disable in production
    }
  }
}
```

**Check Background Processes**

- Close unnecessary terminals
- Stop running development servers
- Check for memory leaks

### 5. Permission Errors

#### Symptoms

- "Permission denied" errors
- Commands fail with access errors
- File system access issues

#### Solutions

**Check File Permissions**

```bash
# Linux/macOS
chmod +x your-script.sh

# Windows (Run as Administrator)
# Right-click Command Prompt → "Run as administrator"
```

**Verify Working Directory Access**

```json
{
  "workingDirectory": "${workspaceFolder}" // Must be accessible
}
```

**Fix npm Permissions (Linux/macOS)**

```bash
# Fix npm global permissions
sudo chown -R $(whoami) ~/.npm
```

**Windows Administrator Mode**

1. **Right-click** VS Code
2. **Select**: "Run as administrator"
3. **Test** commands again

### 6. Package Manager Issues

#### Symptoms

- "Command not found" errors
- npm/yarn/pnpm/bun not working
- Version conflicts

#### Solutions

**Install Missing Package Managers**

```bash
# Install yarn
npm install -g yarn

# Install pnpm
npm install -g pnpm

# Install bun
curl -fsSL https://bun.sh/install | bash
```

**Check PATH Environment**

```bash
# Verify installation
which npm
which yarn
which pnpm
which bun
```

**Fix npm Global Installation**

```bash
# Windows
npm config set prefix %APPDATA%\npm

# Linux/macOS
npm config set prefix ~/.npm-global
```

**Clear npm Cache**

```bash
npm cache clean --force
yarn cache clean
pnpm store prune
```

### 7. Git Integration Issues

#### Symptoms

- Git commands not working
- Git status detection fails
- GitHub CLI issues

#### Solutions

**Check Git Installation**

```bash
git --version
```

**Verify GitHub CLI**

```bash
gh --version
# Install if missing: https://cli.github.com/
```

**Fix Git Repository Detection**

```bash
# Initialize git if missing
git init

# Check repository status
git status
```

**Configure Git**

```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

## 🔍 Debug Mode

### Enabling Debug Mode

**Via Configuration**

```json
{
  "statusbarQuickActions": {
    "settings": {
      "debug": true
    }
  }
}
```

**Via Command Palette**

1. **Run**: `StatusBar Quick Actions: Edit Button`
2. **Select**: "Toggle Debug Mode"

### Debug Information Locations

#### Output Panel

1. **View** → **Output**
2. **Select**: "StatusBar Quick Actions"
3. **Look for**: Detailed logs and error messages

#### Developer Tools

1. **Press**: `F12`
2. **Go to**: Console tab
3. **Look for**: Error messages and warnings

#### Extension Host Log

1. **Help** → **Toggle Developer Tools**
2. **Console** tab
3. **Filter**: Extension messages

### Debug Log Examples

#### Successful Button Creation

```
[StatusBar Quick Actions] Button created: npm-dev
[StatusBar Quick Actions] Button npm-dev command: npm run dev
[StatusBar Quick Actions] Button npm-dev shown successfully
```

#### Visibility Check

```
[StatusBar Quick Actions] Checking visibility for button: git-status
[StatusBar Quick Actions] Git status: repository=true, clean=false
[StatusBar Quick Actions] Button git-status visible: true
```

#### Command Execution

```
[StatusBar Quick Actions] Executing command: npm run dev
[StatusBar Quick Actions] Command started with PID: 12345
[StatusBar Quick Actions] Command completed with code: 0
```

## 🛠️ Advanced Troubleshooting

### Configuration Validation

#### Schema Validation

```json
{
  "$schema": "vscode://schemas/statusbar-quick-actions-config",
  "statusbarQuickActions": {
    "buttons": [...]
  }
}
```

#### Common Configuration Errors

**Missing Required Properties**

```json
{
  // ❌ Missing 'id'
  "text": "Button",
  "command": { "type": "shell", "command": "echo" }
}
```

**Invalid Command Type**

```json
{
  "id": "button",
  "text": "Button",
  "command": {
    "type": "invalid", // ❌ Must be valid type
    "script": "test"
  }
}
```

**Empty Display Text**

```json
{
  "id": "button",
  "text": "", // ❌ Cannot be empty without icon
  "command": { "type": "shell", "command": "echo" }
}
```

### Environment-Specific Issues

#### Windows-Specific Issues

**PowerShell Execution Policy**

```powershell
# Fix execution policy
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

**Long Path Support**

```json
{
  "workingDirectory": "C:\\Very\\Long\\Path\\To\\Project"
}
```

**UNC Path Issues**

```json
{
  "workingDirectory": "\\\\server\\share\\project"
}
```

#### Linux/macOS-Specific Issues

**Line Ending Differences**

```json
{
  "command": {
    "type": "shell",
    "command": "bash",
    "args": ["-c", "your-script.sh"]
  }
}
```

**Executable Permissions**

```bash
chmod +x your-script.sh
```

### Network-Related Issues

#### Firewall/Antivirus Blocking

**Symptoms**

- Commands timeout
- Network requests fail
- Package manager issues

**Solutions**

1. **Disable antivirus** temporarily
2. **Add VS Code to firewall** exceptions
3. **Check corporate firewall** settings
4. **Use proxy** if required

#### Proxy Configuration

**npm Proxy**

```bash
npm config set proxy http://proxy.company.com:8080
npm config set https-proxy http://proxy.company.com:8080
```

**Environment Variables**

```json
{
  "environment": {
    "HTTP_PROXY": "http://proxy.company.com:8080",
    "HTTPS_PROXY": "http://proxy.company.com:8080",
    "NO_PROXY": "localhost,127.0.0.1"
  }
}
```

## 📊 Performance Analysis

### Measuring Performance

#### Extension Activation Time

1. **Developer Tools** (`F12`)
2. **Performance** tab
3. **Record** while activating extension
4. **Check**: Extension activation duration

#### Memory Usage

1. **Task Manager** (Windows) or **Activity Monitor** (macOS)
2. **Check**: VS Code memory usage
3. **Monitor**: Extension impact on memory

#### CPU Usage

1. **Resource Monitor** or **top** command
2. **Monitor**: CPU usage during button operations
3. **Check**: Visibility check frequency

### Performance Optimization

#### Button Count Management

- **1-5 buttons**: No optimization needed
- **5-10 buttons**: Enable caching
- **10+ buttons**: Enable virtualization + caching

#### Visibility Check Optimization

```json
{
  "visibility": {
    "debounceMs": 500 // Increase for better performance
  }
}
```

#### Command Execution Optimization

```json
{
  "execution": {
    "foreground": false, // Non-blocking execution
    "showProgress": false // Disable for quick commands
  }
}
```

## 🆘 Emergency Procedures

### Complete Reset

**Reset Extension Settings**

1. **Delete**: `.vscode/settings.json` (workspace)
2. **Clear**: User settings for extension
3. **Restart**: VS Code
4. **Reconfigure**: From scratch

**Clear All Data**

```bash
# Extension storage
rm -rf ~/.vscode/extensions/involvex.statusbar-quick-actions

# Extension state
rm -rf ~/.config/Code/User/globalStorage/involvex.statusbar-quick-actions
```

### Rollback to Previous Version

1. **Uninstall** current version
2. **Install** previous version from marketplace
3. **Check** changelog for known issues

### Safe Mode Testing

1. **Disable** all other extensions
2. **Test** extension functionality
3. **Re-enable** extensions one by one
4. **Identify** conflicting extensions

## 📞 Getting Help

### Before Seeking Help

1. **Enable debug mode**
2. **Check output panel** for errors
3. **Try simple test commands**
4. **Verify basic functionality**
5. **Document exact error messages**

### Information to Provide

- **VS Code version**: `Help` → `About`
- **Extension version**: Extensions view
- **Operating System**: Windows/macOS/Linux version
- **Error messages**: Complete error text
- **Configuration**: Relevant button configurations
- **Debug logs**: Output panel contents

### Support Channels

- **GitHub Issues**: [Bug reports](https://github.com/involvex/vscode-statusbar-quick-actions/issues)
- **GitHub Discussions**: [General questions](https://github.com/involvex/vscode-statusbar-quick-actions/discussions)
- **Documentation**: This comprehensive guide
- **Sample Configurations**: [Ready-to-use examples](SAMPLE-CONFIGURATIONS.md)

## 🎯 Prevention Tips

### Best Practices

1. **Start Simple**: Begin with basic configurations
2. **Test Incrementally**: Add features one by one
3. **Keep Backups**: Export configurations regularly
4. **Monitor Performance**: Check resource usage
5. **Update Regularly**: Keep extension updated
6. **Document Changes**: Track configuration modifications

### Regular Maintenance

1. **Clean Output Panel**: Clear old logs regularly
2. **Check Dependencies**: Verify package manager versions
3. **Review Configuration**: Clean up unused buttons
4. **Monitor Performance**: Watch for degradation
5. **Update Configurations**: Keep in sync with project changes

## 🎉 Success Indicators

Your extension is working correctly when:

- ✅ **Buttons appear** immediately after configuration
- ✅ **Commands execute** when clicked
- ✅ **No error messages** in output panel
- ✅ **VS Code remains responsive** during use
- ✅ **Visibility conditions work** as expected
- ✅ **Progress notifications** display correctly
- ✅ **History tracking** functions properly

## 🚀 Next Steps

After troubleshooting:

1. **Optimize Configuration**: [Configuration Reference](CONFIGURATION_REFERENCE.md)
2. **Explore Advanced Features**: [Preset System](PRESET_AND_DYNAMIC_LABELS.md)
3. **Learn Performance Tips**: [Performance Optimizations](PERFORMANCE_OPTIMIZATIONS.md)
4. **Share Your Setup**: Contribute to community presets

---

_Don't let technical issues slow down your development workflow! This guide covers most common problems and their solutions._

_Last updated: December 2024_
