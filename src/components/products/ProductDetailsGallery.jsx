import React, { useState } from 'react';
import { ProductImageLightbox } from './ProductImageLightbox';

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

  return (
    <div className="details-gallery-section">
      <div
        className="main-image-display"
        onClick={() => setIsLightboxOpen(true)}
        title="Cliquez pour agrandir l'image et zoomer"
      >
        <img
          src={images[selectedImageIndex] || FALLBACK_IMAGE}
          alt={productTitle}
          className="main-gallery-img"
          onError={(e) => {
            e.currentTarget.src = FALLBACK_IMAGE;
          }}
        />
        {discountPercent && <span className="details-badge-discount">-{discountPercent}%</span>}
        {isOutOfStock && (
          <div className="details-stock-overlay">
            <span>Rupture de stock</span>
          </div>
        )}

        {/* Badge invitant au zoom plein écran */}
        <div className="zoom-hint-badge">
          <i className="fa-solid fa-magnifying-glass-plus"></i>
          <span>Agrandir</span>
        </div>

        {images.length > 1 && (
          <>
            <button
              type="button"
              className="gallery-nav-btn btn-prev"
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
              className="gallery-nav-btn btn-next"
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
        <div className="gallery-thumbnails-row">
          {images.map((img, idx) => (
            <button
              key={idx}
              type="button"
              className={`thumb-btn ${selectedImageIndex === idx ? 'active' : ''}`}
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
