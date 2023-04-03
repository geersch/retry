export interface BackoffStrategy {
  getGenerator(maxRetries: number): Generator<number>;
}
