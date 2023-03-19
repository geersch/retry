import { describe, expect, it } from 'vitest';
import { EqualJitterBackoffStrategy } from '../../lib/strategies';

// The delay of the EqualJitterBackOffStrategy is randomized.We can't assert that the output is what we expect it to be.
// Instead, we'll assert that the calculated delay obeys some constraints.

describe('EqualJitterBackOffStrategy', () => {
  it('should use sane defaults', () => {
    const strategy = new EqualJitterBackoffStrategy();
    expect(strategy.getMaxRetries()).toEqual(5);
  });

  it('should override the defaults', () => {
    const strategy = new EqualJitterBackoffStrategy({ maxRetries: 8 });
    expect(strategy.getMaxRetries()).toEqual(8);
  });

  it.each([
    { attempt: 1, min: 100, max: 201 },
    { attempt: 2, min: 200, max: 401 },
    { attempt: 3, min: 400, max: 801 },
    { attempt: 4, min: 800, max: 1601 },
    { attempt: 5, min: 1600, max: 3201 },
    { attempt: 6, min: 3200, max: 6401 },
    { attempt: 7, min: 6400, max: 12801 },
    { attempt: 8, min: 12800, max: 25601 },
    { attempt: 9, min: 25600, max: 51201 },
    { attempt: 10, min: 51200, max: 102401 },
  ])('should calculate the delay for attempt $attempt (between $min and $max)', ({ attempt, min, max }) => {
    const strategy = new EqualJitterBackoffStrategy({ baseDelay: 100 });

    const delay = strategy.getNextDelay(attempt);

    expect(delay).toBeGreaterThanOrEqual(min);
    expect(delay).toBeLessThanOrEqual(max);
  });

  it.each([
    { attempt: 1, min: 100, max: 201 },
    { attempt: 2, min: 200, max: 401 },
    { attempt: 3, min: 400, max: 801 },
    { attempt: 4, min: 800, max: 1601 },
    { attempt: 5, min: 1600, max: 3201 },
    { attempt: 6, min: 3200, max: 6401 },
    { attempt: 7, min: 6400, max: 12800 },
    { attempt: 8, min: 12800, max: 15000 },
    { attempt: 9, min: 15000, max: 15000 },
    { attempt: 10, min: 15000, max: 15000 },
  ])('should cap the delay for attempt $attempt (between $min and $max)', ({ attempt, min, max }) => {
    const strategy = new EqualJitterBackoffStrategy({ baseDelay: 100, maximumDelay: 15000 });

    const delay = strategy.getNextDelay(attempt);

    expect(delay).toBeGreaterThanOrEqual(min);
    expect(delay).toBeLessThanOrEqual(max);
  });
});
