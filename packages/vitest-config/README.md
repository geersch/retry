# @geersch/vitest-config

Shared Vitest configuration and custom matchers for the monorepo.

## Structure

```
vitest-config/
├── base.ts                        # Shared base Vitest config (auto-registers matchers)
├── register-matchers.ts           # Registers all custom matchers
├── matchers/
│   ├── to-be-between.ts           # Asserts a number is within an inclusive range
│   └── vitest.d.ts                # TypeScript declarations for custom matchers
└── README.md                      # This documentation
```

## Usage

In each package's `vitest.config.ts`:

```typescript
export { baseConfig as default } from '@geersch/vitest-config/base';
```

The base config automatically registers all custom matchers via `setupFiles`.

## Available Matchers

### `toBeBetween(min, max)`

Asserts that a number is within a specified range (inclusive).

```typescript
expect(150).toBeBetween(100, 200); // passes
expect(50).toBeBetween(100, 200); // fails
```

## Adding New Matchers

1. Create the matcher implementation in `matchers/` (e.g., `to-be-close-to.ts`)
2. Add the TypeScript declaration to `matchers/vitest.d.ts`
3. Import and register it in `register-matchers.ts`
