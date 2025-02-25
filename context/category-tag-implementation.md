# Category and Tag System Implementation Plan

## Overview

This document outlines the implementation plan for transitioning from the current multi-category system to a more structured category and tag system for workflow presets in the imagN application.

## Current State

- Presets have a `categories` array of strings
- Special categories like 'default' and 'user' identify system vs. user presets
- Additional descriptive categories like 'image', 'video', 'node', 'style', etc. are used for filtering
- UI shows category chips for filtering and displays category tags on preset items

## Target State

- Presets will have:
  - `category`: Primary category (image, video, node)
  - `type`: System or user (default, user)
  - `tags`: Array of descriptive tags
- UI will support category tabs and tag-based filtering
- Users can add custom tags when saving presets
- Search functionality will include tags

## Implementation Tasks

### 1. Data Model Updates

#### 1.1 Update TypeScript Interfaces

- [ ] Modify `WorkflowPreset` interface in `MainView.tsx`:
  ```typescript
  interface WorkflowPreset {
    id: string;
    name: string;
    description: string;
    category: string;
    type: string;
    tags: string[];
    // ... other fields
  }
  ```

- [ ] Update `PresetType` interface to match

#### 1.2 Update Preset Service

- [ ] Modify `workflowPresets.js` to use the new structure:
  - [ ] Update `registerPreset` method to accept category, type, and tags
  - [ ] Update preset definitions with new structure
  - [ ] Add migration logic for existing presets
  - [ ] Update filter methods (getDefaultPresets, getUserPresets)
  - [ ] Add methods for tag-based filtering

#### 1.3 Update Storage Service

- [ ] Modify `workflowStorage.js` to handle the new structure:
  - [ ] Update `serializeWorkflow` method
  - [ ] Add migration logic for existing stored workflows
  - [ ] Update `getAllWorkflows` method

### 2. UI Updates

#### 2.1 New Project Dialog

- [ ] Add category tabs at the top of the preset selection
- [ ] Implement tag filtering with chips
- [ ] Update preset display to show tags
- [ ] Add tag search functionality

#### 2.2 Save Preset Dialog

- [ ] Add category dropdown
- [ ] Add tag input field with autocomplete
- [ ] Implement tag suggestions

#### 2.3 Preset Management

- [ ] Create UI for managing tags (add, rename, delete)
- [ ] Implement tag cloud visualization
- [ ] Add preset filtering by tags

### 3. Business Logic

#### 3.1 Category Management

- [ ] Define primary categories (image, video, node)
- [ ] Implement category-based filtering
- [ ] Add category validation

#### 3.2 Tag Management

- [ ] Implement tag normalization (lowercase, trim, etc.)
- [ ] Add tag validation (length, allowed characters)
- [ ] Create tag suggestion algorithm
- [ ] Implement tag popularity tracking

#### 3.3 Search and Discovery

- [ ] Implement full-text search across preset names, descriptions, and tags
- [ ] Create "related presets" functionality based on tag similarity
- [ ] Add sorting options (popularity, recency, relevance)

### 4. Migration

#### 4.1 Data Migration

- [ ] Create migration script to convert existing presets:
  - [ ] Extract primary category from categories array
  - [ ] Set type based on 'default'/'user' category
  - [ ] Move remaining categories to tags
  - [ ] Handle edge cases and validation

#### 4.2 UI Migration

- [ ] Update all UI components to use the new data structure
- [ ] Ensure backward compatibility for any external integrations

### 5. Testing

- [ ] Unit tests for updated services
- [ ] Integration tests for UI components
- [ ] Migration tests with sample data
- [ ] User acceptance testing

### 6. Documentation

- [ ] Update `preset-system.md` with final implementation details
- [ ] Create user documentation for the new category/tag system
- [ ] Add developer documentation for the API changes

## Implementation Approach

1. **Phase 1**: Data model updates and migration logic
2. **Phase 2**: Core UI updates for category tabs and tag filtering
3. **Phase 3**: Advanced features (tag suggestions, search, etc.)
4. **Phase 4**: Testing and refinement
5. **Phase 5**: Documentation and release

## Timeline

- **Week 1**: Data model updates and migration logic
- **Week 2**: Core UI updates
- **Week 3**: Advanced features and testing
- **Week 4**: Documentation and release

## Success Criteria

- All presets successfully migrated to the new structure
- UI supports category tabs and tag filtering
- Users can add and manage tags for their presets
- Search functionality includes tags
- Performance is maintained or improved 