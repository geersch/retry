import type { Config } from 'jest';

const config: Config = {
  moduleFileExtensions: ['ts', 'js'],
  rootDir: '.',
  testEnvironment: 'node',
  testRegex: '.spec.ts$',
  verbose: true,
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  collectCoverageFrom: ['lib/**/*.ts'],
  testPathIgnorePatterns: ['dist', 'node_modules'],
  coveragePathIgnorePatterns: ['index.tx'],
};

export default config;
