import { fileURLToPath, URL } from 'node:url';

import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import vueDevTools from 'vite-plugin-vue-devtools';

// https://vite.dev/config/
export default defineConfig({
  server: {
    port: 5174, // Đặt port trực tiếp trong server
    proxy: {
      '/api': {
        target: 'http://localhost:3000', // Chuyển hướng đến server
        changeOrigin: true,
        secure: false,
        logLevel: 'debug'
      }
    }
  },
  plugins: [vue(), vueDevTools()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
});