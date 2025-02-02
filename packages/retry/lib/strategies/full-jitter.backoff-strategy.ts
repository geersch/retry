import { BackoffStrategyConfig } from './backoff-strategy-config.js';
import { BackoffStrategy } from './backoff.strategy.js';
import { randomBetween } from './utils.js';

export class FullJitterBackOffStrategy implements BackoffStrategy {
  private readonly baseDelay: number;

  constructor({ baseDelay = 100 }: BackoffStrategyConfig = {}) {
    this.baseDelay = baseDelay;
  }

  *getGenerator(maxRetries: number): Generator<number> {
    let attempt = 1;
    while (attempt <= maxRetries) {
      yield randomBetween(0, this.baseDelay * 2 ** attempt);
      attempt += 1;
    }
  }
}
