import { FixedBackoffStrategy } from '@geersch/retry';
import { expect } from '@jest/globals';
import { Controller, Get, Headers, INestApplication, Module, UseInterceptors } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { RetryInterceptor } from '../../lib';

const timerSpy: jest.Mock = jest.fn();
const headerSpy: jest.Mock = jest.fn();

jest.mock('rxjs', () => {
  const originalModule = jest.requireActual('rxjs');

  return {
    ...originalModule,
    timer: (due: number) => {
      timerSpy(due);
      return Promise.resolve();
    },
  };
});

@Controller('retry')
class TestController {
  private attempts1 = 0;
  private attempts2 = 0;
  private attempts3 = 0;
  private attempts4 = 0;

  @Get('/resource1')
  @UseInterceptors(new RetryInterceptor(FixedBackoffStrategy))
  get() {
    this.attempts1 += 1;
    if (this.attempts1 <= 5) {
      throw new Error('Oops!');
    }
    this.attempts1 = 0;
    return { filename: 'test.pdf', url: 'https://github.com/geersch/retry/test.pdf' };
  }

  @Get('/resource2')
  @UseInterceptors(new RetryInterceptor(FixedBackoffStrategy, { scaleFactor: 2 }))
  getWithOptions() {
    this.attempts2 += 1;
    if (this.attempts2 <= 5) {
      throw new Error('Oops!');
    }
    this.attempts2 = 0;
    return { filename: 'test.pdf', url: 'https://github.com/geersch/retry/test.pdf' };
  }

  @Get('/resource3')
  @UseInterceptors(RetryInterceptor)
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

@Module({
  controllers: [TestController],
})
class TestingModule {}

describe('RetryInterceptor', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const testingModule = await Test.createTestingModule({
      imports: [TestingModule],
    }).compile();
    app = testingModule.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    timerSpy.mockRestore();
    await app.close();
  });

  beforeEach(() => {
    timerSpy.mockClear();
    headerSpy.mockClear();
  });

  it('should retry the operation', async () => {
    const response = await request(app.getHttpServer()).get('/retry/resource1');

    expect(response.statusCode).toEqual(200);
    expect(response.body).toEqual({
      filename: 'test.pdf',
      url: 'https://github.com/geersch/retry/test.pdf',
    });
    expect(timerSpy).toHaveBeenCalledTimes(5);
    expect(timerSpy).toHaveBeenNthCalledWith(1, 100);
    expect(timerSpy).toHaveBeenNthCalledWith(2, 100);
    expect(timerSpy).toHaveBeenNthCalledWith(3, 100);
    expect(timerSpy).toHaveBeenNthCalledWith(4, 100);
    expect(timerSpy).toHaveBeenNthCalledWith(5, 100);
  });

  it('should retry the operation using the specified retry options (scale factor 2)', async () => {
    const response = await request(app.getHttpServer()).get('/retry/resource2');

    expect(response.statusCode).toEqual(200);
    expect(response.body).toEqual({
      filename: 'test.pdf',
      url: 'https://github.com/geersch/retry/test.pdf',
    });
    expect(timerSpy).toHaveBeenCalledTimes(5);
    expect(timerSpy).toHaveBeenNthCalledWith(1, 200);
    expect(timerSpy).toHaveBeenNthCalledWith(2, 200);
    expect(timerSpy).toHaveBeenNthCalledWith(3, 200);
    expect(timerSpy).toHaveBeenNthCalledWith(4, 200);
    expect(timerSpy).toHaveBeenNthCalledWith(5, 200);
  });

  it('should retry the operation using the default retry policy (EqualJitterBackOffStrategy)', async () => {
    const response = await request(app.getHttpServer()).get('/retry/resource3');

    expect(response.statusCode).toEqual(200);
    expect(response.body).toEqual({
      filename: 'test.pdf',
      url: 'https://github.com/geersch/retry/test.pdf',
    });
    expect(timerSpy).toHaveBeenCalledTimes(5);
    expect(timerSpy).toHaveBeenNthCalledWith(1, expect.toBeBetween(100, 201));
    expect(timerSpy).toHaveBeenNthCalledWith(2, expect.toBeBetween(200, 401));
    expect(timerSpy).toHaveBeenNthCalledWith(3, expect.toBeBetween(400, 801));
    expect(timerSpy).toHaveBeenNthCalledWith(4, expect.toBeBetween(800, 1601));
    expect(timerSpy).toHaveBeenNthCalledWith(5, expect.toBeBetween(1600, 3201));
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
