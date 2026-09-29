import React from 'react';
import { formatPrice } from '../../../services/api';

/**
 * Vue de confirmation de commande réussie avec détails et instructions de livraison.
 */
export const CheckoutSuccessView = ({ order, onClose }) => {
  if (!order) return null;

  return (
    <div className="order-success-view animate-fade-in">
      <div className="success-icon-wrap animate-scale-up">
        <i className="fa-solid fa-circle-check"></i>
      </div>
      <h2>Commande Confirmée avec Succès !</h2>
      <div className="order-ref-pill">
        <span>RÉFÉRENCE :</span>
        <strong>{order.orderNumber}</strong>
      </div>

      <p className="order-notice">
        {order.customerEmail ? (
          <>
            <i className="fa-solid fa-envelope-circle-check text-success"></i> Un email de confirmation détaillé vous a été envoyé via Brevo à <strong>{order.customerEmail}</strong>.
          </>
        ) : (
          <>Notre service de livraison vous contactera au <strong>{order.customerPhone}</strong>.</>
        )}
      </p>

      <div className="order-summary-box">
        <div className="summary-line">
          <span>Montant à préparer (Espèces) :</span>
          <strong className="summary-total-price">{formatPrice(order.total)}</strong>
        </div>
        <div className="summary-line">
          <span>Mode de règlement :</span>
          <strong className="text-uppercase text-warning">Paiement Cash à la livraison</strong>
        </div>
        <div className="summary-line">
          <span>Destinataire :</span>
          <strong>{order.customerName} ({order.customerPhone})</strong>
        </div>
        <div className="summary-line">
          <span>Lieu de livraison :</span>
          <strong>{order.deliveryAddress}, {order.city}</strong>
        </div>
      </div>

      <div className="order-cash-reminder">
        <i className="fa-solid fa-hand-holding-dollar"></i>
        <span>
          Veuillez s&apos;il vous plaît prévoir l&apos;appoint de <strong>{formatPrice(order.total)}</strong> en espèces lors du passage du livreur.
        </span>
      </div>

      <button type="button" className="btn btn-primary btn-block" onClick={onClose}>
        <i className="fa-solid fa-bag-shopping"></i> Continuer mes achats
      </button>
    </div>
  );
};

export default CheckoutSuccessView;
