/**
 * E2E Test Runner for VSCode Extension
 * Uses @vscode/test-electron to run tests in actual VSCode environment
 */

import * as path from "path";
import { runTests } from "@vscode/test-electron";

async function main() {
  try {
    // The folder containing the Extension Manifest package.json
    const extensionDevelopmentPath = path.resolve(__dirname, "../../");

    // The path to the extension test runner script
    const extensionTestsPath = path.resolve(__dirname, "./e2e/index");

    // Download VSCode, unzip it and run the integration test
    await runTests({
      extensionDevelopmentPath,
      extensionTestsPath,
      launchArgs: [
        "--disable-extensions", // Disable other extensions
        "--disable-gpu", // Disable GPU for better CI performance
      ],
    });
  } catch (err) {
    console.error("Failed to run tests:", err);
    process.exit(1);
  }
}

main();
