import React, { useState, useEffect } from 'react';
import { useToast } from '../../context/ToastContext';
import { OrderTrackingDetails } from './OrderTrackingDetails';

export const OrdersTrackingModal = ({ isOpen, onClose }) => {
  const { addToast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [localOrders, setLocalOrders] = useState([]);

  useEffect(() => {
    if (isOpen) {
      try {
        const saved = localStorage.getItem('vicky_client_orders');
        if (saved) {
          const parsed = JSON.parse(saved);
          setLocalOrders(Array.isArray(parsed) ? parsed : []);
          if (parsed.length > 0 && !selectedOrder) {
            setSelectedOrder(parsed[0]);
          }
        }
      } catch (e) {
        console.error('Erreur lecture historique commandes:', e);
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

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

      if (res.ok && data.data && data.data.order) {
        setSelectedOrder(data.data.order);
        setLocalOrders((prev) => {
          const exists = prev.some((o) => o.orderNumber === data.data.order.orderNumber);
          const updated = exists
            ? prev.map((o) => (o.orderNumber === data.data.order.orderNumber ? data.data.order : o))
            : [data.data.order, ...prev];
          try {
            localStorage.setItem('vicky_client_orders', JSON.stringify(updated.slice(0, 10)));
          } catch {}
          return updated;
        });
        addToast('Commande trouvée', `Statut : ${data.data.order.orderStatus || 'En cours'}`, 'success');
      } else {
        addToast('Introuvable', data.message || 'Aucune commande trouvée pour cette référence.', 'error');
      }
    } catch (err) {
      addToast('Erreur', 'Impossible de contacter le serveur de suivi.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-box"
        style={{
          maxWidth: '780px',
          width: '95%',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          padding: 0,
          background: 'var(--bg-surface)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-xl)',
          border: '1px solid var(--border-color)',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* En-tête de la modale */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '1.2rem 1.5rem',
            borderBottom: '1px solid var(--border-color)',
            background: 'var(--bg-card)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(255, 107, 0, 0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--primary)',
                fontSize: '1.25rem',
              }}
            >
              <i className="fa-solid fa-box-open"></i>
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.18rem', color: 'var(--text-primary)', fontWeight: 800 }}>
                Vos Commandes &amp; Suivi en Direct
              </h3>
              <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                Consultez le statut d&apos;acheminement, vos articles et les détails de facturation.
              </p>
            </div>
          </div>
          <button
            type="button"
            className="modal-close"
            style={{ position: 'static' }}
            onClick={onClose}
            aria-label="Fermer la fenêtre"
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        {/* Corps avec défilement */}
        <div style={{ overflowY: 'auto', padding: '1.4rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Formulaire de recherche */}
          <form onSubmit={handleSearchOrder} style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <i
                className="fa-solid fa-magnifying-glass"
                style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
              ></i>
              <input
                type="text"
                className="form-input"
                style={{ width: '100%', paddingLeft: '2.5rem', margin: 0 }}
                placeholder="Entrez votre référence (ex: VK-20260928-AW1P)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading} style={{ whiteSpace: 'nowrap', padding: '0.75rem 1.25rem' }}>
              {loading ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-truck-fast"></i>}
              <span> Suivre</span>
            </button>
          </form>

          {/* Onglets de sélection des commandes récentes */}
          {localOrders.length > 0 && (
            <div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '0.4rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Commandes récentes :
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.3rem' }}>
                {localOrders.map((ord) => (
                  <button
                    key={ord.orderNumber}
                    type="button"
                    onClick={() => setSelectedOrder(ord)}
                    className={`btn btn-sm ${selectedOrder?.orderNumber === ord.orderNumber ? 'btn-primary' : 'btn-outline'}`}
                    style={{ fontSize: '0.8rem', whiteSpace: 'nowrap', borderRadius: 'var(--radius-full)', padding: '0.35rem 0.85rem' }}
                  >
                    <i className="fa-solid fa-box"></i> #{ord.orderNumber}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Fiche détaillée de la commande */}
          {selectedOrder ? (
            <OrderTrackingDetails order={selectedOrder} />
          ) : (
            <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--text-secondary)' }}>
              <i className="fa-solid fa-boxes-packing" style={{ fontSize: '3rem', opacity: 0.35, marginBottom: '0.75rem', color: 'var(--primary)' }}></i>
              <h4 style={{ color: 'var(--text-primary)' }}>Aucune commande sélectionnée</h4>
              <p style={{ maxWidth: '420px', margin: '0 auto', fontSize: '0.88rem' }}>
                Entrez votre numéro de commande ci-dessus pour suivre son statut en temps réel.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
