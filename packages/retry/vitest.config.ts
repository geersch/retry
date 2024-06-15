import { defineConfig } from 'vitest/config';

export default defineConfig(() => {
  const timeout = !!process.env.VITEST_VSCODE ? 600_000 : 5000;
  return {
    test: {
      globals: true,
      root: './',
      include: ['**/*.spec.ts'],
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
  };
});
