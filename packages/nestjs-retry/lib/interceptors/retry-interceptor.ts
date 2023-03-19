import { BackoffStrategy, EqualJitterBackoffStrategy, passRetryOperatorToPipe, RetryOptions } from '@geersch/retry';
import { CallHandler, ExecutionContext, NestInterceptor, Optional, Type } from '@nestjs/common';
import { tap } from 'rxjs';

export class RetryInterceptor implements NestInterceptor {
  private readonly backoffStrategy: Type<BackoffStrategy> | BackoffStrategy;

  constructor(
    @Optional() backoffStrategy: Type<BackoffStrategy> | BackoffStrategy = EqualJitterBackoffStrategy,
    @Optional() private readonly retryOptions: RetryOptions = {},
  ) {
    this.backoffStrategy = backoffStrategy;
  }

  intercept(context: ExecutionContext, next: CallHandler) {
    let attempt = 1;

    this.setRetryAttemptHeader(context, attempt);

    return passRetryOperatorToPipe(
      next.handle().pipe(
        tap({
          error: () => {
            attempt += 1;
            this.setRetryAttemptHeader(context, attempt);
          },
        }),
      ),
      this.backoffStrategy,
      this.retryOptions,
    );
  }

  private setRetryAttemptHeader(context: ExecutionContext, attempt: number): void {
    if (context.getType() === 'http') {
      const httpContext = context.switchToHttp();
      const req = httpContext.getRequest();
      req.headers['x-attempt'] = attempt;
    }
  }
}
