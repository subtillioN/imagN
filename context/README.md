# Context Directory

This directory contains all the documentation and context files for the imagN project. It serves as a central repository for project guidelines, architecture documentation, progress tracking, and other important information.

## Contents

### Project Documentation
- [PRD.md](PRD.md) - Product Requirements Document
- [app-flow.md](app-flow.md) - Application Flow Documentation
- [implementation_plan.md](implementation_plan.md) - Implementation Plan
- [phase1-tasks.md](phase1-tasks.md) - Phase 1 Tasks

### Technical Documentation
- [tech-stack.md](tech-stack.md) - Technology Stack Documentation
- [backend-structure.md](backend-structure.md) - Backend Structure Documentation
- [workflow-preset-system.md](workflow-preset-system.md) - Workflow Preset System Documentation

### Development Guidelines
- [frontend-guidelines.md](frontend-guidelines.md) - Frontend Development Guidelines
- [documentation-style-guide.md](documentation-style-guide.md) - Documentation Style Guide
- [cursor-rules.md](cursor-rules.md) - Cursor Editor Rules
- [dev-tools.md](dev-tools.md) - Development Tools Documentation
- [dev-tools-requirements.md](dev-tools-requirements.md) - Development Tools Requirements
- [local-dev-setup.md](local-dev-setup.md) - Local Development Setup Instructions

### Project Management
- [progress-tracking.md](progress-tracking.md) - Project Progress Tracking
- [buglog.md](buglog.md) - Bug Tracking Log
- [task-visualization.md](task-visualization.md) - Task Visualization

### Context Management System
- [codebase-summary.md](codebase-summary.md) - High-level overview of the entire codebase
- [codebase-outline.md](codebase-outline.md) - Detailed structure and organization of the codebase
- [context-management.md](context-management.md) - Documentation for the context management system
- [vector-embeddings.json](vector-embeddings.json) - Vector embeddings of key files and concepts

## Context Files

- `progress-tracking.md`: Tracks ongoing development progress across different phases
- `buglog.md`: Documents bugs, their status, and resolution details
- `preset-system.md`: Explains the workflow preset system architecture
- `app-flow.md`: Documents application flow and architecture
- `codebase-summary.md`: Provides a high-level overview of the codebase
- `codebase-outline.md`: Details the structure and organization of the codebase
- `context-management.md`: Documentation for the context management system
- `new-issues-log.md`: Testing department's log for tracking new issues before being processed
- `new-features-log.md`: Testing department's log for tracking new feature requests before being processed
- `category-tag-implementation.md`: Implementation plan for the category and tag system

## Commands

- `/load-context <profile-name>`: Load a named context profile
- `/save-context <profile-name> [description]`: Save current context to a profile
- `/list-contexts`: List available context profiles
- `/create-context <profile-name> [files] [concepts] [description]`: Create a new context profile
- `/update-vectors`: Update vector embeddings for files and concepts
- `/context-update`: Process new issues and feature requests from the testing department logs and update task lists

## Purpose

The context directory provides a comprehensive overview of the project, its architecture, and development guidelines. It serves as a reference for developers, designers, and other stakeholders to understand the project's goals, structure, and progress.

## Usage

When working on the project, refer to these documents for guidance on:
- Project requirements and specifications
- Technical architecture and design decisions
- Development guidelines and best practices
- Project progress and bug tracking
- Codebase structure and organization

## Maintenance

These documents should be kept up-to-date as the project evolves. When making significant changes to the project, be sure to update the relevant documentation to reflect those changes. 