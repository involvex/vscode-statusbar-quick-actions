/**
 * Theme management for StatusBar Quick Actions
 */

import * as vscode from "vscode";
import { ThemeConfig } from "./types";

export class ThemeManager {
  private context: vscode.ExtensionContext | null = null;
  private currentTheme: ThemeConfig | null = null;

  /**
   * Initialize the theme manager
   */
  public async initialize(context: vscode.ExtensionContext): Promise<void> {
    this.context = context;
    await this.loadTheme();
    this.setupThemeWatching();
  }

  /**
   * Load theme from configuration
   */
  private async loadTheme(): Promise<void> {
    try {
      const config = vscode.workspace.getConfiguration(
        "statusbarQuickActions.settings",
      );
      const themeConfig = config.get<ThemeConfig>("theme");

      if (themeConfig) {
        this.currentTheme = themeConfig as ThemeConfig;
      } else {
        // Use default theme if not configured
        this.currentTheme = this.getDefaultTheme();
      }
    } catch (error) {
      console.error("Error loading theme:", error);
      this.currentTheme = this.getDefaultTheme();
    }
  }

  /**
   * Apply theme to a statusbar item
   */
  public applyThemeToStatusBarItem(item: vscode.StatusBarItem): void {
    if (!this.currentTheme) {
      return;
    }

    try {
      const colors = this.getCurrentThemeColors();
      if (colors.foreground) {
        item.color = new vscode.ThemeColor(colors.foreground);
      }
      if (colors.background) {
        item.backgroundColor = new vscode.ThemeColor(colors.background);
      }
    } catch (error) {
      console.error("Error applying theme to statusbar item:", error);
    }
  }

  /**
   * Get current theme colors
   */
  public getCurrentThemeColors(): { foreground?: string; background?: string } {
    if (!this.currentTheme) {
      return {};
    }

    try {
      const themeType = this.getCurrentThemeType();
      const theme = this.currentTheme[themeType];
      if (!theme || typeof theme !== "object") {
        return {};
      }

      return {
        foreground: theme.button?.foreground,
        background: theme.button?.background,
      };
    } catch (error) {
      console.error("Error getting current theme colors:", error);
      return {};
    }
  }

  /**
   * Get current theme type (dark/light/highContrast)
   */
  private getCurrentThemeType(): "dark" | "light" | "highContrast" {
    if (!this.currentTheme) {
      return "dark";
    }

    const mode = this.currentTheme.mode;
    if (mode === "auto") {
      // Detect from VSCode theme
      const colorTheme = vscode.workspace
        .getConfiguration()
        .get("workbench.colorTheme");
      const isDark =
        colorTheme?.toString().toLowerCase().includes("dark") ||
        colorTheme?.toString().toLowerCase().includes("black") ||
        colorTheme?.toString().toLowerCase().includes("dimmed");

      // Check for high contrast
      const isHighContrast =
        vscode.workspace
          .getConfiguration()
          .get("accessibility.verbosityNotifications") === "verbose";

      return isHighContrast ? "highContrast" : isDark ? "dark" : "light";
    } else if (mode === "highContrast") {
      return "highContrast";
    } else if (mode === "dark") {
      return "dark";
    } else {
      return "light";
    }
  }

  /**
   * Set up theme change watching
   */
  private setupThemeWatching(): void {
    if (!this.context) {
      return;
    }

    // Watch for theme changes
    const disposable = vscode.workspace.onDidChangeConfiguration((event) => {
      if (
        event.affectsConfiguration("workbench.colorTheme") ||
        event.affectsConfiguration("accessibility")
      ) {
        this.updateTheme();
      }
    });

    this.context.subscriptions.push(disposable);
  }

  /**
   * Update current theme
   */
  private updateTheme(): void {
    // Reload theme from configuration
    this.loadTheme();
  }

  /**
   * Get theme for executing state
   */
  public getExecutingThemeColors(): {
    foreground?: string;
    background?: string;
  } {
    if (!this.currentTheme) {
      return {};
    }

    try {
      const themeType = this.getCurrentThemeType();
      const theme = this.currentTheme[themeType];
      if (!theme || typeof theme !== "object") {
        return {};
      }

      return {
        foreground: theme.executing?.foreground,
        background: theme.executing?.background,
      };
    } catch (error) {
      console.error("Error getting executing theme colors:", error);
      return {};
    }
  }

  /**
   * Get theme for error state
   */
  public getErrorThemeColors(): { foreground?: string; background?: string } {
    if (!this.currentTheme) {
      return {};
    }

    try {
      const themeType = this.getCurrentThemeType();
      const theme = this.currentTheme[themeType];
      if (!theme || typeof theme !== "object") {
        return {};
      }

      return {
        foreground: theme.error?.foreground,
        background: theme.error?.background,
      };
    } catch (error) {
      console.error("Error getting error theme colors:", error);
      return {};
    }
  }

  /**
   * Export theme configuration
   */
  public exportTheme(): ThemeConfig | null {
    return this.currentTheme;
  }

  /**
   * Import theme configuration
   */
  public async importTheme(theme: ThemeConfig): Promise<void> {
    this.currentTheme = theme;
    // Trigger theme update
    this.updateTheme();
  }

  /**
   * Reset to default theme
   */
  public async resetToDefault(): Promise<void> {
    this.currentTheme = this.getDefaultTheme();
    this.updateTheme();
  }

  /**
   * Get default theme configuration
   */
  private getDefaultTheme(): ThemeConfig {
    return {
      mode: "auto",
      dark: {
        button: {
          foreground: "#ffffff",
          background: "#6c757d",
        },
        executing: {
          foreground: "#ffffff",
          background: "#007acc",
        },
        error: {
          foreground: "#ffffff",
          background: "#dc3545",
        },
      },
      light: {
        button: {
          foreground: "#ffffff",
          background: "#6c757d",
        },
        executing: {
          foreground: "#ffffff",
          background: "#007acc",
        },
        error: {
          foreground: "#ffffff",
          background: "#dc3545",
        },
      },
      highContrast: {
        button: {
          foreground: "#ffffff",
          background: "#000000",
        },
        executing: {
          foreground: "#000000",
          background: "#ffff00",
        },
        error: {
          foreground: "#ffffff",
          background: "#ff0000",
        },
      },
    };
  }

  /**
   * Check if high contrast mode is enabled
   */
  public isHighContrastMode(): boolean {
    return this.getCurrentThemeType() === "highContrast";
  }

  /**
   * Get recommended color scheme for accessibility
   */
  public getAccessibilityColors(): { foreground: string; background: string } {
    const themeType = this.getCurrentThemeType();

    if (themeType === "highContrast") {
      return {
        foreground: "#ffffff",
        background: "#000000",
      };
    } else if (themeType === "dark") {
      return {
        foreground: "#ffffff",
        background: "#333333",
      };
    } else {
      return {
        foreground: "#000000",
        background: "#cccccc",
      };
    }
  }

  /**
   * Dispose of resources
   */
  public dispose(): void {
    this.context = null;
  }
}
