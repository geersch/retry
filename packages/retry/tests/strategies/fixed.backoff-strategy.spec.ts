import { FixedBackoffStrategy } from '../../lib/strategies/fixed.backoff-strategy.js';

describe('FixedBackoffStrategy', () => {
  it('should calculate the delay', () => {
    const delays = [100, 100, 100, 100, 100, 100, 100, 100, 100, 100];

    const strategy = new FixedBackoffStrategy({ baseDelay: 100 });
    const generator = strategy.getGenerator(10);
    for (const expectedDelay of delays) {
      expect(generator.next().value).toEqual(expectedDelay);
    }
  });
});
