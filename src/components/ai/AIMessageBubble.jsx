import React, { useState, useMemo } from 'react';
import {
  Bot,
  User,
  Copy,
  Check,
  AlertCircle,
  Truck,
  ShoppingBag,
  Store,
  MessageCircle,
  ThumbsUp,
  ThumbsDown,
} from 'lucide-react';

const ACTION_REGEX = /\[ACTION:(TRACK_ORDER|VIEW_PRODUCT|SELLER_DASHBOARD|WHATSAPP_SUPPORT)(?::([^\]]+))?\]/g;

/**
 * Extrait les balises d'actions et retourne le texte nettoyé ainsi que la liste des actions à afficher.
 */
const extractActions = (content) => {
  if (!content || typeof content !== 'string') return { cleanContent: '', actions: [] };

  const actions = [];
  let match;

  while ((match = ACTION_REGEX.exec(content)) !== null) {
    actions.push({
      type: match[1],
      param: match[2] ? match[2].trim() : '',
    });
  }

  const cleanContent = content.replace(ACTION_REGEX, '').trim();
  return { cleanContent, actions };
};

/**
 * Formate le texte brut de l'IA avec support des listes et du gras sans dépendance externe lourde.
 */
const formatMessageContent = (content) => {
  if (!content) return null;

  const lines = content.split('\n');

  return lines.map((line, lineIndex) => {
    if (!line.trim()) {
      return <div key={lineIndex} className="vicky-ai-bubble-spacer" />;
    }

    const bulletMatch = line.match(/^(\*|-|•)\s+(.*)$/);
    if (bulletMatch) {
      return (
        <div key={lineIndex} className="vicky-ai-bullet-item">
          <span className="vicky-ai-bullet-dot">•</span>
          <span className="vicky-ai-bullet-text">{parseInlineStyles(bulletMatch[2])}</span>
        </div>
      );
    }

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
 * Bulle de message interactive pour l'utilisateur ou l'assistant Vicky IA.
 */
const AIMessageBubble = ({
  message,
  onTrackOrder,
  onViewProduct,
  onOpenSeller,
}) => {
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const isAssistant = message.role === 'assistant';
  const isError = !!message.isError;

  const { cleanContent, actions } = useMemo(() => {
    if (!isAssistant) return { cleanContent: message.content, actions: [] };
    return extractActions(message.content);
  }, [message.content, isAssistant]);

  const handleCopy = async () => {
    if (!cleanContent) return;
    try {
      await navigator.clipboard.writeText(cleanContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Silencieux
    }
  };

  const handleActionClick = (action) => {
    switch (action.type) {
      case 'TRACK_ORDER':
        if (onTrackOrder) onTrackOrder(action.param);
        break;
      case 'VIEW_PRODUCT':
        if (onViewProduct) onViewProduct(action.param);
        break;
      case 'SELLER_DASHBOARD':
        if (onOpenSeller) onOpenSeller();
        break;
      case 'WHATSAPP_SUPPORT': {
        const text = encodeURIComponent('Bonjour Vicky-Shop, j\'ai besoin d\'assistance concernant ma boutique/commande.');
        window.open(`https://wa.me/2250554726574?text=${text}`, '_blank', 'noopener,noreferrer');
        break;
      }
      default:
        break;
    }
  };

  return (
    <div className={`vicky-ai-message-row ${isAssistant ? 'vicky-ai-row-assistant' : 'vicky-ai-row-user'}`}>
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
            <span className="vicky-ai-badge-fallback" title="Mode expert local actif">
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
          {formatMessageContent(cleanContent)}
        </div>

        {/* Boutons d'actions contextuels interactifs */}
        {actions.length > 0 && (
          <div className="vicky-ai-actions-container" role="group" aria-label="Actions rapides suggérées">
            {actions.map((act, idx) => (
              <button
                key={`${act.type}-${idx}`}
                type="button"
                onClick={() => handleActionClick(act)}
                className={`vicky-ai-action-btn vicky-ai-action-${act.type.toLowerCase()}`}
              >
                {act.type === 'TRACK_ORDER' && <Truck size={14} />}
                {act.type === 'VIEW_PRODUCT' && <ShoppingBag size={14} />}
                {act.type === 'SELLER_DASHBOARD' && <Store size={14} />}
                {act.type === 'WHATSAPP_SUPPORT' && <MessageCircle size={14} />}
                <span>
                  {act.type === 'TRACK_ORDER' && `Suivre la commande ${act.param || ''}`}
                  {act.type === 'VIEW_PRODUCT' && 'Voir la fiche de l\'article'}
                  {act.type === 'SELLER_DASHBOARD' && 'Ouvrir mon Espace Vendeur'}
                  {act.type === 'WHATSAPP_SUPPORT' && 'Contacter le support WhatsApp (+225)'}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* Barre d'outils inférieure : Copie et Évaluation (Feedback) */}
        {isAssistant && !isError && message.id !== 'welcome-msg' && (
          <div className="vicky-ai-bubble-actions">
            <div className="vicky-ai-feedback-group">
              <span className="vicky-ai-feedback-hint">Cette réponse vous a-t-elle aidé ?</span>
              <button
                type="button"
                onClick={() => setFeedback('helpful')}
                className={`vicky-ai-feedback-btn ${feedback === 'helpful' ? 'active-helpful' : ''}`}
                title="Oui, réponse utile"
                aria-label="Réponse utile"
              >
                <ThumbsUp size={13} />
              </button>
              <button
                type="button"
                onClick={() => setFeedback('unhelpful')}
                className={`vicky-ai-feedback-btn ${feedback === 'unhelpful' ? 'active-unhelpful' : ''}`}
                title="Non, réponse à améliorer"
                aria-label="Réponse à améliorer"
              >
                <ThumbsDown size={13} />
              </button>
              {feedback && (
                <span className="vicky-ai-feedback-ack">
                  {feedback === 'helpful' ? 'Merci pour votre retour !' : 'Merci, nous nous améliorons.'}
                </span>
              )}
            </div>

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
