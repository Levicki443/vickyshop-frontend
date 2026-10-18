import React from 'react';

/**
 * Cartes statistiques consolidées pour la gestion des utilisateurs.
 * Affiche les 6 indicateurs clés issus en direct de la base de données MongoDB.
 * Conforme aux règles d'accessibilité, typographie française et design system CSS.
 */
export const AdminUsersStatsCards = ({ stats, loading = false }) => {
  const formatNumber = (val) => {
    if (val === null || val === undefined) return '0';
    return Number(val).toLocaleString('fr-FR');
  };

  const cards = [
    {
      id: 'total-users',
      title: 'Total Inscrits',
      value: formatNumber(stats?.totalUsers),
      subtext: 'Tous les comptes enregistrés',
      icon: 'fa-users',
      themeClass: 'admin-kpi-card--primary',
    },
    {
      id: 'total-clients',
      title: 'Clients',
      value: formatNumber(stats?.totalClients),
      subtext: 'Acheteurs inscrits',
      icon: 'fa-user-tag',
      themeClass: 'admin-kpi-card--info',
    },
    {
      id: 'total-sellers',
      title: 'Vendeurs Marketplace',
      value: formatNumber(stats?.totalSellers),
      subtext: 'Boutiques partenaires',
      icon: 'fa-store',
      themeClass: 'admin-kpi-card--warning',
    },
    {
      id: 'active-users',
      title: 'Comptes Actifs',
      value: formatNumber(stats?.activeUsers),
      subtext: 'Accès autorisés',
      icon: 'fa-circle-check',
      themeClass: 'admin-kpi-card--success',
    },
    {
      id: 'suspended-users',
      title: 'Suspendus / Désactivés',
      value: formatNumber(stats?.suspendedUsers),
      subtext: 'Accès restreints ou archivés',
      icon: 'fa-user-slash',
      themeClass: 'admin-kpi-card--danger',
    },
    {
      id: 'new-registrations',
      title: 'Nouvelles Inscriptions',
      value: `${formatNumber(stats?.newUsersToday)} auj.`,
      subtext: `${formatNumber(stats?.newUsersLast30Days)} ces 30 derniers jours`,
      icon: 'fa-user-plus',
      themeClass: 'admin-kpi-card--purple',
    },
  ];

  return (
    <div className="admin-user-kpis-grid" aria-label="Statistiques générales des utilisateurs">
      {cards.map((card) => (
        <div key={card.id} className={`admin-user-kpi-card ${card.themeClass}`}>
          <div className="admin-user-kpi-header">
            <span className="admin-user-kpi-title">{card.title}</span>
            <div className="admin-user-kpi-icon-wrap" aria-hidden="true">
              <i className={`fa-solid ${card.icon}`}></i>
            </div>
          </div>
          <div className="admin-user-kpi-body">
            <span className="admin-user-kpi-value">
              {loading ? (
                <span className="admin-user-kpi-spinner">
                  <i className="fa-solid fa-spinner fa-spin"></i>
                </span>
              ) : (
                card.value
              )}
            </span>
            <span className="admin-user-kpi-subtext">{card.subtext}</span>
          </div>
        </div>
      ))}
    </div>
  );
};
