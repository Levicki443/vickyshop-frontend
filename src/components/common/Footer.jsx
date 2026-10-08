import React, { useState } from 'react';
import { useToast } from '../../context/ToastContext';
import logoImg from '../../assets/logo.png';

/**
 * Pied de Page Principal (Footer) Haute Définition de Vicky-Shop.
 * Intègre un bandeau de réassurance, les informations de contact,
 * la navigation catégorisée, les moyens de paiement et la newsletter VIP.
 */
export const Footer = () => {
  const [email, setEmail] = useState('');
  const { addToast } = useToast();

  const handleSubscribe = (e) => {
    e.preventDefault();
    const cleanEmail = email.trim();
    if (!cleanEmail) return;

    addToast(
      '🎉 Bienvenue au Club VIP !',
      'Votre inscription est validée. Un bon d\'achat de 5 000 FCFA vous attend par email !',
      'success'
    );
    setEmail('');
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="main-footer" id="apropos">
      {/* 1. BANDEAU DE RÉASSURANCE CLIENT (TRUST BAR) */}
      <div className="footer-trust-banner">
        <div className="container footer-trust-grid">
          <div className="footer-trust-item">
            <div className="trust-icon-box">
              <i className="fa-solid fa-truck-fast"></i>
            </div>
            <div className="trust-text-box">
              <strong>Livraison Express 24/48h</strong>
              <span>Partout à Abidjan et en Côte d&apos;Ivoire</span>
            </div>
          </div>

          <div className="footer-trust-item">
            <div className="trust-icon-box">
              <i className="fa-solid fa-hand-holding-dollar"></i>
            </div>
            <div className="trust-text-box">
              <strong>Paiement Cash à la Livraison</strong>
              <span>Réglez en espèces à réception du colis</span>
            </div>
          </div>

          <div className="footer-trust-item">
            <div className="trust-icon-box">
              <i className="fa-solid fa-shield-halved"></i>
            </div>
            <div className="trust-text-box">
              <strong>Garantie 100% Authentique</strong>
              <span>Articles neufs et certifiés conformes</span>
            </div>
          </div>

          <div className="footer-trust-item">
            <div className="trust-icon-box">
              <i className="fa-solid fa-headset"></i>
            </div>
            <div className="trust-text-box">
              <strong>Service Client 7j/7</strong>
              <span>Assistance réactive sur WhatsApp &amp; Appel</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. GRILLE PRINCIPALE DU PIED DE PAGE */}
      <div className="container footer-main-content">
        <div className="footer-grid">
          {/* COLONNE 1 : MARQUE, DESCRIPTION & CONTACT */}
          <div className="footer-brand-col">
            <div className="footer-logo-wrapper" onClick={scrollToTop} style={{ cursor: 'pointer' }}>
              <img src={logoImg} alt="Vicky-Shop" className="footer-logo-img" />
              <span className="footer-logo-text">
                Vicky<span className="logo-accent">-Shop</span>
              </span>
            </div>

            <p className="footer-brand-desc">
              Votre marketplace de référence à Abidjan pour la mode chic, le high-tech de pointe et les accessoires haut de gamme.
            </p>

            <div className="footer-contact-list">
              <div className="footer-contact-item">
                <i className="fa-solid fa-phone-volume"></i>
                <a href="tel:+2250554726574">+225 05 54 72 65 74</a>
              </div>
              <div className="footer-contact-item">
                <i className="fa-solid fa-envelope"></i>
                <a href="mailto:contact@vickyshop.ci">contact@vickyshop.ci</a>
              </div>
              <div className="footer-contact-item">
                <i className="fa-solid fa-location-dot"></i>
                <span>Cocody Angré, Abidjan - Côte d&apos;Ivoire</span>
              </div>
            </div>

            <div className="social-links-wrapper">
              <a href="https://facebook.com" target="_blank" rel="noreferrer" className="social-btn facebook" aria-label="Facebook">
                <i className="fa-brands fa-facebook-f"></i>
              </a>
              <a href="https://instagram.com" target="_blank" rel="noreferrer" className="social-btn instagram" aria-label="Instagram">
                <i className="fa-brands fa-instagram"></i>
              </a>
              <a href="https://tiktok.com" target="_blank" rel="noreferrer" className="social-btn tiktok" aria-label="TikTok">
                <i className="fa-brands fa-tiktok"></i>
              </a>
              <a href="https://wa.me/2250554726574" target="_blank" rel="noreferrer" className="social-btn whatsapp" aria-label="WhatsApp">
                <i className="fa-brands fa-whatsapp"></i>
              </a>
            </div>
          </div>

          {/* COLONNE 2 : LIENS RAPIDES & NAVIGATION */}
          <div className="footer-nav-col">
            <h4 className="footer-col-title">Navigation Rapide</h4>
            <ul className="footer-links-list">
              <li>
                <button type="button" className="footer-link-btn" onClick={scrollToTop}>
                  <i className="fa-solid fa-angle-right"></i> Accueil
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className="footer-link-btn"
                  onClick={() => document.getElementById('produits')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  <i className="fa-solid fa-angle-right"></i> Notre Catalogue
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className="footer-link-btn"
                  onClick={() => document.getElementById('flash-sale')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  <i className="fa-solid fa-angle-right"></i> Ventes Flash 🔥
                </button>
              </li>
              <li>
                <a
                  href="/commandes"
                  className="footer-link-btn"
                  onClick={(e) => {
                    e.preventDefault();
                    window.history.pushState(null, '', '/commandes');
                    window.dispatchEvent(new Event('app-navigate'));
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                >
                  <i className="fa-solid fa-angle-right"></i> Suivi de Commande 📦
                </a>
              </li>
              <li>
                <button
                  type="button"
                  className="footer-link-btn"
                  onClick={() => document.getElementById('avis-clients')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  <i className="fa-solid fa-angle-right"></i> Avis Clients Vérifiés ⭐
                </button>
              </li>
            </ul>
          </div>

          {/* COLONNE 3 : MOYENS DE PAIEMENT SÉCURISÉS */}
          <div className="footer-payment-col">
            <h4 className="footer-col-title">Paiements Sécurisés</h4>
            <p className="footer-col-subtext">
              Réglez en toute confiance à la livraison ou par Mobile Money.
            </p>

            <div className="payment-badges-grid">
              <div className="payment-badge-pill wave">
                <i className="fa-solid fa-water"></i>
                <span>Wave</span>
              </div>
              <div className="payment-badge-pill orange">
                <i className="fa-solid fa-mobile-screen"></i>
                <span>Orange Money</span>
              </div>
              <div className="payment-badge-pill mtn">
                <i className="fa-solid fa-bolt"></i>
                <span>MTN MoMo</span>
              </div>
              <div className="payment-badge-pill card">
                <i className="fa-solid fa-credit-card"></i>
                <span>Visa / Mastercard</span>
              </div>
              <div className="payment-badge-pill cash">
                <i className="fa-solid fa-money-bill-wave"></i>
                <span>Cash à la livraison</span>
              </div>
            </div>
          </div>

          {/* COLONNE 4 : NEWSLETTER VIP */}
          <div className="footer-newsletter-col" id="contact">
            <h4 className="footer-col-title">Newsletter Privée</h4>
            <p className="footer-col-subtext">
              Recevez nos promotions exclusives, ventes privées et un bon d&apos;achat de <strong>5 000 FCFA</strong>.
            </p>

            <form className="footer-newsletter-form" onSubmit={handleSubscribe}>
              <div className="newsletter-input-group">
                <i className="fa-solid fa-envelope newsletter-input-icon"></i>
                <input
                  type="email"
                  placeholder="Votre adresse email..."
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="newsletter-input-field"
                />
                <button type="submit" className="newsletter-submit-btn" aria-label="S'abonner">
                  <i className="fa-solid fa-paper-plane"></i>
                </button>
              </div>
            </form>

            <span className="newsletter-privacy-note">
              <i className="fa-solid fa-shield-check"></i>
              <span>Zéro spam garanti. Désabonnement à tout moment.</span>
            </span>
          </div>
        </div>
      </div>

      {/* 3. BARRE INFÉRIEURE (COPYRIGHT & LIENS LÉGAUX) */}
      <div className="footer-bottom-bar">
        <div className="container footer-bottom-flex">
          <p className="copyright-text">
            &copy; {new Date().getFullYear()} <strong>Vicky-Shop Marketplace</strong>. Tous droits réservés.
          </p>

          <div className="footer-bottom-links">
            <span className="made-in-badge">
              <i className="fa-solid fa-heart" style={{ color: 'var(--accent-red)' }}></i> Conçu pour la Côte d&apos;Ivoire 🇨🇮
            </span>
          </div>

          <button
            type="button"
            className="btn-scroll-top"
            onClick={scrollToTop}
            title="Revenir en haut de la page"
            aria-label="Remonter en haut"
          >
            <i className="fa-solid fa-arrow-up"></i>
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
