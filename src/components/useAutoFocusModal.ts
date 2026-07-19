/**
 * useAutoFocusModal.ts — Accesibilidad de teclado para los diálogos (hallazgo QA
 * Chunk 8, prueba obligatoria #17 "navegar con teclado").
 *
 * Los modales se montan al final del árbol de la página; sin esto, un usuario de
 * teclado tendría que tabular por el resto de la tabla antes de llegar a sus
 * controles. Enfoca el primer control al abrir y cierra con Escape.
 */

import { useEffect, useRef, type KeyboardEvent } from 'react';

export const useAutoFocusModal = <T extends HTMLElement>(onDismiss: () => void) => {
  const containerRef = useRef<T>(null);

  useEffect(() => {
    const firstFocusable = containerRef.current?.querySelector<HTMLElement>('input, select, button, a[href]');
    firstFocusable?.focus();
  }, []);

  const handleKeyDown = (event: KeyboardEvent<T>): void => {
    if (event.key === 'Escape') {
      event.stopPropagation();
      onDismiss();
    }
  };

  return { containerRef, handleKeyDown };
};
