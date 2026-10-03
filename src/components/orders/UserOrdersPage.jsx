import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { formatPrice } from '../../services/api';
import { onClientOrderUpdate, onOrderUpdated, trackOrderRoom } from '../../services/socket';
import { OrderTrackingDetails } from '../cart/OrderTrackingDetails';

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

      // 1. Charger depuis l'API si l'utilisateur est connecté
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

      // 2. Repli sur le stockage local du navigateur
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
      console.warn('Erreur chargement commandes utilisateur:', e);
    } finally {
      setLoading(false);
    }
  }, [token, initialOrderNumber]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    loadUserOrders();
  }, [loadUserOrders]);

  // Écoute des mises à jour en direct via Socket.IO
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
        };
      });
    };

    const unsubClient = onClientOrderUpdate(handleLiveUpdate);
    const unsubTrack = onOrderUpdated(handleLiveUpdate);

    return () => {
      unsubClient();
      unsubTrack();
    };
  }, []);

  const handleSearchOrder = async (e) => {
    e.preventDefault();
    const query = searchQuery.trim().toUpperCase();
    if (!query) {
      addToast('Information', 'Veuillez saisir un numéro de commande (ex: VK-20260928-AW1P)', 'info');
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
        setOrders((prev) => {
          const exists = prev.some((o) => o.orderNumber === found.orderNumber);
          const updated = exists
            ? prev.map((o) => (o.orderNumber === found.orderNumber ? found : o))
            : [found, ...prev];
          try {
            localStorage.setItem('vicky_client_orders', JSON.stringify(updated.slice(0, 15)));
          } catch {}
          return updated;
        });
        addToast('Commande trouvée', `Statut : ${found.orderStatus || 'En cours'}`, 'success');
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
    if (filterStatus === 'pending') return ord.orderStatus === 'en_attente' || ord.orderStatus === 'recue' || ord.orderStatus === 'confirmee';
    if (filterStatus === 'delivering') return ord.orderStatus === 'en_preparation' || ord.orderStatus === 'en_livraison';
    if (filterStatus === 'delivered') return ord.orderStatus === 'livree';
    return true;
  });

  return (
    <div className="container user-orders-page-root animate-fade-in" style={{ padding: '2rem 1rem 4rem' }}>
      {/* Fil d'Ariane & Retour */}
      <div className="details-top-bar" style={{ marginBottom: '1.5rem' }}>
        <button type="button" className="btn-back-shop" onClick={onBackToShop}>
          <i className="fa-solid fa-arrow-left"></i>
          <span>Retour à la Boutique</span>
        </button>
        <div className="details-breadcrumb">
          <span onClick={onBackToShop} style={{ cursor: 'pointer' }}>Accueil</span>
          <i className="fa-solid fa-chevron-right"></i>
          <span className="breadcrumb-current">Vos Commandes &amp; Suivi en Direct</span>
        </div>
      </div>

      {/* Titre & Description de la page */}
      <div className="section-header" style={{ textAlign: 'left', marginBottom: '1.75rem' }}>
        <span className="section-subtitle">Espace Suivi Client</span>
        <h1 className="section-title" style={{ fontSize: '1.85rem', marginTop: '0.25rem' }}>
          Suivi de vos Commandes en Temps Réel
        </h1>
        <div className="title-underline" style={{ margin: '0.5rem 0' }} />
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', maxWidth: '650px' }}>
          Retrouvez l&apos;historique de vos achats, l&apos;état d&apos;acheminement de vos colis et les informations de paiement à la livraison.
        </p>
      </div>

      {/* Barre de recherche par numéro de commande */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1.25rem', marginBottom: '2rem' }}>
        <form onSubmit={handleSearchOrder} style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: '1 1 280px' }}>
            <i
              className="fa-solid fa-magnifying-glass"
              style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
            />
            <input
              type="text"
              className="form-input"
              style={{ width: '100%', paddingLeft: '2.6rem', margin: 0 }}
              placeholder="Rechercher par référence (ex: VK-20260928-AW1P)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading} style={{ padding: '0.75rem 1.5rem', whiteSpace: 'nowrap' }}>
            {loading ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-truck-fast"></i>}
            <span> Rechercher</span>
          </button>
        </form>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.75rem', alignItems: 'start' }}>
        {/* COLONNE GAUCHE : LISTE DES COMMANDES */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
              Historique de vos commandes ({filteredOrders.length})
            </h3>
            <div style={{ display: 'flex', gap: '0.35rem' }}>
              <button
                type="button"
                className={`btn btn-sm ${filterStatus === 'all' ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setFilterStatus('all')}
                style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem', borderRadius: 'var(--radius-full)' }}
              >
                Toutes
              </button>
              <button
                type="button"
                className={`btn btn-sm ${filterStatus === 'pending' ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setFilterStatus('pending')}
                style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem', borderRadius: 'var(--radius-full)' }}
              >
                En cours
              </button>
              <button
                type="button"
                className={`btn btn-sm ${filterStatus === 'delivered' ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setFilterStatus('delivered')}
                style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem', borderRadius: 'var(--radius-full)' }}
              >
                Livrées
              </button>
            </div>
          </div>

          {loading && orders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
              <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '2rem', marginBottom: '0.75rem' }}></i>
              <p>Chargement de vos commandes...</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div style={{ background: 'var(--bg-card)', border: '1px dashed var(--border-color)', borderRadius: 'var(--radius-md)', padding: '2.5rem 1.5rem', textAlign: 'center' }}>
              <i className="fa-solid fa-box-open" style={{ fontSize: '2.5rem', opacity: 0.35, color: 'var(--primary)', marginBottom: '0.75rem' }}></i>
              <h4 style={{ margin: '0 0 0.5rem', color: 'var(--text-primary)' }}>Aucune commande trouvée</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
                Vous n&apos;avez pas encore de commande enregistrée avec ce statut.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {filteredOrders.map((ord) => {
                const isSelected = selectedOrder?.orderNumber === ord.orderNumber;
                return (
                  <div
                    key={ord.orderNumber}
                    onClick={() => setSelectedOrder(ord)}
                    style={{
                      background: 'var(--bg-card)',
                      border: `1.5px solid ${isSelected ? 'var(--primary)' : 'var(--border-color)'}`,
                      borderRadius: 'var(--radius-md)',
                      padding: '1rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      boxShadow: isSelected ? 'var(--shadow-md)' : 'none',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <strong style={{ color: isSelected ? 'var(--primary)' : 'var(--text-primary)', fontSize: '0.95rem' }}>
                        #{ord.orderNumber}
                      </strong>
                      <span
                        className={`card-badge badge-${ord.orderStatus || 'new'}`}
                        style={{ fontSize: '0.72rem', padding: '0.2rem 0.55rem' }}
                      >
                        {ord.orderStatus === 'livree' ? 'Livrée' : ord.orderStatus === 'en_livraison' ? 'En livraison' : 'En préparation'}
                      </span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                      <span>{ord.items?.length || 1} article(s)</span>
                      <strong style={{ color: 'var(--text-primary)' }}>{formatPrice(ord.total)}</strong>
                    </div>

                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
                      {ord.createdAt ? new Date(ord.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Date récente'}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* COLONNE DROITE : FICHE DÉTAILLÉE DU SUIVI */}
        <div>
          {selectedOrder ? (
            <OrderTrackingDetails order={selectedOrder} />
          ) : (
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '3.5rem 1.5rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
              <i className="fa-solid fa-location-crosshairs" style={{ fontSize: '3rem', opacity: 0.35, color: 'var(--primary)', marginBottom: '1rem' }}></i>
              <h3 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Sélectionnez une commande</h3>
              <p style={{ maxWidth: '400px', margin: '0 auto', fontSize: '0.88rem' }}>
                Cliquez sur l&apos;une de vos commandes à gauche ou utilisez la recherche pour afficher le suivi d&apos;acheminement complet.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserOrdersPage;
