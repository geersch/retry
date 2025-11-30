import { toBeBetween } from './matchers/to-be-between.js';

// Centralized matcher registry
export const customMatchers = {
  toBeBetween,
  // Add future matchers here
} as const;

// Register custom matchers
expect.extend(customMatchers);
