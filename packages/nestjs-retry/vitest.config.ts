import { resolve } from 'path';
import swc from 'unplugin-swc';
import { defineConfig } from 'vitest/config';

const unbundledState = resolve(__dirname, '../retry/lib/index');

export default defineConfig(() => {
  const timeout = !!process.env.VITEST_VSCODE ? 600_000 : 5000;
  return {
    test: {
      globals: true,
      root: './',
      include: ['**/*.spec.ts'],
      setupFiles: ['./tests/matchers/register-matchers.ts'],
      alias: {
        '@geersch/retry': unbundledState,
      },
      reporters: 'basic',
      isolate: false,
      poolOptions: {
        threads: {
          useAtomics: true,
        },
      },
      testTimeout: timeout,
      hookTimeout: timeout,
    },
    plugins: [
      swc.vite({
        module: { type: 'es6' },
      }),
    ],
  };
});
