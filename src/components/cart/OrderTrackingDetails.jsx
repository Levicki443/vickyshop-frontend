import React, { useState } from 'react';
import { formatPrice } from '../../services/api';
import { ReviewModal } from '../reviews/ReviewModal';
import { OrderTimelineStepper } from '../orders/OrderTimelineStepper';
import { OrderStatusHistoryLog } from '../orders/OrderStatusHistoryLog';

const ITEM_STATUS_LABELS = {
  en_attente: { label: 'Reçu', cls: 'badge-item-pending' },
  confirmee: { label: 'Confirmé', cls: 'badge-item-confirmed' },
  en_preparation: { label: 'En préparation', cls: 'badge-item-preparing' },
  expediee: { label: 'Expédié', cls: 'badge-item-shipped' },
  en_livraison: { label: 'En livraison', cls: 'badge-item-delivery' },
  livree: { label: 'Livré', cls: 'badge-item-delivered' },
  annulee: { label: 'Annulé', cls: 'badge-item-cancelled' },
  refusee: { label: 'Refusé', cls: 'badge-item-cancelled' },
};

export const OrderTrackingDetails = ({ order }) => {
  if (!order) return null;

  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  const getWhatsAppLink = (ord) => {
    const text = encodeURIComponent(
      `Bonjour Vicky-Shop ! Je souhaite suivre ma commande #${ord.orderNumber} (Montant : ${formatPrice(ord.total)}).`
    );
    return `https://wa.me/2250554726574?text=${text}`;
  };

  return (
    <div className="order-tracking-card-root">
      {/* 1. Entête de fiche de suivi */}
      <div className="order-details-header">
        <div className="order-ref-box">
          <span className="order-ref-label">Numéro de Commande</span>
          <h4 className="order-ref-number">#{order.orderNumber}</h4>
        </div>
        <div className="order-date-box">
          <span className="order-date-label">Date d&apos;Achat</span>
          <strong className="order-date-value">
            {order.createdAt
              ? new Date(order.createdAt).toLocaleDateString('fr-FR', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : 'Récemment'}
          </strong>
        </div>
      </div>

      {/* 2. Timeline de progression (6 Étapes) */}
      <OrderTimelineStepper
        orderStatus={order.orderStatus}
        statusHistory={order.statusHistory}
        createdAt={order.createdAt}
      />

      {/* 3. Liste des Articles avec ventilation Multi-Vendeurs */}
      <div className="order-items-breakdown-section">
        <div className="section-title-row">
          <h5>
            <i className="fa-solid fa-bag-shopping"></i> Articles de votre commande ({order.items?.length || 0})
          </h5>
          <span className="vendors-count-pill">
            <i className="fa-solid fa-store"></i> Marketplace Vicky-Shop
          </span>
        </div>

        <div className="tracking-items-list">
          {order.items?.map((item, idx) => {
            const itemSt = ITEM_STATUS_LABELS[item.status] || ITEM_STATUS_LABELS.en_attente;
            return (
              <div key={idx} className="tracking-item-row">
                <div className="item-thumb-details">
                  {item.image ? (
                    <img src={item.image} alt={item.title} className="item-mini-img" />
                  ) : (
                    <div className="item-placeholder-img">
                      <i className="fa-solid fa-shirt"></i>
                    </div>
                  )}
                  <div>
                    <strong className="item-name">{item.title}</strong>
                    <div className="item-specs">
                      <span>Qté : <strong>{item.quantity}</strong></span>
                      {item.size && <span>• Taille : <strong>{item.size}</strong></span>}
                      {item.color && <span>• Couleur : <strong>{item.color}</strong></span>}
                      {item.sellerName && (
                        <span className="item-seller-tag">
                          • Vendeur : <strong>{item.sellerName}</strong>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="item-status-price-wrap">
                  <span className={`badge-item-status ${itemSt.cls}`}>
                    {itemSt.label}
                  </span>
                  <strong className="item-total-price">
                    {formatPrice(item.price * item.quantity)}
                  </strong>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Coordonnées & Facturation */}
      <div className="order-info-summary-grid">
        <div className="info-summary-card">
          <h6 className="summary-card-title">
            <i className="fa-solid fa-location-dot"></i> Destinataire &amp; Livraison
          </h6>
          <div className="summary-details-list">
            <div><strong>Client :</strong> {order.customerName}</div>
            <div>
              <strong>Téléphone :</strong>{' '}
              <a href={`tel:${order.customerPhone}`} className="tel-link">
                {order.customerPhone}
              </a>
            </div>
            <div><strong>Adresse :</strong> {order.deliveryAddress}, {order.city || 'Abidjan'}</div>
            {order.deliveryNotes && (
              <div className="delivery-notes">
                <strong>Instructions :</strong> {order.deliveryNotes}
              </div>
            )}
          </div>
        </div>

        <div className="info-summary-card">
          <h6 className="summary-card-title">
            <i className="fa-solid fa-receipt"></i> Règlement &amp; Facturation
          </h6>
          <div className="summary-pricing-list">
            <div className="pricing-row">
              <span>Sous-total articles :</span>
              <strong>{formatPrice(order.subtotal || order.total)}</strong>
            </div>
            {order.discount > 0 && (
              <div className="pricing-row discount-row">
                <span>Remise promotionnelle :</span>
                <strong>-{formatPrice(order.discount)}</strong>
              </div>
            )}
            <div className="pricing-row">
              <span>Frais de livraison :</span>
              <strong>{order.shippingCost === 0 ? 'Offerte' : formatPrice(order.shippingCost)}</strong>
            </div>
            <div className="pricing-row total-highlight-row">
              <span>Total à régler :</span>
              <strong className="grand-total">{formatPrice(order.total)}</strong>
            </div>
            <div className="payment-mode-pill">
              <i className="fa-solid fa-hand-holding-dollar"></i>
              <span>Paiement prévu en espèces à la livraison</span>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Historique de Traçabilité Immuable */}
      <OrderStatusHistoryLog
        statusHistory={order.statusHistory}
        orderNumber={order.orderNumber}
      />

      {/* 6. Boutons d'Action & Réassurance */}
      <div className="order-tracking-actions-bar">
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => setIsReviewModalOpen(true)}
        >
          <i className="fa-solid fa-star"></i> Donner mon avis vérifié
        </button>

        <a
          href={getWhatsAppLink(order)}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-whatsapp"
        >
          <i className="fa-brands fa-whatsapp"></i> Assistance WhatsApp
        </a>

        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => window.print()}
        >
          <i className="fa-solid fa-print"></i> Imprimer le reçu
        </button>
      </div>

      <ReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        initialOrderNumber={order.orderNumber}
        initialProduct={
          order.items?.[0]
            ? {
                _id: order.items[0].productId,
                title: order.items[0].title,
                image: order.items[0].image,
              }
            : null
        }
      />
    </div>
  );
};

export default OrderTrackingDetails;
