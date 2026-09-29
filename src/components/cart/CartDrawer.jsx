import React, { useState } from 'react';
import { useCart } from '../../context/CartContext';
import { formatPrice } from '../../services/api';
import { useToast } from '../../context/ToastContext';

export const CartDrawer = ({ onOpenCheckout }) => {
  const {
    cart,
    isCartOpen,
    closeCart,
    removeFromCart,
    updateQuantity,
    subtotal,
    discountAmount,
    shippingCost,
    total,
    appliedPromo,
    applyPromoCode,
    removePromoCode,
    freeShippingThreshold,
  } = useCart();

  const { addToast } = useToast();
  const [promoInput, setPromoInput] = useState('');

  if (!isCartOpen) return null;

  const handleApplyPromo = (e) => {
    e.preventDefault();
    if (!promoInput.trim()) return;
    const result = applyPromoCode(promoInput);
    if (result.success) {
      addToast('Code appliqué !', result.message, 'success');
      setPromoInput('');
    } else {
      addToast('Code invalide', result.message, 'error');
    }
  };

  const freeShippingProgress = Math.min(
    100,
    Math.round((subtotal / freeShippingThreshold) * 100)
  );

  const amountRemainingForFreeShipping = Math.max(
    0,
    freeShippingThreshold - subtotal
  );

  return (
    <div className="drawer-overlay" onClick={closeCart}>
      <div className="cart-drawer" onClick={(e) => e.stopPropagation()}>
        <div className="drawer-header">
          <h3>
            <i className="fa-solid fa-bag-shopping"></i> Votre Panier (
            {cart.reduce((sum, item) => sum + item.quantity, 0)})
          </h3>
          <button
            type="button"
            className="drawer-close"
            onClick={closeCart}
            aria-label="Fermer le panier"
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        {/* Barre de progression livraison gratuite */}
        <div className="free-shipping-bar">
          <div className="shipping-text">
            {amountRemainingForFreeShipping === 0 ? (
              <span className="text-success">
                <i className="fa-solid fa-gift"></i> Félicitations ! Vous bénéficiez de la <strong>livraison gratuite</strong> !
              </span>
            ) : (
              <span>
                Plus que <strong>{formatPrice(amountRemainingForFreeShipping)}</strong> pour la livraison gratuite
              </span>
            )}
          </div>
          <div className="progress-track">
            <div
              className="progress-fill"
              style={{ width: `${freeShippingProgress}%` }}
            ></div>
          </div>
        </div>

        {/* Liste des articles */}
        <div className="drawer-body">
          {cart.length === 0 ? (
            <div className="empty-cart">
              <i className="fa-solid fa-cart-arrow-down empty-icon"></i>
              <h4>Votre panier est vide</h4>
              <p>Découvrez notre sélection exclusive et faites-vous plaisir !</p>
              <button
                type="button"
                className="btn btn-primary"
                onClick={closeCart}
              >
                Explorer la boutique
              </button>
            </div>
          ) : (
            <div className="cart-items-list">
              {cart.map((item) => {
                const key = item.itemKey || item.id;
                return (
                  <div key={key} className="cart-item">
                    <img src={item.image} alt={item.title} className="cart-item-img" />
                    <div className="cart-item-details">
                      <h4 className="cart-item-title">{item.title}</h4>
                      {(item.selectedColor || item.selectedSize) && (
                        <div className="cart-item-variants" style={{ fontSize: '0.8rem', color: '#9ca3af', marginBottom: '4px' }}>
                          {item.selectedColor && (
                            <span style={{ marginRight: '8px' }}>
                              <i className="fa-solid fa-palette" style={{ fontSize: '10px' }}></i> {item.selectedColor}
                            </span>
                          )}
                          {item.selectedSize && (
                            <span>
                              <i className="fa-solid fa-ruler-horizontal" style={{ fontSize: '10px' }}></i> {item.selectedSize}
                            </span>
                          )}
                        </div>
                      )}
                      <span className="cart-item-price">{formatPrice(item.price)}</span>
                      <div className="cart-item-qty">
                        <button
                          type="button"
                          onClick={() => updateQuantity(key, item.quantity - 1)}
                        >
                          -
                        </button>
                        <span>{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(key, item.quantity + 1)}
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="btn-remove-item"
                      onClick={() => removeFromCart(key)}
                      title="Supprimer l'article"
                    >
                      <i className="fa-solid fa-trash-can"></i>
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Pied du panier avec totaux et code promo */}
        {cart.length > 0 && (
          <div className="drawer-footer">
            {/* Code Promo */}
            <form className="promo-box" onSubmit={handleApplyPromo}>
              {appliedPromo ? (
                <div className="applied-promo-tag">
                  <span>
                    <i className="fa-solid fa-tag"></i> {appliedPromo.code} ({appliedPromo.label})
                  </span>
                  <button type="button" onClick={removePromoCode} title="Retirer">
                    <i className="fa-solid fa-xmark"></i>
                  </button>
                </div>
              ) : (
                <div className="promo-input-group">
                  <input
                    type="text"
                    placeholder="Code Promo (ex: VICKY10)"
                    value={promoInput}
                    onChange={(e) => setPromoInput(e.target.value)}
                  />
                  <button type="submit" className="btn btn-secondary">
                    Appliquer
                  </button>
                </div>
              )}
            </form>

            <div className="cart-summary-line">
              <span>Sous-total</span>
              <span>{formatPrice(subtotal)}</span>
            </div>

            {discountAmount > 0 && (
              <div className="cart-summary-line text-success">
                <span>Remise appliquée</span>
                <span>-{formatPrice(discountAmount)}</span>
              </div>
            )}

            <div className="cart-summary-line">
              <span>Frais de livraison</span>
              <span>{shippingCost === 0 ? 'Gratuit' : formatPrice(shippingCost)}</span>
            </div>

            <div className="cart-summary-total">
              <span>Total à régler</span>
              <span className="total-amount">{formatPrice(total)}</span>
            </div>

            <button
              type="button"
              className="btn btn-primary btn-block checkout-btn"
              onClick={() => {
                closeCart();
                onOpenCheckout();
              }}
            >
              <span>Passer la commande</span>
              <i className="fa-solid fa-arrow-right"></i>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
