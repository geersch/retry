import { FibonacciBackoffStrategy } from '../../lib/strategies';

describe('FibonacciBackoffStrategy', () => {
  beforeEach(() => {
    // Seed the random number generator to get predictable results
    Math.random = vi.fn().mockReturnValue(0.5);
  });

  afterEach(() => {
    // Restore the original Math.random function
    vi.spyOn(global.Math, 'random').mockRestore();
  });

  it('should calculate the delay', () => {
    const delays = [100, 100, 200, 300, 500, 800, 1300, 2100, 3400, 5500, 8900];
    const strategy = new FibonacciBackoffStrategy({ baseDelay: 100 });
    const generator = strategy.getGenerator(11);
    for (const expectedDelay of delays) {
      expect(generator.next().value).toEqual(expectedDelay);
    }
  });
});
