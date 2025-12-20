## @geersch/nestjs-retry

## Description

A [NestJS interceptor](https://docs.nestjs.com/interceptors) to easily apply the retry utility function of the [@geersch/retry](../retry/README.md) package to an endpoint.

## Installation

```sh
$ yarn add @geersch/nestjs-retry
```

## Usage

Use the `@UseInterceptors` decorator imported from the `@nestjs/common` package to set up the interceptor. The interceptor can be controller-scoped, method-scoped, or global-scoped. Please refer to the [NestJS documentation](https://docs.nestjs.com/interceptors#binding-interceptors) for all the options on how to bind interceptors.

```ts
@UseInterceptors(RetryInterceptor)
export class CatsController {}
```

Using the above notation, each route handler defined in `CatsController` will use the `RetryInterceptor`, which uses the `EqualJitterBackoffStrategy` backoff strategy by default. Alternatively, you can instantiate the `RetryInterceptor` yourself and pass the desired type of backoff strategy.

```ts
@UseInterceptors(new RetryInterceptor(FullJitterBackOffStrategy))
export class CatsController {}
```

Instead of passing the type of the backoff strategy you can also instantiate it and override its default base delay.

```ts
@UseInterceptors(
  new RetryInterceptor(
    new EqualJitterBackoffStrategy({
      baseDelay: 100,
    }),
  ),
)
export class CatsController {}
```

You can also specify the [RetryOptions](../retry/README.md) supported by the retry utility function.

```ts
class UnrecoverableError extends Error {}

@UseInterceptors(
  new RetryInterceptor(
    new EqualJitterBackoffStrategy({
      baseDelay: 100,
    }),
    {
      maxDelay: 5000,
      maxRetries: 3,
      scaleFactor: 2,
      abortRetry: (err: any, retryCount: number) => true,
      unrecoverableErrors: [UnrecoverableError],
    },
  ),
)
export class CatsController {}
```

### Using AbortSignal

You can use the `signal` option to cancel retry attempts. The `signal` option accepts an `AbortSignal` instance or a factory function `() => AbortSignal | null`. When the interceptor processes a request, it uses the provided instance directly or invokes the factory function to create a signal for the retry operation.

#### Shared Signal (Not Recommended)

```ts
@UseInterceptors(
  new RetryInterceptor(new FixedBackoffStrategy({ baseDelay: 100 }), {
    maxRetries: 10,
    signal: AbortSignal.timeout(5000),
  }),
)
export class CatsController {}
```

**Note:** Using a static `AbortSignal` instance means all requests to the endpoint will share the same signal. Once it times out or is aborted, it affects all subsequent requests.

#### Signal Factory (Recommended)

For HTTP endpoints, it's recommended to use a factory function. The interceptor will invoke this factory to create a fresh signal for each request:

```ts
@UseInterceptors(
  new RetryInterceptor(new FixedBackoffStrategy({ baseDelay: 100 }), {
    maxRetries: 10,
    signal: () => AbortSignal.timeout(5000),
  }),
)
export class CatsController {}
```

This ensures each HTTP request gets its own independent timeout, preventing one request's timeout from affecting others.

### Headers

The interceptor adds the `x-attempt` request header to each retry, which contains the current attempt.

```ts
@Controller('cats')
class CatsController {
  @Get()
  @UseInterceptors(new RetryInterceptor(FixedBackoffStrategy))
  findAll(@Headers('x-attempt') header: number): string {
    return 'all the cats';
  }
}
```

For more information about the retry utility function consults the [README](../retry/README.md) of the `@geersch/retry` package.

## License

This package is [MIT licensed](https://github.com/geersch/retry/blob/master/LICENSE).
