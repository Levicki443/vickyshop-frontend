import React, { useState, useEffect } from 'react';
import logoImg from '../../assets/logo.png';

export const PwaInstallModal = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isIos, setIsIos] = useState(false);

  useEffect(() => {
    // Détection si l'application est déjà installée en mode standalone
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true;

    if (isStandalone) return;

    // Vérifier si l'utilisateur a déjà refusé l'installation récemment
    const dismissedAt = localStorage.getItem('vicky_pwa_dismissed');
    if (dismissedAt) {
      const hoursSinceDismissed = (Date.now() - parseInt(dismissedAt, 10)) / (1000 * 60 * 60);
      if (hoursSinceDismissed < 24) return; // Ne pas ré-afficher pendant 24h
    }

    // Détection iOS Safari
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    const isSafari = /safari/.test(userAgent) && !/crios|fxios|chrome/.test(userAgent);

    if (isIosDevice) {
      setIsIos(true);
      // Afficher après un léger délai de 2.5 secondes
      const timer = setTimeout(() => setIsOpen(true), 2500);
      return () => clearTimeout(timer);
    }

    // Écoute de l'événement PWA standard (Android / Chrome / Edge)
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Afficher la modal après 2.5 secondes
      setTimeout(() => setIsOpen(true), 2500);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsOpen(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    localStorage.setItem('vicky_pwa_dismissed', Date.now().toString());
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay pwa-modal-overlay" onClick={handleDismiss}>
      <div className="modal-box pwa-install-box animate-scale-up" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="modal-close" onClick={handleDismiss} aria-label="Fermer">
          <i className="fa-solid fa-xmark"></i>
        </button>

        <div className="pwa-header-brand">
          <div className="pwa-app-icon-wrap">
            <img src={logoImg} alt="Vicky-Shop" className="pwa-app-logo" />
            <span className="pwa-sparkle-badge"><i className="fa-solid fa-bolt"></i></span>
          </div>
          <h3 className="pwa-title">Installez Vicky-Shop</h3>
          <p className="pwa-subtitle">
            Profitez d&apos;une expérience shopping ultra-fluide, rapide et accessible en un clic depuis votre écran d&apos;accueil !
          </p>
        </div>

        <div className="pwa-benefits-list">
          <div className="pwa-benefit-item">
            <i className="fa-solid fa-bolt text-primary"></i>
            <span>Chargement instantané &amp; navigation plein écran</span>
          </div>
          <div className="pwa-benefit-item">
            <i className="fa-solid fa-bell text-warning"></i>
            <span>Notifications en direct des offres &amp; ventes flash</span>
          </div>
          <div className="pwa-benefit-item">
            <i className="fa-solid fa-shield-check text-success"></i>
            <span>Accès sécurisé à vos commandes et favoris</span>
          </div>
        </div>

        {isIos ? (
          <div className="pwa-ios-instructions">
            <div className="ios-step">
              <span className="ios-step-num">1</span>
              <span>
                Appuyez sur le bouton <strong>Partager</strong> <i className="fa-solid fa-arrow-up-from-bracket text-primary"></i> en bas de Safari.
              </span>
            </div>
            <div className="ios-step">
              <span className="ios-step-num">2</span>
              <span>
                Faites défiler vers le bas et appuyez sur <strong>« Sur l&apos;écran d&apos;accueil »</strong> <i className="fa-solid fa-square-plus text-primary"></i>.
              </span>
            </div>
            <div className="ios-step">
              <span className="ios-step-num">3</span>
              <span>
                Appuyez sur <strong>Ajouter</strong> en haut à droite pour finaliser.
              </span>
            </div>
            <button type="button" className="btn btn-primary btn-block pwa-understood-btn" onClick={handleDismiss}>
              <i className="fa-solid fa-check"></i> J&apos;ai compris
            </button>
          </div>
        ) : (
          <div className="pwa-actions-row">
            <button type="button" className="btn btn-secondary pwa-btn-later" onClick={handleDismiss}>
              Plus tard
            </button>
            <button type="button" className="btn btn-primary pwa-btn-install" onClick={handleInstallClick}>
              <i className="fa-solid fa-download"></i> Installer l&apos;application
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PwaInstallModal;
