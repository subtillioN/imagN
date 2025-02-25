# ImagN Codebase Outline

## Directory Structure

```
imagN/
├── public/                 # Static assets
├── src/                    # Source code
│   ├── components/         # React components
│   │   ├── MainView.tsx    # Main application component
│   │   ├── Workspace/      # Workspace components
│   │   ├── Dialogs/        # Dialog components
│   │   ├── Nodes/          # Node editor components
│   │   └── UI/             # Reusable UI components
│   ├── services/           # Core services
│   │   ├── workflowPresets.js    # Preset management
│   │   ├── workflowStorage.js    # Project storage
│   │   ├── workflow.js           # Workflow execution
│   │   ├── imageGeneration.js    # Image generation
│   │   └── videoGeneration.js    # Video generation
│   ├── types/              # TypeScript type definitions
│   ├── utils/              # Utility functions
│   ├── hooks/              # Custom React hooks
│   ├── config/             # Application configuration
│   ├── App.tsx             # Root component
│   └── main.tsx            # Entry point
├── context/                # Project documentation
├── .cursor/                # Cursor editor configuration
│   └── rules/              # Cursor rules and commands
├── vite.config.js          # Vite configuration
└── package.json            # Project dependencies
```

## Key Components

### Main Application Components

1. **MainView** (`src/components/MainView.tsx`)
   - Main container component
   - Manages application state
   - Handles tab navigation
   - Contains project management dialogs
   - Orchestrates the application workflow

2. **Workspace Components** (`src/components/Workspace/`)
   - **ImageWorkspace**: Workspace for image generation projects
   - **VideoWorkspace**: Workspace for video generation projects
   - **NodeEditor**: Workspace for node-based workflow projects
   - **WorkspaceContainer**: Shared container for all workspaces

3. **Dialog Components** (`src/components/Dialogs/`)
   - **NewProjectDialog**: Dialog for creating new projects
   - **LoadProjectDialog**: Dialog for loading existing projects
   - **PresetManagerDialog**: Dialog for managing workflow presets
   - **SettingsDialog**: Dialog for application settings

4. **Node Components** (`src/components/Nodes/`)
   - **NodeCanvas**: Canvas for node editing
   - **Node**: Base node component
   - **NodeConnection**: Connection between nodes
   - **NodeTypes/**: Specific node implementations
     - **ImageNodes/**: Nodes for image processing
     - **VideoNodes/**: Nodes for video processing
     - **UtilityNodes/**: Utility nodes (math, logic, etc.)

## Core Services

1. **WorkflowPresetService** (`src/services/workflowPresets.js`)
   - Manages system and user-defined workflow presets
   - Provides methods for registering, retrieving, and listing presets
   - Uses RxJS for reactive programming

2. **WorkflowStorageService** (`src/services/workflowStorage.js`)
   - Handles saving, loading, and listing user-created workflows
   - Integrates with local storage for persistence
   - Provides serialization and deserialization methods

3. **WorkflowService** (`src/services/workflow.js`)
   - Manages workflow execution
   - Handles node graph traversal and execution
   - Manages data flow between nodes

4. **ImageGenerationService** (`src/services/imageGeneration.js`)
   - Handles image generation tasks
   - Integrates with AI models for image generation
   - Provides methods for image processing and manipulation

5. **VideoGenerationService** (`src/services/videoGeneration.js`)
   - Handles video generation and processing
   - Integrates with video generation models
   - Provides methods for video editing and effects

## State Management

### Component State

- React hooks for local component state
- RxJS streams for reactive state management
- Context API for shared state across components

### Service State

- RxJS subjects and observables for reactive state
- Service-specific state management
- Persistent storage using local storage

## Data Flow

1. **User Interaction → Component → Service → Component → UI Update**
   - User interacts with UI components
   - Components dispatch actions to services
   - Services process actions and update state
   - Components subscribe to service state changes
   - UI updates based on new state

2. **Service → Component Notification Flow**
   - Services emit events via RxJS observables
   - Components subscribe to relevant observables
   - Components update their UI based on events

## Key Interfaces and Types

1. **Project Interface** (`src/types/project.ts`)
   - Defines the structure of a project
   - Includes project metadata and content

2. **Workflow Interface** (`src/types/workflow.ts`)
   - Defines the structure of a workflow
   - Includes nodes and connections

3. **Node Interfaces** (`src/types/nodes.ts`)
   - Define the structure of different node types
   - Include node metadata, inputs, outputs, and parameters

4. **Service Interfaces** (`src/types/services.ts`)
   - Define the contracts for service implementations
   - Ensure consistent service APIs 