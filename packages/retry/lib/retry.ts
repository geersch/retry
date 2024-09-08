/* eslint-disable @typescript-eslint/no-explicit-any */
import { defer, firstValueFrom, Observable, retry as retryOperator, tap, throwError, timer } from 'rxjs';
import { BackoffStrategy } from './strategies';

type Type<T = any> = new (...args: any[]) => T;

export type ErrorConstructor = new (...args: any[]) => Error;

export interface RetryOptions {
  abortRetry?: (error: any, retryCount: number) => boolean;

  maxDelay?: number;

  maxRetries?: number;

  scaleFactor?: number;

  unrecoverableErrors?: ErrorConstructor[];
}

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

export function passRetryOperatorToPipe<T>(
  observable: Observable<T>,
  backoffStrategy: Type<BackoffStrategy> | BackoffStrategy,
  { abortRetry = undefined, maxDelay = 30000, maxRetries = 5, scaleFactor = 1, unrecoverableErrors = [] }: RetryOptions,
): Observable<T> {
  if (scaleFactor <= 0) {
    throw new TypeError(`Expected 'scaleFactor' to be a positive number greater than zero, got ${scaleFactor}.`);
  }

  const strategy = typeof backoffStrategy === 'function' ? new backoffStrategy() : backoffStrategy;
  const generator = strategy.getGenerator(maxRetries);

  return observable.pipe(
    retryOperator({
      count: maxRetries,
      delay: (err: any, retryCount: number) => {
        const isUnrecoverable = unrecoverableErrors.some((error) => err instanceof error);
        if (isUnrecoverable || (abortRetry ? abortRetry(err, retryCount) : false)) {
          return throwError(() => err);
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
