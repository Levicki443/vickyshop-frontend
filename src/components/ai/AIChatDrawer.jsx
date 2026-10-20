import React, { useRef, useEffect, useState } from 'react';
import {
  X,
  Maximize2,
  Minimize2,
  RotateCcw,
  Bot,
  ShieldCheck,
  Sparkles,
  Truck,
  Banknote,
  RotateCw,
  Home,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useAIChat } from '../../hooks/useAIChat';
import AIMessageBubble from './AIMessageBubble';
import AIPromptSuggestions from './AIPromptSuggestions';
import AIChatInput from './AIChatInput';

/**
 * Fenêtre de discussion interactive flottante (Tiroir / Drawer) pour Vicky IA.
 * Centrée ergonomiquement avec support du mode plein écran et du multitâche sur catalogue.
 */
export const AIChatDrawer = ({
  isOpen,
  onClose,
  onGoHome,
  onTrackOrder,
  onViewProduct,
  onAddToCart,
  onOpenCart,
  onOpenCheckout,
  onOpenAuth,
  onOpenSeller,
  recentlyViewedIds = [],
}) => {
  const { user } = useAuth();
  const {
    messages,
    suggestions,
    isLoading,
    sendMessage,
    resetSession,
  } = useAIChat(user, recentlyViewedIds);

  const [isFullscreen, setIsFullscreen] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading, isOpen]);

  if (!isOpen) return null;

  const handleSuggestionSelect = (prompt) => {
    sendMessage(prompt);
  };

  const handleProductClick = (slugOrId) => {
    if (onViewProduct) {
      onViewProduct(slugOrId);
      if (window.innerWidth < 768) {
        onClose();
      }
    }
  };

  const handleExitToHome = () => {
    if (onGoHome) {
      onGoHome();
    } else {
      onClose();
    }
  };

  return (
    <aside
      className={`vicky-ai-drawer-root ${isFullscreen ? 'is-fullscreen' : ''}`}
      role="dialog"
      aria-label="Discussion avec Vicky IA"
      aria-modal="true"
    >
      {/* En-tête du tiroir conversationnel */}
      <header className="vicky-ai-drawer-header">
        <div className="vicky-ai-drawer-header-brand">
          <div className="vicky-ai-drawer-avatar">
            <Bot size={20} />
            <span className="vicky-ai-drawer-pulse" title="Vicky IA est en ligne" />
          </div>
          <div className="vicky-ai-drawer-info">
            <div className="vicky-ai-drawer-title-row">
              <h3 className="vicky-ai-drawer-title">Vicky IA</h3>
              <span className="vicky-ai-drawer-badge">
                <ShieldCheck size={11} /> Officiel
              </span>
            </div>
            <span className="vicky-ai-drawer-status">
              Conseillère Vicky-Shop • En direct
            </span>
          </div>
        </div>

        <div className="vicky-ai-drawer-actions">
          <button
            type="button"
            onClick={handleExitToHome}
            className="vicky-ai-drawer-exit-btn motion-press"
            title="Quitter la discussion et revenir à l'accueil"
            aria-label="Quitter la discussion et aller à l'accueil"
          >
            <Home size={15} />
            <span>Quitter</span>
          </button>

          <button
            type="button"
            onClick={resetSession}
            disabled={isLoading}
            className="vicky-ai-drawer-icon-btn"
            title="Nouvelle discussion (effacer l'historique)"
            aria-label="Réinitialiser la discussion"
          >
            <RotateCcw size={16} />
          </button>

          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="vicky-ai-drawer-icon-btn is-desktop-only"
            title={isFullscreen ? 'Réduire la fenêtre' : 'Agrandir en plein écran'}
            aria-label={isFullscreen ? 'Réduire la fenêtre' : 'Agrandir en plein écran'}
          >
            {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>

          <button
            type="button"
            onClick={onClose}
            className="vicky-ai-drawer-icon-btn is-close-btn"
            title="Fermer la discussion"
            aria-label="Fermer"
          >
            <X size={18} />
          </button>
        </div>
      </header>

      {/* Corps défilant du chat avec centrage ergonomique max 860px */}
      <div className="vicky-ai-drawer-body">
        <div className="vicky-ai-drawer-inner">
          {/* Encart Hero de bienvenue enrichi */}
          <div className="vicky-ai-drawer-welcome">
            <div className="vicky-ai-drawer-welcome-top">
              <span className="vicky-ai-drawer-welcome-tag">
                <Sparkles size={13} />
                <span>Assistant E-Commerce Intelligent</span>
              </span>
            </div>

            <h4 className="vicky-ai-drawer-welcome-heading">
              Comment puis-je vous accompagner aujourd&apos;hui ?
            </h4>

            <p className="vicky-ai-drawer-welcome-desc">
              Trouvez des articles selon votre budget, suivez vos colis ou vendez sur Vicky-Shop.
            </p>

            <div className="vicky-ai-drawer-service-pills">
              <span className="vicky-ai-service-pill">
                <Truck size={12} /> Abidjan 2 000 FCFA
              </span>
              <span className="vicky-ai-service-pill">
                <Banknote size={12} /> Cash à la livraison
              </span>
              <span className="vicky-ai-service-pill">
                <RotateCw size={12} /> Échange 48h
              </span>
            </div>
          </div>

          {/* Suggestions de questions rapides */}
          {suggestions.length > 0 && (
            <AIPromptSuggestions
              suggestions={suggestions}
              onSelect={handleSuggestionSelect}
              disabled={isLoading}
            />
          )}

          {/* Liste chronologique des messages */}
          <div className="vicky-ai-drawer-messages" role="log" aria-live="polite">
            {messages.map((msg) => (
              <AIMessageBubble
                key={msg.id}
                message={msg}
                onTrackOrder={onTrackOrder}
                onViewProduct={handleProductClick}
                onAddToCart={onAddToCart}
                onOpenCart={onOpenCart}
                onOpenCheckout={onOpenCheckout}
                onOpenAuth={onOpenAuth}
                onOpenSeller={onOpenSeller}
              />
            ))}

            {isLoading && (
              <div className="vicky-ai-typing-indicator" aria-label="Vicky IA écrit...">
                <div className="vicky-ai-typing-avatar">
                  <Bot size={15} />
                </div>
                <div className="vicky-ai-typing-bubble">
                  <span className="vicky-ai-typing-label">Vicky IA prépare sa réponse</span>
                  <div className="vicky-ai-typing-dots">
                    <span className="vicky-ai-dot" />
                    <span className="vicky-ai-dot" />
                    <span className="vicky-ai-dot" />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} className="vicky-ai-scroll-anchor" />
          </div>
        </div>
      </div>

      {/* Zone de saisie ancrée avec centrage */}
      <footer className="vicky-ai-drawer-footer">
        <div className="vicky-ai-drawer-footer-inner">
          <AIChatInput onSend={sendMessage} isLoading={isLoading} />
        </div>
      </footer>
    </aside>
  );
};

export default React.memo(AIChatDrawer);
