# VSCode Helper

VSCode Helper is a Visual Studio Code extension designed to streamline the development workflow by providing an easy way to manage and execute custom tasks directly from the VSCode interface.

## Features

- **Task Management**: Organize tasks into collapsible sections for better organization.
- **Custom Commands**: Run terminal commands with a single click.
- **Configurable**: Easily add or modify tasks through the workspace settings.

## Usage

### Adding Tasks

To add tasks, modify the `settings.json` file in .vscode folder inside your workspace. Here is an example configuration:

```json
{
  // ... Other Configurations

  "vscodeHelper.tasks": [
    {
      "section": "Basic Tasks",
      "tasks": [
        {
          "label": "Say Hello",
          "command": "echo Hello, World!",
          "iconId": "smiley"
        }
      ]
    },
    {
      "section": "Date Tasks",
      "tasks": [
        {
          "label": "Show Date",
          "command": "date",
          "iconId": "calendar"
        }
      ]
    }
  ]

  // ... Other Configurations
}
```
