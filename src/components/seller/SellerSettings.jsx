import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

/**
 * Composant de gestion des paramètres de compte et de sécurité du Vendeur.
 */
export const SellerSettings = () => {
  const { user, updatePassword } = useAuth();
  const { addToast } = useToast();

  const [saving, setSaving] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleChange = (e) => {
    setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value });
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword.length < 6) {
      addToast('Mot de passe trop court', 'Le nouveau mot de passe doit comporter au moins 6 caractères.', 'error');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      addToast('Erreur', 'Les deux nouveaux mots de passe ne correspondent pas.', 'error');
      return;
    }

    setSaving(true);
    try {
      await updatePassword(passwordForm.currentPassword, passwordForm.newPassword);
      addToast('Succès', 'Votre mot de passe vendeur a été mis à jour.', 'success');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      addToast('Erreur', err.message || 'Mot de passe actuel incorrect.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="seller-profile-section animate-fade-in">
      <div className="seller-section-header-bar">
        <div>
          <h3 className="seller-section-title">Paramètres &amp; Sécurité du Compte</h3>
          <p className="seller-section-desc">
            Gérez vos identifiants d&apos;accès et la sécurité de votre compte vendeur.
          </p>
        </div>
      </div>

      <div className="seller-profile-card">
        <div className="account-details-card mb-4">
          <div className="account-info-row">
            <span className="account-info-label"><i className="fa-solid fa-user-check text-primary"></i> Identifiant Vendeur</span>
            <strong>{user?.name}</strong>
          </div>
          <div className="account-info-row">
            <span className="account-info-label"><i className="fa-solid fa-envelope text-primary"></i> Email de contact</span>
            <strong>{user?.email}</strong>
          </div>
          <div className="account-info-row">
            <span className="account-info-label"><i className="fa-solid fa-store text-primary"></i> Boutique associée</span>
            <strong>{user?.shopName || 'Boutique Partenaire'}</strong>
          </div>
        </div>

        <h4 className="mb-3"><i className="fa-solid fa-lock"></i> Modifier votre mot de passe</h4>
        <form onSubmit={handlePasswordSubmit} className="seller-profile-form">
          <div className="form-group">
            <label htmlFor="current-pass">Mot de passe actuel *</label>
            <input
              type="password"
              id="current-pass"
              name="currentPassword"
              className="form-input"
              required
              placeholder="••••••••"
              value={passwordForm.currentPassword}
              onChange={handleChange}
            />
          </div>

          <div className="form-row">
            <div className="form-group flex-1">
              <label htmlFor="new-pass">Nouveau mot de passe *</label>
              <input
                type="password"
                id="new-pass"
                name="newPassword"
                className="form-input"
                required
                minLength={6}
                placeholder="Au moins 6 caractères"
                value={passwordForm.newPassword}
                onChange={handleChange}
              />
            </div>
            <div className="form-group flex-1">
              <label htmlFor="confirm-pass">Confirmer le nouveau mot de passe *</label>
              <input
                type="password"
                id="confirm-pass"
                name="confirmPassword"
                className="form-input"
                required
                minLength={6}
                placeholder="Confirmer mot de passe"
                value={passwordForm.confirmPassword}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="seller-profile-actions">
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? (
                <>
                  <i className="fa-solid fa-spinner fa-spin"></i> Enregistrement...
                </>
              ) : (
                <>
                  <i className="fa-solid fa-shield-check"></i> Mettre à jour le mot de passe
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
