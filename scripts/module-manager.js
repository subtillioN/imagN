import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

// Colors for output
const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const BLUE = '\x1b[34m';
const NC = '\x1b[0m';

// Module configuration
const MODULE_CONFIG = {
  TOOLS: {
    name: 'FRAOP-MVI-Dev-Tools',
    patterns: [
      /dev-?tools/i,
      /devtools/i,
      /development.?tools/i,
      /debug.?tools/i
    ],
    targetDir: 'FRAOP-MVI-Dev-Tools',
    subdirs: {
      components: 'src/components',
      core: 'src/core',
      services: 'src/services',
      utils: 'src/utils',
      scripts: 'scripts'
    }
  }
};

// File categorization based on content and purpose
const categorizeFile = (content, filename) => {
  if (content.includes('React.Component') || content.includes('React.FC') || filename.includes('Component')) {
    return 'components';
  }
  if (content.includes('service') || content.includes('Service')) {
    return 'services';
  }
  if (filename.endsWith('.test.ts') || filename.endsWith('.test.tsx')) {
    return 'tests';
  }
  if (filename.endsWith('.js') && filename.includes('script')) {
    return 'scripts';
  }
  return 'utils';
};

// Analyze a single file
const analyzeFile = (filePath) => {
  const content = fs.readFileSync(filePath, 'utf8');
  const filename = path.basename(filePath);
  const relativePath = path.relative(process.cwd(), filePath);
  
  // Check if file contains patterns matching any module
  for (const [moduleKey, moduleConfig] of Object.entries(MODULE_CONFIG)) {
    if (moduleConfig.patterns.some(pattern => pattern.test(content) || pattern.test(filename))) {
      return {
        shouldMove: !relativePath.startsWith(moduleConfig.targetDir),
        module: moduleKey,
        category: categorizeFile(content, filename),
        originalPath: filePath,
        content,
        filename
      };
    }
  }
  
  return null;
};

// Move file to correct location
const moveFile = (analysis) => {
  const moduleConfig = MODULE_CONFIG[analysis.module];
  const targetSubdir = moduleConfig.subdirs[analysis.category] || moduleConfig.subdirs.utils;
  const targetDir = path.join(process.cwd(), moduleConfig.targetDir, targetSubdir);
  const targetPath = path.join(targetDir, analysis.filename);
  
  // Create directory if it doesn't exist
  fs.mkdirSync(targetDir, { recursive: true });
  
  // Move file
  fs.renameSync(analysis.originalPath, targetPath);
  
  return {
    from: analysis.originalPath,
    to: targetPath
  };
};

// Update imports in all files
const updateImports = (movedFiles) => {
  const allFiles = getAllFiles(process.cwd());
  const updates = [];
  
  allFiles.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let hasChanges = false;
    
    movedFiles.forEach(({ from, to }) => {
      const fromRelative = path.relative(path.dirname(file), from);
      const toRelative = path.relative(path.dirname(file), to);
      
      // Update imports
      const importRegex = new RegExp(`from ['"]${fromRelative}['"]`, 'g');
      if (importRegex.test(content)) {
        content = content.replace(importRegex, `from '${toRelative}'`);
        hasChanges = true;
      }
    });
    
    if (hasChanges) {
      fs.writeFileSync(file, content);
      updates.push(file);
    }
  });
  
  return updates;
};

// Get all files recursively
const getAllFiles = (dir) => {
  const files = [];
  
  const traverse = (currentDir) => {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });
    
    entries.forEach(entry => {
      const fullPath = path.join(currentDir, entry.name);
      
      if (entry.isDirectory()) {
        if (!entry.name.startsWith('.') && entry.name !== 'node_modules') {
          traverse(fullPath);
        }
      } else if (entry.name.match(/\.(js|ts|jsx|tsx)$/)) {
        files.push(fullPath);
      }
    });
  };
  
  traverse(dir);
  return files;
};

// Main function to analyze and move files
const analyzeAndMove = (targetPath) => {
  console.log(`${BLUE}Analyzing ${targetPath}...${NC}\n`);
  
  const filesToAnalyze = fs.statSync(targetPath).isDirectory() 
    ? getAllFiles(targetPath)
    : [targetPath];
  
  const analysisResults = [];
  const movedFiles = [];
  
  // Analyze all files
  filesToAnalyze.forEach(file => {
    const analysis = analyzeFile(file);
    if (analysis) {
      analysisResults.push(analysis);
      if (analysis.shouldMove) {
        const moveResult = moveFile(analysis);
        movedFiles.push(moveResult);
        console.log(`${GREEN}Moved:${NC} ${path.relative(process.cwd(), moveResult.from)} → ${path.relative(process.cwd(), moveResult.to)}`);
      }
    }
  });
  
  // Update imports if files were moved
  if (movedFiles.length > 0) {
    console.log(`\n${BLUE}Updating imports...${NC}`);
    const updatedFiles = updateImports(movedFiles);
    updatedFiles.forEach(file => {
      console.log(`${YELLOW}Updated imports in:${NC} ${path.relative(process.cwd(), file)}`);
    });
  }
  
  // Print summary
  console.log(`\n${BLUE}Summary:${NC}`);
  console.log(`Files analyzed: ${filesToAnalyze.length}`);
  console.log(`Files moved: ${movedFiles.length}`);
  console.log(`Files with updated imports: ${movedFiles.length > 0 ? updatedFiles.length : 0}`);
};

// Command line interface
const [,, targetPath = '.'] = process.argv;

try {
  analyzeAndMove(targetPath);
  console.log(`\n${GREEN}✓ Module boundary enforcement completed successfully${NC}`);
} catch (error) {
  console.error(`\n${RED}Error enforcing module boundaries:${NC}`, error);
  process.exit(1);
} 