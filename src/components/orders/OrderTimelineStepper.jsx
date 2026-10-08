import React, { useMemo } from 'react';

const STANDARD_STEPS = [
  { key: 'recue', label: 'Commande reçue', shortLabel: 'Reçue', icon: 'fa-receipt', desc: 'Commande enregistrée avec succès' },
  { key: 'confirmee', label: 'Commande confirmée', shortLabel: 'Confirmée', icon: 'fa-check-double', desc: 'Validée par le vendeur' },
  { key: 'en_preparation', label: 'En préparation', shortLabel: 'Préparation', icon: 'fa-box-open', desc: 'Articles vérifiés et emballés' },
  { key: 'expediee', label: 'Expédiée', shortLabel: 'Expédiée', icon: 'fa-dolly', desc: 'Confiée au service logistique' },
  { key: 'en_livraison', label: 'En livraison', shortLabel: 'En livraison', icon: 'fa-truck-fast', desc: 'Livreur en route vers votre adresse' },
  { key: 'livree', label: 'Livrée', shortLabel: 'Livrée', icon: 'fa-house-circle-check', desc: 'Colis réceptionné avec succès' },
];

const STEP_INDEX_MAP = {
  en_attente: 0,
  recue: 0,
  confirmee: 1,
  en_preparation: 2,
  expediee: 3,
  en_livraison: 4,
  livree: 5,
};

export const OrderTimelineStepper = ({ orderStatus = 'recue', statusHistory = [], createdAt }) => {
  const isCancelled = orderStatus === 'annulee';
  const isRefused = orderStatus === 'refusee';
  const isReturned = orderStatus === 'retournee';
  const isException = isCancelled || isRefused || isReturned;

  const currentStepIdx = useMemo(() => {
    return STEP_INDEX_MAP[orderStatus] !== undefined ? STEP_INDEX_MAP[orderStatus] : 0;
  }, [orderStatus]);

  // Récupération de l'horodatage pour chaque étape si présent dans l'historique
  const stepTimestamps = useMemo(() => {
    const map = {};
    if (createdAt) {
      map['recue'] = new Date(createdAt);
    }
    if (Array.isArray(statusHistory)) {
      statusHistory.forEach((h) => {
        const rawStatus = h.status || h.newStatus;
        if (rawStatus && h.updatedAt) {
          map[rawStatus] = new Date(h.updatedAt);
        }
      });
    }
    return map;
  }, [statusHistory, createdAt]);

  const progressPercent = useMemo(() => {
    if (isException) return 0;
    return Math.min(100, Math.round((currentStepIdx / (STANDARD_STEPS.length - 1)) * 100));
  }, [currentStepIdx, isException]);

  if (isException) {
    const exceptionConfig = isCancelled
      ? { title: 'Commande Annulée', icon: 'fa-ban', desc: 'Cette commande a été annulée.', cls: 'badge-danger' }
      : isRefused
      ? { title: 'Commande Refusée', icon: 'fa-hand', desc: 'La livraison de ce colis a été refusée.', cls: 'badge-danger' }
      : { title: 'Commande Retournée', icon: 'fa-arrow-rotate-left', desc: 'Ce colis a fait l\'objet d\'un retour.', cls: 'badge-info' };

    return (
      <div className="order-timeline-exception-banner">
        <div className={`exception-icon-box ${exceptionConfig.cls}`}>
          <i className={`fa-solid ${exceptionConfig.icon}`}></i>
        </div>
        <div>
          <h4 className="exception-title">{exceptionConfig.title}</h4>
          <p className="exception-desc">{exceptionConfig.desc}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="order-stepper-container">
      {/* 1. VUE HORIZONTALE (DESKTOP & TABLETTE) */}
      <div className="stepper-horizontal-view">
        <div className="stepper-track-bg">
          <div className="stepper-track-progress" style={{ width: `${progressPercent}%` }} />
        </div>

        <div className="stepper-steps-row">
          {STANDARD_STEPS.map((step, idx) => {
            const isCompleted = idx < currentStepIdx || (currentStepIdx === 5 && idx === 5);
            const isCurrent = idx === currentStepIdx && currentStepIdx < 5;
            const isPending = idx > currentStepIdx;
            const time = stepTimestamps[step.key];

            return (
              <div
                key={step.key}
                className={`stepper-step-node ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''} ${isPending ? 'pending' : ''}`}
              >
                <div className="stepper-node-circle">
                  {isCompleted ? (
                    <i className="fa-solid fa-check"></i>
                  ) : (
                    <i className={`fa-solid ${step.icon}`}></i>
                  )}
                  {isCurrent && <span className="stepper-pulse-ring" />}
                </div>

                <div className="stepper-node-labels">
                  <strong className="stepper-step-title">{step.label}</strong>
                  {time && (
                    <span className="stepper-step-time">
                      {time.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  )}
                  {isCurrent && !time && (
                    <span className="stepper-step-live-tag">
                      <i className="fa-solid fa-spinner fa-spin"></i> En cours
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. VUE VERTICALE RESPONSIVE (SMARTPHONES) */}
      <div className="stepper-vertical-view">
        <div className="vertical-timeline-list">
          {STANDARD_STEPS.map((step, idx) => {
            const isCompleted = idx < currentStepIdx || (currentStepIdx === 5 && idx === 5);
            const isCurrent = idx === currentStepIdx && currentStepIdx < 5;
            const isPending = idx > currentStepIdx;
            const time = stepTimestamps[step.key];

            return (
              <div
                key={step.key}
                className={`vertical-timeline-row ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''} ${isPending ? 'pending' : ''}`}
              >
                <div className="vertical-node-col">
                  <div className="vertical-node-circle">
                    {isCompleted ? (
                      <i className="fa-solid fa-check"></i>
                    ) : (
                      <i className={`fa-solid ${step.icon}`}></i>
                    )}
                    {isCurrent && <span className="vertical-pulse-ring" />}
                  </div>
                  {idx < STANDARD_STEPS.length - 1 && <div className="vertical-connector-line" />}
                </div>

                <div className="vertical-content-col">
                  <div className="vertical-step-header">
                    <strong className="vertical-step-title">{step.label}</strong>
                    {isCurrent && <span className="badge-live-pulse">En cours...</span>}
                  </div>
                  <p className="vertical-step-desc">{step.desc}</p>
                  {time && (
                    <span className="vertical-step-date">
                      <i className="fa-regular fa-clock"></i>{' '}
                      {time.toLocaleDateString('fr-FR', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default OrderTimelineStepper;
