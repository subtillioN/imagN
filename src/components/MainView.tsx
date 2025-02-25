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
} from '@mui/material';
import {
  Add as AddIcon,
  Collections as CollectionsIcon
} from '@mui/icons-material';
import DevToolsButton from './DevToolsButton';
import ThemeToggleButton from './ThemeToggleButton';

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
      showPrevious: false
    };
    this.initializeStreams();

    // Bind methods
    this.handleTabChange = this.handleTabChange.bind(this);
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

  renderHeader() {
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
              variant="contained" 
              color="primary" 
              startIcon={<AddIcon />}
            >
              New Project
            </Button>
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
        </Container>
      </Box>
    );
  }

  render() {
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
      </Box>
    );
  }
} 