import React, { Component, createRef } from 'react';
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
  Chip
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
  AddCircleOutline as AddCircleOutlineIcon
} from '@mui/icons-material';
import DevToolsButton from './DevToolsButton';
import ThemeToggleButton from './ThemeToggleButton';
import debounce from 'lodash.debounce';
// @ts-ignore
import { workflowPresetService } from '../services/workflowPresets';
// @ts-ignore
import { WorkflowStorageService } from '../services/workflowStorage';

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
  category: string;       // Primary category (e.g., 'image', 'video', 'node')
  type: string;           // Type of preset (e.g., 'generation', 'editing', 'custom')
  tags: string[];         // Additional tags for filtering
  categories?: string[];  // Kept for backward compatibility
}

// Define interfaces for the services
interface PresetType {
  id: string;
  name: string;
  description: string;
  category: string;       // Primary category (e.g., 'image', 'video', 'node')
  type: string;           // Type of preset (e.g., 'generation', 'editing', 'custom')
  tags: string[];         // Additional tags for filtering
  categories?: string[];  // Kept for backward compatibility
  [key: string]: any;     // Allow for additional properties
}

interface MainViewProps {
  sources?: {
    state?: {
      imageConfig$?: any;
      progress$?: any;
      results$?: any;
    }
  }
}

interface MainViewState {
  imageConfig: any;
  progress: any;
  results: any;
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
  formTouched: {
    projectName: boolean;
    projectPreset: boolean;
  };
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
}

export class MainView extends Component<MainViewProps, MainViewState> {
  private imageConfig$: any;
  private progress$: any;
  private results$: any;
  private transitionTimeout: NodeJS.Timeout | null = null;
  private animationTimeout: NodeJS.Timeout | null = null;
  private projectNameInputRef = React.createRef<HTMLInputElement>();
  private debouncedValidateProjectName: (value: string) => void;
  private workflowStorage: WorkflowStorageService;

  constructor(props: MainViewProps) {
    super(props);
    
    // Initialize workflow storage service
    this.workflowStorage = new WorkflowStorageService();
    
    // Load presets
    const systemImagePresets: WorkflowPreset[] = [];
    const systemVideoPresets: WorkflowPreset[] = [];
    const userPresets: WorkflowPreset[] = [];
    
    // We'll populate these in componentDidMount
    
    this.state = {
      imageConfig: {},
      progress: {},
      results: {},
      currentTab: 0,
      slideDirection: 'left',
      previousTab: 0,
      isTransitioning: false,
      showPrevious: false,
      // New Project Dialog State
      newProjectDialogOpen: false,
      newProjectName: '',
      newProjectPreset: '',
      newProjectDescription: '',
      // Load Project Dialog State
      loadProjectDialogOpen: false,
      projects: this.getSampleProjects(), // Load sample projects for demo
      selectedProjectId: null,
      // Current Project State
      currentProject: null,
      // Notification State
      snackbarOpen: false,
      snackbarMessage: '',
      snackbarSeverity: 'success',
      // Form validation
      errors: {},
      formTouched: {
        projectName: false,
        projectPreset: false
      },
      // Workflow presets
      systemPresets: [],
      userPresets: [],
      // Category, Type, and Tag filtering
      availableCategories: [],
      availableTypes: [],
      availableTags: [],
      selectedCategories: [],
      selectedTypes: [],
      selectedTags: []
    };
    this.initializeStreams();

    // Bind methods
    this.handleTabChange = this.handleTabChange.bind(this);
    this.handleNewProjectClick = this.handleNewProjectClick.bind(this);
    this.handleNewProjectDialogClose = this.handleNewProjectDialogClose.bind(this);
    this.handleNewProjectCreate = this.handleNewProjectCreate.bind(this);
    this.validateField = this.validateField.bind(this);
    this.validateForm = this.validateForm.bind(this);
    // New method bindings for Load/Save
    this.handleLoadProjectClick = this.handleLoadProjectClick.bind(this);
    this.handleLoadProjectDialogClose = this.handleLoadProjectDialogClose.bind(this);
    this.handleProjectSelect = this.handleProjectSelect.bind(this);
    this.handleLoadSelectedProject = this.handleLoadSelectedProject.bind(this);
    this.handleSaveProject = this.handleSaveProject.bind(this);
    this.handleCloseSnackbar = this.handleCloseSnackbar.bind(this);
    this.handleDeleteProject = this.handleDeleteProject.bind(this);
    
    // Initialize the debounced function
    this.debouncedValidateProjectName = debounce((value: string) => {
      const newErrors = this.validateField('projectName', value);
      this.setState(prevState => ({ 
        errors: { ...prevState.errors, ...newErrors }
      }));
    }, 300);
  }

  initializeStreams() {
    if (!this.props.sources || !this.props.sources.state) return;

    this.imageConfig$ = this.props.sources.state.imageConfig$ || {};
    this.progress$ = this.props.sources.state.progress$ || {};
    this.results$ = this.props.sources.state.results$ || {};

    if (this.imageConfig$.subscribe) {
      this.imageConfig$.subscribe((config: any) => {
        this.setState({ imageConfig: config });
      });
    }

    if (this.progress$.subscribe) {
      this.progress$.subscribe((progress: any) => {
        this.setState({ progress });
      });
    }

    if (this.results$.subscribe) {
      this.results$.subscribe((results: any) => {
        this.setState({ results });
      });
    }
  }

  componentDidMount() {
    this.initializeStreams();
    
    // Load all presets
    workflowPresetService.getAllPresets().subscribe((presets: PresetType[]) => {
      const systemPresets = presets
        .filter((preset: PresetType) => preset.categories.includes('default'))
        .map((preset: PresetType) => ({
          id: preset.id,
          name: preset.name,
          description: preset.description,
          category: preset.category,
          type: preset.type,
          tags: preset.tags,
          categories: preset.categories || []
        }));
      
      this.setState({
        systemPresets: systemPresets,
        // Set a default preset when presets are loaded
        newProjectPreset: systemPresets.length > 0 ? systemPresets[0].id : ''
      });
      
      // Get all unique categories, types, and tags
      this.updateAvailableFilters(systemPresets, this.state.userPresets);
    });
    
    // Load user-defined presets
    const userWorkflows = this.workflowStorage.getAllWorkflows();
    const userWorkflowPresets = userWorkflows.map((workflow: any) => ({
      id: workflow.id,
      name: workflow.name,
      description: workflow.description || 'User-defined workflow',
      category: workflow.category || 'user',
      type: workflow.type || 'custom',
      tags: workflow.tags || [],
      categories: workflow.categories || ['user']
    }));
    
    this.setState({
      userPresets: userWorkflowPresets
    });
    
    // Get all unique categories, types, and tags
    this.updateAvailableFilters(this.state.systemPresets, userWorkflowPresets);
  }

  componentDidUpdate(prevProps: MainViewProps, prevState: MainViewState) {
    // Focus the project name input when the dialog opens
    if (!prevState.newProjectDialogOpen && this.state.newProjectDialogOpen) {
      // Use setTimeout to ensure the dialog is fully rendered before focusing
      setTimeout(() => {
        if (this.projectNameInputRef.current) {
          this.projectNameInputRef.current.focus();
        }
      }, 100);
    }
  }

  componentWillUnmount() {
    // Clear any pending timeouts to prevent memory leaks
    if (this.transitionTimeout) {
      clearTimeout(this.transitionTimeout);
    }
    if (this.animationTimeout) {
      clearTimeout(this.animationTimeout);
    }
  }

  handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    const { currentTab } = this.state;
    
    // If we're already on this tab, do nothing
    if (newValue === currentTab) return;
    
    // Determine slide direction
    const slideDirection = newValue > currentTab ? 'left' : 'right';
    
    // Set transitioning state
    this.setState({
      isTransitioning: true,
      slideDirection,
      previousTab: currentTab
    });
    
    // After a short delay, update the current tab
    setTimeout(() => {
      this.setState({
        currentTab: newValue,
        isTransitioning: false
      });
    }, 300); // Match this with the transition duration in CSS
  };

  // New Project methods
  handleNewProjectClick() {
    this.setState({ 
      newProjectDialogOpen: true,
      newProjectName: '',
      newProjectPreset: '',
      newProjectDescription: '',
      errors: {},
      formTouched: {
        projectName: false,
        projectPreset: false
      }
    });
  }

  handleNewProjectDialogClose() {
    this.setState({ newProjectDialogOpen: false });
  }

  validateField(field: string, value: string) {
    const errors: any = {};
    
    switch (field) {
      case 'projectName':
        const trimmedInputValue = value.trim();
        
        if (!trimmedInputValue) {
          errors.projectName = 'Project name is required';
          break;
        }
        
        if (trimmedInputValue.length > 50) {
          errors.projectName = 'Project name must be less than 50 characters';
          break;
        }
        
        // Check for duplicate project names
        const { projects } = this.state;
        
        for (const project of projects) {
          if (project.name.trim().toLowerCase() === trimmedInputValue.toLowerCase()) {
            errors.projectName = 'A project with this name already exists';
            break;
          }
        }
        break;
        
      case 'projectPreset':
        if (!value) {
          errors.projectPreset = 'Please select a preset';
        }
        break;
    }
    
    this.setState(prevState => ({
      errors: { ...prevState.errors, ...errors }
    }));
    
    return errors;
  }

  validateForm() {
    const { newProjectName, newProjectPreset } = this.state;
    
    // Mark all fields as touched
    this.setState({
      formTouched: {
        projectName: true,
        projectPreset: true
      }
    });

    // Validate all fields
    const nameErrors = this.validateField('projectName', newProjectName);
    const presetErrors = this.validateField('projectPreset', newProjectPreset);
    
    const combinedErrors = {
      ...nameErrors,
      ...presetErrors
    };
    
    this.setState({ errors: combinedErrors });
    
    // Form is valid if there are no errors
    return Object.keys(combinedErrors).length === 0;
  }

  handleNewProjectCreate() {
    const { newProjectName, newProjectPreset, newProjectDescription } = this.state;
    
    // Validate all fields
    const nameErrors = this.validateField('projectName', newProjectName);
    const presetErrors = this.validateField('projectPreset', newProjectPreset);
    
    // Check if there are any errors
    if (nameErrors.projectName || presetErrors.projectPreset) {
      this.setState({
        formTouched: {
          projectName: true,
          projectPreset: true
        }
      });
      return;
    }
    
    // Create new project
    const newProject: Project = {
      id: `project-${Date.now()}`,
      name: newProjectName.trim(),
      description: newProjectDescription,
      createdAt: new Date().toISOString(),
      lastModified: new Date().toISOString(),
      presetId: newProjectPreset
    };
    
    // Add to projects list
    this.setState(prevState => ({
      projects: [...prevState.projects, newProject],
      currentProject: newProject,
      newProjectDialogOpen: false,
      newProjectName: '',
      newProjectPreset: '',
      newProjectDescription: '',
      snackbarOpen: true,
      snackbarMessage: 'Project created successfully!',
      snackbarSeverity: 'success',
      errors: {},
      formTouched: {
        projectName: false,
        projectPreset: false
      }
    }));
  }

  renderNewProjectDialog() {
    const { 
      newProjectDialogOpen, 
      newProjectName, 
      newProjectPreset,
      newProjectDescription, 
      errors, 
      formTouched,
      systemPresets,
      userPresets,
      availableCategories,
      availableTypes,
      availableTags,
      selectedCategories,
      selectedTypes,
      selectedTags
    } = this.state;

    // If no presets are available, don't render the dialog yet
    if (systemPresets.length === 0) {
      return null;
    }
    
    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      
      this.setState({ 
        newProjectName: value,
        formTouched: { ...formTouched, projectName: true }
      });
      
      // Debounce the validation
      this.debouncedValidateProjectName(value);
    };

    const handlePresetChange = (e: SelectChangeEvent) => {
      const value = e.target.value;
      const newErrors = this.validateField('projectPreset', value);
      
      this.setState({ 
        newProjectPreset: value,
        formTouched: { ...formTouched, projectPreset: true },
        errors: { ...errors, ...newErrors }
      });
      
      // Log the selected preset for debugging
      console.log('Selected preset:', value);
    };
    
    const handleCategoryToggle = (category: string) => {
      this.setState(prevState => {
        const currentSelectedCategories = [...prevState.selectedCategories];
        const categoryIndex = currentSelectedCategories.indexOf(category);
        
        if (categoryIndex === -1) {
          // Add the category
          currentSelectedCategories.push(category);
        } else {
          // Remove the category
          currentSelectedCategories.splice(categoryIndex, 1);
        }
        
        return { selectedCategories: currentSelectedCategories };
      });
    };
    
    const handleTypeToggle = (type: string) => {
      this.setState(prevState => {
        const currentSelectedTypes = [...prevState.selectedTypes];
        const typeIndex = currentSelectedTypes.indexOf(type);
        
        if (typeIndex === -1) {
          // Add the type
          currentSelectedTypes.push(type);
        } else {
          // Remove the type
          currentSelectedTypes.splice(typeIndex, 1);
        }
        
        return { selectedTypes: currentSelectedTypes };
      });
    };
    
    const handleTagToggle = (tag: string) => {
      this.setState(prevState => {
        const currentSelectedTags = [...prevState.selectedTags];
        const tagIndex = currentSelectedTags.indexOf(tag);
        
        if (tagIndex === -1) {
          // Add the tag
          currentSelectedTags.push(tag);
        } else {
          // Remove the tag
          currentSelectedTags.splice(tagIndex, 1);
        }
        
        return { selectedTags: currentSelectedTags };
      });
    };
    
    // Filter presets based on selected categories, types, and tags
    const filterPresets = (presets: WorkflowPreset[]) => {
      // Start with all presets
      let filteredPresets = [...presets];
      
      // Filter by category if any selected
      if (selectedCategories.length > 0) {
        filteredPresets = filteredPresets.filter(preset => 
          selectedCategories.includes(preset.category)
        );
      }
      
      // Filter by type if any selected
      if (selectedTypes.length > 0) {
        filteredPresets = filteredPresets.filter(preset => 
          selectedTypes.includes(preset.type)
        );
      }
      
      // Filter by tags if any selected
      if (selectedTags.length > 0) {
        filteredPresets = filteredPresets.filter(preset => 
          selectedTags.some(tag => preset.tags.includes(tag))
        );
      }
      
      return filteredPresets;
    };
    
    // Apply filtering
    const filteredSystemPresets = filterPresets(systemPresets);
    const filteredUserPresets = filterPresets(userPresets);
    
    // Combine all presets for the dropdown
    const allPresets = [
      ...(filteredSystemPresets.map(preset => ({...preset, isSystem: true}))),
      ...(filteredUserPresets.map(preset => ({...preset, isSystem: false})))
    ];

    return (
      <Dialog 
        open={newProjectDialogOpen} 
        onClose={this.handleNewProjectDialogClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: 1,
          borderColor: 'divider',
          pb: 2
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <AddCircleOutlineIcon sx={{ mr: 1 }} />
            Create New Project
          </Box>
          <IconButton 
            aria-label="close" 
            onClick={this.handleNewProjectDialogClose}
            size="small"
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Box sx={{ mb: 2 }}>
            <TextField
              fullWidth
              label="Project Name"
              variant="outlined"
              value={newProjectName}
              onChange={handleNameChange}
              onBlur={() => this.setState({ formTouched: { ...formTouched, projectName: true } })}
              error={formTouched.projectName && Boolean(errors.projectName)}
              helperText={formTouched.projectName && errors.projectName}
              margin="normal"
              autoFocus
            />
          </Box>
          
          {/* Filter section */}
          <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
            <Typography variant="subtitle1" gutterBottom>
              Filter Presets
            </Typography>
            
            {/* Categories */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Categories:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {availableCategories.map(category => (
                  <Chip
                    key={category}
                    label={category}
                    onClick={() => handleCategoryToggle(category)}
                    color={selectedCategories.includes(category) ? "primary" : "default"}
                    variant={selectedCategories.includes(category) ? "filled" : "outlined"}
                    sx={{ textTransform: 'capitalize' }}
                  />
                ))}
              </Box>
            </Box>
            
            {/* Types */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Types:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {availableTypes.map(type => (
                  <Chip
                    key={type}
                    label={type}
                    onClick={() => handleTypeToggle(type)}
                    color={selectedTypes.includes(type) ? "secondary" : "default"}
                    variant={selectedTypes.includes(type) ? "filled" : "outlined"}
                    sx={{ textTransform: 'capitalize' }}
                  />
                ))}
              </Box>
            </Box>
            
            {/* Tags */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Tags:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {availableTags.map(tag => (
                  <Chip
                    key={tag}
                    label={tag}
                    onClick={() => handleTagToggle(tag)}
                    color={selectedTags.includes(tag) ? "success" : "default"}
                    variant={selectedTags.includes(tag) ? "filled" : "outlined"}
                    sx={{ textTransform: 'capitalize' }}
                  />
                ))}
              </Box>
            </Box>
          </Box>
          
          <Box sx={{ mb: 2 }}>
            <FormControl 
              fullWidth 
              variant="outlined"
              margin="normal"
              error={formTouched.projectPreset && Boolean(errors.projectPreset)}
            >
              <InputLabel id="project-preset-label">Workflow Preset</InputLabel>
              <Select
                labelId="project-preset-label"
                value={newProjectPreset}
                label="Workflow Preset"
                onChange={handlePresetChange}
                onBlur={() => this.setState({ formTouched: { ...formTouched, projectPreset: true } })}
                MenuProps={{
                  PaperProps: {
                    style: {
                      maxHeight: 300
                    }
                  }
                }}
              >
                {/* System presets */}
                {filteredSystemPresets.length > 0 && (
                  <>
                    <ListSubheader sx={{ bgcolor: 'background.paper', fontWeight: 'bold' }}>
                      System Presets
                    </ListSubheader>
                    {filteredSystemPresets.map(preset => (
                      <MenuItem key={preset.id} value={preset.id}>
                        <Box>
                          {preset.name}
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                            {preset.tags
                              .filter(tag => tag !== 'default' && tag !== 'user')
                              .map(tag => (
                                <Chip
                                  key={tag}
                                  label={tag}
                                  size="small"
                                  variant="outlined"
                                  sx={{ 
                                    height: 20, 
                                    fontSize: '0.7rem',
                                    textTransform: 'capitalize'
                                  }}
                                />
                              ))}
                          </Box>
                        </Box>
                      </MenuItem>
                    ))}
                  </>
                )}
                
                {/* User-defined presets */}
                {filteredUserPresets.length > 0 && (
                  <>
                    <Divider sx={{ my: 1 }} />
                    <ListSubheader sx={{ bgcolor: 'background.paper', fontWeight: 'bold' }}>
                      User-Defined Presets
                    </ListSubheader>
                    {filteredUserPresets.map(preset => (
                      <MenuItem key={preset.id} value={preset.id}>
                        <Box>
                          {preset.name}
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                            {preset.tags
                              .filter(tag => tag !== 'default' && tag !== 'user')
                              .map(tag => (
                                <Chip
                                  key={tag}
                                  label={tag}
                                  size="small"
                                  variant="outlined"
                                  sx={{ 
                                    height: 20, 
                                    fontSize: '0.7rem',
                                    textTransform: 'capitalize'
                                  }}
                                />
                              ))}
                          </Box>
                        </Box>
                      </MenuItem>
                    ))}
                  </>
                )}
                
                {/* Show message when no presets match the filter */}
                {filteredSystemPresets.length === 0 && filteredUserPresets.length === 0 && (
                  <MenuItem disabled>
                    No presets match the selected categories
                  </MenuItem>
                )}
              </Select>
              <FormHelperText>
                {formTouched.projectPreset && errors.projectPreset ?
                  errors.projectPreset : 'Select a workflow preset for your project'}
              </FormHelperText>
            </FormControl>
          </Box>
          
          <Box sx={{ mb: 2 }}>
            <TextField
              label="Description (Optional)"
              fullWidth
              variant="outlined"
              value={newProjectDescription}
              onChange={(e) => this.setState({ newProjectDescription: e.target.value })}
              multiline
              rows={3}
            />
          </Box>
        </DialogContent>
        
        <DialogActions sx={{ px: 3, py: 2, borderTop: 1, borderColor: 'divider' }}>
          <Button onClick={this.handleNewProjectDialogClose}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={this.handleNewProjectCreate}
            disabled={!newProjectName || !newProjectPreset}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>
    );
  }

  renderLoadProjectDialog() {
    const { loadProjectDialogOpen, selectedProjectId, projects } = this.state;
    
    // Group projects by preset type for better organization
    const userProjects = projects.filter(project => project.presetId);
    
    return (
      <Dialog
        open={loadProjectDialogOpen}
        onClose={this.handleLoadProjectDialogClose}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: 1,
          borderColor: 'divider',
          pb: 2
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <FolderOpenIcon sx={{ mr: 1 }} />
            Load Project
          </Box>
          <IconButton edge="end" onClick={this.handleLoadProjectDialogClose}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        
        <DialogContent sx={{ pt: 3 }}>
          <Typography variant="h6" gutterBottom>
            User Projects
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Select a project to load or create a new one based on any preset.
          </Typography>
          
          {userProjects.length === 0 ? (
            <Paper sx={{ p: 3, textAlign: 'center', bgcolor: 'background.default' }}>
              <Typography color="text.secondary">
                No saved projects found. Create a new project to get started.
              </Typography>
              <Button 
                variant="contained" 
                color="primary" 
                startIcon={<AddIcon />}
                onClick={this.handleNewProjectDialogOpen}
                sx={{ mt: 2 }}
              >
                Create New Project
              </Button>
            </Paper>
          ) : (
            <Box sx={{ mb: 3 }}>
              {this.renderProjectList()}
            </Box>
          )}
          
          <Divider sx={{ my: 3 }} />
          
          <Typography variant="h6" gutterBottom>
            Create New Project
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Start a new project based on any preset.
          </Typography>
          
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<AddIcon />}
            onClick={this.handleNewProjectDialogOpen}
            fullWidth
          >
            Create New Project
          </Button>
        </DialogContent>
        
        <DialogActions sx={{ px: 3, py: 2, borderTop: 1, borderColor: 'divider' }}>
          <Button onClick={this.handleLoadProjectDialogClose}>Cancel</Button>
          <Button 
            variant="contained" 
            color="primary"
            onClick={this.handleLoadSelectedProject}
            disabled={!selectedProjectId}
          >
            Load Selected Project
          </Button>
        </DialogActions>
      </Dialog>
    );
  }

  renderHeader() {
    const { currentProject } = this.state;
    
    return (
      <AppBar position="static" color="transparent" elevation={0}>
        <Toolbar>
          <Typography 
            variant="h3" 
            component="div" 
            sx={{ 
              flexGrow: 0, 
              fontWeight: 'bold', 
              mr: 4,
              fontSize: '2.5rem',
              letterSpacing: '-0.5px'
            }}
          >
            imagN
          </Typography>
          
          <Tabs 
            value={this.state.currentTab} 
            onChange={this.handleTabChange} 
            sx={{ flexGrow: 1 }}
            textColor="primary"
            indicatorColor="primary"
          >
            <Tab label="Image Workspace" />
            <Tab label="Video Workspace" />
            <Tab label="Node Editor" />
            <Tab label="Presets" />
          </Tabs>
          
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <Button 
              variant="outlined" 
              color="primary" 
              startIcon={<FolderIcon />}
              onClick={this.handleLoadProjectClick}
            >
              Load Project
            </Button>
            <Button 
              variant="contained" 
              color="primary" 
              startIcon={<AddIcon />}
              onClick={this.handleNewProjectClick}
            >
              New Project
            </Button>
            {currentProject && (
              <Button 
                variant="outlined" 
                color="primary" 
                startIcon={<SaveIcon />}
                onClick={this.handleSaveProject}
              >
                Save
              </Button>
            )}
            <Button 
              variant="outlined" 
              color="primary" 
              startIcon={<CollectionsIcon />}
            >
              Gallery
            </Button>
            <DevToolsButton />
            <ThemeToggleButton />
          </Box>
        </Toolbar>
      </AppBar>
    );
  }

  renderWorkspace() {
    const { currentTab, currentProject } = this.state;
    
    if (!currentProject) {
      return (
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center', 
          justifyContent: 'center',
          height: '100%',
          p: 3
        }}>
          <Typography variant="h5" gutterBottom>
            No Project Selected
          </Typography>
          <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 3 }}>
            Create a new project or load an existing one to get started.
          </Typography>
          <Stack direction="row" spacing={2}>
            <Button 
              variant="contained" 
              startIcon={<AddIcon />}
              onClick={this.handleNewProjectDialogOpen}
            >
              Create New Project
            </Button>
            <Button 
              variant="outlined"
              startIcon={<FolderOpenIcon />}
              onClick={this.handleLoadProjectDialogOpen}
            >
              Load Project
            </Button>
          </Stack>
        </Box>
      );
    }
    
    // Get the preset details
    const presetId = currentProject.presetId || '';
    const preset = this.getPresetDetails(presetId);
    
    // For now, we'll just show a placeholder based on the tab
    switch (currentTab) {
      case 0: // Image Workspace
        return (
          <Box sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
              Image Workspace
            </Typography>
            <Typography variant="body1">
              Working on project: {currentProject.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Preset: {preset?.name || 'Unknown'}
            </Typography>
            {/* Image workspace components would go here */}
          </Box>
        );
      case 1: // Video Workspace
        return (
          <Box sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
              Video Workspace
            </Typography>
            <Typography variant="body1">
              Working on project: {currentProject.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Preset: {preset?.name || 'Unknown'}
            </Typography>
            {/* Video workspace components would go here */}
          </Box>
        );
      case 2: // Node Editor
        return (
          <Box sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
              Node Editor
            </Typography>
            <Typography variant="body1">
              Working on project: {currentProject.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Preset: {preset?.name || 'Unknown'}
            </Typography>
            {/* Node editor components would go here */}
          </Box>
        );
      default:
        return null;
    }
  }
  
  // Helper method to get preset details by ID
  getPresetDetails(presetId: string): WorkflowPreset | undefined {
    const { systemPresets, userPresets } = this.state;
    
    // Check system presets
    const systemPreset = systemPresets.find(preset => preset.id === presetId);
    if (systemPreset) return systemPreset;
    
    // Check user presets
    const userPreset = userPresets.find(preset => preset.id === presetId);
    if (userPreset) return userPreset;
    
    return undefined;
  }

  renderTabContent() {
    const { currentTab, slideDirection } = this.state;
    
    const tabContent = (() => {
      switch (currentTab) {
        case 0: return this.renderWorkspace();
        case 1: return this.renderWorkspace();
        case 2: return this.renderWorkspace();
        case 3: return this.renderWorkspace();
        default: return null;
      }
    })();

    // Define animation based on direction
    const slideInFromRight = {
      '@keyframes slideInFromRight': {
        '0%': {
          transform: 'translateX(100%)',
        },
        '100%': {
          transform: 'translateX(0)',
        },
      },
    };

    const slideInFromLeft = {
      '@keyframes slideInFromLeft': {
        '0%': {
          transform: 'translateX(-100%)',
        },
        '100%': {
          transform: 'translateX(0)',
        },
      },
    };

    // Use horizontal slide animation
    return (
      <Box sx={{ 
        position: 'relative', 
        overflow: 'hidden', 
        minHeight: '600px'
      }}>
        <Box 
          sx={{ 
            animation: `${slideDirection === 'left' ? 'slideInFromRight' : 'slideInFromLeft'} 0.3s ease-out forwards`,
            ...slideInFromRight,
            ...slideInFromLeft
          }}
          key={`tab-content-${currentTab}`} // Key forces re-render when tab changes
        >
          {tabContent}
        </Box>
      </Box>
    );
  }

  renderContent() {
    return (
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        {this.renderTabContent()}
      </Container>
    );
  }

  renderFooter() {
    const { currentProject } = this.state;
    
    return (
      <Box 
        component="footer" 
        sx={{ 
          py: 3, 
          px: 2, 
          mt: 'auto',
          backgroundColor: (theme) => theme.palette.background.paper,
          borderTop: 1,
          borderColor: 'divider'
        }}
      >
        <Container maxWidth="sm">
          <Typography variant="body2" color="text.secondary" align="center">
            © 2023 imagN. All rights reserved.
          </Typography>
          {currentProject && (
            <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 1 }}>
              Current Project: {currentProject.name} | Last Saved: {new Date(currentProject.lastModified).toLocaleTimeString()}
            </Typography>
          )}
        </Container>
      </Box>
    );
  }

  render() {
    const { snackbarOpen, snackbarMessage, snackbarSeverity } = this.state;
    
    return (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        minHeight: '100vh',
        bgcolor: 'background.default',
        color: 'text.primary'
      }}>
        {this.renderHeader()}
        <Box component="main" sx={{ flexGrow: 1 }}>
          {this.renderContent()}
        </Box>
        {this.renderFooter()}
        {this.renderNewProjectDialog()}
        {this.renderLoadProjectDialog()}
        
        {/* Notification Snackbar */}
        <Snackbar 
          open={snackbarOpen} 
          autoHideDuration={6000} 
          onClose={this.handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert 
            onClose={this.handleCloseSnackbar} 
            severity={snackbarSeverity}
            variant="filled"
            sx={{ width: '100%' }}
          >
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </Box>
    );
  }

  // Sample projects for demonstration purposes
  getSampleProjects(): Project[] {
    return [
      {
        id: '1',
        name: 'Landscape Generation',
        description: 'Photorealistic landscape generation with mountains and water',
        createdAt: '2023-02-10T12:30:00Z',
        lastModified: '2023-02-15T14:20:00Z',
        presetId: 'image-generation'
      },
      {
        id: '2',
        name: 'Sci-Fi Character Animation',
        description: 'Futuristic character with glowing elements in motion',
        createdAt: '2023-02-08T09:15:00Z',
        lastModified: '2023-02-12T11:45:00Z',
        presetId: 'video-generation'
      },
      {
        id: '3',
        name: 'Abstract Art Generator',
        description: 'Node-based workflow for generating abstract art patterns',
        createdAt: '2023-02-05T10:00:00Z',
        lastModified: '2023-02-11T16:30:00Z',
        presetId: 'node-workflow'
      }
    ];
  }

  // Show notification
  showNotification(message: string, severity: 'success' | 'error' | 'info' | 'warning' = 'info') {
    this.setState({
      snackbarOpen: true,
      snackbarMessage: message,
      snackbarSeverity: severity
    });
  }

  // Load Project methods
  handleLoadProjectClick() {
    this.setState({ 
      loadProjectDialogOpen: true,
      selectedProjectId: null
    });
  }

  handleLoadProjectDialogClose() {
    this.setState({ loadProjectDialogOpen: false });
  }

  handleProjectSelect(projectId: string) {
    this.setState({ selectedProjectId: projectId });
  }

  handleLoadSelectedProject() {
    const { projects, selectedProjectId } = this.state;
    
    if (!selectedProjectId) {
      this.showNotification('Please select a project to load', 'warning');
      return;
    }
    
    const selectedProject = projects.find(project => project.id === selectedProjectId);
    
    if (selectedProject) {
      this.setState({
        currentProject: selectedProject,
        loadProjectDialogOpen: false,
        snackbarOpen: true,
        snackbarMessage: `Project "${selectedProject.name}" loaded successfully!`,
        snackbarSeverity: 'success'
      });
      
      // Get the preset details to determine which tab to navigate to
      const preset = this.getPresetDetails(selectedProject.presetId || '');
      let targetTab = 0; // Default to Image Workspace
      
      if (preset) {
        // Determine tab based on preset name or other properties
        if (preset.category === 'video') {
          targetTab = 1; // Video Workspace
        } else if (preset.category === 'node') {
          targetTab = 2; // Node Editor
        }
      }
      
      // Navigate to the appropriate tab
      this.handleTabChange(null as any, targetTab);
    } else {
      this.showNotification('Error loading project', 'error');
    }
  }

  // Save Project method
  handleSaveProject() {
    const { currentProject, projects } = this.state;
    
    if (!currentProject) {
      this.showNotification('No active project to save', 'warning');
      return;
    }
    
    // Update the last modified date
    const updatedProject = {
      ...currentProject,
      lastModified: new Date().toISOString()
    };
    
    // Update the project in the projects list
    const updatedProjects = projects.map(project => 
      project.id === updatedProject.id ? updatedProject : project
    );
    
    this.setState({ 
      currentProject: updatedProject,
      projects: updatedProjects
    });
    
    this.showNotification(`Project "${updatedProject.name}" saved successfully!`, 'success');
  }

  // Delete Project method
  handleDeleteProject(projectId: string) {
    const { projects } = this.state;
    
    // Filter out the project to delete
    const updatedProjects = projects.filter(project => project.id !== projectId);
    
    this.setState({
      projects: updatedProjects,
      // If the current project is being deleted, set it to null
      currentProject: this.state.currentProject?.id === projectId ? null : this.state.currentProject
    });
    
    // Show notification
    this.setState({
      snackbarOpen: true,
      snackbarMessage: 'Project deleted successfully',
      snackbarSeverity: 'success'
    });
  }

  // Snackbar close handler
  handleCloseSnackbar() {
    this.setState({ snackbarOpen: false });
  }

  // Add missing methods for dialog handling
  handleNewProjectDialogOpen = () => {
    this.setState({
      newProjectDialogOpen: true,
      newProjectName: '',
      newProjectPreset: '',
      newProjectDescription: '',
      errors: {},
      formTouched: {
        projectName: false,
        projectPreset: false
      }
    });
  };

  handleLoadProjectDialogOpen = () => {
    this.setState({
      loadProjectDialogOpen: true,
      selectedProjectId: null
    });
  };

  renderProjectList() {
    const { projects, selectedProjectId } = this.state;
    
    return (
      <List sx={{ width: '100%' }}>
        {projects.map((project) => (
          <ListItem
            key={project.id}
            disablePadding
            secondaryAction={
              <IconButton edge="end" aria-label="delete" onClick={() => this.handleDeleteProject(project.id)}>
                <DeleteIcon />
              </IconButton>
            }
          >
            <ListItemButton
              selected={selectedProjectId === project.id}
              onClick={() => this.handleSelectProject(project.id)}
            >
              <ListItemAvatar>
                <Avatar>
                  {/* Use different icons based on preset */}
                  {project.presetId && project.presetId.includes('image') ? (
                    <ImageIcon />
                  ) : project.presetId && project.presetId.includes('video') ? (
                    <VideocamIcon />
                  ) : (
                    <AccountTreeIcon />
                  )}
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={project.name}
                secondary={
                  <React.Fragment>
                    <Typography
                      sx={{ display: 'inline' }}
                      component="span"
                      variant="body2"
                      color="text.primary"
                    >
                      {/* Display preset name instead of type */}
                      {this.getPresetNameById(project.presetId || '')}
                    </Typography>
                    {` — ${project.description}`}
                  </React.Fragment>
                }
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    );
  }

  // Helper method to get preset name by ID
  getPresetNameById(presetId: string): string {
    const preset = this.getPresetDetails(presetId);
    return preset ? preset.name : "Unknown Preset";
  }

  // Add missing method for selecting a project
  handleSelectProject = (projectId: string) => {
    this.setState({
      selectedProjectId: projectId
    });
  };

  // Helper function to get icon based on preset ID
  getPresetIcon(presetId: string | undefined) {
    if (!presetId) return <AccountTreeIcon />;
    
    const preset = this.getPresetDetails(presetId);
    if (!preset) return <AccountTreeIcon />;
    
    const presetName = preset.name.toLowerCase();
    
    if (presetName.includes('image')) {
      return <ImageIcon />;
    } else if (presetName.includes('video')) {
      return <VideocamIcon />;
    } else {
      return <AccountTreeIcon />;
    }
  }

  renderLoadProjectItem(project: Project) {
    return (
      <MenuItem 
        key={project.id} 
        value={project.id}
        sx={{ 
          display: 'flex', 
          alignItems: 'center',
          py: 1
        }}
      >
        <ListItemIcon>
          {this.getPresetIcon(project.presetId)}
        </ListItemIcon>
        {project.name}
        <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
          {new Date(project.lastModified).toLocaleDateString()}
        </Typography>
      </MenuItem>
    );
  }

  // Helper method to update available categories, types, and tags
  updateAvailableFilters(systemPresets: WorkflowPreset[], userPresets: WorkflowPreset[]) {
    const categories = new Set<string>();
    const types = new Set<string>();
    const tags = new Set<string>();
    
    // Process system presets
    systemPresets.forEach(preset => {
      // Add category
      if (preset.category && preset.category !== 'default' && preset.category !== 'user') {
        categories.add(preset.category);
      }
      
      // Add type
      if (preset.type) {
        types.add(preset.type);
      }
      
      // Add tags
      preset.tags.forEach(tag => {
        // Skip 'default' and 'user' tags as they're used for grouping
        if (tag !== 'default' && tag !== 'user') {
          tags.add(tag);
        }
      });
    });
    
    // Process user presets
    userPresets.forEach(preset => {
      // Add category
      if (preset.category && preset.category !== 'default' && preset.category !== 'user') {
        categories.add(preset.category);
      }
      
      // Add type
      if (preset.type) {
        types.add(preset.type);
      }
      
      // Add tags
      preset.tags.forEach(tag => {
        // Skip 'default' and 'user' tags as they're used for grouping
        if (tag !== 'default' && tag !== 'user') {
          tags.add(tag);
        }
      });
    });
    
    this.setState({
      availableCategories: Array.from(categories).sort(),
      availableTypes: Array.from(types).sort(),
      availableTags: Array.from(tags).sort()
    });
  }
} 