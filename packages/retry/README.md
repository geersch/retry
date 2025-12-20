## @geersch/retry

## Description

Retry utility function supporting exponential backoff powered by [RxJS](https://rxjs.dev/).

## Installation

```sh
$ yarn add @geersch/retry
```

## Usage

Declare a function that should be retried in case an error occured.

```ts
async function operation(): Promise<string> {
  return 'Success!';
}

// OR

function operation(): string {
  return 'Success!;
}
```

Invoke it with the `retry` utility function and specify a backoff strategy.

```ts
const result = await retry((attempt: number) => {
  operation();
}, EqualJitterBackoffStrategy);
```

If an error occurs during the `operation()`, it will be retried using the `EqualJitterBackoffStrategy`.

You can pass the type of backoff strategy to use, in which case it will be instantiated for you with its default base delay, or you can instantiate it yourself and override the base delay as needed.

```ts
const result = await retry(
  (attempt: number) => {
    operation();
  },
  new EqualJitterBackoffStrategy({ baseDelay: 200 }),
);
```

The current attempt is passed as a parameter to the retried function. The maximum number of retries can be passed to the backoff strategy. If the maximum is set to 5, then the function will be executed a maximum of 6 times (1 initial call + 5 retries).

## Backoff Strategies

The following backoff strategies are supported out of the box:

- DecorrelatedJitterBackoffStrategy
- EqualJitterBackoffStrategy
- ExponentialBackoffStrategy
- FibonacciBackoffStrategy
- FixedBackoffStrategyConfig
- FullJitterBackOffStrategy
- LinearBackoffStrategy

Each of these strategies has a default base delay of `100` ms, which is the initial delay time that sets the baseline for calculating subsequent delays during retries.

### DecorrelatedJitterBackoffStrategy

Similar to the full jitter backoff strategy, but it increases the maximum jitter based on the last calculated delay.

For example, with a base delay of `100` ms:

- A final delay between `0` and ±`137.72` ms is calculated for retry `1`.
- A final delay between `100` and ±`146.01` ms is calculated for retry `2`.
- A final delay between `100` and ±`286.58` ms is calculated for retry `3`.
- ...

By default, the `DecorrelatedJitterBackoffStrategy` uses a base delay of `100` ms.

```ts
const result = await retry((attempt: number) => {
  operation();
}, DecorrelatedJitterBackoffStrategy);
```

The default base delay of `100` ms can be overridden.

```ts
const result = await retry(
  (attempt: number) => {
    operation();
  },
  new DecorrelatedJitterBackoffStrategy({ baseDelay: 200 }),
);
```

### EqualJitterBackoffStrategy

Uses an equal jitter for computing the delay before the next retry. First, an exponential delay is calculated based on the current retry attempt and configured base delay.

For example, with a base delay of `100` ms:

- An exponential delay of `200` ms is calculated for retry `1`.
- An exponential delay of `400` ms is calculated for retry `2`.
- An exponential delay of `800` ms is calculated for retry `3`.
- ...

Half of this exponential delay is kept, and a random value (jitter) between 0 and half of the exponential delay plus one is added.

- A final delay between `100` and `201` ms is calculated for retry `1`.
- A final delay between `200` and `401` ms is calculated for retry `2`.
- A final delay between `400` and `801` ms is calculated for retry `3`.
- ...

By default the `EqualJitterBackoffStrategy` uses a base delay of `100` ms.

```ts
const result = await retry((attempt: number) => {
  operation();
}, EqualJitterBackoffStrategy);
```

The default base delay of `100` ms can be overridden.

```ts
const result = await retry(
  (attempt: number) => {
    operation();
  },
  new EqualJitterBackoffStrategy({ baseDelay: 200 }),
);
```

### ExponentialBackoffStrategy

Calculates an exponential delay based on the current retry attempt and configured base delay.

For example, with a base delay of `100` ms:

- An exponential delay of `200` ms is calculated for retry `1`.
- An exponential delay of `400` ms is calculated for retry `2`.
- An exponential delay of `800` ms is calculated for retry `3`.
- ...

By default, the `ExponentialBackoffStrategy` uses a base delay of `100` ms.

```ts
const result = await retry((attempt: number) => {
  operation();
}, ExponentialBackoffStrategy);
```

The default base delay of `100` ms can be overridden.

```ts
const result = await retry(
  (attempt: number) => {
    operation();
  },
  new ExponentialBackoffStrategy({ baseDelay: 200 }),
);
```

### FibonacciBackoffStrategy

The `FibonacciBackOffStrategy` computes the delay before the next retry using a [Fibonacci sequence](https://en.wikipedia.org/wiki/Fibonacci_sequence) approach. It calculates the delay based on the current retry attempt and a configured base delay.

For example, with a base delay of `100` ms:

- A delay of `100` ms is calculated for retry `1`.
- A delay of `100` ms is calculated for retry `2`.
- A delay of `200` ms is calculated for retry `3`.
- A delay of `300` ms is calculated for retry `4`.
- A delay of `500` ms is calculated for retry `5`.
- ...

By default, the `FibonacciBackOffStrategy` uses a base delay of `100` ms.

```ts
const result = await retry(async (attempt: number) => {
  await operation();
}, FibonacciBackOffStrategy);
```

The default base delay of `100` ms can be overridden.

```ts
const result = await retry(
  async (attempt: number) => {
    await operation();
  },
  new FibonacciBackOffStrategy({ baseDelay: 200 }),
);
```

### FixedBackoffStrategy

Uses the same delay between every retry attempt. By default, the `FixedBackoffStrategyConfig` uses a base delay of `100` ms. As the name suggests, the delay is fixed. The configured base delay will be used for all attempts.

```ts
const result = await retry((attempt: number) => {
  operation();
}, FixedBackoffStrategyConfig);
```

The default base delay of `100` ms can be overridden.

```ts
const result = await retry(
  (attempt: number) => {
    operation();
  },
  new FixedBackoffStrategyConfig({ baseDelay: 200 }),
);
```

### FullJitterBackOffStrategy

It uses full jitter for computing the delay before the next retry. First, an exponential delay is calculated based on the current retry attempt and the configured base delay.

For example, with a base delay of `100` ms:

- An exponential delay of `200` ms is calculated for retry `1`.
- An exponential delay of `400` ms is calculated for retry `2`.
- An exponential delay of `800` ms is calculated for retry `3`.
- ...

Then, a random delay between `0` and this exponential delay is taken.

- A final delay between `0` and `200` ms is calculated for retry `1`.
- A final delay between `0` and `400` ms is calculated for retry `2`.
- A final delay between `0` and `800` ms is calculated for retry `3`.
- ...

By default, the `FullJitterBackOffStrategy` uses a base delay of 100 ms.

```ts
const result = await retry((attempt: number) => {
  operation();
}, FullJitterBackOffStrategy);
```

The default base delay of `100` ms can be overridden.

```ts
const result = await retry(
  (attempt: number) => {
    operation();
  },
  new FullJitterBackOffStrategy({ baseDelay: 200 }),
);
```

### LinearBackoffStrategy

The base delay is multiplied by the current retry attempt to calculate the delay before the next retry.

For example, with a base delay of `100` ms:

- A delay of `100` ms is calculated for retry `1`.
- A delay of `200` ms is calculated for retry `2`.
- A delay of `400` ms is calculated for retry `3`.
- ...

```ts
const result = await retry((attempt: number) => {
  operation();
}, LinearBackoffStrategy);
```

The default base delay of `100` ms can be overridden.

```ts
const result = await retry(
  (attempt: number) => {
    operation();
  },
  new LinearBackoffStrategy({ baseDelay: 200 }),
);
```

## Retry Options

In addition to a backoff strategy, you can also pass optional retry options as a third parameter.

```ts
const result = await retry(
  (attempt: number) => {
    operation();
  },
  EqualJitterBackoffStrategy,
  {
    abortRetry: (err: any, retryCount: number) => true,
    scaleFactor: 2,
    unrecoverableErrors: [RecoverableError, UnrecoverableError],
  },
);
```

### abortRetry

A synchronous callback function that is executed before every retry attempt. It is passed the error that occurred and the current retry attempt. Return `true` if you want to abort, or `false` to keep trying.

```ts
const result = await retry(
  (attempt: number) => {
    operation();
  },
  EqualJitterBackoffStrategy,
  {
    abortRetry: (err: any, retryCount: number) => {
      if (err instanceof TypeError) {
        return true;
      }

      return false;
    },
  },
);
```

### maxDelay

To clamp the delay calculated by the backoff strategy, use the maxDelay option. It defaults to `30000` milliseconds.

The following example clamps the delay calculated by the backoff strategy to a maximum of `10000` milliseconds.

```ts
const result = await retry(
  (attempt: number) => {
    operation();
  },
  EqualJitterBackoffStrategy,
  {
    maxDelay: 10000,
  },
);
```

### maxRetries

Use the `maxRetries` option to specify the maximum number of retry attempts. It defaults to `5`.

The following example will execute the `operation()` a maximum of `4` times - once for the initial invocation, plus a maximum of `3` retries.

```ts
const result = await retry(
  (attempt: number) => {
    operation();
  },
  EqualJitterBackoffStrategy,
  {
    maxRetries: 3,
  },
);
```

### scaleFactor

Certain strategies can quickly lead to long delays between retry attempts. To offset this, while still retaining the curve between retry attempts, you can specify a `scaleFactor`. It can be used to reduce or increase the calculated delay.

For example, a `scaleFactor` of `0.5` will halve the computed delay, but a `scaleFactor` of `2` will double it.

```ts
const result = await retry(
  (attempt: number) => {
    operation();
  },
  EqualJitterBackoffStrategy,
  {
    scaleFactor: 0.5,
  },
);
```

### signal

An `AbortSignal` that allows you to cancel retry attempts. This is useful when you need to abort retries based on external events, timeouts, or user actions.

The `signal` option accepts an `AbortSignal` instance or a factory function `() => AbortSignal | null`. When calling `retry()`, it uses the provided instance directly or invokes the factory function to create a signal for the retry operation.

#### Using an AbortController

```ts
const abortController = new AbortController();

setTimeout(() => abortController.abort(), 5000);

const result = await retry(
  (attempt: number) => {
    operation();
  },
  EqualJitterBackoffStrategy,
  {
    signal: abortController.signal,
  },
);
```

#### Using AbortSignal.timeout()

You can use `AbortSignal.timeout()` for a timeout-based cancellation:

```ts
const result = await retry(
  (attempt: number) => {
    operation();
  },
  EqualJitterBackoffStrategy,
  {
    signal: AbortSignal.timeout(5000),
  },
);
```

#### Using a Signal Factory Function

You can provide a factory function that returns a new signal. The `retry()` function will invoke this factory to create a signal for the retry operation:

```ts
const result = await retry(
  (attempt: number) => {
    operation();
  },
  EqualJitterBackoffStrategy,
  {
    signal: () => AbortSignal.timeout(5000),
  },
);
```

### unrecoverableErrors

Similar to the `abortRetry` option, but instead of a callback function, you can specify an array of error types. If the error that occurred is an instance of one of the specified error types, the retry attempts will be aborted.

```ts
class UnrecoverableError extends Error {}

async function operation(): Promise<void> {
  throw new UnrecoverableError();
}

const result = await retry(
  (attempt: number) => {
    operation();
  },
  EqualJitterBackoffStrategy,
  {
    unrecoverableErrors: [UnrecoverableError],
  },
);
```

## Custom Backoff Strategy

To create a custom backoff strategy implement the `BackoffStrategy` interface.

```ts
export interface BackoffStrategy {
  getGenerator(maxRetries: number): Generator<number>;
}
```

Each backoff strategy is essentially a [generator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Generator) that returns the next delay.

Here's an example of implementing a backoff strategy that calculates the next delay based on the [Fibonacci sequence](https://en.wikipedia.org/wiki/Fibonacci_sequence). Based on the current retry attempt, the corresponding Fibonacci number is calculated and used as the delay before the next retry.

```ts
export class FibonacciBackoffStrategy implements BackoffStrategy {
  private readonly baseDelay: number;
  private prevDelay: number;
  private currentDelay: number;

  constructor({ baseDelay = 100 }: BackoffStrategyConfig = {}) {
    this.baseDelay = baseDelay;
    this.prevDelay = 0;
    this.currentDelay = 1;
  }

  *getGenerator(maxRetries: number): Generator<number> {
    let attempt = 0;
    while (attempt < maxRetries) {
      const nextDelay = this.baseDelay * this.currentDelay;
      yield nextDelay;
      const sum = this.prevDelay + this.currentDelay;
      this.prevDelay = this.currentDelay;
      this.currentDelay = sum;
      attempt += 1;
    }
  }
}
```

The maximum number of retries is passed to the `getGenerator()` function, allowing you to determine when to yield the last delay. If the generator yields fewer delays than the number of maximum retries, an error will be thrown. You can also create a generator that will keep yielding delays.

## License

This package is [MIT licensed](https://github.com/geersch/retry/blob/master/LICENSE).
