import * as vscode from "vscode";

export function activate(context: vscode.ExtensionContext) {
  const tasks = getTasksFromConfiguration();

  const taskProvider = new TaskProvider(tasks);
  vscode.window.registerTreeDataProvider("vscodeHelperView", taskProvider);

  vscode.commands.registerCommand("vscodeHelper.runTask", (task: TaskItem) => {
    runTask(task);
  });

  // Watch for configuration changes and refresh the view
  vscode.workspace.onDidChangeConfiguration((e) => {
    if (e.affectsConfiguration("vscodeHelper.tasks")) {
      taskProvider.refresh(getTasksFromConfiguration());
    }
  });
}

function getTasksFromConfiguration(): {
  section: string;
  tasks: { label: string; command: string; iconId: string }[];
}[] {
  const configuration = vscode.workspace.getConfiguration("vscodeHelper");
  return (
    configuration.get<
      {
        section: string;
        tasks: { label: string; command: string; iconId: string }[];
      }[]
    >("tasks") || []
  );
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
        command: "vscodeHelper.runTask",
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

export function deactivate() {}
