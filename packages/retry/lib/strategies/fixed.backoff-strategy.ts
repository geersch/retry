import { BackoffStrategyConfig } from './backoff-strategy-config';
import { BackoffStrategy } from './backoff.strategy';

export interface FixedBackoffStrategyConfig extends BackoffStrategyConfig {
  /**
   * The delay between each retry expressed in milliseconds. Defaults to 1000.
   */
  delay?: number;
}

export class FixedBackoffStrategy implements BackoffStrategy {
  private readonly maxRetries: number;
  private readonly delay: number;

  constructor({ delay = 100, maxRetries = 5 }: FixedBackoffStrategyConfig = {}) {
    this.delay = delay;
    this.maxRetries = maxRetries;
  }

  getMaxRetries(): number {
    return this.maxRetries;
  }

  getNextDelay(_attempt: number): number {
    return this.delay;
  }
}
