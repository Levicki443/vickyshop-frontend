import React, { useState, useRef, useEffect } from 'react';
import { SendHorizontal, Loader2 } from 'lucide-react';

/**
 * Champ de saisie mobile-first optimisé pour les claviers virtuels sur smartphone.
 *
 * @param {Object} props
 * @param {Function} props.onSend - Fonction appelée lors de l'envoi du message
 * @param {boolean} props.isLoading - État de chargement de l'IA
 * @param {boolean} [props.disabled] - Désactivation globale du champ
 */
const AIChatInput = ({ onSend, isLoading = false, disabled = false }) => {
  const [text, setText] = useState('');
  const textareaRef = useRef(null);

  // Ajustement automatique de la hauteur du champ selon le contenu
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.style.height = 'auto';
    const nextHeight = Math.min(textarea.scrollHeight, 120);
    textarea.style.height = `${Math.max(nextHeight, 44)}px`;
  }, [text]);

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (!text.trim() || isLoading || disabled) return;

    onSend(text);
    setText('');

    // Réinitialise la hauteur
    if (textareaRef.current) {
      textareaRef.current.style.height = '44px';
    }
  };

  const handleKeyDown = (e) => {
    // Envoi sur Entrée sans shift (sur desktop), retour à la ligne si Shift+Entrée
    if (e.key === 'Enter' && !e.shiftKey) {
      // Sur mobile, on préfère souvent permettre l'envoi directement ou le bouton
      e.preventDefault();
      handleSubmit();
    }
  };

  // Écoute de l'API visualViewport pour accompagner les claviers tactiles sur Android et iOS
  useEffect(() => {
    const handleViewportChange = () => {
      if (document.activeElement === textareaRef.current) {
        textareaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    };

    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleViewportChange);
      return () => {
        window.visualViewport.removeEventListener('resize', handleViewportChange);
      };
    }
  }, []);

  const handleFocus = () => {
    // Garantit que le champ reste parfaitement visible au-dessus du clavier tactile
    const scrollInput = () => {
      if (textareaRef.current) {
        textareaRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    };

    requestAnimationFrame(scrollInput);
    setTimeout(scrollInput, 150);
    setTimeout(scrollInput, 320);
  };

  return (
    <form className="vicky-ai-input-form" onSubmit={handleSubmit} role="form" aria-label="Saisie du message IA">
      <div className="vicky-ai-input-wrapper">
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          placeholder="Posez votre question à Vicky IA (prix, livraison, vendeur...)..."
          rows={1}
          maxLength={2000}
          disabled={disabled || isLoading}
          className="vicky-ai-textarea"
          aria-label="Votre question"
          inputMode="text"
        />

        <button
          type="submit"
          disabled={!text.trim() || isLoading || disabled}
          className={`vicky-ai-send-btn ${text.trim() ? 'vicky-ai-send-active' : ''}`}
          aria-label="Envoyer le message"
          title="Envoyer votre message"
        >
          {isLoading ? (
            <Loader2 size={18} className="vicky-ai-spinner" />
          ) : (
            <SendHorizontal size={18} />
          )}
        </button>
      </div>

      <div className="vicky-ai-input-footer">
        <span className="vicky-ai-legal-hint">
          Vicky IA peut faire des erreurs. Vérifiez les informations sensibles relatives à vos commandes.
        </span>
      </div>
    </form>
  );
};

export default React.memo(AIChatInput);
