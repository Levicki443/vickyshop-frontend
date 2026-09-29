import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { submitOrder, formatPrice } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { CheckoutStepsIndicator } from './checkout/CheckoutStepsIndicator';
import { CheckoutSuccessView } from './checkout/CheckoutSuccessView';

const STEPS = [
  { id: 1, label: 'Coordonnées', icon: 'fa-solid fa-user' },
  { id: 2, label: 'Livraison', icon: 'fa-solid fa-location-dot' },
  { id: 3, label: 'Paiement', icon: 'fa-solid fa-wallet' },
  { id: 4, label: 'Validation', icon: 'fa-solid fa-clipboard-check' },
];

export const CheckoutModal = ({ isOpen, onClose }) => {
  const { cart, subtotal, discountAmount, shippingCost, total, clearCart } = useCart();
  const { user, token, isAuthenticated, openAuthModal } = useAuth();
  const { addToast } = useToast();

  const [currentStep, setCurrentStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(null);
  const modalBoxRef = useRef(null);

  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    city: 'Abidjan',
    deliveryAddress: '',
    deliveryNotes: '',
    paymentMethod: 'livraison',
  });

  // Auto-remplissage lorsque l'utilisateur est authentifié
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        customerName: user.name || prev.customerName,
        customerPhone: user.phone || prev.customerPhone,
        customerEmail: user.email || prev.customerEmail,
        deliveryAddress: user.address || prev.deliveryAddress,
        city: user.city || prev.city || 'Abidjan',
      }));
    }
  }, [user]);

  // Auto-scroll en haut de la modal à chaque changement d'étape
  useEffect(() => {
    if (modalBoxRef.current) {
      modalBoxRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentStep, orderSuccess]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNextStep = (e) => {
    if (e) e.preventDefault();

    if (currentStep === 1) {
      if (!formData.customerName.trim()) {
        addToast('Nom requis', 'Veuillez saisir votre nom et prénom.', 'error');
        return;
      }
      if (!formData.customerPhone.trim()) {
        addToast('Téléphone requis', 'Veuillez renseigner votre numéro de téléphone (WhatsApp).', 'error');
        return;
      }
    }

    if (currentStep === 2) {
      if (!formData.deliveryAddress.trim()) {
        addToast('Adresse requise', 'Veuillez renseigner votre adresse ou commune de livraison.', 'error');
        return;
      }
    }

    setCurrentStep((prev) => Math.min(STEPS.length, prev + 1));
  };

  const handlePrevStep = () => {
    setCurrentStep((prev) => Math.max(1, prev - 1));
  };

  const handleSubmitFinal = async (e) => {
    e.preventDefault();

    if (!isAuthenticated) {
      addToast('Connexion requise', 'Veuillez vous connecter pour enregistrer votre commande.', 'info');
      openAuthModal();
      return;
    }

    if (cart.length === 0) {
      addToast('Panier vide', 'Votre panier ne contient aucun article.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const orderPayload = {
        ...formData,
        items: cart.map((item) => ({
          productId: item.id || item._id,
          title: item.title,
          price: item.price,
          quantity: item.quantity,
          image: item.image || '',
          size: item.selectedSize || item.size || '',
          color: item.selectedColor || item.color || '',
        })),
        subtotal,
        discount: discountAmount,
        shippingCost,
        total,
      };

      const createdOrder = await submitOrder(orderPayload, token);
      setOrderSuccess(createdOrder);

      try {
        const existing = JSON.parse(localStorage.getItem('vicky_client_orders') || '[]');
        const updated = [createdOrder, ...existing.filter((o) => o.orderNumber !== createdOrder.orderNumber)];
        localStorage.setItem('vicky_client_orders', JSON.stringify(updated.slice(0, 15)));
      } catch (err) {
        console.warn('Erreur sauvegarde historique commande:', err);
      }

      confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
      clearCart();
      addToast('Commande validée !', `Référence : ${createdOrder.orderNumber}`, 'success');
    } catch (error) {
      addToast('Erreur', error.message || 'Impossible d\'enregistrer la commande.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setOrderSuccess(null);
    setCurrentStep(1);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div
        ref={modalBoxRef}
        className="modal-box modal-checkout-wizard"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="modal-close checkout-modal-close"
          onClick={handleClose}
          aria-label="Fermer"
        >
          <i className="fa-solid fa-xmark"></i>
        </button>

        {orderSuccess ? (
          <CheckoutSuccessView order={orderSuccess} onClose={handleClose} />
        ) : (
          <div className="checkout-wizard-container">
            <CheckoutStepsIndicator
              steps={STEPS}
              currentStep={currentStep}
              onSelectStep={(stepId) => setCurrentStep(stepId)}
            />

            {!isAuthenticated && (
              <div className="auth-notice-banner">
                <i className="fa-solid fa-lock"></i>
                <div className="notice-text">
                  <strong>Compte client recommandé</strong>
                  <span>Connectez-vous pour enregistrer votre adresse et recevoir le suivi de commande.</span>
                </div>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={openAuthModal}
                >
                  Se connecter
                </button>
              </div>
            )}

            <form onSubmit={currentStep === 4 ? handleSubmitFinal : handleNextStep} className="wizard-body">
              {currentStep === 1 && (
                <div className="wizard-step-content animate-fade-in">
                  <h4 className="step-section-title">
                    <i className="fa-solid fa-id-card"></i> 1. Vos Coordonnées Personnelles
                  </h4>
                  <p className="step-section-subtitle">
                    Renseignez vos coordonnées afin que nous puissions vous contacter pour la livraison.
                  </p>

                  <div className="form-group">
                    <label htmlFor="customerName">Nom &amp; Prénoms *</label>
                    <div className="input-with-icon">
                      <i className="fa-solid fa-user"></i>
                      <input
                        type="text"
                        id="customerName"
                        name="customerName"
                        className="form-input"
                        placeholder="Ex : Koffi Kouamé Jean"
                        required
                        value={formData.customerName}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="customerPhone">Numéro Téléphone (WhatsApp) *</label>
                      <div className="input-with-icon">
                        <i className="fa-brands fa-whatsapp"></i>
                        <input
                          type="tel"
                          id="customerPhone"
                          name="customerPhone"
                          className="form-input"
                          placeholder="Ex : 0708091011"
                          required
                          value={formData.customerPhone}
                          onChange={handleChange}
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label htmlFor="customerEmail">Adresse Email (Optionnel)</label>
                      <div className="input-with-icon">
                        <i className="fa-solid fa-envelope"></i>
                        <input
                          type="email"
                          id="customerEmail"
                          name="customerEmail"
                          className="form-input"
                          placeholder="jean@example.com"
                          value={formData.customerEmail}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="wizard-step-content animate-fade-in">
                  <h4 className="step-section-title">
                    <i className="fa-solid fa-map-location-dot"></i> 2. Destination &amp; Adresse de Livraison
                  </h4>
                  <p className="step-section-subtitle">
                    Indiquez précisément le lieu où notre livreur doit vous remettre le colis.
                  </p>

                  <div className="form-row">
                    <div className="form-group flex-1">
                      <label htmlFor="city">Ville *</label>
                      <div className="input-with-icon">
                        <i className="fa-solid fa-city"></i>
                        <input
                          type="text"
                          id="city"
                          name="city"
                          className="form-input"
                          placeholder="Abidjan"
                          value={formData.city}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>

                    <div className="form-group flex-2">
                      <label htmlFor="deliveryAddress">Commune &amp; Quartier précis *</label>
                      <div className="input-with-icon">
                        <i className="fa-solid fa-house-chimney"></i>
                        <input
                          type="text"
                          id="deliveryAddress"
                          name="deliveryAddress"
                          className="form-input"
                          placeholder="Ex : Cocody Angré 8ème Tranche, Carrefour Duncan"
                          required
                          value={formData.deliveryAddress}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="deliveryNotes">Repères &amp; Instructions pour le livreur (Optionnel)</label>
                    <textarea
                      id="deliveryNotes"
                      name="deliveryNotes"
                      rows="2"
                      className="form-input"
                      placeholder="Ex : Immeuble carrelé bleu, 2ème étage porte droite, sonner au portail..."
                      value={formData.deliveryNotes}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="wizard-step-content animate-fade-in">
                  <h4 className="step-section-title">
                    <i className="fa-solid fa-credit-card"></i> 3. Mode de Règlement
                  </h4>
                  <p className="step-section-subtitle">
                    Choisissez votre méthode de paiement pour cette commande.
                  </p>

                  <div className="payment-options-list">
                    <label className={`payment-card-option ${formData.paymentMethod === 'livraison' ? 'selected' : ''}`}>
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="livraison"
                        checked={formData.paymentMethod === 'livraison'}
                        onChange={handleChange}
                      />
                      <div className="option-icon-box bg-gold">
                        <i className="fa-solid fa-hand-holding-dollar"></i>
                      </div>
                      <div className="option-details">
                        <div className="option-header-row">
                          <strong>Paiement Cash à la livraison</strong>
                          <span className="badge-status-active">Option Active</span>
                        </div>
                        <p>Réglez directement en espèces auprès de notre livreur au moment de la réception de vos articles.</p>
                      </div>
                      <div className="option-radio-check">
                        <i className="fa-solid fa-circle-check"></i>
                      </div>
                    </label>

                    <div className="online-payment-section">
                      <div className="online-payment-badge-header">
                        <span>Paiement en ligne instantané</span>
                        <span className="badge-coming-soon">
                          <i className="fa-solid fa-lock"></i> Clés API en cours d&apos;activation
                        </span>
                      </div>

                      <div className="disabled-methods-grid">
                        <div className="disabled-method-pill" title="Wave - Bientôt disponible">
                          <i className="fa-solid fa-water text-cyan"></i>
                          <span>Wave CI</span>
                          <small>Bientôt</small>
                        </div>
                        <div className="disabled-method-pill" title="Orange Money - Bientôt disponible">
                          <i className="fa-solid fa-mobile-screen-button text-orange"></i>
                          <span>Orange Money</span>
                          <small>Bientôt</small>
                        </div>
                        <div className="disabled-method-pill" title="MTN MoMo - Bientôt disponible">
                          <i className="fa-solid fa-wallet text-yellow"></i>
                          <span>MTN MoMo</span>
                          <small>Bientôt</small>
                        </div>
                      </div>
                      <p className="online-payment-note">
                        <i className="fa-solid fa-circle-info"></i> Les paiements mobiles seront actifs très prochainement. Pour l&apos;instant, profitez de la livraison avec paiement cash en main propre.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 4 && (
                <div className="wizard-step-content animate-fade-in">
                  <h4 className="step-section-title">
                    <i className="fa-solid fa-clipboard-check"></i> 4. Récapitulatif &amp; Confirmation Finale
                  </h4>
                  <p className="step-section-subtitle">
                    Vérifiez l&apos;exactitude des informations avant d&apos;enregistrer définitivement votre commande.
                  </p>

                  <div className="review-grid">
                    <div className="review-card">
                      <h5><i className="fa-solid fa-user"></i> Destinataire</h5>
                      <div className="review-details-list">
                        <div><span>Nom :</span> <strong>{formData.customerName}</strong></div>
                        <div><span>Tél (WhatsApp) :</span> <strong>{formData.customerPhone}</strong></div>
                        {formData.customerEmail && <div><span>Email :</span> <strong>{formData.customerEmail}</strong></div>}
                      </div>
                    </div>

                    <div className="review-card">
                      <h5><i className="fa-solid fa-truck"></i> Livraison &amp; Règlement</h5>
                      <div className="review-details-list">
                        <div><span>Ville :</span> <strong>{formData.city}</strong></div>
                        <div><span>Adresse :</span> <strong>{formData.deliveryAddress}</strong></div>
                        <div><span>Règlement :</span> <strong className="text-warning">Cash à la livraison</strong></div>
                      </div>
                    </div>
                  </div>

                  <div className="review-totals-box">
                    <div className="totals-row">
                      <span>Sous-total articles ({cart.length}) :</span>
                      <strong>{formatPrice(subtotal)}</strong>
                    </div>
                    {discountAmount > 0 && (
                      <div className="totals-row text-success">
                        <span>Réduction Code Promo :</span>
                        <strong>-{formatPrice(discountAmount)}</strong>
                      </div>
                    )}
                    <div className="totals-row">
                      <span>Frais d&apos;expédition :</span>
                      <strong>{shippingCost === 0 ? 'GRATUIT' : formatPrice(shippingCost)}</strong>
                    </div>
                    <div className="totals-row totals-grand-total">
                      <span>Total Net TTC :</span>
                      <strong className="grand-total-amount">{formatPrice(total)}</strong>
                    </div>
                  </div>
                </div>
              )}

              <div className="wizard-footer">
                {currentStep > 1 ? (
                  <button
                    type="button"
                    className="btn btn-secondary wizard-btn-prev"
                    onClick={handlePrevStep}
                  >
                    <i className="fa-solid fa-arrow-left"></i>
                    <span>Précédent</span>
                  </button>
                ) : <div className="wizard-spacer" />}

                <div className="wizard-footer-right">
                  <div className="wizard-total-badge">
                    <span className="total-label">Total :</span>
                    <strong className="total-value">{formatPrice(total)}</strong>
                  </div>

                  {currentStep < 4 ? (
                    <button
                      type="submit"
                      className="btn btn-primary wizard-btn-next"
                    >
                      <span>Continuer</span>
                      <i className="fa-solid fa-arrow-right"></i>
                    </button>
                  ) : (
                    <button
                      type="submit"
                      className="btn btn-primary wizard-btn-submit"
                      disabled={submitting}
                    >
                      {submitting ? (
                        <>
                          <i className="fa-solid fa-circle-notch fa-spin"></i>
                          <span>Validation en cours...</span>
                        </>
                      ) : (
                        <>
                          <i className="fa-solid fa-check"></i>
                          <span>Confirmer ma commande</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default CheckoutModal;
