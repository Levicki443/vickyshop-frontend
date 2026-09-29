import React, { useState } from 'react';
import { useToast } from '../../context/ToastContext';
import logoImg from '../../assets/logo.png';

export const Footer = () => {
  const [email, setEmail] = useState('');
  const { addToast } = useToast();

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email) return;
    addToast('Bienvenue au Club !', 'Vous avez reçu un bon d\'achat de 5 000 FCFA par email.', 'success');
    setEmail('');
  };

  return (
    <footer className="main-footer" id="apropos">
      <div className="container footer-grid">
        <div className="footer-brand">
          <div className="logo">
            <img src={logoImg} alt="Vicky-Shop" className="logo-img rounded-logo" />
            <span className="logo-text">
              Vicky<span className="logo-accent">-Shop</span>
            </span>
          </div>
          <p className="brand-desc">
            Votre référence e-commerce d'excellence pour la mode, le high-tech et les accessoires haut de gamme.
          </p>
          <div className="social-links">
            <a href="https://facebook.com" target="_blank" rel="noreferrer" aria-label="Facebook">
              <i className="fa-brands fa-facebook-f"></i>
            </a>
            <a href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram">
              <i className="fa-brands fa-instagram"></i>
            </a>
            <a href="https://tiktok.com" target="_blank" rel="noreferrer" aria-label="TikTok">
              <i className="fa-brands fa-tiktok"></i>
            </a>
            <a href="https://wa.me/2250700000000" target="_blank" rel="noreferrer" aria-label="WhatsApp">
              <i className="fa-brands fa-whatsapp"></i>
            </a>
          </div>
        </div>

        <div className="footer-col">
          <h4>Liens Rapides</h4>
          <ul>
            <li><a href="#accueil">Accueil</a></li>
            <li><a href="#produits">Tous les Produits</a></li>
            <li><a href="#flash-sale">Ventes Flash</a></li>
            <li><a href="#contact">Nous Contacter</a></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>Moyens de Paiement</h4>
          <p className="text-muted small mb-2">Paiements 100% sécurisés</p>
          <div className="payment-badges-wrap">
            <span className="payment-badge"><i className="fa-solid fa-water"></i> Wave</span>
            <span className="payment-badge"><i className="fa-solid fa-mobile-screen"></i> Orange Money</span>
            <span className="payment-badge"><i className="fa-solid fa-bolt"></i> MTN MoMo</span>
            <span className="payment-badge"><i className="fa-solid fa-credit-card"></i> Visa / Mastercard</span>
          </div>
        </div>

        <div className="footer-col" id="contact">
          <h4>Newsletter Privée</h4>
          <p className="text-muted small">Recevez nos promos secrètes et réductions exclusives.</p>
          <form className="footer-newsletter" onSubmit={handleSubscribe}>
            <input
              type="email"
              placeholder="Votre email..."
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button type="submit" className="btn btn-primary">
              <i className="fa-solid fa-paper-plane"></i>
            </button>
          </form>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="container">
          <p>© {new Date().getFullYear()} Vicky-Shop. Tous droits réservés. Développé avec la stack MERN.</p>
        </div>
      </div>
    </footer>
  );
};
