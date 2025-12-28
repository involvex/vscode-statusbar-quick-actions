import { exec } from "child_process";
import { promisify } from "util";
import * as fs from "fs/promises";
import * as path from "path";

// Promisify exec for better async/await handling
const execAsync = promisify(exec);

// Constants for configuration
const CHANGELOG_FILENAME = "CHANGELOG.md";
const GIT_COMMAND = "git log --pretty=oneline --abbrev-commit --name-only";

/**
 * Generates a changelog by running git log and saving to a markdown file
 * @param outputPath - Optional custom path for the changelog file
 * @returns Promise that resolves when changelog is written
 * @throws Error if git command fails or file write fails
 */
export async function generateChangelog(outputPath?: string): Promise<void> {
  const changelogPath = outputPath
    ? path.resolve(outputPath)
    : path.resolve(process.cwd(), CHANGELOG_FILENAME);

  try {
    console.log("🚀 Generating Changelog...\n");

    // Execute git command and capture output
    const { stdout, stderr } = await execAsync(GIT_COMMAND);

    // Check for git warnings/errors but continue if we got output
    if (stderr && !stdout.trim()) {
      throw new Error(`Git command failed: ${stderr}`);
    }

    if (!stdout.trim()) {
      throw new Error(
        "No git history found. Make sure you're in a git repository with commits.",
      );
    }

    // Add a header to the changelog
    const changelogContent = `# Changelog

\`\`\`
 Generated on: ${new Date().toISOString()}
\`\`\`

---

## ${stdout}`;

    // Write to file
    await fs.writeFile(changelogPath, changelogContent, "utf8");

    console.log(`✅ Changelog successfully written to: ${changelogPath}`);
    console.log(`📄 Generated ${stdout.split("\n").length} lines of changelog`);

    // Display git warnings if any
    if (stderr) {
      console.log(`⚠️  Git warnings: ${stderr}`);
    }
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes("git") || error.message.includes("ENOENT")) {
        console.error("❌ Git is not installed or not found in PATH");
      } else {
        console.error(`❌ Failed to generate changelog: ${error.message}`);
      }
    } else {
      console.error("❌ An unexpected error occurred");
    }
    throw error;
  }
}

// Export default for backwards compatibility
export default generateChangelog;

generateChangelog();
