#!/usr/bin/env node
import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const SOURCE_DIR = path.resolve(__dirname, '..');
const TARGET_DIR = path.resolve(__dirname, '../../FRAOP-MVI-Dev-Tools');

// Configuration files content
const CONFIG_FILES = {
  'tsconfig.json': {
    compilerOptions: {
      target: 'es5',
      module: 'esnext',
      lib: ['dom', 'dom.iterable', 'esnext'],
      declaration: true,
      declarationDir: 'dist/types',
      sourceMap: true,
      outDir: 'dist',
      strict: true,
      moduleResolution: 'node',
      allowSyntheticDefaultImports: true,
      esModuleInterop: true,
      jsx: 'react',
      baseUrl: '.',
      paths: {
        '@/*': ['src/*']
      }
    },
    include: ['src'],
    exclude: ['node_modules', 'dist', '**/*.test.ts', '**/*.test.tsx']
  },
  '.eslintrc.js': `module.exports = {
    parser: '@typescript-eslint/parser',
    extends: [
      'eslint:recommended',
      'plugin:react/recommended',
      'plugin:@typescript-eslint/recommended',
      'plugin:prettier/recommended'
    ],
    settings: {
      react: {
        version: 'detect'
      }
    },
    env: {
      browser: true,
      node: true,
      es6: true
    },
    plugins: ['@typescript-eslint', 'react', 'react-hooks'],
    parserOptions: {
      ecmaFeatures: {
        jsx: true
      },
      ecmaVersion: 2020,
      sourceType: 'module'
    },
    rules: {
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      'react/prop-types': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-explicit-any': 'off'
    }
  };`,
  '.prettierrc': {
    semi: true,
    trailingComma: 'none',
    singleQuote: true,
    printWidth: 100,
    tabWidth: 2,
    useTabs: false
  },
  'jest.config.js': `module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'jsdom',
    setupFilesAfterEnv: ['<rootDir>/tests/__utils__/setup.ts'],
    moduleNameMapper: {
      '^@/(.*)$': '<rootDir>/src/$1'
    },
    collectCoverageFrom: [
      'src/**/*.{ts,tsx}',
      '!src/**/*.d.ts'
    ],
    coverageThreshold: {
      global: {
        branches: 80,
        functions: 80,
        lines: 80,
        statements: 80
      }
    }
  };`,
  'rollup.config.js': `import typescript from '@rollup/plugin-typescript';
  import resolve from '@rollup/plugin-node-resolve';
  import commonjs from '@rollup/plugin-commonjs';
  import { terser } from 'rollup-plugin-terser';
  
  export default {
    input: 'src/index.ts',
    output: [
      {
        file: 'dist/index.js',
        format: 'cjs',
        sourcemap: true
      },
      {
        file: 'dist/index.esm.js',
        format: 'esm',
        sourcemap: true
      }
    ],
    external: ['react', 'react-dom', 'recharts'],
    plugins: [
      typescript({
        tsconfig: './tsconfig.json',
        declaration: true,
        declarationDir: 'dist/types'
      }),
      resolve(),
      commonjs(),
      terser()
    ]
  };`
};

// Directory structure
const DIRECTORIES = [
  'src/components',
  'src/core',
  'src/hooks',
  'src/utils',
  'tests/__fixtures__',
  'tests/__mocks__',
  'tests/__utils__',
  'docs/api',
  'docs/guides',
  'docs/examples',
  '.github/workflows',
  '.github/ISSUE_TEMPLATE'
];

// Files to migrate
const FILES_TO_MIGRATE = [
  {
    source: 'src/components/DevTools',
    target: 'src/components',
    files: ['**/*.tsx', '**/*.ts']
  },
  {
    source: 'src/utils/propAnalysis.ts',
    target: 'src/core/PropAnalyzer',
    files: ['*.ts']
  },
  {
    source: 'src/__tests__/integration',
    target: 'tests/integration',
    files: ['**/*.test.tsx', '**/*.test.ts']
  }
];

async function writeConfigFile(filePath, content) {
  if (typeof content === 'object') {
    await fs.writeJson(filePath, content, { spaces: 2 });
  } else {
    await fs.writeFile(filePath, content, 'utf8');
  }
}

async function main() {
  try {
    console.log(chalk.blue('Starting dev tools migration...'));

    // 1. Create directory structure
    console.log(chalk.yellow('\nCreating directory structure...'));
    for (const dir of DIRECTORIES) {
      const targetDir = path.join(TARGET_DIR, dir);
      await fs.ensureDir(targetDir);
      console.log(chalk.green(`✓ Created ${dir}`));
    }

    // 2. Copy configuration files
    console.log(chalk.yellow('\nCreating configuration files...'));
    for (const [file, content] of Object.entries(CONFIG_FILES)) {
      const filePath = path.join(TARGET_DIR, file);
      await writeConfigFile(filePath, content);
      console.log(chalk.green(`✓ Created ${file}`));
    }

    // 3. Migrate source files
    console.log(chalk.yellow('\nMigrating source files...'));
    for (const { source, target, files } of FILES_TO_MIGRATE) {
      const sourceDir = path.join(SOURCE_DIR, source);
      const targetDir = path.join(TARGET_DIR, target);
      
      for (const pattern of files) {
        const matches = await fs.glob(pattern, { cwd: sourceDir });
        for (const file of matches) {
          const sourcePath = path.join(sourceDir, file);
          const targetPath = path.join(targetDir, file);
          await fs.copy(sourcePath, targetPath);
          console.log(chalk.green(`✓ Migrated ${file}`));
        }
      }
    }

    // 4. Copy documentation
    console.log(chalk.yellow('\nCopying documentation...'));
    await fs.copy(
      path.join(__dirname, '../docs/migration/README.md'),
      path.join(TARGET_DIR, 'README.md')
    );
    console.log(chalk.green('✓ Created README.md'));

    // 5. Copy package.json
    console.log(chalk.yellow('\nCopying package.json...'));
    await fs.copy(
      path.join(__dirname, '../FRAOP-MVI-Dev-Tools/package.json'),
      path.join(TARGET_DIR, 'package.json')
    );
    console.log(chalk.green('✓ Created package.json'));

    // 6. Initialize git
    console.log(chalk.yellow('\nInitializing git...'));
    process.chdir(TARGET_DIR);
    execSync('git init');
    execSync('git add .');
    execSync('git commit -m "Initial commit: Project setup"');
    console.log(chalk.green('✓ Git initialized'));

    // 7. Install dependencies
    console.log(chalk.yellow('\nInstalling dependencies...'));
    execSync('npm install', { stdio: 'inherit' });
    console.log(chalk.green('✓ Dependencies installed'));

    console.log(chalk.blue('\nMigration completed successfully!'));
    console.log(chalk.yellow('\nNext steps:'));
    console.log('1. Review the migrated files');
    console.log('2. Update package.json with correct dependencies');
    console.log('3. Run tests to verify everything works');
    console.log('4. Push changes to the repository');

  } catch (error) {
    console.error(chalk.red('Error during migration:'));
    console.error(error);
    process.exit(1);
  }
}

main(); 