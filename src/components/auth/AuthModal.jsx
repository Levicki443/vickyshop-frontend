import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import logoImg from '../../assets/logo.png';

export const AuthModal = () => {
  const { isAuthModalOpen, closeAuthModal, login, register } = useAuth();
  const { addToast } = useToast();

  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // États des formulaires
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    address: '',
    city: 'Abidjan',
  });

  if (!isAuthModalOpen) return null;

  const handleLoginChange = (e) => {
    setLoginForm({ ...loginForm, [e.target.name]: e.target.value });
    setErrorMessage('');
  };

  const handleRegisterChange = (e) => {
    setRegisterForm({ ...registerForm, [e.target.name]: e.target.value });
    setErrorMessage('');
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');
    try {
      const user = await login(loginForm.email, loginForm.password);
      addToast('Ravi de vous revoir !', `Bienvenue, ${user.name}.`, 'success');
      setLoginForm({ email: '', password: '' });
    } catch (err) {
      setErrorMessage(err.message || 'Identifiants invalides.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();

    if (!registerForm.name.trim() || registerForm.name.trim().length < 2) {
      setErrorMessage('Le nom complet doit comporter au moins 2 caractères.');
      return;
    }

    const pureDigits = registerForm.phone.replace(/\D/g, '');
    if (!registerForm.phone.trim() || pureDigits.length < 10) {
      setErrorMessage('Le numéro de téléphone doit comporter au moins 10 chiffres (ex : 0708091011 ou 0102030405).');
      return;
    }

    setLoading(true);
    setErrorMessage('');
    try {
      const user = await register(registerForm);
      addToast('Compte créé avec succès !', `Bienvenue chez Vicky-Shop, ${user.name}.`, 'success');
      setRegisterForm({
        name: '',
        email: '',
        phone: '',
        password: '',
        address: '',
        city: 'Abidjan',
      });
    } catch (err) {
      setErrorMessage(err.message || 'Erreur lors de l\'inscription.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={closeAuthModal}>
      <div className="modal-box modal-auth" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className="modal-close"
          onClick={closeAuthModal}
          aria-label="Fermer"
        >
          <i className="fa-solid fa-xmark"></i>
        </button>

        <div className="auth-header">
          <div className="auth-logo">
            <img src={logoImg} alt="Vicky-Shop" className="auth-logo-img rounded-logo" />
            <span>Vicky<span style={{ color: '#ff6b00' }}>-Shop</span></span>
          </div>
          <p className="auth-subtitle">
            {mode === 'login'
              ? 'Connectez-vous pour commander en toute simplicité.'
              : 'Créez votre compte pour suivre vos commandes et bénéficier d\'offres exclusives.'}
          </p>
        </div>

        {/* Onglets Bascule Connexion / Inscription */}
        <div className="auth-tabs">
          <button
            type="button"
            className={`auth-tab-btn ${mode === 'login' ? 'active' : ''}`}
            onClick={() => {
              setMode('login');
              setErrorMessage('');
            }}
          >
            <i className="fa-solid fa-arrow-right-to-bracket"></i> Connexion
          </button>
          <button
            type="button"
            className={`auth-tab-btn ${mode === 'register' ? 'active' : ''}`}
            onClick={() => {
              setMode('register');
              setErrorMessage('');
            }}
          >
            <i className="fa-solid fa-user-plus"></i> Inscription
          </button>
        </div>

        {/* Message d'erreur */}
        {errorMessage && (
          <div className="auth-error-alert">
            <i className="fa-solid fa-circle-exclamation"></i>
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Formulaire de Connexion */}
        {mode === 'login' ? (
          <form className="auth-form" onSubmit={handleLoginSubmit}>
            <div className="form-group">
              <label htmlFor="login-email">Adresse Email *</label>
              <input
                type="email"
                id="login-email"
                name="email"
                className="form-input"
                placeholder="votre-email@example.com"
                required
                value={loginForm.email}
                onChange={handleLoginChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="login-password">Mot de passe *</label>
              <input
                type="password"
                id="login-password"
                name="password"
                className="form-input"
                placeholder="••••••••"
                required
                value={loginForm.password}
                onChange={handleLoginChange}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-block auth-submit-btn"
              disabled={loading}
            >
              {loading ? (
                <span>Connexion en cours...</span>
              ) : (
                <>
                  <span>Se connecter</span>
                  <i className="fa-solid fa-arrow-right-to-bracket"></i>
                </>
              )}
            </button>

            <p className="auth-switch-text">
              Pas encore de compte ?{' '}
              <button
                type="button"
                className="text-link"
                onClick={() => setMode('register')}
              >
                Créer un compte
              </button>
            </p>
          </form>
        ) : (
          /* Formulaire d'Inscription */
          <form className="auth-form" onSubmit={handleRegisterSubmit}>
            <div className="form-group">
              <label htmlFor="reg-name">Nom complet *</label>
              <input
                type="text"
                id="reg-name"
                name="name"
                className="form-input"
                placeholder="Ex : Kouassi Marc"
                required
                value={registerForm.name}
                onChange={handleRegisterChange}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="reg-email">Email *</label>
                <input
                  type="email"
                  id="reg-email"
                  name="email"
                  className="form-input"
                  placeholder="marc@example.com"
                  required
                  value={registerForm.email}
                  onChange={handleRegisterChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="reg-phone">Téléphone (WhatsApp) *</label>
                <input
                  type="tel"
                  id="reg-phone"
                  name="phone"
                  className="form-input"
                  placeholder="0708091011"
                  required
                  value={registerForm.phone}
                  onChange={handleRegisterChange}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="reg-password">Mot de passe (min. 6 car.) *</label>
              <input
                type="password"
                id="reg-password"
                name="password"
                className="form-input"
                placeholder="••••••••"
                required
                minLength={6}
                value={registerForm.password}
                onChange={handleRegisterChange}
              />
            </div>

            <div className="form-row">
              <div className="form-group flex-2">
                <label htmlFor="reg-address">Adresse de livraison par défaut</label>
                <input
                  type="text"
                  id="reg-address"
                  name="address"
                  className="form-input"
                  placeholder="Ex : Cocody Angré"
                  value={registerForm.address}
                  onChange={handleRegisterChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="reg-city">Ville</label>
                <input
                  type="text"
                  id="reg-city"
                  name="city"
                  className="form-input"
                  value={registerForm.city}
                  onChange={handleRegisterChange}
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-block auth-submit-btn"
              disabled={loading}
            >
              {loading ? (
                <span>Création du compte...</span>
              ) : (
                <>
                  <span>Créer mon compte</span>
                  <i className="fa-solid fa-user-plus"></i>
                </>
              )}
            </button>

            <p className="auth-switch-text">
              Déjà inscrit ?{' '}
              <button
                type="button"
                className="text-link"
                onClick={() => setMode('login')}
              >
                Se connecter
              </button>
            </p>
          </form>
        )}
      </div>
    </div>
  );
};
