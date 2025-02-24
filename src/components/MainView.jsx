import React from 'react';
import { BaseView } from '../mvi/view';
import styles from '../styles/base.module.css';

export class MainView extends BaseView {
  constructor(props) {
    super(props);
    this.sources = props.sources;
    this.state = {
      imageConfig: {},
      progress: {},
      results: {}
    };
    this.initializeStreams();
  }

  initializeStreams() {
    if (!this.sources || !this.sources.state) return;

    this.imageConfig$ = this.sources.state.imageConfig$ || {};
    this.progress$ = this.sources.state.progress$ || {};
    this.results$ = this.sources.state.results$ || {};

    if (this.imageConfig$.subscribe) {
      this.imageConfig$.subscribe(config => {
        this.setState({ imageConfig: config });
      });
    }

    if (this.progress$.subscribe) {
      this.progress$.subscribe(progress => {
        this.setState({ progress });
      });
    }

    if (this.results$.subscribe) {
      this.results$.subscribe(results => {
        this.setState({ results });
      });
    }
  }

  componentDidMount() {
    this.initializeStreams();
  }

  renderHeader(state) {
    return (
      <header className={styles['app-header']}>
        <div className={`${styles.flex} ${styles['items-center']} ${styles['gap-md']}`}>
          <div className={styles.logo}>ImagN</div>
          <nav className={styles['main-nav']}>
            <ul className={`${styles['nav-list']} ${styles.flex} ${styles['gap-md']}`}>
              <li role="listitem" aria-label="Image Workspace" className={`${styles['nav-item']} ${styles['active']}`}>Image Workspace</li>
              <li role="listitem" aria-label="Video Workspace" className={styles['nav-item']}>Video Workspace</li>
              <li role="listitem" aria-label="Node Editor" className={styles['nav-item']}>Node Editor</li>
              <li role="listitem" aria-label="Presets" className={styles['nav-item']}>Presets</li>
            </ul>
          </nav>
          <div className={`${styles['nav-controls']} ${styles.flex} ${styles['gap-sm']}`}>
            <div className={`${styles.button} ${styles['button-primary']}`}>New Project</div>
            <div className={styles.button}>Gallery</div>
          </div>
        </div>
      </header>
    );
  }

  renderContent(state) {
    return (
      <main className={styles['app-content']}>
        <div className={styles.container}>
          <div className={styles.workspace}>
            {this.renderProgress(state)}
            <div className={`${styles['workspace-panel']} ${styles['node-editor']}`}>
              <div className={styles['panel-header']}>Node Editor</div>
              <div className={styles['panel-content']}>Node canvas will be implemented here</div>
            </div>
            <div className={`${styles['workspace-panel']} ${styles['preview']}`}>
              <div className={styles['panel-header']}>Preview</div>
              <div className={styles['panel-content']}>Preview content will be displayed here</div>
            </div>
            <div className={`${styles['workspace-panel']} ${styles['properties']}`}>
              <div className={styles['panel-header']}>Properties</div>
              <div className={styles['panel-content']}>Node properties will be shown here</div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  renderImageConfig(state) {
    return (
      <div className={styles['image-config']}>
        {/* Image generation configuration UI will be implemented here */}
      </div>
    );
  }

  renderProgress(state) {
    const { progress } = state;
    return (
      <div className={styles['progress-section']}>
        {progress && progress.status && (
          <div className={styles['progress-status']} role="status" aria-live="polite">{progress.status}</div>
        )}
      </div>
    );
  }

  renderResults(state) {
    const { results } = state;
    return (
      <div className={styles['results-section']}>
        {results.images && results.images.map((image, index) => (
          <div key={index} className={styles['result-image']}>
            <img src={image.url} alt={`Generated ${index + 1}`} />
          </div>
        ))}
      </div>
    );
  }

  renderFooter(state) {
    return (
      <footer className={styles['app-footer']}>
        <div className={styles['footer-content']}>
          <p>© 2023 ImagN. All rights reserved.</p>
        </div>
      </footer>
    );
  }

  view(state) {
    return (
      <div className={styles['app-container']}>
        {this.renderHeader(state)}
        {this.renderContent(state)}
        {this.renderFooter(state)}
      </div>
    );
  }
}