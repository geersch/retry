import { describe, expect, it } from 'vitest';
import { ExponentialBackoffStrategy } from '../../lib/strategies';

// The delay of the FullJitterBackOffStrategy is randomized.We can't assert that the output is what we expect it to be.
// Instead, we'll assert that the calculated delay obeys some constraints.

describe('ExponentialBackoffStrategy', () => {
  it('should use sane defaults', () => {
    const strategy = new ExponentialBackoffStrategy();
    expect(strategy.getMaxRetries()).toEqual(5);
  });

  it('should override the defaults', () => {
    const strategy = new ExponentialBackoffStrategy({ maxRetries: 8 });
    expect(strategy.getMaxRetries()).toEqual(8);
  });

  it.each([
    { attempt: 1, delay: 200 },
    { attempt: 2, delay: 400 },
    { attempt: 3, delay: 800 },
    { attempt: 4, delay: 1600 },
    { attempt: 5, delay: 3200 },
    { attempt: 6, delay: 6400 },
    { attempt: 7, delay: 12800 },
    { attempt: 8, delay: 25600 },
    { attempt: 9, delay: 51200 },
    { attempt: 10, delay: 102400 },
  ])('should calculate the delay for attempt $attempt (delay: $delay)', ({ attempt, delay }) => {
    const strategy = new ExponentialBackoffStrategy({ baseDelay: 100 });

    expect(strategy.getNextDelay(attempt)).toEqual(delay);
  });

  it.each([
    { attempt: 1, delay: 200 },
    { attempt: 2, delay: 400 },
    { attempt: 3, delay: 800 },
    { attempt: 4, delay: 1600 },
    { attempt: 5, delay: 3000 },
    { attempt: 6, delay: 3000 },
    { attempt: 7, delay: 3000 },
    { attempt: 8, delay: 3000 },
    { attempt: 9, delay: 3000 },
    { attempt: 10, delay: 3000 },
  ])('should cap the delay for attempt $attempt (delay: $delay)', ({ attempt, delay }) => {
    const strategy = new ExponentialBackoffStrategy({ baseDelay: 100, maximumDelay: 3000 });

    expect(strategy.getNextDelay(attempt)).toEqual(delay);
  });
});
