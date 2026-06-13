/* oxlint-disable no-empty-object-type */
import 'vitest';

interface CustomMatchers<R = unknown> {
  toBeBetween: (min: number, max: number) => R;
}

// https://vitest.dev/guide/extending-matchers
declare module 'vitest' {
  // oxlint-disable-next-line no-explicit-any
  interface Matchers<T = any> extends CustomMatchers<T> {}
}
