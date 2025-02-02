import { defineConfig } from 'vitest/config';

// Are we debugging?
const timeout = process.env.VITEST_VSCODE ? 600_000 : 5000;

export default defineConfig({
  test: {
    globals: true,
    root: './',
    include: ['**/*.spec.ts'],
    reporters: [['default', { summary: false }]],
    isolate: false,
    poolOptions: {
      threads: {
        useAtomics: true,
      },
    },
    testTimeout: timeout,
    hookTimeout: timeout,
  },
});
