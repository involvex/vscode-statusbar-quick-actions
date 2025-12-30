/**
 * Comprehensive VSCode API Mocks
 * Provides mock implementations for all VSCode APIs used by the extension
 */

import { EventEmitter } from "events";

/**
 * Mock StatusBarItem
 */
export class MockStatusBarItem {
  public text = "";
  public tooltip: string | undefined = "";
  public command: string | undefined;
  public alignment = 1;
  public priority = 0;
  public accessibilityInformation: { label: string; role?: string } | undefined;
  private _isShown = false;
  private _isDisposed = false;

  show(): void {
    this._isShown = true;
  }

  hide(): void {
    this._isShown = false;
  }

  dispose(): void {
    this._isDisposed = true;
    this._isShown = false;
  }

  isShown(): boolean {
    return this._isShown;
  }

  isDisposed(): boolean {
    return this._isDisposed;
  }
}

/**
 * Mock ExtensionContext
 */
export class MockExtensionContext {
  public subscriptions: { dispose: () => void }[] = [];
  public workspaceState: MockMemento;
  public globalState: MockMemento;
  public extensionPath = "/mock/extension/path";
  public storagePath = "/mock/storage/path";
  public globalStoragePath = "/mock/global/storage/path";
  public logPath = "/mock/log/path";
  public extensionUri: any;
  public environmentVariableCollection: any;
  public extensionMode = 1;
  public storageUri: any;
  public globalStorageUri: any;
  public logUri: any;
  public secrets: any;
  public extension: any;
  public languageModelAccessInformation: any = {
    onDidChange: () => ({ dispose: () => {} }),
    canSendRequest: () => undefined,
  };

  constructor() {
    this.workspaceState = new MockMemento();
    this.globalState = new MockMemento();
  }

  public asAbsolutePath(relativePath: string): string {
    return `/mock/extension/path/${relativePath}`;
  }

  dispose(): void {
    this.subscriptions.forEach((sub) => sub.dispose());
    this.subscriptions = [];
  }
}

/**
 * Mock Memento (for workspace/global state)
 */
export class MockMemento {
  private storage = new Map<string, any>();

  get<T>(key: string): T | undefined;
  get<T>(key: string, defaultValue: T): T;
  get<T>(key: string, defaultValue?: T): T | undefined {
    return this.storage.has(key) ? this.storage.get(key) : defaultValue;
  }

  async update(key: string, value: any): Promise<void> {
    this.storage.set(key, value);
  }

  keys(): readonly string[] {
    return Array.from(this.storage.keys());
  }

  clear(): void {
    this.storage.clear();
  }

  setKeysForSync(_keys: readonly string[]): void {
    // Mock implementation - no-op
  }
}

/**
 * Mock OutputChannel
 */
export class MockOutputChannel {
  public name: string;
  private _output: string[] = [];

  constructor(name: string) {
    this.name = name;
  }

  append(value: string): void {
    this._output.push(value);
  }

  appendLine(value: string): void {
    this._output.push(value + "\n");
  }

  clear(): void {
    this._output = [];
  }

  show(_preserveFocus?: boolean): void {
    // Mock implementation
  }

  hide(): void {
    // Mock implementation
  }

  dispose(): void {
    this._output = [];
  }

  getOutput(): string {
    return this._output.join("");
  }
}

/**
 * Mock Uri
 */
export class MockUri {
  public scheme: string;
  public authority: string;
  public path: string;
  public query: string;
  public fragment: string;
  public fsPath: string;

  constructor(
    scheme: string,
    authority: string,
    path: string,
    query: string,
    fragment: string,
  ) {
    this.scheme = scheme;
    this.authority = authority;
    this.path = path;
    this.query = query;
    this.fragment = fragment;
    this.fsPath = path;
  }

  static file(path: string): MockUri {
    return new MockUri("file", "", path, "", "");
  }

  static parse(value: string): MockUri {
    return new MockUri("file", "", value, "", "");
  }

  with(change: {
    scheme?: string;
    authority?: string;
    path?: string;
    query?: string;
    fragment?: string;
  }): MockUri {
    return new MockUri(
      change.scheme ?? this.scheme,
      change.authority ?? this.authority,
      change.path ?? this.path,
      change.query ?? this.query,
      change.fragment ?? this.fragment,
    );
  }

  toString(): string {
    return `${this.scheme}://${this.authority}${this.path}`;
  }
}

/**
 * Mock WorkspaceFolder
 */
export class MockWorkspaceFolder {
  public uri: MockUri;
  public name: string;
  public index: number;

  constructor(name: string, uri: MockUri, index = 0) {
    this.name = name;
    this.uri = uri;
    this.index = index;
  }
}

/**
 * Mock TextEditor
 */
export class MockTextEditor {
  public document: MockTextDocument;
  public selection: any;
  public selections: any[] = [];
  public visibleRanges: any[] = [];
  public options: any = {};
  public viewColumn: number | undefined;

  constructor(document: MockTextDocument) {
    this.document = document;
  }
}

/**
 * Mock TextDocument
 */
export class MockTextDocument {
  public uri: MockUri;
  public fileName: string;
  public isUntitled = false;
  public languageId: string;
  public version = 1;
  public isDirty = false;
  public isClosed = false;
  private _content = "";
  public lineCount = 1;

  constructor(uri: MockUri, languageId = "typescript") {
    this.uri = uri;
    this.fileName = uri.fsPath;
    this.languageId = languageId;
  }

  save(): Promise<boolean> {
    return Promise.resolve(true);
  }

  getText(): string {
    return this._content;
  }

  setText(content: string): void {
    this._content = content;
    this.lineCount = content.split("\n").length;
  }
}

/**
 * Mock Configuration
 */
export class MockWorkspaceConfiguration {
  private config = new Map<string, any>();

  get<T>(section: string): T | undefined;
  get<T>(section: string, defaultValue: T): T;
  get<T>(section: string, defaultValue?: T): T | undefined {
    return this.config.has(section) ? this.config.get(section) : defaultValue;
  }

  has(section: string): boolean {
    return this.config.has(section);
  }

  inspect<T>(section: string):
    | {
        key: string;
        defaultValue?: T;
        globalValue?: T;
        workspaceValue?: T;
        workspaceFolderValue?: T;
      }
    | undefined {
    return {
      key: section,
      globalValue: this.config.get(section),
    };
  }

  async update(
    section: string,
    value: any,
    _configurationTarget?: boolean | number,
  ): Promise<void> {
    this.config.set(section, value);
  }

  setConfig(section: string, value: any): void {
    this.config.set(section, value);
  }

  clear(): void {
    this.config.clear();
  }
}

/**
 * Mock VSCode namespace
 */
export const vscode = {
  StatusBarAlignment: {
    Left: 1,
    Right: 2,
  },

  ConfigurationTarget: {
    Global: 1,
    Workspace: 2,
    WorkspaceFolder: 3,
  },

  ProgressLocation: {
    SourceControl: 1,
    Window: 10,
    Notification: 15,
  },

  QuickPickItemKind: {
    Separator: -1,
    Default: 0,
  },

  Uri: MockUri,

  window: {
    createStatusBarItem(
      _alignment?: number,
      _priority?: number,
    ): MockStatusBarItem {
      return new MockStatusBarItem();
    },

    createOutputChannel(name: string): MockOutputChannel {
      return new MockOutputChannel(name);
    },

    showInformationMessage(
      message: string,
      ...items: string[]
    ): Promise<string | undefined> {
      return Promise.resolve(items[0]);
    },

    showWarningMessage(
      message: string,
      ...items: string[]
    ): Promise<string | undefined> {
      return Promise.resolve(items[0]);
    },

    showErrorMessage(
      message: string,
      ...items: string[]
    ): Promise<string | undefined> {
      return Promise.resolve(items[0]);
    },

    showQuickPick(items: any[], _options?: any): Promise<any | undefined> {
      return Promise.resolve(items[0]);
    },

    showInputBox(_options?: any): Promise<string | undefined> {
      return Promise.resolve("mock-input");
    },

    showOpenDialog(_options?: any): Promise<MockUri[] | undefined> {
      return Promise.resolve([MockUri.file("/mock/file.json")]);
    },

    showSaveDialog(_options?: any): Promise<MockUri | undefined> {
      return Promise.resolve(MockUri.file("/mock/save.json"));
    },

    withProgress(
      options: any,
      task: (progress: any) => Promise<any>,
    ): Promise<any> {
      const progress = {
        report: (_value: any) => {},
      };
      return task(progress);
    },

    activeTextEditor: undefined as MockTextEditor | undefined,

    onDidChangeActiveTextEditor(
      _listener: (e: MockTextEditor | undefined) => any,
    ): { dispose: () => void } {
      return { dispose: () => {} };
    },

    showTextDocument(document: any, _options?: any): Promise<MockTextEditor> {
      return Promise.resolve(new MockTextEditor(document));
    },
  },

  workspace: {
    getConfiguration(_section?: string): MockWorkspaceConfiguration {
      return new MockWorkspaceConfiguration();
    },

    onDidChangeConfiguration(_listener: (e: any) => any): {
      dispose: () => void;
    } {
      return { dispose: () => {} };
    },

    workspaceFolders: undefined as MockWorkspaceFolder[] | undefined,

    onDidChangeWorkspaceFolders(_listener: (e: any) => any): {
      dispose: () => void;
    } {
      return { dispose: () => {} };
    },

    openTextDocument(_options: any): Promise<MockTextDocument> {
      const uri = MockUri.file("/mock/file.txt");
      return Promise.resolve(new MockTextDocument(uri));
    },

    fs: {
      readFile(_uri: MockUri): Promise<Uint8Array> {
        return Promise.resolve(new Uint8Array());
      },
      writeFile(_uri: MockUri, _content: Uint8Array): Promise<void> {
        return Promise.resolve();
      },
    },
  },

  commands: {
    registerCommand(
      _command: string,
      _callback: (...args: any[]) => any,
    ): { dispose: () => void } {
      return { dispose: () => {} };
    },

    executeCommand(_command: string, ..._args: any[]): Promise<any> {
      return Promise.resolve();
    },
  },

  extensions: {
    getExtension(extensionId: string): any | undefined {
      if (extensionId === "vscode.git") {
        return {
          exports: {
            getAPI: (_version: number) => ({
              repositories: [
                {
                  state: {
                    HEAD: { name: "main" },
                    workingTreeChanges: [],
                    indexChanges: [],
                    mergeChanges: [],
                  },
                },
              ],
            }),
          },
        };
      }
      return undefined;
    },
  },

  ThemeIcon: class {
    constructor(public id: string) {}
  },

  Disposable: class {
    static from(...disposables: { dispose: () => any }[]): {
      dispose: () => void;
    } {
      return {
        dispose: () => disposables.forEach((d) => d.dispose()),
      };
    }
  },

  EventEmitter: class<T> {
    private emitter = new EventEmitter();

    fire(data: T): void {
      this.emitter.emit("event", data);
    }

    get event() {
      return (listener: (e: T) => any) => {
        this.emitter.on("event", listener);
        return { dispose: () => this.emitter.off("event", listener) };
      };
    }

    dispose(): void {
      this.emitter.removeAllListeners();
    }
  },
};

/**
 * Mock GitApi
 */
export interface GitApi {
  repositories: {
    state: {
      HEAD: { name: string };
      workingTreeChanges: any[];
      indexChanges: any[];
      mergeChanges: any[];
    };
  }[];
}

/**
 * Export types for testing
 */
export type VSCodeMock = typeof vscode;
