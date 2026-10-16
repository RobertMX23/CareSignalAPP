#!/usr/bin/env node
/**
 * set-user-claims.mjs — Asigna (o quita) los custom claims de un usuario de Firebase Auth.
 *
 * Por qué existe: `functions/src/auth/setUserClaims.ts` solo corre al CREAR un usuario. Las
 * cuentas que ya existían (p. ej. el primer login de Google antes de provisionar el staff)
 * se quedan sin claims y la app les muestra "sin acceso". Este script los fija a mano.
 *
 * Sin dependencias: usa tu sesión de `gcloud` (gcloud auth login) y la API REST de
 * Identity Toolkit. NO imprime tokens.
 *
 * Es DRY-RUN por defecto: muestra el cambio y no escribe nada. Añade --apply para aplicarlo.
 *
 * Uso:
 *   node scripts/set-user-claims.mjs --email persona@correo.com --role supervisor \
 *        --staff staff-supervisor-01                      # dry-run
 *   node scripts/set-user-claims.mjs --email persona@correo.com --role supervisor \
 *        --staff staff-supervisor-01 --apply              # aplica
 *   node scripts/set-user-claims.mjs --email persona@correo.com --clear --apply   # quita claims
 *
 * Opciones: --residencia (default residencia-demo-01), --project (default caresignal-mvp-2026).
 * Tras aplicar, la persona debe cerrar sesión y volver a entrar (la app refresca el token).
 */

import { spawnSync } from 'node:child_process';

const ROLES = ['caregiver', 'supervisor', 'manager', 'demo_admin'];

const args = process.argv.slice(2);
const flag = (name) => args.includes(`--${name}`);
const opt = (name, fallback) => {
  const i = args.indexOf(`--${name}`);
  return i !== -1 && i + 1 < args.length && !args[i + 1].startsWith('--') ? args[i + 1] : fallback;
};

/** Error esperado (validación o API): se muestra sin traza y termina con código 1. */
class UsageError extends Error {}
const fail = (message) => {
  throw new UsageError(message);
};

const getToken = () => {
  const r = spawnSync('gcloud auth print-access-token', { encoding: 'utf-8', shell: true });
  if (r.status !== 0 || !r.stdout.trim()) fail('No pude obtener token: ejecuta `gcloud auth login` primero.');
  return r.stdout.trim();
};

async function main() {
  const email = opt('email');
  const project = opt('project', 'caresignal-mvp-2026');
  const residenciaId = opt('residencia', 'residencia-demo-01');
  const role = opt('role');
  const staffId = opt('staff');
  const clear = flag('clear');
  const apply = flag('apply');

  if (!email) fail('Falta --email.');
  if (!clear) {
    if (!role) fail('Falta --role (o usa --clear).');
    if (!ROLES.includes(role)) fail(`Rol inválido "${role}". Válidos: ${ROLES.join(', ')}.`);
    if (!staffId) fail('Falta --staff (ID de personal, p. ej. staff-supervisor-01).');
  }

  const token = getToken();
  const base = `https://identitytoolkit.googleapis.com/v1/projects/${project}`;
  const call = async (path, body) => {
    const res = await fetch(`${base}/${path}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'x-goog-user-project': project,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    const json = await res.json();
    if (!res.ok) fail(`${path}: ${json.error?.message ?? res.status}`);
    return json;
  };

  const lookup = await call('accounts:lookup', { email: [email] });
  const user = lookup.users?.[0];
  if (!user) fail(`No existe un usuario con ese correo en el proyecto ${project}.`);

  const current = user.customAttributes ? JSON.parse(user.customAttributes) : null;
  const next = clear ? {} : { role, residenciaId, staffId };

  console.log(`Proyecto : ${project}`);
  console.log(`Usuario  : ${email} (uid ${user.localId})`);
  console.log(`Claims   : ${current ? JSON.stringify(current) : '(ninguno)'}`);
  console.log(`Nuevos   : ${clear ? '(se quitan todos)' : JSON.stringify(next)}`);

  if (!apply) {
    console.log('\nDRY-RUN: no se escribió nada. Añade --apply para aplicar el cambio.');
    return;
  }

  await call('accounts:update', { localId: user.localId, customAttributes: JSON.stringify(next) });

  const verify = await call('accounts:lookup', { localId: [user.localId] });
  const after = verify.users?.[0]?.customAttributes;
  console.log(`\n✔ Aplicado. Claims ahora: ${after ?? '(ninguno)'}`);
  console.log('La persona debe cerrar sesión y volver a entrar para que la app los lea.');
}

try {
  await main();
} catch (error) {
  console.error(`✖ ${error instanceof UsageError ? error.message : error}`);
  process.exitCode = 1;
}
