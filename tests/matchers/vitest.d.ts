/* eslint-disable @typescript-eslint/no-empty-object-type */
import 'vitest';

interface CustomMatchers<R = unknown> {
  toBeBetween: (min: number, max: number) => R;
}

// https://vitest.dev/guide/extending-matchers
declare module 'vitest' {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  interface Matchers<T = any> extends CustomMatchers<T> {}
}
