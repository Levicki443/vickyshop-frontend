import React from 'react';

/**
 * Formulaire modulaire de connexion utilisateur.
 */
export const LoginForm = ({
  loginForm,
  onChange,
  onSubmit,
  loading,
  onSwitchToRegister,
}) => {
  return (
    <form className="auth-form" onSubmit={onSubmit}>
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
          onChange={onChange}
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
          onChange={onChange}
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
          onClick={onSwitchToRegister}
        >
          Créer un compte
        </button>
      </p>
    </form>
  );
};
