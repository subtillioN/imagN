import React from 'react';

// Base view component
export class BaseView extends React.Component {
  constructor(sources) {
    super({ sources });
    this.sources = sources;
    this.state$ = sources?.state || {};
    this.state = {};
  }

  // Template method for view rendering
  render() {
    return this.view(this.state);
  }

  view(state) {
    return (
      <div className="base-view">
        <h1 className="title">Base View</h1>
        {this.renderContent(state)}
      </div>
    );
  }

  // Placeholder for content rendering
  renderContent(state) {
    return (
      <div className="content">
        <p>Override renderContent in child classes</p>
      </div>
    );
  }

  // Error rendering
  renderError(error) {
    return (
      <div className="error">
        <p className="error-message">{error.message}</p>
      </div>
    );
  }

  // Loading state rendering
  renderLoading() {
    return (
      <div className="loading">
        <p>Loading...</p>
      </div>
    );
  }
}

// Create view stream
export const createView = (sources) => {
  const view = new BaseView(sources);
  return createCycleComponent(BaseView, sources);
};