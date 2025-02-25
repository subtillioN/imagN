import React, { Component } from 'react';
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
  SelectChangeEvent
} from '@mui/material';
import {
  Add as AddIcon,
  Collections as CollectionsIcon,
  Close as CloseIcon,
  Folder as FolderIcon,
  Save as SaveIcon,
  DeleteOutline as DeleteIcon
} from '@mui/icons-material';
import DevToolsButton from './DevToolsButton';
import ThemeToggleButton from './ThemeToggleButton';

// Sample project type for TypeScript
interface Project {
  id: string;
  name: string;
  type: 'image' | 'video' | 'node';
  description: string;
  createdAt: string;
  lastModified: string;
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
  newProjectType: 'image' | 'video' | 'node' | '';
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
    projectType?: string;
  };
  formTouched: {
    projectName: boolean;
    projectType: boolean;
  };
}

export class MainView extends Component<MainViewProps, MainViewState> {
  private imageConfig$: any;
  private progress$: any;
  private results$: any;
  private transitionTimeout: NodeJS.Timeout | null = null;
  private animationTimeout: NodeJS.Timeout | null = null;

  constructor(props: MainViewProps) {
    super(props);
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
      newProjectType: '',
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
        projectType: false
      }
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

  handleTabChange(event: React.SyntheticEvent, newValue: number) {
    const { currentTab, isTransitioning } = this.state;
    
    // Prevent rapid tab changes during transition
    if (isTransitioning) return;
    
    // Determine slide direction based on tab index
    const direction = newValue > currentTab ? 'left' : 'right';
    
    // Update state with new direction and transition flag
    this.setState({ 
      slideDirection: direction,
      previousTab: currentTab,
      isTransitioning: true,
      currentTab: newValue
    });

    // Clear any existing timeouts
    if (this.animationTimeout) {
      clearTimeout(this.animationTimeout);
      this.animationTimeout = null;
    }
    
    // End the transition after animation completes
    this.animationTimeout = setTimeout(() => {
      this.setState({ isTransitioning: false });
    }, 300); // Match animation duration
  }

  // New Project methods
  handleNewProjectClick() {
    this.setState({ 
      newProjectDialogOpen: true,
      newProjectName: '',
      newProjectType: '',
      newProjectDescription: '',
      errors: {},
      formTouched: {
        projectName: false,
        projectType: false
      }
    });
  }

  handleNewProjectDialogClose() {
    this.setState({ newProjectDialogOpen: false });
  }

  validateField(field: 'projectName' | 'projectType', value: string) {
    const errors: { [key: string]: string } = {};

    switch(field) {
      case 'projectName':
        if (!value.trim()) {
          errors.projectName = 'Project name is required';
        } else if (value.trim().length < 3) {
          errors.projectName = 'Project name must be at least 3 characters';
        } else if (value.trim().length > 50) {
          errors.projectName = 'Project name must be less than 50 characters';
        }
        break;
      case 'projectType':
        if (!value) {
          errors.projectType = 'Please select a project type';
        }
        break;
    }

    return errors;
  }

  validateForm() {
    const { newProjectName, newProjectType } = this.state;
    
    // Mark all fields as touched
    this.setState({
      formTouched: {
        projectName: true,
        projectType: true
      }
    });

    // Validate all fields
    const nameErrors = this.validateField('projectName', newProjectName);
    const typeErrors = this.validateField('projectType', newProjectType);
    
    const combinedErrors = {
      ...nameErrors,
      ...typeErrors
    };
    
    this.setState({ errors: combinedErrors });
    
    // Form is valid if there are no errors
    return Object.keys(combinedErrors).length === 0;
  }

  handleNewProjectCreate() {
    // Validate all form fields
    if (!this.validateForm()) {
      // If validation fails, stop here
      return;
    }
    
    const { newProjectName, newProjectType, newProjectDescription, projects } = this.state;
    
    // Create a new project
    const newProject: Project = {
      id: Date.now().toString(), // Generate a simple unique ID
      name: newProjectName,
      type: newProjectType as 'image' | 'video' | 'node',
      description: newProjectDescription,
      createdAt: new Date().toISOString(),
      lastModified: new Date().toISOString()
    };
    
    // Update projects list and set as current project
    const updatedProjects = [...projects, newProject];
    
    this.setState({
      projects: updatedProjects,
      currentProject: newProject,
      newProjectDialogOpen: false
    });
    
    this.showNotification(`Project "${newProject.name}" created successfully!`, 'success');
    
    // Update the UI based on project type
    let targetTab = 0;
    switch (newProjectType) {
      case 'image':
        targetTab = 0; // Image Workspace
        break;
      case 'video':
        targetTab = 1; // Video Workspace
        break;
      case 'node':
        targetTab = 2; // Node Editor
        break;
      default:
        targetTab = 0;
    }
    
    // Navigate to the appropriate tab
    this.setState({ currentTab: targetTab });
  }

  renderNewProjectDialog() {
    const { 
      newProjectDialogOpen, 
      newProjectName, 
      newProjectType, 
      newProjectDescription,
      errors,
      formTouched
    } = this.state;

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      const newErrors = this.validateField('projectName', value);
      
      this.setState({ 
        newProjectName: value,
        formTouched: { ...formTouched, projectName: true },
        errors: { ...errors, ...newErrors }
      });
    };

    const handleTypeChange = (e: SelectChangeEvent) => {
      const value = e.target.value;
      const newErrors = this.validateField('projectType', value);
      
      this.setState({ 
        newProjectType: value as any,
        formTouched: { ...formTouched, projectType: true },
        errors: { ...errors, ...newErrors }
      });
    };
    
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
            <AddIcon sx={{ mr: 1 }} />
            Create New Project
          </Box>
          <IconButton onClick={this.handleNewProjectDialogClose} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        
        <DialogContent sx={{ pt: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                label="Project Name"
                fullWidth
                variant="outlined"
                value={newProjectName}
                onChange={handleNameChange}
                onBlur={() => this.setState({ formTouched: { ...formTouched, projectName: true } })}
                placeholder="Enter a name for your project"
                autoFocus
                required
                error={formTouched.projectName && Boolean(errors.projectName)}
                helperText={formTouched.projectName && errors.projectName}
              />
            </Grid>
            
            <Grid item xs={12}>
              <FormControl 
                fullWidth 
                required 
                error={formTouched.projectType && Boolean(errors.projectType)}
              >
                <InputLabel id="project-type-label">Project Type</InputLabel>
                <Select
                  labelId="project-type-label"
                  value={newProjectType}
                  label="Project Type"
                  onChange={handleTypeChange}
                  onBlur={() => this.setState({ formTouched: { ...formTouched, projectType: true } })}
                >
                  <MenuItem value="image">Image Generation</MenuItem>
                  <MenuItem value="video">Video Generation</MenuItem>
                  <MenuItem value="node">Node-based Workflow</MenuItem>
                </Select>
                <FormHelperText>
                  {formTouched.projectType && errors.projectType ? 
                    errors.projectType : 
                    'Select the type of project you want to create'}
                </FormHelperText>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                label="Description (Optional)"
                fullWidth
                variant="outlined"
                value={newProjectDescription}
                onChange={(e) => this.setState({ newProjectDescription: e.target.value })}
                placeholder="Briefly describe your project"
                multiline
                rows={3}
              />
            </Grid>
          </Grid>
        </DialogContent>
        
        <DialogActions sx={{ px: 3, py: 2, borderTop: 1, borderColor: 'divider' }}>
          <Button onClick={this.handleNewProjectDialogClose}>Cancel</Button>
          <Button 
            variant="contained" 
            color="primary"
            onClick={this.handleNewProjectCreate}
          >
            Create Project
          </Button>
        </DialogActions>
      </Dialog>
    );
  }

  renderLoadProjectDialog() {
    const { loadProjectDialogOpen, projects, selectedProjectId } = this.state;
    
    // Format date for display
    const formatDate = (dateString: string) => {
      const date = new Date(dateString);
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    };
    
    // Get the type icon based on project type
    const getTypeIcon = (type: string) => {
      switch(type) {
        case 'image': return '🖼️';
        case 'video': return '🎬';
        case 'node': return '🔄';
        default: return '📄';
      }
    };
    
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
            <FolderIcon sx={{ mr: 1 }} />
            Load Project
          </Box>
          <IconButton onClick={this.handleLoadProjectDialogClose} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        
        <DialogContent sx={{ pt: 3 }}>
          {projects.length === 0 ? (
            <Typography align="center" color="text.secondary" sx={{ py: 4 }}>
              No projects available. Create a new project first.
            </Typography>
          ) : (
            <List sx={{ width: '100%' }}>
              {projects.map((project) => (
                <React.Fragment key={project.id}>
                  <Box
                    sx={{
                      mb: 1,
                      position: 'relative',
                    }}
                  >
                    <Button 
                      fullWidth
                      variant={selectedProjectId === project.id ? "contained" : "text"}
                      color="primary"
                      onClick={() => this.handleProjectSelect(project.id)}
                      sx={{ 
                        justifyContent: 'flex-start',
                        textAlign: 'left',
                        py: 2,
                        px: 3,
                        borderRadius: 1
                      }}
                    >
                      <Box sx={{ width: '100%' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Typography variant="subtitle1" component="span">
                            {getTypeIcon(project.type)} {project.name}
                          </Typography>
                        </Box>
                        <Typography variant="body2" component="span" color="text.secondary">
                          {project.description || 'No description'}
                        </Typography>
                        <Box sx={{ display: 'flex', mt: 1 }}>
                          <Typography variant="caption" sx={{ mr: 2 }}>
                            Created: {formatDate(project.createdAt)}
                          </Typography>
                          <Typography variant="caption">
                            Modified: {formatDate(project.lastModified)}
                          </Typography>
                        </Box>
                      </Box>
                    </Button>
                    <IconButton 
                      edge="end" 
                      aria-label="delete"
                      onClick={() => this.handleDeleteProject(project.id)}
                      sx={{
                        position: 'absolute',
                        right: 8,
                        top: 8,
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                  <Divider component="li" />
                </React.Fragment>
              ))}
            </List>
          )}
        </DialogContent>
        
        <DialogActions sx={{ px: 3, py: 2, borderTop: 1, borderColor: 'divider' }}>
          <Button onClick={this.handleLoadProjectDialogClose}>Cancel</Button>
          <Button 
            variant="contained" 
            color="primary"
            onClick={this.handleLoadSelectedProject}
            disabled={!selectedProjectId}
          >
            Load Project
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

  renderImageWorkspace() {
    return (
      <Grid container spacing={3}>
        {/* Progress Panel */}
        {this.state.progress && this.state.progress.status && (
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6">Progress</Typography>
              <Typography>{this.state.progress.status}</Typography>
            </Paper>
          </Grid>
        )}
        
        {/* Node Editor Panel */}
        <Grid item xs={12} md={6} lg={4}>
          <Card sx={{ height: '100%' }}>
            <CardHeader 
              title="Image Parameters" 
              sx={{ 
                bgcolor: 'background.paper', 
                borderBottom: 1, 
                borderColor: 'divider' 
              }}
            />
            <CardContent sx={{ height: 400 }}>
              <Typography>Image generation parameters will be displayed here</Typography>
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2">Prompt</Typography>
                <Paper variant="outlined" sx={{ p: 2, bgcolor: 'background.default' }}>
                  <Typography variant="body2">Enter your prompt here...</Typography>
                </Paper>
              </Box>
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2">Settings</Typography>
                <Paper variant="outlined" sx={{ p: 2, bgcolor: 'background.default' }}>
                  <Typography variant="body2">Image settings will go here</Typography>
                </Paper>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Preview Panel */}
        <Grid item xs={12} md={6} lg={4}>
          <Card sx={{ height: '100%' }}>
            <CardHeader 
              title="Image Preview" 
              sx={{ 
                bgcolor: 'background.paper', 
                borderBottom: 1, 
                borderColor: 'divider' 
              }}
            />
            <CardContent sx={{ height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Paper 
                sx={{ 
                  width: '100%', 
                  height: '320px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  bgcolor: 'background.default'
                }}
              >
                <Typography color="text.secondary">Preview will appear here</Typography>
              </Paper>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Properties Panel */}
        <Grid item xs={12} md={6} lg={4}>
          <Card sx={{ height: '100%' }}>
            <CardHeader 
              title="Generation Options" 
              sx={{ 
                bgcolor: 'background.paper', 
                borderBottom: 1, 
                borderColor: 'divider' 
              }}
            />
            <CardContent sx={{ height: 400 }}>
              <Typography>Advanced options will be shown here</Typography>
              <Box sx={{ mt: 2 }}>
                <Button variant="contained" color="primary" fullWidth>
                  Generate Image
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Results Section */}
        {this.state.results && this.state.results.images && (
          <Grid item xs={12}>
            <Card>
              <CardHeader title="Generated Images" />
              <CardContent>
                <Grid container spacing={2}>
                  {this.state.results.images.map((image: any, index: number) => (
                    <Grid item key={index} xs={12} sm={6} md={4} lg={3}>
                      <img 
                        src={image.url} 
                        alt={`Generated ${index + 1}`} 
                        style={{ width: '100%', borderRadius: 8 }}
                      />
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    );
  }

  renderVideoWorkspace() {
    return (
      <Grid container spacing={3}>
        <Grid item xs={12} md={6} lg={4}>
          <Card sx={{ height: '100%' }}>
            <CardHeader 
              title="Video Parameters" 
              sx={{ 
                bgcolor: 'background.paper', 
                borderBottom: 1, 
                borderColor: 'divider' 
              }}
            />
            <CardContent sx={{ height: 400 }}>
              <Typography>Video generation parameters go here</Typography>
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2">Prompt</Typography>
                <Paper variant="outlined" sx={{ p: 2, bgcolor: 'background.default' }}>
                  <Typography variant="body2">Enter your video prompt here...</Typography>
                </Paper>
              </Box>
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2">Duration</Typography>
                <Paper variant="outlined" sx={{ p: 2, bgcolor: 'background.default' }}>
                  <Typography variant="body2">Set video length and fps</Typography>
                </Paper>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6} lg={4}>
          <Card sx={{ height: '100%' }}>
            <CardHeader 
              title="Video Preview" 
              sx={{ 
                bgcolor: 'background.paper', 
                borderBottom: 1, 
                borderColor: 'divider' 
              }}
            />
            <CardContent sx={{ height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Paper 
                sx={{ 
                  width: '100%', 
                  height: '320px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  bgcolor: 'background.default'
                }}
              >
                <Typography color="text.secondary">Video preview will appear here</Typography>
              </Paper>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6} lg={4}>
          <Card sx={{ height: '100%' }}>
            <CardHeader 
              title="Video Options" 
              sx={{ 
                bgcolor: 'background.paper', 
                borderBottom: 1, 
                borderColor: 'divider' 
              }}
            />
            <CardContent sx={{ height: 400 }}>
              <Typography>Advanced video settings</Typography>
              <Box sx={{ mt: 2 }}>
                <Button variant="contained" color="primary" fullWidth>
                  Generate Video
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    );
  }

  renderNodeEditor() {
    return (
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card sx={{ height: '600px' }}>
            <CardHeader 
              title="Node Graph Editor" 
              sx={{ 
                bgcolor: 'background.paper', 
                borderBottom: 1, 
                borderColor: 'divider' 
              }}
            />
            <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Paper 
                sx={{ 
                  flexGrow: 1,
                  width: '100%', 
                  bgcolor: 'background.default',
                  p: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Typography color="text.secondary">Node editor canvas will be implemented here</Typography>
              </Paper>
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                <Button variant="outlined">Add Node</Button>
                <Button variant="contained" color="primary">Run Workflow</Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    );
  }

  renderPresets() {
    return (
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 2, mb: 3 }}>
            <Typography variant="h6">Preset Templates</Typography>
            <Typography variant="body2" color="text.secondary">
              Select from pre-configured templates to quickly start your project
            </Typography>
          </Paper>
        </Grid>
        
        {[1, 2, 3, 4, 5, 6].map((preset) => (
          <Grid item xs={12} sm={6} md={4} key={preset}>
            <Card>
              <CardHeader title={`Preset ${preset}`} />
              <CardContent>
                <Typography variant="body2">
                  A pre-configured template with optimized settings for specific types of generation.
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <Button variant="outlined" fullWidth>Use Template</Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  }

  renderTabContent() {
    const { currentTab, slideDirection } = this.state;
    
    const tabContent = (() => {
      switch (currentTab) {
        case 0: return this.renderImageWorkspace();
        case 1: return this.renderVideoWorkspace();
        case 2: return this.renderNodeEditor();
        case 3: return this.renderPresets();
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
        type: 'image',
        description: 'Photorealistic landscape generation with mountains and water',
        createdAt: '2023-02-10T12:30:00Z',
        lastModified: '2023-02-12T16:45:00Z'
      },
      {
        id: '2',
        name: 'Sci-Fi Character Animation',
        type: 'video',
        description: 'Futuristic character with glowing elements in motion',
        createdAt: '2023-02-08T09:15:00Z',
        lastModified: '2023-02-08T14:20:00Z'
      },
      {
        id: '3',
        name: 'Abstract Art Generator',
        type: 'node',
        description: 'Node-based workflow for generating abstract art patterns',
        createdAt: '2023-02-05T10:00:00Z',
        lastModified: '2023-02-07T11:30:00Z'
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
    const { selectedProjectId, projects } = this.state;
    
    if (!selectedProjectId) {
      this.showNotification('Please select a project to load', 'warning');
      return;
    }
    
    const selectedProject = projects.find(project => project.id === selectedProjectId);
    
    if (selectedProject) {
      // Set the selected project as current
      this.setState({ 
        currentProject: selectedProject,
        loadProjectDialogOpen: false
      });
      
      this.showNotification(`Project "${selectedProject.name}" loaded successfully!`, 'success');
      
      // Navigate to the appropriate tab based on project type
      let targetTab = 0;
      switch (selectedProject.type) {
        case 'image':
          targetTab = 0; // Image Workspace
          break;
        case 'video':
          targetTab = 1; // Video Workspace
          break;
        case 'node':
          targetTab = 2; // Node Editor
          break;
        default:
          targetTab = 0;
      }
      
      this.setState({ currentTab: targetTab });
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
    const { projects, currentProject } = this.state;
    
    // Remove the project from the list
    const updatedProjects = projects.filter(project => project.id !== projectId);
    
    // Update current project if it was deleted
    let updatedCurrentProject = currentProject;
    if (currentProject && currentProject.id === projectId) {
      updatedCurrentProject = null;
    }
    
    this.setState({ 
      projects: updatedProjects,
      currentProject: updatedCurrentProject
    });
    
    this.showNotification('Project deleted successfully!', 'success');
  }

  // Snackbar close handler
  handleCloseSnackbar() {
    this.setState({ snackbarOpen: false });
  }
} 