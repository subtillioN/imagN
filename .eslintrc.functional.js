module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
    project: './tsconfig.functional.json',
  },
  plugins: [
    '@typescript-eslint',
    'functional',
  ],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
    'plugin:functional/recommended',
    'plugin:functional/external-typescript-recommended',
  ],
  rules: {
    // Enforce functional programming paradigms
    'functional/no-class': 'error',
    'functional/no-this': 'error',
    'functional/no-loop-statement': 'error',
    'functional/no-let': 'error',
    'functional/immutable-data': 'error',
    'functional/no-mixed-type': 'error',
    'functional/prefer-readonly-type': 'error',
    'functional/no-expression-statement': 'error',
    'functional/no-return-void': 'error',
    'functional/functional-parameters': 'error',
    'functional/no-promise-reject': 'error',
    'functional/no-throw-statement': 'error',
    'functional/prefer-tacit': 'error',

    // TypeScript specific rules
    '@typescript-eslint/explicit-function-return-type': 'error',
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/strict-boolean-expressions': 'error',
    '@typescript-eslint/no-floating-promises': 'error',
    '@typescript-eslint/no-unsafe-assignment': 'error',
    '@typescript-eslint/no-unsafe-member-access': 'error',
    '@typescript-eslint/no-unsafe-return': 'error',
    '@typescript-eslint/restrict-template-expressions': 'error',
    '@typescript-eslint/switch-exhaustiveness-check': 'error',
    '@typescript-eslint/no-unnecessary-condition': 'error',

    // Additional functional patterns
    'no-var': 'error',
    'prefer-const': 'error',
    'no-param-reassign': 'error',
    'no-shadow': 'error',
    'no-underscore-dangle': 'error',
    'no-magic-numbers': ['error', { 'ignore': [-1, 0, 1] }],
    'max-params': ['error', 3],
    'max-depth': ['error', 2],
    'complexity': ['error', 5],
  },
  overrides: [
    {
      // Allow certain rules in test files
      files: ['**/*.test.ts', '**/*.test.tsx', '**/*.spec.ts', '**/*.spec.tsx'],
      rules: {
        'functional/no-expression-statement': 'off',
        'functional/no-return-void': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
      },
    },
  ],
  settings: {
    react: {
      version: 'detect',
    },
  },
}; 