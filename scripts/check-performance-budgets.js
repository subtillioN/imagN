const fs = require('fs');
const path = require('path');
const { PerformanceBenchmark } = require('../dist/utils/performanceBenchmark');
const { PropAnalyzer } = require('../dist/utils/propAnalysis');

async function runPerformanceChecks() {
  // Initialize benchmark with custom budgets
  const benchmark = new PerformanceBenchmark({
    maxAnalysisTime: 150, // 150ms for CI environment
    maxMemoryUsage: 100 * 1024 * 1024, // 100MB
    maxUpdateLatency: 20, // 20ms
  });

  // Create test data
  const testComponents = Array.from({ length: 50 }, (_, i) => ({
    componentName: `TestComponent${i}`,
    props: Array.from({ length: 10 }, (_, j) => ({
      name: `prop${j}`,
      type: 'any',
      required: true,
      usageCount: 100,
      valueChanges: Math.floor(Math.random() * 100),
      lastValue: null,
    })),
  }));

  const testData = {
    components: testComponents,
    unusedProps: [],
    propPatterns: [],
    frequentUpdates: [],
  };

  // Start benchmarking
  benchmark.startBenchmark();

  // Run analysis multiple times to get average metrics
  const analyzer = new PropAnalyzer();
  for (let i = 0; i < 10; i++) {
    analyzer.analyzeProps(testData);
    benchmark.measureAnalysis(testData);
  }

  // Generate report
  const averageMetrics = benchmark.getAverageMetrics();
  const violations = benchmark.checkBudget(averageMetrics);
  const status = violations.length === 0 ? 'PASS' : 'FAIL';

  // Create report object
  const report = {
    timestamp: new Date().toISOString(),
    status,
    metrics: averageMetrics,
    violations,
  };

  // Save report
  fs.writeFileSync(
    path.join(process.cwd(), 'performance-report.json'),
    JSON.stringify(report, null, 2)
  );

  // Log results
  console.log(benchmark.generateReport());

  // Exit with appropriate code
  process.exit(violations.length === 0 ? 0 : 1);
}

runPerformanceChecks().catch(error => {
  console.error('Performance check failed:', error);
  process.exit(1);
}); 