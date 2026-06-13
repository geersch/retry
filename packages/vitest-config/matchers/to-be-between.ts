import type { MatcherResult, MatcherState } from 'vitest';

export const toBeBetween = function (this: MatcherState, actual: number, min: number, max: number): MatcherResult {
  if (typeof actual !== 'number' || typeof min !== 'number' || typeof max !== 'number') {
    throw new Error('These must be of type number!');
  }

  const { utils } = this;

  const pass = actual >= min && actual <= max;

  return {
    pass,
    message: pass
      ? () => `expected ${utils.printReceived(actual)} not to be within range ${utils.printExpected(`${min} - ${max}`)}`
      : () => `expected ${utils.printReceived(actual)} to be within range ${utils.printExpected(`${min} - ${max}`)}`,
  };
};
