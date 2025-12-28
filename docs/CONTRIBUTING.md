# Contributing Guidelines

Welcome to **StatusBar Quick Actions**! This guide will help you contribute to the project, whether you're fixing bugs, adding features, improving documentation, or helping with community support.

## 🤝 Ways to Contribute

### Code Contributions

- 🐛 **Bug Fixes**: Fix issues reported in GitHub Issues
- ✨ **New Features**: Add new functionality or command types
- 🔧 **Performance**: Optimize existing code for better performance
- 🎨 **UI/UX**: Improve user interface and experience

### Documentation Contributions

- 📝 **Documentation**: Improve existing docs or add new guides
- 🔍 **Examples**: Add sample configurations and use cases
- 🌐 **Translations**: Help translate documentation (future)
- 📋 **README**: Enhance project documentation

### Community Contributions

- 💬 **Support**: Help users in GitHub Discussions
- 🐛 **Bug Reports**: Report issues with detailed information
- 💡 **Feature Requests**: Suggest improvements and new features
- ⭐ **Reviews**: Review pull requests and provide feedback

## 🚀 Development Setup

### Prerequisites

- **Node.js**: Version 18+ (LTS recommended)
- **npm**: Version 9+ or **yarn** or **pnpm** or **bun**
- **Git**: For version control
- **VS Code**: Latest version for development

### Repository Setup

#### 1. Fork and Clone

```bash
# Fork the repository on GitHub, then clone your fork
git clone https://github.com/yourusername/vscode-statusbar-quick-actions.git
cd vscode-statusbar-quick-actions

# Add upstream remote
git remote add upstream https://github.com/involvex/vscode-statusbar-quick-actions.git
```

#### 2. Install Dependencies

```bash
# Using npm
npm install

# Or using yarn
yarn install

# Or using pnpm
pnpm install

# Or using bun (recommended)
bun install
```

#### 3. Build Extension

```bash
# Compile TypeScript
npm run compile
# or
bun run compile

# Build extension package
npm run package
# or
bun run package
```

#### 4. Install in Development Mode

```bash
# Install locally in VS Code
npm run package:install
# or
bun run package:install
```

### Project Structure

```
vscode-statusbar-quick-actions/
├── src/
│   ├── extension.ts           # Main extension entry point
│   ├── configuration.ts       # Configuration management
│   ├── executor.ts            # Command execution engine
│   ├── preset-manager.ts      # Preset system
│   ├── dynamic-label.ts       # Dynamic labels
│   ├── visibility.ts          # Visibility conditions
│   ├── theme.ts              # Theme management
│   ├── material-icons.ts     # Icon handling
│   ├── output-panel.ts       # Output panel management
│   ├── history.ts            # Command history
│   ├── notifications.ts      # Notification system
│   ├── types.ts              # TypeScript definitions
│   ├── config-cli.ts         # CLI tool
│   └── utils/
│       ├── changelog.ts       # Changelog generation
│       └── debounce.ts        # Debouncing utilities
├── docs/                     # Documentation
├── test/                     # Test files
├── assets/                   # Extension assets
├── .vscode/                  # VS Code development files
└── package.json             # Extension manifest
```

## 🛠️ Development Workflow

### 1. Create Feature Branch

```bash
# Update your fork
git checkout main
git pull upstream main

# Create feature branch
git checkout -b feature/your-feature-name

# Or for bug fixes
git checkout -b fix/your-bug-fix
```

### 2. Make Changes

- Follow the [Coding Standards](#coding-standards)
- Write tests for new functionality
- Update documentation as needed
- Test your changes thoroughly

### 3. Test Your Changes

#### Run Tests

```bash
# Run all tests
npm test
# or
bun test

# Run unit tests only
npm run test:unit
# or
bun run test:unit

# Run integration tests
npm run test:integration
# or
bun run test:integration

# Run e2e tests
npm run test:e2e
# or
bun run test:e2e
```

#### Manual Testing

1. **Build extension**: `npm run compile`
2. **Install in VS Code**: `npm run package:install`
3. **Test functionality**: Create test buttons and verify behavior
4. **Check performance**: Monitor activation time and resource usage

### 4. Commit Changes

#### Commit Message Format

```
type(scope): brief description

Longer description if needed

Fixes #issue-number
```

#### Commit Types

- `feat`: New features
- `fix`: Bug fixes
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

#### Examples

```bash
feat(executor): add support for bunx command type
fix(visibility): resolve file pattern matching issue
docs(readme): update installation instructions
test(executor): add unit tests for shell commands
```

### 5. Push and Create Pull Request

```bash
# Push your branch
git push origin feature/your-feature-name

# Create pull request on GitHub
# Use the web interface with detailed description
```

## 📋 Coding Standards

### TypeScript Guidelines

#### Code Style

- Use **2 spaces** for indentation
- Use **single quotes** for strings
- Use **camelCase** for variable and function names
- Use **PascalCase** for class names
- Use **UPPER_SNAKE_CASE** for constants

#### Example

```typescript
/**
 * Execute a command with the specified options
 */
export class CommandExecutor {
  private readonly defaultTimeout: number = 30000;

  public async execute(
    command: ButtonCommand,
    options: ExecutionOptions,
  ): Promise<ExecutionResult> {
    // Implementation
  }
}
```

#### Function Documentation

```typescript
/**
 * Validates a button configuration
 * @param config - The button configuration to validate
 * @returns Validation result with errors and warnings
 * @throws Error if configuration is completely invalid
 */
public validateConfig(config: StatusBarButtonConfig): ValidationResult {
    // Implementation
}
```

### Code Organization

#### File Structure

- One class per file (except small utilities)
- Group related functionality in folders
- Use barrel files (index.ts) for clean imports
- Keep files under 500 lines when possible

#### Import Organization

```typescript
// External dependencies
import * as vscode from "vscode";
import * as fs from "fs";

// Internal dependencies
import { ConfigManager } from "./configuration";
import { CommandExecutor } from "./executor";

// Types
import { StatusBarButtonConfig, ExecutionResult } from "./types";
```

### Error Handling

#### Use Specific Error Types

```typescript
try {
  await this.executeCommand(command);
} catch (error) {
  if (error instanceof CommandNotFoundError) {
    throw new Error(`Command not found: ${error.command}`);
  }
  throw new Error(`Execution failed: ${error.message}`);
}
```

#### Provide Context

```typescript
// Good
throw new Error(
  `Failed to create status bar item for button "${button.id}": ${error.message}`,
);

// Bad
throw new Error("Failed to create button");
```

### Performance Guidelines

#### Async/Await Best Practices

```typescript
// Good: Parallel execution where possible
const [result1, result2] = await Promise.all([
  this.executeCommand(command1),
  this.executeCommand(command2),
]);

// Good: Proper error handling
try {
  return await this.executeCommand(command);
} catch (error) {
  this.logger.error("Command execution failed", error);
  throw error;
}
```

#### Memory Management

```typescript
// Good: Dispose of resources
public dispose(): void {
    this.disposables.forEach(disposable => disposable.dispose());
    this.disposables.clear();
}
```

## 🧪 Testing Standards

### Test Structure

```
test/
├── unit/                    # Unit tests
├── integration/             # Integration tests
├── e2e/                     # End-to-end tests
├── mocks/                   # Mock implementations
└── fixtures/                # Test data
```

### Unit Test Example

```typescript
import { CommandExecutor } from "../../src/executor";
import { mock } from "sinon";

describe("CommandExecutor", () => {
  let executor: CommandExecutor;

  beforeEach(() => {
    executor = new CommandExecutor();
  });

  describe("execute", () => {
    it("should execute npm scripts", async () => {
      const command = {
        type: "npm",
        script: "test",
      };

      const result = await executor.execute(command, {});

      expect(result.code).toBe(0);
      expect(result.stdout).toContain("test");
    });

    it("should handle command failures", async () => {
      const command = {
        type: "npm",
        script: "nonexistent",
      };

      await expect(executor.execute(command, {})).rejects.toThrow(
        "Script not found",
      );
    });
  });
});
```

### Integration Test Example

```typescript
describe("Extension Integration", () => {
  it("should activate extension", async () => {
    const extension = await activateExtension();
    expect(extension).toBeDefined();
    expect(extension.exports).toHaveProperty("activate");
  });

  it("should create status bar buttons", async () => {
    const config = {
      buttons: [
        {
          id: "test-button",
          text: "Test",
          command: { type: "shell", command: "echo" },
        },
      ],
    };

    await updateConfiguration(config);

    // Verify button is created
    const statusBarItems = vscode.window.statusBarItems;
    expect(statusBarItems).toHaveLength(1);
  });
});
```

### Test Coverage Goals

- **Unit tests**: 80%+ coverage
- **Integration tests**: Critical paths covered
- **E2E tests**: User workflows tested

## 📖 Documentation Standards

### Documentation Structure

- Use **clear headings** (##, ###, ####)
- Include **code examples** with proper formatting
- Add **screenshots** for UI changes
- Reference **related documentation** where appropriate

### Code Comments

```typescript
// Inline comments for complex logic
// This regex matches package.json script names
const scriptRegex = /^[a-zA-Z0-9_-]+$/;

// JSDoc for public APIs
/**
 * Creates a new button configuration
 * @param id - Unique identifier for the button
 * @param text - Display text for the button
 * @returns New button configuration object
 */
export function createButtonConfig(id: string, text: string): ButtonConfig {
  // Implementation
}
```

### README Updates

When adding new features:

1. Update main README.md with overview
2. Add feature documentation in docs/
3. Update changelog.md
4. Include examples in sample-configurations.md

## 🔄 Pull Request Process

### Before Submitting

1. **Code Review**: Review your own changes first
2. **Tests Pass**: Ensure all tests pass locally
3. **Documentation**: Update relevant documentation
4. **Changelog**: Add entry to CHANGELOG.md
5. **Clean History**: Squash unnecessary commits

### Pull Request Template

```markdown
## Description

Brief description of changes

## Type of Change

- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Performance improvement

## Testing

- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed

## Checklist

- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] Tests added/updated
```

### Review Process

1. **Automated Checks**: CI/CD must pass
2. **Code Review**: At least one maintainer review
3. **Testing**: Manual testing by reviewers
4. **Documentation**: Verify docs are updated
5. **Approval**: Maintainer approval required
6. **Merge**: Squash and merge to main branch

## 🐛 Reporting Issues

### Bug Report Template

```markdown
## Bug Description

Clear description of the bug

## Steps to Reproduce

1. Step one
2. Step two
3. See error

## Expected Behavior

What should happen

## Actual Behavior

What actually happens

## Environment

- OS: [e.g., Windows 11]
- VS Code Version: [e.g., 1.84.0]
- Extension Version: [e.g., 0.14.0]

## Additional Context

Screenshots, error messages, etc.
```

### Feature Request Template

```markdown
## Feature Description

Clear description of the feature

## Use Case

Why is this feature needed?

## Proposed Solution

How should this work?

## Alternatives Considered

Other solutions you've considered

## Additional Context

Screenshots, mockups, etc.
```

## 🏷️ Release Process

### Version Numbering

We follow [Semantic Versioning](https://semver.org/):

- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes (backward compatible)

### Release Checklist

- [ ] Update version in package.json
- [ ] Update CHANGELOG.md
- [ ] Run full test suite
- [ ] Update documentation
- [ ] Create release PR
- [ ] Tag release on GitHub
- [ ] Publish to marketplace

## 🎯 Areas for Contribution

### High Priority

- 🐛 **Bug Fixes**: Critical issues affecting users
- 📱 **Cross-platform**: Windows/macOS/Linux compatibility
- ⚡ **Performance**: Optimize activation time and memory usage
- ♿ **Accessibility**: Screen reader and keyboard navigation

### Medium Priority

- ✨ **New Command Types**: Additional package managers or tools
- 🎨 **UI Improvements**: Better visual design and animations
- 📊 **Analytics**: Usage tracking and performance metrics
- 🌐 **Multi-language**: Internationalization support

### Future Enhancements

- 🔗 **Extension API**: Allow other extensions to integrate
- 📱 **Web Version**: VS Code Web support
- ☁️ **Cloud Sync**: Configuration synchronization
- 🤖 **AI Integration**: Smart command suggestions

## 💬 Community Guidelines

### Communication

- **Be Respectful**: Treat all community members with respect
- **Be Helpful**: Assist others when you can
- **Be Patient**: Help newcomers learn
- **Be Constructive**: Provide helpful feedback

### Code of Conduct

- Follow the [Contributor Covenant Code of Conduct](https://www.contributor-covenant.org/)
- Report unacceptable behavior to maintainers
- Help create a welcoming environment for all

## 📞 Getting Help

### Development Questions

- **GitHub Discussions**: General questions and ideas
- **GitHub Issues**: Bug reports and feature requests
- **Documentation**: Comprehensive guides in docs/ folder

### Technical Support

- **Stack Overflow**: General VS Code extension development
- **VS Code API**: [Official documentation](https://code.visualstudio.com/api)
- **TypeScript**: [Official documentation](https://www.typescriptlang.org/)

## 🎉 Recognition

### Contributors

All contributors are recognized in:

- **README.md**: Contributors section
- **CHANGELOG.md**: Individual contributions listed
- **GitHub**: Contributors page

### Ways to Get Recognition

- **Code Contributions**: Listed in release notes
- **Documentation**: Acknowledged in relevant docs
- **Community Support**: Mentioned in discussions
- **Bug Reports**: Credited in issue resolutions

## 🚀 Getting Started

Ready to contribute? Here's your roadmap:

1. **Set up development environment** (follow [Development Setup](#development-setup))
2. **Pick a good first issue** (look for "good first issue" labels)
3. **Read existing code** to understand patterns
4. **Ask questions** in GitHub Discussions
5. **Submit your first contribution**!

## 📚 Resources

### Learning Resources

- [VS Code Extension API](https://code.visualstudio.com/api)
- [Extension Guidelines](https://code.visualstudio.com/api/ux-guidelines/extensions)
- [Testing Extensions](https://code.visualstudio.com/api/working-with-extensions/testing-extension)
- [Publishing Extensions](https://code.visualstudio.com/api/working-with-extensions/publishing-extension)

### Tools

- [VS Code Extension Generator](https://www.npmjs.com/package/generator-code)
- [Extension Test Runner](https://www.npmjs.com/package/@vscode/test-electron)
- [Extension Pack](https://marketplace.visualstudio.com/items?itemName=ms-vscode.vscode-json)

---

**Thank you for contributing to StatusBar Quick Actions!** Your contributions help make this extension better for everyone in the developer community.

_Ready to start? Check out the [good first issues](https://github.com/involvex/vscode-statusbar-quick-actions/labels/good%20first%20issue) on GitHub!_

_Last updated: December 2024_
