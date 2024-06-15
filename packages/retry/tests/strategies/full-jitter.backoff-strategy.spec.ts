import { FullJitterBackOffStrategy } from '../../lib/strategies';

// The delay of the FullJitterBackOffStrategy is randomized.We can't assert that the output is what we expect it to be.
// Instead, we'll assert that the calculated delay obeys some constraints.

describe('FullJitterBackOffStrategy', () => {
  beforeEach(() => {
    // Seed the random number generator to get predictable results
    Math.random = vi.fn().mockReturnValue(0.5);
  });

  afterEach(() => {
    // Restore the original Math.random function
    vi.spyOn(global.Math, 'random').mockRestore();
  });

  it('should calculate the delay', () => {
    const delays = [100, 200, 400, 800, 1600, 3200, 6400, 12800, 25600, 51200];

    const strategy = new FullJitterBackOffStrategy({ baseDelay: 100 });
    const generator = strategy.getGenerator(10);
    for (const expectedDelay of delays) {
      expect(generator.next().value).toEqual(expectedDelay);
    }
  });
});
