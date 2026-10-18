import React, { useState, useEffect, useCallback } from 'react';
import {
  fetchAdminUserStats,
  fetchAdminUsers,
  fetchAdminUserDetails,
  updateAdminUserApi,
  updateAdminUserStatusApi,
} from '../../services/adminApi';
import { AdminUsersStatsCards } from './AdminUsersStatsCards';
import { AdminUsersTable } from './AdminUsersTable';
import { AdminUserDetailsModal } from './AdminUserDetailsModal';
import { AdminEditUserModal, AdminConfirmStatusModal } from './AdminUserActionModals';

/**
 * Module complet de gestion des utilisateurs dans le BackOffice de Vicky-Shop.
 * Orchestre les cartes statistiques réelles, la recherche serveur, la pagination,
 * les filtres, la fiche détaillée et les actions administratives sécurisées.
 */
export const AdminUsersTab = ({ formatPrice, currentAdminId }) => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0, limit: 10 });

  // Filtres
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [verifiedFilter, setVerifiedFilter] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');

  // États de chargement et feedback
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [feedback, setFeedback] = useState(null);

  // Modales
  const [selectedUserDetails, setSelectedUserDetails] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [statusTargetUser, setStatusTargetUser] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const showNotification = (msg, type = 'success') => {
    setFeedback({ msg, type });
    setTimeout(() => setFeedback(null), 4000);
  };

  // Chargement des KPIs
  const loadStats = useCallback(async () => {
    try {
      setLoadingStats(true);
      const res = await fetchAdminUserStats();
      setStats(res);
    } catch (err) {
      console.warn('Erreur chargement KPIs utilisateurs :', err.message);
    } finally {
      setLoadingStats(false);
    }
  }, []);

  // Chargement des Utilisateurs paginés
  const loadUsers = useCallback(
    async (pageToLoad = 1) => {
      try {
        setLoadingUsers(true);
        const res = await fetchAdminUsers({
          page: pageToLoad,
          limit: 10,
          search: search.trim(),
          role: roleFilter,
          status: statusFilter,
          verified: verifiedFilter,
          sortBy,
          sortOrder: 'desc',
        });

        if (res && res.users) {
          setUsers(res.users);
          if (res.pagination) setPagination(res.pagination);
        } else if (Array.isArray(res)) {
          setUsers(res);
        }
      } catch (err) {
        showNotification(err.message || 'Erreur lors du chargement des utilisateurs.', 'error');
      } finally {
        setLoadingUsers(false);
      }
    },
    [search, roleFilter, statusFilter, verifiedFilter, sortBy]
  );

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadUsers(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [loadUsers]);

  // Ouverture fiche détail
  const handleViewDetails = async (userId) => {
    try {
      setActionLoading(true);
      const details = await fetchAdminUserDetails(userId);
      setSelectedUserDetails(details);
    } catch (err) {
      showNotification(err.message || 'Impossible de charger la fiche utilisateur.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Sauvegarde modification utilisateur
  const handleSaveUser = async (userId, data) => {
    try {
      setActionLoading(true);
      await updateAdminUserApi(userId, data);
      showNotification('Compte utilisateur mis à jour avec succès.');
      setEditingUser(null);
      loadUsers(pagination.page);
      loadStats();
    } catch (err) {
      showNotification(err.message || 'Erreur lors de la modification.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Confirmation changement de statut
  const handleConfirmStatus = async (userId, targetStatus, reason) => {
    try {
      setActionLoading(true);
      await updateAdminUserStatusApi(userId, targetStatus, reason);
      showNotification(`Compte passé au statut : ${targetStatus}.`);
      setStatusTargetUser(null);
      loadUsers(pagination.page);
      loadStats();
    } catch (err) {
      showNotification(err.message || 'Erreur lors de la mise à jour du statut.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="admin-tab-content admin-users-module">
      {/* En-tête de la page */}
      <div className="admin-page-header">
        <div>
          <h2 className="admin-page-title">Gestion des utilisateurs</h2>
          <p className="admin-page-desc">
            Consultez, recherchez, filtrez et gérez les comptes réels de la plateforme Vicky-Shop.
          </p>
        </div>
        <button
          type="button"
          className="admin-btn admin-btn-secondary admin-btn-sm"
          onClick={() => {
            loadStats();
            loadUsers(pagination.page);
            showNotification('Données utilisateurs actualisées.');
          }}
          disabled={loadingUsers || loadingStats}
        >
          <i className={`fa-solid ${loadingUsers ? 'fa-spinner fa-spin' : 'fa-rotate'}`}></i>
          <span>{loadingUsers ? 'Actualisation...' : 'Actualiser'}</span>
        </button>
      </div>

      {/* Message de notification / feedback */}
      {feedback && (
        <div className={`admin-alert ${feedback.type === 'error' ? 'admin-alert-danger' : 'admin-alert-success'}`}>
          <i className={`fa-solid ${feedback.type === 'error' ? 'fa-circle-exclamation' : 'fa-circle-check'}`}></i>
          <span>{feedback.msg}</span>
        </div>
      )}

      {/* 1. Cartes statistiques réelles en haut de page */}
      <AdminUsersStatsCards stats={stats} loading={loadingStats} />

      {/* 2. Barre de recherche, filtres et tri */}
      <div className="admin-users-filters-bar">
        <div className="admin-search-input-wrap">
          <i className="fa-solid fa-magnifying-glass"></i>
          <input
            type="text"
            placeholder="Rechercher par nom, email, téléphone ou ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="admin-input"
          />
          {search && (
            <button type="button" className="admin-search-clear" onClick={() => setSearch('')}>
              <i className="fa-solid fa-xmark"></i>
            </button>
          )}
        </div>

        <div className="admin-users-filter-controls">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="admin-input admin-select"
            aria-label="Filtrer par rôle"
          >
            <option value="all">Tous les rôles</option>
            <option value="client">Clients uniquement</option>
            <option value="vendeur">Vendeurs Marketplace</option>
            <option value="admin">Administrateurs</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="admin-input admin-select"
            aria-label="Filtrer par statut"
          >
            <option value="all">Tous les statuts</option>
            <option value="actif">Comptes Actifs</option>
            <option value="suspendu">Comptes Suspendus</option>
            <option value="desactive">Comptes Désactivés</option>
          </select>

          <select
            value={verifiedFilter}
            onChange={(e) => setVerifiedFilter(e.target.value)}
            className="admin-input admin-select"
            aria-label="Filtrer par vérification"
          >
            <option value="all">Vérification : Toutes</option>
            <option value="verified">Vérifiés (Email / Tél)</option>
            <option value="unverified">Non vérifiés</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="admin-input admin-select"
            aria-label="Trier par"
          >
            <option value="createdAt">Plus récents d&apos;abord</option>
            <option value="name">Nom alphabétique</option>
            <option value="lastLogin">Dernière connexion</option>
          </select>
        </div>
      </div>

      {/* 3. Tableau détaillé et liste mobile */}
      <AdminUsersTable
        users={users}
        loading={loadingUsers}
        pagination={pagination}
        onPageChange={(page) => loadUsers(page)}
        onViewDetails={handleViewDetails}
        onEditUser={(u) => setEditingUser(u)}
        onToggleStatus={(u) => setStatusTargetUser(u)}
        currentAdminId={currentAdminId}
      />

      {/* 4. Modales d'actions et de détails */}
      {selectedUserDetails && (
        <AdminUserDetailsModal
          data={selectedUserDetails}
          onClose={() => setSelectedUserDetails(null)}
          formatPrice={formatPrice}
        />
      )}

      {editingUser && (
        <AdminEditUserModal
          user={editingUser}
          currentAdminId={currentAdminId}
          onClose={() => setEditingUser(null)}
          onSave={handleSaveUser}
          loading={actionLoading}
        />
      )}

      {statusTargetUser && (
        <AdminConfirmStatusModal
          user={statusTargetUser}
          actionType={statusTargetUser.status === 'suspendu' ? 'reactivate' : 'suspend'}
          onClose={() => setStatusTargetUser(null)}
          onConfirm={handleConfirmStatus}
          loading={actionLoading}
        />
      )}
    </div>
  );
};
