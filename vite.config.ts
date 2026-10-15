/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    include: ['tests/**/*.test.{ts,tsx}'],
    // Las pruebas de Firestore Rules requieren el emulador: corren con `npm run test:rules`.
    exclude: ['**/node_modules/**', '**/dist/**', 'tests/rules/**'],
  },
});
