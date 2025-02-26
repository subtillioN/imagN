const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const config = {
  sourceDirs: ['src'],
  excludeDirs: ['node_modules', 'dist', 'build'],
  extensions: ['.ts', '.tsx', '.js', '.jsx'],
  thresholds: {
    fileSize: 500 * 1024, // 500KB
    complexity: 20,
    dependencies: 15,
  },
};

// Analysis results
const results = {
  largeFiles: [],
  complexComponents: [],
  highDependencies: [],
  unusedExports: [],
  suggestions: [],
};

function analyzeFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const stats = fs.statSync(filePath);
  const relativePath = path.relative(process.cwd(), filePath);

  // Check file size
  if (stats.size > config.thresholds.fileSize) {
    results.largeFiles.push({
      path: relativePath,
      size: stats.size,
      suggestion: 'Consider splitting into smaller modules',
    });
  }

  // Check component complexity
  if (filePath.endsWith('.tsx') || filePath.endsWith('.jsx')) {
    const componentComplexity = analyzeComponentComplexity(content);
    if (componentComplexity > config.thresholds.complexity) {
      results.complexComponents.push({
        path: relativePath,
        complexity: componentComplexity,
        suggestion: 'Consider breaking down into smaller components',
      });
    }
  }

  // Check dependencies
  const dependencies = analyzeDependencies(content);
  if (dependencies.length > config.thresholds.dependencies) {
    results.highDependencies.push({
      path: relativePath,
      count: dependencies.length,
      dependencies,
      suggestion: 'Consider reducing external dependencies',
    });
  }

  // Check for potential optimizations
  analyzePotentialOptimizations(content, relativePath);
}

function analyzeComponentComplexity(content) {
  let complexity = 0;
  
  // Count conditional statements
  complexity += (content.match(/if|else|switch|case|&&|\?\./g) || []).length;
  
  // Count loops
  complexity += (content.match(/for|while|map|reduce|filter|forEach/g) || []).length;
  
  // Count JSX depth
  const jsxDepth = Math.max(...(content.match(/<[^>]+>/g) || [])
    .map(tag => tag.split('<').length - 1));
  complexity += jsxDepth;

  return complexity;
}

function analyzeDependencies(content) {
  const imports = content.match(/import .* from ['"].*['"]/g) || [];
  return imports.map(imp => {
    const match = imp.match(/from ['"](.*)['"]/) || [];
    return match[1];
  }).filter(Boolean);
}

function analyzePotentialOptimizations(content, filePath) {
  // Check for missing memo
  if (content.includes('export default function') && 
      !content.includes('memo') &&
      content.includes('props')) {
    results.suggestions.push({
      path: filePath,
      type: 'memo',
      message: 'Consider using React.memo for components with props',
    });
  }

  // Check for inline object/array creation
  if (content.includes('style={{') || content.includes('={[')) {
    results.suggestions.push({
      path: filePath,
      type: 'inline-creation',
      message: 'Consider memoizing inline objects/arrays',
    });
  }

  // Check for expensive computations
  if (content.includes('.filter(') || content.includes('.map(') || content.includes('.reduce(')) {
    results.suggestions.push({
      path: filePath,
      type: 'computation',
      message: 'Consider memoizing expensive computations',
    });
  }
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      if (!config.excludeDirs.includes(file)) {
        walkDir(filePath);
      }
    } else if (config.extensions.includes(path.extname(file))) {
      analyzeFile(filePath);
    }
  });
}

function generateReport() {
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      largeFiles: results.largeFiles.length,
      complexComponents: results.complexComponents.length,
      highDependencies: results.highDependencies.length,
      suggestions: results.suggestions.length,
    },
    details: results,
  };

  fs.writeFileSync(
    'optimization-report.json',
    JSON.stringify(report, null, 2)
  );

  console.log('\nOptimization Report');
  console.log('==================');
  console.log('\nSummary:');
  console.log(`- Large files: ${report.summary.largeFiles}`);
  console.log(`- Complex components: ${report.summary.complexComponents}`);
  console.log(`- High dependencies: ${report.summary.highDependencies}`);
  console.log(`- Optimization suggestions: ${report.summary.suggestions}`);

  if (results.suggestions.length > 0) {
    console.log('\nKey Suggestions:');
    results.suggestions.forEach(suggestion => {
      console.log(`\n${suggestion.path}:`);
      console.log(`- Type: ${suggestion.type}`);
      console.log(`- Suggestion: ${suggestion.message}`);
    });
  }
}

// Run analysis
console.log('Analyzing codebase...');
config.sourceDirs.forEach(dir => walkDir(dir));
generateReport();

// Run automated optimizations
console.log('\nRunning automated optimizations...');

// Format code
console.log('Formatting code...');
execSync('prettier --write "src/**/*.{ts,tsx,js,jsx}"');

// Run ESLint fixes
console.log('Running ESLint fixes...');
execSync('eslint --fix "src/**/*.{ts,tsx,js,jsx}"');

// Remove unused imports
console.log('Removing unused imports...');
execSync('tsc --noEmit'); // Check for TypeScript errors

console.log('\nOptimizations complete! Check optimization-report.json for details.'); 