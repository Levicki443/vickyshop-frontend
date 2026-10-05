/**
 * Utilitaires de sécurité frontend pour Vicky-Shop.
 * Échappement HTML, assainissement des entrées et validations robustes côté client.
 */

const HTML_ENTITIES = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '/': '&#x2F;',
  '`': '&#x60;',
  '=': '&#x3D;',
};

/**
 * Échappe une chaîne pour un rendu textuel sécurisé.
 * @param {string} str 
 * @returns {string}
 */
export const escapeHtml = (str) => {
  if (typeof str !== 'string') return '';
  return str.replace(/[&<>"'`=\/]/g, (s) => HTML_ENTITIES[s] || s);
};

/**
 * Nettoie une chaîne de caractères en supprimant les balises HTML et scripts potentiels.
 * @param {string} str 
 * @returns {string}
 */
export const sanitizeClientInput = (str) => {
  if (typeof str !== 'string') return '';
  return str
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]+>/g, '')
    .trim();
};

/**
 * Valide le format d'une adresse email.
 * @param {string} email 
 * @returns {boolean}
 */
export const isValidEmail = (email) => {
  if (!email || typeof email !== 'string') return false;
  return /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,})+$/.test(email.trim());
};

/**
 * Valide le format d'un numéro de téléphone (au moins 10 chiffres).
 * @param {string} phone 
 * @returns {boolean}
 */
export const isValidPhone = (phone) => {
  if (!phone || typeof phone !== 'string') return false;
  const digits = phone.replace(/\D/g, '');
  return digits.length >= 10;
};
