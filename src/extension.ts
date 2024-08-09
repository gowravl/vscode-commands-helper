import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";

export function activate(context: vscode.ExtensionContext) {
  const { tasks } = getTasksFromConfiguration();
  let webviewView: vscode.WebviewView | undefined;

  vscode.commands.executeCommand(
    "setContext",
    "commandsHelper.hasTasks",
    tasks.length > 0
  );

  const taskProvider = new TaskProvider(tasks);
  vscode.window.registerTreeDataProvider("commandsHelper.tree", taskProvider);

  const webviewProvider: vscode.WebviewViewProvider = {
    resolveWebviewView: function (
      view: vscode.WebviewView,
      _context: vscode.WebviewViewResolveContext,
      _token: vscode.CancellationToken
    ): Thenable<void> | void {
      webviewView = view;
      view.webview.options = { enableScripts: true };
      const { errorMessage } = getTasksFromConfiguration();
      view.webview.html = getWebviewContent(errorMessage);
      view.webview.onDidReceiveMessage((message) => {
        switch (message.command) {
          case "openSettings":
            vscode.commands.executeCommand(
              "workbench.action.openSettings",
              "commandsHelper.tasks"
            );
            break;
        }
      });
    },
  };

  vscode.window.registerWebviewViewProvider(
    "commandsHelper.webview",
    webviewProvider
  );

  vscode.commands.registerCommand(
    "commandsHelper.runTask",
    (task: TaskItem) => {
      runTask(task);
    }
  );

  vscode.commands.registerCommand("commandsHelper.openSettings", () => {
    vscode.commands.executeCommand(
      "workbench.action.openSettings",
      "commandsHelper.tasks"
    );
  });

  // Watch for configuration changes and refresh the view
  vscode.workspace.onDidChangeConfiguration((e) => {
    if (
      e.affectsConfiguration("commandsHelper.tasks") ||
      e.affectsConfiguration("commandsHelper.loadNpmCommands")
    ) {
      const { tasks: newTasks, errorMessage } = getTasksFromConfiguration();
      taskProvider.refresh(newTasks);
      if (webviewView) {
        webviewView.webview.html = getWebviewContent(errorMessage);
      }
      vscode.commands.executeCommand(
        "setContext",
        "commandsHelper.hasTasks",
        newTasks.length > 0
      );
    }
  });
}

function getTasksFromConfiguration(): {
  tasks: TaskSection[];
  errorMessage?: string;
} {
  const configuration = vscode.workspace.getConfiguration("commandsHelper");
  let tasks: TaskSection[] = [];
  let errorMessage: string | undefined;

  try {
    const tasksConfig = configuration.get<TaskSection[]>("tasks");
    const npmCommands = configuration.get<boolean>("loadNpmCommands");

    if (tasksConfig && Array.isArray(tasksConfig)) {
      tasks = tasksConfig.map((section) => {
        if (
          typeof section !== "object" ||
          typeof section.section !== "string" ||
          !Array.isArray(section.tasks)
        ) {
          throw new Error(
            "Configuration section is missing or tasks array is invalid."
          );
        }
        section.tasks.forEach((task) => {
          if (
            typeof task !== "object" ||
            typeof task.label !== "string" ||
            typeof task.command !== "string"
          ) {
            throw new Error("Tasks are missing required fields.");
          }
        });
        return section;
      });
    } else {
      errorMessage =
        "Invalid configuration format. Expected an array of task sections.";
    }

    if (npmCommands) {
      const npmScripts = getNpmScripts();
      if (npmScripts.length > 0) {
        tasks.push({
          section: "NPM Scripts",
          tasks: npmScripts,
        });
      } else {
        errorMessage = "No npm scripts found in package.json.";
      }
    }
  } catch (error) {
    errorMessage =
      error instanceof Error
        ? error.message
        : "An unknown error occurred while loading configuration.";
  }

  return { tasks, errorMessage };
}

class TaskProvider implements vscode.TreeDataProvider<TaskItem> {
  private _onDidChangeTreeData: vscode.EventEmitter<
    TaskItem | undefined | null | void
  > = new vscode.EventEmitter<TaskItem | undefined | null | void>();
  readonly onDidChangeTreeData: vscode.Event<
    TaskItem | undefined | null | void
  > = this._onDidChangeTreeData.event;

  constructor(
    private sections: {
      section: string;
      tasks: { label: string; command: string; iconId: string }[];
    }[]
  ) {}

  getTreeItem(element: TaskItem): vscode.TreeItem {
    return element;
  }

  getChildren(element?: TaskItem): Thenable<TaskItem[]> {
    if (element) {
      return Promise.resolve(element.children || []);
    } else {
      return Promise.resolve(
        this.sections.map(
          (section) =>
            new TaskItem(
              section.section,
              vscode.TreeItemCollapsibleState.Collapsed,
              section.tasks.map(
                (task) =>
                  new TaskItem(
                    task.label,
                    vscode.TreeItemCollapsibleState.None,
                    [],
                    task.command,
                    task.iconId
                  )
              )
            )
        )
      );
    }
  }

  refresh(
    sections: {
      section: string;
      tasks: { label: string; command: string; iconId: string }[];
    }[]
  ) {
    this.sections = sections;
    this._onDidChangeTreeData.fire();
  }
}

class TaskItem extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    public readonly children: TaskItem[] = [],
    public commandStr?: string,
    iconId?: string
  ) {
    super(label, collapsibleState);
    if (commandStr) {
      this.command = {
        title: this.label,
        command: "commandsHelper.runTask",
        arguments: [this],
      };
    }
    if (iconId) {
      this.iconPath = new vscode.ThemeIcon(iconId);
    }
  }
}

function runTask(task: TaskItem) {
  const terminal = vscode.window.createTerminal(`${task.label}`);
  terminal.sendText(task.commandStr!);
  terminal.show();
}
function getWebviewContent(errorMessage: string = ""): string {
  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Commands Helper</title>
    <style>
      body {
        padding: 10px;
        text-align: center;
      }
      button {
        background-color: #007acc;
        color: white;
        border: none;
        border-radius: 4px;
        padding: 10px 20px;
        cursor: pointer;
      }
      button:hover {
        background-color: #005a9e;
      }
      .error {
        color: red;
        font-weight: bold;
      }
    </style>
  </head>
  <body>
    ${
      errorMessage
        ? `<p class="error">${errorMessage}</p>`
        : "<h3>No Tasks Added</h3><p>Please add tasks to the configuration to see them here.</p>"
    }
    <button id="open-settings">Open Settings</button>
    <script>
      const vscode = acquireVsCodeApi();
      document.getElementById('open-settings').addEventListener('click', () => {
        vscode.postMessage({ command: 'openSettings' });
      });
    </script>
  </body>
  </html>`;
}

function getPackageManager(): "yarn" | "npm" {
  const workspaceFolders = vscode.workspace.workspaceFolders;

  if (workspaceFolders) {
    const rootPath = workspaceFolders[0].uri.fsPath;
    const yarnLockPath = path.join(rootPath, "yarn.lock");
    if (fs.existsSync(yarnLockPath)) {
      return "yarn";
    }
  }
  return "npm";
}

function getNpmScripts(): Task[] {
  const workspaceFolders = vscode.workspace.workspaceFolders;
  const packageManager = getPackageManager();

  if (workspaceFolders) {
    const packageJsonPath = path.join(
      workspaceFolders[0].uri.fsPath,
      "package.json"
    );
    if (fs.existsSync(packageJsonPath)) {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));
      if (packageJson.scripts && typeof packageJson.scripts === "object") {
        return Object.keys(packageJson.scripts).map((script) => ({
          label: script,
          command: `${packageManager} run ${script}`,
          iconId: "terminal",
        }));
      }
    }
  }

  return [];
}

export function deactivate() {}

interface Task {
  label: string;
  command: string;
  iconId: string;
}

interface TaskSection {
  section: string;
  tasks: Task[];
}
