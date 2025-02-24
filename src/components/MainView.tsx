import React, { Component } from 'react';
import styles from '../styles/base.module.css';
import { DevToolsButton } from './DevTools/DevToolsButton';

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
      results: {}
    };
    this.initializeStreams();
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

  renderHeader(state: MainViewState) {
    const headerStyle = {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      width: '100%',
      padding: '1rem',
      backgroundColor: '#080a0e',
      borderBottom: '1px solid #101530',
      color: '#f8fafc'
    };

    const logoNavStyle = {
      display: 'flex',
      alignItems: 'center'
    };

    const logoStyle = {
      fontSize: '1.25rem',
      fontWeight: 'bold',
      color: '#f8fafc'
    };

    const navStyle = {
      marginLeft: '1rem'
    };

    const navListStyle = {
      listStyle: 'none',
      padding: 0,
      margin: 0,
      display: 'flex',
      gap: '1rem'
    };

    const navItemStyle = {
      color: '#f8fafc',
      padding: '0.5rem 1rem',
      borderRadius: '0.375rem',
      cursor: 'pointer'
    };

    const activeNavItemStyle = {
      ...navItemStyle,
      backgroundColor: '#0c0e14'
    };

    const controlsStyle = {
      display: 'flex',
      alignItems: 'center',
      gap: '1rem'
    };

    const buttonStyle = {
      padding: '0.5rem 1rem',
      borderRadius: '0.375rem',
      fontWeight: 500,
      cursor: 'pointer',
      backgroundColor: 'rgba(255, 255, 255, 0.02)',
      color: '#f8fafc',
      border: 'none'
    };

    const primaryButtonStyle = {
      ...buttonStyle,
      backgroundColor: '#0c0e14'
    };

    return (
      <header style={headerStyle}>
        <div style={logoNavStyle}>
          <div style={logoStyle}>ImagN</div>
          <nav style={navStyle}>
            <ul style={navListStyle}>
              <li role="listitem" aria-label="Image Workspace" style={activeNavItemStyle}>Image Workspace</li>
              <li role="listitem" aria-label="Video Workspace" style={navItemStyle}>Video Workspace</li>
              <li role="listitem" aria-label="Node Editor" style={navItemStyle}>Node Editor</li>
              <li role="listitem" aria-label="Presets" style={navItemStyle}>Presets</li>
            </ul>
          </nav>
        </div>
        <div style={controlsStyle}>
          <div style={primaryButtonStyle}>New Project</div>
          <div style={buttonStyle}>Gallery</div>
        </div>
      </header>
    );
  }

  renderContent(state: MainViewState) {
    const contentStyle = {
      padding: '1.5rem 0',
      backgroundColor: '#050608',
      minHeight: 'calc(100vh - 80px)'
    };

    const containerStyle = {
      maxWidth: '1280px',
      margin: '0 auto',
      padding: '0 1rem'
    };

    const workspaceStyle = {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '1.5rem',
      backgroundColor: '#050608',
    };

    const panelStyle = {
      backgroundColor: 'rgba(255, 255, 255, 0.01)',
      borderRadius: '0.5rem',
      border: '1px solid #101530',
      overflow: 'hidden'
    };

    const panelHeaderStyle = {
      padding: '1rem',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      color: '#f8fafc',
      fontWeight: 500,
      borderBottom: '1px solid #101530'
    };

    const panelContentStyle = {
      padding: '1rem',
      color: '#f8fafc',
      height: 'calc(100% - 60px)',
      overflow: 'auto'
    };

    return (
      <main style={contentStyle}>
        <div style={containerStyle}>
          <div style={workspaceStyle}>
            {this.renderProgress(state)}
            <div style={panelStyle}>
              <div style={panelHeaderStyle}>Node Editor</div>
              <div style={panelContentStyle}>Node canvas will be implemented here</div>
            </div>
            <div style={panelStyle}>
              <div style={panelHeaderStyle}>Preview</div>
              <div style={panelContentStyle}>Preview content will be displayed here</div>
            </div>
            <div style={panelStyle}>
              <div style={panelHeaderStyle}>Properties</div>
              <div style={panelContentStyle}>Node properties will be shown here</div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  renderImageConfig(state: MainViewState) {
    return (
      <div className={styles['image-config']}>
        {/* Image generation configuration UI will be implemented here */}
      </div>
    );
  }

  renderProgress(state: MainViewState) {
    const { progress } = state;
    return (
      <div className={styles['progress-section']}>
        {progress && progress.status && (
          <div className={styles['progress-status']} role="status" aria-live="polite">{progress.status}</div>
        )}
      </div>
    );
  }

  renderResults(state: MainViewState) {
    const { results } = state;
    return (
      <div className={styles['results-section']}>
        {results.images && results.images.map((image: any, index: number) => (
          <div key={index} className={styles['result-image']}>
            <img src={image.url} alt={`Generated ${index + 1}`} />
          </div>
        ))}
      </div>
    );
  }

  renderFooter(state: MainViewState) {
    const footerStyle = {
      backgroundColor: '#080a0e',
      color: '#f8fafc',
      padding: '1rem',
      borderTop: '1px solid #101530'
    };

    const footerContentStyle = {
      textAlign: 'center' as 'center'
    };

    return (
      <footer style={footerStyle}>
        <div style={footerContentStyle}>
          <p>© 2023 ImagN. All rights reserved.</p>
        </div>
      </footer>
    );
  }

  render() {
    const appStyle = {
      backgroundColor: '#000000',
      color: '#f8fafc',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column' as 'column'
    };

    return (
      <div style={appStyle}>
        {this.renderHeader(this.state)}
        {this.renderContent(this.state)}
        <DevToolsButton />
      </div>
    );
  }
} 