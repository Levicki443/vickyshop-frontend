import React, { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Composant ProductImageLightbox :
 * Visionneuse d'image haute définition en plein écran avec zoom interactif,
 * glissement panoramique (pan/drag), navigation de galerie et contrôles au clavier.
 */
export const ProductImageLightbox = ({
  isOpen,
  onClose,
  images = [],
  currentIndex = 0,
  onSelectIndex,
  productTitle = 'Détail de l\'article',
}) => {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });

  // Réinitialisation du zoom et de la position lors d'un changement d'image
  useEffect(() => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  }, [currentIndex]);

  const handleNext = useCallback(() => {
    if (images.length <= 1) return;
    onSelectIndex((currentIndex + 1) % images.length);
  }, [currentIndex, images.length, onSelectIndex]);

  const handlePrev = useCallback(() => {
    if (images.length <= 1) return;
    onSelectIndex((currentIndex - 1 + images.length) % images.length);
  }, [currentIndex, images.length, onSelectIndex]);

  const handleZoomIn = () => {
    setScale((prev) => Math.min(prev + 0.5, 3.5));
  };

  const handleZoomOut = () => {
    setScale((prev) => {
      const next = Math.max(prev - 0.5, 1);
      if (next === 1) setPosition({ x: 0, y: 0 });
      return next;
    });
  };

  const handleReset = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleDoubleTap = (e) => {
    e.stopPropagation();
    if (scale > 1) {
      handleReset();
    } else {
      setScale(2.5);
    }
  };

  // Gestion des touches du clavier (Échap, Flèches)
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowRight') handleNext();
      else if (e.key === 'ArrowLeft') handlePrev();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, handleNext, handlePrev]);

  // Pan / Glisser quand l'image est zoomée (Souris et Tactile)
  const handleMouseDown = (e) => {
    if (scale <= 1) return;
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX - position.x, y: e.clientY - position.y };
  };

  const handleMouseMove = (e) => {
    if (!isDragging || scale <= 1) return;
    setPosition({
      x: e.clientX - dragStartRef.current.x,
      y: e.clientY - dragStartRef.current.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e) => {
    if (scale <= 1 || e.touches.length !== 1) return;
    setIsDragging(true);
    dragStartRef.current = {
      x: e.touches[0].clientX - position.x,
      y: e.touches[0].clientY - position.y,
    };
  };

  const handleTouchMove = (e) => {
    if (!isDragging || scale <= 1 || e.touches.length !== 1) return;
    setPosition({
      x: e.touches[0].clientX - dragStartRef.current.x,
      y: e.touches[0].clientY - dragStartRef.current.y,
    });
  };

  if (!isOpen || images.length === 0) return null;

  return (
    <div
      className="lightbox-overlay"
      onClick={onClose}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleMouseUp}
      role="dialog"
      aria-modal="true"
      aria-label="Visionneuse haute définition"
    >
      {/* En-tête */}
      <div className="lightbox-header" onClick={(e) => e.stopPropagation()}>
        <div className="lightbox-title-wrap">
          <h3 className="lightbox-product-title">{productTitle}</h3>
          <span className="lightbox-counter">
            Photo {currentIndex + 1} sur {images.length} • Zoom : {Math.round(scale * 100)}%
          </span>
        </div>

        <div className="lightbox-controls">
          <button
            type="button"
            className="lightbox-btn"
            onClick={handleZoomIn}
            title="Agrandir (+)"
            aria-label="Agrandir"
          >
            <i className="fa-solid fa-magnifying-glass-plus"></i>
          </button>
          <button
            type="button"
            className="lightbox-btn"
            onClick={handleZoomOut}
            title="Réduire (-)"
            aria-label="Réduire"
            disabled={scale <= 1}
          >
            <i className="fa-solid fa-magnifying-glass-minus"></i>
          </button>
          {scale > 1 && (
            <button
              type="button"
              className="lightbox-btn"
              onClick={handleReset}
              title="Réinitialiser (100%)"
              aria-label="Réinitialiser"
            >
              <i className="fa-solid fa-rotate-left"></i>
            </button>
          )}
          <button
            type="button"
            className="lightbox-btn lightbox-btn-close"
            onClick={onClose}
            title="Fermer (Échap)"
            aria-label="Fermer"
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>
      </div>

      {/* Scène centrale d'affichage */}
      <div className="lightbox-stage" onClick={(e) => e.stopPropagation()}>
        {images.length > 1 && (
          <button
            type="button"
            className="lightbox-nav-arrow lightbox-nav-prev"
            onClick={handlePrev}
            aria-label="Photo précédente"
          >
            <i className="fa-solid fa-chevron-left"></i>
          </button>
        )}

        <div
          className={`lightbox-image-container ${scale > 1 ? 'is-zoomed' : ''} ${isDragging ? 'is-dragging' : ''}`}
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
          }}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          onDoubleClick={handleDoubleTap}
        >
          <img
            src={images[currentIndex]}
            alt={productTitle}
            className="lightbox-image"
            draggable={false}
          />
        </div>

        {images.length > 1 && (
          <button
            type="button"
            className="lightbox-nav-arrow lightbox-nav-next"
            onClick={handleNext}
            aria-label="Photo suivante"
          >
            <i className="fa-solid fa-chevron-right"></i>
          </button>
        )}
      </div>

      {/* Barre de miniatures en bas si plus d'une photo */}
      {images.length > 1 && (
        <div className="lightbox-footer" onClick={(e) => e.stopPropagation()}>
          {images.map((img, idx) => (
            <button
              key={idx}
              type="button"
              className={`lightbox-thumb ${idx === currentIndex ? 'active' : ''}`}
              onClick={() => onSelectIndex(idx)}
              aria-label={`Voir photo ${idx + 1}`}
            >
              <img src={img} alt={`Miniature ${idx + 1}`} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductImageLightbox;
