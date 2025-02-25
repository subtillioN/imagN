# Context Management Rules for Cursor

This document defines rules and commands for managing context in the Cursor editor when working with the ImagN project.

## Overview

The context management system helps developers quickly understand the codebase and maintain context across development sessions. It provides commands for loading, saving, and managing named context profiles.

## Commands

### Load Context

```
/load-context <profile-name>
```

Loads a named context profile, opening the relevant files and providing AI assistance focused on the concepts related to that context.

Example:
```
/load-context preset_development
```

### Save Context

```
/save-context <profile-name> [description]
```

Saves the current working context (open files, recent searches, etc.) to a named profile.

Example:
```
/save-context ui_development "Context for UI component development"
```

### List Contexts

```
/list-contexts
```

Lists all available context profiles.

### Create Context

```
/create-context <profile-name> [files] [concepts] [description]
```

Creates a new context profile by specifying files and concepts to include.

Example:
```
/create-context node_editor "src/components/Nodes/NodeCanvas.tsx,src/services/nodeGraph.js" "node_system" "Context for node editor development"
```

### Update Vectors

```
/update-vectors
```

Updates the vector embeddings for files and concepts.

### Update Context

```
/context-update
```

Processes new issues from the testing department log, updates appropriate task lists and documentation, and refreshes vector embeddings for the context system.

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
```
/context-update
```

## Integration

These commands are implemented as Cursor editor commands that invoke JavaScript scripts in the `.cursor/scripts/` directory:

- **context-loader.js**: Script for loading context profiles
- **context-saver.js**: Script for saving current context to a profile
- **vector-generator.js**: Script for generating vector embeddings
- **context-updater.js**: Script for processing new issues and updating documentation

## Configuration

The context management system uses the following configuration files:

- **vector-embeddings.json**: Contains vector embeddings of key files and concepts
- **context-profiles.json**: Contains named context profiles

These files are stored in the `context/` directory.

## Usage in AI Assistance

When providing AI assistance, Cursor should:

1. Consider the currently loaded context profile
2. Prioritize suggestions related to the concepts in the current context
3. Reference relevant files from the current context
4. Offer to load a different context if the current task seems outside the current context

## Example Workflow

1. Developer starts working on the preset system:
   ```
   /load-context preset_development
   ```

2. Cursor loads relevant files and provides AI assistance focused on the preset system.

3. Developer completes the task and wants to switch to working on the project management system:
   ```
   /save-context preset_work "Implementation of preset thumbnails"
   /load-context project_management
   ```

4. Cursor saves the current context, then loads the project management context.

## Implementation Notes

The context management system uses:

1. File path matching to identify relevant files
2. Vector similarity to identify conceptually related code
3. Context profiles to group related files and concepts
4. Cursor editor commands to provide an integrated experience 