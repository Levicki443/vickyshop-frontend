import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export const UserProfileModal = () => {
  const { user, isProfileModalOpen, closeProfileModal, updateProfile, updatePassword } = useAuth();
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'password' | 'account'
  const [loading, setLoading] = useState(false);

  // Formulaire Profil
  const [profileForm, setProfileForm] = useState({
    name: '',
    phone: '',
    address: '',
    city: 'Abidjan',
  });

  // Formulaire Mot de passe
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

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
      addToast('Nom requis', 'Le nom complet doit comporter au moins 2 caractères.', 'error');
      return;
    }

    const pureDigits = profileForm.phone.replace(/\D/g, '');
    if (!profileForm.phone.trim() || pureDigits.length < 10) {
      addToast(
        'Numéro de téléphone requis',
        'Le numéro de téléphone doit comporter au moins 10 chiffres (ex : 0708091011 ou +225 0102030405).',
        'error'
      );
      return;
    }

    setLoading(true);
    try {
      await updateProfile(profileForm);
      addToast('Profil mis à jour', 'Vos informations personnelles ont été enregistrées avec succès.', 'success');
    } catch (err) {
      addToast('Erreur', err.message || 'Impossible de mettre à jour le profil.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      addToast('Erreur', 'Les deux nouveaux mots de passe ne correspondent pas.', 'error');
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      addToast('Erreur', 'Le nouveau mot de passe doit comporter au moins 6 caractères.', 'error');
      return;
    }

    setLoading(true);
    try {
      await updatePassword(passwordForm.currentPassword, passwordForm.newPassword);
      addToast('Succès', 'Votre mot de passe a été modifié avec succès.', 'success');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      addToast('Erreur', err.message || 'Mot de passe actuel incorrect ou invalide.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map((p) => p[0]).join('').substring(0, 2).toUpperCase();
  };

  return (
    <div className="modal-overlay" onClick={closeProfileModal}>
      <div
        className="modal-box modal-profile-box"
        style={{
          maxWidth: '620px',
          width: '95%',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          padding: 0,
          background: 'var(--bg-surface)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-xl)',
          border: '1px solid var(--border-color)',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* En-tête du modal */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '1.2rem 1.5rem',
            borderBottom: '1px solid var(--border-color)',
            background: 'var(--bg-card)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div className="user-avatar-badge" style={{ width: '42px', height: '42px', fontSize: '1.1rem' }}>
              {getInitials(user.name)}
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.18rem', color: 'var(--text-primary)', fontWeight: 800 }}>
                Paramètres &amp; Profil
              </h3>
              <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                {user.email}
              </p>
            </div>
          </div>
          <button
            type="button"
            className="modal-close"
            style={{ position: 'static' }}
            onClick={closeProfileModal}
            aria-label="Fermer"
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        {/* Onglets de navigation */}
        <div
          style={{
            display: 'flex',
            borderBottom: '1px solid var(--border-color)',
            background: 'var(--bg-card)',
            padding: '0 1.5rem',
            gap: '1rem',
          }}
        >
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            style={{
              padding: '0.85rem 0.2rem',
              border: 'none',
              background: 'transparent',
              color: activeTab === 'profile' ? 'var(--primary)' : 'var(--text-secondary)',
              fontWeight: activeTab === 'profile' ? 700 : 500,
              borderBottom: activeTab === 'profile' ? '2px solid var(--primary)' : '2px solid transparent',
              cursor: 'pointer',
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}
          >
            <i className="fa-solid fa-user-pen"></i> Mes Informations
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('password')}
            style={{
              padding: '0.85rem 0.2rem',
              border: 'none',
              background: 'transparent',
              color: activeTab === 'password' ? 'var(--primary)' : 'var(--text-secondary)',
              fontWeight: activeTab === 'password' ? 700 : 500,
              borderBottom: activeTab === 'password' ? '2px solid var(--primary)' : '2px solid transparent',
              cursor: 'pointer',
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}
          >
            <i className="fa-solid fa-lock"></i> Mot de passe
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('account')}
            style={{
              padding: '0.85rem 0.2rem',
              border: 'none',
              background: 'transparent',
              color: activeTab === 'account' ? 'var(--primary)' : 'var(--text-secondary)',
              fontWeight: activeTab === 'account' ? 700 : 500,
              borderBottom: activeTab === 'account' ? '2px solid var(--primary)' : '2px solid transparent',
              cursor: 'pointer',
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}
          >
            <i className="fa-solid fa-shield-halved"></i> Résumé Compte
          </button>
        </div>

        {/* Corps avec défilement */}
        <div style={{ overflowY: 'auto', padding: '1.5rem' }}>
          {activeTab === 'profile' && (
            <form onSubmit={handleProfileSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.35rem', display: 'block' }}>
                  Nom complet
                </label>
                <input
                  type="text"
                  className="form-input"
                  required
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                />
              </div>

              <div className="form-row" style={{ display: 'flex', gap: '1rem' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.35rem', display: 'block' }}>
                    Téléphone (WhatsApp) *
                  </label>
                  <input
                    type="tel"
                    className="form-input"
                    placeholder="0708091011"
                    required
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                  />
                  <small style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>
                    Minimum 10 chiffres (ex : 0708091011)
                  </small>
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.35rem', display: 'block' }}>
                    Ville / Commune
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    value={profileForm.city}
                    onChange={(e) => setProfileForm({ ...profileForm, city: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.35rem', display: 'block' }}>
                  Adresse de livraison par défaut
                </label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Ex : Cocody Angré 8ème Tranche"
                  value={profileForm.address}
                  onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                />
              </div>

              <button type="submit" className="btn btn-primary btn-block" disabled={loading} style={{ marginTop: '0.5rem' }}>
                {loading ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-floppy-disk"></i>}
                <span> Enregistrer les modifications</span>
              </button>
            </form>
          )}

          {activeTab === 'password' && (
            <form onSubmit={handlePasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.35rem', display: 'block' }}>
                  Mot de passe actuel
                </label>
                <input
                  type="password"
                  className="form-input"
                  required
                  placeholder="••••••••"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.35rem', display: 'block' }}>
                  Nouveau mot de passe (min. 6 caractères)
                </label>
                <input
                  type="password"
                  className="form-input"
                  required
                  minLength={6}
                  placeholder="••••••••"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.35rem', display: 'block' }}>
                  Confirmer le nouveau mot de passe
                </label>
                <input
                  type="password"
                  className="form-input"
                  required
                  minLength={6}
                  placeholder="••••••••"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                />
              </div>

              <button type="submit" className="btn btn-primary btn-block" disabled={loading} style={{ marginTop: '0.5rem' }}>
                {loading ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-key"></i>}
                <span> Mettre à jour le mot de passe</span>
              </button>
            </form>
          )}

          {activeTab === 'account' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ background: 'var(--bg-card)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Statut du compte :</span>
                  <span style={{ color: 'var(--success, #10b981)', fontWeight: 700 }}>
                    <i className="fa-solid fa-circle-check"></i> Actif &amp; Vérifié
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Adresse Email :</span>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{user.email}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Rôle :</span>
                  <span style={{ textTransform: 'capitalize', fontWeight: 600, color: 'var(--primary)' }}>{user.role || 'Client'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Membre depuis :</span>
                  <span style={{ color: 'var(--text-primary)' }}>
                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }) : 'Récemment'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfileModal;
