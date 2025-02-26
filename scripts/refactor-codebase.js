const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const ts = require('typescript');

// Configuration
const config = {
  sourceDirs: ['src'],
  excludeDirs: ['node_modules', 'dist', 'build'],
  patterns: {
    // Patterns to identify code smells
    duplicateCode: 3, // minimum duplicate lines
    maxFunctionLength: 30, // maximum lines per function
    maxFileLength: 300, // maximum lines per file
    maxComplexity: 10, // maximum cyclomatic complexity
  },
  naming: {
    // Naming conventions
    components: '^[A-Z][a-zA-Z0-9]+$',
    hooks: '^use[A-Z][a-zA-Z0-9]+$',
    utils: '^[a-z][a-zA-Z0-9]+$',
    types: '^[A-Z][a-zA-Z0-9]+$',
  },
};

// Analysis results
const results = {
  codeSmells: [],
  namingViolations: [],
  typeIssues: [],
  suggestions: [],
};

function analyzeFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const relativePath = path.relative(process.cwd(), filePath);
  const extension = path.extname(filePath);

  // Parse TypeScript/JavaScript files
  if (['.ts', '.tsx', '.js', '.jsx'].includes(extension)) {
    const sourceFile = ts.createSourceFile(
      filePath,
      content,
      ts.ScriptTarget.Latest,
      true
    );

    // Analyze code structure
    analyzeCodeStructure(sourceFile, relativePath);

    // Check naming conventions
    checkNamingConventions(sourceFile, relativePath);

    // Analyze types
    if (['.ts', '.tsx'].includes(extension)) {
      analyzeTypes(sourceFile, relativePath);
    }
  }
}

function analyzeCodeStructure(sourceFile, filePath) {
  let functionCount = 0;
  let maxComplexity = 0;

  function visit(node) {
    // Check function length
    if (ts.isFunctionDeclaration(node) || ts.isMethodDeclaration(node) || 
        ts.isArrowFunction(node) || ts.isFunctionExpression(node)) {
      functionCount++;
      const start = node.getStart(sourceFile);
      const end = node.getEnd();
      const lines = sourceFile.text.substring(start, end).split('\n').length;

      if (lines > config.patterns.maxFunctionLength) {
        results.codeSmells.push({
          path: filePath,
          type: 'function-length',
          message: `Function exceeds ${config.patterns.maxFunctionLength} lines`,
          location: `Line ${sourceFile.getLineAndCharacterOfPosition(start).line + 1}`,
        });
      }

      // Calculate complexity
      const complexity = calculateComplexity(node);
      maxComplexity = Math.max(maxComplexity, complexity);
      if (complexity > config.patterns.maxComplexity) {
        results.codeSmells.push({
          path: filePath,
          type: 'complexity',
          message: `Function complexity (${complexity}) exceeds threshold (${config.patterns.maxComplexity})`,
          location: `Line ${sourceFile.getLineAndCharacterOfPosition(start).line + 1}`,
        });
      }
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);

  // Check file length
  const lines = sourceFile.text.split('\n').length;
  if (lines > config.patterns.maxFileLength) {
    results.codeSmells.push({
      path: filePath,
      type: 'file-length',
      message: `File exceeds ${config.patterns.maxFileLength} lines`,
      lines,
    });
  }

  // Generate suggestions
  if (functionCount > 10) {
    results.suggestions.push({
      path: filePath,
      type: 'split-file',
      message: 'Consider splitting file into smaller modules',
    });
  }
}

function checkNamingConventions(sourceFile, filePath) {
  function visit(node) {
    if (ts.isClassDeclaration(node) || ts.isFunctionDeclaration(node)) {
      const name = node.name?.text;
      if (name) {
        // Check component naming
        if (sourceFile.fileName.includes('components') && 
            !new RegExp(config.naming.components).test(name)) {
          results.namingViolations.push({
            path: filePath,
            type: 'component-name',
            message: `Component "${name}" should match pattern ${config.naming.components}`,
          });
        }

        // Check hook naming
        if (name.startsWith('use') && !new RegExp(config.naming.hooks).test(name)) {
          results.namingViolations.push({
            path: filePath,
            type: 'hook-name',
            message: `Hook "${name}" should match pattern ${config.naming.hooks}`,
          });
        }
      }
    }

    // Check type naming
    if (ts.isInterfaceDeclaration(node) || ts.isTypeAliasDeclaration(node)) {
      const name = node.name.text;
      if (!new RegExp(config.naming.types).test(name)) {
        results.namingViolations.push({
          path: filePath,
          type: 'type-name',
          message: `Type "${name}" should match pattern ${config.naming.types}`,
        });
      }
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
}

function analyzeTypes(sourceFile, filePath) {
  function visit(node) {
    // Check for any type usage
    if (ts.isTypeReferenceNode(node) && node.typeName.getText(sourceFile) === 'any') {
      results.typeIssues.push({
        path: filePath,
        type: 'any-usage',
        message: 'Avoid using "any" type',
        location: `Line ${sourceFile.getLineAndCharacterOfPosition(node.getStart()).line + 1}`,
      });
    }

    // Check for proper type imports
    if (ts.isImportDeclaration(node)) {
      const importClause = node.importClause;
      if (importClause?.isTypeOnly) {
        results.suggestions.push({
          path: filePath,
          type: 'type-import',
          message: 'Consider using "import type" for type-only imports',
          location: `Line ${sourceFile.getLineAndCharacterOfPosition(node.getStart()).line + 1}`,
        });
      }
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
}

function calculateComplexity(node) {
  let complexity = 1;

  function visit(node) {
    if (
      ts.isIfStatement(node) ||
      ts.isConditionalExpression(node) ||
      ts.isCaseClause(node) ||
      ts.isForStatement(node) ||
      ts.isWhileStatement(node) ||
      ts.isDoStatement(node) ||
      ts.isCatchClause(node)
    ) {
      complexity++;
    }

    ts.forEachChild(node, visit);
  }

  visit(node);
  return complexity;
}

function generateReport() {
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      codeSmells: results.codeSmells.length,
      namingViolations: results.namingViolations.length,
      typeIssues: results.typeIssues.length,
      suggestions: results.suggestions.length,
    },
    details: results,
  };

  fs.writeFileSync(
    'refactoring-report.json',
    JSON.stringify(report, null, 2)
  );

  console.log('\nRefactoring Report');
  console.log('=================');
  console.log('\nSummary:');
  console.log(`- Code smells: ${report.summary.codeSmells}`);
  console.log(`- Naming violations: ${report.summary.namingViolations}`);
  console.log(`- Type issues: ${report.summary.typeIssues}`);
  console.log(`- Refactoring suggestions: ${report.summary.suggestions}`);

  if (results.suggestions.length > 0) {
    console.log('\nKey Refactoring Suggestions:');
    results.suggestions.forEach(suggestion => {
      console.log(`\n${suggestion.path}:`);
      console.log(`- Type: ${suggestion.type}`);
      console.log(`- Suggestion: ${suggestion.message}`);
    });
  }
}

function applyAutomaticRefactoring() {
  console.log('\nApplying automatic refactoring...');

  // Run TypeScript compiler with strict checks
  console.log('Running TypeScript strict checks...');
  execSync('tsc --noEmit --strict');

  // Run ESLint with fixes
  console.log('Running ESLint fixes...');
  execSync('eslint --fix "src/**/*.{ts,tsx}"');

  // Run Prettier
  console.log('Formatting code...');
  execSync('prettier --write "src/**/*.{ts,tsx}"');

  // Organize imports
  console.log('Organizing imports...');
  execSync('organize-imports-cli "src/**/*.{ts,tsx}"');
}

// Run analysis
console.log('Analyzing codebase...');
config.sourceDirs.forEach(dir => {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isFile()) {
      analyzeFile(filePath);
    }
  });
});

// Generate report
generateReport();

// Apply automatic refactoring
applyAutomaticRefactoring();

console.log('\nRefactoring complete! Check refactoring-report.json for details.'); 