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
  LogIn,
  ThumbsUp,
  ThumbsDown,
} from 'lucide-react';
import AIProductCard from './AIProductCard';

const ACTION_REGEX = /\[ACTION:(TRACK_ORDER|VIEW_PRODUCT|ADD_TO_CART|OPEN_CART|OPEN_CHECKOUT|AUTH_MODAL|SELLER_DASHBOARD|WHATSAPP_SUPPORT)(?::([^\]]+))?\]/g;

const extractActions = (content, propActions = []) => {
  if (!content || typeof content !== 'string') return { cleanContent: '', actions: propActions || [] };

  const actions = [...(propActions || [])];
  let match;

  while ((match = ACTION_REGEX.exec(content)) !== null) {
    const type = match[1];
    const param = match[2] ? match[2].trim() : '';
    if (!actions.some((a) => a.type === type && a.param === param)) {
      actions.push({ type, param });
    }
  }

  const cleanContent = content.replace(ACTION_REGEX, '').trim();
  return { cleanContent, actions };
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

const formatTime = (dateString) => {
  try {
    const date = dateString ? new Date(dateString) : new Date();
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
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
  onAddToCart,
  onOpenCart,
  onOpenCheckout,
  onOpenAuth,
  onOpenSeller,
}) => {
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const isAssistant = message.role === 'assistant';
  const isError = !!message.isError;
  const products = Array.isArray(message.products) ? message.products : [];

  const { cleanContent, actions } = useMemo(() => {
    if (!isAssistant) return { cleanContent: message.content, actions: [] };
    return extractActions(message.content, message.actions);
  }, [message.content, message.actions, isAssistant]);

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
      case 'ADD_TO_CART':
        if (onAddToCart) onAddToCart({ slug: action.param, _id: action.param });
        break;
      case 'OPEN_CART':
        if (onOpenCart) onOpenCart();
        break;
      case 'OPEN_CHECKOUT':
        if (onOpenCheckout) onOpenCheckout();
        break;
      case 'AUTH_MODAL':
        if (onOpenAuth) onOpenAuth();
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

          {/* Cartes produits interactives intégrées */}
          {products.length > 0 && (
            <div className="vicky-ai-products-grid" role="region" aria-label="Articles recommandés">
              {products.map((prod) => (
                <AIProductCard
                  key={prod._id || prod.slug}
                  product={prod}
                  onViewProduct={onViewProduct}
                  onAddToCart={onAddToCart}
                />
              ))}
            </div>
          )}
        </div>

        {/* Boutons d'actions contextuels interactifs */}
        {actions.length > 0 && (
          <div className="vicky-ai-actions-container" role="group" aria-label="Actions rapides suggérées">
            {actions.map((act, idx) => (
              <button
                key={`${act.type}-${idx}`}
                type="button"
                onClick={() => handleActionClick(act)}
                className={`vicky-ai-action-btn vicky-ai-action-${act.type.toLowerCase().replace(/_/g, '-')}`}
              >
                {act.type === 'TRACK_ORDER' && <Truck size={14} />}
                {act.type === 'VIEW_PRODUCT' && <ShoppingBag size={14} />}
                {act.type === 'ADD_TO_CART' && <ShoppingBag size={14} />}
                {act.type === 'OPEN_CART' && <ShoppingBag size={14} />}
                {act.type === 'OPEN_CHECKOUT' && <Truck size={14} />}
                {act.type === 'AUTH_MODAL' && <LogIn size={14} />}
                {act.type === 'SELLER_DASHBOARD' && <Store size={14} />}
                {act.type === 'WHATSAPP_SUPPORT' && <MessageCircle size={14} />}
                <span>
                  {act.type === 'TRACK_ORDER' && `Suivre la commande ${act.param || ''}`}
                  {act.type === 'VIEW_PRODUCT' && 'Voir la fiche'}
                  {act.type === 'ADD_TO_CART' && 'Ajouter au panier'}
                  {act.type === 'OPEN_CART' && 'Ouvrir mon panier'}
                  {act.type === 'OPEN_CHECKOUT' && 'Passer à la caisse'}
                  {act.type === 'AUTH_MODAL' && 'Se connecter / S\'inscrire'}
                  {act.type === 'SELLER_DASHBOARD' && 'Ouvrir mon Espace Vendeur'}
                  {act.type === 'WHATSAPP_SUPPORT' && 'Contacter le support WhatsApp (+225)'}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* Barre d'outils inférieure : Copie et Évaluation */}
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
