import React from 'react';
import { useScrollReveal } from '../../hooks/useScrollReveal';

export const HeroSection = ({ onExploreClick }) => {
  const heroRef = useScrollReveal();

  return (
    <section className="hero" id="accueil" ref={heroRef}>
      <div className="bg-orb orb-1 motion-pulse"></div>
      <div className="bg-orb orb-2 motion-pulse"></div>
      <div className="bg-orb orb-3 motion-pulse"></div>

      <div className="container hero-container">
        <div className="hero-text-content reveal-on-scroll reveal-left">
          <h1 className="hero-title">
            Sublimez Votre Style avec <span className="gradient-text">Vicky-Shop</span>
          </h1>
          <p className="hero-description">
            Découvrez une sélection exclusive de prêt-à-porter tendance, d&apos;accessoires de mode
            et d&apos;équipements High-Tech de pointe au meilleur prix en FCFA.
          </p>
          <div className="hero-cta-group">
            <button
              type="button"
              className="btn btn-primary btn-hero motion-press"
              onClick={onExploreClick}
            >
              <span>Explorer le catalogue</span>
              <i className="fa-solid fa-arrow-right"></i>
            </button>
            <a href="#flash-sale" className="btn btn-secondary btn-hero motion-press">
              <i className="fa-solid fa-fire"></i>
              <span>Vente Flash</span>
            </a>
          </div>

          <div className="hero-trust-stats stagger-cascade">
            <div className="trust-item motion-lift">
              <strong>+5 000</strong>
              <span>Clients Satisfaits</span>
            </div>
            <div className="trust-item motion-lift">
              <strong>100%</strong>
              <span>Articles Certifiés</span>
            </div>
            <div className="trust-item motion-lift">
              <strong>24/48h</strong>
              <span>Livraison Rapide</span>
            </div>
          </div>
        </div>

        <div className="hero-visual reveal-on-scroll reveal-right">
          <div className="hero-image-card motion-lift">
            <img
              src="https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1000&q=80"
              alt="Mode et Shopping Vicky-Shop"
            />
            <div className="floating-card float-1 motion-float">
              <i className="fa-solid fa-bolt text-warning"></i>
              <div>
                <strong>Vente Flash</strong>
                <small>Jusqu&apos;à -50%</small>
              </div>
            </div>
            <div className="floating-card float-2 motion-float">
              <i className="fa-solid fa-shield-check text-success"></i>
              <div>
                <strong>Paiement Garanti</strong>
                <small>Wave &amp; Mobile Money</small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

