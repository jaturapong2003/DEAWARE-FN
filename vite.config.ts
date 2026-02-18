import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      '/api/': {
        target: 'http://kkserver-x99s-d4-plus.tail1cf519.ts.net:3001',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
