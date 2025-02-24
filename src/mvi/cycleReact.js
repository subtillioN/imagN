import React from 'react';
import { makeReactComponent } from '@cycle/react';

// Helper function to create a Cycle.js React component from our MVI views
export const createCycleComponent = (ViewComponent, sources) => {
  // Wrap our view component with Cycle.js React bindings
  const CycleWrapper = (props) => {
    const view = new ViewComponent({
      ...sources,
      props: props
    });

    // Create the reactive view stream
    const viewStream$ = view.state$.map(state => view.view(state));

    // Return the reactive component
    return makeReactComponent(viewStream$);
  };

  // Set display name for debugging
  CycleWrapper.displayName = `Cycle(${ViewComponent.name})`;

  return CycleWrapper;
};

// Higher-order component to provide Cycle.js context
export const withCycle = (Component) => {
  return (props) => {
    return (
      <Component
        {...props}
        sources={{
          state: props.state || {},
          props: props
        }}
      />
    );
  };
};