import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { submitOrder, formatPrice } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { CheckoutStepsIndicator } from './checkout/CheckoutStepsIndicator';
import { CheckoutSuccessView } from './checkout/CheckoutSuccessView';
import {
  StepContact,
  StepDelivery,
  StepPayment,
  StepReview,
} from './checkout/CheckoutStepViews';

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
      if (!formData.customerName.trim() || formData.customerName.trim().length < 2) {
        addToast('Nom requis', 'Veuillez renseigner votre nom et prénom (au moins 2 caractères).', 'error');
        return;
      }
      const pureDigits = formData.customerPhone.replace(/\D/g, '');
      if (!formData.customerPhone.trim() || pureDigits.length < 10) {
        addToast(
          'Numéro de téléphone requis',
          'Veuillez saisir un numéro de téléphone valide d\'au moins 10 chiffres (ex : 0708091011 ou +225 0102030405).',
          'error'
        );
        return;
      }
    }

    if (currentStep === 2) {
      if (!formData.deliveryAddress.trim() || formData.deliveryAddress.trim().length < 3) {
        addToast('Adresse requise', 'Veuillez renseigner votre adresse ou commune précise (au moins 3 caractères).', 'error');
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
      addToast('Erreur de validation', error.message || 'Impossible d\'enregistrer la commande.', 'error');
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
              {currentStep === 1 && <StepContact formData={formData} onChange={handleChange} />}
              {currentStep === 2 && <StepDelivery formData={formData} onChange={handleChange} />}
              {currentStep === 3 && <StepPayment formData={formData} onChange={handleChange} />}
              {currentStep === 4 && (
                <StepReview
                  formData={formData}
                  cart={cart}
                  subtotal={subtotal}
                  discountAmount={discountAmount}
                  shippingCost={shippingCost}
                  total={total}
                />
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
