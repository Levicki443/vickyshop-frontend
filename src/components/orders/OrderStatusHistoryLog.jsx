import React, { useState } from 'react';

const ROLE_BADGES = {
  vendeur: { label: 'Vendeur Certifié', cls: 'badge-seller', icon: 'fa-store' },
  admin: { label: 'Service Client & Admin', cls: 'badge-admin', icon: 'fa-shield-halved' },
  client: { label: 'Client', cls: 'badge-client', icon: 'fa-user' },
  livreur: { label: 'Livreur Express', cls: 'badge-courier', icon: 'fa-truck' },
  systeme: { label: 'Système Vicky-Shop', cls: 'badge-system', icon: 'fa-robot' },
};

export const OrderStatusHistoryLog = ({ statusHistory = [], orderNumber = '' }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!statusHistory || statusHistory.length === 0) {
    return (
      <div className="order-history-empty">
        <i className="fa-solid fa-clock-rotate-left"></i>
        <span>En attente des premières étapes de traitement.</span>
      </div>
    );
  }

  const sortedHistory = [...statusHistory].sort(
    (a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0)
  );

  const displayedHistory = isExpanded ? sortedHistory : sortedHistory.slice(0, 3);

  return (
    <div className="order-history-card">
      <div className="order-history-header">
        <div className="order-history-title-wrap">
          <i className="fa-solid fa-clock-rotate-left header-icon"></i>
          <div>
            <h5 className="history-title">Historique &amp; Traçabilité en Direct</h5>
            <span className="history-subtitle">
              {statusHistory.length} événement{statusHistory.length > 1 ? 's' : ''} enregistré{statusHistory.length > 1 ? 's' : ''} pour #{orderNumber}
            </span>
          </div>
        </div>

        {statusHistory.length > 3 && (
          <button
            type="button"
            className="btn-toggle-history"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? (
              <>
                <i className="fa-solid fa-chevron-up"></i> Voir moins
              </>
            ) : (
              <>
                <i className="fa-solid fa-chevron-down"></i> Voir tout ({statusHistory.length})
              </>
            )}
          </button>
        )}
      </div>

      <div className="order-history-timeline-list">
        {displayedHistory.map((item, idx) => {
          const roleConfig = ROLE_BADGES[item.changedByRole] || ROLE_BADGES.systeme;
          const dateObj = new Date(item.updatedAt || Date.now());

          return (
            <div key={idx} className="history-timeline-item">
              <div className="history-marker-col">
                <div className="history-marker-dot">
                  <i className="fa-solid fa-check"></i>
                </div>
                {idx < displayedHistory.length - 1 && <div className="history-line" />}
              </div>

              <div className="history-content-col">
                <div className="history-meta-row">
                  <span className="history-status-tag">
                    {item.status || item.newStatus || 'Mise à jour'}
                  </span>
                  <span className={`history-role-badge ${roleConfig.cls}`}>
                    <i className={`fa-solid ${roleConfig.icon}`}></i> {roleConfig.label}
                  </span>
                  <span className="history-date-text">
                    {dateObj.toLocaleDateString('fr-FR', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric',
                    })}{' '}
                    à{' '}
                    {dateObj.toLocaleTimeString('fr-FR', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>

                {item.comment && <p className="history-comment-text">{item.comment}</p>}
                {item.changedByName && item.changedByRole !== 'systeme' && (
                  <span className="history-author-note">
                    Effectué par : <strong>{item.changedByName}</strong>
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OrderStatusHistoryLog;
