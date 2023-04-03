import { BackoffStrategyConfig } from './backoff-strategy-config';
import { BackoffStrategy } from './backoff.strategy';

export class LinearBackoffStrategy implements BackoffStrategy {
  private readonly baseDelay: number;

  constructor({ baseDelay = 100 }: BackoffStrategyConfig = {}) {
    this.baseDelay = baseDelay;
  }

  *getGenerator(maxRetries: number): Generator<number> {
    let attempt = 1;
    while (attempt <= maxRetries) {
      yield this.baseDelay * attempt;
      attempt += 1;
    }
  }
}
