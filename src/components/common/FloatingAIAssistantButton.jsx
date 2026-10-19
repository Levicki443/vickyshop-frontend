import React from 'react';
import { Bot, Sparkles, MessageSquare } from 'lucide-react';

/**
 * Bouton d'action flottant (FAB) d'accès direct à l'Assistant IA Vicky-Shop.
 * Visible en permanence en bas à droite sur l'ensemble de la boutique.
 *
 * @param {Object} props
 * @param {Function} props.onClick - Action déclenchée au clic (ouverture du tiroir conversationnel)
 * @param {boolean} [props.isVisible=true] - Visibilité du bouton flottant
 * @param {boolean} [props.isOpen=false] - État actif si la fenêtre de discussion est déjà ouverte
 */
export const FloatingAIAssistantButton = ({ onClick, isVisible = true, isOpen = false }) => {
  if (!isVisible) return null;

  return (
    <aside
      className="vicky-ai-floating-container"
      aria-label="Accès rapide à l'Assistant IA Vicky-Shop"
    >
      <button
        type="button"
        onClick={onClick}
        className={`vicky-ai-floating-btn ${isOpen ? 'is-active' : ''}`}
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
