import React from 'react';

/**
 * Composant de protection (Auth Gate) pour l'espace de suivi de commandes.
 * Garantit la confidentialité des données des clients non connectés.
 */
export const OrdersAuthGate = ({ onBackToShop, onOpenAuth }) => {
  return (
    <div className="container user-orders-page-root animate-fade-in">
      <div className="orders-top-breadcrumb-bar">
        <button type="button" className="btn-back-shop" onClick={onBackToShop}>
          <i className="fa-solid fa-arrow-left"></i>
          <span>Retour à la Boutique</span>
        </button>
      </div>

      <div
        className="orders-auth-required-card"
        style={{
          maxWidth: '520px',
          margin: '3rem auto',
          textAlign: 'center',
          padding: '3rem 2rem',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-md)',
        }}
      >
        <div
          style={{
            width: '72px',
            height: '72px',
            margin: '0 auto 1.5rem',
            background: 'var(--primary-soft)',
            borderRadius: 'var(--radius-full)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--primary)',
            fontSize: '2rem',
          }}
        >
          <i className="fa-solid fa-lock"></i>
        </div>

        <h2
          style={{
            fontSize: '1.5rem',
            fontWeight: 700,
            marginBottom: '0.75rem',
            color: 'var(--text-primary)',
          }}
        >
          Espace Suivi de Commandes Protégé
        </h2>

        <p
          style={{
            color: 'var(--text-secondary)',
            fontSize: '0.92rem',
            lineHeight: '1.6',
            marginBottom: '2rem',
          }}
        >
          Pour des raisons de confidentialité et de sécurité, vous devez être connecté(e) à votre compte client pour consulter l&apos;historique et suivre l&apos;acheminement de vos commandes en direct.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          <button
            type="button"
            className="btn btn-primary btn-lg"
            onClick={onOpenAuth}
            style={{ width: '100%', padding: '0.85rem 1.5rem', fontSize: '1rem' }}
          >
            <i className="fa-solid fa-arrow-right-to-bracket"></i>
            <span>Se connecter à mon compte</span>
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onBackToShop}
            style={{ width: '100%', padding: '0.75rem 1.5rem' }}
          >
            <i className="fa-solid fa-arrow-left"></i>
            <span>Continuer mes achats</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrdersAuthGate;
