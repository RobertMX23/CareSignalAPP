import { defineConfig } from 'vitest/config';

// Pruebas de Firestore Security Rules (B-01). Corren dentro de `firebase emulators:exec`
// (ver script `test:rules`); el emulador expone FIRESTORE_EMULATOR_HOST.
export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/rules/**/*.test.ts'],
    testTimeout: 20_000,
    hookTimeout: 30_000,
  },
});
