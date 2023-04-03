import { BackoffStrategyConfig } from './backoff-strategy-config';
import { BackoffStrategy } from './backoff.strategy';

export class ExponentialBackoffStrategy implements BackoffStrategy {
  private readonly baseDelay: number;

  constructor({ baseDelay = 100 }: BackoffStrategyConfig = {}) {
    this.baseDelay = baseDelay;
  }

  *getGenerator(maxRetries: number): Generator<number> {
    let attempt = 1;
    while (attempt <= maxRetries) {
      yield this.baseDelay * 2 ** attempt;
      attempt += 1;
    }
  }
}
