import React, { useState, useEffect, useMemo } from 'react';
import { verifyPasswordResetToken, submitPasswordReset } from '../../services/authApi';
import logoImg from '../../assets/logo.png';

/**
 * Composant ResetPasswordPage
 * Page dédiée à la définition d'un nouveau mot de passe avec indicateur dynamique
 * de force, validation en temps réel et bascule d'affichage/masquage.
 */
export const ResetPasswordPage = ({ onNavigate, onOpenLogin }) => {
  const [token, setToken] = useState('');
  const [tokenStatus, setTokenStatus] = useState('verifying'); // 'verifying' | 'valid' | 'invalid'
  const [tokenError, setTokenError] = useState('');
  const [maskedEmail, setMaskedEmail] = useState('');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [success, setSuccess] = useState(false);

  // Extraction du jeton depuis les paramètres d'URL au montage
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tokenParam = urlParams.get('token');

    if (!tokenParam) {
      setTokenStatus('invalid');
      setTokenError('Aucun jeton de réinitialisation n\'a été fourni dans le lien.');
      return;
    }

    setToken(tokenParam);

    // Vérification de la validité du jeton auprès du serveur
    verifyPasswordResetToken(tokenParam)
      .then((res) => {
        setTokenStatus('valid');
        if (res.maskedEmail) setMaskedEmail(res.maskedEmail);
      })
      .catch((err) => {
        setTokenStatus('invalid');
        setTokenError(err.message || 'Le lien de réinitialisation est invalide ou a expiré.');
      });
  }, []);

  // Évaluation dynamique de la force du mot de passe
  const passwordStrength = useMemo(() => {
    const pwd = newPassword;
    if (!pwd) return { score: 0, label: '', colorClass: '' };

    let score = 0;
    if (pwd.length >= 8) score += 1;
    if (pwd.length >= 10) score += 1;
    if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score += 1;
    if (/[0-9]/.test(pwd)) score += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1;

    if (score <= 2) {
      return { score: 1, label: 'Faible', colorClass: 'strength-weak', percent: 33 };
    } else if (score <= 4) {
      return { score: 2, label: 'Moyen', colorClass: 'strength-medium', percent: 66 };
    } else {
      return { score: 3, label: 'Fort', colorClass: 'strength-strong', percent: 100 };
    }
  }, [newPassword]);

  // Critères de sécurité individuels
  const checks = useMemo(() => ({
    hasLength: newPassword.length >= 8,
    hasLetter: /[a-zA-Z]/.test(newPassword),
    hasNumberOrSpecial: /[0-9!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(newPassword),
    isMatching: Boolean(newPassword && confirmPassword && newPassword === confirmPassword),
  }), [newPassword, confirmPassword]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (newPassword.length < 8) {
      setErrorMessage('Le mot de passe doit comporter au moins 8 caractères.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('Les deux mots de passe ne correspondent pas.');
      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      await submitPasswordReset({
        token,
        newPassword,
        confirmPassword,
      });
      setSuccess(true);
    } catch (err) {
      setErrorMessage(err.message || 'Impossible de réinitialiser le mot de passe.');
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
        {/* En-tête de marque */}
        <div className="auth-page-header">
          <div className="auth-logo" onClick={() => onNavigate && onNavigate('/')} style={{ cursor: 'pointer' }}>
            <img src={logoImg} alt="Vicky-Shop" className="auth-logo-img rounded-logo" />
            <span>Vicky<span className="brand-accent">-Shop</span></span>
          </div>
        </div>

        {/* 1. ÉTAT : En cours de vérification du lien */}
        {tokenStatus === 'verifying' && (
          <div className="auth-verifying-box">
            <div className="auth-loading-spinner" />
            <h2 className="auth-page-title">Vérification du lien...</h2>
            <p className="auth-page-description">
              Nous vérifions la validité et la sécurité de votre lien de réinitialisation.
            </p>
          </div>
        )}

        {/* 2. ÉTAT : Jeton expiré ou invalide */}
        {tokenStatus === 'invalid' && (
          <div className="auth-invalid-box">
            <div className="auth-invalid-icon-wrap">
              <i className="fa-solid fa-triangle-exclamation"></i>
            </div>
            <h2 className="auth-page-title">Lien expiré ou invalide</h2>
            <p className="auth-page-description">
              {tokenError || 'Ce lien de récupération n\'est plus valide ou a déjà été utilisé.'}
            </p>

            <div className="auth-actions-stack">
              <button
                type="button"
                className="btn btn-primary btn-block"
                onClick={() => onNavigate && onNavigate('/mot-de-passe-oublie')}
              >
                <i className="fa-solid fa-rotate-right"></i>
                <span>Demander un nouveau lien</span>
              </button>

              <button
                type="button"
                className="btn btn-secondary btn-block"
                onClick={() => onNavigate && onNavigate('/')}
              >
                <span>Retour à l&apos;accueil</span>
              </button>
            </div>
          </div>
        )}

        {/* 3. ÉTAT : Succès de la réinitialisation */}
        {tokenStatus === 'valid' && success && (
          <div className="auth-success-box">
            <div className="auth-success-icon-wrap success-pulse">
              <i className="fa-solid fa-check"></i>
            </div>
            <h2 className="auth-page-title">Mot de passe réinitialisé !</h2>
            <p className="auth-page-description">
              Votre mot de passe a été réinitialisé avec succès. Vous pouvez maintenant vous connecter en toute sécurité avec vos nouveaux identifiants.
            </p>

            <button
              type="button"
              className="btn btn-primary btn-block"
              onClick={handleReturnToLogin}
            >
              <i className="fa-solid fa-arrow-right-to-bracket"></i>
              <span>Se connecter avec le nouveau mot de passe</span>
            </button>
          </div>
        )}

        {/* 4. ÉTAT : Formulaire actif de réinitialisation */}
        {tokenStatus === 'valid' && !success && (
          <div className="auth-form-wrap">
            <div className="auth-icon-badge">
              <i className="fa-solid fa-lock"></i>
            </div>

            <h1 className="auth-page-title">Nouveau mot de passe</h1>
            <p className="auth-page-description">
              {maskedEmail
                ? `Définissez un mot de passe sécurisé pour votre compte (${maskedEmail}).`
                : 'Choisissez un mot de passe solide pour protéger l\'accès à votre compte.'}
            </p>

            {errorMessage && (
              <div className="auth-error-alert" role="alert">
                <i className="fa-solid fa-circle-exclamation"></i>
                <span>{errorMessage}</span>
              </div>
            )}

            <form className="auth-form" onSubmit={handleSubmit}>
              {/* Champ Nouveau mot de passe */}
              <div className="form-group">
                <label htmlFor="reset-new-password">Nouveau mot de passe *</label>
                <div className="input-with-action-wrap">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="reset-new-password"
                    name="newPassword"
                    className="form-input"
                    placeholder="Au moins 8 caractères"
                    required
                    autoFocus
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      if (errorMessage) setErrorMessage('');
                    }}
                  />
                  <button
                    type="button"
                    className="input-eye-btn"
                    onClick={() => setShowPassword((prev) => !prev)}
                    title={showPassword ? 'Masquer' : 'Afficher'}
                    aria-label="Afficher ou masquer le mot de passe"
                  >
                    <i className={showPassword ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye'}></i>
                  </button>
                </div>

                {/* Jauge dynamique de robustesse */}
                {newPassword && (
                  <div className="password-strength-box">
                    <div className="strength-bar-bg">
                      <div
                        className={`strength-bar-fill ${passwordStrength.colorClass}`}
                        style={{ width: `${passwordStrength.percent}%` }}
                      />
                    </div>
                    <span className={`strength-label ${passwordStrength.colorClass}`}>
                      Force : {passwordStrength.label}
                    </span>
                  </div>
                )}
              </div>

              {/* Champ Confirmer le mot de passe */}
              <div className="form-group">
                <label htmlFor="reset-confirm-password">Confirmer le nouveau mot de passe *</label>
                <div className="input-with-action-wrap">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="reset-confirm-password"
                    name="confirmPassword"
                    className="form-input"
                    placeholder="Répétez le mot de passe"
                    required
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (errorMessage) setErrorMessage('');
                    }}
                  />
                  <button
                    type="button"
                    className="input-eye-btn"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    title={showConfirmPassword ? 'Masquer' : 'Afficher'}
                    aria-label="Afficher ou masquer la confirmation du mot de passe"
                  >
                    <i className={showConfirmPassword ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye'}></i>
                  </button>
                </div>

                {confirmPassword && (
                  <span className={`match-hint ${checks.isMatching ? 'text-success' : 'text-danger'}`}>
                    <i className={checks.isMatching ? 'fa-solid fa-circle-check' : 'fa-solid fa-circle-xmark'}></i>
                    {checks.isMatching ? ' Les mots de passe correspondent' : ' Les mots de passe ne correspondent pas'}
                  </span>
                )}
              </div>

              {/* Checklist des exigences de sécurité */}
              <div className="password-checklist">
                <span className="checklist-title">Exigences de sécurité :</span>
                <ul>
                  <li className={checks.hasLength ? 'valid' : ''}>
                    <i className={checks.hasLength ? 'fa-solid fa-check' : 'fa-solid fa-circle-dot'}></i>
                    <span>Au moins 8 caractères</span>
                  </li>
                  <li className={checks.hasLetter ? 'valid' : ''}>
                    <i className={checks.hasLetter ? 'fa-solid fa-check' : 'fa-solid fa-circle-dot'}></i>
                    <span>Au moins une lettre</span>
                  </li>
                  <li className={checks.hasNumberOrSpecial ? 'valid' : ''}>
                    <i className={checks.hasNumberOrSpecial ? 'fa-solid fa-check' : 'fa-solid fa-circle-dot'}></i>
                    <span>Au moins un chiffre ou symbole</span>
                  </li>
                </ul>
              </div>

              {/* Bouton de soumission */}
              <button
                type="submit"
                className="btn btn-primary btn-block auth-submit-btn"
                disabled={loading || !checks.hasLength || (confirmPassword && !checks.isMatching)}
              >
                {loading ? (
                  <span>Mise à jour en cours...</span>
                ) : (
                  <>
                    <span>Réinitialiser mon mot de passe</span>
                    <i className="fa-solid fa-shield-check"></i>
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

export default ResetPasswordPage;
