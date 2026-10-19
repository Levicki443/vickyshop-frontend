import React, { useState, useEffect } from 'react';

const CATEGORIES = [
  { id: 'all', label: 'Tous', icon: 'fa-solid fa-layer-group' },
  { id: 'vetements', label: 'Vêtements', icon: 'fa-solid fa-shirt' },
  { id: 'chapeaux', label: 'Chapeaux & Pulls', icon: 'fa-solid fa-hat-cowboy' },
  { id: 'hightech', label: 'High-Tech', icon: 'fa-solid fa-laptop' },
  { id: 'accessoires', label: 'Accessoires', icon: 'fa-solid fa-glasses' },
];

export const ProductFilters = ({
  activeCategory,
  onCategoryChange,
  searchTerm,
  onSearchChange,
  totalCount,
  loading = false,
}) => {
  const [localSearch, setLocalSearch] = useState(searchTerm || '');

  // Synchronisation si les filtres sont réinitialisés depuis l'extérieur
  useEffect(() => {
    setLocalSearch(searchTerm || '');
  }, [searchTerm]);

  // Débouncing doux (180ms) pour éviter les re-rendus massifs lors de la frappe
  useEffect(() => {
    const handler = setTimeout(() => {
      if (localSearch !== searchTerm) {
        onSearchChange(localSearch);
      }
    }, 180);

    return () => clearTimeout(handler);
  }, [localSearch, onSearchChange, searchTerm]);

  const handleCategorySelect = (id) => {
    if ('vibrate' in navigator) {
      try {
        navigator.vibrate(8);
      } catch (_) {}
    }
    onCategoryChange(id);
  };

  const handleClearSearch = () => {
    setLocalSearch('');
    onSearchChange('');
  };

  return (
    <div className="products-toolbar">
      {/* Barre de recherche avec temporisation intelligente */}
      <div className="search-box">
        <i className="fa-solid fa-magnifying-glass search-icon"></i>
        <input
          type="text"
          id="product-search"
          placeholder="Rechercher un habit, un téléphone, une montre..."
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
        />
        {localSearch && (
          <button
            type="button"
            className="clear-search-btn motion-press"
            onClick={handleClearSearch}
            title="Effacer la recherche"
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        )}
      </div>

      {/* Onglets de catégories */}
      <div className="filter-tabs">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            type="button"
            className={`filter-btn ${activeCategory === cat.id ? 'active' : ''}`}
            onClick={() => handleCategorySelect(cat.id)}
          >
            <i className={cat.icon}></i> {cat.label}
            {cat.id === 'all' && (
              <span className="filter-count">
                {loading ? ' (...)' : totalCount !== undefined ? ` (${totalCount})` : ''}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};
