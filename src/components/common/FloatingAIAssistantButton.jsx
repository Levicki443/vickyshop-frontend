import React from 'react';
import { Bot, Sparkles } from 'lucide-react';

/**
 * Bouton d'action flottant (FAB) d'accès direct à l'Assistant IA Vicky-Shop.
 * Visible en permanence en bas à droite sur l'ensemble de la boutique.
 *
 * @param {Object} props
 * @param {Function} props.onClick - Action déclenchée au clic (ouverture de l'écran IA)
 * @param {boolean} [props.isVisible=true] - Visibilité du bouton flottant
 */
export const FloatingAIAssistantButton = ({ onClick, isVisible = true }) => {
  if (!isVisible) return null;

  return (
    <aside
      className="vicky-ai-floating-container"
      aria-label="Accès rapide à l'Assistant IA Vicky-Shop"
    >
      <button
        type="button"
        onClick={onClick}
        className="vicky-ai-floating-btn"
        aria-label="Ouvrir l'Assistant IA Vicky-Shop"
        title="Discuter avec l'Assistant IA Vicky-Shop"
      >
        <span className="vicky-ai-floating-icon-box">
          <Bot size={22} className="vicky-ai-floating-bot-icon" />
          <Sparkles size={12} className="vicky-ai-floating-sparkle-icon" />
        </span>
        <span className="vicky-ai-floating-label">Assistant IA</span>
        <span className="vicky-ai-floating-pulse" aria-hidden="true" />
      </button>
    </aside>
  );
};

export default React.memo(FloatingAIAssistantButton);
