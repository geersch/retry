import { describe, expect, it } from 'vitest';
import { FixedBackoffStrategy } from '../../lib/strategies';

describe('FixedBackoffStrategy', () => {
  it('should use sane defaults', () => {
    const strategy = new FixedBackoffStrategy();
    expect(strategy.getMaxRetries()).toEqual(5);
  });

  it('should override the defaults', () => {
    const strategy = new FixedBackoffStrategy({ maxRetries: 8 });
    expect(strategy.getMaxRetries()).toEqual(8);
  });

  it.each([
    { attempt: 1, delay: 100 },
    { attempt: 2, delay: 100 },
    { attempt: 3, delay: 100 },
    { attempt: 4, delay: 100 },
    { attempt: 5, delay: 100 },
  ])('should calculate the delay for attempt $attempt (expected: $delay)', ({ attempt, delay }) => {
    const strategy = new FixedBackoffStrategy({ delay: 100 });
    expect(strategy.getNextDelay(attempt)).toEqual(delay);
  });
});
