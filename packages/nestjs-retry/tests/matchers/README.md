# Custom Vitest Matchers

This directory contains custom matchers for Vitest tests, providing additional assertion capabilities for testing.

## Structure

```
matchers/
├── README.md              # This documentation
├── vitest.d.ts            # TypeScript declarations for custom matchers
└── to-be-between.ts       # Asserts a number is within an inclusive range.
```

## How It Works

### 1. Matcher Registration
Custom matchers are registered in the main test setup file (`tests/setup.ts`):

```typescript
import { toBeBetween } from './matchers/to-be-between.js';

// Centralized matcher registry
export const customMatchers = {
  toBeBetween,
  // Add future matchers here
} as const;

// Register custom matchers
expect.extend(customMatchers);
```

### 2. Test Setup
The setup file is automatically loaded by Vitest through the configuration in `vitest.config.ts`.

### 3. TypeScript Support
Type declarations are provided in `vitest.d.ts` to extend Vitest's built-in types:

```typescript
interface CustomMatchers<R = unknown> {
  toBeBetween: (min: number, max: number) => R;
}

declare module 'vitest' {
  interface Matchers<T = any> extends CustomMatchers<T> {}
}
```

## Available Matchers

### `toBeBetween(min, max)`
Asserts that a number is within a specified range (inclusive).

```typescript
expect(150).toBeBetween(100, 200); // passes
expect(50).toBeBetween(100, 200);  // fails
```

## Adding New Matchers

1. Create the matcher implementation in a new file (e.g., `to-be-close-to.ts`)
2. Import and add it to the `customMatchers` object in `tests/setup.ts`
3. Update the TypeScript declarations in `vitest.d.ts`

