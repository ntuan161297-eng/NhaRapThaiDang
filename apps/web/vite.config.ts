import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';
import { fileURLToPath } from 'url';

const currentDir = typeof import.meta.dirname !== 'undefined' 
  ? import.meta.dirname 
  : path.dirname(fileURLToPath(import.meta.url));

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(currentDir, './src'),
      '@thai-dang/shared': path.resolve(currentDir, '../../packages/shared/src'),
    },
  },
  server: {
    port: 5173,
    host: true,
  },
});
