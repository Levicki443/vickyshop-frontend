import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { createSellerProduct, updateSellerProduct } from '../../services/sellerApi';
import { SellerProductImageUpload } from './SellerProductImageUpload';

const CATEGORIES = [
  { id: 'robes', label: 'Robes' }, { id: 'pantalons', label: 'Pantalons & Ensembles' },
  { id: 'chemises', label: 'Chemises & Hauts' }, { id: 'combinaisons', label: 'Combinaisons' },
  { id: 'accessoires', label: 'Accessoires & Chapeaux' }, { id: 'chaussures', label: 'Chaussures & Escarpins' },
  { id: 'costumes', label: 'Costumes & Vestes' }, { id: 'hightech', label: 'High-Tech & Gadgets' },
];

export const SellerProductModal = ({ isOpen, onClose, productToEdit, onSaved }) => {
  const { token } = useAuth();
  const { addToast } = useToast();
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    title: '', category: 'robes', subCategory: '', brand: '', reference: '',
    price: '', originalPrice: '', stockQuantity: 10, lowStockThreshold: 5,
    image: '', description: '', badge: 'Nouveau', isActive: true,
    sizesStr: 'S, M, L, XL', colorsStr: 'Noir, Blanc, Beige',
  });

  useEffect(() => {
    if (productToEdit) {
      setFormData({
        title: productToEdit.title || '',
        category: productToEdit.category || 'robes',
        subCategory: productToEdit.subCategory || '',
        brand: productToEdit.brand || '',
        reference: productToEdit.reference || '',
        price: productToEdit.price || '',
        originalPrice: productToEdit.originalPrice || '',
        stockQuantity: productToEdit.stockQuantity !== undefined ? productToEdit.stockQuantity : 10,
        lowStockThreshold: productToEdit.lowStockThreshold || 5,
        image: productToEdit.image || '',
        description: productToEdit.description || '',
        badge: productToEdit.badge || '',
        isActive: productToEdit.isActive !== false,
        sizesStr: Array.isArray(productToEdit.sizes) ? productToEdit.sizes.join(', ') : 'S, M, L',
        colorsStr: Array.isArray(productToEdit.colors) ? productToEdit.colors.join(', ') : 'Noir, Blanc',
      });
    } else {
      setFormData({
        title: '', category: 'robes', subCategory: '', brand: '',
        reference: `REF-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
        price: '', originalPrice: '', stockQuantity: 10, lowStockThreshold: 5,
        image: '', description: '', badge: 'Nouveau', isActive: true,
        sizesStr: 'S, M, L, XL', colorsStr: 'Noir, Blanc, Beige',
      });
    }
  }, [productToEdit, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleImageChange = (newImage) => setFormData((prev) => ({ ...prev, image: newImage }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return addToast('Titre requis', 'Veuillez saisir un nom pour votre article.', 'error');
    if (!formData.price || Number(formData.price) <= 0) return addToast('Prix requis', 'Veuillez indiquer un prix valide.', 'error');
    if (!formData.image.trim()) return addToast('Image requise', 'Veuillez importer une photo depuis votre galerie.', 'error');

    setSaving(true);
    try {
      const payload = {
        title: formData.title.trim(),
        category: formData.category.toLowerCase().trim(),
        subCategory: formData.subCategory.trim(),
        brand: formData.brand.trim() || 'Générique',
        reference: formData.reference.trim(),
        price: Number(formData.price),
        originalPrice: formData.originalPrice ? Number(formData.originalPrice) : null,
        stockQuantity: Number(formData.stockQuantity) || 0,
        lowStockThreshold: Number(formData.lowStockThreshold) || 5,
        image: formData.image.trim(),
        description: formData.description.trim(),
        badge: formData.badge || null,
        isActive: formData.isActive,
        sizes: formData.sizesStr.split(',').map((s) => s.trim()).filter(Boolean),
        colors: formData.colorsStr.split(',').map((c) => c.trim()).filter(Boolean),
      };

      if (productToEdit) {
        await updateSellerProduct(productToEdit._id || productToEdit.id, payload, token);
        addToast('Produit mis à jour', `"${payload.title}" a été modifié avec succès.`, 'success');
      } else {
        await createSellerProduct(payload, token);
        addToast('Produit ajouté', `"${payload.title}" a été publié dans votre catalogue.`, 'success');
      }
      onSaved();
      onClose();
    } catch (err) {
      addToast('Erreur', err.message || 'Impossible d\'enregistrer le produit.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="seller-modal-overlay animate-fade-in" onClick={onClose}>
      <div className="seller-modal-box animate-scale-up" onClick={(e) => e.stopPropagation()}>
        {/* En-tête Fixe */}
        <div className="seller-modal-header">
          <div className="seller-modal-header-info">
            <div className="seller-modal-icon-badge">
              <i className={`fa-solid ${productToEdit ? 'fa-pen-to-square' : 'fa-plus'}`}></i>
            </div>
            <div>
              <h3 className="seller-modal-title">{productToEdit ? 'Modifier l\'Article' : 'Ajouter un Produit à ma Boutique'}</h3>
              <p className="seller-modal-subtitle">Renseignez les détails et photos depuis votre galerie pour publier l&apos;article.</p>
            </div>
          </div>
          <button type="button" className="seller-modal-close-btn" onClick={onClose} aria-label="Fermer">
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        {/* Corps Scrollable du Formulaire */}
        <form id="seller-product-form" onSubmit={handleSubmit} className="seller-modal-form-wrap">
          <div className="seller-modal-body">
            {/* Section 1 : Identité du produit */}
            <div className="seller-form-card">
              <div className="seller-form-card-title"><i className="fa-solid fa-tag text-primary"></i> <span>Informations Principales</span></div>
              <div className="form-row">
                <div className="form-group flex-2">
                  <label htmlFor="prod-title">Nom de l&apos;article *</label>
                  <input type="text" id="prod-title" name="title" className="form-input" placeholder="Ex : Robe de Soirée Satinée Fendue" required value={formData.title} onChange={handleChange} />
                </div>
                <div className="form-group flex-1">
                  <label htmlFor="prod-ref">Référence / Code</label>
                  <input type="text" id="prod-ref" name="reference" className="form-input" placeholder="Ex : REF-7890" value={formData.reference} onChange={handleChange} />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group flex-1">
                  <label htmlFor="prod-cat">Catégorie *</label>
                  <select id="prod-cat" name="category" className="form-input" value={formData.category} onChange={handleChange}>
                    {CATEGORIES.map((cat) => <option key={cat.id} value={cat.id}>{cat.label}</option>)}
                  </select>
                </div>
                <div className="form-group flex-1">
                  <label htmlFor="prod-brand">Marque / Confectionneur</label>
                  <input type="text" id="prod-brand" name="brand" className="form-input" placeholder="Ex : Vicky Style" value={formData.brand} onChange={handleChange} />
                </div>
              </div>
            </div>

            {/* Section 2 : Tarification & Inventaire */}
            <div className="seller-form-card">
              <div className="seller-form-card-title"><i className="fa-solid fa-coins text-primary"></i> <span>Tarification &amp; Inventaire</span></div>
              <div className="form-row">
                <div className="form-group flex-1">
                  <label htmlFor="prod-price">Prix de Vente (FCFA) *</label>
                  <input type="number" id="prod-price" name="price" className="form-input" placeholder="Ex : 15000" required min="0" value={formData.price} onChange={handleChange} />
                </div>
                <div className="form-group flex-1">
                  <label htmlFor="prod-orig-price">Prix Promo / Barré (FCFA)</label>
                  <input type="number" id="prod-orig-price" name="originalPrice" className="form-input" placeholder="Ex : 20000" min="0" value={formData.originalPrice} onChange={handleChange} />
                </div>
                <div className="form-group flex-1">
                  <label htmlFor="prod-stock">Stock disponible *</label>
                  <input type="number" id="prod-stock" name="stockQuantity" className="form-input" required min="0" value={formData.stockQuantity} onChange={handleChange} />
                </div>
              </div>
            </div>

            {/* Section 3 : Photo & Galerie */}
            <div className="seller-form-card">
              <SellerProductImageUpload image={formData.image} onChange={handleImageChange} disabled={saving} />
            </div>

            {/* Section 4 : Variantes & Description */}
            <div className="seller-form-card">
              <div className="seller-form-card-title"><i className="fa-solid fa-layer-group text-primary"></i> <span>Variantes &amp; Description</span></div>
              <div className="form-row">
                <div className="form-group flex-1">
                  <label htmlFor="prod-sizes">Tailles (séparées par virgules)</label>
                  <input type="text" id="prod-sizes" name="sizesStr" className="form-input" placeholder="S, M, L, XL" value={formData.sizesStr} onChange={handleChange} />
                </div>
                <div className="form-group flex-1">
                  <label htmlFor="prod-colors">Couleurs (séparées par virgules)</label>
                  <input type="text" id="prod-colors" name="colorsStr" className="form-input" placeholder="Noir, Blanc, Rouge" value={formData.colorsStr} onChange={handleChange} />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="prod-desc">Description de l&apos;article</label>
                <textarea id="prod-desc" name="description" rows="3" className="form-input" placeholder="Détails, matière, coupe..." value={formData.description} onChange={handleChange} />
              </div>

              <div className="seller-form-toggle-row">
                <input type="checkbox" id="prod-active" name="isActive" checked={formData.isActive} onChange={handleChange} className="seller-switch-checkbox" />
                <label htmlFor="prod-active" className="cursor-pointer mb-0">
                  <strong>Produit actif</strong> — Rendre visible et achetable immédiatement sur la boutique
                </label>
              </div>
            </div>
          </div>

          {/* Pied de Page Fixe */}
          <div className="seller-modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={saving}>Annuler</button>
            <button type="submit" className="btn btn-primary seller-submit-btn" disabled={saving}>
              {saving ? <><i className="fa-solid fa-spinner fa-spin"></i> Publication...</> : <><i className="fa-solid fa-check"></i> {productToEdit ? 'Enregistrer les modifications' : 'Publier l\'article'}</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SellerProductModal;
