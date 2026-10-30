import React from 'react';

/**
 * Résolution sémantique de l'icône, du libellé et de la couleur du badge
 * selon le type d'événement de notification.
 */
const getBadgeMeta = (type) => {
  switch (type) {
    case 'order_new':
      return { label: 'Commande', color: 'badge-blue', icon: 'fa-bag-shopping' };
    case 'order_status':
    case 'order_confirmed':
    case 'order_in_preparation':
    case 'order_shipped':
      return { label: 'Livraison', color: 'badge-purple', icon: 'fa-truck-fast' };
    case 'order_delivered':
      return { label: 'Livrée', color: 'badge-green', icon: 'fa-circle-check' };
    case 'price_drop':
      return { label: 'Baisse de prix', color: 'badge-amber', icon: 'fa-tag' };
    case 'new_product':
      return { label: 'Nouveauté', color: 'badge-cyan', icon: 'fa-wand-magic-sparkles' };
    case 'promo_ending':
      return { label: 'Promotion', color: 'badge-red', icon: 'fa-fire' };
    default:
      return { label: 'Alerte', color: 'badge-gray', icon: 'fa-bell' };
  }
};

/**
 * Composant modulaire affichant une carte individuelle de notification
 * dans le flux de la page dédiée aux notifications.
 */
export const NotificationFeedCard = ({
  notification,
  onCardClick,
  onMarkAsRead,
  onRemove,
}) => {
  const meta = getBadgeMeta(notification.type);

  return (
    <article
      className={`notif-feed-card ${notification.isRead ? 'is-read' : 'is-unread'}`}
      onClick={() => onCardClick(notification)}
    >
      <div className="notif-feed-icon-col">
        <div className={`notif-feed-avatar ${meta.color}`}>
          <i className={`fa-solid ${meta.icon}`}></i>
        </div>
      </div>

      <div className="notif-feed-content-col">
        <div className="notif-feed-header-line">
          <div className="notif-tag-wrap">
            <span className={`notif-tag-badge ${meta.color}`}>{meta.label}</span>
            {!notification.isRead && <span className="notif-pill-new">Nouveau</span>}
          </div>
          <time className="notif-feed-time">
            {new Date(notification.createdAt).toLocaleDateString('fr-FR', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </time>
        </div>

        <h2 className="notif-feed-headline">
          {notification.title}
          {!notification.isRead && <span className="notif-pulse-dot" />}
        </h2>

        <p className="notif-feed-desc">{notification.message}</p>

        {(notification.orderNumber || notification.productId) && (
          <div className="notif-feed-links-bar">
            {notification.orderNumber && (
              <span className="notif-order-link">
                <i className="fa-solid fa-box-open"></i> Commande #{notification.orderNumber}
              </span>
            )}
            {notification.productId && (
              <span className="notif-product-link">
                <i className="fa-solid fa-arrow-up-right-from-square"></i> Consulter l&apos;article
              </span>
            )}
          </div>
        )}
      </div>

      <div className="notif-feed-actions-col" onClick={(e) => e.stopPropagation()}>
        {!notification.isRead && (
          <button
            type="button"
            className="btn-feed-action-circle"
            onClick={() => onMarkAsRead(notification._id)}
            title="Marquer comme lue"
            aria-label="Marquer comme lue"
          >
            <i className="fa-solid fa-check"></i>
          </button>
        )}
        <button
          type="button"
          className="btn-feed-action-circle delete-action"
          onClick={() => onRemove(notification._id)}
          title="Supprimer la notification"
          aria-label="Supprimer la notification"
        >
          <i className="fa-solid fa-trash-can"></i>
        </button>
      </div>
    </article>
  );
};

export default NotificationFeedCard;
