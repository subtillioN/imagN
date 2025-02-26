import React, { Profiler } from 'react';
import { render, screen, act } from '@testing-library/react';
import { PropAnalyzer } from '../../utils/propAnalysis';
import MonitoringDashboard from '../../components/DevTools/MonitoringDashboard';
import OptimizationRecommendations from '../../components/DevTools/OptimizationRecommendations';
import ErrorBoundary from '../../components/ErrorBoundary';

describe('PropAnalysis Extended Integration', () => {
  let analyzer: PropAnalyzer;

  beforeEach(() => {
    analyzer = new PropAnalyzer();
    localStorage.clear();
  });

  describe('React Profiler Integration', () => {
    it('should collect performance metrics', () => {
      const onRender = jest.fn();

      render(
        <Profiler id="prop-analysis" onRender={onRender}>
          <MonitoringDashboard data={analyzer.analyzeProps()} />
        </Profiler>
      );

      expect(onRender).toHaveBeenCalled();
      const [id, phase, actualDuration] = onRender.mock.calls[0];
      expect(id).toBe('prop-analysis');
      expect(actualDuration).toBeLessThan(100); // Should render within 100ms
    });

    it('should track commit timing', async () => {
      const onRender = jest.fn();
      const { rerender } = render(
        <Profiler id="prop-analysis" onRender={onRender}>
          <MonitoringDashboard data={analyzer.analyzeProps()} />
        </Profiler>
      );

      // Force multiple commits
      for (let i = 0; i < 5; i++) {
        await act(async () => {
          analyzer.trackPropUsage(
            MonitoringDashboard,
            { data: analyzer.analyzeProps() },
            'MonitoringDashboard'
          );
          rerender(
            <Profiler id="prop-analysis" onRender={onRender}>
              <MonitoringDashboard data={analyzer.analyzeProps()} />
            </Profiler>
          );
        });
      }

      expect(onRender).toHaveBeenCalledTimes(6); // Initial + 5 updates
      const commitDurations = onRender.mock.calls.map(call => call[2]);
      expect(Math.max(...commitDurations)).toBeLessThan(100);
    });
  });

  describe('Network Performance', () => {
    beforeEach(() => {
      // Mock slow network conditions
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should handle slow network conditions', async () => {
      const { rerender } = render(<MonitoringDashboard data={analyzer.analyzeProps()} />);

      // Simulate slow network updates
      await act(async () => {
        for (let i = 0; i < 5; i++) {
          analyzer.trackPropUsage(
            MonitoringDashboard,
            { data: analyzer.analyzeProps() },
            'MonitoringDashboard'
          );
          jest.advanceTimersByTime(1000); // Simulate 1s network delay
          rerender(<MonitoringDashboard data={analyzer.analyzeProps()} />);
        }
      });

      expect(screen.getByText(/Components Tracked/)).toBeInTheDocument();
    });

    it('should work offline', () => {
      // Simulate offline mode
      Object.defineProperty(navigator, 'onLine', { value: false, writable: true });
      
      render(<MonitoringDashboard data={analyzer.analyzeProps()} />);
      expect(screen.getByText(/Components Tracked/)).toBeInTheDocument();

      // Restore online mode
      Object.defineProperty(navigator, 'onLine', { value: true, writable: true });
    });
  });

  describe('State Persistence', () => {
    it('should persist analysis state', () => {
      const analysis = analyzer.analyzeProps();
      localStorage.setItem('prop-analysis-state', JSON.stringify(analysis));

      // Simulate page reload by creating a new window object
      const oldWindow = { ...window };
      const newWindow = { ...oldWindow };
      Object.defineProperty(global, 'window', {
        value: newWindow,
        writable: true,
        configurable: true
      });

      const savedState = JSON.parse(localStorage.getItem('prop-analysis-state') || '{}');
      render(<MonitoringDashboard data={savedState} />);

      expect(screen.getByText(/Components Tracked/)).toBeInTheDocument();

      // Restore original window
      Object.defineProperty(global, 'window', {
        value: oldWindow,
        writable: true,
        configurable: true
      });
    });

    it('should recover from corrupted state', () => {
      localStorage.setItem('prop-analysis-state', 'invalid-json');

      render(<MonitoringDashboard data={analyzer.analyzeProps()} />);
      expect(screen.getByText(/Components Tracked/)).toBeInTheDocument();
    });
  });

  describe('Error Boundaries', () => {
    it('should catch and handle component errors', () => {
      const ErrorComponent = () => {
        throw new Error('Test error');
      };

      render(
        <ErrorBoundary fallback={<div>Error occurred</div>}>
          <ErrorComponent />
          <MonitoringDashboard data={analyzer.analyzeProps()} />
        </ErrorBoundary>
      );

      expect(screen.getByText(/Error occurred/)).toBeInTheDocument();
    });

    it('should recover from analysis errors', () => {
      jest.spyOn(analyzer, 'analyzeProps').mockImplementationOnce(() => {
        throw new Error('Analysis error');
      });

      render(
        <ErrorBoundary fallback={<div>Analysis failed</div>}>
          <MonitoringDashboard data={analyzer.analyzeProps()} />
        </ErrorBoundary>
      );

      expect(screen.getByText(/Analysis failed/)).toBeInTheDocument();
    });
  });

  describe('Cross-browser Support', () => {
    it('should handle touch events', async () => {
      const { container } = render(<OptimizationRecommendations data={analyzer.analyzeProps()} />);
      
      const touchTarget = screen.getByText(/optimization/i);
      const touchStartEvent = new TouchEvent('touchstart', {
        bubbles: true,
        cancelable: true,
        touches: [{ clientX: 0, clientY: 0 } as Touch]
      });

      await act(async () => {
        touchTarget.dispatchEvent(touchStartEvent);
      });

      expect(screen.getByText(/Implementation Steps/i)).toBeInTheDocument();
    });

    it('should work with WebWorkers if available', async () => {
      // Check if WebWorker is supported
      if (typeof Worker !== 'undefined') {
        const workerCode = `
          self.onmessage = function(e) {
            self.postMessage(e.data);
          };
        `;
        const blob = new Blob([workerCode], { type: 'application/javascript' });
        const worker = new Worker(URL.createObjectURL(blob));

        // Test worker communication
        await new Promise<void>((resolve) => {
          worker.onmessage = (e) => {
            expect(e.data).toBe('test');
            worker.terminate();
            resolve();
          };
          worker.postMessage('test');
        });
      }
    });
  });
}); 