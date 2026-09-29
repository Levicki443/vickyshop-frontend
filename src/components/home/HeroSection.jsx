import React from 'react';

export const HeroSection = ({ onExploreClick }) => {
  return (
    <section className="hero" id="accueil">
      <div className="bg-orb orb-1"></div>
      <div className="bg-orb orb-2"></div>
      <div className="bg-orb orb-3"></div>

      <div className="container hero-container">
        <div className="hero-text-content">
          <div className="hero-badge">
            <span className="pulse-dot"></span> Nouvelle Collection 2026
          </div>
          <h1 className="hero-title">
            Sublimez Votre Style avec <span className="gradient-text">Vicky-Shop</span>
          </h1>
          <p className="hero-description">
            Découvrez une sélection exclusive de prêt-à-porter tendance, d'accessoires de mode
            et d'équipements High-Tech de pointe au meilleur prix en FCFA.
          </p>
          <div className="hero-cta-group">
            <button
              type="button"
              className="btn btn-primary btn-hero"
              onClick={onExploreClick}
            >
              <span>Explorer le catalogue</span>
              <i className="fa-solid fa-arrow-right"></i>
            </button>
            <a href="#flash-sale" className="btn btn-secondary btn-hero">
              <i className="fa-solid fa-fire"></i>
              <span>Vente Flash</span>
            </a>
          </div>

          <div className="hero-trust-stats">
            <div className="trust-item">
              <strong>+5 000</strong>
              <span>Clients Satisfaits</span>
            </div>
            <div className="trust-item">
              <strong>100%</strong>
              <span>Articles Certifiés</span>
            </div>
            <div className="trust-item">
              <strong>24/48h</strong>
              <span>Livraison Rapide</span>
            </div>
          </div>
        </div>

        <div className="hero-visual">
          <div className="hero-image-card">
            <img
              src="https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=800"
              alt="Mode et Shopping Vicky-Shop"
            />
            <div className="floating-card float-1">
              <i className="fa-solid fa-bolt text-warning"></i>
              <div>
                <strong>Vente Flash</strong>
                <small>Jusqu'à -50%</small>
              </div>
            </div>
            <div className="floating-card float-2">
              <i className="fa-solid fa-shield-check text-success"></i>
              <div>
                <strong>Paiement Garanti</strong>
                <small>Wave & Mobile Money</small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
