import React from 'react';

/**
 * Fiche détaillée d'un utilisateur (Sections A, B et C).
 * Présente les données personnelles, commerciales réelles et de sécurité du compte.
 */
export const AdminUserDetailsModal = ({ data, onClose, formatPrice }) => {
  if (!data || !data.user) return null;

  const { user, commercialInfo } = data;

  const formatDate = (dateVal, includeTime = false) => {
    if (!dateVal) return 'Non disponible';
    try {
      const d = new Date(dateVal);
      const options = {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      };
      if (includeTime) {
        options.hour = '2-digit';
        options.minute = '2-digit';
      }
      return d.toLocaleDateString('fr-FR', options);
    } catch {
      return 'Date invalide';
    }
  };

  const isSeller = user.role === 'vendeur' || user.role === 'seller';

  return (
    <div className="admin-modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="admin-modal-card admin-modal-card--lg" onClick={(e) => e.stopPropagation()}>
        {/* En-tête de la fiche */}
        <div className="admin-modal-header">
          <div className="admin-modal-header-left">
            <div className="admin-user-avatar admin-user-avatar--lg" aria-hidden="true">
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} />
              ) : (
                (user.name || 'U').charAt(0).toUpperCase()
              )}
            </div>
            <div>
              <h3 className="admin-modal-title">{user.name}</h3>
              <p className="admin-modal-subtitle">
                Identifiant base : <code>{user._id}</code>
              </p>
            </div>
          </div>
          <button type="button" className="admin-modal-close" onClick={onClose} aria-label="Fermer la fiche">
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        {/* Corps avec les 3 sections ordonnées */}
        <div className="admin-modal-body admin-user-detail-sections">
          {/* SECTION A : INFORMATIONS PERSONNELLES */}
          <section className="admin-detail-section">
            <h4 className="admin-detail-section-title">
              <i className="fa-solid fa-id-card"></i> Section A : Informations personnelles
            </h4>
            <div className="admin-detail-grid">
              <div className="admin-detail-item">
                <span className="admin-detail-label">Nom complet</span>
                <span className="admin-detail-value">{user.name || 'Non renseigné'}</span>
              </div>
              <div className="admin-detail-item">
                <span className="admin-detail-label">Adresse e-mail</span>
                <span className="admin-detail-value">{user.email || 'Non renseigné'}</span>
              </div>
              <div className="admin-detail-item">
                <span className="admin-detail-label">Téléphone</span>
                <span className="admin-detail-value">{user.phone || 'Non renseigné'}</span>
              </div>
              <div className="admin-detail-item">
                <span className="admin-detail-label">Ville &amp; Adresse</span>
                <span className="admin-detail-value">
                  {user.city || 'Abidjan'} {user.address ? `— ${user.address}` : ''}
                </span>
              </div>
              <div className="admin-detail-item">
                <span className="admin-detail-label">Rôle sur la plateforme</span>
                <span className="admin-detail-value admin-capitalize">{user.role}</span>
              </div>
              <div className="admin-detail-item">
                <span className="admin-detail-label">Statut du compte</span>
                <span className={`admin-status-pill admin-status-pill--${user.status || 'active'}`}>
                  {user.status === 'suspendu'
                    ? 'Suspendu'
                    : user.status === 'desactive'
                    ? 'Désactivé'
                    : 'Actif'}
                </span>
              </div>
              {user.suspensionReason && (
                <div className="admin-detail-item admin-detail-item--full">
                  <span className="admin-detail-label">Motif de suspension</span>
                  <span className="admin-detail-alert">{user.suspensionReason}</span>
                </div>
              )}
            </div>
          </section>

          {/* SECTION B : INFORMATIONS COMMERCIALES */}
          <section className="admin-detail-section">
            <h4 className="admin-detail-section-title">
              <i className="fa-solid fa-chart-line"></i> Section B : Informations commerciales
            </h4>

            {isSeller && commercialInfo?.sellerInfo ? (
              <div className="admin-seller-commercial-box">
                <div className="admin-detail-grid">
                  <div className="admin-detail-item">
                    <span className="admin-detail-label">Boutique</span>
                    <span className="admin-detail-value">
                      {commercialInfo.sellerInfo.shopName || 'Non renseigné'}
                    </span>
                  </div>
                  <div className="admin-detail-item">
                    <span className="admin-detail-label">Produits publiés</span>
                    <span className="admin-detail-value">
                      {commercialInfo.sellerInfo.totalProducts} ({commercialInfo.sellerInfo.activeProducts} actifs)
                    </span>
                  </div>
                  <div className="admin-detail-item">
                    <span className="admin-detail-label">Commandes reçues</span>
                    <span className="admin-detail-value">
                      {commercialInfo.sellerInfo.totalSellerOrders} commandes
                    </span>
                  </div>
                  <div className="admin-detail-item">
                    <span className="admin-detail-label">Chiffre d&apos;affaires généré</span>
                    <span className="admin-detail-value admin-price-highlight">
                      {formatPrice
                        ? formatPrice(commercialInfo.sellerInfo.sellerRevenue)
                        : `${commercialInfo.sellerInfo.sellerRevenue} FCFA`}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="admin-client-commercial-box">
                <div className="admin-detail-grid">
                  <div className="admin-detail-item">
                    <span className="admin-detail-label">Nombre total de commandes</span>
                    <span className="admin-detail-value">{commercialInfo?.ordersCount ?? 0}</span>
                  </div>
                  <div className="admin-detail-item">
                    <span className="admin-detail-label">Montant total dépensé</span>
                    <span className="admin-detail-value admin-price-highlight">
                      {formatPrice
                        ? formatPrice(commercialInfo?.totalSpent ?? 0)
                        : `${commercialInfo?.totalSpent ?? 0} FCFA`}
                    </span>
                  </div>
                  <div className="admin-detail-item admin-detail-item--full">
                    <span className="admin-detail-label">Dernière commande passée</span>
                    <span className="admin-detail-value">
                      {commercialInfo?.lastOrder
                        ? `N° ${commercialInfo.lastOrder.orderNumber} le ${formatDate(commercialInfo.lastOrder.createdAt, true)} (${formatPrice ? formatPrice(commercialInfo.lastOrder.total) : commercialInfo.lastOrder.total + ' FCFA'})`
                        : 'Aucune commande enregistrée'}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* SECTION C : INFORMATIONS DE COMPTE ET AUDIT */}
          <section className="admin-detail-section">
            <h4 className="admin-detail-section-title">
              <i className="fa-solid fa-shield-halved"></i> Section C : Informations de compte &amp; Audit
            </h4>
            <div className="admin-detail-grid">
              <div className="admin-detail-item">
                <span className="admin-detail-label">Date d&apos;inscription</span>
                <span className="admin-detail-value">{formatDate(user.createdAt, true)}</span>
              </div>
              <div className="admin-detail-item">
                <span className="admin-detail-label">Dernière connexion</span>
                <span className="admin-detail-value">{formatDate(user.lastLogin, true)}</span>
              </div>
              <div className="admin-detail-item">
                <span className="admin-detail-label">Vérification e-mail</span>
                <span className="admin-detail-value">
                  {user.isEmailVerified ? 'Vérifié' : 'Non vérifié'}
                </span>
              </div>
              <div className="admin-detail-item">
                <span className="admin-detail-label">Vérification téléphone</span>
                <span className="admin-detail-value">
                  {user.isPhoneVerified ? 'Vérifié' : 'Non vérifié'}
                </span>
              </div>
              {user.adminNotes && (
                <div className="admin-detail-item admin-detail-item--full">
                  <span className="admin-detail-label">Notes administratives internes</span>
                  <div className="admin-notes-box">{user.adminNotes}</div>
                </div>
              )}
            </div>

            {/* Historique des modifications administratives */}
            {user.adminAuditLog && user.adminAuditLog.length > 0 && (
              <div className="admin-audit-log-box">
                <h5 className="admin-audit-log-title">Journal des actions administratives</h5>
                <ul className="admin-audit-log-list">
                  {user.adminAuditLog.slice(-5).reverse().map((log, idx) => (
                    <li key={idx} className="admin-audit-log-item">
                      <span className="admin-audit-log-date">{formatDate(log.date, true)}</span>
                      <strong className="admin-audit-log-action">{log.action}</strong> par{' '}
                      <span className="admin-audit-log-author">{log.performedByName}</span>
                      {log.reason && <p className="admin-audit-log-reason">« {log.reason} »</p>}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>
        </div>

        {/* Pied de la modale */}
        <div className="admin-modal-footer">
          <button type="button" className="admin-btn admin-btn-secondary" onClick={onClose}>
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
