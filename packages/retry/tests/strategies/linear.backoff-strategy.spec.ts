import { LinearBackoffStrategy } from '../../lib/strategies';

describe('LinearBackoffStrategy', () => {
  it('should calculate the delay', () => {
    const delays = [200, 400, 600, 800, 1000, 1200, 1400, 1600, 1800, 2000];

    const strategy = new LinearBackoffStrategy({ baseDelay: 200 });
    const generator = strategy.getGenerator(10);
    for (const expectedDelay of delays) {
      expect(generator.next().value).toEqual(expectedDelay);
    }
  });
});
