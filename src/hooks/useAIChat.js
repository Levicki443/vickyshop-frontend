import { useState, useEffect, useCallback, useRef } from 'react';
import {
  sendChatMessage,
  fetchChatHistory,
  resetChatSession,
  fetchChatSuggestions,
} from '../services/aiApi';

const SESSION_STORAGE_KEY = 'vicky_ai_session_id';

const generateSessionId = () => {
  return `vicky_ai_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
};

const DEFAULT_CLIENT_SUGGESTIONS = [
  { id: 'sug-1', label: 'Livraison & Frais', prompt: 'Quels sont vos tarifs et délais de livraison à Abidjan et à l\'intérieur ?' },
  { id: 'sug-2', label: 'Paiement à la livraison', prompt: 'Comment fonctionne le paiement en espèces à la livraison (Cash on Delivery) ?' },
  { id: 'sug-3', label: 'Comment commander', prompt: 'Comment passer une commande sur Vicky-Shop étape par étape ?' },
  { id: 'sug-4', label: 'Échange & Tailles', prompt: 'Que faire si la taille d\'un vêtement ou d\'une paire de chaussures ne me convient pas ?' },
];

const DEFAULT_SELLER_SUGGESTIONS = [
  { id: 'sel-1', label: 'Ajouter un article', prompt: 'Comment puis-je ajouter un nouveau produit dans ma boutique vendeur ?' },
  { id: 'sel-2', label: 'Gestion des commandes', prompt: 'Comment suivre et traiter les commandes reçues sur mon espace vendeur ?' },
  { id: 'sel-3', label: 'Partage sur réseaux', prompt: 'Comment diffuser les liens de mes produits sur WhatsApp, Facebook et TikTok ?' },
  { id: 'sel-4', label: 'Conseils de vente', prompt: 'Quelles sont les bonnes pratiques pour soigner mes photos et mes descriptions d\'articles ?' },
];

/**
 * Hook personnalisé pour orchestrer la conversation avec Vicky IA.
 * Gère l'historique, les cartes produits, les suggestions adaptées et la persistance.
 *
 * @param {Object} [currentUser] - Profil de l'utilisateur authentifié
 * @param {Array<string>} [recentlyViewedIds] - Liste des identifiants des produits vus
 */
export const useAIChat = (currentUser = null, recentlyViewedIds = []) => {
  const [sessionId, setSessionId] = useState(() => {
    let saved = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!saved) {
      saved = generateSessionId();
      localStorage.setItem(SESSION_STORAGE_KEY, saved);
    }
    return saved;
  });

  const userName = currentUser?.name?.trim() || 'cher client';
  const isSeller = currentUser?.role === 'vendeur';

  const buildInitialGreeting = useCallback(
    (name, sellerMode) => ({
      id: 'welcome-msg',
      role: 'assistant',
      content: sellerMode
        ? `Bonjour ${name}, je suis Vicky IA, votre conseillère dédiée Vicky-Shop. Je peux vous accompagner pour ajouter des articles, optimiser vos descriptions et suivre vos commandes vendeur. Comment puis-je vous aider ?`
        : `Bonjour ${name}, je suis Vicky IA, votre conseillère officielle Vicky-Shop. Que vous cherchiez un article particulier, des informations sur la livraison ou un conseil pour passer commande, je suis là pour vous guider !`,
      products: [],
      actions: [],
      createdAt: new Date().toISOString(),
      isSafe: true,
    }),
    []
  );

  const [messages, setMessages] = useState(() => [buildInitialGreeting(userName, isSeller)]);
  const [suggestions, setSuggestions] = useState(isSeller ? DEFAULT_SELLER_SUGGESTIONS : DEFAULT_CLIENT_SUGGESTIONS);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const isInitializedRef = useRef(false);

  // Mise à jour du message de bienvenue et des suggestions en cas de changement de profil
  useEffect(() => {
    setMessages((prev) => {
      if (prev.length === 1 && prev[0].id === 'welcome-msg') {
        return [buildInitialGreeting(userName, isSeller)];
      }
      return prev;
    });

    setSuggestions(isSeller ? DEFAULT_SELLER_SUGGESTIONS : DEFAULT_CLIENT_SUGGESTIONS);
  }, [userName, isSeller, buildInitialGreeting]);

  // Initialisation : chargement des suggestions serveur et de l'historique
  useEffect(() => {
    let isMounted = true;

    const initialize = async () => {
      try {
        const [loadedSuggestions, historyData] = await Promise.allSettled([
          fetchChatSuggestions(currentUser?.role || ''),
          fetchChatHistory(sessionId),
        ]);

        if (!isMounted) return;

        if (loadedSuggestions.status === 'fulfilled' && loadedSuggestions.value?.length > 0) {
          setSuggestions(loadedSuggestions.value);
        }

        if (
          historyData.status === 'fulfilled' &&
          historyData.value?.messages &&
          historyData.value.messages.length > 0
        ) {
          const formattedHistory = historyData.value.messages.map((m, idx) => ({
            id: m._id || `hist-${idx}`,
            role: m.role,
            content: m.content,
            products: Array.isArray(m.products) ? m.products : [],
            actions: Array.isArray(m.actions) ? m.actions : [],
            createdAt: m.createdAt || new Date().toISOString(),
            isSafe: m.isSafe !== false,
          }));
          setMessages([buildInitialGreeting(userName, isSeller), ...formattedHistory]);
        }
      } catch (err) {
        console.warn('[useAIChat] Erreur lors de l\'initialisation :', err);
      } finally {
        isInitializedRef.current = true;
      }
    };

    initialize();

    return () => {
      isMounted = false;
    };
  }, [sessionId, userName, isSeller, currentUser?.role, buildInitialGreeting]);

  /**
   * Envoie un message à Vicky IA avec enrichissement contextuel.
   */
  const sendMessage = useCallback(
    async (text) => {
      if (!text || !text.trim() || isLoading) return;

      const trimmedText = text.trim();
      const userMessageId = `user-${Date.now()}`;

      const userMsg = {
        id: userMessageId,
        role: 'user',
        content: trimmedText,
        products: [],
        actions: [],
        createdAt: new Date().toISOString(),
        isSafe: true,
      };

      setMessages((prev) => [...prev, userMsg]);
      setIsLoading(true);
      setError(null);

      try {
        const result = await sendChatMessage({
          sessionId,
          message: trimmedText,
          userName,
          recentlyViewedIds,
        });

        const assistantMsg = {
          id: `ai-${Date.now()}`,
          role: 'assistant',
          content: result.reply,
          products: Array.isArray(result.products) ? result.products : [],
          actions: Array.isArray(result.actions) ? result.actions : [],
          createdAt: result.createdAt || new Date().toISOString(),
          isSafe: result.isSafe !== false,
          isFallback: !!result.isFallback,
        };

        setMessages((prev) => [...prev, assistantMsg]);
      } catch (err) {
        console.error('[useAIChat] Erreur envoi message :', err);
        setError(err.message || 'Une erreur est survenue lors de l\'échange avec Vicky IA.');

        const errorMsg = {
          id: `err-${Date.now()}`,
          role: 'assistant',
          content:
            'Désolé, je rencontre des difficultés temporaires pour vous répondre. Veuillez réessayer dans quelques instants.',
          products: [],
          actions: [],
          createdAt: new Date().toISOString(),
          isSafe: true,
          isError: true,
        };
        setMessages((prev) => [...prev, errorMsg]);
      } finally {
        setIsLoading(false);
      }
    },
    [sessionId, userName, recentlyViewedIds, isLoading]
  );

  /**
   * Réinitialise totalement la session de discussion courante.
   */
  const handleResetSession = useCallback(async () => {
    try {
      setIsLoading(true);
      await resetChatSession(sessionId);
    } catch (err) {
      console.warn('[useAIChat] Erreur reset session serveur :', err);
    } finally {
      const newSessionId = generateSessionId();
      localStorage.setItem(SESSION_STORAGE_KEY, newSessionId);
      setSessionId(newSessionId);
      setMessages([buildInitialGreeting(userName, isSeller)]);
      setError(null);
      setIsLoading(false);
    }
  }, [sessionId, userName, isSeller, buildInitialGreeting]);

  return {
    sessionId,
    userName,
    messages,
    suggestions,
    isLoading,
    error,
    sendMessage,
    resetSession: handleResetSession,
  };
};

export default useAIChat;
