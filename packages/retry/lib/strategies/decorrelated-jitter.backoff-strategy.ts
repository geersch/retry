import type { BackoffStrategyConfig } from './backoff-strategy-config.js';
import type { BackoffStrategy } from './backoff.strategy.js';

const MEDIAN_INTERVAL_SCALING_FACTOR = 1 / 1.4;

/**
 * Implements decorrelated jitter backoff strategy to prevent thundering herd scenarios.
 *
 * - https://github.com/App-vNext/Polly/issues/530
 * - https://github.com/Polly-Contrib/Polly.Contrib.WaitAndRetry/blob/24cb116a2a320e82b01f57e13bfeaeff2725ccbf/src/Polly.Contrib.WaitAndRetry/Backoff.DecorrelatedJitterV2.cs
 */
export class DecorrelatedJitterBackoffStrategy implements BackoffStrategy {
  private readonly baseDelay: number;

  constructor({ baseDelay = 100 }: BackoffStrategyConfig = {}) {
    this.baseDelay = baseDelay;
  }

  *getGenerator(maxRetries: number): Generator<number> {
    let attempt = 0;
    let previousValue = 0;
    while (attempt < maxRetries) {
      const randomizedAttempt = attempt + Math.random();
      const nextValue = Math.pow(2, randomizedAttempt) * Math.tanh(Math.sqrt(4.0 * randomizedAttempt));
      const formulaIntrinsicValue = Math.max(0, nextValue - previousValue);
      previousValue = nextValue;
      yield formulaIntrinsicValue * MEDIAN_INTERVAL_SCALING_FACTOR * this.baseDelay;
      attempt += 1;
    }
  }
}
