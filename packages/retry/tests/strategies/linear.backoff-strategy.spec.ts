import { describe, expect, it } from 'vitest';
import { LinearBackoffStrategy } from '../../lib/strategies';

describe('LinearBackoffStrategy', () => {
  it('should use sane defaults', () => {
    const strategy = new LinearBackoffStrategy();
    expect(strategy.getMaxRetries()).toEqual(5);
  });

  it('should override the defaults', () => {
    const strategy = new LinearBackoffStrategy({ maxRetries: 8 });
    expect(strategy.getMaxRetries()).toEqual(8);
  });

  it.each([
    { attempt: 1, delay: 200 },
    { attempt: 2, delay: 400 },
    { attempt: 3, delay: 600 },
    { attempt: 4, delay: 800 },
    { attempt: 5, delay: 1000 },
  ])('should calculate the delay for attempt $attempt (expected: $delay)', ({ attempt, delay }) => {
    const strategy = new LinearBackoffStrategy({ baseDelay: 200 });
    expect(strategy.getNextDelay(attempt)).toEqual(delay);
  });

  it.each([
    { attempt: 1, delay: 200 },
    { attempt: 2, delay: 400 },
    { attempt: 3, delay: 600 },
    { attempt: 4, delay: 800 },
    { attempt: 5, delay: 1000 },
    { attempt: 6, delay: 1000 },
    { attempt: 7, delay: 1000 },
    { attempt: 8, delay: 1000 },
    { attempt: 9, delay: 1000 },
    { attempt: 10, delay: 1000 },
  ])('should cap the delay for attempt $attempt (delay: $delay)', ({ attempt, delay }) => {
    const strategy = new LinearBackoffStrategy({ baseDelay: 200, maximumDelay: 1000 });

    expect(strategy.getNextDelay(attempt)).toEqual(delay);
  });
});
