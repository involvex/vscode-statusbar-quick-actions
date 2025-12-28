# Testing Documentation

## Overview

This document provides comprehensive testing guidelines for the StatusBar Quick Actions VSCode extension. Our testing strategy encompasses unit testing, integration testing, end-to-end (E2E) validation, and performance benchmarking to ensure extension reliability, maintainability, and optimal user experience.

## Table of Contents

1. [Testing Stack](#testing-stack)
2. [Test Structure](#test-structure)
3. [Running Tests](#running-tests)
4. [Writing Tests](#writing-tests)
5. [Test Coverage](#test-coverage)
6. [Performance Testing](#performance-testing)
7. [CI/CD Integration](#cicd-integration)
8. [Debugging Tests](#debugging-tests)
9. [Best Practices](#best-practices)

## Testing Stack

### Frameworks & Tools

- **Test Runner**: Bun Test (built-in, fast, and modern)
- **VSCode E2E**: @vscode/test-electron (for real VSCode environment testing)
- **Mocking**: Custom VSCode API mocks + Sinon for additional stubbing
- **Coverage**: Bun's built-in coverage with lcov reporter
- **CI/CD**: GitHub Actions with multi-platform testing

### Key Dependencies

```json
{
  "@vscode/test-electron": "^2.4.1",
  "sinon": "^19.0.2",
  "@types/sinon": "^17.0.3"
}
```

## Test Structure

```
src/test/
├── setup.ts                    # Global test setup
├── mocks/
│   ├── vscode.ts              # Complete VSCode API mocks
│   └── child-process.ts       # Mock child_process for command execution
├── fixtures/
│   └── button-configs.ts      # Sample test data and configurations
├── utils/
│   └── test-helpers.ts        # Common test utilities and assertions
├── unit/
│   ├── configuration.test.ts  # ConfigManager unit tests
│   ├── executor.test.ts       # CommandExecutor unit tests
│   ├── theme.test.ts          # ThemeManager unit tests
│   └── visibility.test.ts     # VisibilityManager unit tests
├── integration/
│   └── extension-lifecycle.test.ts  # Full extension integration tests
└── e2e/
    ├── index.ts               # E2E test runner
    └── extension.e2e.test.ts  # E2E tests in real VSCode
```

## Running Tests

### All Tests

```bash
bun test                  # Run all unit and integration tests
bun run test:all          # Run unit, integration, and E2E tests
```

### By Test Type

```bash
bun run test:unit         # Unit tests only
bun run test:integration  # Integration tests only
bun run test:e2e          # E2E tests in real VSCode
```

### Coverage

```bash
bun run test:coverage     # Generate coverage report
```

Coverage reports are generated in the `coverage/` directory:

- `coverage/lcov.info` - LCOV format for CI tools
- `coverage/html/` - HTML report for browser viewing

### Watch Mode

```bash
bun test --watch          # Re-run tests on file changes
```

### Filtering Tests

```bash
bun test --filter "ConfigManager"      # Run specific test suite
bun test --filter "performance"        # Run performance tests only
bun test src/test/unit/executor.test.ts  # Run specific file
```

## Writing Tests

### Unit Test Example

```typescript
import { describe, it, expect, beforeEach } from "bun:test";
import { ConfigManager } from "../../configuration";
import { createMockContext } from "../utils/test-helpers";
import { minimalButton } from "../fixtures/button-configs";

describe("ConfigManager", () => {
  let configManager: ConfigManager;

  beforeEach(() => {
    configManager = new ConfigManager();
  });

  it("should validate valid configuration", () => {
    const result = configManager.validateConfig({
      buttons: [minimalButton],
      history: true,
      autoDetect: true,
    });

    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });
});
```

### Integration Test Example

```typescript
import { describe, it, expect, beforeEach } from "bun:test";
import { StatusBarQuickActionsExtension } from "../../extension";
import { MockExtensionContext } from "../mocks/vscode";

describe("Extension Lifecycle", () => {
  let extension: StatusBarQuickActionsExtension;
  let mockContext: MockExtensionContext;

  beforeEach(() => {
    mockContext = new MockExtensionContext();
    extension = new StatusBarQuickActionsExtension(mockContext);
  });

  it("should activate in under 200ms", async () => {
    const startTime = Date.now();
    await extension.activate();
    const duration = Date.now() - startTime;

    expect(duration).toBeLessThan(200);
  });
});
```

### E2E Test Example

```typescript
import * as assert from "assert";
import * as vscode from "vscode";

suite("Extension E2E Tests", () => {
  test("Extension should activate", async () => {
    const extension = vscode.extensions.getExtension(
      "involvex.statusbar-quick-actions",
    );

    if (!extension.isActive) {
      await extension.activate();
    }

    assert.ok(extension.isActive, "Extension should be active");
  });
});
```

## Test Coverage

### Coverage Requirements

- **Minimum Overall Coverage**: 80%
- **Critical Modules**: 90%+ coverage
  - ConfigManager: 90%
  - CommandExecutor: 90%
  - Extension lifecycle: 85%

### Viewing Coverage

```bash
# Generate and view HTML coverage report
bun run test:coverage
open coverage/html/index.html  # macOS
start coverage/html/index.html # Windows
xdg-open coverage/html/index.html # Linux
```

### Coverage Badges

Coverage metrics are automatically uploaded to Codecov on CI:

- Badge URL: `https://codecov.io/gh/involvex/vscode-statusbar-quick-actions`

## Performance Testing

### Performance Benchmarks

Key performance metrics tested:

1. **Extension Activation**: < 200ms
2. **Configuration Loading**: < 50ms
3. **Button Creation** (50 buttons): < 500ms
4. **Visibility Check**: < 10ms (with debouncing)
5. **Command Execution**: Depends on command, measured accurately

### Running Performance Tests

```bash
bun test --filter "performance"
bun test --filter "should activate in under"
```

### Performance Test Example

```typescript
import { measureTime, PerformanceTester } from "../utils/test-helpers";

describe("Performance", () => {
  it("should activate in under 200ms", async () => {
    const { duration } = await measureTime(() => extension.activate());
    expect(duration).toBeLessThan(200);
  });

  it("should handle 50 buttons efficiently", async () => {
    const tester = new PerformanceTester();

    await tester.measure("button-creation", async () => {
      await extension.activate();
    });

    tester.assertPerformance("button-creation", 500);
  });
});
```

## CI/CD Integration

### GitHub Actions Workflow

Tests run automatically on:

- Push to `main` or `develop` branches
- Pull requests to `main` or `develop`

### Multi-Platform Testing

Tests execute on:

- **Operating Systems**: Ubuntu, Windows, macOS
- **Node Versions**: 18.x, 20.x

### Test Jobs

1. **Unit & Integration Tests**: All unit and integration tests with coverage
2. **E2E Tests**: Full extension tests in real VSCode
3. **Performance Tests**: Benchmark validation
4. **Security Audit**: Dependency and secret scanning
5. **Build Verification**: Extension packaging validation

### Viewing CI Results

Check the "Actions" tab in the GitHub repository for detailed test results, logs, and artifacts.

## Debugging Tests

### VS Code Debug Configuration

Add to `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug Tests",
      "type": "node",
      "request": "launch",
      "runtimeExecutable": "bun",
      "runtimeArgs": ["test", "--inspect-brk"],
      "cwd": "${workspaceFolder}",
      "console": "integratedTerminal"
    }
  ]
}
```

### Debug Specific Test

```bash
bun test --inspect-brk src/test/unit/configuration.test.ts
```

### Verbose Output

```bash
bun test --verbose
```

### Console Logging in Tests

```typescript
import { ConsoleCapture } from "../utils/test-helpers";

it("should log debug information", () => {
  const console = new ConsoleCapture();
  console.start();

  // Code that logs to console

  console.stop();
  const logs = console.getLogs();
  expect(logs).toContain("expected message");
});
```

## Best Practices

### General Guidelines

1. **Isolation**: Each test should be completely independent
2. **Descriptive Names**: Use clear, descriptive test names that explain what is being tested
3. **AAA Pattern**: Arrange, Act, Assert structure
4. **One Assertion**: Preferably one logical assertion per test
5. **Fast Tests**: Unit tests should complete in milliseconds

### Mocking Best Practices

```typescript
// DO: Use provided mock utilities
import { vscode } from "../mocks/vscode";

// DON'T: Create ad-hoc mocks
const myCustomVscodeMock = { ... };

// DO: Use test fixtures
import { minimalButton } from "../fixtures/button-configs";

// DON'T: Hardcode test data
const button = { id: "test", text: "Test", ... };
```

### Async Testing

```typescript
// DO: Use async/await
it("should execute command", async () => {
  const result = await executor.execute(command, options);
  expect(result.code).toBe(0);
});

// DON'T: Use callbacks or promises without await
it("should execute command", () => {
  executor.execute(command, options).then((result) => {
    expect(result.code).toBe(0);
  });
});
```

### Error Testing

```typescript
// DO: Use assertThrows helper
import { assertThrows } from "../utils/test-helpers";

it("should throw on invalid config", async () => {
  const error = await assertThrows(() =>
    configManager.addButtonConfig(invalidButton)
  );
  expect(error.message).toContain("already exists");
});

// DO: Test both success and failure cases
describe("addButtonConfig", () => {
  it("should add valid button", async () => { ... });
  it("should reject duplicate ID", async () => { ... });
  it("should reject invalid config", async () => { ... });
});
```

### Performance Testing

```typescript
// DO: Measure actual performance
const { duration } = await measureTime(() => operation());
expect(duration).toBeLessThan(maxDuration);

// DO: Test with realistic data volumes
const manyButtons = Array.from({ length: 50 }, (_, i) => ({
  ...minimalButton,
  id: `button-${i}`,
}));
```

### Test Organization

```typescript
describe("ConfigManager", () => {
  describe("Initialization", () => {
    it("should initialize without errors", () => { ... });
  });

  describe("Configuration Validation", () => {
    it("should validate valid config", () => { ... });
    it("should detect missing ID", () => { ... });
  });

  describe("Button Management", () => {
    it("should add button", () => { ... });
    it("should remove button", () => { ... });
  });
});
```

## Troubleshooting

### Common Issues

**Issue**: Tests fail with "Cannot find module 'vscode'"
**Solution**: Ensure mocks are properly imported: `import { vscode } from "../mocks/vscode"`

**Issue**: E2E tests timeout
**Solution**: Increase timeout or check for VSCode installation issues

**Issue**: Coverage not generated
**Solution**: Run with `bun test --coverage` explicitly

**Issue**: Tests pass locally but fail in CI
**Solution**: Check for hardcoded paths, timing issues, or platform-specific behavior

## Resources

- [Bun Test Documentation](https://bun.sh/docs/cli/test)
- [VSCode Extension Testing Guide](https://code.visualstudio.com/api/working-with-extensions/testing-extension)
- [Sinon Documentation](https://sinonjs.org/)

## Contributing

When contributing tests:

1. Follow existing patterns in `src/test/`
2. Maintain test coverage above 80%
3. Add tests for all new features
4. Update this documentation for new testing patterns
5. Run full test suite before submitting PR: `bun run test:all`

---

**Last Updated**: 2024-01-01
**Maintained By**: Development Team
