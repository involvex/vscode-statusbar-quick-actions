# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**StatusBar Quick Actions** is a VSCode extension that provides highly customizable status bar buttons for executing user-defined scripts and commands. It supports multiple package managers (npm, yarn, pnpm, bun), VSCode tasks, shell commands, and GitHub CLI integration with advanced features like theme support, execution tracking, and intelligent visibility conditions.

## Development Commands

### Essential Commands

- `bun install` - Install all dependencies
- `bun run compile` - Compile TypeScript to JavaScript (outputs to `out/`)
- `bun run watch` - Compile TypeScript in watch mode
- `bun run lint` - Check code for linting errors
- `bun run lint:fix` - Auto-fix linting errors
- `bun run format` - Format code with Prettier
- `bun run format:check` - Check code formatting without modifying

### Build & Package

- `bun run clean` - Remove `out/` directory
- `bun run rebuild` - Clean and compile from scratch
- `bun run dev` - Clean and start watch mode
- `bun run package` - Create .vsix extension package
- `bun run package:install` - Package and install the extension in VSCode

### Important Notes

- This project uses **Bun** as the package manager and runtime (not npm/yarn)
- All scripts in package.json are prefixed with `bun run`
- The extension requires VSCode engine version ^1.100.0
- TypeScript target is ES2024 with strict mode enabled

## Architecture Overview

### Core Class Structure

The extension follows a modular architecture with clear separation of concerns:

**Main Extension Class** (`extension.ts`):

- Entry point and orchestrator for the entire extension
- Manages lifecycle (activate/deactivate)
- Owns instances of all manager classes
- Maintains `buttonStates` Map that tracks all status bar buttons
- Handles VSCode command registration and configuration watching

**Manager Classes** (each handles a specific domain):

- `ConfigManager` (`configuration.ts`) - Configuration loading, validation, and watching
- `CommandExecutor` (`executor.ts`) - Command execution with child_process
- `ThemeManager` (`theme.ts`) - Theme detection and color application
- `VisibilityManager` (`visibility.ts`) - Conditional button visibility evaluation

### Key Architectural Patterns

**1. ButtonState Lifecycle**
Each button goes through this lifecycle:

- Configuration loaded from VSCode settings → `StatusBarButtonConfig`
- Status bar item created → `vscode.StatusBarItem`
- Button state object created → `ButtonState` (stored in Map with button ID as key)
- Button registered with click handler
- On configuration change: existing buttons disposed, new ones created

**2. Command Execution Flow**

```
User clicks button → extension.ts executes button
  → CommandExecutor.execute() called with ButtonCommand + ExecutionOptions
  → Command type determines execution strategy (npm/yarn/pnpm/bun/shell/vscode/task/github/detect)
  → child_process.exec() runs command (except vscode/task types which use VSCode APIs)
  → ExecutionResult returned with stdout/stderr/exitCode/duration
  → Result saved to history via global state persistence
  → Notifications shown based on execution config
```

**3. Visibility Evaluation**
Buttons can be conditionally shown/hidden based on context:

- `VisibilityManager.getCurrentContext()` gathers current editor state
- `VisibilityManager.isVisible()` evaluates all conditions (AND logic)
- Supports: fileType (glob patterns via minimatch), fileExists, gitStatus (via git extension API), workspaceFolder
- Each condition supports `invert` flag for negation logic

**4. History Persistence**

- History stored in VSCode global state (survives restarts)
- Key format: `history_{buttonId}`
- Each button maintains its own history array
- Max entries configurable per button (default 20)
- History loaded on extension activation and updated after each execution

**5. Theme Integration**

- Theme auto-detected from VSCode color theme
- Supports dark/light/high-contrast modes
- Colors can be overridden per-button via `colors` config
- Theme manager watches for theme changes and updates buttons dynamically

### Type System

All types defined in `types.ts` with strict TypeScript checking enabled:

**Core Interfaces**:

- `StatusBarButtonConfig` - Full button configuration from settings
- `ButtonState` - Runtime state including VSCode StatusBarItem reference
- `ButtonCommand` - Command configuration with discriminated union for type
- `ExecutionResult` - Command execution output and metadata
- `VisibilityContext` - Current editor/workspace context for visibility checks
- `ThemeConfig` - Theme configuration with mode-specific color schemes

**Important Type Details**:

- `ButtonCommand.type` is a discriminated union with 9 possible values
- `ButtonState.history` is `ExecutionResult[]` (not `CommandHistoryEntry[]`)
- All manager classes use interfaces from types.ts (no inline types)

### Configuration System

**Settings Structure**:

```json
{
  "statusbarQuickActions.buttons": [ /* array of StatusBarButtonConfig */ ],
  "statusbarQuickActions.settings.theme": { /* ThemeConfig */ },
  "statusbarQuickActions.settings.debug": boolean
}
```

**Configuration Watching**:

- Uses `vscode.workspace.onDidChangeConfiguration`
- On change: disposes all buttons and recreates from new config
- ConfigManager validates configuration before applying
- Invalid configs show error notification and fall back to previous state

### Package Manager Detection

The `detect` command type auto-detects package managers:

1. Checks for lock files in priority order: bun.lockb → pnpm-lock.yaml → yarn.lock → package-lock.json
2. Verifies detected package manager is actually installed on system
3. Constructs appropriate command (note: yarn doesn't use `run` subcommand)
4. Fallback: if package.json exists, uses first available package manager

### Interactive Settings Menu

The extension provides a comprehensive QuickPick UI for button management:

- Add New Button - Wizard-based button creation
- Edit Existing Button - Modify button properties
- Delete Button - Remove buttons
- Duplicate Button - Clone existing buttons
- Toggle Button - Enable/disable without deleting
- Export/Import Configuration - JSON-based config backup/restore

Access via command palette: "StatusBar Quick Actions: Edit Button"

## File Organization

```
src/
├── extension.ts        - Main extension class & activation
├── types.ts            - All TypeScript interfaces
├── configuration.ts    - Config loading & validation
├── executor.ts         - Command execution logic
├── theme.ts            - Theme detection & application
├── visibility.ts       - Visibility condition evaluation
├── history.ts          - History management utilities
└── notifications.ts    - Notification display logic
```

## Common Pitfalls & Solutions

**Child Process Execution**:

- Always use `promisify(exec)` from `child_process`, not VSCode terminal API
- Terminal API doesn't capture stdout/stderr properly
- Set `windowsHide: true` option to hide console windows on Windows
- Handle both success and error cases (exec throws on non-zero exit codes)

**VSCode Git Extension Integration**:

- Git extension must be checked with `vscode.extensions.getExtension('vscode.git')`
- API accessed via `gitExtension.exports.getAPI(1)`
- Repository state accessed via `git.repositories[0].state`
- Always check if repository exists before accessing state

**History Persistence**:

- Use `context.globalState` not `context.workspaceState` (workspace state is per-workspace)
- Always load history on activation for each button
- Update both global state AND ButtonState.history on execution
- Trim history to maxEntries after adding new entries

**Configuration Types**:

- VSCode config returns `any` by default, always use `.get<Type>()` with explicit type
- Validate all config before using (check required fields)
- Handle missing optional fields with defaults

**Minimatch for Glob Patterns**:

- Use `{ matchBase: true }` option for filename-only matching
- Pattern `*.ts` should match `file.ts` regardless of path
- Check for `*` or `?` to detect glob patterns vs plain extensions

## Extension Development Workflow

1. Make code changes
2. Run `bun run compile` (or use watch mode with `bun run watch`)
3. Press F5 in VSCode to launch Extension Development Host
4. Test changes in the development window
5. Run `bun run lint:fix` before committing
6. Run `bun run format` to ensure consistent code style

## Testing the Extension

While there are no automated tests currently (`test` script exits 0), manual testing workflow:

1. Create test button configurations in `.vscode/settings.json`
2. Test different command types (npm, bun, shell, vscode, task)
3. Verify visibility conditions work with different file types
4. Check history persistence by reloading VSCode
5. Test theme switching (View → Appearance → Color Theme)
6. Verify execution with success/error cases
