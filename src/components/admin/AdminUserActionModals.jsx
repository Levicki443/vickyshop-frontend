import React, { useState } from 'react';

/**
 * Modales d'actions administratives sécurisées :
 * 1. Modale d'édition des champs autorisés.
 * 2. Dialogue de confirmation avec saisie de motif pour la suspension ou réactivation.
 */

export const AdminEditUserModal = ({ user, currentAdminId, onClose, onSave, loading = false }) => {
  const isSelf = currentAdminId && String(currentAdminId) === String(user._id);

  const [formData, setFormData] = useState({
    name: user.name || '',
    phone: user.phone || '',
    city: user.city || 'Abidjan',
    address: user.address || '',
    role: user.role || 'client',
    isEmailVerified: !!user.isEmailVerified,
    isPhoneVerified: !!user.isPhoneVerified,
    adminNotes: user.adminNotes || '',
    shopName: user.shopName || '',
    shopDescription: user.shopDescription || '',
    reason: '',
  });

  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim()) {
      setErrorMsg('Le nom et le numéro de téléphone sont requis.');
      return;
    }
    setErrorMsg('');
    onSave(user._id, formData);
  };

  const isSeller = formData.role === 'vendeur' || formData.role === 'seller';

  return (
    <div className="admin-modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="admin-modal-header">
          <h3 className="admin-modal-title">Modifier l&apos;utilisateur</h3>
          <button type="button" className="admin-modal-close" onClick={onClose} aria-label="Fermer">
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="admin-modal-body admin-form-grid">
            {errorMsg && <div className="admin-alert admin-alert-danger">{errorMsg}</div>}

            <div className="admin-form-group">
              <label className="admin-form-label">Nom et prénom</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="admin-input"
                required
              />
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label">Téléphone</label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="admin-input"
                required
              />
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label">Ville</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                className="admin-input"
              />
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label">Adresse de livraison</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="admin-input"
              />
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label">Rôle</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="admin-input"
                disabled={isSelf}
              >
                <option value="client">Client</option>
                <option value="vendeur">Vendeur Marketplace</option>
                <option value="admin">Administrateur</option>
              </select>
              {isSelf && (
                <span className="admin-field-hint">
                  Vous ne pouvez pas modifier votre propre rôle administrateur.
                </span>
              )}
            </div>

            {isSeller && (
              <>
                <div className="admin-form-group admin-form-group--full">
                  <label className="admin-form-label">Nom de la boutique</label>
                  <input
                    type="text"
                    name="shopName"
                    value={formData.shopName}
                    onChange={handleChange}
                    className="admin-input"
                  />
                </div>
                <div className="admin-form-group admin-form-group--full">
                  <label className="admin-form-label">Description de la boutique</label>
                  <textarea
                    name="shopDescription"
                    value={formData.shopDescription}
                    onChange={handleChange}
                    rows={2}
                    className="admin-input admin-textarea"
                  />
                </div>
              </>
            )}

            <div className="admin-form-group admin-form-group--checkboxes admin-form-group--full">
              <label className="admin-checkbox-label">
                <input
                  type="checkbox"
                  name="isEmailVerified"
                  checked={formData.isEmailVerified}
                  onChange={handleChange}
                />
                <span>Adresse e-mail vérifiée</span>
              </label>
              <label className="admin-checkbox-label">
                <input
                  type="checkbox"
                  name="isPhoneVerified"
                  checked={formData.isPhoneVerified}
                  onChange={handleChange}
                />
                <span>Numéro de téléphone vérifié</span>
              </label>
            </div>

            <div className="admin-form-group admin-form-group--full">
              <label className="admin-form-label">Notes administratives internes</label>
              <textarea
                name="adminNotes"
                value={formData.adminNotes}
                onChange={handleChange}
                rows={2}
                placeholder="Remarques visibles uniquement par l'équipe d'administration..."
                className="admin-input admin-textarea"
              />
            </div>

            <div className="admin-form-group admin-form-group--full">
              <label className="admin-form-label">Motif de la modification</label>
              <input
                type="text"
                name="reason"
                value={formData.reason}
                onChange={handleChange}
                placeholder="Raison enregistrée dans le journal d'audit..."
                className="admin-input"
              />
            </div>
          </div>

          <div className="admin-modal-footer">
            <button type="button" className="admin-btn admin-btn-secondary" onClick={onClose} disabled={loading}>
              Annuler
            </button>
            <button type="submit" className="admin-btn admin-btn-primary" disabled={loading}>
              {loading ? 'Enregistrement...' : 'Enregistrer les modifications'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export const AdminConfirmStatusModal = ({
  user,
  actionType = 'suspend', // 'suspend' | 'reactivate' | 'deactivate'
  onClose,
  onConfirm,
  loading = false,
}) => {
  const [reason, setReason] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const isSuspend = actionType === 'suspend';
  const isDeactivate = actionType === 'deactivate';

  const handleConfirm = () => {
    if ((isSuspend || isDeactivate) && !reason.trim()) {
      setErrorMsg('Veuillez préciser le motif de cette action pour les archives administratives.');
      return;
    }
    setErrorMsg('');
    const targetStatus = isSuspend ? 'suspendu' : isDeactivate ? 'desactive' : 'actif';
    onConfirm(user._id, targetStatus, reason.trim());
  };

  return (
    <div className="admin-modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="admin-modal-card admin-modal-card--sm" onClick={(e) => e.stopPropagation()}>
        <div className="admin-modal-header">
          <h3 className="admin-modal-title">
            <i className={`fa-solid ${isSuspend ? 'fa-ban' : isDeactivate ? 'fa-user-xmark' : 'fa-unlock'}`}></i>{' '}
            {isSuspend ? 'Suspendre le compte' : isDeactivate ? 'Désactiver le compte' : 'Réactiver le compte'}
          </h3>
          <button type="button" className="admin-modal-close" onClick={onClose} aria-label="Fermer">
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        <div className="admin-modal-body">
          <p className="admin-modal-desc">
            Êtes-vous sûr de vouloir{' '}
            <strong>
              {isSuspend ? 'suspendre temporairement' : isDeactivate ? 'désactiver' : 'réactiver'}
            </strong>{' '}
            le compte de <strong>{user?.name}</strong> (<code>{user?.email}</code>) ?
          </p>

          {(isSuspend || isDeactivate) && (
            <div className="admin-alert admin-alert-warning">
              <i className="fa-solid fa-triangle-exclamation"></i>
              <span>
                L&apos;utilisateur ne pourra plus se connecter ni effectuer de commandes sur Vicky-Shop.
              </span>
            </div>
          )}

          {errorMsg && <div className="admin-alert admin-alert-danger">{errorMsg}</div>}

          {(isSuspend || isDeactivate) && (
            <div className="admin-form-group">
              <label className="admin-form-label">Motif obligatoire</label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Indiquez la raison de la mesure (ex: non-respect des conditions, litige...)"
                rows={3}
                className="admin-input admin-textarea"
                required
              />
            </div>
          )}
        </div>

        <div className="admin-modal-footer">
          <button type="button" className="admin-btn admin-btn-secondary" onClick={onClose} disabled={loading}>
            Annuler
          </button>
          <button
            type="button"
            className={`admin-btn ${isSuspend || isDeactivate ? 'admin-btn-danger' : 'admin-btn-primary'}`}
            onClick={handleConfirm}
            disabled={loading}
          >
            {loading
              ? 'Traitement...'
              : isSuspend
              ? 'Confirmer la suspension'
              : isDeactivate
              ? 'Confirmer la désactivation'
              : 'Confirmer la réactivation'}
          </button>
        </div>
      </div>
    </div>
  );
};
