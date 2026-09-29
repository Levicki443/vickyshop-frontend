import React, { useState } from 'react';
import { updateOrderStatusApi } from '../../services/adminApi';

/**
 * Modale complète d'inspection et de gestion d'une commande dans le Backoffice.
 * Permet à l'administrateur d'examiner les détails du client, les articles,
 * de contacter directement le client (WhatsApp/Appel) et de faire progresser le statut.
 */
export const AdminOrderDetailsModal = ({ order, onClose, onOrderUpdated }) => {
  const [updating, setUpdating] = useState(false);
  const [currentOrder, setCurrentOrder] = useState(order);
  const [selectedStatus, setSelectedStatus] = useState(order?.orderStatus || 'recue');
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState(order?.paymentStatus || 'en_attente');
  const [adminComment, setAdminComment] = useState('');
  const [feedback, setFeedback] = useState(null);

  if (!currentOrder) return null;

  // Normalisation des numéros WhatsApp en Côte d'Ivoire
  const cleanPhone = (currentOrder.customerPhone || currentOrder.customer?.phone || '').replace(/\D/g, '');
  const formattedWaNumber = cleanPhone.startsWith('225') ? cleanPhone : `225${cleanPhone}`;
  const waLink = cleanPhone ? `https://wa.me/${formattedWaNumber}?text=Bonjour%20${encodeURIComponent(currentOrder.customerName || 'Cher client')},%20concernant%20votre%20commande%20%23${currentOrder.orderNumber}%20sur%20Vicky-Shop...` : null;

  const handleUpdateStatus = async (newStatus, newPaymentStatus = null) => {
    setUpdating(true);
    setFeedback(null);
    try {
      const statusToApply = newStatus || selectedStatus;
      const paymentToApply = newPaymentStatus !== null ? newPaymentStatus : selectedPaymentStatus;

      const updated = await updateOrderStatusApi(currentOrder._id, statusToApply, paymentToApply, adminComment);
      
      const updatedOrderData = updated.order || updated.data?.order || updated;
      setCurrentOrder(updatedOrderData);
      setSelectedStatus(statusToApply);
      if (paymentToApply) setSelectedPaymentStatus(paymentToApply);
      setAdminComment('');

      setFeedback({
        type: 'success',
        message: `Statut mis à jour avec succès : '${statusToApply}'. Email client notifié via Brevo.`,
      });

      if (onOrderUpdated) {
        onOrderUpdated(updatedOrderData);
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Erreur lors de la mise à jour.' });
    } finally {
      setUpdating(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'recue':
        return <span className="admin-status-badge admin-badge-info"><i className="fa-solid fa-inbox"></i> Reçue</span>;
      case 'en_preparation':
        return <span className="admin-status-badge admin-badge-warning"><i className="fa-solid fa-box-open"></i> Confirmée / En préparation</span>;
      case 'en_livraison':
        return <span className="admin-status-badge admin-badge-primary"><i className="fa-solid fa-truck-fast"></i> En cours de livraison</span>;
      case 'livree':
        return <span className="admin-status-badge admin-badge-success"><i className="fa-solid fa-circle-check"></i> Livrée</span>;
      case 'annulee':
        return <span className="admin-status-badge admin-badge-danger"><i className="fa-solid fa-ban"></i> Refusée / Annulée</span>;
      default:
        return <span className="admin-status-badge">{status}</span>;
    }
  };

  const formatPrice = (amount) => {
    if (typeof amount !== 'number') return '0 FCFA';
    return `${amount.toLocaleString('fr-FR')} FCFA`;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const customerName = currentOrder.customerName || currentOrder.customer?.name || 'Client anonyme';
  const customerPhone = currentOrder.customerPhone || currentOrder.customer?.phone || '-';
  const customerEmail = currentOrder.customerEmail || currentOrder.customer?.email || '-';
  const deliveryAddress = currentOrder.deliveryAddress || currentOrder.deliveryAddress?.address || '-';
  const city = currentOrder.city || currentOrder.deliveryAddress?.city || 'Abidjan';
  const deliveryNotes = currentOrder.deliveryNotes || currentOrder.deliveryAddress?.notes;

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div
        className="admin-modal-container admin-modal-lg"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
      >
        {/* EN-TÊTE MODALE */}
        <div className="admin-modal-header">
          <div>
            <div className="admin-modal-order-tag">
              <span>Commande #{currentOrder.orderNumber || currentOrder._id.substring(0, 8)}</span>
              {getStatusBadge(currentOrder.orderStatus)}
            </div>
            <p className="admin-modal-subtitle">
              Passée le {formatDate(currentOrder.createdAt)} • Mode : <strong>{currentOrder.paymentMethod?.toUpperCase()}</strong>
            </p>
          </div>
          <button
            type="button"
            className="admin-modal-close"
            onClick={onClose}
            aria-label="Fermer"
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        {feedback && (
          <div className={`admin-alert admin-alert-${feedback.type === 'success' ? 'success' : 'danger'}`}>
            <i className={`fa-solid fa-${feedback.type === 'success' ? 'circle-check' : 'circle-exclamation'}`}></i>
            <span>{feedback.message}</span>
          </div>
        )}

        {/* BARRE D'ACTIONS RAPIDES DE STATUT */}
        <div className="admin-quick-actions-bar">
          <span className="actions-label"><i className="fa-solid fa-bolt"></i> Actions rapides :</span>
          <div className="actions-buttons-group">
            {currentOrder.orderStatus === 'recue' && (
              <button
                type="button"
                className="admin-btn admin-btn-warning admin-btn-sm"
                onClick={() => handleUpdateStatus('en_preparation')}
                disabled={updating}
              >
                <i className="fa-solid fa-check"></i> Confirmer & Préparer
              </button>
            )}

            {(currentOrder.orderStatus === 'recue' || currentOrder.orderStatus === 'en_preparation') && (
              <button
                type="button"
                className="admin-btn admin-btn-primary admin-btn-sm"
                onClick={() => handleUpdateStatus('en_livraison')}
                disabled={updating}
              >
                <i className="fa-solid fa-truck-fast"></i> Confier au livreur
              </button>
            )}

            {currentOrder.orderStatus === 'en_livraison' && (
              <button
                type="button"
                className="admin-btn admin-btn-success admin-btn-sm"
                onClick={() => handleUpdateStatus('livree', 'paye')}
                disabled={updating}
              >
                <i className="fa-solid fa-circle-check"></i> Marquer comme Livrée
              </button>
            )}

            {currentOrder.orderStatus !== 'annulee' && currentOrder.orderStatus !== 'livree' && (
              <button
                type="button"
                className="admin-btn admin-btn-danger admin-btn-sm"
                onClick={() => handleUpdateStatus('annulee')}
                disabled={updating}
              >
                <i className="fa-solid fa-ban"></i> Refuser / Annuler
              </button>
            )}
          </div>
        </div>

        <div className="admin-order-modal-grid">
          {/* CLIENT & LIVRAISON */}
          <div className="admin-card">
            <h4 className="admin-card-title">
              <i className="fa-solid fa-user"></i> Destinataire & Livraison
            </h4>
            <div className="admin-detail-row">
              <span className="admin-detail-label">Client :</span>
              <strong>{customerName}</strong>
            </div>
            <div className="admin-detail-row">
              <span className="admin-detail-label">Téléphone :</span>
              <div className="admin-phone-contact-box">
                <a href={`tel:${customerPhone}`} className="admin-link">
                  <i className="fa-solid fa-phone"></i> {customerPhone}
                </a>
                {waLink && (
                  <a
                    href={waLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="admin-btn-whatsapp-sm"
                    title="Ouvrir conversation WhatsApp"
                  >
                    <i className="fa-brands fa-whatsapp"></i> WhatsApp
                  </a>
                )}
              </div>
            </div>
            <div className="admin-detail-row">
              <span className="admin-detail-label">Email Brevo :</span>
              <span>{customerEmail !== '-' ? <a href={`mailto:${customerEmail}`}>{customerEmail}</a> : 'Non renseigné'}</span>
            </div>
            <div className="admin-detail-row">
              <span className="admin-detail-label">Adresse :</span>
              <span><strong>{deliveryAddress}</strong>, {city}</span>
            </div>
            {deliveryNotes && (
              <div className="admin-detail-row">
                <span className="admin-detail-label">Repères / Notes :</span>
                <span className="admin-note"><i className="fa-solid fa-circle-info"></i> {deliveryNotes}</span>
              </div>
            )}
          </div>

          {/* PAIEMENT & CONTRÔLE STATUT MANUEL */}
          <div className="admin-card">
            <h4 className="admin-card-title">
              <i className="fa-solid fa-credit-card"></i> Paiement & État
            </h4>
            <div className="admin-detail-row">
              <span className="admin-detail-label">Moyen de paiement :</span>
              <span className="admin-badge-secondary">{currentOrder.paymentMethod?.toUpperCase()}</span>
            </div>
            <div className="admin-detail-row">
              <span className="admin-detail-label">Statut Paiement :</span>
              <span className={`admin-status-badge admin-badge-${currentOrder.paymentStatus === 'paye' ? 'success' : 'warning'}`}>
                {currentOrder.paymentStatus === 'paye' ? 'Payé' : 'En attente'}
              </span>
            </div>

            <div className="admin-status-update-box">
              <label htmlFor="order-status-select"><strong>Gestion manuelle du statut :</strong></label>
              <div className="admin-status-select-wrap">
                <select
                  id="order-status-select"
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="admin-select"
                >
                  <option value="recue">Reçue (En attente)</option>
                  <option value="en_preparation">Confirmée / En préparation</option>
                  <option value="en_livraison">En cours de livraison</option>
                  <option value="livree">Livrée</option>
                  <option value="annulee">Refusée / Annulée</option>
                </select>

                <select
                  aria-label="Statut paiement"
                  value={selectedPaymentStatus}
                  onChange={(e) => setSelectedPaymentStatus(e.target.value)}
                  className="admin-select"
                >
                  <option value="en_attente">Paiement en attente</option>
                  <option value="paye">Paiement validé (Payé)</option>
                  <option value="echoue">Paiement échoué</option>
                  <option value="rembourse">Remboursé</option>
                </select>
              </div>

              <input
                type="text"
                placeholder="Commentaire ou note interne (Optionnel)..."
                value={adminComment}
                onChange={(e) => setAdminComment(e.target.value)}
                className="admin-input admin-comment-input"
              />

              <button
                type="button"
                className="admin-btn admin-btn-primary admin-btn-sm"
                onClick={() => handleUpdateStatus()}
                disabled={updating}
              >
                {updating ? (
                  <>
                    <i className="fa-solid fa-spinner fa-spin"></i> Mise à jour...
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-floppy-disk"></i> Enregistrer les modifications
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* ARTICLES COMMANDÉS */}
        <div className="admin-card" style={{ marginTop: '1rem' }}>
          <h4 className="admin-card-title">
            <i className="fa-solid fa-bag-shopping"></i> Articles Commandés ({currentOrder.items?.length || 0})
          </h4>
          <div className="admin-table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Produit</th>
                  <th>Prix Unitaire</th>
                  <th>Quantité</th>
                  <th>Options</th>
                  <th style={{ textAlign: 'right' }}>Sous-total</th>
                </tr>
              </thead>
              <tbody>
                {currentOrder.items?.map((item, idx) => (
                  <tr key={idx}>
                    <td>
                      <div className="admin-table-product">
                        {item.image && (
                          <img
                            src={item.image}
                            alt={item.title}
                            className="admin-product-thumb"
                          />
                        )}
                        <strong>{item.title}</strong>
                      </div>
                    </td>
                    <td>{formatPrice(item.price)}</td>
                    <td><span className="admin-qty-badge">x{item.quantity}</span></td>
                    <td>
                      {item.size && <span className="admin-tag">Taille: {item.size}</span>}{' '}
                      {item.color && <span className="admin-tag">Couleur: {item.color}</span>}
                      {!item.size && !item.color && '-'}
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 600 }}>
                      {formatPrice(item.price * item.quantity)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="admin-order-summary-box">
            <div className="admin-order-summary-row">
              <span>Sous-total articles :</span>
              <span>{formatPrice(currentOrder.subtotal || 0)}</span>
            </div>
            <div className="admin-order-summary-row">
              <span>Frais de livraison :</span>
              <span>{currentOrder.shippingCost === 0 ? 'Gratuit' : formatPrice(currentOrder.shippingCost || 0)}</span>
            </div>
            {(currentOrder.discount > 0 || currentOrder.discountAmount > 0) && (
              <div className="admin-order-summary-row text-success">
                <span>Remise promotionnelle :</span>
                <span>-{formatPrice(currentOrder.discount || currentOrder.discountAmount)}</span>
              </div>
            )}
            <div className="admin-order-summary-row admin-order-total-row">
              <strong>Montant total à encaisser :</strong>
              <strong className="admin-price-highlight">{formatPrice(currentOrder.total)}</strong>
            </div>
          </div>
        </div>

        <div className="admin-modal-footer">
          <button
            type="button"
            className="admin-btn admin-btn-secondary"
            onClick={onClose}
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
