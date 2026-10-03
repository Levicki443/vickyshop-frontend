import React from 'react';

export const SellerSidebar = ({ activeTab, onSelectTab, unreadCount, newOrdersCount, onClose }) => {
  const navItems = [
    { id: 'dashboard', label: 'Tableau de bord', icon: 'fa-solid fa-chart-pie' },
    { id: 'products', label: 'Mes Produits', icon: 'fa-solid fa-boxes-stacked' },
    { id: 'add_product', label: 'Ajouter un Produit', icon: 'fa-solid fa-circle-plus' },
    { id: 'orders', label: 'Mes Commandes', icon: 'fa-solid fa-truck-ramp-box', badge: newOrdersCount },
    { id: 'notifications', label: 'Notifications', icon: 'fa-solid fa-bell', badge: unreadCount },
    { id: 'profile', label: 'Profil Boutique', icon: 'fa-solid fa-store' },
    { id: 'settings', label: 'Paramètres & Sécurité', icon: 'fa-solid fa-gear' },
  ];

  return (
    <aside className="seller-sidebar">
      <div className="seller-sidebar-nav">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              className={`seller-sidebar-item ${isActive ? 'active' : ''}`}
              onClick={() => onSelectTab(item.id)}
            >
              <div className="d-flex align-items-center gap-2">
                <i className={item.icon}></i>
                <span>{item.label}</span>
              </div>
              {item.badge > 0 && (
                <span className="seller-item-badge">{item.badge}</span>
              )}
            </button>
          );
        })}
      </div>

      <div className="seller-sidebar-footer">
        <button type="button" className="seller-sidebar-item text-danger" onClick={onClose}>
          <i className="fa-solid fa-arrow-left"></i>
          <span>Retour à la Boutique</span>
        </button>
      </div>
    </aside>
  );
};
