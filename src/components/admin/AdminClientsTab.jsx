import React, { useState, useMemo } from 'react';

/**
 * Composant d'administration : Base Clients & Utilisateurs (CRM).
 * Affiche l'ensemble des comptes inscrits (Clients, Vendeurs, Admins)
 * et des acheteurs issus des commandes avec recherche et filtres par rôle.
 */
export const AdminClientsTab = ({
  users = [],
  userSearch = '',
  setUserSearch,
  onRefresh,
  formatPrice,
  loading = false,
}) => {
  const [roleFilter, setRoleFilter] = useState('all');

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      if (roleFilter === 'all') return true;
      if (roleFilter === 'admin') return u.role === 'admin';
      if (roleFilter === 'seller') return u.role === 'vendeur' || u.role === 'seller';
      if (roleFilter === 'registered') return u.isRegistered && u.role !== 'admin' && u.role !== 'vendeur';
      if (roleFilter === 'buyer') return !u.isRegistered;
      return true;
    });
  }, [users, roleFilter]);

  const getRoleBadge = (u) => {
    if (u.role === 'admin') {
      return <span className="admin-badge-danger">Administrateur</span>;
    }
    if (u.role === 'vendeur' || u.role === 'seller') {
      return <span className="admin-badge-warning">Vendeur Pro</span>;
    }
    if (u.isRegistered) {
      return <span className="admin-badge-success">Client (Inscrit)</span>;
    }
    return <span className="admin-badge-info">Client (Acheteur)</span>;
  };

  return (
    <div className="admin-tab-content">
      <div className="admin-page-header">
        <div>
          <h2 className="admin-page-title">
            Base Clients &amp; Utilisateurs ({users.length})
          </h2>
          <p className="admin-page-desc">
            Consultez et contactez tous les membres inscrits et les acheteurs de la boutique.
          </p>
        </div>
        <button
          type="button"
          className="admin-btn admin-btn-secondary admin-btn-sm"
          onClick={onRefresh}
          disabled={loading}
          title="Actualiser la liste des clients"
        >
          <i className={`fa-solid ${loading ? 'fa-spinner fa-spin' : 'fa-rotate'}`}></i>
          <span>{loading ? 'Chargement...' : 'Actualiser'}</span>
        </button>
      </div>

      {/* Barre de recherche et filtres par statut */}
      <div className="admin-filter-bar" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <div className="admin-search-input-wrap" style={{ flex: '1 1 280px' }}>
          <i className="fa-solid fa-magnifying-glass"></i>
          <input
            type="text"
            placeholder="Rechercher par nom, email, téléphone ou ville..."
            value={userSearch}
            onChange={(e) => setUserSearch(e.target.value)}
            className="admin-input"
          />
        </div>

        <div className="admin-filter-group" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <button
            type="button"
            className={`admin-btn admin-btn-xs ${roleFilter === 'all' ? 'admin-btn-primary' : 'admin-btn-secondary'}`}
            onClick={() => setRoleFilter('all')}
          >
            Tous ({users.length})
          </button>
          <button
            type="button"
            className={`admin-btn admin-btn-xs ${roleFilter === 'registered' ? 'admin-btn-primary' : 'admin-btn-secondary'}`}
            onClick={() => setRoleFilter('registered')}
          >
            Inscrits
          </button>
          <button
            type="button"
            className={`admin-btn admin-btn-xs ${roleFilter === 'buyer' ? 'admin-btn-primary' : 'admin-btn-secondary'}`}
            onClick={() => setRoleFilter('buyer')}
          >
            Acheteurs
          </button>
          <button
            type="button"
            className={`admin-btn admin-btn-xs ${roleFilter === 'seller' ? 'admin-btn-primary' : 'admin-btn-secondary'}`}
            onClick={() => setRoleFilter('seller')}
          >
            Vendeurs
          </button>
          <button
            type="button"
            className={`admin-btn admin-btn-xs ${roleFilter === 'admin' ? 'admin-btn-primary' : 'admin-btn-secondary'}`}
            onClick={() => setRoleFilter('admin')}
          >
            Admins
          </button>
        </div>
      </div>

      {/* Tableau CRM */}
      <div className="admin-card">
        <div className="admin-table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Nom &amp; Prénoms</th>
                <th>Email</th>
                <th>Téléphone</th>
                <th>Ville / Adresse</th>
                <th>Commandes</th>
                <th>Total Dépensé</th>
                <th>Rôle</th>
                <th>Contact</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u) => {
                const phoneDigits = u.phone ? u.phone.replace(/\D/g, '') : '';
                const ordersTotal = u.ordersCount ?? u.orderCount ?? 0;
                return (
                  <tr key={u._id || u.email}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div
                          style={{
                            width: '34px',
                            height: '34px',
                            borderRadius: '50%',
                            background: 'rgba(255,107,0,0.15)',
                            color: '#ff6b00',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: '700',
                            fontSize: '13px',
                          }}
                        >
                          {(u.name || 'C').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <strong>{u.name || 'Utilisateur'}</strong>
                          {u.createdAt && (
                            <div style={{ fontSize: '11px', color: '#9ca3af' }}>
                              Inscrit le {new Date(u.createdAt).toLocaleDateString('fr-FR')}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td>
                      <a href={`mailto:${u.email}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                        {u.email}
                      </a>
                    </td>
                    <td>{u.phone || 'Non renseigné'}</td>
                    <td>
                      <div>{u.city || 'Abidjan'}</div>
                      {u.address && <small style={{ color: '#9ca3af' }}>{u.address}</small>}
                    </td>
                    <td>
                      <span className="admin-tag">{ordersTotal} cmd</span>
                    </td>
                    <td className="admin-price-highlight">
                      {formatPrice ? formatPrice(u.totalSpent || 0) : `${u.totalSpent || 0} FCFA`}
                    </td>
                    <td>{getRoleBadge(u)}</td>
                    <td>
                      {phoneDigits ? (
                        <a
                          href={`https://wa.me/${phoneDigits}`}
                          target="_blank"
                          rel="noreferrer"
                          className="admin-btn admin-btn-xs admin-btn-whatsapp"
                          title="Contacter sur WhatsApp"
                        >
                          <i className="fa-brands fa-whatsapp"></i> WhatsApp
                        </a>
                      ) : (
                        <span style={{ color: '#6b7280' }}>-</span>
                      )}
                    </td>
                  </tr>
                );
              })}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={8} className="admin-empty-text" style={{ padding: '2.5rem 1rem' }}>
                    <i
                      className="fa-solid fa-users-slash"
                      style={{ fontSize: '32px', display: 'block', marginBottom: '12px', color: '#9ca3af' }}
                    ></i>
                    <p style={{ fontSize: '15px', fontWeight: '600', marginBottom: '6px' }}>
                      Aucun client trouvé
                    </p>
                    <p style={{ fontSize: '13px', color: '#6b7280' }}>
                      {userSearch
                        ? `Aucun résultat pour la recherche "${userSearch}".`
                        : 'Aucun compte enregistré pour ce filtre.'}
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
