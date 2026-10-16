import React, { useState, useEffect, useMemo } from 'react';
import { formatPrice } from '../../services/api';
import { useToast } from '../../context/ToastContext';

/**
 * Calcule l'URL publique canonique d'un produit.
 * Utilise en priorité le slug permanent ou l'ID s'il n'est pas encore migré.
 */
export const getProductCanonicalUrl = (product) => {
  if (!product) return typeof window !== 'undefined' ? window.location.origin : '';
  const identifier = product.slug || product._id || product.id;
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://vickyshop.vercel.app';
  return `${origin}/produit/${identifier}`;
};

/**
 * Modale de partage responsive, accessible et sécurisée pour les produits Vicky-Shop.
 */
export const ProductShareModal = ({ isOpen, onClose, product }) => {
  const { addToast } = useToast();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setCopied(false);
      return;
    }
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const canonicalUrl = useMemo(() => getProductCanonicalUrl(product), [product]);

  if (!isOpen || !product) return null;

  const productTitle = product.title || 'Produit Vicky-Shop';
  const formattedPrice = product.price ? formatPrice(product.price) : '';
  const shareMessage = `Découvrez « ${productTitle} » sur Vicky-Shop ! Consultez les photos, le prix (${formattedPrice}) et tous les détails ici : ${canonicalUrl}`;
  const encodedUrl = encodeURIComponent(canonicalUrl);
  const encodedText = encodeURIComponent(shareMessage);

  const handleCopyLink = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(canonicalUrl);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = canonicalUrl;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopied(true);
      addToast('Lien copié !', 'Le lien public du produit a été copié dans votre presse-papiers.', 'success');
      setTimeout(() => setCopied(false), 3000);
    } catch {
      addToast('Erreur de copie', 'Impossible de copier automatiquement le lien.', 'warning');
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: productTitle,
          text: `Découvrez cet article sur Vicky-Shop au prix de ${formattedPrice}`,
          url: canonicalUrl,
        });
      } catch (err) {
        if (err.name !== 'AbortError') {
          handleCopyLink();
        }
      }
    } else {
      handleCopyLink();
    }
  };

  const shareChannels = [
    {
      name: 'WhatsApp',
      icon: 'fa-brands fa-whatsapp',
      className: 'share-btn-whatsapp',
      action: () => window.open(`https://api.whatsapp.com/send?text=${encodedText}`, '_blank', 'noopener,noreferrer'),
    },
    {
      name: 'Facebook',
      icon: 'fa-brands fa-facebook-f',
      className: 'share-btn-facebook',
      action: () => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`, '_blank', 'noopener,noreferrer'),
    },
    {
      name: 'Telegram',
      icon: 'fa-brands fa-telegram',
      className: 'share-btn-telegram',
      action: () => window.open(`https://t.me/share/url?url=${encodedUrl}&text=${encodeURIComponent(`Découvrez ${productTitle} sur Vicky-Shop`)}`, '_blank', 'noopener,noreferrer'),
    },
    {
      name: 'E-mail',
      icon: 'fa-solid fa-envelope',
      className: 'share-btn-email',
      action: () => {
        const subject = encodeURIComponent(`Regarde ce produit sur Vicky-Shop : ${productTitle}`);
        window.location.href = `mailto:?subject=${subject}&body=${encodedText}`;
      },
    },
  ];

  const hasNativeShare = typeof navigator !== 'undefined' && Boolean(navigator.share);

  return (
    <div className="modal-overlay share-modal-backdrop" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="share-modal-title">
      <div className="modal-box share-modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="share-modal-header">
          <div className="share-header-left">
            <div className="share-header-icon">
              <i className="fa-solid fa-share-nodes"></i>
            </div>
            <div>
              <h3 id="share-modal-title" className="share-modal-title">Partager ce produit</h3>
              <p className="share-modal-subtitle">Lien public permanent pour vos clients et réseaux</p>
            </div>
          </div>
          <button type="button" className="share-modal-close" onClick={onClose} aria-label="Fermer">
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        {/* Aperçu miniature du produit */}
        <div className="share-product-preview-card">
          <img src={product.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300'} alt={productTitle} className="share-preview-thumb" />
          <div className="share-preview-details">
            <span className="share-preview-badge">{product.category || 'Article'}</span>
            <strong className="share-preview-title">{productTitle}</strong>
            <span className="share-preview-price">{formattedPrice}</span>
          </div>
        </div>

        {/* Barre de copie rapide */}
        <div className="share-copy-box">
          <input type="text" readOnly value={canonicalUrl} className="share-copy-input" onClick={(e) => e.target.select()} aria-label="Lien canonique du produit" />
          <button type="button" className={`btn ${copied ? 'btn-success' : 'btn-primary'} share-copy-btn`} onClick={handleCopyLink}>
            <i className={copied ? 'fa-solid fa-check' : 'fa-solid fa-copy'}></i>
            <span>{copied ? 'Copié !' : 'Copier'}</span>
          </button>
        </div>

        {/* Bouton Partage Natif Mobile si supporté */}
        {hasNativeShare && (
          <button type="button" className="btn btn-secondary share-native-btn" onClick={handleNativeShare}>
            <i className="fa-solid fa-arrow-up-from-bracket"></i>
            <span>Partager via le menu natif du téléphone</span>
          </button>
        )}

        {/* Canaux de réseaux sociaux */}
        <div className="share-channels-grid">
          {shareChannels.map((ch) => (
            <button key={ch.name} type="button" className={`share-channel-btn ${ch.className}`} onClick={ch.action} title={`Partager sur ${ch.name}`}>
              <i className={ch.icon}></i>
              <span>{ch.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductShareModal;
