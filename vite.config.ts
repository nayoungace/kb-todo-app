import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { tanstackRouter } from '@tanstack/router-plugin/vite'

export default defineConfig({
  plugins: [
    // 라우트 트리 코드젠은 react 플러그인보다 먼저 실행되어야 한다.
    tanstackRouter({
      target: 'react',
      routesDirectory: './src/routes',
      generatedRouteTree: './src/routeTree.gen.ts',
      autoCodeSplitting: true,
    }),
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: false,
    // 라우터와 MSW 를 함께 띄우는 통합 테스트는 단독 실행 시 2~3초면 끝나지만,
    // 전체 스위트를 병렬로 돌리면 기본값 5초를 넘겨 간헐적으로 실패한다.
    testTimeout: 15_000,
  },
})
