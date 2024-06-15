import type { ExpectStatic } from 'vitest';

export interface MatcherResult {
  pass: boolean;
  message: () => string;
  actual?: unknown;
  expected?: unknown;
}

export type MatcherState = ReturnType<ExpectStatic['getState']>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type CustomMatcher = (this: MatcherState, ...args: any[]) => MatcherResult;
