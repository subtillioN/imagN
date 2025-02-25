# Bug Log

This document tracks bugs, issues, and their resolution status throughout the development of the imagN application.

## Active Bugs

| ID | Description | Component | Priority | Status | Reported Date |
| B015 | need padding above the "Project Name" input field on the  | UI/UX | Medium | Needs Fix | 2025-02-25 |
|----|-------------|-----------|----------|--------|--------------|
| B001 | Context menu positioning is inconsistent in dark mode | UI/UX | Medium | Under Investigation | 2024-02-23 |
| B002 | Memory leak observed in node editor canvas after multiple edits | Node Editor | High | Needs Fix | 2024-02-24 |
| B003 | Font rendering appears blurry on high DPI displays | UI/UX | Low | Needs Fix | 2024-02-24 |
| B004 | Performance degradation when loading large node graphs | Node Editor | Medium | Under Investigation | 2024-02-24 |
| B005 | Audio playback fails to start in video preview component | Video Workspace | High | Needs Fix | 2024-02-24 |

## Fixed Bugs

| ID | Description | Component | Priority | Fixed Date | Fix Description |
|----|-------------|-----------|----------|------------|----------------|
| B006 | ListItem component type errors in Load Project dialog | Project Management | High | 2024-03-24 | Replaced ListItem with Box containing Button for better type safety and visual representation |
| B007 | Project name validation too restrictive (requiring 3+ characters) | Project Management | Medium | 2024-03-24 | Modified validation to allow single character names while preventing duplicates |
| B008 | New Project dialog doesn't automatically focus the project name field | UI/UX | Low | 2024-03-24 | Implemented focus management using React refs and componentDidUpdate lifecycle method |
| B009 | Project name "Glll" incorrectly flagged as duplicate | Project Management | High | 2024-03-25 | Removed special case handling and improved validation logic to use strict equality for comparisons |
| B010 | Project type distinction causing confusion in UI | Project Management | Medium | 2024-03-25 | Refactored to use workflow presets as project types, removing the artificial distinction |
| B011 | Missing RxJS dependency causing application startup errors | Dependencies | Critical | 2024-03-25 | Installed RxJS package with --legacy-peer-deps flag to resolve dependency conflicts |
| B012 | New project presets not selectable in dropdown | Project Management | High | 2024-03-25 | Unified preset system with consistent data structure and improved preset loading in componentDidMount |
| B013 | Inconsistent preset categorization between system and user presets | Project Management | Medium | 2024-03-25 | Implemented a unified category-based system with 'default' and 'user' categories for all presets |
| B014 | Preset selection UI lacked clear visual separation | UI/UX | Medium | 2024-03-25 | Enhanced the preset dropdown with improved styling, subheaders, and a divider between system and user presets |
| [FIX-001] | UI rendering issue in the sidebar navigation - Fixed margins and padding | UI/UX | Medium | 2024-03-25 | Updated margins and padding to improve layout consistency |
| [FIX-002] | Correct typings for project and workflow interfaces | Project Management | Medium | 2024-03-25 | Updated interfaces to use consistent naming conventions and data structures |
| [FIX-003] | Fixed preset selection in New Project dialog not displaying or allowing selection of presets | Project Management | High | 2024-03-25 | Updated MainView component to set default preset and improve UI rendering |

## Issues Under Review

| ID | Description | Component | Priority | Status | Reported Date |
|----|-------------|-----------|----------|--------|--------------|
| I001 | Category system needs redesign for better organization | Workflow Presets | High | In Progress | 2025-02-25 |
| I002 | Consider adding tag-based filtering for presets | UI/UX | Medium | Open | 2025-02-25 |
| I003 | Evaluate alternatives for current node connection visualization | Node Editor | Medium | Open | 2024-02-24 |
| I004 | Research better compression methods for video export | Video Workspace | Low | Open | 2024-02-24 |
| I005 | Evaluate user experience of the workflow preset selection | Project Management | Medium | Open | 2024-03-25 |
| I006 | Consider adding preset thumbnails for visual selection | UI/UX | Medium | Open | 2024-03-25 |
| I007 | Investigate preset forking functionality for user customization | Project Management | Medium | Open | 2024-03-25 |

## Notes on Bug Reporting

When adding new bugs, please follow this format:
- Assign a unique ID (B for bugs, I for issues under review)
- Provide a clear, concise description
- Specify which component is affected
- Set an appropriate priority (Low, Medium, High, Critical)
- Track the status (Needs Fix, Under Investigation, In Progress, Fixed)
- Include the date when reported or fixed
- For fixed bugs, include a brief description of the fix

## Dev Tools Button Positioning Bug
### Issue Overview
Tracking the positioning challenges and resolution attempts for the developer tools button component in the application interface.

### Current Implementation
```css
.dev-tools-button {
  position: fixed;
  top: 1rem;
  right: 1rem;
  /* ... other styles ... */
}
```

### Observed Issues
### 1. Z-Index Conflicts
- **Symptom**: Button occasionally appears behind other UI elements
- **Current Fix**: Added `z-index: 9999` to ensure button stays on top
- **Status**: Partially resolved, but may need adjustment based on specific view contexts

### 2. Responsive Behavior
- **Symptom**: Button position not optimal on different viewport sizes
- **Current Implementation**: Fixed positioning with rem units
- **Potential Improvements**: 
  - Consider percentage-based positioning for better responsiveness
  - Add media queries for different device sizes

### 3. Tooltip Overflow
- **Symptom**: Tooltip text sometimes extends beyond viewport on smaller screens
- **Current Solution**: Using transform and absolute positioning
- **To-Do**: 
  - Add viewport boundary detection
  - Implement dynamic tooltip positioning

### Resolution Attempts

#### Attempt 1: Fixed Positioning
```css
.dev-tools-button {
  position: fixed;
  top: 1rem;
  right: 1rem;
}
```
- **Result**: Basic positioning achieved
- **Issues**: 
  - Z-index conflicts with other fixed elements
  - Potential overflow on mobile devices

#### Attempt 2: Z-Index Adjustment
```css
.dev-tools-button {
  position: fixed;
  top: 1rem;
  right: 1rem;
  z-index: 9999;
}
```
- **Result**: Improved visibility
- **Issues**: 
  - May need context-specific z-index values
  - Potential conflicts with modal overlays

#### Attempt 3: Tooltip Position Enhancement
```css
.tooltip-container:hover::after {
  position: absolute;
  bottom: -30px;
  left: 50%;
  transform: translateX(-50%);
}
```
- **Result**: Centered tooltip alignment
- **Issues**: 
  - Potential viewport overflow
  - Need for dynamic positioning logic

### Next Steps
1. Implement viewport boundary detection for tooltip
2. Add responsive positioning using media queries
3. Create z-index management system for consistent layering
4. Test positioning across different device sizes and orientations

### References
- [Dev Tools Requirements](dev-tools-requirements.md)
- [Frontend Guidelines](frontend-guidelines.md)

### Status
- **Current Status**: In Progress
- **Priority**: Medium
- **Impact**: UI/UX
- **Last Updated**: March 25, 2024