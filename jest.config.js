export default {
  transform: {
    '^.+\\.js$': 'babel-jest'
  },
  testEnvironment: 'node',
  moduleFileExtensions: ['js'],
  moduleDirectories: ['node_modules', 'src'],
  testMatch: ['**/__tests__/**/*.test.js'],
  transformIgnorePatterns: [
    '/node_modules/(?!callbag-basics|callbag-from-obs|callbag-to-obs)/'
  ]
};