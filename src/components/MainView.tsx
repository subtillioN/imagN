import React, { useEffect, useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Container,
  Tab,
  Tabs,
  Button,
  Grid,
  Paper,
  Card,
  CardHeader,
  CardContent,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  FormHelperText,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Snackbar,
  Alert,
  SelectChangeEvent,
  ListSubheader,
  Stack,
  ListItemButton,
  ListItemAvatar,
  Avatar,
  ListItemIcon,
  InputAdornment
} from '@mui/material';
import {
  Add as AddIcon,
  Collections as CollectionsIcon,
  Close as CloseIcon,
  Folder as FolderIcon,
  Save as SaveIcon,
  DeleteOutline as DeleteIcon,
  FolderOpen as FolderOpenIcon,
  Image as ImageIcon,
  Videocam as VideocamIcon,
  AccountTree as AccountTreeIcon,
  AddCircleOutline as AddCircleOutlineIcon,
  Search as SearchIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import DevToolsButton from './DevToolsButton';
import ThemeToggleButton from './ThemeToggleButton';
import debounce from 'lodash.debounce';
// @ts-ignore
import { workflowPresetService } from '../services/workflowPresets';
// @ts-ignore
import { WorkflowStorageService } from '../services/workflowStorage';
import { Stream } from 'xstream';
import { MainViewState } from '../types/state';
import { MainViewSources } from '../types/sources';
import { MainViewSinks } from '../types/sinks';
import { MainViewActions } from '../types/actions';
import { MainViewModel } from '../models/MainViewModel';
import { MainViewIntent } from '../intents/MainViewIntent';
import { MainViewView } from '../views/MainViewView';
import { createSource } from '../streams/core';
import { Subject } from 'rxjs';
import { NodeEditor } from './NodeEditor/NodeEditor';
import { ImageConfigView } from './ImageConfigView';
import { TagFilter } from './TagFilter';
import { Source } from 'callbag';
import subscribe from 'callbag-subscribe';
import { pipe } from 'callbag-basics';

// Sample project type for TypeScript
interface Project {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  lastModified: string;
  presetId: string;
}

// Interface for workflow presets
interface WorkflowPreset {
  id: string;
  name: string;
  description: string;
  tags: string[];
  category?: string;
  type?: string;
  nodes: WorkflowNode[];
  connections: WorkflowConnection[];
}

// Define interfaces for the services
interface PresetType extends WorkflowPreset {
  [key: string]: any;   // Allow for additional properties
}

interface MainViewProps {
  sources?: {
    state?: {
      imageConfig$?: any;
      progress$?: any;
      results$?: any;
      workflow$?: any;
    }
  }
}

interface MainViewState {
  imageConfig: any;
  progress: any;
  results: any;
  workflow: any;
  currentTab: number;
  slideDirection: 'left' | 'right';
  previousTab: number;
  isTransitioning: boolean;
  showPrevious: boolean;
  // New Project Dialog State
  newProjectDialogOpen: boolean;
  newProjectName: string;
  newProjectPreset: string;
  newProjectDescription: string;
  // Load Project Dialog State
  loadProjectDialogOpen: boolean;
  projects: Project[];
  selectedProjectId: string | null;
  // Current Project State
  currentProject: Project | null;
  // Notification State
  snackbarOpen: boolean;
  snackbarMessage: string;
  snackbarSeverity: 'success' | 'error' | 'info' | 'warning';
  // Form validation
  errors: {
    projectName?: string;
    projectPreset?: string;
  };
  formTouched: Record<string, boolean>;
  // Workflow presets
  systemPresets: WorkflowPreset[];
  userPresets: WorkflowPreset[];
  // Category, Type, and Tag filtering
  availableCategories: string[];
  availableTypes: string[];
  availableTags: string[];
  selectedCategories: string[];
  selectedTypes: string[];
  selectedTags: string[];
  tagSearchQuery: string;
  // Tag management
  tagManagementDialogOpen: boolean;
  editingPresetId: string | null;
  newTag: string;
  selectedPresetId: string | null;
  nodes: WorkflowNode[];
  connections: WorkflowConnection[];
  filters: {
    selectedCategories: Set<string>;
    selectedTypes: Set<string>;
    selectedTags: Set<string>;
    tagSearchQuery: string;
  };
}

interface WorkflowNode {
  id: string;
  type: string;
  position: { x: number; y: number };
  params?: Record<string, any>;
}

interface WorkflowConnection {
  id: string;
  from: { nodeId: string; outputId: string };
  to: { nodeId: string; inputId: string };
}

export const MainView: React.FC<MainViewProps> = (props) => {
  const [state, setState] = useState<MainViewState>({
    imageConfig: null,
    progress: null,
    results: null,
    workflow: null,
    currentTab: 0,
    slideDirection: 'left',
    previousTab: 0,
    isTransitioning: false,
    showPrevious: false,
    newProjectDialogOpen: false,
    newProjectName: '',
    newProjectPreset: '',
    newProjectDescription: '',
    loadProjectDialogOpen: false,
    projects: [],
    selectedProjectId: null,
    currentProject: null,
    snackbarOpen: false,
    snackbarMessage: '',
    snackbarSeverity: 'info',
    errors: {},
    formTouched: {},
    systemPresets: [],
    userPresets: [],
    availableCategories: [],
    availableTypes: [],
    availableTags: [],
    selectedCategories: [],
    selectedTypes: [],
    selectedTags: [],
    tagSearchQuery: '',
    tagManagementDialogOpen: false,
    editingPresetId: null,
    newTag: '',
    selectedPresetId: null,
    nodes: [],
    connections: [],
    filters: {
      selectedCategories: new Set<string>(),
      selectedTypes: new Set<string>(),
      selectedTags: new Set<string>(),
      tagSearchQuery: ''
    }
  });

  const workflowStorage = new WorkflowStorageService();
  const projectNameInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Initialize streams from props if they exist
    if (props.sources?.state) {
      const { imageConfig$, progress$, results$, workflow$ } = props.sources.state;
      
      const unsubscribes: Array<() => void> = [];

      if (imageConfig$) {
        const unsub = pipe(
          imageConfig$,
          subscribe((imageConfig: any) => setState(prev => ({ ...prev, imageConfig })))
        );
        if (typeof unsub === 'function') {
          unsubscribes.push(unsub);
        }
      }

      if (progress$) {
        const unsub = pipe(
          progress$,
          subscribe((progress: any) => setState(prev => ({ ...prev, progress })))
        );
        if (typeof unsub === 'function') {
          unsubscribes.push(unsub);
        }
      }

      if (results$) {
        const unsub = pipe(
          results$,
          subscribe((results: any) => setState(prev => ({ ...prev, results })))
        );
        if (typeof unsub === 'function') {
          unsubscribes.push(unsub);
        }
      }

      if (workflow$) {
        const unsub = pipe(
          workflow$,
          subscribe((workflow: any) => setState(prev => ({ ...prev, workflow })))
        );
        if (typeof unsub === 'function') {
          unsubscribes.push(unsub);
        }
      }

      // Cleanup subscriptions
      return () => {
        unsubscribes.forEach(unsub => unsub());
      };
    }
  }, [props.sources]);

  useEffect(() => {
    // Load presets on mount
    loadPresets();
  }, []);

  const loadPresets = async () => {
    try {
      const [systemPresets, userPresets] = await Promise.all([
        workflowStorage.getSystemPresets(),
        workflowStorage.getUserPresets()
      ]);

      setState(prev => ({
        ...prev,
        systemPresets,
        userPresets
      }));

      updateAvailableFilters(systemPresets, userPresets);
    } catch (error) {
      console.error('Error loading presets:', error);
      showNotification('Error loading presets', 'error');
    }
  };

  // Convert class methods to functions
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setState(prev => ({
      ...prev,
      previousTab: prev.currentTab,
      currentTab: newValue,
      slideDirection: newValue > prev.currentTab ? 'left' : 'right',
      isTransitioning: true,
      showPrevious: true
    }));
  };

  const handleCloseSnackbar = () => {
    setState(prev => ({ ...prev, snackbarOpen: false }));
  };

  const showNotification = (message: string, severity: 'success' | 'error' | 'info' | 'warning') => {
    setState(prev => ({
      ...prev,
      snackbarOpen: true,
      snackbarMessage: message,
      snackbarSeverity: severity
    }));
  };

  const updateAvailableFilters = (systemPresets: WorkflowPreset[], userPresets: WorkflowPreset[]) => {
    const allPresets = [...systemPresets, ...userPresets];
    const categories = new Set(allPresets.map(preset => preset.category || '').filter(cat => cat !== ''));
    const types = new Set(allPresets.map(preset => preset.type || '').filter(type => type !== ''));
    const tags = new Set(allPresets.flatMap(preset => preset.tags || []));

    setState(prev => ({
      ...prev,
      availableCategories: Array.from(categories) as string[],
      availableTypes: Array.from(types) as string[],
      availableTags: Array.from(tags)
    }));
  };

  const renderHeader = () => (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Image Processing Workflow
        </Typography>
        <IconButton
          data-testid="new-project-button"
          color="inherit"
          onClick={() => setState(prev => ({ ...prev, newProjectDialogOpen: true }))}
        >
          <AddIcon />
        </IconButton>
        <IconButton
          data-testid="load-project-button"
          color="inherit"
          onClick={() => setState(prev => ({ ...prev, loadProjectDialogOpen: true }))}
        >
          <FolderOpenIcon />
        </IconButton>
        <IconButton
          data-testid="tag-management-button"
          color="inherit"
          onClick={() => setState(prev => ({ ...prev, tagManagementDialogOpen: true }))}
        >
          <AccountTreeIcon />
        </IconButton>
        <ThemeToggleButton />
        <DevToolsButton />
      </Toolbar>
    </AppBar>
  );

  const renderContent = () => (
    <Container maxWidth="xl" sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', py: 2 }}>
      <Tabs value={state.currentTab} onChange={handleTabChange} sx={{ mb: 2 }}>
        <Tab label="Workflow" data-testid="workflow-tab" />
        <Tab label="Progress" data-testid="progress-tab" />
        <Tab label="Results" data-testid="results-tab" />
      </Tabs>
      {state.currentTab === 0 && (
        <NodeEditor
          data-testid="node-editor"
          nodes={state.nodes}
          onNodesChange={() => {}}
          onConnectionsChange={() => {}}
        />
      )}
      {state.currentTab === 1 && (
        <Box data-testid="progress-view">
          <Typography>Progress View</Typography>
        </Box>
      )}
      {state.currentTab === 2 && (
        <Box data-testid="results-view">
          <Typography>Results View</Typography>
        </Box>
      )}
    </Container>
  );

  const renderFooter = () => (
    <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
      <Typography variant="body2" color="text.secondary" align="center">
        © 2024 Image Processing Workflow
      </Typography>
    </Box>
  );

  const renderNewProjectDialog = () => (
    <Dialog 
      open={state.newProjectDialogOpen} 
      onClose={() => setState(prev => ({ ...prev, newProjectDialogOpen: false }))}
    >
      <DialogTitle>Create New Project</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          id="projectName"
          label="Project Name"
          fullWidth
          variant="outlined"
          value={state.newProjectName}
          onChange={(e) => setState(prev => ({ ...prev, newProjectName: e.target.value }))}
          error={!!state.errors.projectName}
          helperText={state.errors.projectName}
        />
        <TextField
          margin="dense"
          id="projectDescription"
          label="Description"
          fullWidth
          multiline
          rows={4}
          variant="outlined"
          value={state.newProjectDescription}
          onChange={(e) => setState(prev => ({ ...prev, newProjectDescription: e.target.value }))}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setState(prev => ({ ...prev, newProjectDialogOpen: false }))}>Cancel</Button>
        <Button onClick={() => {/* Handle create project */}}>Create</Button>
      </DialogActions>
    </Dialog>
  );

  const renderLoadProjectDialog = () => (
    <Dialog 
      open={state.loadProjectDialogOpen} 
      onClose={() => setState(prev => ({ ...prev, loadProjectDialogOpen: false }))}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>Load Project</DialogTitle>
      <DialogContent>
        <List>
          {state.projects.map((project) => (
            <ListItem key={project.id}>
              <ListItemText 
                primary={project.name}
                secondary={project.description}
              />
              <ListItemSecondaryAction>
                <Button onClick={() => {/* Handle load project */}}>Load</Button>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setState(prev => ({ ...prev, loadProjectDialogOpen: false }))}>Close</Button>
      </DialogActions>
    </Dialog>
  );

  const renderTagManagementDialog = () => (
    <Dialog 
      open={state.tagManagementDialogOpen} 
      onClose={() => setState(prev => ({ ...prev, tagManagementDialogOpen: false }))}
    >
      <DialogTitle>Manage Tags</DialogTitle>
      <DialogContent>
        <TextField
          margin="dense"
          id="newTag"
          label="New Tag"
          fullWidth
          variant="outlined"
          value={state.newTag}
          onChange={(e) => setState(prev => ({ ...prev, newTag: e.target.value }))}
        />
        <List>
          {state.availableTags.map((tag) => (
            <ListItem key={tag}>
              <ListItemText primary={tag} />
              <ListItemSecondaryAction>
                <IconButton edge="end" aria-label="delete">
                  <DeleteIcon />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setState(prev => ({ ...prev, tagManagementDialogOpen: false }))}>Close</Button>
      </DialogActions>
    </Dialog>
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {renderHeader()}
      {renderContent()}
      {renderFooter()}
      {renderNewProjectDialog()}
      {renderLoadProjectDialog()}
      {renderTagManagementDialog()}
      <Snackbar
        open={state.snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert onClose={handleCloseSnackbar} severity={state.snackbarSeverity}>
          {state.snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default MainView; 