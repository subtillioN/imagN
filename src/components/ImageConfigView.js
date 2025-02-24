import React from 'react';
import { BaseView } from '../mvi/view';
import styles from '../styles/base.module.css';

export class ImageConfigView extends BaseView {
  constructor(sources) {
    super(sources);
    this.initializeStreams();
    this.state = {
      config: {},
      parameters: {}
    };
  }

  initializeStreams() {
    this.config$ = this.sources.state.config$ || {};
    this.parameters$ = this.sources.state.parameters$ || {};

    // Subscribe to stream updates
    this.config$.subscribe(config => {
      this.setState({ config });
    });

    this.parameters$.subscribe(parameters => {
      this.setState({ parameters });
    });
  }

  renderParameters(state) {
    return (
      <div className={styles['parameters-section']}>
        <div className={styles['parameter-group']}>
          <label>Image Size</label>
          <select className={styles['size-select']}>
            <option value="512x512">512x512</option>
            <option value="1024x1024">1024x1024</option>
          </select>
        </div>
        <div className={styles['parameter-group']}>
          <label>Style</label>
          <select className={styles['style-select']}>
            <option value="realistic">Realistic</option>
            <option value="artistic">Artistic</option>
            <option value="abstract">Abstract</option>
          </select>
        </div>
        <div className={styles['parameter-group']}>
          <label>Prompt</label>
          <input
            className={styles['prompt-input']}
            type="text"
            placeholder="Describe your image..."
          />
        </div>
      </div>
    );
  }

  renderControls(state) {
    return (
      <div className={styles['controls-section']}>
        <button className={styles['generate-btn']}>Generate Image</button>
        <button className={styles['reset-btn']}>Reset</button>
      </div>
    );
  }

  renderPreview(state) {
    return (
      <div className={styles['preview-section']}>
        <div className={styles['preview-container']}>
          {/* Preview will be implemented here */}
        </div>
      </div>
    );
  }

  view(state) {
    return (
      <div className={styles['image-config-container']}>
        <div className={styles['config-header']}>Image Configuration</div>
        {this.renderParameters(state)}
        {this.renderPreview(state)}
        {this.renderControls(state)}
      </div>
    );
  }
}