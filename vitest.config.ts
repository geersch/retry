import swc from 'unplugin-swc';
import { defineConfig } from 'vitest/config';
import { resolve } from 'node:path';

// Are we debugging?
const timeout = process.env.VITEST_VSCODE ? 600_000 : 5000;

export default defineConfig({
  test: {
    projects: [
      /**
       * Packages
       */
      {
        extends: true,
        test: {
          name: 'packages/retry',
          root: 'packages/retry',
        },
      },
      {
        extends: true,
        test: {
          name: 'packages/nestjs-retry',
          root: 'packages/nestjs-retry',
        },
        plugins: [
          swc.vite({
            module: { type: 'es6' },
            jsc: {
              transform: {
                useDefineForClassFields: false,
              },
            },
          }),
        ],
      },
    ],

    // Shared configuration
    globals: true,
    root: './',
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
    setupFiles: [resolve(__dirname, './tests/setup.ts')],
    alias: {
      '@geersch/retry': resolve(__dirname, './packages/retry/lib/index'),
    },
  },
});
