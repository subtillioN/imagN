import { div, h1, p, button } from '@cycle/dom';

// Helper function to create DOM elements
const createElement = (tagName, props = {}, children = []) => {
  return {
    tagName,
    props,
    children: Array.isArray(children) ? children : [children]
  };
};

// Base view component
export class BaseView {
  constructor(sources) {
    this.sources = sources;
    this.state$ = sources.state || {};
  }

  // Template method for view rendering
  view(state) {
    return div('.base-view', [
      h1('.title', 'Base View'),
      this.renderContent(state)
    ]);
  }

  // Placeholder for content rendering
  renderContent(state) {
    return div('.content', [
      p('Override renderContent in child classes')
    ]);
  }

  // Main rendering function
  DOM() {
    return this.state$.map(state => this.view(state));
  }

  // Error rendering
  renderError(error) {
    return div('.error', [
      p('.error-message', error.message)
    ]);
  }

  // Loading state rendering
  renderLoading() {
    return div('.loading', [
      p('Loading...')
    ]);
  }
}

// Create view stream
export const createView = (sources) => {
  return new BaseView(sources).DOM();
};