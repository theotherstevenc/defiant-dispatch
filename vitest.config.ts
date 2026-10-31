import { defineConfig } from 'vitest/config'

import pkg from './package.json'

export default defineConfig({
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
  },
  test: {
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
    exclude: ['build/**'],
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    coverage: {
      exclude: ['build/**', '*.config.*', 'src/types/**', 'src/interfaces/**', 'src/vite-env.d.ts'],
    },
  },
})
