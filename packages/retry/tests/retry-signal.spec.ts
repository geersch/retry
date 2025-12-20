import { FixedBackoffStrategy, retry } from '../lib/index.js';

describe('retry with AbortSignal', () => {
  it('should abort retry when signal is aborted during execution', async () => {
    const abortController = new AbortController();

    let attempts = 0;

    async function operation(): Promise<void> {
      attempts += 1;
      if (attempts === 3) {
        abortController.abort();
      }
      throw new Error('Oops!');
    }

    const promise = retry(operation, new FixedBackoffStrategy({ baseDelay: 100 }), {
      maxRetries: 10,
      signal: abortController.signal,
    });

    await expect(promise).rejects.toThrowError('Oops!');
    expect(attempts).toEqual(3);
  });

  it.each([
    { timeout: 80, expectedAttempts: 1 },
    { timeout: 180, expectedAttempts: 2 },
    { timeout: 275, expectedAttempts: 3 },
    { timeout: 320, expectedAttempts: 4 },
    { timeout: 410, expectedAttempts: 5 },
  ])(
    'should abort immediately when signal is aborted before a retry attempt',
    async ({ timeout, expectedAttempts }) => {
      let attempts = 0;
      const abortController = new AbortController();

      async function operation(): Promise<void> {
        attempts += 1;
        throw new Error('Oops!');
      }

      const promise = retry(operation, new FixedBackoffStrategy({ baseDelay: 100 }), {
        maxRetries: 100,
        signal: abortController.signal,
      });

      setTimeout(() => {
        abortController.abort();
      }, timeout);

      await expect(promise).rejects.toThrowError('Oops!');

      expect(attempts).toEqual(expectedAttempts);
    },
  );

  it('should abort retry when using AbortSignal.timeout', async () => {
    let attempts = 0;

    async function operation(): Promise<void> {
      attempts += 1;
      throw new Error('Oops!');
    }

    const signal = AbortSignal.timeout(250);
    const promise = retry(operation, new FixedBackoffStrategy({ baseDelay: 100 }), {
      maxRetries: 10,
      signal,
    });

    await expect(promise).rejects.toThrowError('Oops!');
    expect(attempts).toEqual(3);
  });

  it('should abort immediately on first retry if signal is already aborted', async () => {
    let attempts = 0;
    const abortController = new AbortController();
    abortController.abort();

    async function operation(): Promise<void> {
      attempts += 1;
      throw new Error('Oops!');
    }

    const promise = retry(operation, new FixedBackoffStrategy({ baseDelay: 100 }), {
      maxRetries: 10,
      signal: abortController.signal,
    });

    await expect(promise).rejects.toThrowError('Oops!');

    expect(attempts).toEqual(1);
  });

  it('should complete successfully if operation succeeds', async () => {
    let attempts = 0;
    const abortController = new AbortController();

    async function operation(): Promise<string> {
      attempts += 1;
      if (attempts <= 2) {
        throw new Error('Oops!');
      }
      return 'Success!';
    }

    const result = await retry(operation, new FixedBackoffStrategy({ baseDelay: 100 }), {
      maxRetries: 10,
      signal: abortController.signal,
    });

    expect(result).toEqual('Success!');
    expect(attempts).toEqual(3);
  });
});
