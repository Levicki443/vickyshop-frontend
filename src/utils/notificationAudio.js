/**
 * Générateur de signal sonore discret et harmonieux pour les alertes de notification (Web Audio API).
 * Fonctionne sans dépendre d'un fichier audio externe susceptible de manquer ou d'échouer au chargement.
 */

let audioCtx = null;

export const playNotificationSound = () => {
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;

    if (!audioCtx) {
      audioCtx = new AudioContextClass();
    }

    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    const now = audioCtx.currentTime;

    // Oscillateur principal (Note C5 - 523.25 Hz)
    const osc1 = audioCtx.createOscillator();
    const gain1 = audioCtx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(523.25, now);
    osc1.frequency.exponentialRampToValueAtTime(659.25, now + 0.12); // Montée vers E5

    gain1.gain.setValueAtTime(0.08, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc1.connect(gain1);
    gain1.connect(audioCtx.destination);

    // Oscillateur harmonique secondaire (G5 - 783.99 Hz)
    const osc2 = audioCtx.createOscillator();
    const gain2 = audioCtx.createGain();

    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(783.99, now + 0.08);

    gain2.gain.setValueAtTime(0.05, now + 0.08);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

    osc2.connect(gain2);
    gain2.connect(audioCtx.destination);

    osc1.start(now);
    osc1.stop(now + 0.36);

    osc2.start(now + 0.08);
    osc2.stop(now + 0.41);
  } catch (err) {
    // Si l'utilisateur n'a pas encore interagi avec la page, le navigateur peut bloquer l'audio
    console.debug('[Audio] Lecture du son de notification impossible :', err.message);
  }
};
