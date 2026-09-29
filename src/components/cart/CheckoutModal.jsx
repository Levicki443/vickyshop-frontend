import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { submitOrder, formatPrice } from '../../services/api';
import { useToast } from '../../context/ToastContext';

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

  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    city: 'Abidjan',
    deliveryAddress: '',
    deliveryNotes: '',
    paymentMethod: 'livraison', // Cash à la livraison actif par défaut
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

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const triggerConfetti = () => {
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.6 },
    });
  };

  // Validation par étape
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

      // Sauvegarde dans l'historique des commandes du client pour le suivi
      try {
        const existing = JSON.parse(localStorage.getItem('vicky_client_orders') || '[]');
        const updated = [createdOrder, ...existing.filter((o) => o.orderNumber !== createdOrder.orderNumber)];
        localStorage.setItem('vicky_client_orders', JSON.stringify(updated.slice(0, 15)));
      } catch (e) {
        console.warn('Erreur sauvegarde historique commande:', e);
      }

      triggerConfetti();
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
      <div className="modal-box modal-checkout-wizard" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className="modal-close"
          onClick={handleClose}
          aria-label="Fermer"
        >
          <i className="fa-solid fa-xmark"></i>
        </button>

        {orderSuccess ? (
          /* ÉCRAN DE CONFIRMATION FINALE */
          <div className="order-success-view">
            <div className="success-icon-wrap animate-scale-up">
              <i className="fa-solid fa-circle-check"></i>
            </div>
            <h2>Commande Confirmée avec Succès !</h2>
            <div className="order-ref-pill">
              <span>RÉFÉRENCE :</span>
              <strong>{orderSuccess.orderNumber}</strong>
            </div>

            <p className="order-notice">
              {orderSuccess.customerEmail ? (
                <>
                  <i className="fa-solid fa-envelope-circle-check text-success"></i> Un email de confirmation détaillé vous a été envoyé via Brevo à <strong>{orderSuccess.customerEmail}</strong>.
                </>
              ) : (
                <>Notre service de livraison vous contactera au <strong>{orderSuccess.customerPhone}</strong>.</>
              )}
            </p>

            <div className="order-summary-box">
              <div className="summary-line">
                <span>Montant à préparer (Espèces) :</span>
                <strong className="summary-total-price">{formatPrice(orderSuccess.total)}</strong>
              </div>
              <div className="summary-line">
                <span>Mode de règlement :</span>
                <strong className="text-uppercase text-warning">Paiement Cash à la livraison</strong>
              </div>
              <div className="summary-line">
                <span>Destinataire :</span>
                <strong>{orderSuccess.customerName} ({orderSuccess.customerPhone})</strong>
              </div>
              <div className="summary-line">
                <span>Lieu de livraison :</span>
                <strong>{orderSuccess.deliveryAddress}, {orderSuccess.city}</strong>
              </div>
            </div>

            <div className="order-cash-reminder">
              <i className="fa-solid fa-hand-holding-dollar"></i>
              <span>Veuillez s'il vous plaît prévoir l'appoint de <strong>{formatPrice(orderSuccess.total)}</strong> en espèces lors du passage du livreur.</span>
            </div>

            <button type="button" className="btn btn-primary btn-block" onClick={handleClose}>
              <i className="fa-solid fa-bag-shopping"></i> Continuer mes achats
            </button>
          </div>
        ) : (
          /* PROCESSUS DE COMMANDE MULTI-ÉTAPES (WIZARD) */
          <div className="checkout-wizard-container">
            {/* EN-TÊTE DU WIZARD */}
            <div className="wizard-header">
              <div className="wizard-title-group">
                <h3>
                  <i className="fa-solid fa-shield-halved"></i> Commander sur Vicky-Shop
                </h3>
                <span className="wizard-step-counter">
                  Étape {currentStep} sur {STEPS.length}
                </span>
              </div>

              {/* BARRE DE PROGRESSION DES ÉTAPES */}
              <div className="wizard-stepper">
                {STEPS.map((s) => (
                  <div
                    key={s.id}
                    className={`step-item ${currentStep === s.id ? 'active' : ''} ${currentStep > s.id ? 'completed' : ''}`}
                    onClick={() => {
                      if (currentStep > s.id) setCurrentStep(s.id);
                    }}
                  >
                    <div className="step-circle">
                      {currentStep > s.id ? (
                        <i className="fa-solid fa-check"></i>
                      ) : (
                        <i className={s.icon}></i>
                      )}
                    </div>
                    <span className="step-label">{s.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* AVERTISSEMENT SI NON CONNECTÉ */}
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

            {/* CONTENU DE L'ÉTAPE ACTIVE */}
            <form onSubmit={currentStep === 4 ? handleSubmitFinal : handleNextStep} className="wizard-body">
              
              {/* ÉTAPE 1 : COORDONNÉES */}
              {currentStep === 1 && (
                <div className="wizard-step-content animate-fade-in">
                  <h4 className="step-section-title">
                    <i className="fa-solid fa-id-card"></i> 1. Vos Coordonnées Personnelles
                  </h4>
                  <p className="step-section-subtitle">
                    Renseignez vos coordonnées afin que nous puissions vous contacter pour la livraison.
                  </p>

                  <div className="form-group">
                    <label htmlFor="customerName">Nom & Prénoms *</label>
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
                      <label htmlFor="customerEmail">Adresse Email (Recommandé)</label>
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
                      <small className="form-hint">
                        📧 Vous recevrez le mail de confirmation officiel via Brevo.
                      </small>
                    </div>
                  </div>
                </div>
              )}

              {/* ÉTAPE 2 : ADRESSE DE LIVRAISON */}
              {currentStep === 2 && (
                <div className="wizard-step-content animate-fade-in">
                  <h4 className="step-section-title">
                    <i className="fa-solid fa-map-location-dot"></i> 2. Destination & Adresse de Livraison
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
                      <label htmlFor="deliveryAddress">Commune & Quartier précis *</label>
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
                    <label htmlFor="deliveryNotes">Repères & Instructions pour le livreur (Optionnel)</label>
                    <textarea
                      id="deliveryNotes"
                      name="deliveryNotes"
                      rows="2"
                      className="form-input"
                      placeholder="Ex : Immeuble carrelé bleu, 2ème étage porte droite, sonner au portail..."
                      value={formData.deliveryNotes}
                      onChange={handleChange}
                    ></textarea>
                  </div>
                </div>
              )}

              {/* ÉTAPE 3 : MODE DE PAIEMENT */}
              {currentStep === 3 && (
                <div className="wizard-step-content animate-fade-in">
                  <h4 className="step-section-title">
                    <i className="fa-solid fa-credit-card"></i> 3. Mode de Règlement
                  </h4>
                  <p className="step-section-subtitle">
                    Choisissez votre méthode de paiement pour cette commande.
                  </p>

                  {/* OPTION ACTIVE : CASH À LA LIVRAISON */}
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

                    {/* OPTIONS DE PAIEMENT EN LIGNE (Bientôt disponibles) */}
                    <div className="online-payment-section">
                      <div className="online-payment-badge-header">
                        <span>Paiement en ligne instantané</span>
                        <span className="badge-coming-soon">
                          <i className="fa-solid fa-lock"></i> Clés API en cours d'activation
                        </span>
                      </div>

                      <div className="disabled-methods-grid">
                        <div className="disabled-method-pill" title="Wave - Bientôt disponible">
                          <i className="fa-solid fa-water text-cyan"></i>
                          <span>Wave CI</span>
                          <small>Bientôt</small>
                        </div>

                        <div className="disabled-method-pill" title="Orange Money - Bientôt disponible">
                          <i className="fa-solid fa-money-bill-wave text-orange"></i>
                          <span>Orange Money</span>
                          <small>Bientôt</small>
                        </div>

                        <div className="disabled-method-pill" title="MTN MoMo - Bientôt disponible">
                          <i className="fa-solid fa-bolt text-yellow"></i>
                          <span>MTN MoMo</span>
                          <small>Bientôt</small>
                        </div>

                        <div className="disabled-method-pill" title="Carte Bancaire - Bientôt disponible">
                          <i className="fa-solid fa-credit-card text-purple"></i>
                          <span>Carte Bancaire</span>
                          <small>Bientôt</small>
                        </div>
                      </div>
                      <p className="online-payment-note">
                        <i className="fa-solid fa-info-circle"></i> Le paiement sécurisé en ligne sera disponible très prochainement dès l'activation de nos clés API bancaires. En attendant, profitez du <strong>paiement 100% sécurisé à la livraison</strong>.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* ÉTAPE 4 : RÉCAPITULATIF & VALIDATION */}
              {currentStep === 4 && (
                <div className="wizard-step-content animate-fade-in">
                  <h4 className="step-section-title">
                    <i className="fa-solid fa-clipboard-check"></i> 4. Récapitulatif de votre Commande
                  </h4>
                  <p className="step-section-subtitle">
                    Veuillez vérifier toutes vos informations avant de confirmer votre commande.
                  </p>

                  <div className="review-grid">
                    {/* Articles du panier */}
                    <div className="review-card">
                      <h5><i className="fa-solid fa-bag-shopping"></i> Articles ({cart.length})</h5>
                      <div className="review-items-list">
                        {cart.map((item, idx) => (
                          <div key={idx} className="review-item-row">
                            {item.image && (
                              <img src={item.image} alt={item.title} className="review-item-img" />
                            )}
                            <div className="review-item-info">
                              <strong>{item.title}</strong>
                              <div className="review-item-meta">
                                <span>Quantité : {item.quantity}</span>
                                {item.selectedSize && <span> • Taille : {item.selectedSize}</span>}
                              </div>
                            </div>
                            <div className="review-item-price">
                              {formatPrice(item.price * item.quantity)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Coordonnées & Livraison */}
                    <div className="review-card">
                      <h5><i className="fa-solid fa-truck"></i> Coordonnées & Livraison</h5>
                      <div className="review-details-list">
                        <div><span>Destinataire :</span> <strong>{formData.customerName}</strong></div>
                        <div><span>Téléphone :</span> <strong>{formData.customerPhone}</strong></div>
                        {formData.customerEmail && (
                          <div><span>Email :</span> <span>{formData.customerEmail}</span></div>
                        )}
                        <div><span>Ville & Adresse :</span> <strong>{formData.deliveryAddress}, {formData.city}</strong></div>
                        {formData.deliveryNotes && (
                          <div><span>Instructions :</span> <em>{formData.deliveryNotes}</em></div>
                        )}
                        <div>
                          <span>Mode de règlement :</span>
                          <strong className="text-warning">Paiement Cash à la livraison</strong>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Décompte financier */}
                  <div className="review-totals-box">
                    <div className="totals-row">
                      <span>Sous-total articles :</span>
                      <span>{formatPrice(subtotal)}</span>
                    </div>
                    {discountAmount > 0 && (
                      <div className="totals-row text-success">
                        <span>Remise promotionnelle :</span>
                        <span>-{formatPrice(discountAmount)}</span>
                      </div>
                    )}
                    <div className="totals-row">
                      <span>Frais d'expédition :</span>
                      <span>{shippingCost === 0 ? <strong className="text-success">GRATUIT</strong> : formatPrice(shippingCost)}</span>
                    </div>
                    <div className="totals-row totals-grand-total">
                      <strong>Total net à régler au livreur :</strong>
                      <strong className="grand-total-amount">{formatPrice(total)}</strong>
                    </div>
                  </div>
                </div>
              )}

              {/* PIED DE MODALE & NAVIGATION ENTRE LES ÉTAPES */}
              <div className="wizard-footer">
                {currentStep > 1 && (
                  <button
                    type="button"
                    className="btn btn-secondary btn-wizard-prev"
                    onClick={handlePrevStep}
                    disabled={submitting}
                  >
                    <i className="fa-solid fa-arrow-left"></i> Précédent
                  </button>
                )}

                <div className="wizard-footer-right">
                  <div className="footer-total-preview">
                    <span>Total :</span>
                    <strong>{formatPrice(total)}</strong>
                  </div>

                  {currentStep < 4 ? (
                    <button
                      type="submit"
                      className="btn btn-primary btn-wizard-next"
                    >
                      <span>Continuer</span>
                      <i className="fa-solid fa-arrow-right"></i>
                    </button>
                  ) : (
                    <button
                      type="submit"
                      className="btn btn-primary btn-wizard-submit"
                      disabled={submitting}
                    >
                      {submitting ? (
                        <>
                          <i className="fa-solid fa-spinner fa-spin"></i>
                          <span>Traitement en cours...</span>
                        </>
                      ) : (
                        <>
                          <i className="fa-solid fa-check"></i>
                          <span>Valider & Commander</span>
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
