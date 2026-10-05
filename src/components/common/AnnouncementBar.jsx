import React, { useState, useEffect, useMemo } from 'react';
import { fetchShopSettings } from '../../services/api';
import { onSettingsUpdated } from '../../services/socket';

/**
 * Composant Bannière Défilante (Ticker / Marquee).
 * Affiche le message officiel de la boutique synchronisé en temps réel avec la base de données et le Backoffice.
 */
export const AnnouncementBar = () => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  // 1. Récupération initiale des paramètres depuis l'API publique
  useEffect(() => {
    let isMounted = true;

    const loadSettings = async () => {
      try {
        const data = await fetchShopSettings();
        if (isMounted && data) {
          setSettings(data);
        }
      } catch (err) {
        console.warn('[Bannière] Impossible de récupérer les paramètres de la boutique :', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadSettings();

    // 2. Synchronisation temps réel via WebSocket (Socket.IO)
    const unsubscribe = onSettingsUpdated((updatedSettings) => {
      if (isMounted && updatedSettings) {
        setSettings(updatedSettings);
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  // Découpage intelligent du message si des délimiteurs ('|') sont utilisés
  const announcementSegments = useMemo(() => {
    if (!settings?.announcementText) return [];
    const raw = settings.announcementText.trim();
    if (!raw) return [];

    if (raw.includes('|')) {
      return raw
        .split('|')
        .map((s) => s.trim())
        .filter(Boolean);
    }
    return [raw];
  }, [settings?.announcementText]);

  // Si la bannière est désactivée ou qu'aucun message n'est configuré, rien n'est affiché
  const isVisible = settings?.isAnnouncementActive !== false && announcementSegments.length > 0;

  if (loading && !settings) {
    return null;
  }

  if (!isVisible) {
    return null;
  }

  const renderContentItems = (keyPrefix) => (
    <div className="announcement-item" key={keyPrefix} aria-hidden={keyPrefix !== 'set-1' ? 'true' : undefined}>
      {announcementSegments.map((segment, idx) => {
        // Sélection d'icône contextuelle élégante selon le contenu du segment
        const lower = segment.toLowerCase();
        let iconClass = 'fa-solid fa-bullhorn';

        if (lower.includes('flash') || lower.includes('promo') || lower.includes('code') || lower.includes('%')) {
          iconClass = 'fa-solid fa-fire';
        } else if (lower.includes('livraison') || lower.includes('express') || lower.includes('24h') || lower.includes('48h')) {
          iconClass = 'fa-solid fa-truck-fast';
        } else if (lower.includes('paiement') || lower.includes('securise') || lower.includes('wave') || lower.includes('orange') || lower.includes('momo')) {
          iconClass = 'fa-solid fa-shield-halved';
        } else if (lower.includes('vendeur') || lower.includes('partenaire') || lower.includes('marketplace')) {
          iconClass = 'fa-solid fa-store';
        }

        return (
          <React.Fragment key={`${keyPrefix}-${idx}`}>
            <span>
              <i className={iconClass}></i> {segment}
            </span>
            {idx < announcementSegments.length - 1 && <span className="bullet">•</span>}
          </React.Fragment>
        );
      })}
    </div>
  );

  return (
    <aside className="announcement-bar" role="region" aria-label="Annonces et promotions de la boutique">
      <div className="announcement-track">
        {/* Premier jeu de texte */}
        {renderContentItems('set-1')}
        {/* Deuxième jeu de texte pour assurer la continuité parfaite du défilement infini */}
        {renderContentItems('set-2')}
      </div>
    </aside>
  );
};
