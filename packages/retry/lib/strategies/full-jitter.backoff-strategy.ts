import { BackoffStrategyConfig } from './backoff-strategy-config';
import { BackoffStrategy } from './backoff.strategy';
import { randomBetween } from './utils';

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
