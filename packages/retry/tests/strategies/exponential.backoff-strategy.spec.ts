import { ExponentialBackoffStrategy } from '../../lib/strategies';

// The delay of the FullJitterBackOffStrategy is randomized.We can't assert that the output is what we expect it to be.
// Instead, we'll assert that the calculated delay obeys some constraints.

describe('ExponentialBackoffStrategy', () => {
  it('should calculate the delay', () => {
    const delays = [200, 400, 800, 1600, 3200, 6400, 12800, 25600, 51200, 102400];

    const strategy = new ExponentialBackoffStrategy({ baseDelay: 100 });
    const generator = strategy.getGenerator(10);
    for (const expectedDelay of delays) {
      expect(generator.next().value).toEqual(expectedDelay);
    }
  });
});
