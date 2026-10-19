import { useEffect, useRef } from 'react';

/**
 * Hook personnalisé d'animation au défilement (Scroll Reveal)
 * Utilise l'IntersectionObserver natif pour des performances optimales (60/120 FPS).
 * Déconnecte automatiquement chaque élément une fois révélé pour libérer la mémoire.
 * Respecte les préférences de réduction de mouvement de l'utilisateur.
 */
export const useScrollReveal = (options = {}) => {
  const containerRef = useRef(null);

  useEffect(() => {
    // Vérification de la compatibilité et des préférences d'accessibilité
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      return;
    }

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      return;
    }

    // Active le mode d'animation au défilement sur le document
    document.documentElement.classList.add('js-reveal-active');

    const observerOptions = {
      root: null,
      rootMargin: options.rootMargin || '0px 0px -40px 0px',
      threshold: options.threshold !== undefined ? options.threshold : 0.12,
    };

    const handleIntersect = (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
          observer.unobserve(entry.target);
        }
      });
    };

    const observer = new IntersectionObserver(handleIntersect, observerOptions);

    // Sélectionne les éléments cibles dans le conteneur ou globalement
    const rootElement = containerRef.current || document;
    const elements = rootElement.querySelectorAll('.reveal-on-scroll');
    elements.forEach((el) => {
      if (!el.classList.contains('is-revealed')) {
        observer.observe(el);
      }
    });

    return () => {
      observer.disconnect();
    };
  }, [options.threshold, options.rootMargin]);

  return containerRef;
};

export default useScrollReveal;
