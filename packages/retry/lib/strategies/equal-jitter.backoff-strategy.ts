import type { BackoffStrategyConfig } from './backoff-strategy-config.js';
import type { BackoffStrategy } from './backoff.strategy.js';
import { randomBetween } from './utils.js';

export class EqualJitterBackoffStrategy implements BackoffStrategy {
  private readonly baseDelay: number;

  constructor({ baseDelay = 100 }: BackoffStrategyConfig = {}) {
    this.baseDelay = baseDelay;
  }

  *getGenerator(maxRetries: number): Generator<number> {
    let attempt = 1;
    while (attempt <= maxRetries) {
      const exponentialDelay = this.baseDelay * 2 ** attempt;
      yield exponentialDelay / 2 + randomBetween(0, exponentialDelay / 2 + 1);
      attempt += 1;
    }
  }
}
