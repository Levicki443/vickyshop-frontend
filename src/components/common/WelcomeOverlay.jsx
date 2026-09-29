import React, { useState, useEffect, useRef, useCallback } from 'react';
import logoImg from '../../assets/logo.png';
import '../../styles/welcome-overlay.css';

/**
 * Composant LandingScreen & Animation de Bienvenue Vicky-Shop
 * Gère intelligemment le réveil à froid du Backend hébergé sur Render (jusqu'à 90s max).
 */
export const WelcomeOverlay = ({ onBackendReady }) => {
  const [isVisible, setIsVisible] = useState(() => {
    // Si la session actuelle a déjà réveillé le serveur récemment, on n'affiche qu'un fondu ultra court
    return true;
  });
  const [isFading, setIsFading] = useState(false);
  const [status, setStatus] = useState('connecting'); // 'connecting' | 'waking' | 'ready' | 'timeout'
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const timerRef = useRef(null);
  const pollRef = useRef(null);
  const isDoneRef = useRef(false);

  // Construction de l'URL de santé du backend
  const rawBaseUrl = (import.meta.env.VITE_URL || import.meta.env.VITE_API_URL || '/api')
    .trim()
    .replace(/\/+$/, '');
  const API_BASE_URL = rawBaseUrl.endsWith('/api') ? rawBaseUrl : `${rawBaseUrl}/api`;
  const HEALTH_URL = `${API_BASE_URL}/health`;

  // Fermeture douce avec animation Fade
  const handleDismiss = useCallback(() => {
    if (isFading) return;
    if (timerRef.current) clearInterval(timerRef.current);
    if (pollRef.current) clearInterval(pollRef.current);
    setIsFading(true);
    setTimeout(() => {
      setIsVisible(false);
      sessionStorage.setItem('vickyshop_backend_woken', 'true');
    }, 750);
  }, [isFading]);

  // Action lorsque le backend répond
  const handleSuccess = useCallback(() => {
    if (isDoneRef.current) return;
    isDoneRef.current = true;
    if (timerRef.current) clearInterval(timerRef.current);
    if (pollRef.current) clearInterval(pollRef.current);
    setStatus('ready');

    // Déclenchement de la recharge des données fraîches
    if (onBackendReady) {
      onBackendReady();
    }

    // Petite temporisation pour savourer le succès puis fondu
    setTimeout(() => {
      handleDismiss();
    }, 650);
  }, [handleDismiss, onBackendReady]);

  // Test de ping vers le backend
  const checkBackendHealth = useCallback(async () => {
    if (isDoneRef.current) return;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const response = await fetch(HEALTH_URL, {
        method: 'GET',
        cache: 'no-store',
        headers: { 'Accept': 'application/json' },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        handleSuccess();
      }
    } catch (err) {
      // Échec temporaire (serveur Render en cours de démarrage) -> la boucle continuera
    }
  }, [HEALTH_URL, handleSuccess]);

  // Lancement du réveil et du chronomètre
  const startWakingProcess = useCallback(() => {
    isDoneRef.current = false;
    setStatus('connecting');
    setElapsedSeconds(0);

    // 1. Premier ping immédiat
    checkBackendHealth();

    // 2. Chronomètre à la seconde
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setElapsedSeconds((prev) => {
        const next = prev + 1;
        if (next >= 4) {
          setStatus((current) => (current === 'connecting' ? 'waking' : current));
        }
        // Timeout intelligent après 90 secondes (1 min 30 s)
        if (next >= 90 && !isDoneRef.current) {
          if (pollRef.current) clearInterval(pollRef.current);
          if (timerRef.current) clearInterval(timerRef.current);
          setStatus('timeout');
        }
        return next;
      });
    }, 1000);

    // 3. Boucle de sondage toutes les 2.5 secondes
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = setInterval(() => {
      if (!isDoneRef.current) {
        checkBackendHealth();
      }
    }, 2500);
  }, [checkBackendHealth]);

  useEffect(() => {
    startWakingProcess();

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  if (!isVisible) return null;

  // Calcul du pourcentage estimé de progression (sur 90 secondes max)
  const progressPercent = Math.min(100, Math.round((elapsedSeconds / 90) * 100));

  // Message dynamique adapté au temps d'attente
  let statusTitle = "Connexion à Vicky-Shop...";
  let statusSubtitle = "Initialisation des services sécurisés";

  if (status === 'ready') {
    statusTitle = "Serveur Prêt !";
    statusSubtitle = "Bienvenue sur votre boutique en ligne Vicky-Shop.";
  } else if (status === 'timeout') {
    statusTitle = "Délai d'attente dépassé";
    statusSubtitle = "Le serveur met plus de temps que prévu à répondre. Vous pouvez réessayer ou explorer la boutique.";
  } else if (elapsedSeconds >= 45) {
    statusTitle = "Presque prêt...";
    statusSubtitle = "Dernières secondes d'initialisation du catalogue Render.";
  } else if (elapsedSeconds >= 12) {
    statusTitle = "Réveil du serveur en cours...";
    statusSubtitle = "Hébergement Render en cours de sortie de veille. Merci de votre patience ⚡";
  } else if (elapsedSeconds >= 4) {
    statusTitle = "Initialisation du Cloud...";
    statusSubtitle = "Vérification de la liaison avec l'API sécurisée.";
  }

  return (
    <div className={`welcome-overlay ${isFading ? 'fade-out' : ''}`}>
      <div className="welcome-glow-aura" />

      <div className="welcome-card">
        {/* Logo Vicky-Shop Arrondi avec Cercle Pulsant */}
        <div className="welcome-logo-wrap">
          <div className="welcome-logo-pulse-ring" />
          <div className="welcome-logo-pulse-ring-inner" />
          <img
            src={logoImg}
            alt="Logo Vicky-Shop"
            className="welcome-logo-img"
          />
        </div>

        {/* Titre & Slogan */}
        <h1 className="welcome-brand-title">
          Vicky<span style={{ color: '#ff6b00' }}>-Shop</span>
        </h1>
        <p className="welcome-brand-subtitle">
          Mode, High-Tech & Accessoires Premium
        </p>

        {/* Boîte d'état du réveil du Backend */}
        <div className="welcome-status-box">
          <div className="welcome-status-indicator">
            {status === 'ready' ? (
              <i className="fa-solid fa-circle-check welcome-ready-icon"></i>
            ) : status === 'timeout' ? (
              <i className="fa-solid fa-triangle-exclamation" style={{ color: '#f59e0b', fontSize: '1.1rem' }}></i>
            ) : (
              <div className="welcome-spinner"></div>
            )}
            <span>{statusTitle}</span>
          </div>

          <p className="welcome-status-desc">{statusSubtitle}</p>

          {/* Barre de progression pendant l'attente */}
          {status !== 'timeout' && (
            <div className="welcome-progress-wrap">
              <div
                className="welcome-progress-bar"
                style={{
                  width: status === 'ready' ? '100%' : `${Math.max(8, progressPercent)}%`,
                  background: status === 'ready' ? '#10b981' : undefined,
                }}
              />
            </div>
          )}

          {/* Chronomètre d'attente */}
          {status !== 'ready' && (
            <div className="welcome-timer-badge">
              <i className="fa-solid fa-clock"></i>
              <span>{elapsedSeconds}s / 90s max</span>
            </div>
          )}
        </div>

        {/* Actions utilisateur intelligentes */}
        <div className="welcome-actions">
          {status === 'timeout' ? (
            <>
              <button
                type="button"
                className="welcome-retry-btn"
                onClick={startWakingProcess}
              >
                <i className="fa-solid fa-rotate-right"></i>
                <span>Réessayer la connexion</span>
              </button>
              <button
                type="button"
                className="welcome-continue-secondary-btn"
                onClick={handleDismiss}
              >
                Accéder quand même à la boutique
              </button>
            </>
          ) : (
            elapsedSeconds >= 8 && status !== 'ready' && (
              <button
                type="button"
                className="welcome-skip-btn"
                onClick={handleDismiss}
                title="Accéder immédiatement à l'interface"
              >
                <span>Accéder directement à la boutique</span>
                <i className="fa-solid fa-arrow-right"></i>
              </button>
            )
          )}
        </div>
      </div>
    </div>
  );
};
