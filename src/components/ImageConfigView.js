import React from 'react';
import styles from '../styles/base.module.css';
import { createSource } from '../streams/core';

export class ImageConfigView extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      config: { format: 'jpeg', compression: 0.8 },
      parameters: { width: 100, height: 100, quality: 80 }
    };
    this.initializeStreams();
  }

  initializeStreams() {
    const { sources } = this.props;
    const state = sources?.state || {};

    this.config$ = state.config$ || createSource({
      next: (sink) => {
        sink(1, this.state.config);
        return () => {};
      }
    });

    this.parameters$ = state.parameters$ || createSource({
      next: (sink) => {
        sink(1, this.state.parameters);
        return () => {};
      }
    });

    // Subscribe to stream updates
    this.config$.source(0, (type, data) => {
      if (type === 1) {
        this.setState({ config: data });
      }
    });

    this.parameters$.source(0, (type, data) => {
      if (type === 1) {
        this.setState({ parameters: data });
      }
    });

    // Add update method to streams
    this.config$.update = (value) => {
      this.config$.source(1, value);
      this.config$.source(2);
    };

    this.parameters$.update = (value) => {
      this.parameters$.source(1, value);
      this.parameters$.source(2);
    };
  }

  render() {
    const { config, parameters } = this.state;

    return (
      <div className={styles['image-config-container']}>
        <div className={styles['config-header']}>Image Configuration</div>
        <div className={styles['parameters-section']}>
          <div className={styles['parameter-group']}>
            <label htmlFor="format">Format</label>
            <select id="format" value={config.format} onChange={(e) => this.config$.source(1, e.target.value)}>
              <option value="jpeg">JPEG</option>
              <option value="png">PNG</option>
              <option value="webp">WebP</option>
            </select>
          </div>
          <div className={styles['parameter-group']}>
            <label htmlFor="compression">Compression</label>
            <input id="compression" type="number" min="0" max="1" step="0.1" value={config.compression} onChange={(e) => this.config$.source(1, { ...config, compression: parseFloat(e.target.value) })} />
          </div>
          <div className={styles['parameter-group']}>
            <label htmlFor="width">Width</label>
            <input id="width" type="number" min="1" value={parameters.width} onChange={(e) => this.parameters$.source(1, { ...parameters, width: parseInt(e.target.value) })} />
          </div>
          <div className={styles['parameter-group']}>
            <label htmlFor="height">Height</label>
            <input id="height" type="number" min="1" value={parameters.height} onChange={(e) => this.parameters$.source(1, { ...parameters, height: parseInt(e.target.value) })} />
          </div>
          <div className={styles['parameter-group']}>
            <label htmlFor="quality">Quality</label>
            <input id="quality" type="number" min="0" max="100" value={parameters.quality} onChange={(e) => this.parameters$.source(1, { ...parameters, quality: parseInt(e.target.value) })} />
          </div>
        </div>
        <div className={styles['preview-section']}>
          <div className={styles['preview-container']}>
            {/* Preview will be implemented here */}
          </div>
        </div>
        <div className={styles['controls-section']}>
          <button className={styles['generate-btn']}>Generate Image</button>
          <button className={styles['reset-btn']}>Reset</button>
        </div>
      </div>
    );
  }

  componentWillUnmount() {
    // Clean up stream subscriptions
    if (this.config$) {
      this.config$.source(2);
    }
    if (this.parameters$) {
      this.parameters$.source(2);
    }
  }
}