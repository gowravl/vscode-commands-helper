# Commands Helper

Commands Helper is a Visual Studio Code extension designed to streamline the development workflow by providing an easy way to manage and execute npm/yarn scripts within your projects and custom command line tasks directly from the VSCode interface.

## Features

- **Task Management**: Organize tasks into collapsible sections for better organization.
- **NPM Script Integration**: Automatically detects npm or yarn scripts from package.json and adds them to the task list if enabled.
- **Custom Commands**: Run terminal commands with a single click.
- **Configurable**: Easily add or modify tasks through the VSCode settings.

## Installation and Setup

### Installation

Open VSCode Extensions and search for `gowravl.vscode-helper` and click on Install

### Setup and Adding Tasks

- Select the Commands Helper extension in Activity Bar
- Click on the `Open Settings` Button
- Click on `Edit in settings.json`
- Add configuration as described below

or

- Open VSCode Settings by (`Ctrl + ,`) or (`Cmd + ,`)
- Search for `commandsHelper.tasks`
- Click on `Edit in settings.json`
- Add configuration as described below

## Example Interface

![Commands Helper Interface](resources/preview.png)

Note: **iconId** supports VSCode Product Icons only. You can find the list of Icons from https://code.visualstudio.com/api/references/icons-in-labels

```json
{
  // ... Other Configurations
  "commandsHelper.loadNpmCommands": true,
  "commandsHelper.tasks": [
    {
      "section": "Basic Tasks",
      "tasks": [
        {
          "label": "Say Hello",
          "command": "echo Hello, World!",
          "iconId": "smiley"
        },
        {
          "label": "List Files",
          "command": "ls -la",
          "iconId": "file-directory"
        }
      ]
    },
    {
      "section": "Development Tasks",
      "tasks": [
        {
          "label": "Start Server",
          "command": "npm start",
          "iconId": "play-circle"
        },
        {
          "label": "Build Project",
          "command": "npm run build",
          "iconId": "tools"
        },
        {
          "label": "Run Tests",
          "command": "npm test",
          "iconId": "beaker"
        }
      ]
    },
    {
      "section": "Git Tasks",
      "tasks": [
        {
          "label": "Git Status",
          "command": "git status",
          "iconId": "source-control"
        },
        {
          "label": "Git Pull",
          "command": "git pull",
          "iconId": "cloud-download"
        },
        {
          "label": "Git Push",
          "command": "git push",
          "iconId": "cloud-upload"
        }
      ]
    },
    {
      "section": "Utility Tasks",
      "tasks": [
        {
          "label": "Show Date",
          "command": "date",
          "iconId": "calendar"
        },
        {
          "label": "Show Disk Usage",
          "command": "df -h",
          "iconId": "database"
        },
        {
          "label": "Show Free Memory",
          "command": "free -m",
          "iconId": "pulse"
        }
      ]
    }
  ]

  // ... Other Configurations
}
```

- **commandsHelper.loadNpmCommands**: Root key as a boolean which loads npm/yarn scripts in package.json of Project as a Section.
- **commandsHelper.tasks**: Root key containing an array of task sections.
- **section**: Defines a collapsible section name grouping related tasks.
- **tasks**: Array of task objects within a section.
- **label**: The name of the task as it will appear in VSCode.
- **command**: The terminal command to be executed when the task is run.
- **iconId**: The icon displayed alongside the task label in VSCode.

## Acknowledgments

- Thanks to the authors of [vscode-action-buttons](https://github.com/seunlanlege/vscode-action-buttons/) library for inspiration.

- <a href="https://www.flaticon.com/free-icons/gear" title="gear icons">Gear icons created by Eucalyp - Flaticon</a>
