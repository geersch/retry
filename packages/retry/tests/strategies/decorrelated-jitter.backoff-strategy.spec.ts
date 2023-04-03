import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DecorrelatedJitterBackoffStrategy } from '../../lib/strategies';

describe('DecorrelatedJitterBackoffStrategy', () => {
  beforeEach(() => {
    // Seed the random number generator to get predictable results
    Math.random = vi.fn().mockReturnValue(0.5);
  });

  afterEach(() => {
    // Restore the original Math.random function
    vi.spyOn(global.Math, 'random').mockRestore();
  });

  it('should calculate the delay', () => {
    const delays = [
      89.74049355791999, 109.30035473816788, 203.57479626216332, 404.59794227837546, 808.3631609820252,
      1616.3662812315347, 3232.5517201716116, 6465.005796884965, 12929.958986698814, 25859.89329890494,
      51719.78175306593,
    ];
    const strategy = new DecorrelatedJitterBackoffStrategy({ baseDelay: 100 });
    const generator = strategy.getGenerator(11);
    for (const expectedDelay of delays) {
      expect(generator.next().value).toEqual(expectedDelay);
    }
  });
});
