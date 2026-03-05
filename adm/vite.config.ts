import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,
    fs: {
      allow: [path.resolve(rootDir, '..')]
    }
  },
  preview: {
    port: 4174
  }
});
