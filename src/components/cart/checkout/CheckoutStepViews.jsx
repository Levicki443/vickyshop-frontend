import React from 'react';
import { formatPrice } from '../../../services/api';

/**
 * Étape 1 : Coordonnées de contact du client.
 */
export const StepContact = ({ formData, onChange }) => (
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
          onChange={onChange}
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
            placeholder="Ex : 0708091011 ou 0102030405"
            required
            value={formData.customerPhone}
            onChange={onChange}
          />
        </div>
        <small style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>
          10 chiffres requis (ex : 0708091011 ou 0102030405)
        </small>
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
            onChange={onChange}
          />
        </div>
      </div>
    </div>
  </div>
);

/**
 * Étape 2 : Adresse et indications de livraison.
 */
export const StepDelivery = ({ formData, onChange }) => (
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
            onChange={onChange}
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
            onChange={onChange}
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
        onChange={onChange}
      />
    </div>
  </div>
);

/**
 * Étape 3 : Sélection du moyen de paiement.
 */
export const StepPayment = ({ formData, onChange }) => (
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
          onChange={onChange}
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
);

/**
 * Étape 4 : Récapitulatif et validation avant commande définitive.
 */
export const StepReview = ({ formData, cart, subtotal, discountAmount, shippingCost, total }) => (
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
);
