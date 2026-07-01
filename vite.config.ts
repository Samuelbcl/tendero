import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  // Rapier est un module WASM ; on l'exclut de l'optimisation deps de Vite.
  optimizeDeps: { exclude: ['@dimforge/rapier3d-compat'] },
});
