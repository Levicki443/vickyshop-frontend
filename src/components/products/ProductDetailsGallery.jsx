import React, { useState } from 'react';
import { ProductImageLightbox } from './ProductImageLightbox';
import { useModalHistory } from '../../hooks/useModalHistory';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600';

/**
 * Sous-composant modulaire pour la galerie photo du produit.
 * Gère l'affichage principal, les miniatures et la visionneuse haute définition (Lightbox/Zoom).
 */
export const ProductDetailsGallery = ({
  images = [],
  selectedImageIndex,
  onSelectImageIndex,
  productTitle,
  discountPercent,
  isOutOfStock,
}) => {
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  // Fermeture automatique de la visionneuse plein écran lors d'un retour arrière sur smartphone
  useModalHistory(isLightboxOpen, () => setIsLightboxOpen(false), 'product-lightbox');

  return (
    <div className="details-gallery-section">
      <div
        className="main-image-display motion-lift"
        onClick={() => setIsLightboxOpen(true)}
        title="Cliquez pour agrandir l&apos;image et zoomer"
      >
        <img
          key={selectedImageIndex}
          src={images[selectedImageIndex] || FALLBACK_IMAGE}
          alt={productTitle}
          className="main-gallery-img"
          style={{ animation: 'scaleIn 0.3s var(--ease-out-expo)' }}
          onError={(e) => {
            e.currentTarget.src = FALLBACK_IMAGE;
          }}
        />
        {discountPercent && <span className="details-badge-discount motion-badge-bump">-{discountPercent}%</span>}
        {isOutOfStock && (
          <div className="details-stock-overlay">
            <span>Rupture de stock</span>
          </div>
        )}

        {/* Badge invitant au zoom plein écran */}
        <div className="zoom-hint-badge motion-press">
          <i className="fa-solid fa-magnifying-glass-plus"></i>
          <span>Agrandir</span>
        </div>

        {images.length > 1 && (
          <>
            <button
              type="button"
              className="gallery-nav-btn btn-prev motion-press"
              onClick={(e) => {
                e.stopPropagation();
                onSelectImageIndex((selectedImageIndex - 1 + images.length) % images.length);
              }}
              aria-label="Précédent"
            >
              <i className="fa-solid fa-chevron-left"></i>
            </button>
            <button
              type="button"
              className="gallery-nav-btn btn-next motion-press"
              onClick={(e) => {
                e.stopPropagation();
                onSelectImageIndex((selectedImageIndex + 1) % images.length);
              }}
              aria-label="Suivant"
            >
              <i className="fa-solid fa-chevron-right"></i>
            </button>
          </>
        )}
      </div>

      {images.length > 1 && (
        <div className="gallery-thumbnails-row stagger-cascade">
          {images.map((img, idx) => (
            <button
              key={idx}
              type="button"
              className={`thumb-btn motion-press ${selectedImageIndex === idx ? 'active' : ''}`}
              onClick={() => onSelectImageIndex(idx)}
              aria-label={`Miniature ${idx + 1}`}
            >
              <img
                src={img}
                alt={`${productTitle} ${idx + 1}`}
                onError={(e) => {
                  e.currentTarget.src = FALLBACK_IMAGE;
                }}
              />
            </button>
          ))}
        </div>
      )}

      {/* Visionneuse haute définition en plein écran */}
      <ProductImageLightbox
        isOpen={isLightboxOpen}
        onClose={() => setIsLightboxOpen(false)}
        images={images}
        currentIndex={selectedImageIndex}
        onSelectIndex={onSelectImageIndex}
        productTitle={productTitle}
      />
    </div>
  );
};

export default ProductDetailsGallery;
