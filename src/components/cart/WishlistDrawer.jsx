import React from 'react';
import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';
import { formatPrice } from '../../services/api';
import { useToast } from '../../context/ToastContext';

export const WishlistDrawer = () => {
  const { wishlist, isWishlistOpen, closeWishlist, removeFromWishlist, clearWishlist } = useWishlist();
  const { addToCart, openCart } = useCart();
  const { addToast } = useToast();

  if (!isWishlistOpen) return null;

  const handleAddToCart = (product) => {
    addToCart({
      id: product.id || product._id,
      _id: product._id || product.id,
      title: product.title,
      price: product.price,
      image: product.image,
    });
    addToast('Article ajouté !', `${product.title} a été ajouté à votre panier.`, 'success');
  };

  const handleAddAllToCart = () => {
    if (wishlist.length === 0) return;
    wishlist.forEach((item) => {
      addToCart({
        id: item.id || item._id,
        _id: item._id || item.id,
        title: item.title,
        price: item.price,
        image: item.image,
      });
    });
    addToast('Favoris transférés !', 'Tous vos articles favoris ont été ajoutés au panier.', 'success');
    closeWishlist();
    openCart();
  };

  return (
    <div className="drawer-overlay" onClick={closeWishlist}>
      <div className="cart-drawer wishlist-drawer" onClick={(e) => e.stopPropagation()}>
        <div className="drawer-header">
          <h3>
            <i className="fa-solid fa-heart" style={{ color: 'var(--accent-red, #e11d48)' }}></i> Vos Favoris (
            {wishlist.length})
          </h3>
          <button
            type="button"
            className="drawer-close"
            onClick={closeWishlist}
            aria-label="Fermer les favoris"
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        <div className="drawer-body">
          {wishlist.length === 0 ? (
            <div className="empty-cart">
              <i className="fa-regular fa-heart empty-icon" style={{ color: 'var(--text-muted)' }}></i>
              <h4>Aucun coup de cœur pour le moment</h4>
              <p>Explorez notre collection et cliquez sur le cœur pour retrouver facilement vos articles préférés plus tard.</p>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  closeWishlist();
                  const target = document.getElementById('produits');
                  if (target) target.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                <i className="fa-solid fa-bag-shopping"></i> Découvrir les produits
              </button>
            </div>
          ) : (
            <div className="cart-items-list">
              {wishlist.map((item) => (
                <div key={item.id || item._id} className="cart-item-card">
                  <div className="cart-item-img-wrap">
                    <img
                      src={item.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300'}
                      alt={item.title}
                      className="cart-item-img"
                    />
                  </div>
                  <div className="cart-item-info">
                    <div className="cart-item-header">
                      <h4 className="cart-item-title">{item.title}</h4>
                      <button
                        type="button"
                        className="item-remove-btn"
                        onClick={() => removeFromWishlist(item.id || item._id)}
                        title="Retirer des favoris"
                        aria-label="Supprimer des favoris"
                      >
                        <i className="fa-regular fa-trash-can"></i>
                      </button>
                    </div>
                    <div className="cart-item-price-unit">
                      <strong>{formatPrice(item.price)}</strong>
                    </div>
                    <div style={{ marginTop: '0.6rem' }}>
                      <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        style={{ width: '100%', fontSize: '0.82rem', padding: '0.45rem 0.75rem' }}
                        onClick={() => handleAddToCart(item)}
                      >
                        <i className="fa-solid fa-cart-plus"></i> Ajouter au panier
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {wishlist.length > 0 && (
          <div className="drawer-footer">
            <button
              type="button"
              className="btn btn-primary btn-block btn-lg"
              onClick={handleAddAllToCart}
            >
              <i className="fa-solid fa-cart-shopping"></i> Tout ajouter au panier
            </button>
            <button
              type="button"
              className="btn btn-outline btn-block"
              style={{ marginTop: '0.5rem' }}
              onClick={clearWishlist}
            >
              <i className="fa-solid fa-trash"></i> Vider mes favoris
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
