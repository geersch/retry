import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

// Are we debugging?
const timeout = process.env.VITEST_VSCODE ? 600_000 : 5000;

export const baseConfig = defineConfig({
  test: {
    globals: true,
    sequence: {
      hooks: 'stack',
    },
    isolate: false,
    reporters: ['default'],
    coverage: {
      provider: 'v8',
      include: ['lib', 'src'],
      exclude: ['index.ts'],
      reporter: ['text', 'json', 'html'],
    },
    include: ['**/*.spec.ts'],
    testTimeout: timeout,
    hookTimeout: timeout,
    pool: 'forks',
    setupFiles: [fileURLToPath(new URL('./register-matchers.ts', import.meta.url))],
  },
});
