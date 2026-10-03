import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { fetchSellerStats, fetchSellerProducts, fetchSellerOrders } from '../../services/sellerApi';
import {
  joinSellerRoom,
  onSellerNewOrder,
  onOrderUpdated,
  onProductUpdated,
  onProductDeleted,
  onProductStockUpdated,
} from '../../services/socket';
import { formatPrice } from '../../services/api';
import { SellerSidebar } from './SellerSidebar';
import { SellerStatsCards } from './SellerStatsCards';
import { SellerProductList } from './SellerProductList';
import { SellerProductModal } from './SellerProductModal';
import { SellerOrdersList } from './SellerOrdersList';
import { SellerNotifications } from './SellerNotifications';
import { SellerProfile } from './SellerProfile';
import { SellerSettings } from './SellerSettings';
import logoImg from '../../assets/logo.png';

export const SellerDashboard = ({ onClose, initialTab = 'dashboard' }) => {
  const { user, token, logout } = useAuth();
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState(initialTab);
  const [stats, setStats] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState(null);

  const loadSellerData = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [statsData, productsData, ordersData] = await Promise.all([
        fetchSellerStats(token).catch(() => null),
        fetchSellerProducts(token).catch(() => []),
        fetchSellerOrders(token).catch(() => []),
      ]);

      setStats(statsData);
      setProducts(productsData);
      setOrders(ordersData);
    } catch (err) {
      console.warn('Erreur chargement données vendeur :', err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadSellerData();
  }, [loadSellerData]);

  // Synchronisation temps réel Socket.IO pour le Vendeur
  useEffect(() => {
    if (!user) return;
    const sellerId = user.id || user._id;
    joinSellerRoom(sellerId);

    // Réception en direct d'une nouvelle commande contenant des articles du vendeur
    const unsubNewOrder = onSellerNewOrder((orderData) => {
      addToast(
        '🔔 Nouvelle Commande Reçue !',
        `Commande #${orderData.orderNumber} passée par ${orderData.customerName} (${formatPrice(orderData.total)}).`,
        'success'
      );

      // Ajout immédiat en tête de liste des commandes
      setOrders((prev) => {
        const exists = prev.some((o) => (o._id === orderData.orderId || o.orderNumber === orderData.orderNumber));
        if (exists) return prev;
        const newEntry = {
          _id: orderData.orderId,
          orderNumber: orderData.orderNumber,
          customerName: orderData.customerName,
          customerPhone: orderData.customerPhone,
          deliveryAddress: orderData.deliveryAddress,
          city: orderData.city,
          items: orderData.items || [],
          sellerTotal: orderData.total,
          amountToCollect: orderData.amountToCollect || orderData.total,
          orderStatus: 'en_attente',
          paymentStatus: 'en_attente',
          createdAt: orderData.createdAt || new Date().toISOString(),
          statusHistory: [],
        };
        return [newEntry, ...prev];
      });

      // Mise à jour des compteurs statistiques
      setStats((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          totalOrders: (prev.totalOrders || 0) + 1,
          newOrdersCount: (prev.newOrdersCount || 0) + 1,
          unreadNotificationsCount: (prev.unreadNotificationsCount || 0) + 1,
          potentialRevenue: (prev.potentialRevenue || 0) + (orderData.total || 0),
        };
      });
    });

    // Mise à jour de statut de commande en direct
    const unsubOrderUpdated = onOrderUpdated((updatedOrder) => {
      setOrders((prev) =>
        prev.map((ord) =>
          ord._id === updatedOrder._id || ord.orderNumber === updatedOrder.orderNumber
            ? { ...ord, ...updatedOrder }
            : ord
        )
      );
    });

    // Mises à jour des produits en direct
    const unsubProductUpdated = onProductUpdated((prod) => {
      setProducts((prev) => prev.map((p) => ((p._id || p.id) === (prod._id || prod.id) ? prod : p)));
    });

    const unsubProductDeleted = onProductDeleted((prodId) => {
      setProducts((prev) => prev.filter((p) => (p._id || p.id) !== prodId));
    });

    const unsubProductStock = onProductStockUpdated(({ productId, stockQuantity, inStock }) => {
      setProducts((prev) =>
        prev.map((p) =>
          (p._id || p.id) === productId
            ? { ...p, stockQuantity, inStock: inStock ?? stockQuantity > 0 }
            : p
        )
      );
    });

    return () => {
      unsubNewOrder();
      unsubOrderUpdated();
      unsubProductUpdated();
      unsubProductDeleted();
      unsubProductStock();
    };
  }, [user, addToast]);

  const handleOpenCreate = () => {
    setProductToEdit(null);
    setIsProductModalOpen(true);
  };

  const handleOpenEdit = (prod) => {
    setProductToEdit(prod);
    setIsProductModalOpen(true);
  };

  const handleSelectTab = (tabId) => {
    if (tabId === 'add_product') {
      handleOpenCreate();
      return;
    }

    // Réinitialisation instantanée des badges consultés
    if (tabId === 'notifications') {
      setStats((prev) => (prev ? { ...prev, unreadNotificationsCount: 0 } : prev));
    }
    if (tabId === 'orders') {
      setStats((prev) => (prev ? { ...prev, newOrdersCount: 0 } : prev));
    }

    setActiveTab(tabId);
    if (window.history.pushState) {
      window.history.pushState(null, '', `/vendeur/${tabId}`);
      window.dispatchEvent(new Event('app-navigate'));
    }
  };

  return (
    <div className="seller-dashboard-root animate-fade-in">
      <header className="seller-navbar">
        <div className="seller-navbar-left">
          <button type="button" className="btn-back-shop" onClick={onClose}>
            <i className="fa-solid fa-arrow-left"></i>
            <span>Retour à la Boutique</span>
          </button>
          <div className="seller-brand-tag">
            <img src={logoImg} alt="Vicky-Shop" className="seller-logo-img" />
            <span>Espace <strong className="text-primary">Vendeur Pro</strong></span>
          </div>
        </div>

        <div className="seller-navbar-right">
          <button
            type="button"
            className={`seller-nav-notif-btn ${stats?.unreadNotificationsCount > 0 ? 'has-unread' : ''}`}
            onClick={() => handleSelectTab('notifications')}
            title="Notifications"
          >
            <i className="fa-solid fa-bell"></i>
            {stats?.unreadNotificationsCount > 0 && (
              <span className="notif-badge-pill">{stats.unreadNotificationsCount}</span>
            )}
          </button>

          <div className="seller-user-badge">
            <div className="seller-avatar"><i className="fa-solid fa-store"></i></div>
            <div className="seller-info-text">
              <span className="seller-shop-name">{user?.shopName || user?.name}</span>
              <span className="seller-role-tag">Vendeur Partenaire</span>
            </div>
          </div>

          <button type="button" className="btn-seller-logout" onClick={logout} title="Déconnexion">
            <i className="fa-solid fa-right-from-bracket"></i>
          </button>
        </div>
      </header>

      <div className="seller-dashboard-container">
        <SellerSidebar
          activeTab={activeTab}
          onSelectTab={handleSelectTab}
          unreadCount={stats?.unreadNotificationsCount || 0}
          newOrdersCount={stats?.newOrdersCount || 0}
          onClose={onClose}
        />

        <main className="seller-dashboard-main-view">
          {activeTab === 'dashboard' && (
            <div className="seller-overview-view">
              <div className="seller-welcome-banner">
                <div className="banner-text">
                  <h2>Bienvenue sur votre Espace de Gestion, {user?.name} !</h2>
                  <p>Suivez vos ventes en temps réel, gérez vos stocks et traitez les commandes avec encaissement à la livraison.</p>
                </div>
                <button type="button" className="btn btn-primary" onClick={handleOpenCreate}>
                  <i className="fa-solid fa-circle-plus"></i>
                  <span>Ajouter un Article</span>
                </button>
              </div>

              <SellerStatsCards
                stats={stats}
                loading={loading}
                onGoToOrders={() => handleSelectTab('orders')}
                onGoToProducts={() => handleSelectTab('products')}
              />
            </div>
          )}

          {activeTab === 'products' && (
            <SellerProductList
              products={products}
              loading={loading}
              onRefresh={loadSellerData}
              onEditProduct={handleOpenEdit}
              onOpenCreate={handleOpenCreate}
            />
          )}

          {activeTab === 'orders' && (
            <SellerOrdersList
              orders={orders}
              loading={loading}
              onRefresh={loadSellerData}
            />
          )}

          {activeTab === 'notifications' && (
            <SellerNotifications onRefreshCounts={loadSellerData} />
          )}

          {activeTab === 'profile' && <SellerProfile />}

          {activeTab === 'settings' && <SellerSettings />}
        </main>
      </div>

      <SellerProductModal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        productToEdit={productToEdit}
        onSaved={loadSellerData}
      />
    </div>
  );
};
