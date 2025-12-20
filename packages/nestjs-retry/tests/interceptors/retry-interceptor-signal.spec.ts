import { FixedBackoffStrategy } from '@geersch/retry';
import type { INestApplication } from '@nestjs/common';
import { Controller, Get, UseInterceptors } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { RetryInterceptor } from '../../lib/index.js';

@Controller('retry')
class TestController {
  private attempts1 = 0;

  @Get('/resource1')
  @UseInterceptors(
    new RetryInterceptor(new FixedBackoffStrategy({ baseDelay: 100 }), {
      maxRetries: 10,
      // Each request should timeout independently around 250ms
      signal: () => AbortSignal.timeout(250),
    }),
  )
  getWithAbortSignal() {
    this.attempts1 += 1;
    throw new Error('Oops!');
  }
}

describe('RetryInterceptor with AbortSignal', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const testingModule = await Test.createTestingModule({
      controllers: [TestController],
    }).compile();
    app = testingModule.createNestApplication();
    app.useLogger(false);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should abort retries when signal times out', async () => {
    const startTime = Date.now();

    const response = await request(app.getHttpServer()).get('/retry/resource1');

    const duration = Date.now() - startTime;

    expect(response.status).toBe(500);

    expect(duration).toBeBetween(200, 300);
  });

  it('should create a new abort signal for each request using signal factory', async () => {
    // With signal as a factory function, each request gets its own AbortSignal
    // This test verifies that concurrent requests each have their own timeout

    const durations: number[] = [];

    let start = Date.now();
    const response1 = await request(app.getHttpServer()).get('/retry/resource1');
    durations.push(Date.now() - start);

    start = Date.now();
    const response2 = await request(app.getHttpServer()).get('/retry/resource1');
    durations.push(Date.now() - start);

    start = Date.now();
    const response3 = await request(app.getHttpServer()).get('/retry/resource1');
    durations.push(Date.now() - start);

    expect(response1.status).toBe(500);
    expect(response2.status).toBe(500);
    expect(response3.status).toBe(500);

    expect(durations[0]).toBeBetween(200, 300);
    expect(durations[1]).toBeBetween(200, 300);
    expect(durations[2]).toBeBetween(200, 300);
  });
});
