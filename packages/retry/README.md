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

If an error occurs during the `operation()` it will be retried using the `EqualJitterBackoffStrategy`.

You can pass the type of backoff strategy to use, in which case it will be instantiated for you, using its default base delay, or you can instantiate it yourself and override the base delay.

```ts
const result = await retry((attempt: number) => {
  operation();
}, new EqualJitterBackoffStrategy({ baseDelay: 200 }));
```

The current attempt is passed as a parameter to the retried function. The maximum number of retries can be passed to the backoff strategy. If the maximum is 5, then the function will be executed a maximum number of 6 times (1 initial call + 5 retries).

## Backoff Strategies

Out the box, the following backoff strategies are supported:

- DecorrelatedJitterBackoffStrategy
- EqualJitterBackoffStrategy
- ExponentialBackoffStrategy
- FixedBackoffStrategyConfig
- FullJitterBackOffStrategy
- LinearBackoffStrategy

Each backoff strategy has a default base delay of `100` ms. This is the intial delay time that sets the baseline.

### DecorrelatedJitterBackoffStrategy

Similar to the full jitter backoff strategy, but it increases the maximum jitter based on the last calculated delay.

For example, with a base delay of `100` ms:

- A final delay between `0` and ±`137.72` ms is calculated for retry `1`.
- A final delay between `100` and ±`146.01` ms is calculated for retry `2`.
- A final delay between `100` and ±`286.58` ms is calculated for retry `3`.
- ...

By default the `DecorrelatedJitterBackoffStrategy` uses a base delay of `100` ms.

```ts
const result = await retry((attempt: number) => {
  operation();
}, DecorrelatedJitterBackoffStrategy);
```

The default base delay of `100ms` can be overridden.

```ts
const result = await retry((attempt: number) => {
  operation();
}, new DecorrelatedJitterBackoffStrategy({ baseDelay: 200 }));
```

### EqualJitterBackoffStrategy

Uses an equal jitter for computing the delay before the next retry. First an exponential delay is calculated based on the current retry attempt and configured base delay.

For example, with a base delay of `100` ms:

- An exponential delay of `200` ms is calculated for retry `1`.
- An exponential delay of `400` ms is calculated for retry `2`.
- An exponential delay of `800` ms is calculated for retry `3`.
- ...

Half of this exponential delay is kept and a random value (jitter) between 0 and half of the exponential delay plus one is added.

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

The default base delay of `100ms` can be overridden.

```ts
const result = await retry((attempt: number) => {
  operation();
}, new EqualJitterBackoffStrategy({ baseDelay: 200 }));
```

### ExponentialBackoffStrategy

Calculates an exponential delay based on the current retry attempt and configured base delay.

For example, with a base delay of `100` ms:

- An exponential delay of `200` ms is calculated for retry `1`.
- An exponential delay of `400` ms is calculated for retry `2`.
- An exponential delay of `800` ms is calculated for retry `3`.
- ...

By default the `ExponentialBackoffStrategy` uses a base delay of `100` ms.

```ts
const result = await retry((attempt: number) => {
  operation();
}, ExponentialBackoffStrategy);
```

The default base delay of `100ms` can be overridden.

```ts
const result = await retry((attempt: number) => {
  operation();
}, new ExponentialBackoffStrategy({ baseDelay: 200 }));
```

### FixedBackoffStrategy

Uses the same delay between every retry attempt. By default the `FixedBackoffStrategyConfig` uses a base delay of `100` ms. As the name suggests, the delay is fixed. The configured base delay will be used for all attempts.

```ts
const result = await retry((attempt: number) => {
  operation();
}, FixedBackoffStrategyConfig);
```

The default base delay of `100ms` can be overridden.

```ts
const result = await retry((attempt: number) => {
  operation();
}, new FixedBackoffStrategyConfig({ baseDelay: 100 }));
```

### FullJitterBackOffStrategy

Uses a full jitter for computing the delay before the next retry. First an exponential delay is calculated based on the current retry attempt and configured base delay.

For example, with a base delay of `100` ms:

- An exponential delay of `200` ms is calculated for retry `1`.
- An exponential delay of `400` ms is calculated for retry `2`.
- An exponential delay of `800` ms is calculated for retry `3`.
- ...

Then a random delay between `0` and this exponential delay is taken.

- A final delay between `0` and `200` ms is calculated for retry `1`.
- A final delay between `0` and `400` ms is calculated for retry `2`.
- A final delay between `0` and `800` ms is calculated for retry `3`.
- ...

By default the `FullJitterBackOffStrategy` uses a base delay of `100` ms.

```ts
const result = await retry((attempt: number) => {
  operation();
}, FullJitterBackOffStrategy);
```

The default base delay of `100ms` can be overridden.

```ts
const result = await retry((attempt: number) => {
  operation();
}, new FullJitterBackOffStrategy({ baseDelay: 200 }));
```

### LinearBackoffStrategy

Multiplies the base delay with the current retry attempt to calculate the delay before the next retry.

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

The default base delay of `100ms` can be overridden.

```ts
const result = await retry((attempt: number) => {
  operation();
}, new LinearBackoffStrategy({ baseDelay: 200 }));
```

## Retry Options

Apart from a backoff strategy you can also pass optional retry options as a third parameter.

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

A synchronous callback function that is executed before every retry attempt. It is passed the error that occured and the current retry attempt. Return `true` if you want to abort or `false` too keep trying.

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

To clamp the delay calculated by the backoff strategy use the `maxDelay` option. It defaults to `30000` milliseconds.

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

The following example will execute the `operation()` a maximum number of `4` times. Once for the initial invocation plus a maximum of `3` retries.

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

Certain strategies can quickly lead to long delays between retry attempts. To offset this, while still retaining the curve between retry attemps, you can specify a `scaleFactor`. It can be used to reduce or increase the calculated delay.

For example, a `scaleFactor` of `0.5` will half the computed delay, but a `scaleFactor` of `2` will double it.

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

### unrecoverableErrors

Similar to the `abortRetry` option, but instead of a callback function you can specify an array of error types. If the error that occurred is an instance of one of the specified error the retry attempts will be aborted.

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

Each backoff strategy is basically a [generator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Generator) that returns the next delay.

Here's an example to implement a backoff strategy that calculates the next delay based on the [Fibonacci sequence](https://en.wikipedia.org/wiki/Fibonacci_sequence). Based on the current retry atttempt the matching Fibonacci number is calculated and used as the delay before the next retry.

```ts
export class FibonacciBackoffStrategy implements BackoffStrategy {
  private readonly baseDelay: number;

  constructor({ baseDelay = 100 }: BackoffStrategyConfig = {}) {
    this.baseDelay = baseDelay;
  }

  *getGenerator(): Generator<number> {
    let attempt = 1;
    while (true) {
      const sequence = [0, 1];
      for (let i = 2; i <= attempt; i++) {
        sequence[i] = sequence[i - 2] + sequence[i - 1];
      }
      yield sequence[attempt] * this.baseDelay;
      attempt += 1;
    }
  }
}
```

This example shows a generator that will keep yielding delays. The maximum number of retries is passed to the `getGenerator()` function allowing you to determine when to yield the last delay. If the generator yields less delays that the number of maximum retries an error will be thrown.

## License

This package is [MIT licensed](https://github.com/geersch/retry/blob/master/LICENSE).
