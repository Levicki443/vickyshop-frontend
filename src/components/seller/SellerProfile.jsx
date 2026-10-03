import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { fetchSellerProfile, updateSellerProfile } from '../../services/sellerApi';

export const SellerProfile = () => {
  const { token, user } = useAuth();
  const { addToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [shopForm, setShopForm] = useState({
    shopName: '',
    shopDescription: '',
    shopPhone: '',
    shopAddress: '',
  });

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      try {
        const shop = await fetchSellerProfile(token);
        setShopForm({
          shopName: shop.shopName || user?.shopName || '',
          shopDescription: shop.shopDescription || user?.shopDescription || '',
          shopPhone: shop.shopPhone || user?.shopPhone || user?.phone || '',
          shopAddress: shop.shopAddress || user?.shopAddress || user?.address || '',
        });
      } catch (err) {
        console.warn('Erreur chargement profil boutique :', err);
      } finally {
        setLoading(false);
      }
    };

    if (token) loadProfile();
  }, [token, user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setShopForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!shopForm.shopName.trim()) {
      addToast('Nom requis', 'Le nom de la boutique ne peut pas être vide.', 'error');
      return;
    }

    setSaving(true);
    try {
      await updateSellerProfile(shopForm, token);
      addToast('Boutique mise à jour', 'Vos informations de vendeur ont été enregistrées avec succès.', 'success');
    } catch (err) {
      addToast('Erreur', err.message || 'Impossible de mettre à jour la boutique.', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="seller-table-loading">
        <i className="fa-solid fa-spinner fa-spin"></i>
        <span>Chargement des paramètres de votre boutique...</span>
      </div>
    );
  }

  return (
    <div className="seller-profile-section">
      <div className="seller-section-header-bar">
        <div>
          <h3 className="seller-section-title">Paramètres de ma Boutique</h3>
          <p className="seller-section-desc">
            Personnalisez les coordonnées et l&apos;identité publique de votre espace vendeur.
          </p>
        </div>
      </div>

      <div className="seller-profile-card">
        <form onSubmit={handleSubmit} className="seller-profile-form">
          <div className="form-group">
            <label htmlFor="shop-name">Nom Commercial de la Boutique *</label>
            <input
              type="text"
              id="shop-name"
              name="shopName"
              className="form-input"
              required
              value={shopForm.shopName}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="shop-phone">Téléphone WhatsApp Commercial *</label>
            <input
              type="tel"
              id="shop-phone"
              name="shopPhone"
              className="form-input"
              required
              value={shopForm.shopPhone}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="shop-addr">Adresse / Localisation de la Boutique</label>
            <input
              type="text"
              id="shop-addr"
              name="shopAddress"
              className="form-input"
              placeholder="Ex : Treichville Boulevard de Marseille, Magasin N°12"
              value={shopForm.shopAddress}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="shop-desc">Présentation &amp; Description de la boutique</label>
            <textarea
              id="shop-desc"
              name="shopDescription"
              rows="4"
              className="form-input"
              placeholder="Décrivez vos types d'articles, vos spécialités, votre style..."
              value={shopForm.shopDescription}
              onChange={handleChange}
            />
          </div>

          <div className="seller-profile-actions">
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? (
                <>
                  <i className="fa-solid fa-spinner fa-spin"></i> Enregistrement...
                </>
              ) : (
                <>
                  <i className="fa-solid fa-floppy-disk"></i> Enregistrer les paramètres
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
