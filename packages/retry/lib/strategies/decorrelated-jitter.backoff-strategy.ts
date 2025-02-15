import type { BackoffStrategyConfig } from './backoff-strategy-config.js';
import type { BackoffStrategy } from './backoff.strategy.js';

const rpScalingFactor = 1 / 1.4;

/**
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
    let previous = 0;
    while (attempt < maxRetries) {
      const t = attempt + Math.random();
      const next = Math.pow(2, t) * Math.tanh(Math.sqrt(4.0 * t));
      const formulaIntrisincValue = Math.max(0, next - previous);
      previous = next;
      yield formulaIntrisincValue * rpScalingFactor * this.baseDelay;
      attempt += 1;
    }
  }
}
