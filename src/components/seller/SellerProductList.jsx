import React, { useState, useMemo } from 'react';
import { formatPrice } from '../../services/api';
import { deleteSellerProduct } from '../../services/sellerApi';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export const SellerProductList = ({ products, loading, onRefresh, onEditProduct, onOpenCreate }) => {
  const { token } = useAuth();
  const { addToast } = useToast();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all'); // 'all' | 'active' | 'inactive' | 'out_of_stock'
  const [sortBy, setSortBy] = useState('recent'); // 'recent' | 'price_asc' | 'price_desc'
  const [deletingProduct, setDeletingProduct] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        const matchCat = selectedCategory === 'all' || p.category.toLowerCase() === selectedCategory.toLowerCase();
        const matchSearch =
          !search.trim() ||
          p.title.toLowerCase().includes(search.toLowerCase()) ||
          (p.reference && p.reference.toLowerCase().includes(search.toLowerCase())) ||
          (p.brand && p.brand.toLowerCase().includes(search.toLowerCase()));

        let matchStatus = true;
        if (selectedStatus === 'active') matchStatus = p.isActive !== false && p.stockQuantity > 0;
        if (selectedStatus === 'inactive') matchStatus = p.isActive === false;
        if (selectedStatus === 'out_of_stock') matchStatus = p.stockQuantity <= 0;

        return matchCat && matchSearch && matchStatus;
      })
      .sort((a, b) => {
        if (sortBy === 'price_asc') return a.price - b.price;
        if (sortBy === 'price_desc') return b.price - a.price;
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
  }, [products, search, selectedCategory, selectedStatus, sortBy]);

  const confirmDelete = async () => {
    if (!deletingProduct) return;
    setIsDeleting(true);
    try {
      await deleteSellerProduct(deletingProduct._id || deletingProduct.id, token);
      addToast('Produit supprimé', `"${deletingProduct.title}" a été supprimé de votre boutique.`, 'success');
      setDeletingProduct(null);
      onRefresh();
    } catch (err) {
      addToast('Erreur', err.message || 'Impossible de supprimer l\'article.', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="seller-products-section">
      <div className="seller-section-header-bar">
        <div>
          <h3 className="seller-section-title">Mes Produits en Vente</h3>
          <p className="seller-section-desc">Gérez votre inventaire, vos prix, références et visibilités.</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={onOpenCreate}>
          <i className="fa-solid fa-plus"></i>
          <span>Ajouter un Produit</span>
        </button>
      </div>

      <div className="seller-filters-bar flex-wrap">
        <div className="search-input-wrapper">
          <i className="fa-solid fa-magnifying-glass"></i>
          <input
            type="text"
            className="form-input"
            placeholder="Rechercher par nom, marque, référence..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button type="button" className="clear-search-btn" onClick={() => setSearch('')}>
              <i className="fa-solid fa-xmark"></i>
            </button>
          )}
        </div>

        <div className="category-select-wrapper">
          <select className="form-input" value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
            <option value="all">Toutes les catégories</option>
            <option value="robes">Robes</option>
            <option value="pantalons">Pantalons</option>
            <option value="chemises">Chemises</option>
            <option value="combinaisons">Combinaisons</option>
            <option value="accessoires">Accessoires</option>
            <option value="chaussures">Chaussures</option>
            <option value="costumes">Costumes</option>
            <option value="hightech">High-Tech</option>
          </select>
        </div>

        <div className="category-select-wrapper">
          <select className="form-input" value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}>
            <option value="all">Tous les statuts</option>
            <option value="active">Actifs (En vente)</option>
            <option value="out_of_stock">En rupture de stock</option>
            <option value="inactive">Désactivés</option>
          </select>
        </div>

        <div className="category-select-wrapper">
          <select className="form-input" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="recent">Plus récents d&apos;abord</option>
            <option value="price_asc">Prix croissant</option>
            <option value="price_desc">Prix décroissant</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="seller-table-loading">
          <i className="fa-solid fa-spinner fa-spin"></i>
          <span>Chargement de votre catalogue...</span>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="seller-empty-state">
          <i className="fa-solid fa-box-open empty-icon"></i>
          <h4>Aucun article trouvé</h4>
          <p>Aucun produit ne correspond à vos filtres actuels.</p>
          <button type="button" className="btn btn-primary btn-sm" onClick={onOpenCreate}>
            <i className="fa-solid fa-plus"></i> Publier un produit
          </button>
        </div>
      ) : (
        <div className="seller-table-container">
          <table className="seller-table">
            <thead>
              <tr>
                <th>Article</th>
                <th>Réf / Marque</th>
                <th>Prix</th>
                <th>Stock</th>
                <th>Statut</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((p) => {
                const isLow = p.stockQuantity > 0 && p.stockQuantity <= (p.lowStockThreshold || 5);
                const isOut = p.stockQuantity <= 0;
                return (
                  <tr key={p._id || p.id}>
                    <td>
                      <div className="seller-product-cell">
                        <img src={p.image} alt={p.title} className="seller-product-thumb" />
                        <div className="seller-product-info">
                          <strong>{p.title}</strong>
                          <small className="text-muted">{p.category}</small>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div>
                        <strong>{p.reference || 'N/A'}</strong>
                        <div className="text-xs text-muted">{p.brand || 'Générique'}</div>
                      </div>
                    </td>
                    <td>
                      <div className="seller-price-cell">
                        <strong>{formatPrice(p.price)}</strong>
                        {p.originalPrice && <del>{formatPrice(p.originalPrice)}</del>}
                      </div>
                    </td>
                    <td>
                      <span className={`stock-number ${isOut ? 'text-danger font-weight-bold' : isLow ? 'text-warning' : 'text-success'}`}>
                        {p.stockQuantity} unité{p.stockQuantity > 1 ? 's' : ''}
                      </span>
                    </td>
                    <td>
                      {isOut ? (
                        <span className="badge-status-danger">Rupture de stock</span>
                      ) : p.isActive === false ? (
                        <span className="badge-status-neutral">Inactif</span>
                      ) : isLow ? (
                        <span className="badge-status-warning">Stock faible</span>
                      ) : (
                        <span className="badge-status-success">Actif en vente</span>
                      )}
                    </td>
                    <td className="text-right">
                      <div className="seller-actions-group">
                        <button type="button" className="seller-action-btn edit-btn" title="Modifier" onClick={() => onEditProduct(p)}>
                          <i className="fa-solid fa-pen"></i>
                        </button>
                        <button type="button" className="seller-action-btn delete-btn" title="Supprimer" onClick={() => setDeletingProduct(p)}>
                          <i className="fa-solid fa-trash-can"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modale de Confirmation de Suppression */}
      {deletingProduct && (
        <div className="modal-overlay" onClick={() => setDeletingProduct(null)}>
          <div className="modal-box modal-confirm-box" onClick={(e) => e.stopPropagation()}>
            <div className="confirm-icon text-danger"><i className="fa-solid fa-triangle-exclamation"></i></div>
            <h4>Confirmer la suppression ?</h4>
            <p>Êtes-vous sûr de vouloir supprimer définitivement <strong>&laquo; {deletingProduct.title} &raquo;</strong> ? Cette action est irréversible.</p>
            <div className="d-flex justify-content-end gap-2 mt-4">
              <button type="button" className="btn btn-secondary" onClick={() => setDeletingProduct(null)} disabled={isDeleting}>Annuler</button>
              <button type="button" className="btn btn-danger" onClick={confirmDelete} disabled={isDeleting}>
                {isDeleting ? <><i className="fa-solid fa-spinner fa-spin"></i> Suppression...</> : 'Oui, supprimer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
