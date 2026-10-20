import React from 'react';
import {
  Sparkles,
  Truck,
  Banknote,
  Store,
  RotateCcw,
  ShoppingBag,
  HelpCircle,
  ArrowUpRight,
} from 'lucide-react';

const SUGGESTION_META = {
  'sug-1': { icon: Truck, theme: 'cyan', hint: 'Tarifs & Délais' },
  'sug-2': { icon: Banknote, theme: 'emerald', hint: 'À la réception' },
  'sug-3': { icon: ShoppingBag, theme: 'amber', hint: "Guide d'achat" },
  'sug-4': { icon: RotateCcw, theme: 'purple', hint: 'Retour & Tailles' },
  'sel-1': { icon: ShoppingBag, theme: 'cyan', hint: 'Catalogue' },
  'sel-2': { icon: Truck, theme: 'emerald', hint: 'Expéditions' },
  'sel-3': { icon: Sparkles, theme: 'amber', hint: 'Marketing' },
  'sel-4': { icon: Store, theme: 'purple', hint: 'Boutique' },
};

/**
 * Suggestions interactives sous forme de cartes d'amorce modernes et élégantes.
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
        <div className="vicky-ai-suggestions-header-left">
          <Sparkles size={14} className="vicky-ai-suggestions-icon" />
          <span className="vicky-ai-suggestions-title">Questions fréquentes & Raccourcis</span>
        </div>
        <span className="vicky-ai-suggestions-badge">Populaire</span>
      </div>

      <div className="vicky-ai-suggestions-grid" role="list">
        {suggestions.map((sug) => {
          const meta = SUGGESTION_META[sug.id] || { icon: HelpCircle, theme: 'cyan', hint: 'Poser' };
          const IconComponent = meta.icon;

          return (
            <button
              key={sug.id}
              type="button"
              role="listitem"
              className={`vicky-ai-suggestion-card theme-${meta.theme} motion-press`}
              disabled={disabled}
              onClick={() => onSelect(sug.prompt)}
              title={sug.prompt}
              aria-label={sug.label}
            >
              <div className={`vicky-ai-chip-icon-box theme-${meta.theme}`} aria-hidden="true">
                <IconComponent size={16} className="vicky-ai-chip-icon" />
              </div>
              <div className="vicky-ai-chip-text-wrap">
                <span className="vicky-ai-chip-label">{sug.label}</span>
                <span className="vicky-ai-chip-hint">{meta.hint}</span>
              </div>
              <div className="vicky-ai-chip-arrow-box" aria-hidden="true">
                <ArrowUpRight size={13} className="vicky-ai-chip-arrow" />
              </div>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default React.memo(AIPromptSuggestions);
