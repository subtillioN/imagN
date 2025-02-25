# Workflow Preset System

## Overview

The workflow preset system in imagN provides a unified approach to project templates. Instead of having separate project types, we now have a single project structure with different presets that can be applied. This simplifies the user experience and makes it easier to extend the system with new presets.

## Key Components

### Presets

Presets are templates that define the initial structure and behavior of a project. They include:

- **Default Presets**: Built-in presets provided by the system
- **User-Defined Presets**: Custom presets created by users

All presets share the same data structure, making it easy to switch between them or create new ones based on existing presets.

### Preset Categories

Presets are categorized as:

- `default`: System-provided presets
- `user`: User-created presets

This categorization helps organize the preset selection UI and allows for different handling of system vs. user presets.

## Default Presets

The system comes with the following default presets:

1. **Image Generation**: Standard image generation workflow with AI models
2. **Video Generation**: Create videos from text prompts or image sequences
3. **Node-based Workflow**: Advanced customizable node-based workflow for complex projects
4. **Style Transfer Suite**: Artistic style transfer with customizable parameters

## Implementation

### Services

- **WorkflowPresetService**: Manages the registration and retrieval of presets
- **WorkflowStorageService**: Handles saving and loading user-defined presets

### Data Structure

Each preset contains:

```javascript
{
  id: string,           // Unique identifier
  name: string,         // Display name
  description: string,  // Brief description
  category: string,     // 'default' or 'user'
  nodes: [],            // Array of workflow nodes
  connections: []       // Array of connections between nodes
}
```

## User Interface

The preset selection UI in the "Create New Project" dialog displays:

1. System presets at the top
2. A divider
3. User-defined presets below the divider

This clear visual separation helps users distinguish between default and custom presets.

## Best Practices

1. **Preset Naming**: Use clear, descriptive names that indicate the preset's purpose
2. **Categorization**: Always set the appropriate category ('default' or 'user')
3. **Node Configuration**: Provide sensible default values for node parameters
4. **Documentation**: Include a detailed description for each preset

## Future Enhancements

1. **Preset Sharing**: Allow users to export and import presets
2. **Preset Versioning**: Track changes to presets over time
3. **Preset Tagging**: Add tags for better organization and filtering
4. **Preset Preview**: Show a visual preview of the workflow structure
5. **Preset Forking**: Create new presets based on existing ones with modifications

## Technical Notes

The preset system uses RxJS Observables for asynchronous operations, making it easy to integrate with reactive UI components and handle async loading of presets. 