/* eslint-disable @typescript-eslint/no-explicit-any */
import { defer, firstValueFrom, Observable, retry as retryOperator, tap, throwError, timer } from 'rxjs';
import type { BackoffStrategy } from './strategies/backoff.strategy.js';

type Type<T = any> = new (...args: any[]) => T;

export type ErrorConstructor = new (...args: any[]) => Error;

/**
 * Configuration options for retry behavior
 */
export interface RetryOptions {
  /**
   * Function to determine if retry attempts should be aborted based on the error and retry count
   * @param error - The error that occurred
   * @param retryCount - The current retry attempt number (1-based)
   * @returns true to abort retries, false to continue
   */
  abortRetry?: (error: any, retryCount: number) => boolean;

  /**
   * Maximum delay between retry attempts in milliseconds
   * @default 30000
   */
  maxDelay?: number;

  /**
   * Maximum number of retry attempts
   * @default 5
   */
  maxRetries?: number;

  /**
   * Factor to scale the delay returned by the backoff strategy
   * Must be a positive number greater than zero
   * @default 1
   */
  scaleFactor?: number;

  /**
   * Array of error constructors that should not trigger retries
   * If the thrown error is an instance of any of these constructors, retries will be aborted
   */
  unrecoverableErrors?: ErrorConstructor[];
}

/**
 * Retries an operation using the specified backoff strategy and options
 * @param operation - The operation to retry, receives the current retry count (1-based)
 * @param backoffStrategy - The backoff strategy instance or constructor to use
 * @param options - Configuration options for retry behavior
 * @returns Promise that resolves with the operation result or rejects with the final error
 */
export async function retry<T>(
  operation: (retryCount: number) => T | Promise<T>,
  backoffStrategy: Type<BackoffStrategy> | BackoffStrategy,
  options: RetryOptions = {},
): Promise<T> {
  let attempt = 1;

  return firstValueFrom(
    passRetryOperatorToPipe(
      defer(async () => operation(attempt)).pipe(
        tap({
          error: () => (attempt += 1),
        }),
      ),
      backoffStrategy,
      options,
    ),
  );
}

/**
 * Internal function that applies the retry operator to an observable
 * @param observable - The observable to apply retry logic to
 * @param backoffStrategy - The backoff strategy instance or constructor
 * @param options - Retry configuration options with defaults
 * @returns Observable with retry logic applied
 */
export function passRetryOperatorToPipe<T>(
  observable: Observable<T>,
  backoffStrategy: Type<BackoffStrategy> | BackoffStrategy,
  { abortRetry, maxDelay = 30000, maxRetries = 5, scaleFactor = 1, unrecoverableErrors = [] }: RetryOptions,
): Observable<T> {
  if (scaleFactor <= 0) {
    throw new TypeError(`Expected 'scaleFactor' to be a positive number greater than zero, got ${scaleFactor}.`);
  }

  const strategy = typeof backoffStrategy === 'function' ? new backoffStrategy() : backoffStrategy;
  const generator = strategy.getGenerator(maxRetries);

  return observable.pipe(
    retryOperator({
      count: maxRetries,
      delay: (error: any, retryCount: number) => {
        const isUnrecoverable = unrecoverableErrors.some((errorConstructor) => error instanceof errorConstructor);
        if (isUnrecoverable || (abortRetry?.(error, retryCount) ?? false)) {
          return throwError(() => error);
        }

        const { value, done } = generator.next();
        if (done) {
          return throwError(
            () => new Error(`The backoff strategy did not yield a delay for retry attempt ${retryCount}.`),
          );
        }

        let delay = value * scaleFactor;
        if (delay > maxDelay) {
          delay = maxDelay;
        }

        return timer(delay);
      },
    }),
  );
}
