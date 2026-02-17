import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    exclude: ['tests/e2e/**'],
    testTimeout: 30000,
    hookTimeout: 30000,
    setupFiles: ['tests/helpers/setup.ts'],
  },
})
