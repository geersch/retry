export interface BackoffStrategyConfig {
  /**
   * Is the initial delay time that sets the baseline for delay times. It default to 100 milliseconds.
   */
  baseDelay?: number;
}
