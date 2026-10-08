import React, { useState } from 'react';
import { useNotifications } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';
import { isPushSupported } from '../../services/pushNotificationService';

export const NotificationSettingsTab = () => {
  const { preferences, updatePrefs, isPushActive, toggleWebPush } = useNotifications();
  const { isSeller } = useAuth();

  const [saving, setSaving] = useState(false);
  const [localPrefs, setLocalPrefs] = useState({
    orders: preferences.orders !== false,
    delivery: preferences.delivery !== false,
    newProducts: preferences.newProducts !== false,
    priceDrops: preferences.priceDrops !== false,
    promotions: preferences.promotions !== false,
    soundEnabled: preferences.soundEnabled !== false,
    sellerNewOrders: preferences.sellerNewOrders !== false,
    sellerOrderStatus: preferences.sellerOrderStatus !== false,
    sellerStockAlerts: preferences.sellerStockAlerts !== false,
  });

  const handleToggle = (key) => {
    setLocalPrefs((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updatePrefs(localPrefs);
    } finally {
      setSaving(false);
    }
  };

  const pushAvailable = isPushSupported();

  return (
    <div className="notification-settings-panel animate-fade-in">
      <div className="notif-settings-header">
        <h3 className="notif-settings-title">
          <i className="fa-solid fa-sliders text-primary"></i>
          <span>Préférences de Notifications</span>
        </h3>
        <p className="notif-settings-desc">
          Personnalisez la façon dont vous recevez vos alertes de commandes, promotions et informations boutique.
        </p>
      </div>

      {/* Bannière Push Notifications Navigateur */}
      <div className={`notif-push-card ${isPushActive ? 'active' : ''}`}>
        <div className="notif-push-card-icon">
          <i className={`fa-solid ${isPushActive ? 'fa-bell text-success' : 'fa-bell-slash text-secondary'}`}></i>
        </div>
        <div className="notif-push-card-text">
          <strong>Notifications Push du Navigateur</strong>
          <p>
            {isPushActive
              ? 'Actif : Vous recevez les alertes instantanées même lorsque l\'onglet est fermé.'
              : pushAvailable
              ? 'Recevez des notifications natives sur votre téléphone ou ordinateur sans recharger la page.'
              : 'Les notifications push ne sont pas supportées par ce navigateur.'}
          </p>
        </div>
        {pushAvailable && (
          <button
            type="button"
            className={`btn btn-sm ${isPushActive ? 'btn-secondary text-danger' : 'btn-primary'}`}
            onClick={toggleWebPush}
          >
            <i className={`fa-solid ${isPushActive ? 'fa-toggle-on' : 'fa-toggle-off'}`}></i>
            <span>{isPushActive ? 'Désactiver' : 'Activer le Push'}</span>
          </button>
        )}
      </div>

      <form onSubmit={handleSave} className="notif-preferences-form">
        {/* Section Notifications Client */}
        <div className="notif-settings-group">
          <h4 className="notif-group-title">
            <i className="fa-solid fa-user-tag text-primary"></i> Alertes Clients
          </h4>

          <div className="notif-toggle-row">
            <div className="notif-toggle-info">
              <strong>Confirmations de Commande</strong>
              <small>Notification immédiate dès validation de votre commande.</small>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={localPrefs.orders}
                onChange={() => handleToggle('orders')}
              />
              <span className="toggle-slider" />
            </label>
          </div>

          <div className="notif-toggle-row">
            <div className="notif-toggle-info">
              <strong>Suivi &amp; Livraison</strong>
              <small>Alertes lors de la préparation, expédition et livraison de votre colis.</small>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={localPrefs.delivery}
                onChange={() => handleToggle('delivery')}
              />
              <span className="toggle-slider" />
            </label>
          </div>

          <div className="notif-toggle-row">
            <div className="notif-toggle-info">
              <strong>Baisses de Prix sur Favoris</strong>
              <small>Alerte dès qu&apos;un produit de votre liste d&apos;envies voit son prix diminuer.</small>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={localPrefs.priceDrops}
                onChange={() => handleToggle('priceDrops')}
              />
              <span className="toggle-slider" />
            </label>
          </div>

          <div className="notif-toggle-row">
            <div className="notif-toggle-info">
              <strong>Nouveaux Produits &amp; Tendances</strong>
              <small>Soyez informé(e) lors de l&apos;arrivée de nouveaux articles dans le catalogue.</small>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={localPrefs.newProducts}
                onChange={() => handleToggle('newProducts')}
              />
              <span className="toggle-slider" />
            </label>
          </div>

          <div className="notif-toggle-row">
            <div className="notif-toggle-info">
              <strong>Promotions &amp; Ventes Flash</strong>
              <small>Alertes exclusives sur les codes promos et réductions temporaires.</small>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={localPrefs.promotions}
                onChange={() => handleToggle('promotions')}
              />
              <span className="toggle-slider" />
            </label>
          </div>
        </div>

        {/* Section Notifications Vendeur (si rôle vendeur) */}
        {isSeller && (
          <div className="notif-settings-group">
            <h4 className="notif-group-title">
              <i className="fa-solid fa-store text-primary"></i> Alertes Vendeur Marketplace
            </h4>

            <div className="notif-toggle-row">
              <div className="notif-toggle-info">
                <strong>Nouvelles Commandes Reçues</strong>
                <small>Alerte en temps réel avec détails des articles, quantité et montant.</small>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={localPrefs.sellerNewOrders}
                  onChange={() => handleToggle('sellerNewOrders')}
                />
                <span className="toggle-slider" />
              </label>
            </div>

            <div className="notif-toggle-row">
              <div className="notif-toggle-info">
                <strong>Suivi des Statuts de Vos Articles</strong>
                <small>Alertes sur les modifications d&apos;état et validations de paiement.</small>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={localPrefs.sellerOrderStatus}
                  onChange={() => handleToggle('sellerOrderStatus')}
                />
                <span className="toggle-slider" />
              </label>
            </div>

            <div className="notif-toggle-row">
              <div className="notif-toggle-info">
                <strong>Alertes de Stock Faible &amp; Rupture</strong>
                <small>Notification automatique quand le stock d&apos;un produit passe sous le seuil critique.</small>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={localPrefs.sellerStockAlerts}
                  onChange={() => handleToggle('sellerStockAlerts')}
                />
                <span className="toggle-slider" />
              </label>
            </div>
          </div>
        )}

        {/* Option Sonore */}
        <div className="notif-settings-group">
          <h4 className="notif-group-title">
            <i className="fa-solid fa-volume-high text-primary"></i> Audio &amp; Confort
          </h4>

          <div className="notif-toggle-row">
            <div className="notif-toggle-info">
              <strong>Signal Sonore d&apos;Alerte</strong>
              <small>Émettre un carillon discret lors de la réception d&apos;une nouvelle notification en direct.</small>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={localPrefs.soundEnabled}
                onChange={() => handleToggle('soundEnabled')}
              />
              <span className="toggle-slider" />
            </label>
          </div>
        </div>

        <div className="notif-form-footer">
          <button type="submit" className="btn btn-primary btn-save-prefs" disabled={saving}>
            {saving ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-floppy-disk"></i>}
            <span>Enregistrer les préférences</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default NotificationSettingsTab;
