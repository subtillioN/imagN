import React, { ComponentType, useEffect } from 'react';
import { propAnalyzer } from './propAnalysis';

export function withPropTracking<P extends object>(
  WrappedComponent: ComponentType<P>,
  componentName: string = WrappedComponent.displayName || WrappedComponent.name
) {
  const WithPropTracking: React.FC<P> = (props) => {
    useEffect(() => {
      propAnalyzer.trackPropUsage(WrappedComponent, props, componentName);
    }, [props]);

    return <WrappedComponent {...props} />;
  };

  WithPropTracking.displayName = `WithPropTracking(${componentName})`;
  return WithPropTracking;
} 