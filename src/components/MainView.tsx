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
  IconButton
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
}

export class MainView extends Component<MainViewProps, MainViewState> {
  private imageConfig$: any;
  private progress$: any;
  private results$: any;

  constructor(props: MainViewProps) {
    super(props);
    this.state = {
      imageConfig: {},
      progress: {},
      results: {},
      currentTab: 0
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

  handleTabChange(event: React.SyntheticEvent, newValue: number) {
    this.setState({ currentTab: newValue });
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

  renderContent() {
    return (
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
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
                title="Node Editor" 
                sx={{ 
                  bgcolor: 'background.paper', 
                  borderBottom: 1, 
                  borderColor: 'divider' 
                }}
              />
              <CardContent sx={{ height: 400 }}>
                <Typography>Node canvas will be implemented here</Typography>
              </CardContent>
            </Card>
          </Grid>
          
          {/* Preview Panel */}
          <Grid item xs={12} md={6} lg={4}>
            <Card sx={{ height: '100%' }}>
              <CardHeader 
                title="Preview" 
                sx={{ 
                  bgcolor: 'background.paper', 
                  borderBottom: 1, 
                  borderColor: 'divider' 
                }}
              />
              <CardContent sx={{ height: 400 }}>
                <Typography>Preview content will be displayed here</Typography>
              </CardContent>
            </Card>
          </Grid>
          
          {/* Properties Panel */}
          <Grid item xs={12} md={6} lg={4}>
            <Card sx={{ height: '100%' }}>
              <CardHeader 
                title="Properties" 
                sx={{ 
                  bgcolor: 'background.paper', 
                  borderBottom: 1, 
                  borderColor: 'divider' 
                }}
              />
              <CardContent sx={{ height: 400 }}>
                <Typography>Node properties will be shown here</Typography>
              </CardContent>
            </Card>
          </Grid>
          
          {/* Results Section */}
          {this.state.results && this.state.results.images && (
            <Grid item xs={12}>
              <Card>
                <CardHeader title="Results" />
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