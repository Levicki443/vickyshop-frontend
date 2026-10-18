import React from 'react';
import { Sparkles, Truck, Banknote, Store, RotateCcw } from 'lucide-react';

const SUGGESTION_ICONS = {
  'sug-1': Truck,
  'sug-2': Banknote,
  'sug-3': Store,
  'sug-4': RotateCcw,
};

/**
 * Composant affichant les pilules de suggestions rapides pour guider l'utilisateur.
 *
 * @param {Object} props
 * @param {Array} props.suggestions - Liste des suggestions ({ id, label, prompt })
 * @param {Function} props.onSelect - Callback appelé lors du clic sur une suggestion
 * @param {boolean} props.disabled - Désactivé si une requête est en cours
 */
const AIPromptSuggestions = ({ suggestions = [], onSelect, disabled = false }) => {
  if (!suggestions || suggestions.length === 0) return null;

  return (
    <div className="vicky-ai-suggestions-container" role="region" aria-label="Suggestions de questions rapides">
      <div className="vicky-ai-suggestions-header">
        <Sparkles size={16} className="vicky-ai-suggestions-icon" />
        <span className="vicky-ai-suggestions-title">Questions fréquentes suggérées</span>
      </div>
      <div className="vicky-ai-suggestions-list">
        {suggestions.map((sug) => {
          const IconComponent = SUGGESTION_ICONS[sug.id] || Sparkles;
          return (
            <button
              key={sug.id}
              type="button"
              className="vicky-ai-suggestion-chip"
              disabled={disabled}
              onClick={() => onSelect(sug.prompt)}
              title={sug.prompt}
            >
              <IconComponent size={14} className="vicky-ai-chip-icon" />
              <span className="vicky-ai-chip-label">{sug.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default React.memo(AIPromptSuggestions);
