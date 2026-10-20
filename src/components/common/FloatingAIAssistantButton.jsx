import React, { useState, useEffect, useRef } from 'react';
import { Bot, Sparkles, MessageSquare, ChevronRight, ChevronLeft } from 'lucide-react';

/**
 * Bouton d'action flottant intelligent (FAB) d'accès direct à l'Assistant IA Vicky-Shop.
 * Dispose d'un mode masquable automatique lors du défilement pour ne jamais gêner
 * la consultation des produits, et d'une languette latérale rétractable avec flèche.
 *
 * @param {Object} props
 * @param {Function} props.onClick - Action déclenchée au clic (ouverture du tiroir conversationnel)
 * @param {boolean} [props.isVisible=true] - Visibilité du bouton flottant
 * @param {boolean} [props.isOpen=false] - État actif si la fenêtre de discussion est déjà ouverte
 */
export const FloatingAIAssistantButton = ({ onClick, isVisible = true, isOpen = false }) => {
  const [isDocked, setIsDocked] = useState(false);
  const lastScrollY = useRef(0);
  const ticking = useRef(false);

  // Détection fluide du défilement : se range sur le bord droit en descente
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleScroll = () => {
      if (!ticking.current) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;
          const diff = currentScrollY - lastScrollY.current;

          // Si on descend de plus de 35px et qu'on n'est pas tout en haut
          if (diff > 35 && currentScrollY > 120) {
            setIsDocked(true);
          } else if (diff < -25 || currentScrollY < 60) {
            // Si on remonte ou qu'on revient vers le haut, on le redéploie
            setIsDocked(false);
          }

          lastScrollY.current = currentScrollY;
          ticking.current = false;
        });
        ticking.current = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!isVisible || isOpen) return null;

  const handleToggleDock = (e) => {
    e.stopPropagation();
    setIsDocked((prev) => !prev);
  };

  const handleMainClick = () => {
    if (isDocked) {
      setIsDocked(false);
    } else {
      onClick();
    }
  };

  return (
    <aside
      className={`vicky-ai-floating-container ${isDocked ? 'is-docked' : ''}`}
      aria-label="Accès rapide à l'Assistant IA Vicky-Shop"
    >
      {/* Bouton bascule rétractable (petite flèche) */}
      <button
        type="button"
        className="vicky-ai-dock-toggle motion-press"
        onClick={handleToggleDock}
        aria-label={isDocked ? "Afficher l'Assistant IA" : "Replier l'Assistant IA"}
        title={isDocked ? 'Déplier' : 'Ranger sur le bord'}
      >
        {isDocked ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
      </button>

      {/* Bouton principal de discussion */}
      <button
        type="button"
        onClick={handleMainClick}
        className={`vicky-ai-floating-btn motion-press ${isOpen ? 'is-active' : ''}`}
        aria-label="Discuter avec Vicky IA"
        title="Discuter avec l'Assistant IA Vicky-Shop"
      >
        <span className="vicky-ai-floating-icon-box">
          {isOpen ? (
            <MessageSquare size={20} className="vicky-ai-floating-bot-icon" />
          ) : (
            <Bot size={22} className="vicky-ai-floating-bot-icon" />
          )}
          <Sparkles size={12} className="vicky-ai-floating-sparkle-icon" />
        </span>
        <span className="vicky-ai-floating-label">
          {isOpen ? 'Discussion' : 'Assistant IA'}
        </span>
        <span className="vicky-ai-floating-pulse" aria-hidden="true" />
      </button>
    </aside>
  );
};

export default React.memo(FloatingAIAssistantButton);
