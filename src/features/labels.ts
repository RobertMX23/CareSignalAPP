import type {
  AlertSeverity,
  AlertStatus,
  IncidentStatus,
  RoundOutcome,
  RoundStatus,
  RoundType,
  VerificationOutcome,
} from '../domain/taxonomy';

export const ROUND_TYPE_LABEL: Record<RoundType, string> = {
  routine_check:            'Revisión de rutina',
  hydration_check:          'Control de hidratación',
  mobility_assistance:      'Asistencia de movilidad',
  meal_assistance:          'Asistencia de comida',
  custom_operational_check: 'Verificación operacional',
};

export const ROUND_STATUS_LABEL: Record<RoundStatus, string> = {
  scheduled:   'Programada',
  due:         'Próxima a vencer',
  in_progress: 'En curso',
  completed:   'Completada',
  overdue:     'Vencida',
  cancelled:   'Cancelada',
};

export const ALERT_STATUS_LABEL: Record<AlertStatus, string> = {
  open:            'Abierta',
  acknowledged:    'Reconocida',
  assigned:        'Asignada',
  escalated:       'Escalada',
  in_verification: 'En verificación',
  resolved:        'Resuelta',
  closed:          'Cerrada',
};

export const ALERT_SEVERITY_LABEL: Record<AlertSeverity, string> = {
  yellow: 'Amarilla',
  red:    'Roja',
};

export const INCIDENT_STATUS_LABEL: Record<IncidentStatus, string> = {
  open:                    'Abierto',
  verification_in_progress: 'Verificación en progreso',
  resolved:                'Resuelto',
  closed:                  'Cerrado',
};

export const VERIFICATION_OUTCOME_LABEL: Record<VerificationOutcome, string> = {
  resident_confirmed_ok:        'Residente confirmado sin novedades',
  assistance_provided:          'Asistencia proporcionada',
  caregiver_support_required:   'Requiere apoyo de cuidador',
  supervisor_follow_up_required: 'Requiere seguimiento de supervisor',
  false_alert:                  'Falsa alerta',
  other_operational_result:     'Otro resultado operacional',
};

export const ROUND_OUTCOME_LABEL: Record<RoundOutcome, string> = {
  ok:             'Sin novedades',
  needs_follow_up: 'Requiere seguimiento',
  no_response:    'Sin respuesta',
  other:          'Otro',
};
