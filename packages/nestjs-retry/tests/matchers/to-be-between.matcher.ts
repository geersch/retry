import type { MatcherFunction } from 'expect';

// https://jestjs.io/docs/expect#expectextendmatchers
export const toBeBetween: MatcherFunction<[min: unknown, max: unknown]> = function (actual, min, max) {
  if (typeof actual !== 'number' || typeof min !== 'number' || typeof max !== 'number') {
    throw new Error('These must be of type number!');
  }
  const pass = actual >= min && actual <= max;
  if (pass) {
    return {
      message: () =>
        `expected ${this.utils.printReceived(actual)} not to be within range ${this.utils.printExpected(
          `${min} - ${max}`,
        )}`,
      pass: true,
    };
  } else {
    return {
      message: () =>
        `expected ${this.utils.printReceived(actual)} to be within range ${this.utils.printExpected(
          `${min} - ${max}`,
        )}`,
      pass: false,
    };
  }
};

declare module 'expect' {
  interface AsymmetricMatchers {
    toBeBetween(min: number, max: number): void;
  }

  interface Matchers<R> {
    toBeBetween(min: number, max: number): R;
  }
}
