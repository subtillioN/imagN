import { div, header, main, footer } from '@cycle/dom';
import { BaseView } from '../mvi/view';
import styles from '../styles/base.module.css';

export class MainView extends BaseView {
  constructor(sources) {
    super(sources);
    this.initializeStreams();
  }

  initializeStreams() {
    // Initialize component-specific streams
    this.imageConfig$ = this.sources.state.imageConfig$ || {};
    this.progress$ = this.sources.state.progress$ || {};
    this.results$ = this.sources.state.results$ || {};
  }

  renderHeader(state) {
    return header(`.${styles['app-header']}`, [
      div(`.${styles.flex}.${styles['items-center']}.${styles['gap-md']}`, [
        div(`.${styles.logo}`, 'ImagN'),
        div(`.${styles['nav-controls']}.${styles.flex}.${styles['gap-sm']}`, [
          div(`.${styles['button']}.${styles['button-primary']}`, 'New Project'),
          div(`.${styles.button}`, 'Gallery')
        ])
      ])
    ]);
  }

  renderContent(state) {
    return main(`.${styles['app-content']}`, [
      div(`.${styles.container}`, [
        div(`.${styles.workspace}`, [
          this.renderImageConfig(state),
          this.renderProgress(state),
          this.renderResults(state)
        ])
      ])
    ]);
  }

  renderImageConfig(state) {
    return div('.image-config', [
      // Image generation configuration UI will be implemented here
    ]);
  }

  renderProgress(state) {
    return div('.progress-section', [
      // Progress indicators will be implemented here
    ]);
  }

  renderResults(state) {
    return div('.results-section', [
      // Generated image results will be displayed here
    ]);
  }

  renderFooter(state) {
    return footer('.app-footer', [
      div('.footer-content', [
        // Footer content will be added here
      ])
    ]);
  }

  view(state) {
    return div('.app-container', [
      this.renderHeader(state),
      this.renderContent(state),
      this.renderFooter(state)
    ]);
  }
}