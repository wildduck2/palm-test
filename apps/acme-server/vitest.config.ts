import path from 'node:path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    alias: {
      '~': path.resolve(__dirname, 'src'),
    },
  },
  test: {
    coverage: {
      reporter: ['text', 'html'],
    },
    environment: 'node',
    globals: true,
    include: ['./**/*.test.ts'],
  },
})
