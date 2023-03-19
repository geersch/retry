import { describe, expect, it } from 'vitest';
import { FullJitterBackOffStrategy } from '../../lib/strategies';

// The delay of the FullJitterBackOffStrategy is randomized.We can't assert that the output is what we expect it to be.
// Instead, we'll assert that the calculated delay obeys some constraints.

describe('FullJitterBackOffStrategy', () => {
  it('should use sane defaults', () => {
    const strategy = new FullJitterBackOffStrategy();
    expect(strategy.getMaxRetries()).toEqual(5);
  });

  it('should override the defaults', () => {
    const strategy = new FullJitterBackOffStrategy({ maxRetries: 8 });
    expect(strategy.getMaxRetries()).toEqual(8);
  });

  it.each([
    { attempt: 1, max: 200 },
    { attempt: 2, max: 400 },
    { attempt: 3, max: 800 },
    { attempt: 4, max: 1600 },
    { attempt: 5, max: 3200 },
    { attempt: 6, max: 6400 },
    { attempt: 7, max: 12800 },
    { attempt: 8, max: 25600 },
    { attempt: 9, max: 51200 },
    { attempt: 10, max: 102400 },
  ])('should calculate the delay for attempt $attempt (between 0 and $max)', ({ attempt, max }) => {
    const strategy = new FullJitterBackOffStrategy({ baseDelay: 100 });

    const delay = strategy.getNextDelay(attempt);

    expect(delay).toBeGreaterThanOrEqual(0);
    expect(delay).toBeLessThanOrEqual(max);
  });

  it.each([
    { attempt: 1, max: 200 },
    { attempt: 2, max: 400 },
    { attempt: 3, max: 800 },
    { attempt: 4, max: 1600 },
    { attempt: 5, max: 3000 },
    { attempt: 6, max: 3000 },
    { attempt: 7, max: 3000 },
    { attempt: 8, max: 3000 },
    { attempt: 9, max: 3000 },
    { attempt: 10, max: 3000 },
  ])('should cap the delay for attempt $attempt (between 0 and $max)', ({ attempt, max }) => {
    const strategy = new FullJitterBackOffStrategy({ baseDelay: 100, maximumDelay: 3000 });

    const delay = strategy.getNextDelay(attempt);

    expect(delay).toBeGreaterThanOrEqual(0);
    expect(delay).toBeLessThanOrEqual(max);
  });
});
