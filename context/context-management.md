# Context Management System

The Context Management System in ImagN provides tools for quickly understanding the codebase and maintaining context across development sessions. This document explains how to use the system and describes the available commands.

## Overview

The context management system consists of several components:

1. **Documentation Files**: High-level summaries and outlines of the codebase
2. **Vector Embeddings**: JSON files containing semantic vectors of key files and concepts
3. **Context Profiles**: Named collections of files and concepts for specific development tasks
4. **Command Scripts**: Utilities for loading, saving, and managing contexts

## Documentation Files

- **codebase-summary.md**: High-level overview of the entire codebase
- **codebase-outline.md**: Detailed structure and organization of the codebase
- **vector-embeddings.json**: JSON file containing vector embeddings of key files and concepts

## Context Profiles

Context profiles are named collections of files and concepts relevant to specific development tasks. They help you quickly focus on the right parts of the codebase for particular tasks.

Available profiles include:

- **default**: Default working context for general ImagN development
- **preset_development**: Context focused on the workflow preset system
- **project_management**: Context focused on project management features

## Commands

The following commands are available for managing contexts:

### Load Context

Load a specific context profile to focus on a particular development task.

```bash
npm run context:load -- <profile-name>
```

Example:
```bash
npm run context:load -- preset_development
```

### Save Context

Save your current working context (open files, recent searches, etc.) to a named profile.

```bash
npm run context:save -- <profile-name> [--description "Description of the context"]
```

Example:
```bash
npm run context:save -- ui_development --description "Context for UI component development"
```

### List Contexts

List all available context profiles.

```bash
npm run context:list
```

### Create Context

Create a new context profile by specifying files and concepts to include.

```bash
npm run context:create -- <profile-name> --files <file1,file2,...> --concepts <concept1,concept2,...> --description "Description"
```

Example:
```bash
npm run context:create -- node_editor --files src/components/Nodes/NodeCanvas.tsx,src/services/nodeGraph.js --concepts node_system --description "Context for node editor development"
```

### Update Vector Embeddings

Update the vector embeddings for files and concepts.

```bash
npm run context:update-vectors
```

### Update Context

Process new issues from the testing department log, update appropriate task lists and documentation, and refresh vector embeddings.

```bash
npm run context:update
```

This command:
1. Reads issues from `context/new-issues-log.md`
2. Categorizes issues as bugs or enhancements
3. Adds bugs to `buglog.md`
4. Adds enhancements to `progress-tracking.md`
5. Marks processed issues as completed in the issues log
6. Reads feature requests from `context/new-features-log.md`
7. Adds feature requests to the appropriate sections in `progress-tracking.md`
8. Marks processed feature requests as completed in the features log
9. Updates vector embeddings for all changed files

Example:
```bash
npm run context:update
```

## Integration with Cursor

The context management system integrates with Cursor editor through the `.cursor/rules/` directory. The following scripts are available:

- **context-loader.js**: Script for loading context profiles
- **context-saver.js**: Script for saving current context to a profile
- **vector-generator.js**: Script for generating vector embeddings
- **context-updater.js**: Script for processing new issues and updating documentation

## Usage Examples

### Starting a New Development Task

1. Load a relevant context profile:
```bash
npm run context:load -- preset_development
```

2. Cursor will open the relevant files and provide AI assistance focused on the preset system.

### Saving Your Current Context

When switching tasks, save your current context:

```bash
npm run context:save -- my_current_task --description "Implementation of preset thumbnails"
```

### Creating a Custom Context

Create a custom context for a specific feature:

```bash
npm run context:create -- custom_nodes --files src/components/Nodes/CustomNodes/*,src/services/customNodeRegistry.js --concepts node_customization --description "Custom node development"
```

## Best Practices

1. **Create Focused Contexts**: Create contexts that focus on specific features or tasks
2. **Update Regularly**: Update vector embeddings when the codebase changes significantly
3. **Include Documentation**: Add links to relevant documentation in your context profiles
4. **Share Contexts**: Share useful context profiles with other team members 