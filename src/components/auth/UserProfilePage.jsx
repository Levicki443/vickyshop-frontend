import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { getRoleDisplayName, getRoleBadgeClass, getRoleIcon } from '../../utils/roleUtils';
import { NotificationSettingsTab } from './NotificationSettingsTab';

export const UserProfilePage = ({ onBackToShop, onOpenSellerDashboard, initialTab = 'profile' }) => {
  const {
    user,
    token,
    updateProfile,
    updatePassword,
    isSeller,
    logout,
    openAuthModal,
  } = useAuth();
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState(initialTab || 'profile');
  const [loading, setLoading] = useState(false);

  const [profileForm, setProfileForm] = useState({ name: '', phone: '', address: '', city: 'Abidjan' });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    if (user) {
      setProfileForm({
        name: user.name || '',
        phone: user.phone || '',
        address: user.address || '',
        city: user.city || 'Abidjan',
      });
    }
  }, [user]);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  if (!user && !token) {
    return (
      <div className="container animate-fade-in" style={{ padding: '4rem 1rem', textAlign: 'center' }}>
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: '3rem 1.5rem', maxWidth: '520px', margin: '0 auto' }}>
          <i className="fa-solid fa-user-lock" style={{ fontSize: '3rem', color: 'var(--primary)', marginBottom: '1rem' }}></i>
          <h2 style={{ color: 'var(--text-primary)', marginBottom: '0.75rem' }}>Connexion Requise</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
            Veuillez vous connecter pour accéder à vos informations personnelles, vos adresses et vos paramètres de compte.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
            <button type="button" className="btn btn-secondary" onClick={onBackToShop}>
              Retour à la Boutique
            </button>
            <button type="button" className="btn btn-primary" onClick={openAuthModal}>
              Se Connecter
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (!profileForm.name.trim() || profileForm.name.trim().length < 2) {
      addToast('Nom requis', 'Le nom doit comporter au moins 2 caractères.', 'error');
      return;
    }
    setLoading(true);
    try {
      await updateProfile(profileForm);
      addToast('Profil mis à jour', 'Vos informations personnelles ont été enregistrées.', 'success');
    } catch (err) {
      addToast('Erreur', err.message || 'Échec de la mise à jour.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword.length < 6) {
      addToast('Mot de passe trop court', 'Le mot de passe doit contenir au moins 6 caractères.', 'error');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      addToast('Erreur', 'Les nouveaux mots de passe ne correspondent pas.', 'error');
      return;
    }
    setLoading(true);
    try {
      await updatePassword(passwordForm.currentPassword, passwordForm.newPassword);
      addToast('Succès', 'Votre mot de passe a été modifié avec succès.', 'success');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      addToast('Erreur', err.message || 'Mot de passe actuel incorrect.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const roleLabel = getRoleDisplayName(user?.role);
  const roleBadgeClass = getRoleBadgeClass(user?.role);
  const roleIcon = getRoleIcon(user?.role);

  return (
    <div className="container user-profile-page-root animate-fade-in">
      <div className="details-top-bar" style={{ marginBottom: '1.5rem' }}>
        <button type="button" className="btn-back-shop" onClick={onBackToShop}>
          <i className="fa-solid fa-arrow-left"></i>
          <span>Retour à la Boutique</span>
        </button>
        <div className="details-breadcrumb">
          <span onClick={onBackToShop} style={{ cursor: 'pointer' }}>Accueil</span>
          <i className="fa-solid fa-chevron-right"></i>
          <span className="breadcrumb-current">Mon Profil &amp; Paramètres</span>
        </div>
      </div>

      <div className="profile-vip-card">
        <div className="profile-vip-user-group">
          <div className="profile-avatar-circle">
            {user?.name ? user.name.substring(0, 2).toUpperCase() : 'U'}
          </div>
          <div className="profile-vip-details">
            <h2 className="profile-vip-name">{user?.name}</h2>
            <div className="profile-vip-meta">
              <span className="profile-vip-email"><i className="fa-solid fa-envelope"></i> {user?.email}</span>
              <span>•</span>
              <span className={`profile-role-pill ${roleBadgeClass}`}>
                <i className={roleIcon}></i> {roleLabel}
              </span>
            </div>
          </div>
        </div>

        <div className="profile-vip-actions">
          {isSeller && (
            <button type="button" className="btn btn-primary motion-press" onClick={onOpenSellerDashboard}>
              <i className="fa-solid fa-store"></i> <span>Espace Vendeur Pro</span>
            </button>
          )}
          <button type="button" className="btn-profile-logout motion-press" onClick={logout}>
            <i className="fa-solid fa-right-from-bracket"></i> <span>Déconnexion</span>
          </button>
        </div>
      </div>

      <div className="profile-main-grid">
        <div className="profile-tabs-sidebar">
          <button
            type="button"
            className={`profile-tab-item ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            <i className="fa-solid fa-user-pen"></i> <span>Informations Personnelles</span>
          </button>
          <button
            type="button"
            className={`profile-tab-item ${activeTab === 'notifications' ? 'active' : ''}`}
            onClick={() => setActiveTab('notifications')}
          >
            <i className="fa-solid fa-bell"></i> <span>Paramètres de Notifications</span>
          </button>
          <button
            type="button"
            className={`profile-tab-item ${activeTab === 'password' ? 'active' : ''}`}
            onClick={() => setActiveTab('password')}
          >
            <i className="fa-solid fa-lock"></i> <span>Sécurité &amp; Mot de passe</span>
          </button>
          <button
            type="button"
            className={`profile-tab-item ${activeTab === 'account' ? 'active' : ''}`}
            onClick={() => setActiveTab('account')}
          >
            <i className="fa-solid fa-shield-halved"></i> <span>Statut &amp; Rôle du Compte</span>
          </button>
        </div>

        <div className="profile-content-card">
          {activeTab === 'profile' && (
            <form onSubmit={handleProfileSubmit} className="profile-form">
              <h3 className="profile-section-title">
                <i className="fa-solid fa-truck-ramp-box text-primary"></i>
                <span>Modifier vos coordonnées de livraison</span>
              </h3>
              <div className="profile-form-group">
                <label><i className="fa-solid fa-user"></i> Nom complet *</label>
                <input type="text" className="profile-form-input" required placeholder="Ex : Kouamé Jean" value={profileForm.name} onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })} />
              </div>
              <div className="profile-form-row">
                <div className="profile-form-group">
                  <label><i className="fa-brands fa-whatsapp"></i> Téléphone WhatsApp *</label>
                  <input type="tel" className="profile-form-input" required placeholder="05 00 00 00 00" value={profileForm.phone} onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })} />
                </div>
                <div className="profile-form-group">
                  <label><i className="fa-solid fa-city"></i> Ville</label>
                  <input type="text" className="profile-form-input" placeholder="Ex : Abidjan" value={profileForm.city} onChange={(e) => setProfileForm({ ...profileForm, city: e.target.value })} />
                </div>
              </div>
              <div className="profile-form-group">
                <label><i className="fa-solid fa-location-dot"></i> Adresse de livraison par défaut</label>
                <input type="text" className="profile-form-input" placeholder="Commune, quartier, repère..." value={profileForm.address} onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })} />
              </div>
              <button type="submit" className="btn btn-primary btn-profile-submit" disabled={loading}>
                {loading ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-floppy-disk"></i>}
                <span>Enregistrer les modifications</span>
              </button>
            </form>
          )}

          {activeTab === 'notifications' && (
            <NotificationSettingsTab />
          )}

          {activeTab === 'password' && (
            <form onSubmit={handlePasswordSubmit} className="profile-form">
              <h3 className="profile-section-title">
                <i className="fa-solid fa-lock text-primary"></i>
                <span>Mettre à jour votre mot de passe</span>
              </h3>
              <div className="profile-form-group">
                <label><i className="fa-solid fa-key"></i> Mot de passe actuel *</label>
                <input type="password" className="profile-form-input" required placeholder="••••••••" value={passwordForm.currentPassword} onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })} />
              </div>
              <div className="profile-form-group">
                <label><i className="fa-solid fa-lock"></i> Nouveau mot de passe *</label>
                <input type="password" className="profile-form-input" required minLength={6} placeholder="Au moins 6 caractères" value={passwordForm.newPassword} onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })} />
              </div>
              <div className="profile-form-group">
                <label><i className="fa-solid fa-shield-check"></i> Confirmer le nouveau mot de passe *</label>
                <input type="password" className="profile-form-input" required minLength={6} placeholder="Confirmez le mot de passe" value={passwordForm.confirmPassword} onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })} />
              </div>
              <button type="submit" className="btn btn-primary btn-profile-submit" disabled={loading}>
                {loading ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-shield-halved"></i>}
                <span>Mettre à jour le mot de passe</span>
              </button>
            </form>
          )}

          {activeTab === 'account' && (
            <div className="profile-form">
              <h3 className="profile-section-title">
                <i className="fa-solid fa-shield-halved text-primary"></i>
                <span>Détails &amp; Sécurité du compte</span>
              </h3>
              <div className="account-details-card">
                <div className="account-info-row">
                  <span className="account-info-label"><i className="fa-solid fa-user-tag text-primary"></i> Rôle sur le site</span>
                  <span className={`profile-role-pill ${roleBadgeClass}`}>{roleLabel}</span>
                </div>
                <div className="account-info-row">
                  <span className="account-info-label"><i className="fa-solid fa-envelope text-primary"></i> Email de connexion</span>
                  <strong>{user?.email}</strong>
                </div>
                <div className="account-info-row">
                  <span className="account-info-label"><i className="fa-solid fa-circle-check text-success"></i> Statut du compte</span>
                  <strong className="text-success">Actif &amp; Vérifié</strong>
                </div>
              </div>
              {isSeller && (
                <button type="button" className="btn btn-primary" onClick={onOpenSellerDashboard} style={{ width: '100%', marginTop: '1.5rem' }}>
                  <i className="fa-solid fa-store"></i> <span>Accéder au Dashboard Vendeur</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage;
