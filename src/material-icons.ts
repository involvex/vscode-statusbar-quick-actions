/**
 * Material Design Icons to VSCode Codicons mapping manager
 */

import { IconConfig } from "./types";

/**
 * Manages Material Design Icons mapping to VSCode Codicons
 */
export class MaterialIconManager {
  private iconMapping: Map<string, string>;

  constructor() {
    this.iconMapping = this.buildIconMapping();
  }

  /**
   * Resolve icon configuration to a VSCode icon ID
   */
  public resolveIcon(config: IconConfig): string {
    if (!config.library || config.library === "vscode") {
      // VSCode Codicons - use as is
      return config.id;
    }

    // Material Design Icons - resolve to Codicon equivalent
    const resolvedIcon = this.getMaterialIcon(config.id, config.variant);
    if (resolvedIcon) {
      return resolvedIcon;
    }

    // Fallback chain: try base icon name without variant → generic icon → original ID
    const baseIcon = this.iconMapping.get(config.id);
    return baseIcon || config.id;
  }

  /**
   * Get Material icon with variant support
   */
  public getMaterialIcon(name: string, variant?: string): string | null {
    // Try to find icon with variant first
    if (variant) {
      const variantKey = `${name}:${variant}`;
      if (this.iconMapping.has(variantKey)) {
        return this.iconMapping.get(variantKey)!;
      }
    }

    // Fall back to base icon name
    return this.iconMapping.get(name) || null;
  }

  /**
   * Check if a Material icon is valid and mapped
   */
  public isValidMaterialIcon(name: string): boolean {
    return this.iconMapping.has(name);
  }

  /**
   * Get all available Material icon names
   */
  public getAvailableIcons(): string[] {
    return Array.from(this.iconMapping.keys());
  }

  /**
   * Get suggested icon based on keyword
   */
  public suggestIcon(keyword: string): string[] {
    const lowerKeyword = keyword.toLowerCase();
    return this.getAvailableIcons().filter((icon) =>
      icon.toLowerCase().includes(lowerKeyword),
    );
  }

  /**
   * Build the icon mapping dictionary
   * Maps Material Design Icon names to VSCode Codicon equivalents
   */
  private buildIconMapping(): Map<string, string> {
    return new Map([
      // Actions & Controls
      ["play_arrow", "play"],
      ["play_circle", "play-circle"],
      ["pause", "debug-pause"],
      ["pause_circle", "debug-pause"],
      ["stop", "debug-stop"],
      ["stop_circle", "stop-circle"],
      ["refresh", "refresh"],
      ["sync", "sync"],
      ["cached", "refresh"],
      ["replay", "debug-restart"],
      ["undo", "discard"],
      ["redo", "redo"],
      ["save", "save"],
      ["save_alt", "save-all"],
      ["delete", "trash"],
      ["delete_forever", "trash"],
      ["delete_outline", "trash"],
      ["add", "add"],
      ["add_circle", "add"],
      ["add_circle_outline", "add"],
      ["remove", "remove"],
      ["remove_circle", "remove"],
      ["remove_circle_outline", "remove"],
      ["close", "close"],
      ["cancel", "close"],
      ["check", "check"],
      ["check_circle", "pass"],
      ["check_circle_outline", "pass-filled"],
      ["done", "check"],
      ["done_all", "check-all"],
      ["clear", "clear-all"],

      // Files & Folders
      ["folder", "folder"],
      ["folder_open", "folder-opened"],
      ["folder_outlined", "folder"],
      ["create_new_folder", "new-folder"],
      ["file", "file"],
      ["insert_drive_file", "file-text"],
      ["description", "file-code"],
      ["article", "file-text"],
      ["note", "note"],
      ["draft", "edit"],
      ["upload_file", "cloud-upload"],
      ["download", "cloud-download"],
      ["attachment", "link"],

      // Git & Version Control
      ["git", "git-commit"],
      ["source", "source-control"],
      ["commit", "git-commit"],
      ["merge", "git-merge"],
      ["pull_request", "git-pull-request"],
      ["branch", "git-branch"],
      ["fork", "repo-forked"],
      ["compare_arrows", "git-compare"],

      // Development & Code
      ["code", "code"],
      ["terminal", "terminal"],
      ["console", "debug-console"],
      ["bug_report", "bug"],
      ["build", "tools"],
      ["settings", "gear"],
      ["settings_applications", "settings-gear"],
      ["tune", "settings"],
      ["construction", "tools"],
      ["extension", "extensions"],
      ["api", "symbol-interface"],
      ["functions", "symbol-method"],
      ["data_object", "json"],
      ["schema", "symbol-structure"],
      ["database", "database"],
      ["storage", "database"],
      ["table_chart", "table"],

      // Navigation & UI
      ["home", "home"],
      ["arrow_back", "arrow-left"],
      ["arrow_forward", "arrow-right"],
      ["arrow_upward", "arrow-up"],
      ["arrow_downward", "arrow-down"],
      ["expand_more", "chevron-down"],
      ["expand_less", "chevron-up"],
      ["chevron_right", "chevron-right"],
      ["chevron_left", "chevron-left"],
      ["menu", "menu"],
      ["more_vert", "kebab-vertical"],
      ["more_horiz", "ellipsis"],
      ["apps", "apps"],
      ["dashboard", "dashboard"],
      ["view_module", "layout"],
      ["view_list", "list-unordered"],
      ["view_compact", "list-tree"],
      ["grid_view", "gripper"],

      // Search & Filter
      ["search", "search"],
      ["filter_list", "filter"],
      ["filter_alt", "filter-filled"],
      ["sort", "symbol-namespace"],
      ["find_in_page", "search"],
      ["find_replace", "find-replace"],
      ["zoom_in", "zoom-in"],
      ["zoom_out", "zoom-out"],

      // Status & Indicators
      ["error", "error"],
      ["error_outline", "error"],
      ["warning", "warning"],
      ["warning_amber", "warning"],
      ["info", "info"],
      ["info_outline", "info"],
      ["help", "question"],
      ["help_outline", "question"],
      ["priority_high", "warning"],
      ["report_problem", "warning"],
      ["verified", "verified"],
      ["verified_user", "verified-filled"],
      ["check_circle", "pass"],
      ["check_circle_outline", "pass-filled"],
      ["cancel", "error"],
      ["unpublished", "circle-slash"],
      ["block", "circle-slash"],
      ["do_not_disturb", "circle-slash"],

      // Communication
      ["mail", "mail"],
      ["email", "mail"],
      ["send", "mail"],
      ["inbox", "inbox"],
      ["chat", "comment"],
      ["comment", "comment-discussion"],
      ["message", "comment"],
      ["notification", "bell"],
      ["notifications", "bell"],
      ["notifications_active", "bell-dot"],

      // Media & Player
      ["play", "play"],
      ["pause", "debug-pause"],
      ["stop", "debug-stop"],
      ["skip_next", "debug-step-over"],
      ["skip_previous", "debug-step-back"],
      ["fast_forward", "run-all"],
      ["fast_rewind", "debug-reverse-continue"],
      ["volume_up", "unmute"],
      ["volume_off", "mute"],
      ["mic", "mic"],
      ["mic_off", "mic-filled"],
      ["videocam", "device-camera-video"],
      ["image", "file-media"],
      ["photo", "file-media"],

      // Editing & Format
      ["edit", "edit"],
      ["create", "edit"],
      ["mode_edit", "edit"],
      ["content_copy", "copy"],
      ["content_cut", "scissors"],
      ["content_paste", "clippy"],
      ["format_bold", "bold"],
      ["format_italic", "italic"],
      ["format_underlined", "underline"],
      ["format_list_bulleted", "list-unordered"],
      ["format_list_numbered", "list-ordered"],
      ["format_quote", "quote"],
      ["text_format", "text-size"],

      // Time & Calendar
      ["access_time", "watch"],
      ["schedule", "watch"],
      ["today", "calendar"],
      ["event", "calendar"],
      ["date_range", "calendar"],
      ["history", "history"],
      ["update", "sync"],
      ["timer", "watch"],

      // Security & Access
      ["lock", "lock"],
      ["lock_open", "unlock"],
      ["security", "shield"],
      ["verified_user", "shield"],
      ["admin_panel_settings", "settings-gear"],
      ["key", "key"],
      ["vpn_key", "key"],
      ["password", "key"],
      ["visibility", "eye"],
      ["visibility_off", "eye-closed"],

      // People & Account
      ["person", "person"],
      ["account_circle", "account"],
      ["group", "organization"],
      ["people", "organization"],
      ["contacts", "organization"],
      ["badge", "pass"],
      ["supervisor_account", "organization"],

      // Location & Navigation
      ["location_on", "location"],
      ["place", "location"],
      ["map", "location"],
      ["navigation", "location"],
      ["explore", "compass"],
      ["public", "globe"],
      ["language", "globe"],

      // Device & Hardware
      ["computer", "device-desktop"],
      ["laptop", "device-desktop"],
      ["phone", "device-mobile"],
      ["tablet", "device-mobile"],
      ["watch", "watch"],
      ["tv", "device-desktop"],
      ["keyboard", "terminal"],
      ["mouse", "terminal"],

      // File Types & Extensions
      ["javascript", "symbol-method"],
      ["typescript", "symbol-method"],
      ["python", "file-code"],
      ["java", "file-code"],
      ["html", "file-code"],
      ["css", "symbol-color"],
      ["json", "json"],
      ["xml", "file-code"],
      ["markdown", "markdown"],
      ["yaml", "file-code"],

      // Cloud & Network
      ["cloud", "cloud"],
      ["cloud_upload", "cloud-upload"],
      ["cloud_download", "cloud-download"],
      ["cloud_done", "cloud"],
      ["cloud_off", "cloud"],
      ["wifi", "radio-tower"],
      ["wifi_off", "radio-tower"],
      ["signal", "radio-tower"],
      ["network_check", "radio-tower"],

      // Misc Icons
      ["star", "star-full"],
      ["star_outline", "star-empty"],
      ["star_half", "star-half"],
      ["favorite", "heart"],
      ["favorite_outline", "heart"],
      ["bookmark", "bookmark"],
      ["bookmark_outline", "bookmark"],
      ["label", "tag"],
      ["local_offer", "tag"],
      ["sell", "tag"],
      ["shopping_cart", "symbol-event"],
      ["lightbulb", "lightbulb"],
      ["lightbulb_outline", "lightbulb"],
      ["flash_on", "zap"],
      ["power", "circle-filled"],
      ["power_settings_new", "circle-filled"],
    ]);
  }

  /**
   * Get icon size CSS class (for future use with custom styling)
   */
  public getIconSizeClass(size?: "small" | "medium" | "large"): string {
    switch (size) {
      case "small":
        return "icon-small";
      case "large":
        return "icon-large";
      case "medium":
      default:
        return "icon-medium";
    }
  }

  /**
   * Get recommended icon for common actions
   */
  public getRecommendedIcon(action: string): string {
    const recommendations: Record<string, string> = {
      build: "tools",
      test: "beaker",
      deploy: "rocket",
      debug: "bug",
      run: "play",
      start: "play",
      stop: "debug-stop",
      restart: "debug-restart",
      install: "cloud-download",
      update: "sync",
      clean: "trash",
      format: "text-size",
      lint: "checklist",
      commit: "git-commit",
      push: "cloud-upload",
      pull: "cloud-download",
      branch: "git-branch",
      merge: "git-merge",
    };

    return recommendations[action.toLowerCase()] || "gear";
  }
}
