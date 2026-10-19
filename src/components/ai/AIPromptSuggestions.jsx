import React from 'react';
import {
  Sparkles,
  Truck,
  Banknote,
  Store,
  RotateCcw,
  ShoppingBag,
  HelpCircle,
} from 'lucide-react';

const SUGGESTION_ICONS = {
  'sug-1': Truck,
  'sug-2': Banknote,
  'sug-3': ShoppingBag,
  'sug-4': RotateCcw,
  'sel-1': ShoppingBag,
  'sel-2': Truck,
  'sel-3': Sparkles,
  'sel-4': Store,
};

/**
 * Composant de suggestions interactives visuelles présentées sous forme de cartes d'amorce.
 *
 * @param {Object} props
 * @param {Array} props.suggestions - Liste des suggestions ({ id, label, prompt })
 * @param {Function} props.onSelect - Callback appelé lors du clic sur une suggestion
 * @param {boolean} [props.disabled=false] - Désactivé si une requête est en cours
 */
export const AIPromptSuggestions = ({ suggestions = [], onSelect, disabled = false }) => {
  if (!suggestions || suggestions.length === 0) return null;

  return (
    <nav className="vicky-ai-suggestions-container" aria-label="Questions fréquentes suggérées">
      <div className="vicky-ai-suggestions-header">
        <Sparkles size={15} className="vicky-ai-suggestions-icon" />
        <span className="vicky-ai-suggestions-title">Questions fréquentes & Raccourcis</span>
      </div>

      <div className="vicky-ai-suggestions-list" role="list">
        {suggestions.map((sug) => {
          const IconComponent = SUGGESTION_ICONS[sug.id] || HelpCircle;

          return (
            <button
              key={sug.id}
              type="button"
              role="listitem"
              className="vicky-ai-suggestion-chip"
              disabled={disabled}
              onClick={() => onSelect(sug.prompt)}
              title={sug.prompt}
              aria-label={sug.label}
            >
              <span className="vicky-ai-chip-icon-box" aria-hidden="true">
                <IconComponent size={14} className="vicky-ai-chip-icon" />
              </span>
              <span className="vicky-ai-chip-label">{sug.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default React.memo(AIPromptSuggestions);
