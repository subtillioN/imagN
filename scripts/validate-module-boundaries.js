import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

// Colors for output
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const GREEN = '\x1b[32m';
const NC = '\x1b[0m';

// Module boundaries
const MODULES = {
  MAIN: 'imagN',
  TOOLS: 'FRAOP-MVI-Dev-Tools'
};

// Rules
const RULES = {
  MODULE_BOUNDARY: {
    id: 'MODULE_BOUNDARY',
    description: 'Development utilities must be in their designated module',
    severity: 'error'
  },
  PROPER_IMPORTS: {
    id: 'PROPER_IMPORTS',
    description: 'Main app must only import from published packages',
    severity: 'error'
  },
  NO_CIRCULAR_DEPS: {
    id: 'NO_CIRCULAR_DEPS',
    description: 'No circular dependencies between modules',
    severity: 'error'
  }
};

// Get all JavaScript files in a directory
const getAllFiles = (dir) => {
  const files = fs.readdirSync(dir);
  return files
    .filter(file => file.match(/\.(js|ts|jsx|tsx)$/))
    .map(file => path.join(dir, file));
};

// Check if a file contains restricted patterns
const containsRestrictedPatterns = (content) => {
  const patterns = [
    /dev-?tools/i,
    /devtools/i,
    /development.?tools/i,
    /debug.?tools/i
  ];
  return patterns.some(pattern => pattern.test(content));
};

// Validate imports in a file
const validateImports = (content, filePath) => {
  const violations = [];
  
  // If this is a main app file
  if (!filePath.startsWith(MODULES.TOOLS)) {
    const importMatches = content.match(/import .* from ['"].*dev-tools.*['"]/g) || [];
    
    importMatches.forEach(match => {
      if (!match.includes('fraop-mvi-dev-tools')) {
        violations.push({
          rule: RULES.PROPER_IMPORTS,
          file: filePath,
          line: content.split('\n').findIndex(line => line.includes(match)) + 1,
          message: `Invalid import: ${match}. Use published package instead.`
        });
      }
    });
  }

  return violations;
};

// Main validation function
const validateModuleBoundaries = (directory) => {
  const violations = [];
  const files = getAllFiles(directory);

  files.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    const relativePath = path.relative(process.cwd(), file);
    
    // Check for restricted patterns in main app
    if (!relativePath.startsWith(MODULES.TOOLS) && containsRestrictedPatterns(content)) {
      // Skip the validation script itself
      if (file.endsWith('validate-module-boundaries.js')) {
        return;
      }
      
      violations.push({
        rule: RULES.MODULE_BOUNDARY,
        file: relativePath,
        message: `File contains restricted patterns but is not in the designated module`
      });
    }

    // Check imports
    violations.push(...validateImports(content, relativePath));
  });

  return violations;
};

// Report violations
const reportViolations = (violations) => {
  if (violations.length === 0) {
    console.log(`${GREEN}✓ No module boundary violations found${NC}`);
    return 0;
  }

  console.log(`${RED}× Module boundary violations found:${NC}\n`);

  violations.forEach(violation => {
    console.log(`${RED}Error:${NC} ${violation.rule.description}`);
    console.log(`File: ${violation.file}`);
    if (violation.line) {
      console.log(`Line: ${violation.line}`);
    }
    console.log(`Message: ${violation.message}\n`);
  });

  return 1;
};

// Run validation
try {
  const scriptsDir = path.join(process.cwd(), 'scripts');
  const violations = validateModuleBoundaries(scriptsDir);
  process.exit(reportViolations(violations));
} catch (error) {
  console.error(`${RED}Error running module boundary validation:${NC}`, error);
  process.exit(1);
} 