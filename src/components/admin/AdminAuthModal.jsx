import React, { useState } from 'react';
import { adminLogin, adminRegister } from '../../services/adminApi';
import logoImg from '../../assets/logo.png';

/**
 * Modale secrete d'authentification pour les administrateurs.
 * Accessible uniquement par la combinaison secrete (Double-clic + 10s maintien).
 */
export const AdminAuthModal = ({ isOpen, onClose, onAuthSuccess }) => {
  const [activeTab, setActiveTab] = useState('login'); // 'login' ou 'register'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Formulaire Connexion
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Formulaire Inscription Admin
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regSecretKey, setRegSecretKey] = useState('');

  if (!isOpen) return null;

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await adminLogin(loginEmail, loginPassword);
      if (onAuthSuccess) {
        onAuthSuccess(res.data.user);
      }
      onClose();
    } catch (err) {
      setError(err.message || 'Identifiants administrateur incorrects.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await adminRegister({
        name: regName,
        email: regEmail,
        phone: regPhone,
        password: regPassword,
        adminSecretKey: regSecretKey,
      });
      if (onAuthSuccess) {
        onAuthSuccess(res.data.user);
      }
      onClose();
    } catch (err) {
      setError(err.message || 'Echec de l\'inscription administrateur.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div
        className="admin-modal-container"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="admin-modal-header">
          <div className="admin-modal-title-wrap">
            <img
              src={logoImg}
              alt="Vicky-Shop"
              className="admin-security-logo rounded-logo"
              style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(255,107,0,0.5)', boxShadow: '0 0 12px rgba(255,107,0,0.3)' }}
            />
            <div>
              <h3 className="admin-modal-title">Portail d'Administration</h3>
              <p className="admin-modal-subtitle">Acces securise Vicky-Shop Backoffice</p>
            </div>
          </div>
          <button
            type="button"
            className="admin-modal-close"
            onClick={onClose}
            aria-label="Fermer"
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        {/* Onglets Connexion / Inscription Admin */}
        <div className="admin-modal-tabs">
          <button
            type="button"
            className={`admin-tab-btn ${activeTab === 'login' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('login');
              setError(null);
            }}
          >
            <i className="fa-solid fa-right-to-bracket"></i> Connexion
          </button>
          <button
            type="button"
            className={`admin-tab-btn ${activeTab === 'register' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('register');
              setError(null);
            }}
          >
            <i className="fa-solid fa-user-plus"></i> Nouveau Compte Admin
          </button>
        </div>

        {error && (
          <div className="admin-alert admin-alert-danger">
            <i className="fa-solid fa-circle-exclamation"></i>
            <span>{error}</span>
          </div>
        )}

        {activeTab === 'login' ? (
          <form onSubmit={handleLoginSubmit} className="admin-form">
            <div className="admin-form-group">
              <label htmlFor="admin-login-email">Adresse Email Administrateur</label>
              <div className="admin-input-wrap">
                <i className="fa-solid fa-envelope admin-input-icon"></i>
                <input
                  id="admin-login-email"
                  type="email"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="admin@vickyshop.ci"
                />
              </div>
            </div>

            <div className="admin-form-group">
              <label htmlFor="admin-login-password">Mot de passe</label>
              <div className="admin-input-wrap">
                <i className="fa-solid fa-lock admin-input-icon"></i>
                <input
                  id="admin-login-password"
                  type="password"
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="Votre mot de passe"
                />
              </div>
            </div>

            <button
              type="submit"
              className="admin-btn admin-btn-primary admin-btn-block"
              disabled={loading}
            >
              {loading ? (
                <>
                  <i className="fa-solid fa-spinner fa-spin"></i> Authentification en cours...
                </>
              ) : (
                <>
                  <i className="fa-solid fa-unlock-keyhole"></i> Acceder au Backoffice
                </>
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegisterSubmit} className="admin-form">
            <div className="admin-form-group">
              <label htmlFor="admin-reg-name">Nom complet</label>
              <div className="admin-input-wrap">
                <i className="fa-solid fa-user admin-input-icon"></i>
                <input
                  id="admin-reg-name"
                  type="text"
                  required
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="Nom & Prenoms"
                />
              </div>
            </div>

            <div className="admin-form-group">
              <label htmlFor="admin-reg-email">Adresse Email</label>
              <div className="admin-input-wrap">
                <i className="fa-solid fa-envelope admin-input-icon"></i>
                <input
                  id="admin-reg-email"
                  type="email"
                  required
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="admin@vickyshop.ci"
                />
              </div>
            </div>

            <div className="admin-form-group">
              <label htmlFor="admin-reg-phone">Telephone (optionnel)</label>
              <div className="admin-input-wrap">
                <i className="fa-solid fa-phone admin-input-icon"></i>
                <input
                  id="admin-reg-phone"
                  type="tel"
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                  placeholder="0700000000"
                />
              </div>
            </div>

            <div className="admin-form-group">
              <label htmlFor="admin-reg-pass">Mot de passe</label>
              <div className="admin-input-wrap">
                <i className="fa-solid fa-lock admin-input-icon"></i>
                <input
                  id="admin-reg-pass"
                  type="password"
                  required
                  minLength={6}
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="Minimum 6 caracteres"
                />
              </div>
            </div>

            <div className="admin-form-group">
              <label htmlFor="admin-reg-secret">Cle Secrete d'Administration</label>
              <div className="admin-input-wrap">
                <i className="fa-solid fa-key admin-input-icon"></i>
                <input
                  id="admin-reg-secret"
                  type="password"
                  required
                  value={regSecretKey}
                  onChange={(e) => setRegSecretKey(e.target.value)}
                  placeholder="Cle secrete d'autorisation"
                />
              </div>
            </div>

            <button
              type="submit"
              className="admin-btn admin-btn-primary admin-btn-block"
              disabled={loading}
            >
              {loading ? (
                <>
                  <i className="fa-solid fa-spinner fa-spin"></i> Creation du compte...
                </>
              ) : (
                <>
                  <i className="fa-solid fa-user-shield"></i> Creer le compte Administrateur
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
