# Test Directory

This directory contains the comprehensive test suite for the StatusBar Quick Actions extension.

## Directory Structure

```
test/
├── setup.ts                    # Global test configuration
├── mocks/                      # VSCode API and system mocks
│   ├── vscode.ts              # Complete VSCode API implementation
│   └── child-process.ts       # Mock child_process for command testing
├── fixtures/                   # Test data and sample configurations
│   └── button-configs.ts      # Button configuration fixtures
├── utils/                      # Test utilities and helpers
│   └── test-helpers.ts        # Common testing functions
├── unit/                       # Unit tests for individual modules
│   ├── configuration.test.ts  # ConfigManager tests
│   └── executor.test.ts       # CommandExecutor tests
├── integration/                # Integration tests
│   └── extension-lifecycle.test.ts  # Full extension tests
└── e2e/                        # End-to-end tests
    ├── index.ts               # E2E test runner
    └── extension.e2e.test.ts  # Real VSCode environment tests
```

## Running Tests

```bash
# All tests
bun test

# Specific test types
bun run test:unit         # Unit tests only
bun run test:integration  # Integration tests only
bun run test:e2e          # E2E tests in real VSCode

# With coverage
bun run test:coverage

# Watch mode
bun test --watch
```

## Writing Tests

### Import Mocks

```typescript
import { vscode } from "./mocks/vscode";
import { mockCommandRegistry } from "./mocks/child-process";
```

### Use Fixtures

```typescript
import { minimalButton, testExtensionConfig } from "./fixtures/button-configs";
```

### Use Test Helpers

```typescript
import {
  createMockContext,
  wait,
  assertThrows,
  measureTime,
} from "./utils/test-helpers";
```

## Test Examples

### Unit Test

```typescript
import { describe, it, expect } from "bun:test";
import { ConfigManager } from "../configuration";

describe("ConfigManager", () => {
  it("should validate configuration", () => {
    const manager = new ConfigManager();
    const result = manager.validateConfig(config);
    expect(result.isValid).toBe(true);
  });
});
```

### Integration Test

```typescript
import { describe, it, expect, beforeEach } from "bun:test";
import { StatusBarQuickActionsExtension } from "../extension";

describe("Extension", () => {
  let extension: StatusBarQuickActionsExtension;

  beforeEach(() => {
    extension = new StatusBarQuickActionsExtension(mockContext);
  });

  it("should activate quickly", async () => {
    const start = Date.now();
    await extension.activate();
    expect(Date.now() - start).toBeLessThan(200);
  });
});
```

## Documentation

See [TESTING.md](../../TESTING.md) for comprehensive testing guide.
See [TEST_PLAN.md](../../TEST_PLAN.md) for complete test strategy.
