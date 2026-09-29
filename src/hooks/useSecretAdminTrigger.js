import { useRef, useCallback, useEffect } from 'react';

/**
 * Hook d'accès secret pour le Backoffice Administrateur :
 * - Déclenchement silencieux : maintien continu de 10 secondes sur "Accueil" ou le Logo
 *   (aucun indicateur visuel n'est affiché pour préserver la discrétion totale).
 * - Raccourci clavier de secours : Touches [Ctrl] + [Alt] + [A]
 * 
 * @param {Function} onUnlock Callback appelé lorsque le maintien de 10 secondes est atteint
 */
export const useSecretAdminTrigger = (onUnlock) => {
  const REQUIRED_PRESS_DURATION = 10000; // 10 secondes continues

  const pressTimerRef = useRef(null);
  const isTriggeredRef = useRef(false);

  const clearLongPress = useCallback(() => {
    if (pressTimerRef.current) {
      clearTimeout(pressTimerRef.current);
      pressTimerRef.current = null;
    }
  }, []);

  const handlePointerDown = useCallback(
    (e) => {
      // Uniquement sur clic gauche ou toucher tactile
      if (e.button !== undefined && e.button !== 0) return;

      clearLongPress();
      isTriggeredRef.current = false;

      // Démarrage du minuteur silencieux de 10 secondes
      pressTimerRef.current = setTimeout(() => {
        isTriggeredRef.current = true;
        clearLongPress();

        if (typeof navigator !== 'undefined' && navigator.vibrate) {
          try {
            navigator.vibrate(150);
          } catch {
            // Ignorer silencieusement si non supporté
          }
        }

        if (typeof onUnlock === 'function') {
          onUnlock();
        }
      }, REQUIRED_PRESS_DURATION);
    },
    [onUnlock, clearLongPress]
  );

  const handlePointerUp = useCallback(() => {
    clearLongPress();
  }, [clearLongPress]);

  const handlePointerCancel = useCallback(() => {
    clearLongPress();
  }, [clearLongPress]);

  // Nettoyage global sur relâchement ou perte de focus
  useEffect(() => {
    const handleGlobalPointerUp = () => {
      clearLongPress();
    };

    window.addEventListener('pointerup', handleGlobalPointerUp);
    window.addEventListener('mouseup', handleGlobalPointerUp);
    window.addEventListener('touchend', handleGlobalPointerUp);
    window.addEventListener('touchcancel', handleGlobalPointerUp);

    return () => {
      clearLongPress();
      window.removeEventListener('pointerup', handleGlobalPointerUp);
      window.removeEventListener('mouseup', handleGlobalPointerUp);
      window.removeEventListener('touchend', handleGlobalPointerUp);
      window.removeEventListener('touchcancel', handleGlobalPointerUp);
    };
  }, [clearLongPress]);

  // Raccourci clavier administrateur : [Ctrl] + [Alt] + [A]
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
    triggerProps: {
      onPointerDown: handlePointerDown,
      onPointerUp: handlePointerUp,
      onPointerCancel: handlePointerCancel,
      onPointerLeave: handlePointerCancel,
      onContextMenu: (e) => {
        // Évite d'ouvrir le menu contextuel lors d'un long press sur mobile
        e.preventDefault();
      },
    },
  };
};
