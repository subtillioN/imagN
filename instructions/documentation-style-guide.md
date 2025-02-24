# ImagN Documentation Style Guide

This guide establishes consistent visualization standards for all ImagN project documentation.

## Mermaid Diagram Standards

### Theme Configuration

All Mermaid diagrams should use the dark theme configuration:

```mermaid
%%{init: {'theme':'dark'}}%%
```

### Color Palette

Use these specific colors for different diagram components:

- Primary Features: `#1a237e` (Deep Blue)
- Secondary Features: `#0d47a1` (Medium Blue)
- Video Processing: `#4a148c` (Deep Purple)
- Workflow Management: `#e65100` (Deep Orange)
- Advanced Features: `#bf360c` (Burnt Orange)
- Frontend Components: `#283593` (Indigo)
- Backend Components: `#880e4f` (Deep Pink)
- External Services: `#e65100` (Deep Orange)
- Refactoring Tasks: `#1b5e20` (Deep Green)

### Typography

- Use Title Case for node labels
- Keep labels concise (2-4 words)
- Use brackets [] for all node labels

### Layout Guidelines

#### Flow Diagrams
- Use `graph TD` for top-down process flows
- Use `graph LR` for left-right relationship diagrams
- Use `graph TB` for technical architecture

#### Subgraphs
- Group related components using subgraphs
- Use clear, descriptive subgraph titles

Example:
```mermaid
%%{init: {'theme':'dark'}}%%
graph TB
    subgraph Frontend
        A[Component A] --> B[Component B]
    end
```

### Progress Visualization

Use pie charts for progress tracking with consistent color coding:

```mermaid
%%{init: {'theme':'dark'}}%%
pie title Progress
    "Completed" : 30
    "In Progress" : 40
    "Planned" : 30
```

## Document Structure

### Headings Hierarchy
- H1: Document Title
- H2: Major Sections
- H3: Subsections
- H4: Detailed Topics

### Content Organization
1. Start with a brief overview
2. Follow with main content sections
3. Include examples where applicable
4. End with relevant notes or references

## Best Practices

1. **Consistency**
   - Maintain consistent styling across all diagrams
   - Use the same color scheme for similar components
   - Follow the same layout patterns for similar information

2. **Readability**
   - Keep diagrams focused and uncluttered
   - Use appropriate spacing between nodes
   - Include legends when necessary

3. **Maintainability**
   - Comment complex diagram sections
   - Document any custom styling
   - Keep diagrams modular and focused

## Notes
- Always preview diagrams to ensure proper rendering
- Update this guide as new visualization needs emerge
- Ensure accessibility by using sufficient contrast ratios