import React, { useState, useEffect, useCallback } from 'react';
import {
  fetchDashboardKPIs,
  fetchAdminOrders,
  fetchAdminProducts,
  deleteProductApi,
  toggleProductStockApi,
  fetchAdminUsers,
  fetchAdminSettings,
  updateAdminSettingsApi,
  removeAdminToken,
  getAdminUser,
} from '../../services/adminApi';
import { AdminOrderDetailsModal } from './AdminOrderDetailsModal';
import { AdminProductModal } from './AdminProductModal';
import {
  joinAdminRoom,
  onNewOrder,
  onOrderUpdated,
  onProductCreated,
  onProductUpdated,
  onProductDeleted,
  onProductStockUpdated,
} from '../../services/socket';
import {
  playNotificationChime,
  requestNotificationPermission,
  showOrderNotification,
  flashTabTitle,
} from '../../services/notificationService';
import logoImg from '../../assets/logo.png';

/**
 * Composant Racine du Backoffice Administrateur de Vicky-Shop.
 * Contient les 5 onglets operationnels majeurs :
 * 1. Tableau de bord (KPIs & Finances)
 * 2. Gestion des Commandes
 * 3. Produits & Stocks
 * 4. Base Clients
 * 5. Parametres de la Boutique
 */
export const AdminDashboard = ({ onExitToShop, onClose, onLogout, onProductsUpdated }) => {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'orders', 'products', 'users', 'settings'
  const [adminUser] = useState(() => getAdminUser());

  // Etats des donnees
  const [kpis, setKpis] = useState(null);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [settings, setSettings] = useState({
    shopName: 'Vicky-Shop',
    currency: 'FCFA',
    freeShippingThreshold: 50000,
    defaultShippingCost: 2000,
    announcementText: '',
    isAnnouncementActive: true,
    activePromoCode: 'VICKY10',
    promoDiscountPercent: 10,
    whatsappNumber: '2250700000000',
    isShopOpen: true,
    contactEmail: 'contact@vickyshop.ci',
  });

  const [loading, setLoading] = useState(true);
  const [actionFeedback, setActionFeedback] = useState(null);

  // Filtres
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');
  const [orderPaymentFilter, setOrderPaymentFilter] = useState('all');
  const [orderSearch, setOrderSearch] = useState('');

  const [productCategoryFilter, setProductCategoryFilter] = useState('all');
  const [productStockFilter, setProductStockFilter] = useState('all');
  const [productSearch, setProductSearch] = useState('');

  const [userSearch, setUserSearch] = useState('');

  // Modales
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [settingsSaving, setSettingsSaving] = useState(false);

  // Chargement des KPIs
  const loadKPIs = useCallback(async () => {
    try {
      const data = await fetchDashboardKPIs();
      setKpis(data);
    } catch (err) {
      console.error('Erreur chargement KPIs:', err);
    }
  }, []);

  // Chargement des Commandes
  const loadOrders = useCallback(async () => {
    try {
      const data = await fetchAdminOrders({
        status: orderStatusFilter,
        paymentMethod: orderPaymentFilter,
        search: orderSearch,
      });
      setOrders(data.orders || []);
    } catch (err) {
      console.error('Erreur chargement commandes:', err);
    }
  }, [orderStatusFilter, orderPaymentFilter, orderSearch]);

  // Chargement des Produits
  const loadProducts = useCallback(async () => {
    try {
      const data = await fetchAdminProducts({
        category: productCategoryFilter,
        stockStatus: productStockFilter,
        search: productSearch,
      });
      setProducts(data || []);
    } catch (err) {
      console.error('Erreur chargement produits:', err);
    }
  }, [productCategoryFilter, productStockFilter, productSearch]);

  // Chargement des Utilisateurs
  const loadUsers = useCallback(async () => {
    try {
      const data = await fetchAdminUsers({
        search: userSearch,
      });
      setUsers(data || []);
    } catch (err) {
      console.error('Erreur chargement utilisateurs:', err);
    }
  }, [userSearch]);

  // Chargement des Parametres
  const loadSettings = useCallback(async () => {
    try {
      const data = await fetchAdminSettings();
      if (data) setSettings(data);
    } catch (err) {
      console.error('Erreur chargement parametres:', err);
    }
  }, []);

  // Chargement initial
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([loadKPIs(), loadOrders(), loadProducts(), loadUsers(), loadSettings()]);
      setLoading(false);
    };
    init();
  }, [loadKPIs, loadOrders, loadProducts, loadUsers, loadSettings]);

  // Rafraichissement specifique selon l'onglet actif
  useEffect(() => {
    if (activeTab === 'overview') loadKPIs();
    if (activeTab === 'orders') loadOrders();
    if (activeTab === 'products') loadProducts();
    if (activeTab === 'users') loadUsers();
    if (activeTab === 'settings') loadSettings();
  }, [activeTab, loadKPIs, loadOrders, loadProducts, loadUsers, loadSettings]);

  // États notifications temps réel
  const [notifPermission, setNotifPermission] = useState(() =>
    typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'default'
  );
  const [liveOrderToast, setLiveOrderToast] = useState(null);

  // Écoute des événements temps réel Socket.IO (Commandes & Produits)
  useEffect(() => {
    joinAdminRoom();

    const unsubNewOrder = onNewOrder((newOrder) => {
      playNotificationChime();
      showOrderNotification(newOrder, (ord) => {
        setSelectedOrder(ord);
        setActiveTab('orders');
      });
      flashTabTitle(`🔔 COMMANDE #${newOrder.orderNumber}`);
      setLiveOrderToast(newOrder);

      setOrders((prev) => {
        const exists = prev.some((o) => o._id === newOrder._id || o.orderNumber === newOrder.orderNumber);
        if (exists) return prev;
        return [newOrder, ...prev];
      });

      setKpis((prev) => {
        if (!prev) return prev;
        const currentKpis = prev.kpis || prev;
        return {
          ...prev,
          kpis: {
            ...currentKpis,
            totalOrders: (currentKpis.totalOrders || 0) + 1,
            pendingOrders: (currentKpis.pendingOrders || 0) + 1,
            todayOrdersCount: (currentKpis.todayOrdersCount || 0) + 1,
            todayRevenue: (currentKpis.todayRevenue || 0) + (newOrder.total || 0),
            totalRevenue: (currentKpis.totalRevenue || 0) + (newOrder.total || 0),
          },
        };
      });
    });

    const unsubUpdateOrder = onOrderUpdated((updatedOrder) => {
      setOrders((prev) =>
        prev.map((o) =>
          o._id === updatedOrder._id || o.orderNumber === updatedOrder.orderNumber ? updatedOrder : o
        )
      );
      loadKPIs();
    });

    const unsubProductCreated = onProductCreated((newProd) => {
      setProducts((prev) => {
        const exists = prev.some((p) => p._id === newProd._id);
        if (exists) return prev.map((p) => (p._id === newProd._id ? newProd : p));
        return [newProd, ...prev];
      });
      loadKPIs();
    });

    const unsubProductUpdated = onProductUpdated((updatedProd) => {
      setProducts((prev) =>
        prev.map((p) => (p._id === updatedProd._id ? updatedProd : p))
      );
      loadKPIs();
    });

    const unsubProductDeleted = onProductDeleted((deletedId) => {
      setProducts((prev) => prev.filter((p) => p._id !== deletedId));
      loadKPIs();
    });

    const unsubProductStock = onProductStockUpdated(({ productId, stockQuantity, inStock }) => {
      setProducts((prev) =>
        prev.map((p) =>
          p._id === productId
            ? { ...p, stockQuantity, inStock: inStock !== undefined ? inStock : stockQuantity > 0 }
            : p
        )
      );
      loadKPIs();
    });

    return () => {
      unsubNewOrder();
      unsubUpdateOrder();
      unsubProductCreated();
      unsubProductUpdated();
      unsubProductDeleted();
      unsubProductStock();
    };
  }, [loadKPIs]);

  const handleEnableNotifications = async () => {
    const granted = await requestNotificationPermission();
    setNotifPermission(granted ? 'granted' : 'denied');
    if (granted) {
      showNotification('Notifications système activées ! Vous recevrez des alertes à chaque nouvelle commande.');
    } else {
      showNotification('Notifications refusées dans votre navigateur.', 'warning');
    }
  };

  const handleExitShop = () => {
    if (typeof onExitToShop === 'function') {
      onExitToShop();
    } else if (typeof onClose === 'function') {
      onClose();
    }
  };

  const handleLogout = () => {
    removeAdminToken();
    if (typeof onLogout === 'function') {
      onLogout();
    } else {
      handleExitShop();
    }
  };

  const showNotification = (message, type = 'success') => {
    setActionFeedback({ message, type });
    setTimeout(() => {
      setActionFeedback(null);
    }, 4000);
  };

  const handleDeleteProduct = async (productId, productTitle) => {
    if (window.confirm(`Confirmez-vous la suppression du produit "${productTitle}" ?`)) {
      try {
        await deleteProductApi(productId);
        showNotification(`Le produit "${productTitle}" a ete supprime.`);
        loadProducts();
        loadKPIs();
      } catch (err) {
        showNotification(err.message || 'Erreur lors de la suppression.', 'danger');
      }
    }
  };

  const handleToggleStock = async (productId, currentTitle) => {
    try {
      const updated = await toggleProductStockApi(productId);
      showNotification(`Disponibilite du produit "${currentTitle}" mise a jour.`);
      loadProducts();
      loadKPIs();
    } catch (err) {
      showNotification(err.message || 'Erreur lors du changement de stock.', 'danger');
    }
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSettingsSaving(true);
    try {
      const updated = await updateAdminSettingsApi(settings);
      setSettings(updated);
      showNotification('Parametres de la boutique enregistres avec succes.');
    } catch (err) {
      showNotification(err.message || 'Erreur lors de l\'enregistrement des parametres.', 'danger');
    } finally {
      setSettingsSaving(false);
    }
  };

  const formatPrice = (amount) => {
    if (typeof amount !== 'number') return '0 FCFA';
    return `${amount.toLocaleString('fr-FR')} FCFA`;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'recue':
        return <span className="admin-status-badge admin-badge-info">Recue</span>;
      case 'en_preparation':
        return <span className="admin-status-badge admin-badge-warning">En preparation</span>;
      case 'en_livraison':
        return <span className="admin-status-badge admin-badge-primary">En livraison</span>;
      case 'livree':
        return <span className="admin-status-badge admin-badge-success">Livree</span>;
      case 'annulee':
        return <span className="admin-status-badge admin-badge-danger">Annulee</span>;
      default:
        return <span className="admin-status-badge">{status}</span>;
    }
  };

  return (
    <div className="admin-root-layout">
      {/* Barre Superieure d'Administration */}
      <header className="admin-top-navbar">
        <div className="admin-top-brand">
          <img src={logoImg} alt="Vicky-Shop" className="admin-logo-img rounded-logo" style={{ width: '42px', height: '42px', borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(255,107,0,0.5)', boxShadow: '0 0 10px rgba(255,107,0,0.3)' }} />
          <div>
            <div className="admin-brand-name">
              Vicky<span className="admin-brand-accent">-Shop</span> Backoffice
            </div>
            <div className="admin-brand-sub">Espace Administrateur Sécurisé</div>
          </div>
        </div>

        <div className="admin-top-actions">
          {/* Bouton d'activation des notifications de commandes */}
          <button
            type="button"
            className={`admin-btn ${notifPermission === 'granted' ? 'admin-btn-outline' : 'admin-btn-warning'}`}
            onClick={handleEnableNotifications}
            title={notifPermission === 'granted' ? 'Notifications système actives' : 'Cliquez pour activer les alertes de commandes en direct'}
          >
            <i className={`fa-solid ${notifPermission === 'granted' ? 'fa-bell' : 'fa-bell-slash'}`}></i>
            <span>{notifPermission === 'granted' ? 'Alertes Web Actives' : 'Activer Alertes Web'}</span>
          </button>

          <div className="admin-user-pill">
            <i className="fa-solid fa-user-shield"></i>
            <span>{adminUser?.name || 'Administrateur'}</span>
          </div>

          <button
            type="button"
            className="admin-btn admin-btn-outline"
            onClick={handleExitShop}
            title="Revenir à la boutique en ligne"
          >
            <i className="fa-solid fa-store"></i>
            <span>Voir la boutique</span>
          </button>

          <button
            type="button"
            className="admin-btn admin-btn-danger-outline"
            onClick={handleLogout}
            title="Se déconnecter de l'administration"
          >
            <i className="fa-solid fa-power-off"></i>
            <span>Déconnexion</span>
          </button>
        </div>
      </header>

      {/* TOAST FLOTTANT DE NOUVELLE COMMANDE EN TEMPS RÉEL (SOCKET.IO) */}
      {liveOrderToast && (
        <div className="admin-live-order-banner animate-slide-down">
          <div className="live-banner-icon pulse">
            <i className="fa-solid fa-bell"></i>
          </div>
          <div className="live-banner-text">
            <strong>Nouvelle commande reçue ! #{liveOrderToast.orderNumber}</strong>
            <span>
              {liveOrderToast.customerName || liveOrderToast.customer?.name} • Total : <strong>{formatPrice(liveOrderToast.total)}</strong> • {liveOrderToast.deliveryAddress || liveOrderToast.deliveryAddress?.address}, {liveOrderToast.city || 'Abidjan'}
            </span>
          </div>
          <div className="live-banner-actions">
            <button
              type="button"
              className="admin-btn admin-btn-sm admin-btn-primary"
              onClick={() => {
                setSelectedOrder(liveOrderToast);
                setActiveTab('orders');
                setLiveOrderToast(null);
              }}
            >
              <i className="fa-solid fa-eye"></i> Ouvrir les détails
            </button>
            <button
              type="button"
              className="live-banner-close"
              onClick={() => setLiveOrderToast(null)}
              aria-label="Fermer"
            >
              <i className="fa-solid fa-xmark"></i>
            </button>
          </div>
        </div>
      )}

      {/* Banniere d'action feedback */}
      {actionFeedback && (
        <div className={`admin-toast-banner admin-toast-${actionFeedback.type}`}>
          <i className={`fa-solid fa-${actionFeedback.type === 'success' ? 'circle-check' : 'circle-exclamation'}`}></i>
          <span>{actionFeedback.message}</span>
        </div>
      )}

      {/* Corps Principal : Menu Navigation + Contenu de l'onglet */}
      <div className="admin-main-container">
        {/* Barre de navigation laterale / onglets */}
        <aside className="admin-sidebar">
          <nav className="admin-nav-menu">
            <button
              type="button"
              className={`admin-nav-item ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              <i className="fa-solid fa-chart-line"></i>
              <span>Vue d'ensemble & KPIs</span>
            </button>

            <button
              type="button"
              className={`admin-nav-item ${activeTab === 'orders' ? 'active' : ''}`}
              onClick={() => setActiveTab('orders')}
            >
              <i className="fa-solid fa-receipt"></i>
              <span>Commandes</span>
              {kpis?.kpis?.pendingOrders > 0 && (
                <span className="admin-nav-badge">{kpis.kpis.pendingOrders}</span>
              )}
            </button>

            <button
              type="button"
              className={`admin-nav-item ${activeTab === 'products' ? 'active' : ''}`}
              onClick={() => setActiveTab('products')}
            >
              <i className="fa-solid fa-boxes-stacked"></i>
              <span>Produits & Stocks</span>
            </button>

            <button
              type="button"
              className={`admin-nav-item ${activeTab === 'users' ? 'active' : ''}`}
              onClick={() => setActiveTab('users')}
            >
              <i className="fa-solid fa-users"></i>
              <span>Base Clients</span>
            </button>

            <button
              type="button"
              className={`admin-nav-item ${activeTab === 'settings' ? 'active' : ''}`}
              onClick={() => setActiveTab('settings')}
            >
              <i className="fa-solid fa-sliders"></i>
              <span>Parametres Boutique</span>
            </button>
          </nav>
        </aside>

        {/* Zone de Contenu Principal */}
        <main className="admin-content-area">
          {loading ? (
            <div className="admin-loading-state">
              <i className="fa-solid fa-spinner fa-spin admin-loading-spinner"></i>
              <p>Chargement des donnees administratives...</p>
            </div>
          ) : (
            <>
              {/* ONGLET 1 : VUE D'ENSEMBLE & KPIS */}
              {activeTab === 'overview' && (
                <div className="admin-tab-content">
                  <div className="admin-page-header">
                    <div>
                      <h2 className="admin-page-title">Tableau de Bord & Indicateurs</h2>
                      <p className="admin-page-desc">Synthese en direct des ventes, commandes et performances</p>
                    </div>
                    <button
                      type="button"
                      className="admin-btn admin-btn-secondary admin-btn-sm"
                      onClick={() => {
                        loadKPIs();
                        showNotification('Indicateurs actualises.');
                      }}
                    >
                      <i className="fa-solid fa-rotate"></i> Actualiser
                    </button>
                  </div>

                  {/* Cartes KPI Principales */}
                  <div className="admin-kpi-grid">
                    <div className="admin-kpi-card">
                      <div className="admin-kpi-icon admin-kpi-icon-success">
                        <i className="fa-solid fa-wallet"></i>
                      </div>
                      <div className="admin-kpi-data">
                        <span className="admin-kpi-label">Chiffre d'Affaires Global</span>
                        <span className="admin-kpi-value">{formatPrice(kpis?.kpis?.totalRevenue || 0)}</span>
                      </div>
                    </div>

                    <div className="admin-kpi-card">
                      <div className="admin-kpi-icon admin-kpi-icon-primary">
                        <i className="fa-solid fa-calendar-day"></i>
                      </div>
                      <div className="admin-kpi-data">
                        <span className="admin-kpi-label">Ventes du Jour</span>
                        <span className="admin-kpi-value">{formatPrice(kpis?.kpis?.todayRevenue || 0)}</span>
                        <small className="admin-kpi-sub">
                          {kpis?.kpis?.todayOrdersCount || 0} commande(s) aujourd'hui
                        </small>
                      </div>
                    </div>

                    <div className="admin-kpi-card">
                      <div className="admin-kpi-icon admin-kpi-icon-warning">
                        <i className="fa-solid fa-hourglass-half"></i>
                      </div>
                      <div className="admin-kpi-data">
                        <span className="admin-kpi-label">Commandes En Cours</span>
                        <span className="admin-kpi-value">{kpis?.kpis?.pendingOrders || 0}</span>
                        <small className="admin-kpi-sub">A preparer ou livrer</small>
                      </div>
                    </div>

                    <div className="admin-kpi-card">
                      <div className="admin-kpi-icon admin-kpi-icon-info">
                        <i className="fa-solid fa-cart-shopping"></i>
                      </div>
                      <div className="admin-kpi-data">
                        <span className="admin-kpi-label">Panier Moyen</span>
                        <span className="admin-kpi-value">{formatPrice(kpis?.kpis?.averageCart || 0)}</span>
                      </div>
                    </div>

                    <div className="admin-kpi-card">
                      <div className="admin-kpi-icon admin-kpi-icon-danger">
                        <i className="fa-solid fa-triangle-exclamation"></i>
                      </div>
                      <div className="admin-kpi-data">
                        <span className="admin-kpi-label">Ruptures de Stock</span>
                        <span className="admin-kpi-value">{kpis?.kpis?.outOfStockProducts || 0}</span>
                        <small className="admin-kpi-sub">Sur {kpis?.kpis?.totalProducts || 0} articles</small>
                      </div>
                    </div>

                    <div className="admin-kpi-card">
                      <div className="admin-kpi-icon admin-kpi-icon-purple">
                        <i className="fa-solid fa-users"></i>
                      </div>
                      <div className="admin-kpi-data">
                        <span className="admin-kpi-label">Total Clients Inscrits</span>
                        <span className="admin-kpi-value">{kpis?.kpis?.totalCustomers || 0}</span>
                      </div>
                    </div>
                  </div>

                  {/* Section Graphiques & Dernieres Commandes */}
                  <div className="admin-grid-2col" style={{ marginTop: '1.5rem' }}>
                    {/* Repartition des Moyens de Paiement */}
                    <div className="admin-card">
                      <h3 className="admin-card-title">
                        <i className="fa-solid fa-credit-card"></i> Methodes de Paiement Utilisees
                      </h3>
                      <div className="admin-payment-stats-list">
                        {kpis?.paymentMethodsBreakdown?.length > 0 ? (
                          kpis.paymentMethodsBreakdown.map((pm, idx) => (
                            <div key={idx} className="admin-payment-stat-item">
                              <div className="admin-payment-stat-header">
                                <span className="admin-payment-name">{pm._id?.toUpperCase() || 'AUTRE'}</span>
                                <span className="admin-payment-amount">
                                  {formatPrice(pm.totalAmount)} ({pm.count} cmd)
                                </span>
                              </div>
                              <div className="admin-progress-bar-bg">
                                <div
                                  className="admin-progress-bar-fill"
                                  style={{
                                    width: `${Math.min(
                                      100,
                                      Math.round(
                                        (pm.totalAmount / (kpis.kpis.totalRevenue || 1)) * 100
                                      )
                                    )}%`,
                                  }}
                                ></div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="admin-empty-text">Aucune donnee de paiement enregistree.</p>
                        )}
                      </div>
                    </div>

                    {/* Ventes par Produit / Categorie */}
                    <div className="admin-card">
                      <h3 className="admin-card-title">
                        <i className="fa-solid fa-fire"></i> Produits les Plus Vendus
                      </h3>
                      <div className="admin-table-responsive">
                        <table className="admin-table">
                          <thead>
                            <tr>
                              <th>Article</th>
                              <th>Ventes</th>
                              <th>Revenu</th>
                            </tr>
                          </thead>
                          <tbody>
                            {kpis?.categoryBreakdown?.slice(0, 5).map((item, idx) => (
                              <tr key={idx}>
                                <td><strong>{item._id}</strong></td>
                                <td>{item.totalSold} unites</td>
                                <td className="admin-price-highlight">{formatPrice(item.totalAmount)}</td>
                              </tr>
                            ))}
                            {(!kpis?.categoryBreakdown || kpis.categoryBreakdown.length === 0) && (
                              <tr>
                                <td colSpan={3} className="admin-empty-text">Aucune vente enregistree pour l'instant.</td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>

                  {/* Tableau des Commandes Recentes */}
                  <div className="admin-card" style={{ marginTop: '1.5rem' }}>
                    <div className="admin-card-header-flex">
                      <h3 className="admin-card-title">
                        <i className="fa-solid fa-clock-rotate-left"></i> Dernieres Commandes Recues
                      </h3>
                      <button
                        type="button"
                        className="admin-btn admin-btn-secondary admin-btn-sm"
                        onClick={() => setActiveTab('orders')}
                      >
                        Voir toutes les commandes <i className="fa-solid fa-arrow-right"></i>
                      </button>
                    </div>

                    <div className="admin-table-responsive">
                      <table className="admin-table">
                        <thead>
                          <tr>
                            <th>N° Commande</th>
                            <th>Date</th>
                            <th>Client</th>
                            <th>Articles</th>
                            <th>Total</th>
                            <th>Paiement</th>
                            <th>Statut</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {kpis?.recentOrders?.map((ord) => (
                            <tr key={ord._id}>
                              <td><strong>#{ord.orderNumber || ord._id.substring(0, 8)}</strong></td>
                              <td>{formatDate(ord.createdAt)}</td>
                              <td>{ord.customer?.name || 'Client anonyme'}</td>
                              <td>{ord.items?.length || 0} article(s)</td>
                              <td className="admin-price-highlight">{formatPrice(ord.total)}</td>
                              <td><span className="admin-badge-secondary">{ord.paymentMethod?.toUpperCase()}</span></td>
                              <td>{getStatusBadge(ord.orderStatus)}</td>
                              <td>
                                <button
                                  type="button"
                                  className="admin-btn admin-btn-sm admin-btn-primary"
                                  onClick={() => setSelectedOrder(ord)}
                                >
                                  Details
                                </button>
                              </td>
                            </tr>
                          ))}
                          {(!kpis?.recentOrders || kpis.recentOrders.length === 0) && (
                            <tr>
                              <td colSpan={8} className="admin-empty-text">Aucune commande recente.</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* ONGLET 2 : GESTION DES COMMANDES */}
              {activeTab === 'orders' && (
                <div className="admin-tab-content">
                  <div className="admin-page-header">
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <h2 className="admin-page-title">Gestion des Commandes ({orders.length})</h2>
                        <span className="admin-realtime-badge">
                          <span className="live-dot"></span> En Direct (Socket.IO)
                        </span>
                      </div>
                      <p className="admin-page-desc">Suivez les commandes en temps réel, traitez les livraisons et gérez les statuts</p>
                    </div>
                    <div className="admin-header-actions">
                      <button
                        type="button"
                        className="admin-btn admin-btn-secondary admin-btn-sm"
                        onClick={() => {
                          loadOrders();
                          showNotification('Liste des commandes actualisée.');
                        }}
                      >
                        <i className="fa-solid fa-rotate"></i> Actualiser
                      </button>
                    </div>
                  </div>

                  {/* Filtres par Onglets Rapides de Statut */}
                  <div className="admin-status-tabs-nav">
                    <button
                      type="button"
                      className={`status-tab-btn ${orderStatusFilter === 'all' ? 'active' : ''}`}
                      onClick={() => setOrderStatusFilter('all')}
                    >
                      <span>Toutes</span>
                      <span className="status-tab-count">{orders.length}</span>
                    </button>
                    <button
                      type="button"
                      className={`status-tab-btn ${orderStatusFilter === 'recue' ? 'active' : ''}`}
                      onClick={() => setOrderStatusFilter('recue')}
                    >
                      <i className="fa-solid fa-inbox text-info"></i>
                      <span>Reçues</span>
                      <span className="status-tab-count status-count-info">
                        {orders.filter((o) => o.orderStatus === 'recue').length}
                      </span>
                    </button>
                    <button
                      type="button"
                      className={`status-tab-btn ${orderStatusFilter === 'en_preparation' ? 'active' : ''}`}
                      onClick={() => setOrderStatusFilter('en_preparation')}
                    >
                      <i className="fa-solid fa-box-open text-warning"></i>
                      <span>En préparation</span>
                      <span className="status-tab-count status-count-warning">
                        {orders.filter((o) => o.orderStatus === 'en_preparation').length}
                      </span>
                    </button>
                    <button
                      type="button"
                      className={`status-tab-btn ${orderStatusFilter === 'en_livraison' ? 'active' : ''}`}
                      onClick={() => setOrderStatusFilter('en_livraison')}
                    >
                      <i className="fa-solid fa-truck-fast text-primary"></i>
                      <span>En livraison</span>
                      <span className="status-tab-count status-count-primary">
                        {orders.filter((o) => o.orderStatus === 'en_livraison').length}
                      </span>
                    </button>
                    <button
                      type="button"
                      className={`status-tab-btn ${orderStatusFilter === 'livree' ? 'active' : ''}`}
                      onClick={() => setOrderStatusFilter('livree')}
                    >
                      <i className="fa-solid fa-circle-check text-success"></i>
                      <span>Livrées</span>
                      <span className="status-tab-count status-count-success">
                        {orders.filter((o) => o.orderStatus === 'livree').length}
                      </span>
                    </button>
                    <button
                      type="button"
                      className={`status-tab-btn ${orderStatusFilter === 'annulee' ? 'active' : ''}`}
                      onClick={() => setOrderStatusFilter('annulee')}
                    >
                      <i className="fa-solid fa-ban text-danger"></i>
                      <span>Annulées</span>
                      <span className="status-tab-count status-count-danger">
                        {orders.filter((o) => o.orderStatus === 'annulee').length}
                      </span>
                    </button>
                  </div>

                  {/* Barre de recherche et filtres complémentaires */}
                  <div className="admin-filter-bar">
                    <div className="admin-search-input-wrap">
                      <i className="fa-solid fa-magnifying-glass"></i>
                      <input
                        type="text"
                        placeholder="Rechercher par N° commande, nom ou téléphone..."
                        value={orderSearch}
                        onChange={(e) => setOrderSearch(e.target.value)}
                        className="admin-input"
                      />
                      {orderSearch && (
                        <button
                          type="button"
                          className="search-clear-btn"
                          onClick={() => setOrderSearch('')}
                        >
                          <i className="fa-solid fa-xmark"></i>
                        </button>
                      )}
                    </div>

                    <div className="admin-filter-select-group">
                      <select
                        aria-label="Filtrer par moyen de paiement"
                        value={orderPaymentFilter}
                        onChange={(e) => setOrderPaymentFilter(e.target.value)}
                        className="admin-select"
                      >
                        <option value="all">Tous les moyens de règlement</option>
                        <option value="livraison">Paiement Cash à la livraison</option>
                        <option value="cash">Espèces</option>
                        <option value="wave">Wave</option>
                        <option value="orange">Orange Money</option>
                        <option value="mtn">MTN MoMo</option>
                      </select>
                    </div>
                  </div>

                  {/* Tableau des commandes */}
                  <div className="admin-card">
                    <div className="admin-table-responsive">
                      <table className="admin-table">
                        <thead>
                          <tr>
                            <th>N° Commande</th>
                            <th>Date</th>
                            <th>Client & Ville</th>
                            <th>Contact</th>
                            <th>Articles</th>
                            <th>Montant</th>
                            <th>Règlement</th>
                            <th>Statut</th>
                            <th style={{ textAlign: 'right' }}>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {orders.map((ord) => {
                            const cName = ord.customerName || ord.customer?.name || 'Client';
                            const cPhone = ord.customerPhone || ord.customer?.phone || '-';
                            const cCity = ord.city || ord.deliveryAddress?.city || 'Abidjan';
                            const cleanPhone = cPhone.replace(/\D/g, '');
                            const waLink = cleanPhone ? `https://wa.me/${cleanPhone.startsWith('225') ? cleanPhone : `225${cleanPhone}`}` : null;

                            return (
                              <tr key={ord._id} className={ord.orderStatus === 'recue' ? 'admin-tr-highlight' : ''}>
                                <td>
                                  <div className="order-number-cell">
                                    <strong>#{ord.orderNumber || ord._id.substring(0, 8)}</strong>
                                    {ord.orderStatus === 'recue' && <span className="badge-new-dot" title="Nouvelle commande en attente">Nouveau</span>}
                                  </div>
                                </td>
                                <td>{formatDate(ord.createdAt)}</td>
                                <td>
                                  <div>
                                    <strong>{cName}</strong>
                                    <div className="admin-subtext">{cCity}</div>
                                  </div>
                                </td>
                                <td>
                                  <div className="contact-cell-flex">
                                    <a href={`tel:${cPhone}`} className="admin-link">
                                      {cPhone}
                                    </a>
                                    {waLink && (
                                      <a
                                        href={waLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="wa-icon-link"
                                        title="WhatsApp"
                                      >
                                        <i className="fa-brands fa-whatsapp"></i>
                                      </a>
                                    )}
                                  </div>
                                </td>
                                <td>
                                  <span className="admin-qty-badge">{ord.items?.length || 0} art.</span>
                                </td>
                                <td className="admin-price-highlight">{formatPrice(ord.total)}</td>
                                <td>
                                  <span className="admin-badge-secondary">
                                    {ord.paymentMethod === 'livraison' || ord.paymentMethod === 'cash' ? 'Cash Livraison' : ord.paymentMethod?.toUpperCase()}
                                  </span>
                                </td>
                                <td>{getStatusBadge(ord.orderStatus)}</td>
                                <td style={{ textAlign: 'right' }}>
                                  <button
                                    type="button"
                                    className="admin-btn admin-btn-sm admin-btn-primary"
                                    onClick={() => setSelectedOrder(ord)}
                                  >
                                    <i className="fa-solid fa-eye"></i> Gérer
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                          {orders.length === 0 && (
                            <tr>
                              <td colSpan={9} className="admin-empty-text">
                                <i className="fa-solid fa-inbox" style={{ fontSize: '24px', display: 'block', marginBottom: '8px', color: '#9ca3af' }}></i>
                                Aucune commande ne correspond aux critères de recherche.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* ONGLET 3 : PRODUITS & STOCKS */}
              {activeTab === 'products' && (
                <div className="admin-tab-content">
                  <div className="admin-page-header">
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <h2 className="admin-page-title">Gestion du Catalogue ({products.length} articles)</h2>
                        <span className="admin-realtime-badge">
                          <span className="live-dot"></span> En Direct (Socket.IO)
                        </span>
                      </div>
                      <p className="admin-page-desc">Ajoutez, modifiez, gérez les stocks et publiez instantanément sur la boutique</p>
                    </div>
                    <button
                      type="button"
                      className="admin-btn admin-btn-primary"
                      onClick={() => {
                        setSelectedProduct(null);
                        setIsProductModalOpen(true);
                      }}
                    >
                      <i className="fa-solid fa-plus"></i> Ajouter un Produit
                    </button>
                  </div>

                  {/* Filtres Rapides par Statut de Stock */}
                  <div className="admin-status-tabs-nav">
                    <button
                      type="button"
                      className={`status-tab-btn ${productStockFilter === 'all' ? 'active' : ''}`}
                      onClick={() => setProductStockFilter('all')}
                    >
                      <span>Tous les articles</span>
                      <span className="status-tab-count">{products.length}</span>
                    </button>
                    <button
                      type="button"
                      className={`status-tab-btn ${productStockFilter === 'inStock' ? 'active' : ''}`}
                      onClick={() => setProductStockFilter('inStock')}
                    >
                      <i className="fa-solid fa-circle-check text-success"></i>
                      <span>En stock</span>
                      <span className="status-tab-count status-count-success">
                        {products.filter((p) => p.inStock && (p.stockQuantity === undefined || p.stockQuantity > (p.lowStockThreshold || 5))).length}
                      </span>
                    </button>
                    <button
                      type="button"
                      className={`status-tab-btn ${productStockFilter === 'low' ? 'active' : ''}`}
                      onClick={() => setProductStockFilter('low')}
                    >
                      <i className="fa-solid fa-fire text-warning"></i>
                      <span>Stock faible (≤ 5)</span>
                      <span className="status-tab-count status-count-warning">
                        {products.filter((p) => p.stockQuantity > 0 && p.stockQuantity <= (p.lowStockThreshold || 5)).length}
                      </span>
                    </button>
                    <button
                      type="button"
                      className={`status-tab-btn ${productStockFilter === 'outOfStock' ? 'active' : ''}`}
                      onClick={() => setProductStockFilter('outOfStock')}
                    >
                      <i className="fa-solid fa-ban text-danger"></i>
                      <span>Rupture de stock (0)</span>
                      <span className="status-tab-count status-count-danger">
                        {products.filter((p) => !p.inStock || p.stockQuantity <= 0).length}
                      </span>
                    </button>
                  </div>

                  {/* Filtres Catalogue */}
                  <div className="admin-filter-bar">
                    <div className="admin-search-input-wrap">
                      <i className="fa-solid fa-magnifying-glass"></i>
                      <input
                        type="text"
                        placeholder="Rechercher par nom ou mot-clé..."
                        value={productSearch}
                        onChange={(e) => setProductSearch(e.target.value)}
                        className="admin-input"
                      />
                      {productSearch && (
                        <button
                          type="button"
                          className="search-clear-btn"
                          onClick={() => setProductSearch('')}
                        >
                          <i className="fa-solid fa-xmark"></i>
                        </button>
                      )}
                    </div>

                    <div className="admin-filter-select-group">
                      <select
                        aria-label="Filtrer par categorie"
                        value={productCategoryFilter}
                        onChange={(e) => setProductCategoryFilter(e.target.value)}
                        className="admin-select"
                      >
                        <option value="all">Toutes les catégories</option>
                        <option value="Robes">Robes</option>
                        <option value="Costumes">Costumes</option>
                        <option value="Chaussures">Chaussures</option>
                        <option value="Sacs">Sacs</option>
                        <option value="Accessoires">Accessoires</option>
                        <option value="Bijoux">Bijoux</option>
                        <option value="Ensembles">Ensembles</option>
                        <option value="High-Tech">High-Tech</option>
                      </select>
                    </div>
                  </div>

                  {/* Tableau des Produits */}
                  <div className="admin-card">
                    <div className="admin-table-responsive">
                      <table className="admin-table">
                        <thead>
                          <tr>
                            <th>Visuel</th>
                            <th>Titre & Variantes</th>
                            <th>Catégorie</th>
                            <th>Prix</th>
                            <th>Stock</th>
                            <th>Disponibilité</th>
                            <th style={{ textAlign: 'right' }}>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {products.map((prod) => {
                            const isOutOfStock = !prod.inStock || (prod.stockQuantity !== undefined && prod.stockQuantity <= 0);
                            const isLowStock = !isOutOfStock && prod.stockQuantity > 0 && prod.stockQuantity <= (prod.lowStockThreshold || 5);

                            return (
                              <tr key={prod._id} className={isOutOfStock ? 'admin-tr-dimmed' : ''}>
                                <td>
                                  <div className="admin-prod-img-wrap">
                                    <img
                                      src={prod.image}
                                      alt={prod.title}
                                      className="admin-product-thumb"
                                      onError={(e) => {
                                        e.target.src = 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=120';
                                      }}
                                    />
                                    {prod.images && prod.images.length > 0 && (
                                      <span className="admin-img-badge">+{prod.images.length}</span>
                                    )}
                                  </div>
                                </td>
                                <td>
                                  <div className="admin-prod-title-cell">
                                    <strong className="prod-title-text">{prod.title}</strong>
                                    <div className="prod-meta-tags">
                                      {prod.featured && <span className="admin-tag-hot">Flash</span>}
                                      {prod.badge && <span className="admin-tag">{prod.badge}</span>}
                                      {prod.colors && prod.colors.length > 0 && (
                                        <div className="admin-color-dots" title={`Couleurs: ${prod.colors.join(', ')}`}>
                                          {prod.colors.map((c, i) => (
                                            <span key={i} className="color-dot-sm" style={{ backgroundColor: c.toLowerCase() }} />
                                          ))}
                                        </div>
                                      )}
                                      {prod.sizes && prod.sizes.length > 0 && (
                                        <span className="admin-sizes-tag">
                                          {prod.sizes.join(' / ')}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </td>
                                <td><span className="admin-tag-category">{prod.category}</span></td>
                                <td>
                                  <div className="admin-price-cell">
                                    <span className="admin-price-highlight">{formatPrice(prod.price)}</span>
                                    {prod.originalPrice && prod.originalPrice > prod.price && (
                                      <span className="admin-price-strike">{formatPrice(prod.originalPrice)}</span>
                                    )}
                                  </div>
                                </td>
                                <td>
                                  {isOutOfStock ? (
                                    <span className="admin-stock-badge stock-badge-danger">
                                      <i className="fa-solid fa-ban"></i> Rupture (0)
                                    </span>
                                  ) : isLowStock ? (
                                    <span className="admin-stock-badge stock-badge-warning">
                                      <i className="fa-solid fa-fire"></i> {prod.stockQuantity} restant(s)
                                    </span>
                                  ) : (
                                    <span className="admin-stock-badge stock-badge-success">
                                      <i className="fa-solid fa-circle-check"></i> {prod.stockQuantity} en stock
                                    </span>
                                  )}
                                </td>
                                <td>
                                  <button
                                    type="button"
                                    className={`admin-toggle-stock-btn ${prod.inStock && prod.stockQuantity > 0 ? 'in-stock' : 'out-stock'}`}
                                    onClick={() => handleToggleStock(prod._id, prod.title)}
                                    title="Cliquer pour basculer la disponibilité instantanément"
                                  >
                                    {prod.inStock && prod.stockQuantity > 0 ? (
                                      <>
                                        <i className="fa-solid fa-toggle-on"></i> Actif
                                      </>
                                    ) : (
                                      <>
                                        <i className="fa-solid fa-toggle-off"></i> Inactif
                                      </>
                                    )}
                                  </button>
                                </td>
                                <td style={{ textAlign: 'right' }}>
                                  <div className="admin-action-btns" style={{ justifyContent: 'flex-end' }}>
                                    <button
                                      type="button"
                                      className="admin-btn-icon"
                                      title="Modifier ce produit"
                                      onClick={() => {
                                        setSelectedProduct(prod);
                                        setIsProductModalOpen(true);
                                      }}
                                    >
                                      <i className="fa-solid fa-pen-to-square"></i>
                                    </button>
                                    <button
                                      type="button"
                                      className="admin-btn-icon admin-btn-icon-danger"
                                      title="Supprimer ce produit du catalogue"
                                      onClick={() => handleDeleteProduct(prod._id, prod.title)}
                                    >
                                      <i className="fa-solid fa-trash-can"></i>
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                          {products.length === 0 && (
                            <tr>
                              <td colSpan={7} className="admin-empty-text">
                                <i className="fa-solid fa-box-open" style={{ fontSize: '24px', display: 'block', marginBottom: '8px', color: '#9ca3af' }}></i>
                                Aucun produit ne correspond à vos critères de recherche.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* ONGLET 4 : BASE CLIENTS */}
              {activeTab === 'users' && (
                <div className="admin-tab-content">
                  <div className="admin-page-header">
                    <div>
                      <h2 className="admin-page-title">Base Clients & Utilisateurs ({users.length})</h2>
                      <p className="admin-page-desc">Consultez l'historique et l'activite de vos clients</p>
                    </div>
                    <button
                      type="button"
                      className="admin-btn admin-btn-secondary admin-btn-sm"
                      onClick={() => {
                        loadUsers();
                        showNotification('Base clients actualisee.');
                      }}
                    >
                      <i className="fa-solid fa-rotate"></i> Actualiser
                    </button>
                  </div>

                  <div className="admin-filter-bar">
                    <div className="admin-search-input-wrap">
                      <i className="fa-solid fa-magnifying-glass"></i>
                      <input
                        type="text"
                        placeholder="Rechercher un client par nom, email ou telephone..."
                        value={userSearch}
                        onChange={(e) => setUserSearch(e.target.value)}
                        className="admin-input"
                      />
                    </div>
                  </div>

                  <div className="admin-card">
                    <div className="admin-table-responsive">
                      <table className="admin-table">
                        <thead>
                          <tr>
                            <th>Nom & Prenoms</th>
                            <th>Email</th>
                            <th>Telephone</th>
                            <th>Ville</th>
                            <th>Commandes</th>
                            <th>Total Depense</th>
                            <th>Role</th>
                            <th>Contact</th>
                          </tr>
                        </thead>
                        <tbody>
                          {users.map((u) => (
                            <tr key={u._id}>
                              <td><strong>{u.name}</strong></td>
                              <td>{u.email}</td>
                              <td>{u.phone || '-'}</td>
                              <td>{u.city || 'Abidjan'}</td>
                              <td><span className="admin-tag">{u.orderCount || 0} cmd</span></td>
                              <td className="admin-price-highlight">{formatPrice(u.totalSpent || 0)}</td>
                              <td>
                                <span className={`admin-badge-${u.role === 'admin' ? 'danger' : 'info'}`}>
                                  {u.role === 'admin' ? 'Administrateur' : 'Client'}
                                </span>
                              </td>
                              <td>
                                {u.phone ? (
                                  <a
                                    href={`https://wa.me/${u.phone.replace(/\D/g, '')}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="admin-btn admin-btn-xs admin-btn-whatsapp"
                                  >
                                    <i className="fa-brands fa-whatsapp"></i> WhatsApp
                                  </a>
                                ) : (
                                  '-'
                                )}
                              </td>
                            </tr>
                          ))}
                          {users.length === 0 && (
                            <tr>
                              <td colSpan={8} className="admin-empty-text">
                                Aucun client trouve.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* ONGLET 5 : PARAMETRES DE LA BOUTIQUE */}
              {activeTab === 'settings' && (
                <div className="admin-tab-content">
                  <div className="admin-page-header">
                    <div>
                      <h2 className="admin-page-title">Parametres de la Boutique</h2>
                      <p className="admin-page-desc">Configurez la livraison, codes promos, contacts et messages d'annonces</p>
                    </div>
                  </div>

                  <div className="admin-card">
                    <form onSubmit={handleSaveSettings} className="admin-form">
                      <div className="admin-form-grid">
                        <div className="admin-form-group">
                          <label htmlFor="shop-name">Nom de la boutique</label>
                          <input
                            id="shop-name"
                            type="text"
                            value={settings.shopName || ''}
                            onChange={(e) => setSettings({ ...settings, shopName: e.target.value })}
                            className="admin-input"
                          />
                        </div>

                        <div className="admin-form-group">
                          <label htmlFor="shop-currency">Devise</label>
                          <input
                            id="shop-currency"
                            type="text"
                            value={settings.currency || 'FCFA'}
                            onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                            className="admin-input"
                          />
                        </div>

                        <div className="admin-form-group">
                          <label htmlFor="shipping-cost">Frais de livraison standard (FCFA)</label>
                          <input
                            id="shipping-cost"
                            type="number"
                            min="0"
                            value={settings.defaultShippingCost || 0}
                            onChange={(e) => setSettings({ ...settings, defaultShippingCost: Number(e.target.value) })}
                            className="admin-input"
                          />
                        </div>

                        <div className="admin-form-group">
                          <label htmlFor="free-shipping-threshold">Seuil livraison gratuite (FCFA)</label>
                          <input
                            id="free-shipping-threshold"
                            type="number"
                            min="0"
                            value={settings.freeShippingThreshold || 0}
                            onChange={(e) => setSettings({ ...settings, freeShippingThreshold: Number(e.target.value) })}
                            className="admin-input"
                          />
                        </div>

                        <div className="admin-form-group">
                          <label htmlFor="active-promo-code">Code Promo Actif</label>
                          <input
                            id="active-promo-code"
                            type="text"
                            value={settings.activePromoCode || ''}
                            onChange={(e) => setSettings({ ...settings, activePromoCode: e.target.value.toUpperCase() })}
                            className="admin-input"
                          />
                        </div>

                        <div className="admin-form-group">
                          <label htmlFor="promo-percent">Remise Code Promo (%)</label>
                          <input
                            id="promo-percent"
                            type="number"
                            min="1"
                            max="90"
                            value={settings.promoDiscountPercent || 10}
                            onChange={(e) => setSettings({ ...settings, promoDiscountPercent: Number(e.target.value) })}
                            className="admin-input"
                          />
                        </div>

                        <div className="admin-form-group">
                          <label htmlFor="whatsapp-contact">Numero WhatsApp Support / Commande</label>
                          <input
                            id="whatsapp-contact"
                            type="text"
                            value={settings.whatsappNumber || ''}
                            onChange={(e) => setSettings({ ...settings, whatsappNumber: e.target.value })}
                            className="admin-input"
                          />
                        </div>

                        <div className="admin-form-group">
                          <label htmlFor="contact-email">Email de Contact</label>
                          <input
                            id="contact-email"
                            type="email"
                            value={settings.contactEmail || ''}
                            onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
                            className="admin-input"
                          />
                        </div>
                      </div>

                      <div className="admin-form-group">
                        <label htmlFor="announcement-text">Message de la bannière défilante (Ticker / Marquee)</label>
                        <textarea
                          id="announcement-text"
                          rows={3}
                          value={settings.announcementText || ''}
                          onChange={(e) => setSettings({ ...settings, announcementText: e.target.value })}
                          className="admin-textarea"
                          placeholder="Ex: VENTE FLASH : Jusqu'à -50% | LIVRAISON EXPRESS : 24/48h en Côte d'Ivoire..."
                        />
                        <small style={{ color: 'var(--text-muted, #8b9bb4)', fontSize: '0.75rem', marginTop: '0.35rem', display: 'block' }}>
                          Astuce : Utilisez le séparateur <strong>|</strong> pour scinder vos annonces avec des puces élégantes.
                        </small>
                      </div>

                      <div className="admin-checkbox-group" style={{ marginBottom: '0.75rem' }}>
                        <label className="admin-checkbox-label">
                          <input
                            type="checkbox"
                            checked={settings.isAnnouncementActive !== false}
                            onChange={(e) => setSettings({ ...settings, isAnnouncementActive: e.target.checked })}
                          />
                          <span>Activer et afficher la bannière défilante sur la boutique</span>
                        </label>
                      </div>

                      <div className="admin-checkbox-group">
                        <label className="admin-checkbox-label">
                          <input
                            type="checkbox"
                            checked={settings.isShopOpen}
                            onChange={(e) => setSettings({ ...settings, isShopOpen: e.target.checked })}
                          />
                          <span>Boutique ouverte aux commandes en ligne</span>
                        </label>
                      </div>

                      <div style={{ marginTop: '1.5rem' }}>
                        <button
                          type="submit"
                          className="admin-btn admin-btn-primary"
                          disabled={settingsSaving}
                        >
                          {settingsSaving ? (
                            <>
                              <i className="fa-solid fa-spinner fa-spin"></i> Enregistrement...
                            </>
                          ) : (
                            <>
                              <i className="fa-solid fa-floppy-disk"></i> Enregistrer les Parametres
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* Modale de details commande */}
      {selectedOrder && (
        <AdminOrderDetailsModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onOrderUpdated={(updated) => {
            setSelectedOrder(updated);
            loadOrders();
            loadKPIs();
          }}
        />
      )}

      {/* Modale d'ajout / modification de produit */}
      {isProductModalOpen && (
        <AdminProductModal
          product={selectedProduct}
          isOpen={isProductModalOpen}
          onClose={() => {
            setIsProductModalOpen(false);
            setSelectedProduct(null);
          }}
          onProductSaved={() => {
            showNotification(
              selectedProduct ? 'Produit mis a jour avec succes.' : 'Nouveau produit ajoute avec succes.'
            );
            loadProducts();
            loadKPIs();
          }}
        />
      )}
    </div>
  );
};
