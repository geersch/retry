import { BackoffStrategyConfig } from './backoff-strategy-config';
import { BackoffStrategy } from './backoff.strategy';

export interface LinearBackoffStrategyConfig extends BackoffStrategyConfig {
  /**
   * The base delay between each retry expressed in milliseconds. Defaults to 100.
   */
  baseDelay?: number;

  maximumDelay?: number;
}

export class LinearBackoffStrategy implements BackoffStrategy {
  private readonly maxRetries: number;
  private readonly baseDelay: number;
  private readonly maximumDelay?: number;

  constructor({ baseDelay = 100, maximumDelay, maxRetries = 5 }: LinearBackoffStrategyConfig = {}) {
    this.baseDelay = baseDelay;
    this.maxRetries = maxRetries;
    this.maximumDelay = maximumDelay;
  }

  getMaxRetries(): number {
    return this.maxRetries;
  }

  getNextDelay(attempt: number): number {
    const linearDelay = this.baseDelay * attempt;
    if (this.maximumDelay && this.maximumDelay > 0) {
      return Math.min(this.maximumDelay, linearDelay);
    } else {
      return linearDelay;
    }
  }
}
