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

const DEFAULT_SUGGESTIONS = [
  {
    id: 'sug-1',
    label: 'Livraison & Frais',
    prompt: 'Quels sont vos tarifs et délais de livraison à Abidjan et à l\'intérieur ?',
  },
  {
    id: 'sug-2',
    label: 'Paiement à la livraison',
    prompt: 'Comment fonctionne le paiement en espèces à la livraison (Cash on Delivery) ?',
  },
  {
    id: 'sug-3',
    label: 'Devenir Vendeur',
    prompt: 'Comment puis-je m\'inscrire et vendre mes produits sur Vicky-Shop ?',
  },
  {
    id: 'sug-4',
    label: 'Échange & Tailles',
    prompt: 'Que faire si la taille d\'un vêtement ou d\'une paire de chaussures ne me convient pas ?',
  },
];

/**
 * Hook personnalisé pour orchestrer la conversation avec Vicky IA.
 * Gère l'historique, les suggestions, la saisie utilisateur et le statut de chargement.
 *
 * @param {Object} [currentUser] - Utilisateur connecté issu du contexte Auth
 */
export const useAIChat = (currentUser = null) => {
  const [sessionId, setSessionId] = useState(() => {
    let saved = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!saved) {
      saved = generateSessionId();
      localStorage.setItem(SESSION_STORAGE_KEY, saved);
    }
    return saved;
  });

  const userName = currentUser?.name?.trim() || 'cher client';

  const buildInitialGreeting = useCallback(
    (name) => ({
      id: 'welcome-msg',
      role: 'assistant',
      content: `Bonjour ${name}, je suis Vicky IA, comment puis-je vous aider aujourd'hui ?`,
      createdAt: new Date().toISOString(),
      isSafe: true,
    }),
    []
  );

  const [messages, setMessages] = useState(() => [buildInitialGreeting(userName)]);
  const [suggestions, setSuggestions] = useState(DEFAULT_SUGGESTIONS);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const isInitializedRef = useRef(false);

  // Mise à jour du message de bienvenue lorsque le nom de l'utilisateur change (ex: connexion)
  useEffect(() => {
    setMessages((prev) => {
      if (prev.length === 1 && prev[0].id === 'welcome-msg') {
        return [buildInitialGreeting(userName)];
      }
      return prev;
    });
  }, [userName, buildInitialGreeting]);

  // Initialisation : chargement des suggestions et récupération éventuelle de l'historique
  useEffect(() => {
    let isMounted = true;

    const initialize = async () => {
      try {
        const [loadedSuggestions, historyData] = await Promise.allSettled([
          fetchChatSuggestions(),
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
            createdAt: m.createdAt || new Date().toISOString(),
            isSafe: m.isSafe !== false,
          }));
          setMessages([buildInitialGreeting(userName), ...formattedHistory]);
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
  }, [sessionId, userName, buildInitialGreeting]);

  /**
   * Envoie un message de l'utilisateur à Vicky IA.
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
        });

        const assistantMsg = {
          id: `ai-${Date.now()}`,
          role: 'assistant',
          content: result.reply,
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
          createdAt: new Date().toISOString(),
          isSafe: true,
          isError: true,
        };
        setMessages((prev) => [...prev, errorMsg]);
      } finally {
        setIsLoading(false);
      }
    },
    [sessionId, userName, isLoading]
  );

  /**
   * Réinitialise totalement la session de conversation courante.
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
      setMessages([buildInitialGreeting(userName)]);
      setError(null);
      setIsLoading(false);
    }
  }, [sessionId, userName, buildInitialGreeting]);

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
