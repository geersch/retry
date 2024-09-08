/* eslint-disable @typescript-eslint/no-empty-object-type */
import { expect } from 'vitest';
import * as matchers from '.';

expect.extend(matchers);

interface CustomMatchers<R = unknown> {
  toBeBetween: (min: number, max: number) => R;
}

declare module 'vitest' {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  interface Assertion<T = any> extends CustomMatchers<T> {}
  interface AsymmetricMatchersContaining extends CustomMatchers {}
}
