import React from 'react';

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
}) => {
  return (
    <div className="products-toolbar">
      {/* Barre de recherche */}
      <div className="search-box">
        <i className="fa-solid fa-magnifying-glass search-icon"></i>
        <input
          type="text"
          id="product-search"
          placeholder="Rechercher un habit, un téléphone, une montre..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
        {searchTerm && (
          <button
            type="button"
            className="clear-search-btn"
            onClick={() => onSearchChange('')}
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
            onClick={() => onCategoryChange(cat.id)}
          >
            <i className={cat.icon}></i> {cat.label}
            {cat.id === 'all' && totalCount !== undefined && (
              <span className="filter-count"> ({totalCount})</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};
