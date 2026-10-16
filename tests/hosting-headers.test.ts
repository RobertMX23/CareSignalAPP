/**
 * hosting-headers.test.ts — Headers de seguridad de Firebase Hosting (B-02).
 *
 * `firebase.json` define un bloque por site (`production` y `demo`) con configuración
 * duplicada. Estos tests evitan que los dos bloques se desalineen y que la CSP pierda sus
 * directivas básicas.
 *
 *   H-01  ambos targets tienen los headers de seguridad requeridos
 *   H-02  production y demo tienen exactamente los mismos headers de seguridad
 *   H-03  la CSP (enforce o report-only) trae las directivas base
 *   H-04  la CSP no permite 'unsafe-eval' ni 'unsafe-inline' en script-src ni comodines abiertos
 *   H-05  frame-ancestors 'none' es coherente con X-Frame-Options: DENY
 */

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

interface HeaderEntry {
  key: string;
  value: string;
}
interface HostingSite {
  target: string;
  headers: { source: string; headers: HeaderEntry[] }[];
}

const firebaseJson = JSON.parse(readFileSync(resolve(__dirname, '../firebase.json'), 'utf-8')) as {
  hosting: HostingSite[];
};

const REQUIRED = ['X-Frame-Options', 'X-Content-Type-Options', 'Referrer-Policy', 'Permissions-Policy'];
const CSP_KEYS = ['Content-Security-Policy', 'Content-Security-Policy-Report-Only'];

const securityHeaders = (site: HostingSite): Record<string, string> => {
  const block = site.headers.find((h) => h.source === '**');
  expect(block, `sitio ${site.target} sin bloque de headers "**"`).toBeDefined();
  return Object.fromEntries((block?.headers ?? []).map((h) => [h.key, h.value]));
};

const cspOf = (headers: Record<string, string>): string | undefined => {
  const key = CSP_KEYS.find((k) => k in headers);
  return key === undefined ? undefined : headers[key];
};

const directive = (csp: string, name: string): string | undefined =>
  csp
    .split(';')
    .map((d) => d.trim())
    .find((d) => d === name || d.startsWith(`${name} `));

describe('headers de seguridad de Hosting', () => {
  const sites = firebaseJson.hosting;

  it('H-00: hay un target production y uno demo', () => {
    expect(sites.map((s) => s.target).sort()).toEqual(['demo', 'production']);
  });

  it('H-01: headers requeridos presentes en ambos targets', () => {
    for (const site of sites) {
      const headers = securityHeaders(site);
      for (const key of REQUIRED) expect(headers, `${site.target} sin ${key}`).toHaveProperty(key);
      expect(cspOf(headers), `${site.target} sin CSP`).toBeDefined();
    }
  });

  it('H-02: production y demo no se desalinean', () => {
    const [a, b] = sites.map(securityHeaders);
    expect(a).toEqual(b);
  });

  it('H-03: la CSP trae las directivas base', () => {
    for (const site of sites) {
      const csp = cspOf(securityHeaders(site)) ?? '';
      for (const name of ['default-src', 'script-src', 'object-src', 'base-uri', 'frame-ancestors']) {
        expect(directive(csp, name), `${site.target}: falta ${name}`).toBeDefined();
      }
      expect(directive(csp, 'default-src')).toBe("default-src 'self'");
      expect(directive(csp, 'object-src')).toBe("object-src 'none'");
    }
  });

  it('H-04: sin unsafe-eval ni unsafe-inline en scripts, ni comodines abiertos', () => {
    for (const site of sites) {
      const csp = cspOf(securityHeaders(site)) ?? '';
      expect(csp).not.toContain("'unsafe-eval'");
      expect(directive(csp, 'script-src') ?? '').not.toContain("'unsafe-inline'");
      for (const name of ['default-src', 'script-src', 'connect-src', 'frame-src']) {
        const tokens = (directive(csp, name) ?? '').split(/\s+/).slice(1);
        expect(tokens, `${site.target}: ${name} con comodín abierto`).not.toContain('*');
      }
    }
  });

  it("H-05: frame-ancestors 'none' coherente con X-Frame-Options DENY", () => {
    for (const site of sites) {
      const headers = securityHeaders(site);
      expect(headers['X-Frame-Options']).toBe('DENY');
      expect(directive(cspOf(headers) ?? '', 'frame-ancestors')).toBe("frame-ancestors 'none'");
    }
  });
});
