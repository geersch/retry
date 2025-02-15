import type { BackoffStrategyConfig } from './backoff-strategy-config.js';
import type { BackoffStrategy } from './backoff.strategy.js';

export class FixedBackoffStrategy implements BackoffStrategy {
  private readonly baseDelay: number;

  constructor({ baseDelay = 100 }: BackoffStrategyConfig = {}) {
    this.baseDelay = baseDelay;
  }

  *getGenerator(maxRetries: number): Generator<number> {
    let attempt = 1;
    while (attempt <= maxRetries) {
      yield this.baseDelay;
      attempt += 1;
    }
  }
}
