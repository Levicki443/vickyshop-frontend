import React, { useState, useMemo } from 'react';
import { formatPrice } from '../../services/api';
import { updateSellerOrderItemStatus } from '../../services/sellerApi';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

const STATUS_MAP = {
  en_attente: { label: 'Reçue', color: 'badge-warning', next: 'confirmee', nextLabel: 'Confirmer' },
  recue: { label: 'Reçue', color: 'badge-warning', next: 'confirmee', nextLabel: 'Confirmer' },
  confirmee: { label: 'Confirmée', color: 'badge-info', next: 'en_preparation', nextLabel: 'En préparation' },
  en_preparation: { label: 'En préparation', color: 'badge-primary', next: 'expediee', nextLabel: 'Expédier' },
  expediee: { label: 'Expédiée', color: 'badge-accent', next: 'en_livraison', nextLabel: 'En livraison' },
  en_livraison: { label: 'En livraison', color: 'badge-warning', next: 'livree', nextLabel: 'Marquer livrée' },
  livree: { label: 'Livrée avec succès', color: 'badge-success', next: null, nextLabel: null },
  annulee: { label: 'Annulée', color: 'badge-danger', next: null, nextLabel: null },
  refusee: { label: 'Refusée', color: 'badge-danger', next: null, nextLabel: null },
  retournee: { label: 'Retournée', color: 'badge-info', next: null, nextLabel: null },
};

export const SellerOrdersList = ({ orders, loading, onRefresh }) => {
  const { token } = useAuth();
  const { addToast } = useToast();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [updatingItemId, setUpdatingItemId] = useState(null);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchSearch =
        !search.trim() ||
        order.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
        order.customerName.toLowerCase().includes(search.toLowerCase()) ||
        order.items.some((i) => i.title.toLowerCase().includes(search.toLowerCase()));

      const matchStatus =
        statusFilter === 'all' ||
        order.orderStatus === statusFilter ||
        order.items.some((i) => i.status === statusFilter);

      return matchSearch && matchStatus;
    });
  }, [orders, search, statusFilter]);

  const handleStatusChange = async (orderId, itemId, newStatus) => {
    setUpdatingItemId(itemId);
    try {
      await updateSellerOrderItemStatus(orderId, itemId, newStatus, token);
      addToast('Statut mis à jour', `L'article est maintenant "${STATUS_MAP[newStatus]?.label || newStatus}".`, 'success');
      onRefresh();
    } catch (err) {
      addToast('Erreur', err.message || 'Impossible de mettre à jour le statut.', 'error');
    } finally {
      setUpdatingItemId(null);
    }
  };

  return (
    <div className="seller-orders-section">
      <div className="seller-section-header-bar">
        <div>
          <h3 className="seller-section-title">Mes Commandes Reçues</h3>
          <p className="seller-section-desc">Gérez le workflow de validation, préparation et expédition de vos articles.</p>
        </div>
        <button type="button" className="btn btn-secondary btn-sm" onClick={onRefresh}>
          <i className="fa-solid fa-rotate-right"></i>
          <span>Actualiser</span>
        </button>
      </div>

      <div className="seller-filters-bar flex-wrap">
        <div className="search-input-wrapper">
          <i className="fa-solid fa-magnifying-glass"></i>
          <input
            type="text"
            className="form-input"
            placeholder="Rechercher n° commande, client, article..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="category-select-wrapper">
          <select className="form-input" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">Tous les statuts</option>
            <option value="en_attente">Reçues / En attente</option>
            <option value="confirmee">Confirmées</option>
            <option value="en_preparation">En préparation</option>
            <option value="expediee">Expédiées</option>
            <option value="en_livraison">En livraison</option>
            <option value="livree">Livrées</option>
            <option value="annulee">Annulées</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="seller-table-loading">
          <i className="fa-solid fa-spinner fa-spin"></i>
          <span>Chargement de vos commandes...</span>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="seller-empty-state">
          <i className="fa-solid fa-inbox empty-icon"></i>
          <h4>Aucune commande trouvée</h4>
          <p>Aucune commande ne correspond aux filtres sélectionnés.</p>
        </div>
      ) : (
        <div className="seller-orders-cards-list">
          {filteredOrders.map((order) => (
            <div key={order._id} className="seller-order-card">
              <div className="seller-order-card-header">
                <div className="order-main-info">
                  <span className="order-ref-badge">
                    <i className="fa-solid fa-receipt"></i> #{order.orderNumber}
                  </span>
                  <span className="order-date-text">
                    <i className="fa-regular fa-clock"></i>{' '}
                    {new Date(order.createdAt).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                <span className={`badge-payment ${order.paymentStatus === 'paye' ? 'badge-paye' : 'badge-pending'}`}>
                  <i className="fa-solid fa-hand-holding-dollar"></i>{' '}
                  {order.paymentStatus === 'paye' ? 'Paiement Encaissé' : 'Espèces à la livraison'}
                </span>
              </div>

              <div className="seller-order-card-body">
                <div className="order-customer-details">
                  <h5><i className="fa-solid fa-user"></i> Destinataire</h5>
                  <div className="customer-info-line">
                    <strong>Client :</strong> <span>{order.customerName}</span>
                  </div>
                  <div className="customer-info-line">
                    <strong>Téléphone :</strong>{' '}
                    <a href={`tel:${order.customerPhone}`} className="tel-link">
                      <i className="fa-brands fa-whatsapp"></i> {order.customerPhone}
                    </a>
                  </div>
                  <div className="customer-info-line">
                    <strong>Adresse :</strong> <span>{order.city} - {order.deliveryAddress}</span>
                  </div>
                </div>

                <div className="order-items-table-wrapper">
                  <h5><i className="fa-solid fa-bag-shopping"></i> Vos Articles</h5>
                  <div className="order-items-list">
                    {order.items.map((item) => {
                      const st = STATUS_MAP[item.status] || STATUS_MAP.en_attente;
                      return (
                        <div key={item._id || item.productId} className="seller-order-item-row">
                          <div className="item-left-col">
                            {item.image && <img src={item.image} alt={item.title} className="order-item-mini-thumb" />}
                            <div className="item-main-details">
                              <strong className="item-title">{item.title}</strong>
                              <div className="item-meta">
                                <span>Qté: <strong>{item.quantity}</strong></span>
                                {item.size && <span>• T: {item.size}</span>}
                                {item.color && <span>• C: {item.color}</span>}
                              </div>
                              <span className="item-price-calc">{formatPrice(item.price * item.quantity)}</span>
                            </div>
                          </div>

                          <div className="item-status-workflow">
                            <span className={`badge-status-sm ${st.color}`}>{st.label}</span>
                            {st.next && (
                              <button
                                type="button"
                                className="btn btn-sm btn-primary btn-workflow-action"
                                disabled={updatingItemId === (item._id || item.productId)}
                                onClick={() => handleStatusChange(order._id, item._id || item.productId, st.next)}
                              >
                                {st.nextLabel} <i className="fa-solid fa-arrow-right"></i>
                              </button>
                            )}
                            {item.status !== 'annulee' && item.status !== 'livree' && (
                              <button
                                type="button"
                                className="btn btn-sm btn-outline text-danger btn-workflow-cancel"
                                title="Annuler cet article"
                                disabled={updatingItemId === (item._id || item.productId)}
                                onClick={() => handleStatusChange(order._id, item._id || item.productId, 'annulee')}
                              >
                                <i className="fa-solid fa-ban"></i>
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="seller-order-card-footer">
                <button
                  type="button"
                  className="btn-history-trigger"
                  onClick={() => setSelectedOrderDetails(order)}
                >
                  <i className="fa-solid fa-clock-rotate-left"></i>
                  <span>Traçabilité &amp; Journal ({order.statusHistory?.length || 0})</span>
                </button>
                <div className="footer-amount-wrap">
                  <span className="footer-label">Sous-total Vendeur :</span>
                  <strong className="footer-total-amount">{formatPrice(order.sellerTotal || order.amountToCollect)}</strong>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modale d'Historique de Traçabilité */}
      {selectedOrderDetails && (
        <div className="modal-overlay" onClick={() => setSelectedOrderDetails(null)}>
          <div className="modal-box modal-history-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-history-header">
              <div className="d-flex align-items-center gap-2">
                <div className="modal-history-icon-badge">
                  <i className="fa-solid fa-clock-rotate-left"></i>
                </div>
                <div>
                  <h4>Journal de Traçabilité</h4>
                  <span className="text-muted text-xs">Commande #{selectedOrderDetails.orderNumber}</span>
                </div>
              </div>
              <button
                type="button"
                className="modal-close"
                onClick={() => setSelectedOrderDetails(null)}
                aria-label="Fermer"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <div className="modal-history-body">
              <div className="history-timeline">
                {selectedOrderDetails.statusHistory && selectedOrderDetails.statusHistory.length > 0 ? (
                  selectedOrderDetails.statusHistory.map((h, idx) => (
                    <div key={idx} className="timeline-step">
                      <div className="timeline-marker">
                        <i className="fa-solid fa-check"></i>
                      </div>
                      <div className="timeline-content">
                        <div className="timeline-status-header">
                          <span className="timeline-status-badge">
                            {STATUS_MAP[h.status]?.label || h.status}
                          </span>
                          <span className="timeline-date">
                            <i className="fa-regular fa-clock"></i>{' '}
                            {new Date(h.updatedAt).toLocaleDateString('fr-FR', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                        {h.comment && <p className="timeline-comment">{h.comment}</p>}
                        {h.changedByName && (
                          <span className="text-xs text-muted">
                            Auteur : <strong>{h.changedByName}</strong> ({h.changedByRole || 'système'})
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="timeline-empty">
                    <i className="fa-solid fa-timeline empty-icon"></i>
                    <p>Commande passée avec succès. En attente de traitement.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerOrdersList;
