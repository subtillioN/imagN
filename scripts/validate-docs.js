const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const config = {
  docsDirs: ['docs', 'src'],
  docExtensions: ['.md', '.mdx', '.ts', '.tsx'],
  requiredSections: {
    readme: ['Overview', 'Installation', 'Usage', 'Configuration'],
    api: ['Methods', 'Types', 'Examples'],
    components: ['Props', 'Examples', 'Notes'],
  },
  linkValidation: {
    internal: true,
    external: true,
    images: true,
  },
  codeValidation: {
    typescript: true,
    examples: true,
    snippets: true,
  },
};

// Analysis results
const results = {
  missingDocs: [],
  brokenLinks: [],
  incompleteApis: [],
  outdatedExamples: [],
  suggestions: [],
};

function analyzeDocumentation() {
  // Check README completeness
  console.log('\nChecking README...');
  validateReadme();

  // Check API documentation
  console.log('\nChecking API documentation...');
  validateApiDocs();

  // Check component documentation
  console.log('\nChecking component documentation...');
  validateComponentDocs();

  // Check code examples
  console.log('\nValidating code examples...');
  validateCodeExamples();

  // Check links
  console.log('\nValidating links...');
  validateLinks();

  // Generate suggestions
  generateSuggestions();
}

function validateReadme() {
  const readmePath = path.join(process.cwd(), 'README.md');
  if (!fs.existsSync(readmePath)) {
    results.missingDocs.push({
      path: 'README.md',
      type: 'missing-file',
      message: 'README.md is required',
    });
    return;
  }

  const content = fs.readFileSync(readmePath, 'utf8');
  config.requiredSections.readme.forEach(section => {
    if (!content.includes(`# ${section}`) && !content.includes(`## ${section}`)) {
      results.missingDocs.push({
        path: 'README.md',
        type: 'missing-section',
        message: `Missing required section: ${section}`,
      });
    }
  });
}

function validateApiDocs() {
  const apiFiles = findFiles('src', ['.ts', '.tsx']);
  apiFiles.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    
    // Check for exported functions and types
    const exports = findExports(content);
    exports.forEach(exp => {
      const docPath = `docs/api/${exp}.md`;
      if (!fs.existsSync(docPath)) {
        results.missingDocs.push({
          path: file,
          type: 'missing-api-doc',
          message: `Missing API documentation for ${exp}`,
        });
      } else {
        validateApiDocSections(docPath, exp);
      }
    });
  });
}

function validateComponentDocs() {
  const componentFiles = findFiles('src/components', ['.tsx']);
  componentFiles.forEach(file => {
    const componentName = path.basename(file, '.tsx');
    const docPath = `docs/components/${componentName}.md`;
    
    if (!fs.existsSync(docPath)) {
      results.missingDocs.push({
        path: file,
        type: 'missing-component-doc',
        message: `Missing documentation for component ${componentName}`,
      });
    } else {
      validateComponentDocSections(docPath, componentName);
    }
  });
}

function validateCodeExamples() {
  const exampleFiles = findFiles('docs', ['.md', '.mdx']);
  exampleFiles.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    
    // Extract code blocks
    const codeBlocks = extractCodeBlocks(content);
    codeBlocks.forEach(block => {
      if (block.language === 'typescript' || block.language === 'tsx') {
        validateTypeScript(block.code, file);
      }
    });
  });
}

function validateLinks() {
  const docFiles = findFiles('docs', ['.md', '.mdx']);
  docFiles.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    
    // Check internal links
    const internalLinks = extractLinks(content).filter(link => !link.startsWith('http'));
    internalLinks.forEach(link => {
      const targetPath = path.join(process.cwd(), link);
      if (!fs.existsSync(targetPath)) {
        results.brokenLinks.push({
          path: file,
          type: 'broken-internal-link',
          message: `Broken internal link: ${link}`,
        });
      }
    });

    // Check image links
    const imageLinks = extractImageLinks(content);
    imageLinks.forEach(link => {
      if (!link.startsWith('http')) {
        const imagePath = path.join(process.cwd(), link);
        if (!fs.existsSync(imagePath)) {
          results.brokenLinks.push({
            path: file,
            type: 'broken-image-link',
            message: `Broken image link: ${link}`,
          });
        }
      }
    });
  });
}

function validateTypeScript(code, file) {
  try {
    // Create temporary file
    const tempFile = path.join(process.cwd(), 'temp.ts');
    fs.writeFileSync(tempFile, code);

    // Run TypeScript compiler
    execSync(`tsc ${tempFile} --noEmit --jsx react`, { stdio: 'pipe' });

    // Clean up
    fs.unlinkSync(tempFile);
  } catch (error) {
    results.outdatedExamples.push({
      path: file,
      type: 'invalid-typescript',
      message: `Invalid TypeScript code: ${error.message}`,
    });
  }
}

function generateSuggestions() {
  // Suggest adding examples for complex APIs
  const apiFiles = findFiles('src', ['.ts', '.tsx']);
  apiFiles.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    const complexity = calculateComplexity(content);
    
    if (complexity > 5) {
      const docPath = `docs/api/${path.basename(file, path.extname(file))}.md`;
      if (fs.existsSync(docPath)) {
        const docContent = fs.readFileSync(docPath, 'utf8');
        if (!docContent.includes('```typescript')) {
          results.suggestions.push({
            path: docPath,
            type: 'missing-examples',
            message: 'Consider adding code examples for complex API',
          });
        }
      }
    }
  });

  // Suggest improving type documentation
  const typeFiles = findFiles('src', ['.ts', '.tsx']);
  typeFiles.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    const types = findTypes(content);
    
    types.forEach(type => {
      if (!content.includes(`/** ${type}`)) {
        results.suggestions.push({
          path: file,
          type: 'missing-type-docs',
          message: `Consider adding JSDoc comments for type ${type}`,
        });
      }
    });
  });
}

function generateReport() {
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      missingDocs: results.missingDocs.length,
      brokenLinks: results.brokenLinks.length,
      incompleteApis: results.incompleteApis.length,
      outdatedExamples: results.outdatedExamples.length,
      suggestions: results.suggestions.length,
    },
    details: results,
  };

  fs.writeFileSync(
    'documentation-review.json',
    JSON.stringify(report, null, 2)
  );

  console.log('\nDocumentation Review Report');
  console.log('==========================');
  console.log('\nSummary:');
  console.log(`- Missing documentation: ${report.summary.missingDocs}`);
  console.log(`- Broken links: ${report.summary.brokenLinks}`);
  console.log(`- Incomplete APIs: ${report.summary.incompleteApis}`);
  console.log(`- Outdated examples: ${report.summary.outdatedExamples}`);
  console.log(`- Improvement suggestions: ${report.summary.suggestions}`);

  if (results.suggestions.length > 0) {
    console.log('\nKey Suggestions:');
    results.suggestions.forEach(suggestion => {
      console.log(`\n${suggestion.path}:`);
      console.log(`- Type: ${suggestion.type}`);
      console.log(`- Suggestion: ${suggestion.message}`);
    });
  }
}

// Helper functions
function findFiles(dir, extensions) {
  const files = [];
  
  function walk(currentPath) {
    const items = fs.readdirSync(currentPath);
    items.forEach(item => {
      const fullPath = path.join(currentPath, item);
      if (fs.statSync(fullPath).isDirectory()) {
        walk(fullPath);
      } else if (extensions.includes(path.extname(item))) {
        files.push(fullPath);
      }
    });
  }

  walk(dir);
  return files;
}

function findExports(content) {
  const exports = [];
  const exportRegex = /export\s+(const|function|class|type|interface)\s+(\w+)/g;
  let match;
  while ((match = exportRegex.exec(content)) !== null) {
    exports.push(match[2]);
  }
  return exports;
}

function findTypes(content) {
  const types = [];
  const typeRegex = /type\s+(\w+)|interface\s+(\w+)/g;
  let match;
  while ((match = typeRegex.exec(content)) !== null) {
    types.push(match[1] || match[2]);
  }
  return types;
}

function extractCodeBlocks(content) {
  const blocks = [];
  const codeBlockRegex = /```(\w+)\n([\s\S]*?)```/g;
  let match;
  while ((match = codeBlockRegex.exec(content)) !== null) {
    blocks.push({
      language: match[1],
      code: match[2],
    });
  }
  return blocks;
}

function extractLinks(content) {
  const links = [];
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  let match;
  while ((match = linkRegex.exec(content)) !== null) {
    links.push(match[2]);
  }
  return links;
}

function extractImageLinks(content) {
  const links = [];
  const imageRegex = /!\[([^\]]+)\]\(([^)]+)\)/g;
  let match;
  while ((match = imageRegex.exec(content)) !== null) {
    links.push(match[2]);
  }
  return links;
}

function calculateComplexity(content) {
  let complexity = 0;
  complexity += (content.match(/if|else|switch|case|&&|\?\./g) || []).length;
  complexity += (content.match(/for|while|map|reduce|filter|forEach/g) || []).length;
  return complexity;
}

// Run documentation validation
console.log('Analyzing documentation...');
analyzeDocumentation();
generateReport();

console.log('\nDocumentation review complete! Check documentation-review.json for details.'); 