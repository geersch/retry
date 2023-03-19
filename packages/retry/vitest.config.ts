/// <reference types="vitest" />
import { defineConfig } from 'vite';

export default defineConfig({
  test: {
    coverage: {
      exclude: ['**/index.ts', 'tests'],
      reporter: ['text', 'html'],
    },
    reporters: 'default',
    include: ['**/*.spec.ts'],
  },
});
