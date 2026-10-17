import { useRef, useCallback, useEffect } from 'react';

/**
 * Hook d'accès secret pour le Backoffice Administrateur :
 * - Déclenchement discret : maintien continu de 10 secondes sur "Accueil" ou le Logo
 *   sur mobile comme sur desktop avec tolérance aux micro-oscillations tactiles.
 * - Raccourci clavier de secours pour ordinateur : [Ctrl] + [Alt] + [A]
 *
 * @param {Function} onUnlock Callback exécuté lorsque les 10 secondes de maintien sont validées
 */
export const useSecretAdminTrigger = (onUnlock) => {
  const REQUIRED_PRESS_DURATION = 10000; // 10 secondes exactes
  const MAX_TOUCH_DRIFT_PX = 25; // Tolérance de dérive tactile naturelle du doigt

  const pressTimerRef = useRef(null);
  const isTriggeredRef = useRef(false);
  const startCoordsRef = useRef({ x: 0, y: 0 });

  const clearLongPress = useCallback(() => {
    if (pressTimerRef.current) {
      clearTimeout(pressTimerRef.current);
      pressTimerRef.current = null;
    }
  }, []);

  const handlePointerDown = useCallback(
    (e) => {
      // Uniquement sur clic principal gauche ou toucher tactile
      if (e.button !== undefined && e.button !== 0) return;

      clearLongPress();
      isTriggeredRef.current = false;

      const clientX = e.clientX ?? e.touches?.[0]?.clientX ?? 0;
      const clientY = e.clientY ?? e.touches?.[0]?.clientY ?? 0;
      startCoordsRef.current = { x: clientX, y: clientY };

      pressTimerRef.current = setTimeout(() => {
        isTriggeredRef.current = true;
        clearLongPress();

        // Retour haptique discret sur smartphone
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
          try {
            navigator.vibrate([120, 60, 120]);
          } catch {
            // Ignorer silencieusement si non disponible
          }
        }

        if (typeof onUnlock === 'function') {
          onUnlock();
        }
      }, REQUIRED_PRESS_DURATION);
    },
    [onUnlock, clearLongPress]
  );

  const handlePointerMove = useCallback(
    (e) => {
      if (!pressTimerRef.current) return;
      const clientX = e.clientX ?? e.touches?.[0]?.clientX ?? 0;
      const clientY = e.clientY ?? e.touches?.[0]?.clientY ?? 0;
      const deltaX = Math.abs(clientX - startCoordsRef.current.x);
      const deltaY = Math.abs(clientY - startCoordsRef.current.y);

      // Annuler uniquement si le doigt a nettement glissé pour scroller
      if (deltaX > MAX_TOUCH_DRIFT_PX || deltaY > MAX_TOUCH_DRIFT_PX) {
        clearLongPress();
      }
    },
    [clearLongPress]
  );

  const handlePointerUp = useCallback(() => {
    clearLongPress();
  }, [clearLongPress]);

  // Nettoyage global en cas de relâchement à l'extérieur
  useEffect(() => {
    const handleGlobalPointerUp = () => {
      clearLongPress();
    };

    window.addEventListener('pointerup', handleGlobalPointerUp);
    window.addEventListener('mouseup', handleGlobalPointerUp);
    window.addEventListener('touchend', handleGlobalPointerUp);

    return () => {
      clearLongPress();
      window.removeEventListener('pointerup', handleGlobalPointerUp);
      window.removeEventListener('mouseup', handleGlobalPointerUp);
      window.removeEventListener('touchend', handleGlobalPointerUp);
    };
  }, [clearLongPress]);

  // Raccourci clavier de secours : [Ctrl] + [Alt] + [A]
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.altKey && (e.key === 'a' || e.key === 'A')) {
        e.preventDefault();
        if (typeof onUnlock === 'function') {
          onUnlock();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onUnlock]);

  return {
    isTriggeredRef,
    triggerProps: {
      onPointerDown: handlePointerDown,
      onPointerMove: handlePointerMove,
      onPointerUp: handlePointerUp,
      onClickCapture: (e) => {
        // Intercepte et bloque le clic naturel pour ne pas déclencher la navigation ou fermer les modales
        if (isTriggeredRef.current) {
          e.preventDefault();
          e.stopPropagation();
        }
      },
      onClick: (e) => {
        if (isTriggeredRef.current) {
          e.preventDefault();
          e.stopPropagation();
          setTimeout(() => {
            isTriggeredRef.current = false;
          }, 400);
        }
      },
      onContextMenu: (e) => {
        // Empêche l'affichage du menu contextuel mobile lors du maintien
        e.preventDefault();
      },
      style: {
        WebkitTouchCallout: 'none',
        WebkitUserSelect: 'none',
        userSelect: 'none',
        touchAction: 'manipulation',
      },
    },
  };
};

export default useSecretAdminTrigger;
