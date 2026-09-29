import React from 'react';

/**
 * Page d'erreur 404 affichee si un utilisateur essaie d'acceder directement a /admin, /dashboard
 * ou toute URL non autorisee directement dans la barre d'adresse.
 */
export const NotFound404 = ({ onReturnHome }) => {
  const handleHomeClick = () => {
    if (onReturnHome) {
      onReturnHome();
    } else {
      window.history.pushState({}, '', '/');
      window.location.reload();
    }
  };

  return (
    <div className="not-found-page">
      <div className="not-found-card">
        <div className="not-found-badge">Erreur 404</div>
        <h1 className="not-found-title">Page Introuvable</h1>
        <p className="not-found-desc">
          La ressource demandee n'existe pas, a ete deplacee ou son acces direct est restreint.
        </p>
        <button
          type="button"
          className="btn btn-primary not-found-btn"
          onClick={handleHomeClick}
        >
          <i className="fa-solid fa-arrow-left"></i>
          <span>Retour a l'accueil de la boutique</span>
        </button>
      </div>
    </div>
  );
};
