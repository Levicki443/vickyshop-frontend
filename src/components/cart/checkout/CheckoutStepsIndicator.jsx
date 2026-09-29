import React from 'react';

/**
 * Indicateur d'étapes et barre de progression pour le tunnel de commande Vicky-Shop.
 */
export const CheckoutStepsIndicator = ({ steps, currentStep, onSelectStep }) => {
  return (
    <div className="wizard-header">
      <div className="wizard-title-group">
        <div className="wizard-title-left">
          <h3>
            <i className="fa-solid fa-shield-halved"></i> Commander
          </h3>
          <span className="wizard-step-counter">
            Étape {currentStep} sur {steps.length}
          </span>
        </div>
      </div>

      {/* Barre de progression avec pastilles numérotées */}
      <div className="wizard-stepper">
        {steps.map((s) => (
          <div
            key={s.id}
            className={`step-item ${currentStep === s.id ? 'active' : ''} ${currentStep > s.id ? 'completed' : ''}`}
            onClick={() => {
              if (currentStep > s.id) onSelectStep(s.id);
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
  );
};

export default CheckoutStepsIndicator;
