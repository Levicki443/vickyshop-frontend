import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { getRoleDisplayName, getRoleBadgeClass, getRoleIcon } from '../../utils/roleUtils';

export const UserProfileModal = () => {
  const {
    user,
    isProfileModalOpen,
    closeProfileModal,
    updateProfile,
    updatePassword,
    isSeller,
    openSellerDashboard,
  } = useAuth();
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);

  const [profileForm, setProfileForm] = useState({ name: '', phone: '', address: '', city: 'Abidjan' });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });

  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || '',
        phone: user.phone || '',
        address: user.address || '',
        city: user.city || 'Abidjan',
      });
    }
  }, [user, isProfileModalOpen]);

  if (!isProfileModalOpen || !user) return null;

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (!profileForm.name.trim() || profileForm.name.trim().length < 2) {
      addToast('Nom requis', 'Le nom doit comporter au moins 2 caractères.', 'error');
      return;
    }
    setLoading(true);
    try {
      await updateProfile(profileForm);
      addToast('Succès', 'Votre profil a été mis à jour avec succès.', 'success');
    } catch (err) {
      addToast('Erreur', err.message || 'Échec de la mise à jour.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword.length < 6) {
      addToast('Mot de passe court', 'Le mot de passe doit contenir au moins 6 caractères.', 'error');
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

  const handleOpenSellerSpace = () => {
    closeProfileModal();
    window.history.pushState(null, '', '/vendeur/dashboard');
    window.dispatchEvent(new Event('app-navigate'));
    openSellerDashboard();
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map((p) => p[0]).join('').substring(0, 2).toUpperCase();
  };

  const roleLabel = getRoleDisplayName(user.role);
  const roleBadgeClass = getRoleBadgeClass(user.role);
  const roleIcon = getRoleIcon(user.role);

  return (
    <div className="modal-overlay" onClick={closeProfileModal}>
      <div className="modal-profile-custom" onClick={(e) => e.stopPropagation()}>
        <div className="modal-profile-top">
          <div className="profile-header-user">
            <div className="profile-avatar-circle">{getInitials(user.name)}</div>
            <div className="profile-user-info">
              <h3>{user.name}</h3>
              <div className="profile-user-meta">
                <span><i className="fa-solid fa-envelope"></i> {user.email}</span>
                <span>•</span>
                <span className={`profile-role-pill ${roleBadgeClass}`}>
                  <i className={roleIcon}></i> {roleLabel}
                </span>
              </div>
            </div>
          </div>
          <button type="button" className="profile-close-btn" onClick={closeProfileModal} aria-label="Fermer">
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        <div className="modal-profile-tabs">
          <button type="button" className={`profile-tab-btn ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>
            <i className="fa-solid fa-user-pen"></i> <span>Mes Infos</span>
          </button>
          <button type="button" className={`profile-tab-btn ${activeTab === 'password' ? 'active' : ''}`} onClick={() => setActiveTab('password')}>
            <i className="fa-solid fa-lock"></i> <span>Mot de passe</span>
          </button>
          <button type="button" className={`profile-tab-btn ${activeTab === 'account' ? 'active' : ''}`} onClick={() => setActiveTab('account')}>
            <i className="fa-solid fa-shield-halved"></i> <span>Mon Compte</span>
          </button>
        </div>

        <div className="modal-profile-content">
          {activeTab === 'profile' && (
            <form onSubmit={handleProfileSubmit} className="profile-form">
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
                <label><i className="fa-solid fa-location-dot"></i> Adresse de livraison</label>
                <input type="text" className="profile-form-input" placeholder="Commune, quartier, repère..." value={profileForm.address} onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })} />
              </div>
              <button type="submit" className="btn btn-primary btn-profile-submit" disabled={loading}>
                {loading ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-floppy-disk"></i>}
                <span>Enregistrer les modifications</span>
              </button>
            </form>
          )}

          {activeTab === 'password' && (
            <form onSubmit={handlePasswordSubmit} className="profile-form">
              <div className="profile-form-group">
                <label><i className="fa-solid fa-key"></i> Mot de passe actuel *</label>
                <input type="password" className="profile-form-input" required placeholder="••••••••" value={passwordForm.currentPassword} onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })} />
              </div>
              <div className="profile-form-group">
                <label><i className="fa-solid fa-lock"></i> Nouveau mot de passe *</label>
                <input type="password" className="profile-form-input" required minLength={6} placeholder="Au moins 6 caractères" value={passwordForm.newPassword} onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })} />
              </div>
              <div className="profile-form-group">
                <label><i className="fa-solid fa-shield-check"></i> Confirmer nouveau mot de passe *</label>
                <input type="password" className="profile-form-input" required minLength={6} placeholder="Confirmer votre mot de passe" value={passwordForm.confirmPassword} onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })} />
              </div>
              <button type="submit" className="btn btn-primary btn-profile-submit" disabled={loading}>
                {loading ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-shield-halved"></i>}
                <span>Mettre à jour le mot de passe</span>
              </button>
            </form>
          )}

          {activeTab === 'account' && (
            <div className="profile-form">
              <div className="account-details-card">
                <div className="account-info-row">
                  <span className="account-info-label"><i className="fa-solid fa-user-tag text-primary"></i> Rôle sur le site</span>
                  <span className={`profile-role-pill ${roleBadgeClass}`}>{roleLabel}</span>
                </div>
                <div className="account-info-row">
                  <span className="account-info-label"><i className="fa-solid fa-envelope text-primary"></i> Email de connexion</span>
                  <strong>{user.email}</strong>
                </div>
                <div className="account-info-row">
                  <span className="account-info-label"><i className="fa-solid fa-circle-check text-success"></i> Statut du compte</span>
                  <strong className="text-success">Actif &amp; Vérifié</strong>
                </div>
              </div>

              {isSeller && (
                <button type="button" className="btn btn-primary btn-profile-submit" onClick={handleOpenSellerSpace}>
                  <i className="fa-solid fa-store"></i> <span>Ouvrir l&apos;Espace Gestion Vendeur</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfileModal;
