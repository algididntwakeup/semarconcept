/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: '0.0.0.0',
    strictPort: true,
    allowedHosts: [
      'reksolindo.opuschamber.com',
    ],
    watch: {
      usePolling: process.env.CHOKIDAR_USEPOLLING === 'true',
      interval: Number(process.env.CHOKIDAR_INTERVAL || 1000),
      // Directory-level patterns (no trailing /**) matter: chokidar only skips
      // descending into a directory when the directory itself matches. With
      // polling enabled, a content-only glob like '**/node_modules/**' still
      // makes the watcher stat all ~78k files under node_modules every tick.
      ignored: [
        '**/node_modules',
        '**/.git',
        '**/dist',
        '**/coverage',
        '**/.pnpm-store',
        '**/.next',
      ],
    },
    proxy: {
      '/api': {
        target: process.env.VITE_DEV_PROXY_TARGET || 'http://localhost:4072',
        changeOrigin: true,
        timeout: 600000,
        proxyTimeout: 600000,
      },
      '/ws': {
        target: process.env.VITE_DEV_PROXY_TARGET || 'http://localhost:4072',
        changeOrigin: true,
        ws: true,
      },
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/setupTests.ts'],
    css: false,
  }
});
