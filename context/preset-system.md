# Workflow Preset System

## Overview

The Workflow Preset System in imagN allows users to select from predefined workflow configurations when creating new projects. Presets are divided into two categories:

1. **System Presets**: Default presets provided by the application 
2. **User-Defined Presets**: Custom workflows saved by users

## Implementation Details

### Key Components

- **WorkflowPresetService**: Manages system preset registration and retrieval
  - Located in `src/services/workflowPresets.js`
  - Maintains a registry of all available presets
  - Provides methods for accessing presets (`getAllPresets`, `getPreset`, etc.)

- **WorkflowStorageService**: Handles user-defined workflow storage
  - Located in `src/services/workflowStorage.js`
  - Serializes and saves user workflows to localStorage
  - Retrieves user workflows and ensures they have the correct category

- **MainView Component**: Implements the UI for preset selection
  - Located in `src/components/MainView.tsx`
  - Displays system and user presets in separate categories in the dropdown
  - Handles validation and selection of presets

### Current Preset Structure

Each preset currently contains:

- **id**: Unique identifier for the preset
- **name**: Display name shown in the UI
- **description**: Brief description of the preset's purpose
- **categories**: Array of string tags that categorize the preset (e.g., ['default', 'image', 'style'])
- **nodes**: Array of workflow nodes that define the workflow's functionality
- **connections**: Specifies how nodes are interconnected

### Multi-Category System

Presets now support multiple categories through a string array instead of a single category string. This provides several benefits:

1. **Flexible Categorization**: Presets can belong to multiple categories simultaneously
2. **Improved Filtering**: Users can filter presets by any combination of categories
3. **Better Organization**: Presets can be tagged with descriptive categories like 'image', 'video', 'style', etc.
4. **Backward Compatibility**: Legacy presets with a single category are automatically converted to the new format

## Planned Improvements: Category and Tag System Redesign

To improve organization and usability, we're planning to redesign the categorization system to separate the concepts of categories and tags:

### New Preset Structure (Planned)

```typescript
interface WorkflowPreset {
  id: string;
  name: string;
  description: string;
  category: string;       // Primary category (image, video, node)
  type: string;           // System or user (default, user)
  tags: string[];         // Flexible array of descriptive tags
  nodes: Node[];
  connections: Connection[];
}
```

### Categories vs. Tags

**Categories:**
- Hierarchical, structured classification
- Limited set of predefined options
- Mutually exclusive within a hierarchy level
- Example: 'image', 'video', 'node'

**Tags:**
- Flat, flexible labeling
- Unlimited, can be user-defined
- Non-exclusive, multiple can apply
- Example: 'artistic', 'portrait', 'landscape', 'animation'

### Benefits of the New Approach

1. **Clearer Organization**: Users understand the primary purpose (category) vs. descriptive attributes (tags)
2. **Better Filtering**: Filter by category first, then refine by tags
3. **More Intuitive UI**: Matches mental models users have from other applications
4. **Scalability**: Easier to manage as the number of presets grows
5. **Discoverability**: Users can find presets more easily

### Planned UI Improvements

- **Category Tabs**: Allow users to select a primary category first
- **Tag Cloud/Chips**: Show available tags with size/prominence based on frequency
- **Tag Input**: Allow users to add custom tags when saving presets
- **Smart Suggestions**: Suggest relevant tags based on preset content
- **Search and Discovery**: Implement full-text search across preset names, descriptions, and tags

## Architectural Changes

### Removal of Project Types

In the initial implementation, projects were categorized by type (Image Generation, Video Generation, Node-based Workflow). This created confusion and unnecessary complexity. The system has been simplified by:

1. Removing the project type concept entirely
2. Focusing solely on workflow presets
3. Categorizing presets by source (system vs. user-defined) and by tags
4. Simplifying the UI to show a single list of presets grouped by source

This change makes the system more intuitive and flexible, allowing users to focus on selecting the workflow that best suits their needs without having to first categorize their project.

## Usage

### Creating a New Project with a Preset

1. Click "New Project" button
2. Enter a project name
3. Select a preset from the dropdown (categorized as System or User-Defined)
4. Optionally add a description
5. Click "Create"

### Saving a Custom Workflow as a Preset

1. Design your workflow in the node editor
2. Click "Save as Preset" in the workflow editor
3. Provide a name, description, and relevant categories
4. The preset will appear in the "User-Defined Presets" section when creating new projects

## Recent Fixes

- Removed project type distinctions to simplify the user experience
- Implemented multi-category system for more flexible preset organization
- Fixed issue where presets were not selectable in the New Project dialog
- Added proper categorization for all presets to ensure they appear in the correct dropdown section
- Set default preset selection when presets are loaded
- Improved UI layout for better usability
- Added better error handling and validation

## Future Enhancements

- Category-based filtering in the preset selection dialog
- Preset preview in selection dialog
- Ability to edit existing presets and their categories
- Preset sharing functionality
- Advanced preset search by category combinations
- Import/export of preset configurations 