import React, { useState } from 'react';
import { Bot, User, Copy, Check, AlertCircle } from 'lucide-react';

/**
 * Formate le texte brut de l'IA avec support des listes et du gras sans dépendance externe lourde.
 */
const formatMessageContent = (content) => {
  if (!content) return null;

  const lines = content.split('\n');

  return lines.map((line, lineIndex) => {
    // Ligne vide -> espacement
    if (!line.trim()) {
      return <div key={lineIndex} className="vicky-ai-bubble-spacer" />;
    }

    // Puces (liste non ordonnée)
    const bulletMatch = line.match(/^(\*|-|•)\s+(.*)$/);
    if (bulletMatch) {
      return (
        <div key={lineIndex} className="vicky-ai-bullet-item">
          <span className="vicky-ai-bullet-dot">•</span>
          <span className="vicky-ai-bullet-text">{parseInlineStyles(bulletMatch[2])}</span>
        </div>
      );
    }

    // Puces numérotées
    const numberedMatch = line.match(/^(\d+)\.\s+(.*)$/);
    if (numberedMatch) {
      return (
        <div key={lineIndex} className="vicky-ai-bullet-item">
          <span className="vicky-ai-numbered-prefix">{numberedMatch[1]}.</span>
          <span className="vicky-ai-bullet-text">{parseInlineStyles(numberedMatch[2])}</span>
        </div>
      );
    }

    return (
      <p key={lineIndex} className="vicky-ai-paragraph">
        {parseInlineStyles(line)}
      </p>
    );
  });
};

/**
 * Traite les balises de style simples en ligne comme **gras**.
 */
const parseInlineStyles = (text) => {
  if (!text) return '';
  const parts = text.split(/(\*\*.*?\*\*)/g);

  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={index} className="vicky-ai-strong">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
};

/**
 * Formate l'horodatage au format HH:mm
 */
const formatTime = (dateString) => {
  try {
    const date = dateString ? new Date(dateString) : new Date();
    return date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '';
  }
};

/**
 * Bulle de message pour l'utilisateur ou l'assistant Vicky IA.
 */
const AIMessageBubble = ({ message }) => {
  const [copied, setCopied] = useState(false);
  const isAssistant = message.role === 'assistant';
  const isError = !!message.isError;

  const handleCopy = async () => {
    if (!message.content) return;
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Ignorer l'erreur silencieusement
    }
  };

  return (
    <div
      className={`vicky-ai-message-row ${isAssistant ? 'vicky-ai-row-assistant' : 'vicky-ai-row-user'}`}
    >
      <div className="vicky-ai-avatar-wrapper" aria-hidden="true">
        {isAssistant ? (
          <div className="vicky-ai-avatar vicky-ai-avatar-bot">
            <Bot size={18} />
          </div>
        ) : (
          <div className="vicky-ai-avatar vicky-ai-avatar-user">
            <User size={18} />
          </div>
        )}
      </div>

      <div className={`vicky-ai-bubble ${isAssistant ? 'vicky-ai-bubble-assistant' : 'vicky-ai-bubble-user'} ${isError ? 'vicky-ai-bubble-error' : ''}`}>
        <div className="vicky-ai-bubble-header">
          <span className="vicky-ai-sender-name">
            {isAssistant ? 'Vicky IA' : 'Vous'}
          </span>
          {isAssistant && message.isFallback && (
            <span className="vicky-ai-badge-fallback" title="Mode de secours local actif">
              Conseiller Vicky-Shop
            </span>
          )}
          {message.createdAt && (
            <span className="vicky-ai-timestamp">
              {formatTime(message.createdAt)}
            </span>
          )}
        </div>

        <div className="vicky-ai-bubble-body">
          {isError && (
            <div className="vicky-ai-error-tag">
              <AlertCircle size={14} />
              <span>Notification de service</span>
            </div>
          )}
          {formatMessageContent(message.content)}
        </div>

        {isAssistant && !isError && message.id !== 'welcome-msg' && (
          <div className="vicky-ai-bubble-actions">
            <button
              type="button"
              className="vicky-ai-copy-button"
              onClick={handleCopy}
              aria-label="Copier la réponse"
              title="Copier la réponse"
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              <span>{copied ? 'Copié !' : 'Copier'}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default React.memo(AIMessageBubble);
