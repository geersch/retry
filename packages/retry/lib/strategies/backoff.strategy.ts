export interface BackoffStrategy {
  getMaxRetries(): number;

  getNextDelay(attempt: number): number;
}
