import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { formatPrice } from '../../services/api';
import { onClientOrderUpdate, onOrderUpdated, onOrderStatusUpdated, trackOrderRoom } from '../../services/socket';
import { OrderTrackingDetails } from '../cart/OrderTrackingDetails';

const STATUS_BADGE_MAP = {
  recue: { label: 'Reçue', cls: 'badge-item-pending' },
  en_attente: { label: 'Reçue', cls: 'badge-item-pending' },
  confirmee: { label: 'Confirmée', cls: 'badge-item-confirmed' },
  en_preparation: { label: 'En préparation', cls: 'badge-item-preparing' },
  expediee: { label: 'Expédiée', cls: 'badge-item-shipped' },
  en_livraison: { label: 'En livraison', cls: 'badge-item-delivery' },
  livree: { label: 'Livrée', cls: 'badge-item-delivered' },
  annulee: { label: 'Annulée', cls: 'badge-item-cancelled' },
  refusee: { label: 'Refusée', cls: 'badge-item-cancelled' },
  retournee: { label: 'Retournée', cls: 'badge-item-shipped' },
};

export const UserOrdersPage = ({ onBackToShop, initialOrderNumber }) => {
  const { user, token } = useAuth();
  const { addToast } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');

  const loadUserOrders = useCallback(async () => {
    setLoading(true);
    try {
      const rawBaseUrl = (import.meta.env.VITE_URL || import.meta.env.VITE_API_URL || '/api').trim().replace(/\/+$/, '');
      const API_BASE_URL = rawBaseUrl.endsWith('/api') ? rawBaseUrl : `${rawBaseUrl}/api`;

      if (token) {
        const res = await fetch(`${API_BASE_URL}/orders/my-orders`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          if (data.data?.orders?.length > 0) {
            const list = data.data.orders;
            setOrders(list);
            list.forEach((o) => trackOrderRoom(o.orderNumber));
            const target = initialOrderNumber ? list.find((o) => o.orderNumber === initialOrderNumber) || list[0] : list[0];
            setSelectedOrder(target);
            setLoading(false);
            return;
          }
        }
      }

      const saved = localStorage.getItem('vicky_client_orders');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setOrders(parsed);
          parsed.forEach((o) => trackOrderRoom(o.orderNumber));
          const target = initialOrderNumber ? parsed.find((o) => o.orderNumber === initialOrderNumber) || parsed[0] : parsed[0];
          setSelectedOrder(target);
        }
      }
    } catch (e) {
      console.warn('Erreur chargement commandes client :', e);
    } finally {
      setLoading(false);
    }
  }, [token, initialOrderNumber]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    loadUserOrders();
  }, [loadUserOrders]);

  // Synchronisation temps réel (Socket.IO)
  useEffect(() => {
    const handleLiveUpdate = (updatedData) => {
      const ordNum = updatedData.orderNumber;
      if (!ordNum) return;

      setOrders((prev) => {
        const index = prev.findIndex((o) => o.orderNumber === ordNum);
        if (index === -1) return prev;
        const newOrders = [...prev];
        newOrders[index] = {
          ...newOrders[index],
          orderStatus: updatedData.orderStatus || updatedData.status || newOrders[index].orderStatus,
          paymentStatus: updatedData.paymentStatus || newOrders[index].paymentStatus,
          statusHistory: updatedData.statusHistory || newOrders[index].statusHistory,
          items: updatedData.items || newOrders[index].items,
        };
        try {
          localStorage.setItem('vicky_client_orders', JSON.stringify(newOrders.slice(0, 15)));
        } catch {}
        return newOrders;
      });

      setSelectedOrder((current) => {
        if (!current || current.orderNumber !== ordNum) return current;
        return {
          ...current,
          orderStatus: updatedData.orderStatus || updatedData.status || current.orderStatus,
          paymentStatus: updatedData.paymentStatus || current.paymentStatus,
          statusHistory: updatedData.statusHistory || current.statusHistory,
          items: updatedData.items || current.items,
        };
      });

      if (updatedData.statusLabel || updatedData.status) {
        addToast('Mise à jour commande', `Commande #${ordNum} : ${updatedData.statusLabel || updatedData.status}`, 'info');
      }
    };

    const unsubClient = onClientOrderUpdate(handleLiveUpdate);
    const unsubTrack = onOrderUpdated(handleLiveUpdate);
    const unsubStatus = onOrderStatusUpdated(handleLiveUpdate);

    return () => {
      unsubClient();
      unsubTrack();
      unsubStatus();
    };
  }, [addToast]);

  const handleSearchOrder = async (e) => {
    e.preventDefault();
    const query = searchQuery.trim().toUpperCase();
    if (!query) {
      addToast('Information', 'Veuillez saisir un numéro de commande (ex: VK-20261008-AW1P)', 'info');
      return;
    }

    setLoading(true);
    try {
      const rawBaseUrl = (import.meta.env.VITE_URL || import.meta.env.VITE_API_URL || '/api').trim().replace(/\/+$/, '');
      const API_BASE_URL = rawBaseUrl.endsWith('/api') ? rawBaseUrl : `${rawBaseUrl}/api`;

      const res = await fetch(`${API_BASE_URL}/orders/${encodeURIComponent(query)}`);
      const data = await res.json();

      if (res.ok && data.data?.order) {
        const found = data.data.order;
        setSelectedOrder(found);
        trackOrderRoom(found.orderNumber);
        setOrders((prev) => {
          const exists = prev.some((o) => o.orderNumber === found.orderNumber);
          const updated = exists ? prev.map((o) => (o.orderNumber === found.orderNumber ? found : o)) : [found, ...prev];
          try {
            localStorage.setItem('vicky_client_orders', JSON.stringify(updated.slice(0, 15)));
          } catch {}
          return updated;
        });
        addToast('Commande trouvée', `Statut : ${found.orderStatus || 'Reçue'}`, 'success');
      } else {
        addToast('Introuvable', data.message || 'Aucune commande trouvée pour cette référence.', 'error');
      }
    } catch (err) {
      addToast('Erreur', 'Impossible de contacter le serveur de suivi.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter((ord) => {
    if (filterStatus === 'pending') return ['recue', 'en_attente', 'confirmee', 'en_preparation', 'expediee', 'en_livraison'].includes(ord.orderStatus);
    if (filterStatus === 'delivered') return ord.orderStatus === 'livree';
    if (filterStatus === 'cancelled') return ['annulee', 'refusee', 'retournee'].includes(ord.orderStatus);
    return true;
  });

  return (
    <div className="container user-orders-page-root animate-fade-in">
      <div className="orders-top-breadcrumb-bar">
        <button type="button" className="btn-back-shop" onClick={onBackToShop}>
          <i className="fa-solid fa-arrow-left"></i>
          <span>Retour à la Boutique</span>
        </button>
        <div className="orders-breadcrumb-trail">
          <span onClick={onBackToShop} className="trail-home">Accueil</span>
          <i className="fa-solid fa-chevron-right"></i>
          <span className="trail-current">Mes Commandes &amp; Suivi en Direct</span>
        </div>
      </div>

      <div className="orders-page-header">
        <span className="section-subtitle">Espace Suivi Client</span>
        <h1 className="section-title">Suivi de vos Commandes en Temps Réel</h1>
        <div className="title-underline" />
        <p className="orders-page-desc">
          Suivez l&apos;acheminement étape par étape de vos colis, l&apos;historique de validation et le règlement en espèces à la livraison.
        </p>
      </div>

      <div className="orders-search-wrapper">
        <form onSubmit={handleSearchOrder} className="orders-search-form">
          <div className="orders-search-input-wrap">
            <i className="fa-solid fa-magnifying-glass"></i>
            <input
              type="text"
              className="orders-search-input"
              placeholder="Rechercher par référence (ex: VK-20261008-7A4B)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-primary btn-search-order" disabled={loading}>
            {loading ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-truck-fast"></i>}
            <span>Rechercher</span>
          </button>
        </form>
      </div>

      <div className="orders-split-layout">
        <div className="orders-master-list-col">
          <div className="orders-list-header-row">
            <h3 className="orders-list-title">Vos Commandes ({filteredOrders.length})</h3>
            <div className="orders-filter-pills">
              <button type="button" className={`pill-btn ${filterStatus === 'all' ? 'active' : ''}`} onClick={() => setFilterStatus('all')}>Toutes</button>
              <button type="button" className={`pill-btn ${filterStatus === 'pending' ? 'active' : ''}`} onClick={() => setFilterStatus('pending')}>En cours</button>
              <button type="button" className={`pill-btn ${filterStatus === 'delivered' ? 'active' : ''}`} onClick={() => setFilterStatus('delivered')}>Livrées</button>
              <button type="button" className={`pill-btn ${filterStatus === 'cancelled' ? 'active' : ''}`} onClick={() => setFilterStatus('cancelled')}>Annulées</button>
            </div>
          </div>

          {loading && orders.length === 0 ? (
            <div className="orders-loading-state">
              <i className="fa-solid fa-spinner fa-spin"></i>
              <p>Chargement de vos commandes...</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="orders-empty-state">
              <i className="fa-solid fa-box-open"></i>
              <h4>Aucune commande trouvée</h4>
              <p>Aucune commande enregistrée ne correspond au filtre sélectionné.</p>
            </div>
          ) : (
            <div className="orders-cards-stream">
              {filteredOrders.map((ord) => {
                const isSelected = selectedOrder?.orderNumber === ord.orderNumber;
                const st = STATUS_BADGE_MAP[ord.orderStatus] || STATUS_BADGE_MAP.recue;

                return (
                  <div
                    key={ord.orderNumber}
                    className={`order-summary-card ${isSelected ? 'active-selection' : ''}`}
                    onClick={() => setSelectedOrder(ord)}
                  >
                    <div className="order-card-top-flex">
                      <strong className="order-card-ref">#{ord.orderNumber}</strong>
                      <span className={`badge-item-status ${st.cls}`}>{st.label}</span>
                    </div>

                    <div className="order-card-mid-flex">
                      <span>{ord.items?.length || 1} article(s)</span>
                      <strong className="order-card-price">{formatPrice(ord.total)}</strong>
                    </div>

                    <div className="order-card-bottom-flex">
                      <span className="order-card-date">
                        <i className="fa-regular fa-clock"></i>{' '}
                        {ord.createdAt ? new Date(ord.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Récente'}
                      </span>
                      <span className="order-card-payment-note">Cash à la livraison</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="orders-detail-view-col">
          {selectedOrder ? (
            <OrderTrackingDetails order={selectedOrder} />
          ) : (
            <div className="orders-no-selection-placeholder">
              <i className="fa-solid fa-location-crosshairs"></i>
              <h3>Sélectionnez une commande</h3>
              <p>Cliquez sur l&apos;une de vos commandes à gauche ou lancez une recherche pour voir le suivi détaillé en direct.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserOrdersPage;
