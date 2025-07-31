# RushJS Get Changelog GitHub Action

A GitHub Action that extracts and formats changelog information from Rush.js projects. This action reads a specific version's changelog from a project's `CHANGELOG.json` file and converts it into readable Markdown format.

## Features

- 🔍 **Project Discovery**: Automatically finds projects in Rush monorepos using `rush.json`
- 📖 **Changelog Extraction**: Reads `CHANGELOG.json` files from project folders
- ⚡ **Version-Specific**: Gets changelog for a specific version
- 📝 **Markdown Output**: Converts JSON changelog to readable Markdown format
- 🏷️ **Conventional Commits**: Supports conventional commit formatting with emojis
- 🔒 **Error Handling**: Comprehensive error handling for missing files/versions

## Usage

### Basic Example

```yaml
name: Get Changelog

on:
  workflow_dispatch:
    inputs:
      project-name:
        description: 'Project name to get changelog for'
        required: true
        default: '@your-org/your-project'
      version:
        description: 'Version to get changelog for'
        required: true
        default: '1.0.0'

jobs:
  get-changelog:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Get Changelog
        id: changelog
        uses: advancedcsg-open/actions-rush-get-changelog@v1
        with:
          project-name: ${{ inputs.project-name }}
          version: ${{ inputs.version }}

      - name: Display Changelog
        run: |
          echo "Changelog for ${{ inputs.project-name }} v${{ inputs.version }}:"
          echo "${{ steps.changelog.outputs.markdown }}"
```

### Advanced Example - Create Release

```yaml
name: Create Release with Changelog

on:
  push:
    tags:
      - 'v*'

jobs:
  create-release:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Extract version from tag
        id: version
        run: echo "version=${GITHUB_REF#refs/tags/v}" >> $GITHUB_OUTPUT

      - name: Extract project name from tag
        id: project
        run: |
          # Assuming tag format like "project-name-v1.0.0"
          project=$(echo "${GITHUB_REF#refs/tags/}" | sed 's/-v[0-9].*//')
          echo "name=@your-org/$project" >> $GITHUB_OUTPUT

      - name: Get Changelog
        id: changelog
        uses: advancedcsg-open/actions-rush-get-changelog@v1
        with:
          project-name: ${{ steps.project.outputs.name }}
          version: ${{ steps.version.outputs.version }}

      - name: Create Release
        uses: actions/create-release@v1
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        with:
          tag_name: ${{ github.ref }}
          release_name: ${{ steps.project.outputs.name }} v${{ steps.version.outputs.version }}
          body: ${{ steps.changelog.outputs.markdown }}
          draft: false
          prerelease: false
```

## Inputs

| Input | Description | Required | Default |
|-------|-------------|----------|---------|
| `project-name` | The name of the project to retrieve changelog for (must match `packageName` in `rush.json`) | ✅ | - |
| `version` | The version of the changelog to retrieve | ✅ | - |

## Outputs

| Output | Description |
|--------|-------------|
| `markdown` | Markdown formatted changelog for the specified version and project |

## How It Works

### 1. Project Discovery
The action reads the `rush.json` file in the repository root to find the project configuration:

```json
{
  "projects": [
    {
      "packageName": "@your-org/your-project",
      "projectFolder": "packages/your-project"
    }
  ]
}
```

### 2. Changelog Reading
Once the project folder is identified, the action reads the `CHANGELOG.json` file:

```json
{
  "name": "@your-org/your-project",
  "entries": [
    {
      "version": "1.0.0",
      "tag": "@your-org/your-project_v1.0.0",
      "date": "Wed, 08 Dec 2021 08:44:31 GMT",
      "comments": {
        "patch": [
          { "comment": "fix: Fixed critical bug in authentication" }
        ],
        "minor": [
          { "comment": "feat: Added new user dashboard" }
        ]
      }
    }
  ]
}
```

### 3. Markdown Conversion
The JSON changelog is converted to formatted Markdown:

```markdown
# @your-org/your-project v1.0.0

*Released: Wed, 08 Dec 2021 08:44:31 GMT*

## 🆕 Feat

- Added new user dashboard

## 🐛 Fix

- Fixed critical bug in authentication
```

## Supported Change Types

The action recognizes conventional commit types and formats them with appropriate emojis:

| Type | Emoji | Description |
|------|-------|-------------|
| `feat` | 🆕 | New features |
| `fix` | 🐛 | Bug fixes |
| `docs` | 📖 | Documentation changes |
| `style` | 💄 | Code style changes |
| `refactor` | 🔨 | Code refactoring |
| `perf` | ⚡ | Performance improvements |
| `test` | ✅ | Test additions/changes |
| `chore` | 🔧 | Maintenance tasks |
| `revert` | 🔙 | Reverted changes |
| `other` | 🔖 | Other changes |

## Error Handling

The action provides clear error messages for common issues:

- **Project not found**: When `project-name` doesn't exist in `rush.json`
- **Version not found**: When the specified version doesn't exist in the changelog
- **Missing files**: When `rush.json` or `CHANGELOG.json` files are missing
- **Invalid JSON**: When JSON files are malformed

## Prerequisites

### Repository Structure
Your Rush.js repository should have:

```
your-repo/
├── rush.json                           # Rush configuration
└── packages/
    └── your-project/
        ├── package.json
        └── CHANGELOG.json              # Generated by Rush
```

### Rush Configuration
Ensure your `rush.json` includes the project:

```json
{
  "projects": [
    {
      "packageName": "@your-org/your-project",
      "projectFolder": "packages/your-project"
    }
  ]
}
```

### Changelog Generation
The `CHANGELOG.json` files are typically generated by Rush's change management system:

```bash
# Create change files
rush change

# Publish and generate changelogs
rush publish
```

## Development

### Running Tests
```bash
npm test
```

### Building
```bash
npm run build
```

### Local Testing
```bash
node demo.js
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Related

- [Rush.js](https://rushjs.io/) - The build orchestrator for JavaScript monorepos
- [Rush Change Management](https://rushjs.io/pages/best_practices/change_logs/) - Documentation on Rush's changelog system
