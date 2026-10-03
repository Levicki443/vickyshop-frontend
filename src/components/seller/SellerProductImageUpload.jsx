import React, { useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { uploadSellerProductImageApi } from '../../services/sellerApi';

export const SellerProductImageUpload = ({ image, onChange, disabled }) => {
  const { token } = useAuth();
  const { addToast } = useToast();
  const fileInputRef = useRef(null);

  const [uploading, setUploading] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const handleProcessFile = async (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      addToast('Format invalide', 'Veuillez sélectionner un fichier image (JPG, PNG, WEBP).', 'error');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      addToast('Image trop volumineuse', 'La taille maximale autorisée est de 10 Mo.', 'error');
      return;
    }

    setUploading(true);
    try {
      const result = await uploadSellerProductImageApi(file, token);
      if (result?.url) {
        onChange(result.url);
        addToast('Photo importée', 'L\'image a été chargée avec succès.', 'success');
      }
    } catch (err) {
      addToast('Erreur d\'importation', err.message || 'Échec du chargement de la photo.', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) handleProcessFile(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleProcessFile(file);
  };

  return (
    <div className="form-group seller-image-picker-wrap">
      <label className="d-flex justify-content-between align-items-center">
        <span>Photo du Produit *</span>
        <button
          type="button"
          className="seller-upload-mode-toggle"
          onClick={() => setShowUrlInput(!showUrlInput)}
        >
          {showUrlInput ? '← Importer depuis la galerie' : 'Ou coller une URL web'}
        </button>
      </label>

      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />

      {showUrlInput ? (
        <input
          type="text"
          id="prod-image"
          name="image"
          className="form-input"
          placeholder="https://images.unsplash.com/..."
          value={image}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled || uploading}
        />
      ) : image ? (
        <div className="seller-image-preview-card">
          <img src={image} alt="Aperçu du produit" className="seller-image-thumbnail" />
          <div className="seller-image-preview-info">
            <strong>Photo sélectionnée</strong>
            <div className="seller-image-preview-actions">
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={disabled || uploading}
              >
                <i className="fa-solid fa-camera"></i> Changer
              </button>
              <button
                type="button"
                className="btn btn-outline-danger btn-sm"
                onClick={() => onChange('')}
                disabled={disabled || uploading}
              >
                <i className="fa-solid fa-trash"></i> Supprimer
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div
          className={`seller-dropzone ${dragOver ? 'dragover' : ''}`}
          onClick={() => !uploading && !disabled && fileInputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
        >
          {uploading ? (
            <>
              <i className="fa-solid fa-spinner fa-spin seller-dropzone-icon"></i>
              <span className="seller-dropzone-title">Téléversement de la photo en cours...</span>
            </>
          ) : (
            <>
              <i className="fa-solid fa-cloud-arrow-up seller-dropzone-icon"></i>
              <span className="seller-dropzone-title">Cliquez pour choisir une photo depuis votre galerie</span>
              <span className="seller-dropzone-hint">PNG, JPG, WEBP jusqu&apos;à 10 Mo • Glisser-déposer supporté</span>
            </>
          )}
        </div>
      )}
    </div>
  );
};
