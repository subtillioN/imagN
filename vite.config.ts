import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  server: {
    port: 3000,
    host: true
  },
  build: {
    target: 'esnext',
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'cycle-core': ['@cycle/run', '@cycle/dom', '@cycle/state'],
          'callbag-core': ['callbag-basics', 'callbag-from-obs', 'callbag-to-obs']
        }
      }
    }
  }
});