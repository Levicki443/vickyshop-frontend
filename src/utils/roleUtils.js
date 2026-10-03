/**
 * Utilitaires de gestion et de détection des rôles utilisateurs côté Frontend.
 * Garantit la cohérence stricte avec les rôles canoniques du Backend ('client', 'vendeur', 'admin').
 */

export const ROLES = Object.freeze({
  CLIENT: 'client',
  VENDEUR: 'vendeur',
  ADMIN: 'admin',
});

/**
 * Normalise toute variante de rôle vers la convention officielle.
 *
 * @param {string} rawRole
 * @param {string} defaultRole
 * @returns {string}
 */
export const normalizeRole = (rawRole, defaultRole = ROLES.CLIENT) => {
  if (!rawRole || typeof rawRole !== 'string') {
    return defaultRole;
  }

  const cleaned = rawRole.trim().toLowerCase();

  switch (cleaned) {
    case 'vendeur':
    case 'vendeurs':
    case 'seller':
    case 'sellers':
    case 'merchant':
    case 'marchand':
      return ROLES.VENDEUR;

    case 'admin':
    case 'administrator':
    case 'administrateur':
      return ROLES.ADMIN;

    case 'client':
    case 'clients':
    case 'customer':
    case 'customers':
    case 'user':
    case 'acheteur':
      return ROLES.CLIENT;

    default:
      return defaultRole;
  }
};

/**
 * Détermine si le rôle correspond à un Vendeur.
 * @param {string} role
 * @returns {boolean}
 */
export const isSellerRole = (role) => {
  return normalizeRole(role, null) === ROLES.VENDEUR;
};

/**
 * Détermine si le rôle correspond à un Client.
 * @param {string} role
 * @returns {boolean}
 */
export const isClientRole = (role) => {
  return normalizeRole(role, null) === ROLES.CLIENT;
};

/**
 * Détermine si le rôle correspond à un Administrateur.
 * @param {string} role
 * @returns {boolean}
 */
export const isAdminRole = (role) => {
  return normalizeRole(role, null) === ROLES.ADMIN;
};

/**
 * Retourne le libellé français affiché dans l'interface utilisateur.
 * @param {string} role
 * @returns {string}
 */
export const getRoleDisplayName = (role) => {
  const norm = normalizeRole(role);
  if (norm === ROLES.VENDEUR) return 'Vendeur Partenaire';
  if (norm === ROLES.ADMIN) return 'Administrateur';
  return 'Client';
};

/**
 * Retourne la classe CSS de badge pour le rôle.
 * @param {string} role
 * @returns {string}
 */
export const getRoleBadgeClass = (role) => {
  const norm = normalizeRole(role);
  if (norm === ROLES.VENDEUR) return 'role-seller';
  if (norm === ROLES.ADMIN) return 'role-admin';
  return 'role-customer';
};

/**
 * Retourne l'icône FontAwesome associée au rôle.
 * @param {string} role
 * @returns {string}
 */
export const getRoleIcon = (role) => {
  const norm = normalizeRole(role);
  if (norm === ROLES.VENDEUR) return 'fa-solid fa-store';
  if (norm === ROLES.ADMIN) return 'fa-solid fa-shield';
  return 'fa-solid fa-user';
};
