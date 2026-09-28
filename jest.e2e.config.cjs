const base = require('./jest.config.cjs');

module.exports = {
  ...base,
  collectCoverageFrom: [],
  testMatch: ['<rootDir>/test/**/*.e2e-spec.ts'],
};
