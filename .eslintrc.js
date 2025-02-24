module.exports = {
  parser: '@typescript-eslint/parser',
  extends: [
    'plugin:@typescript-eslint/recommended',
    'plugin:functional/recommended',
    'plugin:prettier/recommended'
  ],
  plugins: [
    '@typescript-eslint',
    'functional',
    'prettier',
    'jest',
    'testing-library'
  ],
  rules: {
    // Stream naming and patterns
    '@typescript-eslint/naming-convention': [
      'error',
      {
        selector: 'variable',
        format: ['camelCase'],
        custom: {
          regex: '\\$$',
          match: true
        },
        filter: {
          regex: '.*\\$$',
          match: true
        }
      },
      {
        selector: 'interface',
        format: ['PascalCase'],
        prefix: ['I']
      },
      {
        selector: 'typeAlias',
        format: ['PascalCase'],
        prefix: ['T']
      }
    ],
    // FRP patterns
    'functional/no-let': 'error',
    'functional/immutable-data': 'error',
    'functional/functional-parameters': 'error',
    // Component structure
    'react/function-component-definition': [
      'error',
      { namedComponents: 'function-declaration' }
    ],
    // Testing patterns
    'jest/valid-expect': 'error',
    'jest/prefer-expect-assertions': 'error',
    'testing-library/await-async-utils': 'error',
    // Documentation
    'jsdoc/require-description': 'error',
    'jsdoc/require-param': 'error',
    'jsdoc/require-returns': 'error',
    // Error handling
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/explicit-function-return-type': 'error',
    // Performance
    'no-console': ['error', { allow: ['warn', 'error'] }],
    'max-depth': ['error', 3],
    'max-params': ['error', 3],
    'complexity': ['error', 10]
  },
  settings: {
    'import/resolver': {
      typescript: {}
    }
  }
}; 