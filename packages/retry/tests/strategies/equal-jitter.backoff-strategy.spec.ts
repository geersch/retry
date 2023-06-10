import { EqualJitterBackoffStrategy } from '../../lib/strategies';

// The delay of the EqualJitterBackOffStrategy is randomized.We can't assert that the output is what we expect it to be.
// Instead, we'll assert that the calculated delay obeys some constraints.

describe('EqualJitterBackOffStrategy', () => {
  beforeEach(() => {
    // Seed the random number generator to get predictable results
    Math.random = jest.fn().mockReturnValue(0.5);
  });

  afterEach(() => {
    // Restore the original Math.random function
    jest.spyOn(global.Math, 'random').mockRestore();
  });

  it('should calculate the delay', () => {
    const delays = [151, 301, 601, 1201, 2401, 4801, 9601, 19201, 38401, 76801];

    const strategy = new EqualJitterBackoffStrategy({ baseDelay: 100 });
    const generator = strategy.getGenerator(10);
    for (const expectedDelay of delays) {
      expect(generator.next().value).toEqual(expectedDelay);
    }
  });
});
