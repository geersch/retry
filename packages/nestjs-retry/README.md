## @geersch/nestjs-retry

## Description

A [NestJS interceptor](https://docs.nestjs.com/interceptors) to easily apply the retry utility function of the [@geersch/retry](../retry/README.md) package to an endpoint.

## Installation

```sh
$ yarn add @geersch/nestjs-retry
```

## Usage

Use the `@UseInterceptors` decorator imported from the `@nestjs/common` package to set up the interceptor. The interceptor can be controller-scope, method-scoped, or global-scoped. Have a look at the [NestJS documentation](https://docs.nestjs.com/interceptors#binding-interceptors) for all the options on how to bind interceptors.

```ts
@UseInterceptors(RetryInterceptor)
export class CatsController {}
```

Using the above notation, each route handler defined in `CatsController` will use the `RetryInterceptor`. By default it defaults to using the `EqualJitterBackoffStrategy` backoff strategy.

You can also instantiate the `RetryInterceptor` and pass the desired backoff strategy type.

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

The interceptor adds the `x-attempt` header to each retry, which contains the current attempt.

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
