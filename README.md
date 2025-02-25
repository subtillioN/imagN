# imagN

imagN is an AI-powered image and video generation application that provides a flexible workflow system for creating and manipulating visual content.

## Features

- Image generation with AI models
- Video generation and processing
- Node-based workflow editor
- Preset system for quick project setup
- Project management with save/load functionality

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/imagN.git
   cd imagN
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm run dev
   ```

## Documentation

Comprehensive documentation is available in the [context](./context) directory:

- [Project Requirements](./context/PRD.md)
- [Application Flow](./context/app-flow.md)
- [Technology Stack](./context/tech-stack.md)
- [Development Guidelines](./context/frontend-guidelines.md)
- [Workflow Preset System](./context/workflow-preset-system.md)

## Context Management System

imagN includes a context management system to help developers quickly understand the codebase and maintain context across development sessions:

- [Codebase Summary](./context/codebase-summary.md): High-level overview of the codebase
- [Codebase Outline](./context/codebase-outline.md): Detailed structure of the project
- [Context Management](./context/context-management.md): Documentation on using the context system

### Context Commands

- `npm run context:load -- <profile-name>`: Load a named context profile
- `npm run context:save -- <profile-name> [description]`: Save current context to a profile
- `npm run context:list`: List all available context profiles
- `npm run context:update-vectors`: Update vector embeddings for files and concepts

## Project Structure

- `src/` - Source code
  - `components/` - React components
  - `services/` - Service modules
  - `utils/` - Utility functions
- `public/` - Static assets
- `context/` - Project documentation and guidelines
- `.cursor/` - Cursor editor configuration
  - `rules/` - Cursor rules and commands
  - `scripts/` - Context management scripts

## License

This project is licensed under the MIT License - see the LICENSE file for details.