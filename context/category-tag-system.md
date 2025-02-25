# Category and Tag System

## Overview

The imagN application uses a structured categorization system for workflow presets to improve organization, discoverability, and filtering. This document outlines the design and implementation of the category and tag system.

## Structure

The categorization system consists of three main components:

1. **Category**: The primary classification of a preset (e.g., 'image', 'video', 'node')
   - Each preset belongs to exactly one category
   - Categories represent the main workspace or domain the preset is designed for

2. **Type**: The functional classification of a preset (e.g., 'generation', 'editing', 'style', 'custom')
   - Each preset has exactly one type
   - Types represent what the preset does or its primary function

3. **Tags**: Additional descriptive labels for more granular filtering
   - Each preset can have multiple tags
   - Tags provide more specific information about features, capabilities, or use cases
   - Special tags like 'default' and 'user' are used for system purposes

## Implementation

### Data Structure

The `WorkflowPreset` interface has been updated to include:

```typescript
interface WorkflowPreset {
  id: string;
  name: string;
  description: string;
  category: string;       // Primary category (e.g., 'image', 'video', 'node')
  type: string;           // Type of preset (e.g., 'generation', 'editing', 'custom')
  tags: string[];         // Additional tags for filtering
  categories?: string[];  // Kept for backward compatibility
}
```

### Services

The `workflowPresetService` provides methods for working with the new structure:

- `getPresetsByCategory(category)`: Get presets with a specific category
- `getPresetsByType(type)`: Get presets with a specific type
- `getPresetsByTag(tag)`: Get presets that include a specific tag
- `getAllCategories()`: Get a list of all available categories
- `getAllTypes()`: Get a list of all available types
- `getAllTags()`: Get a list of all available tags

### Backward Compatibility

To maintain backward compatibility with existing code:

1. The `categories` array is kept as an optional field
2. Migration functions in `workflowStorage.js` ensure that existing presets are properly converted to the new structure
3. UI components that previously used `categories` are updated to use the appropriate new fields

## Usage Guidelines

### Categories

Categories should be limited to a small set of core workspace types:
- `image`: For image generation and editing presets
- `video`: For video generation and editing presets
- `node`: For node-based custom workflows
- `audio`: For audio generation and processing (future)
- `3d`: For 3D model generation and editing (future)

### Types

Types should describe the primary function:
- `generation`: Creates new content
- `editing`: Modifies existing content
- `style`: Applies style transformations
- `custom`: User-defined or specialized workflows
- `analysis`: Analyzes or extracts information from content

### Tags

Tags can be more freely assigned and should include:
- Content descriptors: 'portrait', 'landscape', 'animation', etc.
- Style descriptors: 'artistic', 'photorealistic', 'abstract', etc.
- Technical descriptors: 'high-resolution', 'real-time', 'batch', etc.
- Special tags: 'default', 'user', 'featured', etc.

## UI Considerations

The UI should:
1. Allow filtering by category, type, and tags
2. Display tags as chips for easy visual identification
3. Allow users to add/remove tags from their own presets
4. Use consistent color coding for categories and types

## Future Enhancements

Planned enhancements to the category and tag system:
1. Tag-based search and filtering
2. Tag management for user-defined presets
3. Tag recommendations based on preset content
4. Tag popularity metrics to improve discoverability
5. Category and type icons for visual identification 