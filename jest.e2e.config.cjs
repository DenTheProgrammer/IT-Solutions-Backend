const base = require('./jest.config.cjs');

module.exports = {
  ...base,
  testMatch: ['<rootDir>/test/**/*.e2e-spec.ts'],
  testPathIgnorePatterns: [],
  globalSetup: '<rootDir>/test/e2e/global-setup.ts',
  globalTeardown: '<rootDir>/test/e2e/global-teardown.ts',
  testTimeout: 30000,
};
