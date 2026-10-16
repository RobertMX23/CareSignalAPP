import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  retries: 1,
  reporter: 'list',

  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      // Chromium cubre Chrome y Edge (mismo motor Blink) — única plataforma target
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: true,
    timeout: 30_000,
    // Modo invitado con entrada directa: equivale a la demo v0.1.0 (sin pantalla de login).
    // VITE_FIREBASE_API_KEY vacío evita que un .env local active Google durante los tests.
    env: {
      VITE_ACCESS_MODE: 'guest',
      VITE_GUEST_ENTRY: 'auto',
      // El recorrido guiado no arranca solo; qa-tour.spec.ts lo inicia con "Ver recorrido".
      VITE_TOUR_AUTOSTART: 'off',
      VITE_FIREBASE_API_KEY: '',
    },
  },
});
