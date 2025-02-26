const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const config = {
  sourceDirs: ['src/components', 'src/styles'],
  thresholds: {
    interactiveElementSize: 44, // minimum touch target size (px)
    colorContrast: 4.5, // WCAG AA standard
    animationDuration: 300, // maximum animation duration (ms)
    loadingTimeout: 2000, // maximum loading state duration (ms)
  },
  cssVariables: {
    spacing: {
      xs: '0.25rem',
      sm: '0.5rem',
      md: '1rem',
      lg: '1.5rem',
      xl: '2rem',
    },
    colors: {
      primary: '#3949ab',
      secondary: '#5c6bc0',
      success: '#43a047',
      warning: '#fb8c00',
      error: '#e53935',
      background: '#2f3545',
      surface: '#3a4255',
      text: '#f8fafc',
    },
    typography: {
      fontFamily: 'system-ui, -apple-system, sans-serif',
      fontSizes: {
        sm: '0.875rem',
        base: '1rem',
        lg: '1.125rem',
        xl: '1.25rem',
      },
    },
    animation: {
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
      duration: {
        fast: '150ms',
        normal: '250ms',
        slow: '350ms',
      },
    },
  },
};

// Analysis results
const results = {
  accessibilityIssues: [],
  inconsistentStyles: [],
  performanceIssues: [],
  suggestions: [],
};

function analyzeComponent(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const relativePath = path.relative(process.cwd(), filePath);

  // Check accessibility
  checkAccessibility(content, relativePath);

  // Check styling consistency
  checkStyling(content, relativePath);

  // Check performance
  checkPerformance(content, relativePath);

  // Generate enhancement suggestions
  generateSuggestions(content, relativePath);
}

function checkAccessibility(content, filePath) {
  // Check for missing ARIA labels
  if (content.includes('role=') && !content.includes('aria-label')) {
    results.accessibilityIssues.push({
      path: filePath,
      type: 'aria-label',
      message: 'Interactive elements should have ARIA labels',
    });
  }

  // Check for keyboard navigation
  if (content.includes('onClick') && !content.includes('onKeyDown')) {
    results.accessibilityIssues.push({
      path: filePath,
      type: 'keyboard-nav',
      message: 'Add keyboard navigation support',
    });
  }

  // Check for color contrast in inline styles
  const colorProps = content.match(/color:\s*['"]#[0-9a-f]{6}['"]/gi) || [];
  colorProps.forEach(prop => {
    if (!meetsContrastRequirements(prop)) {
      results.accessibilityIssues.push({
        path: filePath,
        type: 'color-contrast',
        message: 'Improve color contrast ratio',
        value: prop,
      });
    }
  });
}

function checkStyling(content, filePath) {
  // Check for hardcoded values
  const hardcodedValues = content.match(/(\d+)px/g) || [];
  if (hardcodedValues.length > 0) {
    results.inconsistentStyles.push({
      path: filePath,
      type: 'hardcoded-values',
      message: 'Use CSS variables for consistent spacing',
      values: hardcodedValues,
    });
  }

  // Check for inconsistent colors
  const hexColors = content.match(/#[0-9a-f]{6}/gi) || [];
  hexColors.forEach(color => {
    if (!Object.values(config.cssVariables.colors).includes(color)) {
      results.inconsistentStyles.push({
        path: filePath,
        type: 'inconsistent-colors',
        message: 'Use theme colors for consistency',
        value: color,
      });
    }
  });
}

function checkPerformance(content, filePath) {
  // Check for expensive animations
  if (content.includes('transition') || content.includes('animation')) {
    const durations = content.match(/\d+m?s/g) || [];
    durations.forEach(duration => {
      const ms = parseInt(duration);
      if (ms > config.thresholds.animationDuration) {
        results.performanceIssues.push({
          path: filePath,
          type: 'animation-duration',
          message: 'Reduce animation duration for better performance',
          value: duration,
        });
      }
    });
  }

  // Check for missing loading states
  if (content.includes('fetch(') || content.includes('axios.') || content.includes('api.')) {
    if (!content.includes('loading') && !content.includes('isLoading')) {
      results.performanceIssues.push({
        path: filePath,
        type: 'loading-state',
        message: 'Add loading states for better UX',
      });
    }
  }
}

function generateSuggestions(content, filePath) {
  // Suggest responsive improvements
  if (!content.includes('@media')) {
    results.suggestions.push({
      path: filePath,
      type: 'responsive-design',
      message: 'Add responsive breakpoints for better mobile experience',
    });
  }

  // Suggest touch target improvements
  if (content.includes('button') || content.includes('click')) {
    results.suggestions.push({
      path: filePath,
      type: 'touch-target',
      message: `Ensure touch targets are at least ${config.thresholds.interactiveElementSize}px`,
    });
  }

  // Suggest feedback improvements
  if (content.includes('onClick') || content.includes('onSubmit')) {
    if (!content.includes('feedback') && !content.includes('toast')) {
      results.suggestions.push({
        path: filePath,
        type: 'user-feedback',
        message: 'Add visual feedback for user actions',
      });
    }
  }
}

function generateStyleUpdates() {
  const cssContent = `
/* Generated theme variables */
:root {
  /* Colors */
  ${Object.entries(config.cssVariables.colors)
    .map(([name, value]) => `--color-${name}: ${value};`)
    .join('\n  ')}

  /* Typography */
  --font-family: ${config.cssVariables.typography.fontFamily};
  ${Object.entries(config.cssVariables.typography.fontSizes)
    .map(([name, value]) => `--font-size-${name}: ${value};`)
    .join('\n  ')}

  /* Spacing */
  ${Object.entries(config.cssVariables.spacing)
    .map(([name, value]) => `--spacing-${name}: ${value};`)
    .join('\n  ')}

  /* Animation */
  --animation-easing: ${config.cssVariables.animation.easing};
  ${Object.entries(config.cssVariables.animation.duration)
    .map(([name, value]) => `--animation-${name}: ${value};`)
    .join('\n  ')}
}

/* Base styles */
body {
  font-family: var(--font-family);
  color: var(--color-text);
  background-color: var(--color-background);
}

/* Interactive elements */
button, a {
  min-width: ${config.thresholds.interactiveElementSize}px;
  min-height: ${config.thresholds.interactiveElementSize}px;
  padding: var(--spacing-sm) var(--spacing-md);
  transition: all var(--animation-fast) var(--animation-easing);
}

/* Loading states */
.loading {
  position: relative;
  opacity: 0.7;
  pointer-events: none;
}

/* Feedback states */
.feedback {
  transition: opacity var(--animation-fast) var(--animation-easing);
}

/* Responsive breakpoints */
@media (max-width: 768px) {
  :root {
    --spacing-md: 0.75rem;
    --spacing-lg: 1.25rem;
    --font-size-base: 0.9375rem;
  }
}
`;

  fs.writeFileSync('src/styles/theme.css', cssContent);
}

function generateReport() {
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      accessibilityIssues: results.accessibilityIssues.length,
      stylingIssues: results.inconsistentStyles.length,
      performanceIssues: results.performanceIssues.length,
      suggestions: results.suggestions.length,
    },
    details: results,
  };

  fs.writeFileSync(
    'ui-enhancement-report.json',
    JSON.stringify(report, null, 2)
  );

  console.log('\nUI Enhancement Report');
  console.log('===================');
  console.log('\nSummary:');
  console.log(`- Accessibility issues: ${report.summary.accessibilityIssues}`);
  console.log(`- Styling inconsistencies: ${report.summary.stylingIssues}`);
  console.log(`- Performance issues: ${report.summary.performanceIssues}`);
  console.log(`- Enhancement suggestions: ${report.summary.suggestions}`);

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
console.log('Analyzing UI components...');
config.sourceDirs.forEach(dir => {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    if (file.endsWith('.tsx') || file.endsWith('.css')) {
      analyzeComponent(path.join(dir, file));
    }
  });
});

// Generate theme and style updates
console.log('\nGenerating theme updates...');
generateStyleUpdates();

// Generate report
generateReport();

console.log('\nUI enhancements complete! Check ui-enhancement-report.json for details.'); 