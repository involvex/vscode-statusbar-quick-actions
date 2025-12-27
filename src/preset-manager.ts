/**
 * Preset Management for StatusBar Quick Actions
 * Handles preset storage, CRUD operations, and application
 */

import * as vscode from "vscode";
import * as fs from "fs";
import { PresetConfig, PresetApplicationMode, ExtensionConfig } from "./types";

/**
 * Preset Manager
 * Manages configuration presets for quick button setup
 */
export class PresetManager {
  private static readonly PRESET_STORAGE_KEY = "statusbarQuickActions.presets";
  private context: vscode.ExtensionContext | null = null;

  /**
   * Initialize the preset manager
   */
  public initialize(context: vscode.ExtensionContext): void {
    this.context = context;
  }

  /**
   * Get all presets
   */
  public getAllPresets(): PresetConfig[] {
    if (!this.context) {
      console.error("PresetManager not initialized");
      return [];
    }

    try {
      const presetsJson = this.context.globalState.get<string>(
        PresetManager.PRESET_STORAGE_KEY,
        "[]",
      );
      const presets = JSON.parse(presetsJson) as PresetConfig[];

      // Convert date strings back to Date objects
      return presets.map((preset) => ({
        ...preset,
        metadata: preset.metadata
          ? {
              ...preset.metadata,
              created: new Date(preset.metadata.created),
              modified: new Date(preset.metadata.modified),
            }
          : undefined,
      }));
    } catch (error) {
      console.error("Failed to load presets:", error);
      return [];
    }
  }

  /**
   * Get a preset by ID
   */
  public getPreset(presetId: string): PresetConfig | null {
    const presets = this.getAllPresets();
    return presets.find((p) => p.id === presetId) || null;
  }

  /**
   * Save a preset
   */
  public async savePreset(preset: PresetConfig): Promise<void> {
    if (!this.context) {
      throw new Error("PresetManager not initialized");
    }

    try {
      const presets = this.getAllPresets();
      const existingIndex = presets.findIndex((p) => p.id === preset.id);

      const now = new Date();
      const presetWithMetadata: PresetConfig = {
        ...preset,
        metadata: {
          created: preset.metadata?.created || now,
          modified: now,
          author: preset.metadata?.author,
          tags: preset.metadata?.tags,
        },
      };

      if (existingIndex >= 0) {
        // Update existing preset
        presets[existingIndex] = presetWithMetadata;
      } else {
        // Add new preset
        presets.push(presetWithMetadata);
      }

      await this.context.globalState.update(
        PresetManager.PRESET_STORAGE_KEY,
        JSON.stringify(presets, null, 2),
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to save preset: ${errorMessage}`);
    }
  }

  /**
   * Delete a preset
   */
  public async deletePreset(presetId: string): Promise<void> {
    if (!this.context) {
      throw new Error("PresetManager not initialized");
    }

    try {
      const presets = this.getAllPresets();
      const filteredPresets = presets.filter((p) => p.id !== presetId);

      if (filteredPresets.length === presets.length) {
        throw new Error(`Preset with ID '${presetId}' not found`);
      }

      await this.context.globalState.update(
        PresetManager.PRESET_STORAGE_KEY,
        JSON.stringify(filteredPresets, null, 2),
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to delete preset: ${errorMessage}`);
    }
  }

  /**
   * Create a preset from current configuration
   */
  public async createPresetFromConfig(
    name: string,
    description: string,
    currentConfig: ExtensionConfig,
    tags?: string[],
  ): Promise<PresetConfig> {
    const preset: PresetConfig = {
      id: `preset_${Date.now()}`,
      name,
      description,
      buttons: currentConfig.buttons,
      theme: currentConfig.theme,
      metadata: {
        created: new Date(),
        modified: new Date(),
        tags,
      },
    };

    await this.savePreset(preset);
    return preset;
  }

  /**
   * Apply a preset to current configuration
   */
  public applyPreset(
    preset: PresetConfig,
    currentConfig: ExtensionConfig,
    mode: PresetApplicationMode = "replace",
  ): ExtensionConfig {
    let newConfig: ExtensionConfig;

    switch (mode) {
      case "replace":
        // Replace all buttons with preset buttons
        newConfig = {
          ...currentConfig,
          buttons: [...preset.buttons],
        };
        break;

      case "merge": {
        // Merge preset buttons, overwriting buttons with same ID
        const mergedButtons = [...currentConfig.buttons];
        preset.buttons.forEach((presetButton) => {
          const existingIndex = mergedButtons.findIndex(
            (b) => b.id === presetButton.id,
          );
          if (existingIndex >= 0) {
            mergedButtons[existingIndex] = presetButton;
          } else {
            mergedButtons.push(presetButton);
          }
        });
        newConfig = {
          ...currentConfig,
          buttons: mergedButtons,
        };
        break;
      }

      case "append": {
        // Append preset buttons to existing buttons
        const appendedButtons = [...currentConfig.buttons, ...preset.buttons];
        newConfig = {
          ...currentConfig,
          buttons: appendedButtons,
        };
        break;
      }

      default:
        throw new Error(`Unknown preset application mode: ${mode}`);
    }

    // Apply theme if present in preset
    if (preset.theme) {
      newConfig.theme = preset.theme;
    }

    return newConfig;
  }

  /**
   * Export preset to JSON file
   */
  public async exportPreset(preset: PresetConfig): Promise<void> {
    const uri = await vscode.window.showSaveDialog({
      filters: { JSON: ["json"] },
      defaultUri: vscode.Uri.file(`${preset.name}.preset.json`),
    });

    if (!uri) {
      return;
    }

    try {
      fs.writeFileSync(uri.fsPath, JSON.stringify(preset, null, 2));
      vscode.window.showInformationMessage(
        `✅ Preset "${preset.name}" exported to ${uri.fsPath}`,
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to export preset: ${errorMessage}`);
    }
  }

  /**
   * Import preset from JSON file
   */
  public async importPreset(): Promise<PresetConfig | null> {
    const uri = await vscode.window.showOpenDialog({
      filters: { JSON: ["json"] },
      canSelectMany: false,
    });

    if (!uri || uri.length === 0) {
      return null;
    }

    try {
      const content = fs.readFileSync(uri[0].fsPath, "utf8");
      const preset = JSON.parse(content) as PresetConfig;

      // Validate preset structure
      if (!preset.id || !preset.name || !preset.buttons) {
        throw new Error(
          "Invalid preset file: missing required fields (id, name, buttons)",
        );
      }

      // Generate new ID to avoid conflicts
      preset.id = `preset_${Date.now()}`;
      preset.metadata = {
        created: new Date(),
        modified: new Date(),
        author: preset.metadata?.author,
        tags: preset.metadata?.tags,
      };

      await this.savePreset(preset);
      vscode.window.showInformationMessage(
        `✅ Preset "${preset.name}" imported successfully`,
      );

      return preset;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      vscode.window.showErrorMessage(
        `Failed to import preset: ${errorMessage}`,
      );
      return null;
    }
  }

  /**
   * Duplicate a preset
   */
  public async duplicatePreset(presetId: string): Promise<PresetConfig | null> {
    const original = this.getPreset(presetId);
    if (!original) {
      throw new Error(`Preset with ID '${presetId}' not found`);
    }

    const duplicate: PresetConfig = {
      ...original,
      id: `preset_${Date.now()}`,
      name: `${original.name} (Copy)`,
      metadata: {
        created: new Date(),
        modified: new Date(),
        author: original.metadata?.author,
        tags: original.metadata?.tags,
      },
    };

    await this.savePreset(duplicate);
    return duplicate;
  }

  /**
   * Search presets by name or tags
   */
  public searchPresets(query: string): PresetConfig[] {
    const presets = this.getAllPresets();
    const lowerQuery = query.toLowerCase();

    return presets.filter(
      (preset) =>
        preset.name.toLowerCase().includes(lowerQuery) ||
        preset.description?.toLowerCase().includes(lowerQuery) ||
        preset.metadata?.tags?.some((tag) =>
          tag.toLowerCase().includes(lowerQuery),
        ),
    );
  }

  /**
   * Get preset count
   */
  public getPresetCount(): number {
    return this.getAllPresets().length;
  }

  /**
   * Clear all presets (with confirmation)
   */
  public async clearAllPresets(): Promise<void> {
    if (!this.context) {
      throw new Error("PresetManager not initialized");
    }

    await this.context.globalState.update(
      PresetManager.PRESET_STORAGE_KEY,
      "[]",
    );
  }

  /**
   * Validate preset configuration
   */
  public validatePreset(preset: PresetConfig): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!preset.id || typeof preset.id !== "string") {
      errors.push("Preset ID is required and must be a string");
    }

    if (!preset.name || typeof preset.name !== "string") {
      errors.push("Preset name is required and must be a string");
    }

    if (!Array.isArray(preset.buttons)) {
      errors.push("Preset buttons must be an array");
    } else {
      preset.buttons.forEach((button, index) => {
        if (!button.id || typeof button.id !== "string") {
          errors.push(`Button ${index}: ID is required and must be a string`);
        }
        if (!button.text && !button.icon) {
          errors.push(`Button ${index}: Either text or icon is required`);
        }
        if (!button.command || typeof button.command !== "object") {
          errors.push(
            `Button ${index}: Command is required and must be an object`,
          );
        }
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Dispose of resources
   */
  public dispose(): void {
    // Cleanup if needed
  }
}
