import { BackoffStrategyConfig } from './backoff-strategy-config';
import { BackoffStrategy } from './backoff.strategy';
import { randomBetween } from './utils';

export interface FullJitterBackoffStrategyConfig extends BackoffStrategyConfig {
  /**
   * The base delay between each retry expressed in milliseconds. Defaults to 100.
   */
  baseDelay?: number;

  maximumDelay?: number;
}

export class FullJitterBackOffStrategy implements BackoffStrategy {
  private readonly maxRetries: number;
  private readonly baseDelay: number;
  private readonly maximumDelay?: number;

  constructor({ baseDelay = 100, maximumDelay, maxRetries = 5 }: FullJitterBackoffStrategyConfig = {}) {
    this.baseDelay = baseDelay;
    this.maxRetries = maxRetries;
    this.maximumDelay = maximumDelay;
  }

  getMaxRetries(): number {
    return this.maxRetries;
  }

  getNextDelay(attempt: number): number {
    const exponentialDelay = this.baseDelay * 2 ** attempt;
    if (this.maximumDelay && this.maximumDelay > 0) {
      return randomBetween(0, Math.min(this.maximumDelay, exponentialDelay));
    } else {
      return randomBetween(0, exponentialDelay);
    }
  }
}
