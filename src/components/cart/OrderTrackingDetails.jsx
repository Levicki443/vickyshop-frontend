import React, { useState } from 'react';
import { formatPrice } from '../../services/api';
import { ReviewModal } from '../reviews/ReviewModal';

const STATUS_STEPS = [
  { key: 'recue', label: 'Reçue', icon: 'fa-receipt' },
  { key: 'confirmee', label: 'Confirmée', icon: 'fa-check' },
  { key: 'en_preparation', label: 'En préparation', icon: 'fa-box' },
  { key: 'en_livraison', label: 'En livraison', icon: 'fa-truck-fast' },
  { key: 'livree', label: 'Livrée', icon: 'fa-house-circle-check' },
];

export const OrderTrackingDetails = ({ order }) => {
  if (!order) return null;

  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  const getStepIndex = (status) => {
    const map = {
      recue: 0,
      en_attente: 0,
      confirmee: 1,
      en_preparation: 2,
      en_livraison: 3,
      livree: 4,
    };
    return map[status] !== undefined ? map[status] : 0;
  };

  const currentStepIdx = getStepIndex(order.orderStatus);

  const getWhatsAppLink = (ord) => {
    const text = encodeURIComponent(
      `Bonjour Vicky-Shop ! Je souhaite suivre ma commande #${ord.orderNumber} (Montant : ${formatPrice(ord.total)}).`
    );
    return `https://wa.me/2250554726574?text=${text}`;
  };

  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1.25rem' }}>
      {/* Entête de fiche */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.6rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.85rem', marginBottom: '1.25rem' }}>
        <div>
          <span style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 700 }}>
            Numéro de Commande
          </span>
          <h4 style={{ margin: '0.15rem 0 0', color: 'var(--primary)', fontSize: '1.15rem', fontWeight: 800 }}>
            #{order.orderNumber}
          </h4>
        </div>
        <div style={{ textAlign: 'right' }}>
          <span style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 700 }}>
            Date d&apos;Achat
          </span>
          <div style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--text-primary)' }}>
            {order.createdAt ? new Date(order.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Récemment'}
          </div>
        </div>
      </div>

      {/* Frise chronologique (Timeline) */}
      <div style={{ margin: '1.5rem 0 1.75rem', position: 'relative' }}>
        <div style={{ position: 'absolute', top: '18px', left: '8%', right: '8%', height: '3px', background: 'var(--border-color)', zIndex: 0 }}></div>
        <div
          style={{
            position: 'absolute',
            top: '18px',
            left: '8%',
            width: `${(currentStepIdx / (STATUS_STEPS.length - 1)) * 84}%`,
            height: '3px',
            background: 'var(--primary)',
            zIndex: 0,
            transition: 'width 0.4s ease',
          }}
        ></div>
        <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', zIndex: 1 }}>
          {STATUS_STEPS.map((step, idx) => {
            const isDone = idx <= currentStepIdx;
            const isCurrent = idx === currentStepIdx;
            return (
              <div key={step.key} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, textAlign: 'center' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    background: isDone ? 'var(--primary)' : 'var(--bg-surface)',
                    border: `2px solid ${isDone ? 'var(--primary)' : 'var(--border-color)'}`,
                    color: isDone ? '#ffffff' : 'var(--text-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.85rem',
                    boxShadow: isCurrent ? '0 0 12px var(--primary-glow)' : 'none',
                    transition: 'all 0.3s ease',
                  }}
                >
                  <i className={`fa-solid ${step.icon}`}></i>
                </div>
                <span style={{ fontSize: '0.74rem', marginTop: '0.45rem', fontWeight: isCurrent ? 800 : 500, color: isDone ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Articles commandés */}
      <div style={{ marginBottom: '1.25rem' }}>
        <h5 style={{ margin: '0 0 0.6rem', fontSize: '0.92rem', color: 'var(--text-primary)' }}>
          <i className="fa-solid fa-bag-shopping" style={{ color: 'var(--primary)', marginRight: '0.4rem' }}></i>
          Articles commandés ({order.items?.length || 0})
        </h5>
        <div style={{ maxHeight: '170px', overflowY: 'auto', background: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', padding: '0.5rem' }}>
          {order.items?.map((item, idx) => (
            <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.45rem 0.5rem', borderBottom: idx < order.items.length - 1 ? '1px solid var(--border-color)' : 'none', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                {item.image && (
                  <img src={item.image} alt={item.title} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: 'var(--radius-sm)' }} />
                )}
                <div>
                  <strong style={{ color: 'var(--text-primary)' }}>{item.title}</strong>
                  <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
                    Qté : {item.quantity} {item.size ? `• Taille : ${item.size}` : ''} {item.color ? `• Couleur : ${item.color}` : ''}
                  </div>
                </div>
              </div>
              <strong style={{ color: 'var(--primary)' }}>{formatPrice(item.price * item.quantity)}</strong>
            </div>
          ))}
        </div>
      </div>

      {/* Détails de Livraison & Facturation */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', background: 'var(--bg-surface)', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', fontSize: '0.85rem' }}>
        <div>
          <h6 style={{ margin: '0 0 0.5rem', color: 'var(--text-secondary)', fontSize: '0.78rem', textTransform: 'uppercase', fontWeight: 700 }}>
            Adresse &amp; Destinataire
          </h6>
          <div style={{ color: 'var(--text-primary)', lineHeight: 1.6 }}>
            <div><strong>Nom :</strong> {order.customerName}</div>
            <div><strong>Téléphone :</strong> {order.customerPhone}</div>
            <div><strong>Adresse :</strong> {order.deliveryAddress}, {order.city || 'Abidjan'}</div>
          </div>
        </div>
        <div>
          <h6 style={{ margin: '0 0 0.5rem', color: 'var(--text-secondary)', fontSize: '0.78rem', textTransform: 'uppercase', fontWeight: 700 }}>
            Détails de Règlement
          </h6>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', color: 'var(--text-primary)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Sous-total :</span> <span>{formatPrice(order.subtotal || order.total)}</span>
            </div>
            {order.discount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--accent-red)' }}>
                <span>Réduction :</span> <span>-{formatPrice(order.discount)}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Livraison :</span> <span>{order.shippingCost === 0 ? 'Gratuite' : formatPrice(order.shippingCost)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, marginTop: '0.35rem', borderTop: '1px solid var(--border-color)', paddingTop: '0.35rem', color: 'var(--primary)', fontSize: '0.95rem' }}>
              <span>Total Net :</span> <span>{formatPrice(order.total)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Boutons d'action */}
      <div style={{ display: 'flex', gap: '0.6rem', marginTop: '1.2rem', flexWrap: 'wrap' }}>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => setIsReviewModalOpen(true)}
          style={{ flex: 1, minWidth: '190px' }}
        >
          <i className="fa-solid fa-star"></i> Donner mon avis vérifié
        </button>
        <a
          href={getWhatsAppLink(order)}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-outline"
          style={{ flex: 1, minWidth: '160px', color: '#25D366', borderColor: '#25D366', textDecoration: 'none' }}
        >
          <i className="fa-brands fa-whatsapp"></i> Aide WhatsApp
        </a>
        <button
          type="button"
          className="btn btn-outline"
          onClick={() => window.print()}
          style={{ flex: 1, minWidth: '150px' }}
        >
          <i className="fa-solid fa-print"></i> Imprimer
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
