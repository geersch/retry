import { resolve } from 'path';
import swc from 'unplugin-swc';
import { defineConfig, mergeConfig } from 'vitest/config';
import sharedVitestConfig from '../../vitest.shared.js';

const unbundledState = resolve(__dirname, '../retry/lib/index');

export default defineConfig(() =>
  mergeConfig(
    sharedVitestConfig,
    defineConfig({
      test: {
        setupFiles: ['./tests/setup.ts'],
        alias: {
          '@geersch/retry': unbundledState,
        },
      },
      plugins: [
        swc.vite({
          module: { type: 'es6' },
        }),
      ],
    }),
  ),
);
