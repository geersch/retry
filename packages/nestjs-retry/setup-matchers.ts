import { expect } from '@jest/globals';
import { toBeBetween } from './tests/matchers';

expect.extend({
  toBeBetween,
});
