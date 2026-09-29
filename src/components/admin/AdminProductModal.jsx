import React, { useState, useEffect, useRef } from 'react';
import { createProductApi, updateProductApi, uploadProductImageApi } from '../../services/adminApi';

const AVAILABLE_CATEGORIES = [
  { id: 'vetements', label: 'Vêtements & Prêt-à-porter' },
  { id: 'chapeaux', label: 'Chapeaux & Casquettes' },
  { id: 'hightech', label: 'High-Tech & Gadgets' },
  { id: 'accessoires', label: 'Accessoires de Mode' },
  { id: 'flash', label: 'Vente Flash' },
  { id: 'robes', label: 'Robes & Tenues Soirée' },
  { id: 'costumes', label: 'Costumes & Blazers' },
];

const PRESET_COLORS = [
  'Noir', 'Blanc', 'Gris', 'Bleu Marine', 'Rouge', 'Bordeaux', 'Beige', 'Doré', 'Kaki', 'Marron'
];

const PRESET_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', 'Unique', '38', '40', '42', '44'];

/**
 * Modale complète de publication et d'édition de produits avec Cloudinary & Variantes.
 */
export const AdminProductModal = ({ product, isOpen, onClose, onProductSaved }) => {
  const isEditing = Boolean(product && product._id);
  const fileInputRef = useRef(null);

  // Données de base du produit
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [category, setCategory] = useState('vetements');
  const [badge, setBadge] = useState('');
  const [featured, setFeatured] = useState(false);

  // Gestion du Stock
  const [stockQuantity, setStockQuantity] = useState(10);
  const [lowStockThreshold, setLowStockThreshold] = useState(5);
  const [inStock, setInStock] = useState(true);

  // Images & Cloudinary
  const [image, setImage] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageUploadMode, setImageUploadMode] = useState('file'); // 'file' ou 'url'

  // Variantes
  const [colors, setColors] = useState([]);
  const [customColor, setCustomColor] = useState('');
  const [sizes, setSizes] = useState([]);
  const [customSize, setCustomSize] = useState('');

  // États de soumission
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (product) {
      setTitle(product.title || '');
      setDescription(product.description || '');
      setPrice(product.price !== undefined ? product.price : '');
      setOriginalPrice(product.originalPrice !== undefined && product.originalPrice !== null ? product.originalPrice : '');
      setCategory(product.category || 'vetements');
      setImage(product.image || '');
      setBadge(product.badge || '');
      setFeatured(Boolean(product.featured));
      setStockQuantity(typeof product.stockQuantity === 'number' ? product.stockQuantity : 10);
      setLowStockThreshold(typeof product.lowStockThreshold === 'number' ? product.lowStockThreshold : 5);
      setInStock(product.inStock !== false);
      setColors(Array.isArray(product.colors) ? product.colors : []);
      setSizes(Array.isArray(product.sizes) ? product.sizes : []);
      setImageUploadMode(product.image ? 'url' : 'file');
    } else {
      setTitle('');
      setDescription('');
      setPrice('');
      setOriginalPrice('');
      setCategory('vetements');
      setImage('');
      setBadge('');
      setFeatured(false);
      setStockQuantity(10);
      setLowStockThreshold(5);
      setInStock(true);
      setColors([]);
      setSizes([]);
      setImageUploadMode('file');
    }
    setError(null);
  }, [product, isOpen]);

  if (!isOpen) return null;

  // Téléversement direct de fichier vers Cloudinary
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setUploadingImage(true);

    try {
      const uploadResult = await uploadProductImageApi(file);
      if (uploadResult?.url || uploadResult?.secure_url) {
        setImage(uploadResult.secure_url || uploadResult.url);
      }
    } catch (err) {
      setError(err.message || 'Échec du téléversement sur Cloudinary. Vous pouvez aussi coller une URL d\'image.');
    } finally {
      setUploadingImage(false);
    }
  };

  // Gestion des couleurs
  const handleToggleColor = (colorName) => {
    setColors((prev) =>
      prev.includes(colorName) ? prev.filter((c) => c !== colorName) : [...prev, colorName]
    );
  };

  const handleAddCustomColor = (e) => {
    e.preventDefault();
    if (customColor.trim() && !colors.includes(customColor.trim())) {
      setColors((prev) => [...prev, customColor.trim()]);
      setCustomColor('');
    }
  };

  // Gestion des tailles
  const handleToggleSize = (sizeName) => {
    setSizes((prev) =>
      prev.includes(sizeName) ? prev.filter((s) => s !== sizeName) : [...prev, sizeName]
    );
  };

  const handleAddCustomSize = (e) => {
    e.preventDefault();
    if (customSize.trim() && !sizes.includes(customSize.trim())) {
      setSizes((prev) => [...prev, customSize.trim()]);
      setCustomSize('');
    }
  };

  // Soumission du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError('Le titre du produit est obligatoire.');
      return;
    }
    if (!price || Number(price) <= 0) {
      setError('Veuillez renseigner un prix de vente valide supérieur à 0.');
      return;
    }
    if (!image.trim()) {
      setError('L\'image du produit est obligatoire. Téléversez un fichier via Cloudinary ou saisissez une URL.');
      return;
    }

    setSaving(true);

    const payload = {
      title: title.trim(),
      description: description.trim(),
      price: Number(price),
      originalPrice: originalPrice ? Number(originalPrice) : null,
      category: category.toLowerCase().trim(),
      image: image.trim(),
      badge: badge || null,
      featured: Boolean(featured),
      stockQuantity: Number(stockQuantity),
      lowStockThreshold: Number(lowStockThreshold),
      inStock: inStock && Number(stockQuantity) > 0,
      colors,
      sizes,
    };

    try {
      let saved;
      if (isEditing) {
        saved = await updateProductApi(product._id, payload);
      } else {
        saved = await createProductApi(payload);
      }

      if (onProductSaved) {
        onProductSaved(saved, isEditing);
      }
      onClose();
    } catch (err) {
      setError(err.message || 'Erreur lors de l\'enregistrement du produit.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div
        className="admin-modal-container admin-modal-lg"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
      >
        {/* EN-TÊTE MODALE */}
        <div className="admin-modal-header">
          <div className="admin-modal-title-wrap">
            <div className="admin-security-icon">
              <i className={`fa-solid fa-${isEditing ? 'pen-to-square' : 'plus'}`}></i>
            </div>
            <div>
              <h3 className="admin-modal-title">
                {isEditing ? 'Modifier le Produit' : 'Publier un Nouveau Produit'}
              </h3>
              <p className="admin-modal-subtitle">
                {isEditing ? `ID : ${product._id}` : 'Le produit sera visible en temps réel sur la boutique publique'}
              </p>
            </div>
          </div>
          <button
            type="button"
            className="admin-modal-close"
            onClick={onClose}
            aria-label="Fermer"
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        {error && (
          <div className="admin-alert admin-alert-danger">
            <i className="fa-solid fa-circle-exclamation"></i>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="admin-form">
          <div className="admin-form-grid">
            
            {/* 1. INFORMATIONS GÉNÉRALES */}
            <div className="admin-form-group full-width">
              <label htmlFor="product-title">Titre & Nom du produit *</label>
              <input
                id="product-title"
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex : Pulle Chic en Laine avec Col Roulé"
                className="admin-input"
              />
            </div>

            <div className="admin-form-group">
              <label htmlFor="product-category">Catégorie *</label>
              <select
                id="product-category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="admin-select"
                required
              >
                {AVAILABLE_CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="admin-form-group">
              <label htmlFor="product-badge">Badge Promotionnel (Optionnel)</label>
              <select
                id="product-badge"
                value={badge}
                onChange={(e) => setBadge(e.target.value)}
                className="admin-select"
              >
                <option value="">Aucun badge</option>
                <option value="Nouveau">Nouveau</option>
                <option value="Promo">Promo</option>
                <option value="Vente Flash">Vente Flash</option>
                <option value="Populaire">Populaire</option>
                <option value="Coup de Cœur">Coup de Cœur</option>
              </select>
            </div>

            {/* 2. PRIX & PROMOTIONS */}
            <div className="admin-form-group">
              <label htmlFor="product-price">Prix de vente (FCFA) *</label>
              <input
                id="product-price"
                type="number"
                required
                min="0"
                step="500"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="Ex : 25000"
                className="admin-input"
              />
            </div>

            <div className="admin-form-group">
              <label htmlFor="product-original-price">Prix d'origine / barré (FCFA)</label>
              <input
                id="product-original-price"
                type="number"
                min="0"
                step="500"
                value={originalPrice}
                onChange={(e) => setOriginalPrice(e.target.value)}
                placeholder="Ex : 35000 (Pour afficher une réduction)"
                className="admin-input"
              />
              {price && originalPrice && Number(originalPrice) > Number(price) && (
                <small className="form-hint" style={{ color: '#10b981', fontWeight: 600 }}>
                  🏷️ Remise calculée : -{Math.round(((Number(originalPrice) - Number(price)) / Number(originalPrice)) * 100)}%
                </small>
              )}
            </div>

            {/* 3. GESTION DES STOCKS */}
            <div className="admin-form-group">
              <label htmlFor="product-stock">Quantité en stock *</label>
              <input
                id="product-stock"
                type="number"
                required
                min="0"
                value={stockQuantity}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setStockQuantity(val);
                  if (val <= 0) setInStock(false);
                }}
                className="admin-input"
              />
              <small className="form-hint">
                {stockQuantity === 0 ? (
                  <span className="text-danger">⚠️ Rupture de stock automatique</span>
                ) : stockQuantity <= lowStockThreshold ? (
                  <span className="text-warning">⚠️ Alerte Stock Faible (≤ {lowStockThreshold})</span>
                ) : (
                  <span className="text-success">✓ Stock disponible</span>
                )}
              </small>
            </div>

            <div className="admin-form-group">
              <label htmlFor="product-low-stock-threshold">Seuil d'alerte stock faible</label>
              <input
                id="product-low-stock-threshold"
                type="number"
                min="1"
                max="50"
                value={lowStockThreshold}
                onChange={(e) => setLowStockThreshold(Number(e.target.value))}
                className="admin-input"
              />
            </div>

            {/* 4. IMAGE & CLOUDINARY UPLOAD */}
            <div className="admin-form-group full-width">
              <label>Image du produit (Cloudinary) *</label>

              <div className="cloudinary-upload-tabs">
                <button
                  type="button"
                  className={`upload-mode-btn ${imageUploadMode === 'file' ? 'active' : ''}`}
                  onClick={() => setImageUploadMode('file')}
                >
                  <i className="fa-solid fa-cloud-arrow-up"></i> Importer un fichier (Cloudinary)
                </button>
                <button
                  type="button"
                  className={`upload-mode-btn ${imageUploadMode === 'url' ? 'active' : ''}`}
                  onClick={() => setImageUploadMode('url')}
                >
                  <i className="fa-solid fa-link"></i> Lien URL direct
                </button>
              </div>

              {imageUploadMode === 'file' ? (
                <div className="cloudinary-dropzone" onClick={() => fileInputRef.current?.click()}>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    style={{ display: 'none' }}
                  />
                  {uploadingImage ? (
                    <div className="upload-loading-state">
                      <i className="fa-solid fa-spinner fa-spin"></i>
                      <span>Optimisation et téléversement sur Cloudinary en cours...</span>
                    </div>
                  ) : (
                    <div className="dropzone-prompt">
                      <i className="fa-solid fa-image"></i>
                      <strong>Cliquez pour sélectionner une photo depuis votre appareil</strong>
                      <small>JPG, PNG, WebP acceptés (compression automatique WebP sur Cloudinary)</small>
                    </div>
                  )}
                </div>
              ) : (
                <input
                  type="text"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  placeholder="https://res.cloudinary.com/... ou https://..."
                  className="admin-input"
                />
              )}

              {/* Prévisualisation de l'image */}
              {image && (
                <div className="image-preview-box">
                  <img src={image} alt="Aperçu produit" className="product-form-preview-thumb" />
                  <div className="image-preview-info">
                    <strong>Aperçu de l'image sélectionnée</strong>
                    <span className="image-url-truncate">{image}</span>
                    <button
                      type="button"
                      className="btn-remove-preview"
                      onClick={() => setImage('')}
                    >
                      <i className="fa-solid fa-trash"></i> Retirer l'image
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* 5. VARIANTES DE COULEURS */}
            <div className="admin-form-group full-width">
              <label>Variantes de Couleurs (Optionnel)</label>
              <div className="variant-chips-wrap">
                {PRESET_COLORS.map((col) => (
                  <button
                    key={col}
                    type="button"
                    className={`variant-chip ${colors.includes(col) ? 'selected' : ''}`}
                    onClick={() => handleToggleColor(col)}
                  >
                    {col}
                    {colors.includes(col) && <i className="fa-solid fa-check"></i>}
                  </button>
                ))}
              </div>

              <div className="custom-variant-add-row">
                <input
                  type="text"
                  placeholder="Ajouter une couleur personnalisée (Ex : Doré Métallisé)..."
                  value={customColor}
                  onChange={(e) => setCustomColor(e.target.value)}
                  className="admin-input admin-input-sm"
                />
                <button
                  type="button"
                  className="admin-btn admin-btn-secondary admin-btn-sm"
                  onClick={handleAddCustomColor}
                >
                  <i className="fa-solid fa-plus"></i> Ajouter
                </button>
              </div>
            </div>

            {/* 6. VARIANTES DE TAILLES */}
            <div className="admin-form-group full-width">
              <label>Tailles disponibles (Optionnel)</label>
              <div className="variant-chips-wrap">
                {PRESET_SIZES.map((sz) => (
                  <button
                    key={sz}
                    type="button"
                    className={`variant-chip ${sizes.includes(sz) ? 'selected' : ''}`}
                    onClick={() => handleToggleSize(sz)}
                  >
                    {sz}
                    {sizes.includes(sz) && <i className="fa-solid fa-check"></i>}
                  </button>
                ))}
              </div>

              <div className="custom-variant-add-row">
                <input
                  type="text"
                  placeholder="Ajouter une taille personnalisée (Ex : 46, XL/XXL)..."
                  value={customSize}
                  onChange={(e) => setCustomSize(e.target.value)}
                  className="admin-input admin-input-sm"
                />
                <button
                  type="button"
                  className="admin-btn admin-btn-secondary admin-btn-sm"
                  onClick={handleAddCustomSize}
                >
                  <i className="fa-solid fa-plus"></i> Ajouter
                </button>
              </div>
            </div>

            {/* 7. DESCRIPTION DÉTAILLÉE */}
            <div className="admin-form-group full-width">
              <label htmlFor="product-desc">Description & Caractéristiques du produit *</label>
              <textarea
                id="product-desc"
                rows="4"
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Décrivez les matières, la coupe, les finitions et les conseils d'entretien..."
                className="admin-textarea"
              ></textarea>
            </div>

            {/* 8. OPTIONS AVANCÉES */}
            <div className="admin-form-group full-width admin-checkbox-group">
              <label className="admin-checkbox-label">
                <input
                  type="checkbox"
                  checked={inStock}
                  onChange={(e) => setInStock(e.target.checked)}
                />
                <span>Produit disponible à la vente (En stock)</span>
              </label>

              <label className="admin-checkbox-label">
                <input
                  type="checkbox"
                  checked={featured}
                  onChange={(e) => setFeatured(e.target.checked)}
                />
                <span>Mettre en avant sur la page d'accueil (Produit Vedette)</span>
              </label>
            </div>

          </div>

          {/* PIED DE MODALE & ACTIONS */}
          <div className="admin-modal-footer">
            <button
              type="button"
              className="admin-btn admin-btn-secondary"
              onClick={onClose}
              disabled={saving}
            >
              Annuler
            </button>

            <button
              type="submit"
              className="admin-btn admin-btn-primary"
              disabled={saving || uploadingImage}
            >
              {saving ? (
                <>
                  <i className="fa-solid fa-spinner fa-spin"></i>
                  <span>Enregistrement & Diffusion...</span>
                </>
              ) : (
                <>
                  <i className="fa-solid fa-cloud-arrow-up"></i>
                  <span>{isEditing ? 'Enregistrer les Modifications' : 'Publier le Produit'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
