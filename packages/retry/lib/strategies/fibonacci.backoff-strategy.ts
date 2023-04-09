import { BackoffStrategyConfig } from './backoff-strategy-config';
import { BackoffStrategy } from './backoff.strategy';

export class FibonacciBackoffStrategy implements BackoffStrategy {
  private readonly baseDelay: number;
  private prevDelay: number;
  private currentDelay: number;

  constructor({ baseDelay = 100 }: BackoffStrategyConfig = {}) {
    this.baseDelay = baseDelay;
    this.prevDelay = 0;
    this.currentDelay = 1;
  }

  *getGenerator(maxRetries: number): Generator<number> {
    let attempt = 0;
    while (attempt < maxRetries) {
      const nextDelay = this.baseDelay * this.currentDelay;
      yield nextDelay;
      const sum = this.prevDelay + this.currentDelay;
      this.prevDelay = this.currentDelay;
      this.currentDelay = sum;
      attempt += 1;
    }
  }
}
