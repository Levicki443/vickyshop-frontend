import { useEffect, useRef } from 'react';

// Timestamp pour détecter les retours arrière déclenchés programmatiquement par le hook
let lastInternalModalBackTime = 0;

/**
 * Indique si un événement popstate récent a été provoqué par le nettoyage interne d'une modale
 * plutôt que par une navigation utilisateur réelle.
 */
export const isRecentInternalModalBack = () => {
  return Date.now() - lastInternalModalBackTime < 300;
};

/**
 * Hook personnalisé pour synchroniser l'ouverture d'une modale, d'un tiroir ou d'une lightbox
 * avec l'historique du navigateur et les gestes de retour mobiles.
 *
 * Rôle essentiel :
 * 1. Empêche la fermeture accidentelle de l'application lorsqu'un utilisateur
 *    appuie sur le bouton "Retour" de son smartphone (Android / iOS).
 * 2. Ferme la modale en priorité au lieu de quitter la page courante.
 * 3. Maintient la pile d'historique propre lorsque la modale est fermée par l'interface (croix, clic extérieur).
 *
 * @param {boolean} isOpen - État d'ouverture de la modale
 * @param {Function} onClose - Fonction de fermeture invoquée lors du retour arrière
 * @param {string} modalName - Identifiant descriptif de la modale
 */
export const useModalHistory = (isOpen, onClose, modalName = 'overlay') => {
  const isPushedRef = useRef(false);
  const isPoppedByPopstateRef = useRef(false);

  useEffect(() => {
    if (isOpen) {
      // Lorsque la modale s'ouvre, on ajoute un état factice dans l'historique
      if (!isPushedRef.current) {
        isPushedRef.current = true;
        isPoppedByPopstateRef.current = false;
        try {
          window.history.pushState(
            { isModalOverlay: true, modalName, timestamp: Date.now() },
            ''
          );
        } catch {
          // Tolérance pour environnements restreints
        }
      }
    } else {
      // Lorsque la modale est fermée depuis l'interface (bouton X, backdrop, validation)
      if (isPushedRef.current && !isPoppedByPopstateRef.current) {
        isPushedRef.current = false;
        if (window.history.state && window.history.state.isModalOverlay) {
          lastInternalModalBackTime = Date.now();
          window.history.back();
        }
      }
      isPoppedByPopstateRef.current = false;
    }
  }, [isOpen, modalName]);

  useEffect(() => {
    const handlePopState = () => {
      // Si l'utilisateur appuie sur "Retour" sur son téléphone alors que la modale est ouverte
      if (isPushedRef.current) {
        isPoppedByPopstateRef.current = true;
        isPushedRef.current = false;
        if (typeof onClose === 'function') {
          onClose();
        }
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [onClose]);
};

export default useModalHistory;
