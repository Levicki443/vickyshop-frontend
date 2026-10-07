import React, { useState } from 'react';

/**
 * Composant réutilisable pour l'affichage et la sélection d'étoiles (⭐ 1 à 5).
 * Prend en charge les demi-étoiles en affichage statique et les micro-animations au survol en mode interactif.
 */
export const StarRating = ({
  rating = 5,
  interactive = false,
  onRatingChange = () => {},
  size = 'md',
  showValue = false,
}) => {
  const [hoverRating, setHoverRating] = useState(0);

  const starSizes = {
    sm: '0.82rem',
    md: '1rem',
    lg: '1.75rem',
  };

  const fontSize = starSizes[size] || starSizes.md;

  const currentVal = hoverRating || rating;

  return (
    <div
      className="star-rating-container"
      style={{ display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}
      aria-label={`Note : ${rating} sur 5 étoiles`}
    >
      {[1, 2, 3, 4, 5].map((starIndex) => {
        const isFilled = currentVal >= starIndex;
        const isHalf = !isFilled && currentVal >= starIndex - 0.5;

        if (interactive) {
          return (
            <button
              key={starIndex}
              type="button"
              className={`star-interactive-btn ${isFilled ? 'active' : ''}`}
              style={{ fontSize, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
              onMouseEnter={() => setHoverRating(starIndex)}
              onMouseLeave={() => setHoverRating(0)}
              onClick={() => onRatingChange(starIndex)}
              aria-label={`Donner une note de ${starIndex} étoile${starIndex > 1 ? 's' : ''}`}
            >
              <i className={isFilled ? 'fa-solid fa-star' : 'fa-regular fa-star'}></i>
            </button>
          );
        }

        return (
          <span
            key={starIndex}
            style={{
              fontSize,
              color: isFilled || isHalf ? 'var(--accent-gold)' : 'var(--text-muted)',
              display: 'inline-flex',
            }}
          >
            <i
              className={
                isFilled
                  ? 'fa-solid fa-star'
                  : isHalf
                  ? 'fa-solid fa-star-half-stroke'
                  : 'fa-regular fa-star'
              }
            ></i>
          </span>
        );
      })}

      {showValue && (
        <strong style={{ marginLeft: '0.4rem', fontSize, color: 'var(--text-primary)' }}>
          {Number(rating).toFixed(1)}
        </strong>
      )}
    </div>
  );
};

export default StarRating;
