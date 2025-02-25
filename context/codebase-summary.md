# ImagN Codebase Summary

## Overview

ImagN is an AI-powered image and video generation application with a flexible workflow system. The application is built using React, TypeScript, and RxJS, following functional reactive programming principles. It provides users with tools to create, edit, and manage AI-generated visual content through a node-based workflow editor.

## Key Concepts

### 1. Workflow Presets

The core of the application is the workflow preset system, which provides templates for different types of projects:

- **Default Presets**: System-provided templates for common workflows (image generation, video generation, node-based workflows)
- **User Presets**: Custom workflows created and saved by users
- **Project Management**: Creating, loading, and managing projects based on these presets

### 2. Component Architecture

The application uses a component-based architecture:

- **Main Components**: 
  - `MainView`: Primary container component managing the application state and UI
  - `Workspace`: Different workspaces based on the project type (Image, Video, Node Editor)
  - `NodeEditor`: Component for creating and managing workflow nodes
  
- **UI Components**:
  - Material UI-based components for a consistent look and feel
  - Custom components for specialized functions (node editing, preview rendering)

### 3. State Management

State is managed through reactive streams using RxJS:

- **Services**: Provide core functionality like preset management, workflow storage
- **Component State**: Local state managed via React hooks and RxJS streams
- **Data Flow**: Unidirectional data flow with clear separation of concerns

### 4. Project Lifecycle

A typical project in ImagN follows this lifecycle:

1. **Creation**: User selects a preset and creates a new project
2. **Editing**: User modifies the workflow in the appropriate workspace
3. **Execution**: The workflow is processed to generate or modify visual content
4. **Storage**: Projects can be saved, loaded, and managed

## Technical Architecture

### Frontend

- **Framework**: React with TypeScript
- **UI Library**: Material UI (MUI)
- **State Management**: RxJS
- **Build Tool**: Vite

### Core Services

1. **WorkflowPresetService**: Manages system and user-defined workflow presets
2. **WorkflowStorageService**: Handles saving and loading user workflows
3. **ImageGenerationService**: Handles image generation tasks
4. **VideoGenerationService**: Handles video generation and processing
5. **NodeGraphService**: Manages the node-based workflow editor

### Key Files

- `src/components/MainView.tsx`: Main application component
- `src/services/workflowPresets.js`: Workflow preset management
- `src/services/workflowStorage.js`: Project storage and retrieval
- `src/components/Workspace/ImageWorkspace.tsx`: Image generation workspace
- `src/components/Workspace/VideoWorkspace.tsx`: Video generation workspace
- `src/components/Workspace/NodeEditor.tsx`: Node-based workflow editor

## Development Workflow

1. **Setup**: Install dependencies using npm/yarn
2. **Development**: Run the dev server with `npm run dev`
3. **Testing**: Test components and services with Jest
4. **Building**: Build the application with `npm run build`

## Codebase Challenges and Patterns

### Current Challenges

1. **Project Type Integration**: Ensuring seamless integration between different project types
2. **Preset Management**: Enhancing the preset system for better user experience
3. **Performance Optimization**: Managing large node graphs and real-time updates

### Design Patterns

1. **Observer Pattern**: Using RxJS for reactive streams
2. **Component Composition**: Building complex UIs from simple components
3. **Factory Pattern**: Creating different types of nodes and workflows
4. **Strategy Pattern**: Implementing different algorithms for different workflow types

## Roadmap

1. **Current Phase**: Core application structure and basic functionality
2. **Upcoming**: Enhanced AI model integration and advanced workflow features
3. **Future**: Collaborative features and cloud-based workflow sharing 