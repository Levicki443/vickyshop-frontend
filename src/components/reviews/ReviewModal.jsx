import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { submitReview } from '../../services/reviewApi';
import { StarRating } from './StarRating';

/**
 * Modale de Dépôt d'Avis & Témoignage Client.
 * Permet à tout client de laisser son expérience avec note en étoiles,
 * commentaire, et détection d'achat vérifié par numéro de commande.
 */
export const ReviewModal = ({
  isOpen,
  onClose,
  onSuccess,
  initialProduct = null,
  initialOrderNumber = '',
}) => {
  const { user, token } = useAuth();
  const { addToast } = useToast();

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [orderNumber, setOrderNumber] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setRating(5);
      setComment('');
      setCustomerName(user?.name || '');
      setOrderNumber(initialOrderNumber || '');
    }
  }, [isOpen, user, initialOrderNumber]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    const cleanName = (customerName || user?.name || '').trim();
    if (!cleanName) {
      addToast('Information requise', 'Veuillez renseigner votre nom ou prénom.', 'warning');
      return;
    }

    const cleanComment = comment.trim();
    if (cleanComment.length < 5) {
      addToast('Commentaire trop court', 'Votre avis doit contenir au moins 5 caractères.', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        rating,
        comment: cleanComment,
        customerName: cleanName,
        productId: initialProduct?._id || initialProduct?.id || null,
        orderNumber: orderNumber.trim().toUpperCase(),
      };

      const res = await submitReview(payload, token);
      addToast(
        'Témoignage envoyé !',
        res.message || 'Merci pour votre avis ! Il sera publié dès validation.',
        'success'
      );

      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      addToast('Erreur', err.message || 'Impossible d\'envoyer votre avis.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const ratingDescriptions = {
    1: 'Décevant (1/5)',
    2: 'Passable (2/5)',
    3: 'Moyen (3/5)',
    4: 'Très bien (4/5)',
    5: 'Excellent (5/5) ⭐',
  };

  return (
    <div className="review-modal-backdrop animate-fade-in" onClick={onClose}>
      <div
        className="review-modal-dialog animate-scale-up"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="review-modal-header">
          <div>
            <span className="testimonials-badge-trust">
              <i className="fa-solid fa-shield-heart"></i>
              <span>Expérience Client</span>
            </span>
            <h3>Partagez votre expérience</h3>
          </div>
          <button
            type="button"
            className="review-modal-close"
            onClick={onClose}
            aria-label="Fermer la modale"
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        {initialProduct && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              background: 'var(--bg-card)',
              padding: '0.75rem',
              borderRadius: 'var(--radius-sm)',
              marginBottom: '1.25rem',
              border: '1px solid var(--border-color)',
            }}
          >
            {initialProduct.image && (
              <img
                src={initialProduct.image}
                alt={initialProduct.title}
                style={{ width: '42px', height: '42px', borderRadius: 'var(--radius-sm)', objectFit: 'cover' }}
              />
            )}
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Avis sur l&apos;article :</span>
              <strong style={{ display: 'block', fontSize: '0.88rem', color: 'var(--text-primary)' }}>
                {initialProduct.title}
              </strong>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Note en étoiles */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.4rem' }}>
              Votre note globale :
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <StarRating
                rating={rating}
                interactive={true}
                onRatingChange={setRating}
                size="lg"
              />
              <span style={{ fontSize: '0.88rem', color: 'var(--accent-gold)', fontWeight: 700 }}>
                {ratingDescriptions[rating]}
              </span>
            </div>
          </div>

          {/* Nom du client */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
              Votre Prénom et Nom <span style={{ color: 'var(--accent-red)' }}>*</span>
            </label>
            <input
              type="text"
              className="form-input"
              style={{ width: '100%', margin: 0 }}
              placeholder="Ex: Aminata K. ou Jean-Marc D."
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              required
              maxLength={100}
            />
          </div>

          {/* Numéro de commande pour l'Achat Vérifié */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
              Numéro de Commande (Optionnel pour badge &apos;Achat vérifié&apos;)
            </label>
            <input
              type="text"
              className="form-input"
              style={{ width: '100%', margin: 0, textTransform: 'uppercase' }}
              placeholder="Ex: VK-20260928-AW1P"
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              maxLength={40}
            />
            <small style={{ color: 'var(--text-muted)', fontSize: '0.74rem', marginTop: '0.25rem', display: 'block' }}>
              Permet d&apos;apposer le badge vert « Achat Vérifié » certifiant l&apos;authenticité de votre achat.
            </small>
          </div>

          {/* Commentaire de l'avis */}
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                Votre commentaire <span style={{ color: 'var(--accent-red)' }}>*</span>
              </label>
              <span style={{ fontSize: '0.75rem', color: comment.length > 1150 ? 'var(--accent-red)' : 'var(--text-muted)' }}>
                {comment.length} / 1200
              </span>
            </div>
            <textarea
              className="form-input"
              rows={4}
              style={{ width: '100%', margin: 0, resize: 'vertical' }}
              placeholder="Décrivez votre expérience : qualité des articles, rapidité de livraison, accueil du livreur..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              required
              minLength={5}
              maxLength={1200}
            />
          </div>

          {/* Boutons d'action */}
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
            <button
              type="button"
              className="btn btn-outline"
              onClick={onClose}
              disabled={submitting}
            >
              Annuler
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
              style={{ minWidth: '160px' }}
            >
              {submitting ? (
                <>
                  <i className="fa-solid fa-spinner fa-spin"></i> Envoi en cours...
                </>
              ) : (
                <>
                  <i className="fa-solid fa-paper-plane"></i> Publier mon avis
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReviewModal;
