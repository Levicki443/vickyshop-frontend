import React from 'react';
import { formatPrice } from '../../services/api';

export const SellerStatsCards = ({ stats, loading, onGoToOrders, onGoToProducts }) => {
  if (loading) {
    return (
      <div className="seller-stats-grid">
        {[1, 2, 3, 4, 5, 6].map((n) => (
          <div key={n} className="seller-stat-card skeleton-loading">
            <div className="skeleton-line" style={{ width: '40%', height: '14px', marginBottom: '8px' }} />
            <div className="skeleton-line" style={{ width: '70%', height: '24px' }} />
          </div>
        ))}
      </div>
    );
  }

  const s = stats || {
    totalProducts: 0,
    activeProducts: 0,
    outOfStockProducts: 0,
    totalOrdersCount: 0,
    newOrdersCount: 0,
    inProgressOrdersCount: 0,
    deliveredOrdersCount: 0,
    cancelledOrdersCount: 0,
    amountToCollect: 0,
    amountCollected: 0,
    totalSales: 0,
    unreadNotificationsCount: 0,
    recentOrders: [],
    recentProducts: [],
  };

  return (
    <div className="seller-stats-section">
      <div className="seller-stats-grid">
        {/* 1. Total Produits */}
        <div className="seller-stat-card" onClick={onGoToProducts} style={{ cursor: 'pointer' }}>
          <div className="stat-card-icon bg-primary-soft">
            <i className="fa-solid fa-shirt"></i>
          </div>
          <div className="stat-card-body">
            <span className="stat-label">Catalogue Produits</span>
            <h3 className="stat-value">{s.totalProducts}</h3>
            <span className="stat-subtext">
              <strong className="text-success">{s.activeProducts} actifs</strong> • {s.outOfStockProducts} en rupture
            </span>
          </div>
        </div>

        {/* 2. Nouvelles Commandes Non Traitées */}
        <div className="seller-stat-card" onClick={onGoToOrders} style={{ cursor: 'pointer' }}>
          <div className="stat-card-icon bg-warning-soft">
            <i className="fa-solid fa-bell"></i>
          </div>
          <div className="stat-card-body">
            <span className="stat-label">Nouvelles Commandes</span>
            <h3 className="stat-value text-primary">{s.newOrdersCount}</h3>
            <span className="stat-subtext">À confirmer et préparer immédiatement</span>
          </div>
        </div>

        {/* 3. Commandes en Préparation / Livraison */}
        <div className="seller-stat-card" onClick={onGoToOrders} style={{ cursor: 'pointer' }}>
          <div className="stat-card-icon bg-gold-soft">
            <i className="fa-solid fa-truck-fast"></i>
          </div>
          <div className="stat-card-body">
            <span className="stat-label">En Cours de Traitement</span>
            <h3 className="stat-value">{s.inProgressOrdersCount}</h3>
            <span className="stat-subtext">Préparation ou expédition active</span>
          </div>
        </div>

        {/* 4. Commandes Validées & Livrées */}
        <div className="seller-stat-card" onClick={onGoToOrders} style={{ cursor: 'pointer' }}>
          <div className="stat-card-icon bg-success-soft">
            <i className="fa-solid fa-circle-check"></i>
          </div>
          <div className="stat-card-body">
            <span className="stat-label">Commandes Livrées</span>
            <h3 className="stat-value text-success">{s.deliveredOrdersCount}</h3>
            <span className="stat-subtext">{s.cancelledOrdersCount} commande{s.cancelledOrdersCount > 1 ? 's' : ''} annulée{s.cancelledOrdersCount > 1 ? 's' : ''}</span>
          </div>
        </div>

        {/* 5. Espèces à Collecter (COD) */}
        <div className="seller-stat-card stat-card-financial">
          <div className="stat-card-icon bg-gold-soft">
            <i className="fa-solid fa-hand-holding-dollar"></i>
          </div>
          <div className="stat-card-body">
            <span className="stat-label">Espèces à Collecter</span>
            <h3 className="stat-value text-accent">{formatPrice(s.amountToCollect)}</h3>
            <span className="stat-subtext">En attente livreur</span>
          </div>
        </div>

        {/* 6. Chiffre d'Affaires Total */}
        <div className="seller-stat-card stat-card-financial">
          <div className="stat-card-icon bg-success-soft">
            <i className="fa-solid fa-sack-dollar"></i>
          </div>
          <div className="stat-card-body">
            <span className="stat-label">Total des Ventes</span>
            <h3 className="stat-value text-success">{formatPrice(s.totalSales || (s.amountCollected + s.amountToCollect))}</h3>
            <span className="stat-subtext">Encaissé : {formatPrice(s.amountCollected)}</span>
          </div>
        </div>
      </div>

      {/* Aperçu des commandes récentes et des derniers articles */}
      <div className="seller-dashboard-previews-grid mt-4">
        <div className="seller-preview-card">
          <div className="preview-card-header">
            <h4><i className="fa-solid fa-receipt"></i> Commandes Récentes</h4>
            <button type="button" className="text-link text-sm" onClick={onGoToOrders}>Voir tout</button>
          </div>
          {s.recentOrders && s.recentOrders.length > 0 ? (
            <div className="preview-list">
              {s.recentOrders.map((ord) => (
                <div key={ord._id} className="preview-item">
                  <div>
                    <strong>#{ord.orderNumber}</strong> • <small>{ord.customerName}</small>
                    <div className="text-xs text-muted">{ord.city} • {formatPrice(ord.total)}</div>
                  </div>
                  <span className={`badge-status-sm ${ord.orderStatus === 'livree' ? 'badge-success' : 'badge-warning'}`}>
                    {ord.orderStatus}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted text-sm p-3">Aucune commande pour l&apos;instant.</p>
          )}
        </div>

        <div className="seller-preview-card">
          <div className="preview-card-header">
            <h4><i className="fa-solid fa-shirt"></i> Derniers Articles Publiés</h4>
            <button type="button" className="text-link text-sm" onClick={onGoToProducts}>Voir tout</button>
          </div>
          {s.recentProducts && s.recentProducts.length > 0 ? (
            <div className="preview-list">
              {s.recentProducts.map((prod) => (
                <div key={prod._id} className="preview-item">
                  <div className="d-flex align-items-center gap-2">
                    <img src={prod.image} alt={prod.title} className="preview-thumb" />
                    <div>
                      <strong>{prod.title}</strong>
                      <div className="text-xs text-muted">{formatPrice(prod.price)} • Stock: {prod.stockQuantity}</div>
                    </div>
                  </div>
                  <span className={`badge-status-sm ${prod.stockQuantity > 0 ? 'badge-success' : 'badge-danger'}`}>
                    {prod.stockQuantity > 0 ? 'En vente' : 'Rupture'}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted text-sm p-3">Aucun produit ajouté.</p>
          )}
        </div>
      </div>
    </div>
  );
};
