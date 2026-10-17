import React, { useState, useEffect, useMemo } from 'react';
import { formatPrice } from '../../services/api';
import { useToast } from '../../context/ToastContext';

/**
 * Calcule l'URL publique canonique d'un produit.
 */
export const getProductCanonicalUrl = (product) => {
  if (!product) return typeof window !== 'undefined' ? window.location.origin : '';
  const identifier = product.slug || product._id || product.id;
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://vickyshop.vercel.app';
  return `${origin}/produit/${identifier}`;
};

/**
 * Modale de partage responsive et accessible pour les produits Vicky-Shop.
 * Intègre le partage avec image réelle attachée pour WhatsApp et réseaux sociaux.
 */
export const ProductShareModal = ({ isOpen, onClose, product }) => {
  const { addToast } = useToast();
  const [copied, setCopied] = useState(false);
  const [sharingWithPhoto, setSharingWithPhoto] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setCopied(false);
      setSharingWithPhoto(false);
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

  const productTitle = product.title || 'Article Vicky-Shop';
  const formattedPrice = product.price ? formatPrice(product.price) : '';
  const imageUrl = product.image || 'https://res.cloudinary.com/l2wj9yzu/image/upload/v1790614748/vickyshop/products/products/aimfwyu6fenuxbipcpek.jpg';

  const shareTextWhatsApp = `🛍️ *${productTitle}*\n💰 Prix : *${formattedPrice}*\n🚚 Paiement cash à la livraison\n\n👉 Voir la photo & commander sur Vicky-Shop :\n${canonicalUrl}`;
  const encodedTextWhatsApp = encodeURIComponent(shareTextWhatsApp);
  const encodedUrl = encodeURIComponent(canonicalUrl);

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
      addToast('Lien copié !', 'Le lien de l\'article a été copié dans votre presse-papiers.', 'success');
      setTimeout(() => setCopied(false), 3000);
    } catch {
      addToast('Erreur de copie', 'Impossible de copier automatiquement le lien.', 'warning');
    }
  };

  /**
   * Partage haute fidélité avec pièce jointe photo réelle pour WhatsApp mobile
   */
  const handleShareWithPhoto = async () => {
    setSharingWithPhoto(true);
    try {
      let imageFile = null;

      // Téléchargement du blob image pour attachement natif
      try {
        const res = await fetch(imageUrl, { mode: 'cors' });
        if (res.ok) {
          const blob = await res.blob();
          const ext = blob.type.includes('png') ? 'png' : 'jpg';
          imageFile = new File([blob], `article-vickyshop.${ext}`, { type: blob.type || 'image/jpeg' });
        }
      } catch (fetchErr) {
        console.warn('Impossible de récupérer l\'image en Blob local:', fetchErr);
      }

      // Si le navigateur mobile supporte l'envoi de fichier image
      if (imageFile && navigator.canShare && navigator.canShare({ files: [imageFile] })) {
        await navigator.share({
          title: productTitle,
          text: `🛍️ ${productTitle} (${formattedPrice})\n👉 Commandez ici : ${canonicalUrl}`,
          files: [imageFile],
        });
        addToast('Partagé !', 'L\'article avec sa photo a été envoyé avec succès.', 'success');
        onClose();
        return;
      }

      // Fallback partage natif sans fichier si non supporté
      if (navigator.share) {
        await navigator.share({
          title: productTitle,
          text: `🛍️ ${productTitle} (${formattedPrice})\n👉 Voir la photo et commander :`,
          url: canonicalUrl,
        });
        onClose();
        return;
      }

      // Si desktop sans API Share : ouverture directe de WhatsApp Web
      window.open(`https://api.whatsapp.com/send?text=${encodedTextWhatsApp}`, '_blank', 'noopener,noreferrer');
    } catch (err) {
      if (err.name !== 'AbortError') {
        window.open(`https://api.whatsapp.com/send?text=${encodedTextWhatsApp}`, '_blank', 'noopener,noreferrer');
      }
    } finally {
      setSharingWithPhoto(false);
    }
  };

  const shareChannels = [
    {
      name: 'WhatsApp',
      icon: 'fa-brands fa-whatsapp',
      className: 'share-btn-whatsapp',
      action: () => window.open(`https://api.whatsapp.com/send?text=${encodedTextWhatsApp}`, '_blank', 'noopener,noreferrer'),
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
      action: () => window.open(`https://t.me/share/url?url=${encodedUrl}&text=${encodeURIComponent(`🛍️ ${productTitle} (${formattedPrice}) sur Vicky-Shop`)}`, '_blank', 'noopener,noreferrer'),
    },
    {
      name: 'Twitter / X',
      icon: 'fa-brands fa-x-twitter',
      className: 'share-btn-twitter',
      action: () => window.open(`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodeURIComponent(`🛍️ Découvrez « ${productTitle} » (${formattedPrice}) sur Vicky-Shop`)}`, '_blank', 'noopener,noreferrer'),
    },
  ];

  return (
    <div className="modal-overlay share-modal-backdrop" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="share-modal-title">
      <div className="modal-box share-modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="share-modal-header">
          <div className="share-header-left">
            <div className="share-header-icon">
              <i className="fa-solid fa-share-nodes"></i>
            </div>
            <div>
              <h3 id="share-modal-title" className="share-modal-title">Partager cet article</h3>
              <p className="share-modal-subtitle">La photo et le prix accompagneront automatiquement votre lien</p>
            </div>
          </div>
          <button type="button" className="share-modal-close" onClick={onClose} aria-label="Fermer">
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        {/* Aperçu en direct de la vignette sociale avec Photo Haute Définition */}
        <div className="share-product-preview-card">
          <img src={imageUrl} alt={productTitle} className="share-preview-thumb" />
          <div className="share-preview-details">
            <span className="share-preview-badge">{product.category || 'Article'}</span>
            <strong className="share-preview-title">{productTitle}</strong>
            <span className="share-preview-price">{formattedPrice}</span>
            <small style={{ color: 'var(--text-muted)', fontSize: '0.74rem', marginTop: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <i className="fa-solid fa-image" style={{ color: 'var(--accent-gold)' }}></i>
              <span>Vignette photo active pour WhatsApp &amp; réseaux</span>
            </small>
          </div>
        </div>

        {/* Bouton Majeur : Partager avec la photo sur WhatsApp / Mobile */}
        <button
          type="button"
          className="btn btn-primary share-native-btn"
          onClick={handleShareWithPhoto}
          disabled={sharingWithPhoto}
          style={{ width: '100%', marginBottom: '1rem', padding: '0.8rem', background: '#25D366', borderColor: '#25D366', color: '#fff' }}
        >
          {sharingWithPhoto ? (
            <>
              <i className="fa-solid fa-spinner fa-spin"></i> Préparation de l&apos;image...
            </>
          ) : (
            <>
              <i className="fa-brands fa-whatsapp" style={{ fontSize: '1.2rem' }}></i>
              <span>Partager avec la photo sur WhatsApp</span>
            </>
          )}
        </button>

        {/* Barre de copie rapide */}
        <div className="share-copy-box">
          <input type="text" readOnly value={canonicalUrl} className="share-copy-input" onClick={(e) => e.target.select()} aria-label="Lien canonique du produit" />
          <button type="button" className={`btn ${copied ? 'btn-success' : 'btn-primary'} share-copy-btn`} onClick={handleCopyLink}>
            <i className={copied ? 'fa-solid fa-check' : 'fa-solid fa-copy'}></i>
            <span>{copied ? 'Copié !' : 'Copier'}</span>
          </button>
        </div>

        {/* Grille des réseaux sociaux */}
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
