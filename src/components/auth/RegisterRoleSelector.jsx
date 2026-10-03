import React from 'react';
import { ROLES, isSellerRole } from '../../utils/roleUtils';

/**
 * Sélecteur visuel interactif de Rôle lors de l'inscription (Client / Vendeur Pro).
 */
export const RegisterRoleSelector = ({
  selectedRole,
  onSelectRole,
  shopName,
  shopDescription,
  onChange,
}) => {
  const isSeller = isSellerRole(selectedRole);

  return (
    <div className="role-selector-wrapper">
      <div className="form-group role-selector-group">
        <label className="role-selector-label">Je souhaite m&apos;inscrire en tant que : *</label>
        <div className="role-buttons-container">
          <button
            type="button"
            className={`role-choice-btn ${!isSeller ? 'active' : ''}`}
            onClick={() => onSelectRole(ROLES.CLIENT)}
          >
            <div className="role-radio-indicator">
              <i className={`fa-${!isSeller ? 'solid fa-circle-dot' : 'regular fa-circle'}`}></i>
            </div>
            <div className="role-icon-badge">
              <i className="fa-solid fa-bag-shopping"></i>
            </div>
            <div className="role-choice-text">
              <strong>Client</strong>
              <small>Acheter des articles</small>
            </div>
          </button>

          <button
            type="button"
            className={`role-choice-btn ${isSeller ? 'active' : ''}`}
            onClick={() => onSelectRole(ROLES.VENDEUR)}
          >
            <div className="role-radio-indicator">
              <i className={`fa-${isSeller ? 'solid fa-circle-dot' : 'regular fa-circle'}`}></i>
            </div>
            <div className="role-icon-badge">
              <i className="fa-solid fa-store"></i>
            </div>
            <div className="role-choice-text">
              <strong>Vendeur Pro</strong>
              <small>Vendre sur Vicky-Shop</small>
            </div>
          </button>
        </div>
      </div>

      {isSeller && (
        <div className="seller-specific-fields animate-fade-in">
          <div className="form-group">
            <label htmlFor="reg-shop-name">Nom Commercial de votre Boutique *</label>
            <input
              type="text"
              id="reg-shop-name"
              name="shopName"
              className="form-input"
              placeholder="Ex : Mode &amp; Élégance Abidjan"
              required
              value={shopName}
              onChange={onChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="reg-shop-desc">Brève description de la boutique</label>
            <input
              type="text"
              id="reg-shop-desc"
              name="shopDescription"
              className="form-input"
              placeholder="Ex : Vêtements tendance et accessoires chic"
              value={shopDescription}
              onChange={onChange}
            />
          </div>
        </div>
      )}
    </div>
  );
};
