import React, { useRef, useEffect } from 'react';
import { ArrowLeft, RotateCcw, Bot, Sparkles, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useAIChat } from '../../hooks/useAIChat';
import AIMessageBubble from './AIMessageBubble';
import AIPromptSuggestions from './AIPromptSuggestions';
import AIChatInput from './AIChatInput';

/**
 * Page dédiée plein écran pour l'assistant IA intelligent Vicky-Shop.
 *
 * @param {Object} props
 * @param {Function} props.onBackToShop - Callback de retour vers la boutique
 */
export const AIAssistantPage = ({ onBackToShop }) => {
  const { user } = useAuth();
  const {
    messages,
    suggestions,
    isLoading,
    sendMessage,
    resetSession,
  } = useAIChat(user);

  const messagesEndRef = useRef(null);

  // Défilement automatique vers le dernier message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSuggestionSelect = (prompt) => {
    sendMessage(prompt);
  };

  return (
    <div className="vicky-ai-page" role="main" aria-label="Assistant IA Vicky-Shop">
      {/* Barre d'en-tête supérieure */}
      <header className="vicky-ai-header">
        <div className="vicky-ai-header-left">
          <button
            type="button"
            onClick={onBackToShop}
            className="vicky-ai-back-btn"
            aria-label="Retourner à la boutique"
            title="Retour à la boutique"
          >
            <ArrowLeft size={20} />
            <span className="vicky-ai-back-text">Boutique</span>
          </button>

          <div className="vicky-ai-brand-group">
            <div className="vicky-ai-brand-avatar">
              <Bot size={22} className="vicky-ai-brand-bot" />
              <span className="vicky-ai-status-pulse" title="Vicky IA est en ligne" />
            </div>
            <div className="vicky-ai-brand-info">
              <div className="vicky-ai-brand-title-row">
                <h1 className="vicky-ai-brand-title">Vicky IA</h1>
                <span className="vicky-ai-badge-official">
                  <ShieldCheck size={12} /> Officiel
                </span>
              </div>
              <p className="vicky-ai-brand-subtitle">
                Conseiller expert Vicky-Shop • En direct
              </p>
            </div>
          </div>
        </div>

        <div className="vicky-ai-header-right">
          <button
            type="button"
            onClick={resetSession}
            disabled={isLoading}
            className="vicky-ai-reset-btn"
            title="Effacer la discussion et recommencer à zéro"
            aria-label="Nouvelle discussion"
          >
            <RotateCcw size={16} />
            <span className="vicky-ai-reset-text">Nouvelle discussion</span>
          </button>
        </div>
      </header>

      {/* Corps principal : Zone de messages défilante */}
      <div className="vicky-ai-chat-body">
        <div className="vicky-ai-chat-inner">
          {/* Bannière de présentation discrète au sommet */}
          <div className="vicky-ai-welcome-banner">
            <div className="vicky-ai-welcome-badge">
              <Sparkles size={14} />
              <span>Intelligence Artificielle Dédiée</span>
            </div>
            <p className="vicky-ai-welcome-text">
              Posez toutes vos questions sur les articles, tarifs de livraison en Côte d'Ivoire,
              le paiement en espèces à la réception ou l'inscription comme vendeur certifié.
            </p>
          </div>

          {/* Suggestions de questions rapides */}
          {suggestions.length > 0 && (
            <div className="vicky-ai-suggestions-wrapper">
              <AIPromptSuggestions
                suggestions={suggestions}
                onSelect={handleSuggestionSelect}
                disabled={isLoading}
              />
            </div>
          )}

          {/* Liste chronologique des messages */}
          <div className="vicky-ai-messages-list" role="log" aria-live="polite">
            {messages.map((msg) => (
              <AIMessageBubble key={msg.id} message={msg} />
            ))}

            {/* Indicateur d'écriture en cours */}
            {isLoading && (
              <div className="vicky-ai-typing-indicator" aria-label="Vicky IA écrit...">
                <div className="vicky-ai-typing-avatar">
                  <Bot size={16} />
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

      {/* Barre de saisie inférieure ancrée */}
      <footer className="vicky-ai-footer">
        <div className="vicky-ai-footer-inner">
          <AIChatInput onSend={sendMessage} isLoading={isLoading} />
        </div>
      </footer>
    </div>
  );
};

export default AIAssistantPage;
