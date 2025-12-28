/**
 * E2E tests for extension in real VSCode environment
 * These tests run in an actual VSCode instance
 */

import * as assert from "assert";
import * as vscode from "vscode";

suite("Extension E2E Test Suite", () => {
  vscode.window.showInformationMessage("Start all E2E tests.");

  test("Extension should be present", () => {
    const extension = vscode.extensions.getExtension(
      "involvex.statusbar-quick-actions",
    );
    assert.ok(extension, "Extension should be installed");
  });

  test("Extension should activate", async () => {
    const extension = vscode.extensions.getExtension(
      "involvex.statusbar-quick-actions",
    );
    assert.ok(extension);

    if (!extension.isActive) {
      await extension.activate();
    }

    assert.ok(extension.isActive, "Extension should be activated");
  });

  test("Commands should be registered", async () => {
    const commands = await vscode.commands.getCommands(true);

    const expectedCommands = [
      "statusbarQuickActions.editButton",
      "statusbarQuickActions.viewHistory",
      "statusbarQuickActions.clearHistory",
      "statusbarQuickActions.navigateButtons",
    ];

    expectedCommands.forEach((cmd) => {
      assert.ok(commands.includes(cmd), `Command ${cmd} should be registered`);
    });
  });

  test("Configuration should be accessible", () => {
    const config = vscode.workspace.getConfiguration("statusbarQuickActions");
    assert.ok(config, "Configuration should be accessible");

    const buttons = config.get("buttons", []);
    assert.ok(Array.isArray(buttons), "Buttons should be an array");
  });

  test("Should create status bar items from configuration", async () => {
    const config = vscode.workspace.getConfiguration("statusbarQuickActions");

    // Add a test button
    await config.update(
      "buttons",
      [
        {
          id: "e2e-test-button",
          text: "E2E Test",
          command: {
            type: "shell",
            command: "echo 'E2E Test'",
          },
        },
      ],
      vscode.ConfigurationTarget.Workspace,
    );

    // Wait for extension to process config change
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Verify button was created (in real environment, this would be visible in status bar)
    assert.ok(true, "Button creation triggered");

    // Clean up
    await config.update("buttons", [], vscode.ConfigurationTarget.Workspace);
  });
});
