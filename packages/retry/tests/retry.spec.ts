import {
  BackoffStrategy,
  BackoffStrategyConfig,
  ExponentialBackoffStrategy,
  FixedBackoffStrategy,
  retry,
} from '../lib';

const timerSpy = vi.fn();

vi.mock('rxjs', async () => {
  const originalModule = await vi.importActual<Record<string, unknown>>('rxjs');

  return {
    ...originalModule,
    timer: (due: number) => {
      timerSpy(due);
      return Promise.resolve();
    },
  };
});

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
  beforeEach(() => {
    timerSpy.mockClear();
  });

  afterAll(() => {
    timerSpy.mockRestore();
  });

  it('should retry until the maximum retries are exhausted', async () => {
    let attempts = 0;

    function operation(): Promise<void> {
      attempts += 1;
      throw new Error('Oops!');
    }

    await expect(retry(operation, new FixedBackoffStrategy({ baseDelay: 1000 }), { maxRetries: 10 })).rejects.toThrow();

    expect(attempts).toEqual(11);
  });

  it('should cap the maximum delay', async () => {
    let attempts = 0;

    function operation(): Promise<void> {
      attempts += 1;
      throw new Error('Oops!');
    }

    await expect(
      retry(operation, new ExponentialBackoffStrategy({ baseDelay: 100 }), { maxRetries: 10, maxDelay: 5000 }),
    ).rejects.toThrow();

    expect(attempts).toEqual(11);

    expect(timerSpy).toHaveBeenCalledTimes(10);
    expect(timerSpy).toHaveBeenNthCalledWith(1, 200);
    expect(timerSpy).toHaveBeenNthCalledWith(2, 400);
    expect(timerSpy).toHaveBeenNthCalledWith(3, 800);
    expect(timerSpy).toHaveBeenNthCalledWith(4, 1600);
    expect(timerSpy).toHaveBeenNthCalledWith(5, 3200);
    expect(timerSpy).toHaveBeenNthCalledWith(6, 5000);
    expect(timerSpy).toHaveBeenNthCalledWith(7, 5000);
    expect(timerSpy).toHaveBeenNthCalledWith(8, 5000);
    expect(timerSpy).toHaveBeenNthCalledWith(9, 5000);
    expect(timerSpy).toHaveBeenNthCalledWith(10, 5000);
  });

  it('should throw an error if the backoff strategy does not yield a delay', async () => {
    function operation(): Promise<void> {
      throw new Error('Oops!');
    }

    await expect(retry(operation, YieldTwoDelaysBackoffStrategy, { maxRetries: 3 })).rejects.toThrow(
      /The backoff strategy did not yield a delay for retry attempt 3./,
    );
  });

  it('should return a value when the operation succeeds', async () => {
    let attempts = 0;

    async function operation(): Promise<string> {
      attempts += 1;
      return 'Good news everyone!';
    }

    const value = await retry(operation, FixedBackoffStrategy);

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

    const value = await retry(operation, FixedBackoffStrategy);

    expect(value).toEqual('Good news everyone!');
    expect(attempts).toEqual(6);
  });

  it('should pass the retry count to the retryable operation', async () => {
    const attempts: number[] = [];

    async function operation(attempt: number): Promise<void> {
      attempts.push(attempt);
      throw new Error('Oops!');
    }

    await expect(retry(operation, new FixedBackoffStrategy({ baseDelay: 50 }), { maxRetries: 10 })).rejects.toThrow();
    expect(attempts).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
  });

  it('should apply the scale factor', async () => {
    let attempts = 0;

    function operation(): Promise<void> {
      attempts += 1;
      throw new Error('Oops!');
    }

    await expect(
      retry(operation, new FixedBackoffStrategy({ baseDelay: 100 }), { maxRetries: 5, scaleFactor: 0.5 }),
    ).rejects.toThrow();

    expect(timerSpy).toHaveBeenCalledTimes(5);
    expect(timerSpy).toHaveBeenNthCalledWith(1, 50);
    expect(timerSpy).toHaveBeenNthCalledWith(2, 50);
    expect(timerSpy).toHaveBeenNthCalledWith(3, 50);
    expect(timerSpy).toHaveBeenNthCalledWith(4, 50);
    expect(timerSpy).toHaveBeenNthCalledWith(5, 50);
    expect(attempts).toEqual(6);
  });

  it('should not retry if the error is unrecoverable (unrecoverableErrors)', async () => {
    let attempts = 0;

    const unrecoverableErrors = [RecoverableError, RecoverableError, UnrecoverableError];

    async function operation(): Promise<void> {
      attempts += 1;
      throw new unrecoverableErrors[attempts - 1]('Oops!');
    }

    await expect(
      retry(operation, FixedBackoffStrategy, {
        unrecoverableErrors: [UnrecoverableError],
      }),
    ).rejects.toThrowError(UnrecoverableError);
    expect(attempts).toEqual(3);
  });

  it('should not retry if the error is unrecoverable (abortRetry)', async () => {
    let attempts = 0;

    const unrecoverableErrors = [RecoverableError, RecoverableError, UnrecoverableError];

    async function operation(): Promise<void> {
      attempts += 1;
      throw new unrecoverableErrors[attempts - 1]('Oops!');
    }

    await expect(
      retry(operation, FixedBackoffStrategy, {
        abortRetry: (error, _retryCount: number) => {
          return error instanceof UnrecoverableError;
        },
      }),
    ).rejects.toThrowError(UnrecoverableError);
    expect(attempts).toEqual(3);
  });

  it('should abort the retry attempts as soon as possible (unrecoverableErrors)', async () => {
    let attempts = 0;

    const errorsToBeThrown = [RecoverableError, UnrecoverableError];

    async function operation(): Promise<void> {
      attempts++;
      throw new errorsToBeThrown[attempts - 1]('Oops!');
    }

    await expect(
      retry(operation, FixedBackoffStrategy, {
        unrecoverableErrors: [UnrecoverableError],
        abortRetry: (_error, retryCount: number) => {
          return retryCount >= 4; // never reached
        },
      }),
    ).rejects.toThrow(UnrecoverableError);
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
      throw new errorsToBeThrown[attempts - 1]('Oops!');
    }

    await expect(
      retry(operation, FixedBackoffStrategy, {
        unrecoverableErrors: [UnrecoverableError],
        abortRetry: (_error, retryCount: number) => {
          return retryCount >= 4;
        },
      }),
    ).rejects.toThrow(RecoverableError);
    expect(attempts).toEqual(4);
  });

  it('should accept an operation that does not return a promise', async () => {
    function operation(): string {
      return 'Good news everyone!';
    }

    const value = await retry(operation, new FixedBackoffStrategy({ baseDelay: 50 }));

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
