import {
  type BackoffStrategy,
  type BackoffStrategyConfig,
  ExponentialBackoffStrategy,
  FixedBackoffStrategy,
  retry,
} from '../lib/index.js';
import * as rxjs from 'rxjs';

export class YieldTwoDelaysBackoffStrategy implements BackoffStrategy {
  private readonly baseDelay: number;

  constructor({ baseDelay = 100 }: BackoffStrategyConfig = {}) {
    this.baseDelay = baseDelay;
  }

  *getGenerator(): Generator<number> {
    yield this.baseDelay;
    yield this.baseDelay;
  }
}

class UnrecoverableError extends Error {}

class RecoverableError extends Error {}

describe('retry', () => {
  let delays: number[] = [];

  beforeEach(() => {
    vi.useFakeTimers();
    delays = [];

    const originalTimer = rxjs.timer;
    vi.spyOn(rxjs, 'timer').mockImplementation((due) => {
      delays.push(due as number);
      return originalTimer(due);
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('should retry until the maximum retries are exhausted', async () => {
    let attempts = 0;

    function operation(): Promise<void> {
      attempts += 1;
      throw new Error('Oops!');
    }

    const promise = retry(operation, new FixedBackoffStrategy({ baseDelay: 1000 }), { maxRetries: 10 });

    // Handle promise rejecting during timer advancement.
    promise.catch(() => {
      // Expected error
    });

    await vi.runAllTimersAsync();

    await expect(promise).rejects.toThrowError();

    expect(attempts).toEqual(11);
  });

  it('should cap the maximum delay', async () => {
    let attempts = 0;

    function operation(): Promise<void> {
      attempts += 1;
      throw new Error('Oops!');
    }

    const promise = retry(operation, new ExponentialBackoffStrategy({ baseDelay: 100 }), {
      maxRetries: 10,
      maxDelay: 5000,
    });

    promise.catch(() => {
      // Expected error
    });

    await vi.runAllTimersAsync();

    await expect(promise).rejects.toThrowError();

    expect(attempts).toEqual(11);

    expect(delays).toHaveLength(10);
    expect(delays[0]).toBe(200);
    expect(delays[1]).toBe(400);
    expect(delays[2]).toBe(800);
    expect(delays[3]).toBe(1600);
    expect(delays[4]).toBe(3200);
    expect(delays[5]).toBe(5000);
    expect(delays[6]).toBe(5000);
    expect(delays[7]).toBe(5000);
    expect(delays[8]).toBe(5000);
    expect(delays[9]).toBe(5000);
  });

  it('should throw an error if the backoff strategy does not yield a delay', async () => {
    function operation(): Promise<void> {
      throw new Error('Oops!');
    }

    const promise = retry(operation, YieldTwoDelaysBackoffStrategy, { maxRetries: 3 });

    promise.catch(() => {
      // Expected error
    });

    await vi.runAllTimersAsync();

    await expect(promise).rejects.toThrowError(/The backoff strategy did not yield a delay for retry attempt 3./);
  });

  it('should return a value when the operation succeeds', async () => {
    let attempts = 0;

    async function operation(): Promise<string> {
      attempts += 1;
      return 'Good news everyone!';
    }

    const promise = retry(operation, FixedBackoffStrategy);

    await vi.runAllTimersAsync();

    const value = await promise;

    expect(value).toEqual('Good news everyone!');
    expect(attempts).toEqual(1);
  });

  it('should succeed after retrying 5 times', async () => {
    let attempts = 0;

    async function operation(): Promise<string> {
      attempts += 1;

      if (attempts <= 5) {
        throw new Error('Oops!');
      }
      return 'Good news everyone!';
    }

    const promise = retry(operation, FixedBackoffStrategy);

    await vi.runAllTimersAsync();

    const value = await promise;

    expect(value).toEqual('Good news everyone!');
    expect(attempts).toEqual(6);
  });

  it('should pass the retry count to the retryable operation', async () => {
    const attempts: number[] = [];

    async function operation(attempt: number): Promise<void> {
      attempts.push(attempt);
      throw new Error('Oops!');
    }

    const promise = retry(operation, new FixedBackoffStrategy({ baseDelay: 50 }), { maxRetries: 10 });

    promise.catch(() => {
      // Expected error
    });

    await vi.runAllTimersAsync();

    await expect(promise).rejects.toThrowError();
    expect(attempts).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
  });

  it('should apply the scale factor', async () => {
    let attempts = 0;

    function operation(): Promise<void> {
      attempts += 1;
      throw new Error('Oops!');
    }

    const promise = retry(operation, new FixedBackoffStrategy({ baseDelay: 100 }), {
      maxRetries: 5,
      scaleFactor: 0.5,
    });

    promise.catch(() => {
      // Expected error
    });

    await vi.runAllTimersAsync();

    await expect(promise).rejects.toThrowError();

    expect(delays).toHaveLength(5);
    expect(delays[0]).toBe(50);
    expect(delays[1]).toBe(50);
    expect(delays[2]).toBe(50);
    expect(delays[3]).toBe(50);
    expect(delays[4]).toBe(50);
    expect(attempts).toEqual(6);
  });

  it('should not retry if the error is unrecoverable (unrecoverableErrors)', async () => {
    let attempts = 0;

    const errorsToBeThrown = [RecoverableError, RecoverableError, UnrecoverableError];

    async function operation(): Promise<void> {
      attempts += 1;
      const errorType = errorsToBeThrown[attempts - 1] ?? Error;
      throw new errorType('Oops!');
    }

    const promise = retry(operation, FixedBackoffStrategy, {
      unrecoverableErrors: [UnrecoverableError],
    });

    promise.catch(() => {
      // Expected error
    });

    await vi.runAllTimersAsync();

    await expect(promise).rejects.toThrowError(UnrecoverableError);
    expect(attempts).toEqual(3);
  });

  it('should not retry if the error is unrecoverable (abortRetry)', async () => {
    let attempts = 0;

    const errorsToBeThrown = [RecoverableError, RecoverableError, UnrecoverableError];

    async function operation(): Promise<void> {
      attempts += 1;
      const errorType = errorsToBeThrown[attempts - 1] ?? Error;
      throw new errorType('Oops!');
    }

    const promise = retry(operation, FixedBackoffStrategy, {
      abortRetry: (error, _retryCount: number) => {
        return error instanceof UnrecoverableError;
      },
    });

    promise.catch(() => {
      // Expected error
    });

    await vi.runAllTimersAsync();

    await expect(promise).rejects.toThrowError(UnrecoverableError);
    expect(attempts).toEqual(3);
  });

  it('should abort the retry attempts as soon as possible (unrecoverableErrors)', async () => {
    let attempts = 0;

    const errorsToBeThrown = [RecoverableError, UnrecoverableError];

    async function operation(): Promise<void> {
      attempts++;
      const errorType = errorsToBeThrown[attempts - 1] ?? Error;
      throw new errorType('Oops!');
    }

    const promise = retry(operation, FixedBackoffStrategy, {
      unrecoverableErrors: [UnrecoverableError],
      abortRetry: (_error, retryCount: number) => {
        return retryCount >= 4; // never reached
      },
    });

    promise.catch(() => {
      // Expected error
    });

    await vi.runAllTimersAsync();

    await expect(promise).rejects.toThrowError(UnrecoverableError);
    expect(attempts).toEqual(2);
  });

  it('should abort the retry attempts as soon as possible (abortRetry)', async () => {
    let attempts = 0;

    const errorsToBeThrown = [
      RecoverableError,
      RecoverableError,
      RecoverableError,
      RecoverableError,
      UnrecoverableError,
    ];

    async function operation(): Promise<void> {
      attempts++;
      const errorType = errorsToBeThrown[attempts - 1] ?? Error;
      throw new errorType('Oops!');
    }

    const promise = retry(operation, FixedBackoffStrategy, {
      unrecoverableErrors: [UnrecoverableError],
      abortRetry: (_error, retryCount: number) => {
        return retryCount >= 4;
      },
    });

    promise.catch(() => {
      // Expected error
    });

    await vi.runAllTimersAsync();

    await expect(promise).rejects.toThrowError(RecoverableError);
    expect(attempts).toEqual(4);
  });

  it('should accept an operation that does not return a promise', async () => {
    function operation(): string {
      return 'Good news everyone!';
    }

    const promise = retry(operation, new FixedBackoffStrategy({ baseDelay: 50 }));

    await vi.runAllTimersAsync();

    const value = await promise;

    expect(value).toEqual('Good news everyone!');
  });

  it('should throw an error if a negative scale factor is specified', async () => {
    async function operation(): Promise<string> {
      return 'Good news everyone!';
    }

    await expect(retry(operation, FixedBackoffStrategy, { scaleFactor: -1 })).rejects.toThrowError(TypeError);
    await expect(retry(operation, FixedBackoffStrategy, { scaleFactor: -1 })).rejects.toThrowError(
      /Expected 'scaleFactor' to be a positive number greater than zero, got -1./,
    );
  });
});
