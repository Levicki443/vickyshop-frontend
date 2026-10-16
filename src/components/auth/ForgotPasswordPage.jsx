import React, { useState } from 'react';
import { requestPasswordReset } from '../../services/authApi';
import logoImg from '../../assets/logo.png';

/**
 * Composant ForgotPasswordPage
 * Page dédiée à la récupération sécurisée de compte utilisateur.
 */
export const ForgotPasswordPage = ({ onNavigate, onOpenLogin }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !email.trim()) {
      setErrorMessage('Veuillez saisir votre adresse email.');
      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      await requestPasswordReset(email);
      setSubmitted(true);
    } catch (err) {
      setErrorMessage(err.message || 'Une erreur est survenue lors de l\'envoi. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  const handleReturnToLogin = () => {
    if (onNavigate) onNavigate('/');
    if (onOpenLogin) {
      setTimeout(() => {
        onOpenLogin();
      }, 100);
    }
  };

  return (
    <div className="auth-page-container">
      <div className="auth-page-card">
        {/* En-tête de la page */}
        <div className="auth-page-header">
          <div className="auth-logo" onClick={() => onNavigate && onNavigate('/')} style={{ cursor: 'pointer' }}>
            <img src={logoImg} alt="Vicky-Shop" className="auth-logo-img rounded-logo" />
            <span>Vicky<span className="brand-accent">-Shop</span></span>
          </div>
        </div>

        {submitted ? (
          /* État de succès après soumission */
          <div className="auth-success-box">
            <div className="auth-success-icon-wrap">
              <i className="fa-solid fa-paper-plane"></i>
            </div>
            <h2 className="auth-page-title">Demande envoyée !</h2>
            <p className="auth-page-description">
              Si un compte est associé à l&apos;adresse <strong>{email}</strong>, vous allez recevoir un e-mail contenant un lien sécurisé de réinitialisation.
            </p>

            <div className="auth-notice-card">
              <i className="fa-solid fa-clock"></i>
              <span>Ce lien est actif pendant <strong>15 minutes</strong> et ne peut être utilisé qu&apos;une seule fois.</span>
            </div>

            <p className="auth-spam-hint">
              Pensez à vérifier votre dossier de courriers indésirables (spams) si l&apos;e-mail ne parvient pas dans votre boîte principale.
            </p>

            <div className="auth-actions-stack">
              <button
                type="button"
                className="btn btn-primary btn-block"
                onClick={handleReturnToLogin}
              >
                <i className="fa-solid fa-arrow-right-to-bracket"></i>
                <span>Retour à la connexion</span>
              </button>

              <button
                type="button"
                className="btn btn-secondary btn-block"
                onClick={() => {
                  setSubmitted(false);
                  setEmail('');
                }}
              >
                <span>Saisir une autre adresse</span>
              </button>
            </div>
          </div>
        ) : (
          /* Formulaire de demande */
          <div className="auth-form-wrap">
            <div className="auth-icon-badge">
              <i className="fa-solid fa-key"></i>
            </div>

            <h1 className="auth-page-title">Récupérer mon compte</h1>
            <p className="auth-page-description">
              Indiquez l&apos;adresse email de votre compte pour réinitialiser votre mot de passe en quelques étapes simples.
            </p>

            {errorMessage && (
              <div className="auth-error-alert" role="alert">
                <i className="fa-solid fa-circle-exclamation"></i>
                <span>{errorMessage}</span>
              </div>
            )}

            <form className="auth-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="forgot-email">Adresse Email associée *</label>
                <div className="input-with-icon-wrap">
                  <i className="fa-solid fa-envelope input-leading-icon"></i>
                  <input
                    type="email"
                    id="forgot-email"
                    name="email"
                    className="form-input has-leading-icon"
                    placeholder="exemple@email.com"
                    required
                    autoFocus
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errorMessage) setErrorMessage('');
                    }}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-block auth-submit-btn"
                disabled={loading}
              >
                {loading ? (
                  <span>Envoi en cours...</span>
                ) : (
                  <>
                    <span>Envoyer le lien de récupération</span>
                    <i className="fa-solid fa-paper-plane"></i>
                  </>
                )}
              </button>

              <div className="auth-bottom-nav-row">
                <button
                  type="button"
                  className="text-link auth-back-btn"
                  onClick={handleReturnToLogin}
                >
                  <i className="fa-solid fa-arrow-left"></i>
                  <span>Retour à la connexion</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
