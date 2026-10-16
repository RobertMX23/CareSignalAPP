/** Tipos de `lighthouse-report.mjs` para las pruebas (tsc estricto, sin `any`). */

export interface LhrLike {
  lighthouseVersion?: string;
  fetchTime?: string;
  configSettings?: { formFactor?: string; throttlingMethod?: string };
  categories?: Record<string, { score: number | null } | undefined>;
  audits?: Record<string, { numericValue?: number } | undefined>;
}

export interface LighthouseSummary {
  scores: Record<string, number | null>;
  range: Record<string, [number, number] | null>;
  metrics: { id: string; label: string; value: string }[];
  runs: number;
  lighthouseVersion: string;
  formFactor: string;
  throttling: string;
  measuredAt: string | null;
  auditedPage: string;
  commit: string | null;
  runUrl: string | null;
}

export interface BadgeJson {
  schemaVersion: 1;
  label: string;
  message: string;
  color: string;
}

export const CATEGORIES: { key: string; label: string; short: string }[];
export function pickRepresentative(lhrs: LhrLike[]): LhrLike;
export function summarize(lhrs: LhrLike[], meta?: { commit?: string; runUrl?: string }): LighthouseSummary;
export function badgeJson(summary: LighthouseSummary): BadgeJson;
export function renderHtml(summary: LighthouseSummary): string;
