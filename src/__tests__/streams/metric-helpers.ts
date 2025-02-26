/**
 * Metric Analysis and Visualization Helpers
 * These utilities help analyze and visualize performance metrics from stream tests.
 */

export interface MetricSummary {
  min: number;
  max: number;
  avg: number;
  p95: number;
  p99: number;
}

/**
 * Calculates a specific percentile from an array of values
 */
export function calculatePercentile(values: number[], percentile: number): number {
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.ceil((percentile / 100) * sorted.length) - 1;
  return sorted[index];
}

/**
 * Generates a comprehensive summary of numeric metrics
 */
export function summarizeMetrics(values: number[]): MetricSummary {
  if (values.length === 0) {
    throw new Error('Cannot summarize empty metrics array');
  }
  const sum = values.reduce((acc, val) => acc + val, 0);
  return {
    min: Math.min(...values),
    max: Math.max(...values),
    avg: sum / values.length,
    p95: calculatePercentile(values, 95),
    p99: calculatePercentile(values, 99)
  };
}

/**
 * Creates a moving average calculator with specified window size
 */
export function createMovingAverage(windowSize: number) {
  const window: number[] = [];
  return (value: number): number => {
    window.push(value);
    if (window.length > windowSize) {
      window.shift();
    }
    return window.reduce((sum, val) => sum + val, 0) / window.length;
  };
}

/**
 * Detects anomalies in a dataset using standard deviation
 */
export function detectAnomalies(values: number[], threshold = 2): number[] {
  const summary = summarizeMetrics(values);
  const stdDev = Math.sqrt(
    values.reduce((sum, val) => sum + Math.pow(val - summary.avg, 2), 0) / values.length
  );
  return values.filter(val => Math.abs(val - summary.avg) > threshold * stdDev);
}

/**
 * Formats metrics as a readable table string
 */
export function formatMetricTable(metrics: Record<string, number>): string {
  return Object.entries(metrics)
    .map(([key, value]) => `${key.padEnd(20)}: ${value.toFixed(2)}`)
    .join('\n');
}

/**
 * Creates an ASCII visualization of value distribution
 */
export function visualizeDistribution(values: number[], buckets = 10): string {
  if (values.length === 0) {
    return 'No data to visualize';
  }

  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min;
  const bucketSize = range / buckets;
  const distribution = new Array(buckets).fill(0);

  values.forEach(value => {
    const bucketIndex = Math.min(
      Math.floor((value - min) / bucketSize),
      buckets - 1
    );
    distribution[bucketIndex]++;
  });

  const maxCount = Math.max(...distribution);
  const scale = 40; // Width of the visualization

  return distribution
    .map((count, i) => {
      const start = (min + i * bucketSize).toFixed(2);
      const end = (min + (i + 1) * bucketSize).toFixed(2);
      const bar = '#'.repeat(Math.round((count / maxCount) * scale));
      return `${start.padStart(8)} - ${end.padStart(8)}: ${bar} (${count})`;
    })
    .join('\n');
}

/**
 * Calculates throughput metrics over time windows
 */
export function calculateThroughput(timestamps: number[], windowSize = 1000): number[] {
  if (timestamps.length < 2) {
    return [];
  }

  const start = timestamps[0];
  const end = timestamps[timestamps.length - 1];
  const windows: number[] = [];

  for (let t = start; t < end; t += windowSize) {
    const count = timestamps.filter(ts => ts >= t && ts < t + windowSize).length;
    windows.push(count);
  }

  return windows;
}

/**
 * Calculates statistical moments (mean, variance, skewness, kurtosis)
 */
export function calculateStatisticalMoments(values: number[]): {
  mean: number;
  variance: number;
  skewness: number;
  kurtosis: number;
} {
  const n = values.length;
  if (n === 0) {
    throw new Error('Cannot calculate moments of empty array');
  }

  const mean = values.reduce((a, b) => a + b, 0) / n;
  const m2 = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / n;
  const m3 = values.reduce((a, b) => a + Math.pow(b - mean, 3), 0) / n;
  const m4 = values.reduce((a, b) => a + Math.pow(b - mean, 4), 0) / n;

  const variance = m2;
  const stdDev = Math.sqrt(variance);
  const skewness = m3 / Math.pow(stdDev, 3);
  const kurtosis = (m4 / Math.pow(variance, 2)) - 3; // Excess kurtosis

  return { mean, variance, skewness, kurtosis };
}

/**
 * Performs trend analysis using linear regression
 */
export function analyzeTrend(values: number[], timestamps: number[]): {
  slope: number;
  intercept: number;
  rSquared: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  confidence: number;
} {
  const n = values.length;
  if (n !== timestamps.length) {
    throw new Error('Values and timestamps arrays must have equal length');
  }

  const normalizedTime = timestamps.map(t => t - timestamps[0]);
  const meanX = normalizedTime.reduce((a, b) => a + b, 0) / n;
  const meanY = values.reduce((a, b) => a + b, 0) / n;

  let ssxx = 0, ssyy = 0, ssxy = 0;
  for (let i = 0; i < n; i++) {
    ssxx += Math.pow(normalizedTime[i] - meanX, 2);
    ssyy += Math.pow(values[i] - meanY, 2);
    ssxy += (normalizedTime[i] - meanX) * (values[i] - meanY);
  }

  const slope = ssxy / ssxx;
  const intercept = meanY - slope * meanX;
  const rSquared = Math.pow(ssxy, 2) / (ssxx * ssyy);
  
  // Calculate confidence using t-distribution
  const stderr = Math.sqrt((ssyy - slope * ssxy) / ((n - 2) * ssxx));
  const tStat = Math.abs(slope / stderr);
  const confidence = 1 - 2 * (1 - normalCDF(tStat));

  return {
    slope,
    intercept,
    rSquared,
    trend: slope > 0 ? 'increasing' : slope < 0 ? 'decreasing' : 'stable',
    confidence
  };
}

/**
 * Performs change point detection using CUSUM algorithm
 */
export function detectChangePoints(values: number[], threshold = 2): number[] {
  const n = values.length;
  const mean = values.reduce((a, b) => a + b, 0) / n;
  const stdDev = Math.sqrt(
    values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / n
  );

  const changePoints: number[] = [];
  let cusum = 0;
  let maxCusum = 0;
  let minCusum = 0;

  values.forEach((value, i) => {
    const normalized = (value - mean) / stdDev;
    cusum += normalized;

    if (cusum > maxCusum) {
      maxCusum = cusum;
    } else if (cusum < minCusum) {
      minCusum = cusum;
    }

    if (Math.abs(maxCusum - minCusum) > threshold) {
      changePoints.push(i);
      cusum = 0;
      maxCusum = 0;
      minCusum = 0;
    }
  });

  return changePoints;
}

/**
 * Performs seasonal decomposition using moving averages
 */
export function decomposeTimeSeries(values: number[], period: number): {
  trend: number[];
  seasonal: number[];
  residual: number[];
} {
  const n = values.length;
  if (n < period * 2) {
    throw new Error('Insufficient data for seasonal decomposition');
  }

  // Calculate trend using centered moving average
  const trend: number[] = [];
  for (let i = Math.floor(period/2); i < n - Math.floor(period/2); i++) {
    let sum = 0;
    for (let j = -Math.floor(period/2); j <= Math.floor(period/2); j++) {
      sum += values[i + j];
    }
    trend[i] = sum / period;
  }

  // Fill edges with nearest values
  for (let i = 0; i < Math.floor(period/2); i++) {
    trend[i] = trend[Math.floor(period/2)];
  }
  for (let i = n - Math.floor(period/2); i < n; i++) {
    trend[i] = trend[n - Math.floor(period/2) - 1];
  }

  // Calculate seasonal component
  const detrended = values.map((v, i) => v - trend[i]);
  const seasonal: number[] = new Array(n).fill(0);
  
  for (let i = 0; i < n; i++) {
    const seasonalIndex = i % period;
    let sum = 0;
    let count = 0;
    
    for (let j = seasonalIndex; j < n; j += period) {
      sum += detrended[j];
      count++;
    }
    
    const seasonalFactor = sum / count;
    for (let j = seasonalIndex; j < n; j += period) {
      seasonal[j] = seasonalFactor;
    }
  }

  // Calculate residuals
  const residual = values.map((v, i) => v - trend[i] - seasonal[i]);

  return { trend, seasonal, residual };
}

// Helper function for normal CDF approximation
function normalCDF(x: number): number {
  const t = 1 / (1 + 0.2316419 * Math.abs(x));
  const d = 0.3989423 * Math.exp(-x * x / 2);
  const prob = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  return x > 0 ? 1 - prob : prob;
}

// Enhance the analyzeLatencyPatterns function with the new statistical methods
export function analyzeLatencyPatterns(
  latencies: number[],
  timestamps?: number[]
): {
  patterns: string[];
  bottlenecks: number[];
  statistics?: {
    moments: ReturnType<typeof calculateStatisticalMoments>;
    trend?: ReturnType<typeof analyzeTrend>;
    changePoints: number[];
    seasonal?: ReturnType<typeof decomposeTimeSeries>;
  };
} {
  const patterns: string[] = [];
  const bottlenecks: number[] = [];
  const statistics: any = {};

  // Calculate statistical moments
  statistics.moments = calculateStatisticalMoments(latencies);
  
  // Detect anomalies
  const anomalies = detectAnomalies(latencies);
  if (anomalies.length > 0) {
    bottlenecks.push(...anomalies);
    patterns.push(`${anomalies.length} latency spikes detected`);
  }

  // Analyze distribution shape
  if (statistics.moments.skewness > 1) {
    patterns.push('Right-skewed latency distribution (occasional high latencies)');
  } else if (statistics.moments.skewness < -1) {
    patterns.push('Left-skewed latency distribution (occasional low latencies)');
  }

  if (statistics.moments.kurtosis > 2) {
    patterns.push('Heavy-tailed distribution (frequent extreme values)');
  }

  // Analyze trend if timestamps are available
  if (timestamps && timestamps.length === latencies.length) {
    statistics.trend = analyzeTrend(latencies, timestamps);
    if (statistics.trend.confidence > 0.95) {
      patterns.push(
        `Strong ${statistics.trend.trend} trend detected (confidence: ${(statistics.trend.confidence * 100).toFixed(1)}%)`
      );
    }

    // Detect change points
    statistics.changePoints = detectChangePoints(latencies);
    if (statistics.changePoints.length > 0) {
      patterns.push(`${statistics.changePoints.length} significant change points detected`);
    }

    // Perform seasonal decomposition if enough data points
    if (latencies.length >= 24) {
      try {
        statistics.seasonal = decomposeTimeSeries(latencies, 12);
        const seasonalStrength = Math.abs(
          statistics.seasonal.seasonal.reduce((a: number, b: number) => a + Math.abs(b), 0) /
          latencies.length
        );
        if (seasonalStrength > 0.1) {
          patterns.push('Seasonal pattern detected in latencies');
        }
      } catch (e) {
        // Skip seasonal analysis if there's not enough data
      }
    }
  }

  return { patterns, bottlenecks, statistics };
}

/**
 * Creates an ASCII time-series plot
 */
export function visualizeTimeSeries(
  values: number[],
  timestamps: number[],
  height = 20,
  width = 80
): string {
  if (values.length === 0) return 'No data to visualize';

  const normalizedTimestamps = timestamps.map(ts => ts - timestamps[0]);
  const timeMax = Math.max(...normalizedTimestamps);
  const valueMin = Math.min(...values);
  const valueMax = Math.max(...values);
  const valueRange = valueMax - valueMin;

  // Create the plot matrix
  const plot = Array(height).fill(0).map(() => Array(width).fill(' '));

  // Plot the values
  values.forEach((value, i) => {
    const x = Math.floor((normalizedTimestamps[i] / timeMax) * (width - 1));
    const y = Math.floor(((value - valueMin) / valueRange) * (height - 1));
    plot[height - 1 - y][x] = '•';
  });

  // Add axis labels
  const yAxisLabels = Array(5).fill(0).map((_, i) => 
    (valueMin + (valueRange * i / 4)).toFixed(1).padStart(8)
  );

  // Compose the final visualization
  const plotLines = plot.map((line, i) => {
    const yLabel = i % Math.floor(height / 4) === 0 
      ? yAxisLabels[Math.floor(i * 4 / height)].padEnd(8)
      : '        ';
    return yLabel + '│' + line.join('');
  });

  // Add x-axis
  const xAxis = '        └' + '─'.repeat(width);
  const xLabels = Array(5).fill(0).map((_, i) => 
    Math.floor(timeMax * i / 4).toString().padStart(Math.floor(width / 4))
  ).join('');

  return [
    ...plotLines,
    xAxis,
    '         ' + xLabels
  ].join('\n');
}

/**
 * Visualizes the correlation between two metrics
 */
export function visualizeCorrelation(
  values1: number[],
  values2: number[],
  height = 20,
  width = 80
): string {
  if (values1.length === 0 || values2.length === 0) return 'No data to visualize';
  if (values1.length !== values2.length) return 'Data series must have equal length';

  const x1 = Math.min(...values1);
  const x2 = Math.max(...values1);
  const y1 = Math.min(...values2);
  const y2 = Math.max(...values2);

  // Create the plot matrix
  const plot = Array(height).fill(0).map(() => Array(width).fill(' '));

  // Plot the points
  values1.forEach((v1, i) => {
    const x = Math.floor(((v1 - x1) / (x2 - x1)) * (width - 1));
    const y = Math.floor(((values2[i] - y1) / (y2 - y1)) * (height - 1));
    plot[height - 1 - y][x] = '•';
  });

  // Calculate correlation coefficient
  const mean1 = values1.reduce((a, b) => a + b) / values1.length;
  const mean2 = values2.reduce((a, b) => a + b) / values2.length;
  const variance1 = values1.reduce((a, b) => a + Math.pow(b - mean1, 2), 0);
  const variance2 = values2.reduce((a, b) => a + Math.pow(b - mean2, 2), 0);
  const covariance = values1.reduce((a, b, i) => 
    a + ((b - mean1) * (values2[i] - mean2)), 0
  );
  const correlation = covariance / Math.sqrt(variance1 * variance2);

  // Compose the visualization
  const yLabels = Array(5).fill(0).map((_, i) => 
    (y1 + ((y2 - y1) * i / 4)).toFixed(1).padStart(8)
  );

  const plotLines = plot.map((line, i) => {
    const yLabel = i % Math.floor(height / 4) === 0 
      ? yLabels[Math.floor(i * 4 / height)].padEnd(8)
      : '        ';
    return yLabel + '│' + line.join('');
  });

  const xAxis = '        └' + '─'.repeat(width);
  const xLabels = Array(5).fill(0).map((_, i) => 
    (x1 + ((x2 - x1) * i / 4)).toFixed(1).padStart(Math.floor(width / 4))
  ).join('');

  return [
    `Correlation: ${correlation.toFixed(3)}`,
    '',
    ...plotLines,
    xAxis,
    '         ' + xLabels
  ].join('\n');
}

/**
 * Generates a comprehensive performance report
 */
export function generatePerformanceReport(metrics: {
  latencies: number[];
  throughput: number[];
  errors: number;
  totalRequests: number;
  timestamps?: number[];
}): string {
  const latencySummary = summarizeMetrics(metrics.latencies);
  const throughputSummary = summarizeMetrics(metrics.throughput);
  const errorRate = (metrics.errors / metrics.totalRequests) * 100;
  const analysis = analyzeLatencyPatterns(metrics.latencies, metrics.timestamps);

  const sections = [
    'Performance Report',
    '=================',
    '',
    'Latency Metrics (ms):',
    formatMetricTable({
      min: latencySummary.min,
      max: latencySummary.max,
      avg: latencySummary.avg,
      p95: latencySummary.p95,
      p99: latencySummary.p99
    }),
    '',
    'Statistical Analysis:',
    formatMetricTable({
      skewness: analysis.statistics?.moments.skewness || 0,
      kurtosis: analysis.statistics?.moments.kurtosis || 0,
      ...(analysis.statistics?.trend ? {
        trend_slope: analysis.statistics.trend.slope,
        trend_confidence: analysis.statistics.trend.confidence
      } : {})
    }),
    '',
    'Throughput Metrics (req/s):',
    formatMetricTable({
      min: throughputSummary.min,
      max: throughputSummary.max,
      avg: throughputSummary.avg,
      p95: throughputSummary.p95,
      p99: throughputSummary.p99
    }),
    '',
    'Error Rate: ' + errorRate.toFixed(2) + '%',
    '',
    'Latency Distribution:',
    visualizeDistribution(metrics.latencies)
  ];

  if (metrics.timestamps && metrics.timestamps.length > 0) {
    sections.push(
      '',
      'Latency Over Time:',
      visualizeTimeSeries(metrics.latencies, metrics.timestamps),
      '',
      'Throughput vs Latency Correlation:',
      visualizeCorrelation(metrics.throughput, metrics.latencies)
    );

    if (analysis.statistics?.seasonal) {
      sections.push(
        '',
        'Seasonal Decomposition:',
        'Trend Component:',
        visualizeTimeSeries(analysis.statistics.seasonal.trend, metrics.timestamps),
        '',
        'Seasonal Component:',
        visualizeTimeSeries(analysis.statistics.seasonal.seasonal, metrics.timestamps)
      );
    }
  }

  sections.push(
    '',
    'Analysis:',
    ...analysis.patterns
  );

  return sections.join('\n');
} 