import fs from 'fs';
import path from 'path';

const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const NC = '\x1b[0m';

// Functional programming patterns to check
const patterns = {
  classKeyword: {
    pattern: /\bclass\b/,
    message: 'Avoid using classes. Use functional components and pure functions instead.',
  },
  thisKeyword: {
    pattern: /\bthis\b/,
    message: 'Avoid using "this" keyword. Use pure functions and closures instead.',
  },
  mutableOperations: {
    pattern: /\b(push|pop|shift|unshift|splice|sort|reverse)\b/,
    message: 'Avoid mutating operations. Use immutable operations instead.',
  },
  instanceOf: {
    pattern: /\binstanceof\b/,
    message: 'Avoid instanceof operator. Use type predicates or pattern matching instead.',
  },
  voidFunction: {
    pattern: /\bvoid\b/,
    message: 'Functions should return values for better composition.',
  },
  nullLiteral: {
    pattern: /\bnull\b/,
    message: 'Avoid null. Use Option/Maybe types for better null safety.',
  },
  letDeclaration: {
    pattern: /\blet\b/,
    message: 'Use const instead of let for better immutability.',
  },
  forLoop: {
    pattern: /\b(for|while)\b/,
    message: 'Use map/reduce/filter/etc. instead of loops for better functional style.',
  },
  deleteOperator: {
    pattern: /\bdelete\b/,
    message: 'Avoid delete operator. Create new objects instead of mutating existing ones.',
  },
  assignment: {
    pattern: /[^=!><]=[^=]/,
    message: 'Avoid assignments. Use immutable data structures and transformations.',
  },
};

function analyzeFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  const violations = [];

  lines.forEach((line, index) => {
    // Skip comments
    if (line.trim().startsWith('//') || line.trim().startsWith('/*') || line.trim().startsWith('*')) {
      return;
    }

    Object.entries(patterns).forEach(([ruleName, rule]) => {
      const matches = line.match(rule.pattern);
      if (matches) {
        violations.push({
          rule: ruleName,
          message: rule.message,
          line: index + 1,
          column: matches.index + 1,
          content: line.trim(),
        });
      }
    });
  });

  return violations;
}

function validateDirectory(dir) {
  const files = fs.readdirSync(dir);
  let hasViolations = false;

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      if (!['node_modules', '.git', 'dist', 'build'].includes(file)) {
        hasViolations = validateDirectory(filePath) || hasViolations;
      }
    } else if (file.match(/\.(ts|tsx|js|jsx)$/)) {
      try {
        const violations = analyzeFile(filePath);
        
        if (violations.length > 0) {
          console.log(`\n${YELLOW}Functional violations in ${filePath}:${NC}`);
          violations.forEach(v => {
            console.log(`${RED}[${v.rule}] Line ${v.line}:${v.column} - ${v.message}${NC}`);
            console.log(`  ${v.content}`);
          });
          hasViolations = true;
        }
      } catch (error) {
        console.error(`${RED}Error analyzing ${filePath}:${NC}`, error.message);
      }
    }
  });

  return hasViolations;
}

// Main execution
console.log(`${YELLOW}Checking functional programming principles...${NC}`);

const targetDir = process.argv[2] || 'src';
const hasViolations = validateDirectory(targetDir);

if (hasViolations) {
  console.log(`\n${RED}✖ Functional programming violations found${NC}`);
  process.exit(1);
} else {
  console.log(`\n${GREEN}✓ No functional programming violations found${NC}`);
  process.exit(0);
} 