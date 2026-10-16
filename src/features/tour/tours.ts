/**
 * tours.ts — Definición de los recorridos guiados por rol (L-05 / B-08).
 *
 * Solo datos: cada paso indica en qué ruta ocurre, qué elemento resaltar
 * (`data-tour="..."`) y qué decir. No contiene lógica de negocio ni toca el dominio.
 *
 * Todos parten de `resetDemo()` y usan la semilla determinista, que ya trae alertas en
 * cada estado (alert-01 abierta, alert-04 en verificación, alert-05 resuelta), de modo
 * que el camino feliz siempre tiene algo que hacer. Texto sin lenguaje médico: el
 * producto es un MVP operacional con datos ficticios.
 */

import type { Role } from '../../domain/taxonomy';

export interface TourStep {
  /** Identificador estable del paso (útil para pruebas). */
  id: string;
  /** Ruta de la app donde ocurre el paso (HashRouter, sin `#`). */
  route: string;
  /** Valor de `data-tour` del elemento a resaltar; sin él, el paso se muestra centrado. */
  target?: string;
  title: string;
  body: string;
}

export type TourRole = 'caregiver' | 'supervisor' | 'manager';

const CLOSING_BODY =
  'MVP operacional, no dispositivo médico. Los datos son ficticios y puedes restablecerlos ' +
  'cuando quieras con "Restablecer demo". Prueba otro perfil desde "Cerrar sesión".';

const CAREGIVER_TOUR: TourStep[] = [
  {
    id: 'caregiver-list',
    route: '/mis-rondas',
    target: 'rounds-list',
    title: 'Tus rondas del turno',
    body: 'Aquí ves las rondas asignadas a ti, con su estado y hora límite. Es tu punto de partida en cada turno.',
  },
  {
    id: 'caregiver-start',
    route: '/mis-rondas',
    target: 'round-start',
    title: 'Inicia una ronda',
    body: 'Cuando una ronda está por vencer aparece "Iniciar". Un clic registra quién la empezó y a qué hora.',
  },
  {
    id: 'caregiver-complete',
    route: '/mis-rondas',
    target: 'round-complete',
    title: 'Complétala',
    body: 'Al terminar, registra el resultado con "Completar". Una ronda normal se cierra en tres acciones o menos.',
  },
  {
    id: 'caregiver-support',
    route: '/mis-rondas',
    target: 'round-support',
    title: 'Pide apoyo si lo necesitas',
    body: '"Apoyo" crea una alerta amarilla o roja para que tu supervisor atienda el evento que requiere verificación.',
  },
  {
    id: 'caregiver-dashboard',
    route: '/dashboard',
    target: 'dashboard-main',
    title: 'El semáforo se actualiza',
    body: 'El color de cada residente se calcula a partir de sus rondas y alertas; nunca se guarda a mano.',
  },
  { id: 'caregiver-end', route: '/dashboard', title: 'Eso es todo', body: CLOSING_BODY },
];

const SUPERVISOR_TOUR: TourStep[] = [
  {
    id: 'supervisor-dashboard',
    route: '/dashboard',
    target: 'dashboard-main',
    title: 'Tu tablero',
    body: 'Un vistazo al estado de la residencia: rondas vencidas, alertas activas y personal disponible.',
  },
  {
    id: 'supervisor-alerts',
    route: '/alertas',
    target: 'alert-list',
    title: 'Alertas activas',
    body: 'Cada fila es un evento que requiere verificación. Abre una para ver su detalle y actuar.',
  },
  {
    id: 'supervisor-act',
    route: '/alertas/alert-01',
    target: 'alert-actions',
    title: 'Reconoce y asigna',
    body: 'Esta alerta está abierta. Puedes reconocerla y asignarla a una persona; la asignación anterior queda en el historial.',
  },
  {
    id: 'supervisor-resolve',
    route: '/alertas/alert-04',
    target: 'alert-actions',
    title: 'Verifica y resuelve',
    body: 'Esta alerta ya está en verificación. Registra el resultado para resolverla: no se puede resolver sin un resultado.',
  },
  {
    id: 'supervisor-audit',
    route: '/alertas/alert-04',
    target: 'alert-timeline',
    title: 'Todo queda auditado',
    body: 'Cada acción registra quién, cuándo y qué. La línea de tiempo es de solo lectura.',
  },
  { id: 'supervisor-end', route: '/alertas/alert-04', title: 'Eso es todo', body: CLOSING_BODY },
];

const MANAGER_TOUR: TourStep[] = [
  {
    id: 'manager-dashboard',
    route: '/dashboard',
    target: 'dashboard-main',
    title: 'Vista ejecutiva',
    body: 'Resumen operativo de la residencia para tomar decisiones sin entrar al detalle de cada ronda.',
  },
  {
    id: 'manager-metrics',
    route: '/metricas',
    target: 'metrics-kpis',
    title: 'Indicadores del turno',
    body: 'Cinco indicadores clave del turno actual, calculados con las rondas y alertas del día.',
  },
  {
    id: 'manager-audit',
    route: '/bitacora',
    target: 'audit-log',
    title: 'Bitácora de auditoría',
    body: 'El registro completo de acciones. Es append-only: no se edita ni se borra desde la aplicación.',
  },
  {
    id: 'manager-close',
    route: '/alertas/alert-05',
    target: 'alert-actions',
    title: 'Cierra el ciclo',
    body: 'Esta alerta ya fue resuelta con un resultado. Solo gerencia puede cerrarla; cerrar exige haber resuelto antes.',
  },
  { id: 'manager-end', route: '/alertas/alert-05', title: 'Eso es todo', body: CLOSING_BODY },
];

const TOURS: Record<TourRole, TourStep[]> = {
  caregiver: CAREGIVER_TOUR,
  supervisor: SUPERVISOR_TOUR,
  manager: MANAGER_TOUR,
};

/** Recorrido para un rol; `demo_admin` no tiene recorrido propio. */
export const getTourForRole = (role: Role): TourStep[] | undefined =>
  role === 'caregiver' || role === 'supervisor' || role === 'manager' ? TOURS[role] : undefined;

export const ALL_TOURS: Readonly<Record<TourRole, TourStep[]>> = TOURS;
