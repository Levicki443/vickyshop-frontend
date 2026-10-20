import React, { useState, useRef, useEffect } from 'react';
import { SendHorizontal, Loader2, Sparkles } from 'lucide-react';

/**
 * Champ de saisie ergonomique de type Capsule pour Vicky IA.
 * Optimisé pour les claviers tactiles mobiles et les raccourcis bureau.
 *
 * @param {Object} props
 * @param {Function} props.onSend - Fonction appelée lors de l'envoi du message
 * @param {boolean} [props.isLoading=false] - État de chargement de l'IA
 * @param {boolean} [props.disabled=false] - Désactivation globale du champ
 */
const AIChatInput = ({ onSend, isLoading = false, disabled = false }) => {
  const [text, setText] = useState('');
  const textareaRef = useRef(null);

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

    if (textareaRef.current) {
      textareaRef.current.style.height = '44px';
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

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
    const scrollInput = () => {
      if (textareaRef.current) {
        textareaRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    };
    requestAnimationFrame(scrollInput);
    setTimeout(scrollInput, 150);
  };

  const hasContent = Boolean(text.trim());

  return (
    <form className="vicky-ai-input-form" onSubmit={handleSubmit} role="form" aria-label="Saisie du message IA">
      <div className={`vicky-ai-input-wrapper ${hasContent ? 'has-content' : ''}`}>
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          placeholder="Posez votre question à Vicky IA..."
          rows={1}
          maxLength={2000}
          disabled={disabled || isLoading}
          className="vicky-ai-textarea"
          aria-label="Votre question"
          inputMode="text"
        />

        <button
          type="submit"
          disabled={!hasContent || isLoading || disabled}
          className={`vicky-ai-send-btn motion-press ${hasContent ? 'vicky-ai-send-active' : ''}`}
          aria-label="Envoyer le message"
          title="Envoyer votre message (Entrée)"
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
          <Sparkles size={11} className="vicky-ai-legal-icon" />
          <span>Vicky IA répond en direct • Entrée pour envoyer, Maj+Entrée pour saut de ligne</span>
        </span>
      </div>
    </form>
  );
};

export default React.memo(AIChatInput);
