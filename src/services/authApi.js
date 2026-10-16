/**
 * Service API dédié à la gestion de l'authentification et de la réinitialisation
 * sécurisée des mots de passe pour Vicky-Shop.
 */

const rawBaseUrl = (import.meta.env.VITE_URL || import.meta.env.VITE_API_URL || '/api').trim().replace(/\/+$/, '');
const API_BASE_URL = rawBaseUrl.endsWith('/api') ? rawBaseUrl : `${rawBaseUrl}/api`;

/**
 * 1. Demande l'envoi d'un lien de réinitialisation de mot de passe par email.
 * @param {string} email
 * @returns {Promise<{ message: string }>}
 */
export const requestPasswordReset = async (email) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: email.trim() }),
    });

    const json = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(json.message || 'Impossible de traiter la demande pour le moment.');
    }

    return {
      message: json.message || 'Si un compte correspond à cette adresse, vous recevrez un email de récupération.',
    };
  } catch (error) {
    console.error('[authApi] Erreur requestPasswordReset :', error);
    throw error;
  }
};

/**
 * 2. Vérifie la validité et la non-expiration d'un jeton de réinitialisation.
 * @param {string} token
 * @returns {Promise<{ valid: boolean, maskedEmail?: string, name?: string }>}
 */
export const verifyPasswordResetToken = async (token) => {
  try {
    if (!token) {
      throw new Error('Jeton de réinitialisation manquant.');
    }

    const response = await fetch(`${API_BASE_URL}/auth/verify-reset-token/${encodeURIComponent(token)}`);
    const json = await response.json().catch(() => ({}));

    if (!response.ok) {
      const error = new Error(json.message || 'Ce lien de récupération est invalide ou a expiré.');
      error.code = json.code || 'TOKEN_INVALID';
      throw error;
    }

    return {
      valid: true,
      maskedEmail: json.data?.maskedEmail || '',
      name: json.data?.name || '',
    };
  } catch (error) {
    console.error('[authApi] Erreur verifyPasswordResetToken :', error);
    throw error;
  }
};

/**
 * 3. Enregistre le nouveau mot de passe avec le jeton vérifié.
 * @param {Object} params
 * @param {string} params.token
 * @param {string} params.newPassword
 * @param {string} params.confirmPassword
 * @returns {Promise<{ status: string, message: string }>}
 */
export const submitPasswordReset = async ({ token, newPassword, confirmPassword }) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        token,
        newPassword,
        confirmPassword,
      }),
    });

    const json = await response.json().catch(() => ({}));

    if (!response.ok) {
      const error = new Error(json.message || 'Échec lors de la réinitialisation de votre mot de passe.');
      error.code = json.code;
      throw error;
    }

    return {
      status: 'success',
      message: json.message || 'Votre mot de passe a été réinitialisé avec succès.',
    };
  } catch (error) {
    console.error('[authApi] Erreur submitPasswordReset :', error);
    throw error;
  }
};
