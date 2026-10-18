import React from 'react';

/**
 * Tableau réactif et paginé des utilisateurs du BackOffice.
 * Prend en charge l'affichage desktop en tableau et l'affichage mobile en cartes,
 * avec indicateurs de statut, rôle, vérification, commandes et actions sécurisées.
 */
export const AdminUsersTable = ({
  users = [],
  loading = false,
  pagination = { page: 1, totalPages: 1, total: 0, limit: 10 },
  onPageChange,
  onViewDetails,
  onEditUser,
  onToggleStatus,
  currentAdminId,
}) => {
  const getRoleBadge = (role) => {
    switch (role) {
      case 'admin':
        return <span className="admin-badge admin-badge-danger">Administrateur</span>;
      case 'vendeur':
      case 'seller':
        return <span className="admin-badge admin-badge-warning">Vendeur</span>;
      default:
        return <span className="admin-badge admin-badge-info">Client</span>;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'suspendu':
        return <span className="admin-status-pill admin-status-pill--suspended">Suspendu</span>;
      case 'desactive':
        return <span className="admin-status-pill admin-status-pill--deactivated">Désactivé</span>;
      default:
        return <span className="admin-status-pill admin-status-pill--active">Actif</span>;
    }
  };

  const formatDate = (dateVal) => {
    if (!dateVal) return 'Jamais';
    try {
      const d = new Date(dateVal);
      return d.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return 'Date invalide';
    }
  };

  return (
    <div className="admin-card admin-users-table-container">
      {/* Vue Bureau : Tableau traditionnel */}
      <div className="admin-table-responsive admin-users-desktop-view">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Utilisateur</th>
              <th>Email</th>
              <th>Téléphone</th>
              <th>Rôle</th>
              <th>Statut</th>
              <th>Vérification</th>
              <th>Activité</th>
              <th>Dernière connexion</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={9} className="admin-empty-text">
                  <i className="fa-solid fa-spinner fa-spin admin-table-spinner"></i>
                  <span>Chargement des données en direct...</span>
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={9} className="admin-empty-text">
                  <i className="fa-solid fa-users-slash admin-table-empty-icon"></i>
                  <p>Aucun utilisateur ne correspond aux critères sélectionnés.</p>
                </td>
              </tr>
            ) : (
              users.map((u) => {
                const isSelf = currentAdminId && String(currentAdminId) === String(u._id);
                return (
                  <tr key={u._id} className={u.status === 'suspendu' ? 'admin-row--suspended' : ''}>
                    <td>
                      <div className="admin-user-cell">
                        <div className="admin-user-avatar" aria-hidden="true">
                          {u.avatar ? (
                            <img src={u.avatar} alt={u.name} />
                          ) : (
                            (u.name || 'U').charAt(0).toUpperCase()
                          )}
                        </div>
                        <div className="admin-user-meta">
                          <strong className="admin-user-name">{u.name}</strong>
                          <span className="admin-user-id" title={u._id}>
                            ID: {String(u._id).slice(-6)}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <a href={`mailto:${u.email}`} className="admin-link">
                        {u.email}
                      </a>
                    </td>
                    <td>{u.phone || <span className="admin-text-muted">Non renseigné</span>}</td>
                    <td>{getRoleBadge(u.role)}</td>
                    <td>{getStatusBadge(u.status)}</td>
                    <td>
                      <div className="admin-verification-icons">
                        <span
                          className={`admin-verify-badge ${u.isEmailVerified ? 'admin-verify-badge--ok' : 'admin-verify-badge--no'}`}
                          title={u.isEmailVerified ? 'Email vérifié' : 'Email non vérifié'}
                        >
                          <i className="fa-solid fa-envelope"></i>
                        </span>
                        <span
                          className={`admin-verify-badge ${u.isPhoneVerified ? 'admin-verify-badge--ok' : 'admin-verify-badge--no'}`}
                          title={u.isPhoneVerified ? 'Téléphone vérifié' : 'Téléphone non vérifié'}
                        >
                          <i className="fa-solid fa-phone"></i>
                        </span>
                      </div>
                    </td>
                    <td>
                      {u.role === 'vendeur' || u.role === 'seller' ? (
                        <span className="admin-tag admin-tag--seller">
                          <i className="fa-solid fa-box"></i> {u.productsCount ?? 0} prod.
                        </span>
                      ) : (
                        <span className="admin-tag admin-tag--client">
                          <i className="fa-solid fa-bag-shopping"></i> {u.ordersCount ?? 0} cmd
                        </span>
                      )}
                    </td>
                    <td>
                      <span className="admin-date-text">{formatDate(u.lastLogin)}</span>
                    </td>
                    <td>
                      <div className="admin-actions-cell">
                        <button
                          type="button"
                          className="admin-btn-icon"
                          title="Consulter la fiche détaillée"
                          onClick={() => onViewDetails(u._id)}
                        >
                          <i className="fa-solid fa-eye"></i>
                        </button>
                        <button
                          type="button"
                          className="admin-btn-icon admin-btn-icon--edit"
                          title="Modifier les informations"
                          onClick={() => onEditUser(u)}
                        >
                          <i className="fa-solid fa-pen-to-square"></i>
                        </button>
                        {!isSelf && (
                          <button
                            type="button"
                            className={`admin-btn-icon ${u.status === 'suspendu' ? 'admin-btn-icon--reactivate' : 'admin-btn-icon--suspend'}`}
                            title={u.status === 'suspendu' ? 'Réactiver le compte' : 'Suspendre le compte'}
                            onClick={() => onToggleStatus(u)}
                          >
                            <i className={`fa-solid ${u.status === 'suspendu' ? 'fa-unlock' : 'fa-ban'}`}></i>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Vue Mobile : Fiches synthétiques tactiles */}
      <div className="admin-users-mobile-list" aria-label="Liste mobile des utilisateurs">
        {users.map((u) => {
          const isSelf = currentAdminId && String(currentAdminId) === String(u._id);
          return (
            <div key={u._id} className="admin-user-mobile-card">
              <div className="admin-user-mobile-header">
                <div className="admin-user-cell">
                  <div className="admin-user-avatar">
                    {u.avatar ? <img src={u.avatar} alt={u.name} /> : (u.name || 'U').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <strong>{u.name}</strong>
                    <div className="admin-text-muted">{u.email}</div>
                  </div>
                </div>
                {getStatusBadge(u.status)}
              </div>
              <div className="admin-user-mobile-details">
                <div>
                  <span className="admin-label">Rôle :</span> {getRoleBadge(u.role)}
                </div>
                <div>
                  <span className="admin-label">Téléphone :</span> {u.phone || 'Non renseigné'}
                </div>
                <div>
                  <span className="admin-label">Activité :</span>{' '}
                  {u.role === 'vendeur' ? `${u.productsCount ?? 0} produits` : `${u.ordersCount ?? 0} commandes`}
                </div>
                <div>
                  <span className="admin-label">Dernière connexion :</span> {formatDate(u.lastLogin)}
                </div>
              </div>
              <div className="admin-user-mobile-actions">
                <button type="button" className="admin-btn admin-btn-xs admin-btn-secondary" onClick={() => onViewDetails(u._id)}>
                  <i className="fa-solid fa-eye"></i> Détails
                </button>
                <button type="button" className="admin-btn admin-btn-xs admin-btn-secondary" onClick={() => onEditUser(u)}>
                  <i className="fa-solid fa-pen"></i> Modifier
                </button>
                {!isSelf && (
                  <button
                    type="button"
                    className={`admin-btn admin-btn-xs ${u.status === 'suspendu' ? 'admin-btn-primary' : 'admin-btn-danger'}`}
                    onClick={() => onToggleStatus(u)}
                  >
                    <i className={`fa-solid ${u.status === 'suspendu' ? 'fa-unlock' : 'fa-ban'}`}></i>{' '}
                    {u.status === 'suspendu' ? 'Réactiver' : 'Suspendre'}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Barre de pagination serveur */}
      <div className="admin-pagination-bar">
        <span className="admin-pagination-info">
          Page <strong>{pagination.page}</strong> sur <strong>{pagination.totalPages || 1}</strong> ({pagination.total} utilisateur{pagination.total > 1 ? 's' : ''})
        </span>
        <div className="admin-pagination-actions">
          <button
            type="button"
            className="admin-btn admin-btn-secondary admin-btn-xs"
            disabled={pagination.page <= 1 || loading}
            onClick={() => onPageChange(pagination.page - 1)}
          >
            <i className="fa-solid fa-chevron-left"></i> Précédent
          </button>
          <button
            type="button"
            className="admin-btn admin-btn-secondary admin-btn-xs"
            disabled={pagination.page >= pagination.totalPages || loading}
            onClick={() => onPageChange(pagination.page + 1)}
          >
            Suivant <i className="fa-solid fa-chevron-right"></i>
          </button>
        </div>
      </div>
    </div>
  );
};
