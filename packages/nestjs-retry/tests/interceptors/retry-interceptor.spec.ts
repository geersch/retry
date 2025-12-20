import { EqualJitterBackoffStrategy, FixedBackoffStrategy } from '@geersch/retry';
import type { INestApplication } from '@nestjs/common';
import { Controller, Get, Headers, UseInterceptors } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { RetryInterceptor } from '../../lib/index.js';
import * as rxjs from 'rxjs';

const headerSpy = vi.fn();

@Controller('retry')
class TestController {
  private attempts1 = 0;
  private attempts2 = 0;
  private attempts3 = 0;
  private attempts4 = 0;

  @Get('/resource1')
  @UseInterceptors(new RetryInterceptor(new FixedBackoffStrategy({ baseDelay: 10 })))
  get() {
    this.attempts1 += 1;
    if (this.attempts1 <= 5) {
      throw new Error('Oops!');
    }
    this.attempts1 = 0;
    return { filename: 'test.pdf', url: 'https://github.com/geersch/retry/test.pdf' };
  }

  @Get('/resource2')
  @UseInterceptors(new RetryInterceptor(new FixedBackoffStrategy({ baseDelay: 10 }), { scaleFactor: 0.5 }))
  getWithOptions() {
    this.attempts2 += 1;
    if (this.attempts2 <= 5) {
      throw new Error('Oops!');
    }
    this.attempts2 = 0;
    return { filename: 'test.pdf', url: 'https://github.com/geersch/retry/test.pdf' };
  }

  @Get('/resource3')
  @UseInterceptors(new RetryInterceptor(new EqualJitterBackoffStrategy({ baseDelay: 10 })))
  getWithDefaults() {
    this.attempts3 += 1;
    if (this.attempts3 <= 5) {
      throw new Error('Oops!');
    }
    this.attempts3 = 0;
    return { filename: 'test.pdf', url: 'https://github.com/geersch/retry/test.pdf' };
  }

  @Get('/resource4')
  @UseInterceptors(new RetryInterceptor(FixedBackoffStrategy))
  retryAttemptHeader(@Headers('x-attempt') header: number) {
    headerSpy(header);

    this.attempts4 += 1;
    if (this.attempts4 <= 5) {
      throw new Error('Oops!');
    }
    this.attempts4 = 0;
    return { filename: 'test.pdf', url: 'https://github.com/geersch/retry/test.pdf' };
  }
}

describe('RetryInterceptor', () => {
  let app: INestApplication;
  let delays: number[] = [];

  beforeAll(async () => {
    const testingModule = await Test.createTestingModule({
      controllers: [TestController],
    }).compile();
    app = testingModule.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    delays = [];

    const originalTimer = rxjs.timer;
    vi.spyOn(rxjs, 'timer').mockImplementation((due) => {
      delays.push(due as number);
      return originalTimer(due);
    });

    headerSpy.mockClear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should retry the operation', async () => {
    const response = await request(app.getHttpServer()).get('/retry/resource1');

    expect(response.statusCode).toEqual(200);
    expect(response.body).toEqual({
      filename: 'test.pdf',
      url: 'https://github.com/geersch/retry/test.pdf',
    });
    expect(delays).toHaveLength(5);
    expect(delays[0]).toBe(10);
    expect(delays[1]).toBe(10);
    expect(delays[2]).toBe(10);
    expect(delays[3]).toBe(10);
    expect(delays[4]).toBe(10);
  });

  it('should retry the operation using the specified retry options (scale factor 2)', async () => {
    const response = await request(app.getHttpServer()).get('/retry/resource2');

    expect(response.statusCode).toEqual(200);
    expect(response.body).toEqual({
      filename: 'test.pdf',
      url: 'https://github.com/geersch/retry/test.pdf',
    });
    expect(delays).toHaveLength(5);
    expect(delays[0]).toBe(5);
    expect(delays[1]).toBe(5);
    expect(delays[2]).toBe(5);
    expect(delays[3]).toBe(5);
    expect(delays[4]).toBe(5);
  });

  it('should retry the operation using the default retry policy (EqualJitterBackOffStrategy)', async () => {
    const response = await request(app.getHttpServer()).get('/retry/resource3');

    expect(response.statusCode).toEqual(200);
    expect(response.body).toEqual({
      filename: 'test.pdf',
      url: 'https://github.com/geersch/retry/test.pdf',
    });
    expect(delays).toHaveLength(5);
    expect(delays[0]).toBeBetween(10, 21);
    expect(delays[1]).toBeBetween(20, 41);
    expect(delays[2]).toBeBetween(40, 81);
    expect(delays[3]).toBeBetween(80, 161);
    expect(delays[4]).toBeBetween(160, 321);
  });

  it('should pass the current attempt in the x-attempt header', async () => {
    await request(app.getHttpServer()).get('/retry/resource4');

    expect(headerSpy).toHaveBeenCalledTimes(6);

    expect(headerSpy).toHaveBeenNthCalledWith(1, 1);
    expect(headerSpy).toHaveBeenNthCalledWith(2, 2);
    expect(headerSpy).toHaveBeenNthCalledWith(3, 3);
    expect(headerSpy).toHaveBeenNthCalledWith(4, 4);
    expect(headerSpy).toHaveBeenNthCalledWith(5, 5);
    expect(headerSpy).toHaveBeenNthCalledWith(6, 6);
  });
});
