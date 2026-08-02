// =================== INSTALLATION AUDIOVISUELLE GÉNÉRATIVE ===================
// Installation "Drone" : oscillateurs qui dérivent + cercles flottants

class AudiovisualInstallation {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    
    // Redimensionner le canvas au fullscreen
    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());
    
    // État partagé pour lier audio et visuels
    this.state = {
      energy: 0,
      drift: 0,
      time: 0,
      hue: 0
    };
    
    // Initialiser Web Audio API
    this.initAudio();
    
    // Initialiser animation
    this.particles = this.createParticles(30); // Augmenté de 15 à 30
    this.trails = this.particles.map(() => []); // Tracer les positions passées
    this.animationId = null;
    
    // Démarrer
    this.start();
  }
  
  // =================== REDIMENSIONNEMENT RESPONSIF ===================
  
  resizeCanvas() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.width = this.canvas.width;
    this.height = this.canvas.height;
  }
  
  // =================== WEB AUDIO API ===================
  
  initAudio() {
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      
      // Créer 5 oscillateurs avec fréquences basées sur le nombre d'or (φ)
      const baseFreq = 75; // Fréquence de base
      const phi = (1 + Math.sqrt(5)) / 2; // Nombre d'or ≈ 1.618
      const waveTypes = ['sine', 'sawtooth', 'sawtooth', 'triangle', 'triangle'];
      
      this.oscillators = [];
      this.gains = [];
      
      // Fréquences calculées: 95 × φ^(2i)
      const frequencies = [
        baseFreq,                              // 95 Hz
        baseFreq * Math.pow(phi, 2),           // 248.7 Hz
        baseFreq * Math.pow(phi, 4),           // 651.1 Hz
        baseFreq * Math.pow(phi, 6) * 0.80,    // 1363.8 Hz
        baseFreq * Math.pow(phi, 8) * 0.85     // 3793.5 Hz
      ];
      
      // Créer un filtre lowpass pour moduler le timbre
      this.filter = this.audioContext.createBiquadFilter();
      this.filter.type = 'lowpass';
      this.filter.frequency.value = 1200; // Fréquence de coupure augmentée (moins grave)
      this.filter.Q.value = 1;
      
      // Créer une reverb avec des delays et feedback
      this.dryGain = this.audioContext.createGain();
      this.wetGain = this.audioContext.createGain();
      this.wetGain.gain.value = 0.35; // Reverb réduit pour éviter saturation
      
      // Créer plusieurs delays pour simuler une reverb
      const delayTimes = [0.05, 0.1, 0.15, 0.25]; // Ajout d'un délai supplémentaire
      this.delayNodes = [];
      
      delayTimes.forEach(time => {
        const delayNode = this.audioContext.createDelay(0.5);
        const feedbackGain = this.audioContext.createGain();
        const delayGain = this.audioContext.createGain();
        
        delayNode.delayTime.value = time;
        feedbackGain.gain.value = 0.40; // Feedback réduit pour moins de saturation
        delayGain.gain.value = 0.55; // Delay gain réduit
        
        this.filter.connect(delayNode);
        delayNode.connect(feedbackGain);
        feedbackGain.connect(delayNode); // Feedback loop
        delayNode.connect(delayGain);
        delayGain.connect(this.wetGain);
        
        this.delayNodes.push(delayNode);
      });
      
      // Dry signal (direct sans reverb)
      this.filter.connect(this.dryGain);
      
      // Créer un LFO (Low Frequency Oscillator) pour moduler l'amplitude
      this.lfo = this.audioContext.createOscillator();
      this.lfoGain = this.audioContext.createGain();
      this.lfo.frequency.value = 0.08; // Modulation très lente
      this.lfoGain.gain.value = 0.10; // Force de la modulation réduite
      this.lfo.connect(this.lfoGain);
      
      // Créer un bruit blanc pour plus de texture
      const bufferSize = this.audioContext.sampleRate * 0.5;
      const noiseBuffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
      const noiseData = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        noiseData[i] = Math.random() * 2 - 1;
      }
      
      this.noiseSource = this.audioContext.createBufferSource();
      this.noiseSource.buffer = noiseBuffer;
      this.noiseSource.loop = true;
      this.noiseGain = this.audioContext.createGain();
      this.noiseGain.gain.value = 0.02; // Bruit faible
      
      const noiseFilter = this.audioContext.createBiquadFilter();
      noiseFilter.type = 'highpass';
      noiseFilter.frequency.value = 200;
      
      this.noiseSource.connect(this.noiseGain);
      this.noiseGain.connect(noiseFilter);
      noiseFilter.connect(this.filter);
      this.noiseSource.start();
      
      // Créer un master gain pour le fade-in au démarrage
      this.masterGain = this.audioContext.createGain();
      this.masterGain.gain.value = 0; // Commence à 0
      this.fadeInStartTime = null;
      
      for (let i = 0; i < 5; i++) {
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        
        // Varier les types d'ondes
        osc.type = waveTypes[i];
        osc.frequency.value = frequencies[i];
        
        // Gains progressifs mais réduits pour éviter saturation
        const targetGains = [0.05, 0.06, 0.10, 0.12, 0.15];
        gain.gain.value = targetGains[i];
        
        osc.connect(gain);
        gain.connect(this.filter);
        
        // Connecter le LFO pour moduler le volume
        this.lfoGain.connect(gain.gain);
        
        osc.start();
        
        this.oscillators.push(osc);
        this.gains.push(gain);
      }
      this.lfo.start();
      
      // Connecter le filtre à la sortie avec master gain (dry + wet)
      this.dryGain.connect(this.masterGain);
      this.wetGain.connect(this.masterGain);
      this.masterGain.connect(this.audioContext.destination);
      
      // Créer le son
      this.audioActive = true;
    } catch (e) {
      console.warn('Web Audio API non disponible:', e);
      this.audioActive = false;
      this.oscillators = [];
      this.gains = [];
    }
  }
  
  updateAudio() {
    if (!this.audioActive || this.oscillators.length === 0) return;
    
    try {
      // Fade-in au démarrage (0 → 1 en 3 secondes)
      if (this.fadeInStartTime === null) {
        this.fadeInStartTime = Date.now();
      }
      
      const elapsedMs = Date.now() - this.fadeInStartTime;
      const fadeDurationMs = 3000; // 3 secondes
      const fadeProgress = Math.min(1, elapsedMs / fadeDurationMs);
      this.masterGain.gain.value = fadeProgress;
      
      // Faire dériver les fréquences lentement
      const drift = Math.sin(this.state.time * 0.0005) * 15; // Drift réduit
      const baseFreq = 95;
      const phi = (1 + Math.sqrt(5)) / 2;
      
      const frequencies = [
        baseFreq,
        baseFreq * Math.pow(phi, 2),
        baseFreq * Math.pow(phi, 4),
        baseFreq * Math.pow(phi, 6) * 0.80,
        baseFreq * Math.pow(phi, 8) * 0.85
      ];
      
      this.oscillators.forEach((osc, i) => {
        osc.frequency.setTargetAtTime(
          frequencies[i] + drift,
          this.audioContext.currentTime,
          0.1
        );
      });
      
      // Calculer l'énergie totale du drone (somme des gains)
      let totalEnergy = 0;
      this.gains.forEach(gain => {
        totalEnergy += gain.gain.value;
      });
      this.state.energy = totalEnergy / this.gains.length; // Moyenne pour normaliser
      
      // Moduler la fréquence de coupure du filtre
      // Variation lente et fluide
      const filterFreq = 600 + Math.sin(this.state.time * 0.001) * 300 + Math.cos(this.state.time * 0.0008) * 150;
      if (this.filter) {
        this.filter.frequency.setTargetAtTime(
          Math.max(300, Math.min(1800, filterFreq)),
          this.audioContext.currentTime,
          0.05
        );
      }
      
      // Variation d'énergie pour l'animation
      this.state.energy = Math.sin(this.state.time * 0.001) * 0.5 + 0.5;
      this.state.drift = drift / 20; // Normaliser pour l'animation
    } catch (e) {
      console.warn('Erreur updateAudio:', e);
    }
  }
  
  stopAudio() {
    if (this.audioActive && this.oscillators.length > 0) {
      this.oscillators.forEach(osc => {
        try {
          osc.stop();
        } catch (e) {
          // Déjà arrêté
        }
      });
      
      // Arrêter le LFO et le bruit
      try {
        this.lfo.stop();
        this.noiseSource.stop();
      } catch (e) {
        // Déjà arrêtés
      }
      
      this.audioActive = false;
    }
  }
  
  // =================== ANIMATION CANVAS ===================
  
  createParticles(count) {
    const particles = [];
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        radius: Math.random() * 20 + 15,      // Réduit de 30 + 20 à 20 + 15
        speedX: (Math.random() - 0.5) * 0.8,
        speedY: (Math.random() - 0.5) * 0.8,
        hueOffset: (i / count) * 360
      });
    }
    return particles;
  }
  
  updateParticles() {
    this.particles.forEach(p => {
      // Mouvement plus lent influencé par l'énergie audio
      // Multiplicateur: 0.3 (idle) → 6.3 (full drone energy)
      const speedMultiplier = 0.3 + (this.state.energy * 6);
      p.x += p.speedX * speedMultiplier;
      p.y += p.speedY * speedMultiplier;
      
      // Rebondir sur les bords
      if (p.x - p.radius < 0 || p.x + p.radius > this.width) {
        p.speedX *= -1;
        p.x = Math.max(p.radius, Math.min(this.width - p.radius, p.x));
      }
      if (p.y - p.radius < 0 || p.y + p.radius > this.height) {
        p.speedY *= -1;
        p.y = Math.max(p.radius, Math.min(this.height - p.radius, p.y));
      }
    });
  }
  
  draw() {
    // Fond noir avec légère traînée (trail effect)
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    this.ctx.fillRect(0, 0, this.width, this.height);
    this.ctx.globalAlpha = 1.0;
    
    // Dessiner les lignes de connexion entre les sphères (blanc)
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    this.ctx.lineWidth = 1;
    for (let i = 0; i < this.particles.length; i += 3) {
      if (this.particles[i + 1]) {
        this.ctx.beginPath();
        this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
        this.ctx.lineTo(this.particles[i + 1].x, this.particles[i + 1].y);
        this.ctx.stroke();
      }
      if (this.particles[i + 2]) {
        this.ctx.beginPath();
        this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
        this.ctx.lineTo(this.particles[i + 2].x, this.particles[i + 2].y);
        this.ctx.stroke();
      }
    }
    
    // Dessiner les cercles translucides
    this.particles.forEach((p, index) => {
      // Hue plus réactif à l'énergie audio
      const hue = (p.hueOffset + this.state.time * 0.02 + this.state.energy * 50) % 360;
      
      // Effet de pulsation puissant basé sur l'énergie audio
      // Pulsation: 1 (idle) → 2.8 (full energy)
      const pulseFactor = 1 + (this.state.energy * 1.8);
      const pulsingRadius = p.radius * pulseFactor;
      
      // Traînée (trails) - plus long quand énergie élevée
      if (this.trails[index]) {
        this.trails[index].push({x: p.x, y: p.y});
        const maxTrailLength = 8 + Math.floor(this.state.energy * 12); // 8 → 20 points
        if (this.trails[index].length > maxTrailLength) {
          this.trails[index].shift();
        }
        
        this.trails[index].forEach((point, i) => {
          const alpha = (i / this.trails[index].length) * 0.15;
          this.ctx.fillStyle = `hsla(${hue}, 80%, 50%, ${alpha})`;
          this.ctx.beginPath();
          this.ctx.arc(point.x, point.y, pulsingRadius * 0.5, 0, Math.PI * 2);
          this.ctx.fill();
        });
      }
      
      // Cercle interne lumineux
      const innerGradient = this.ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, pulsingRadius);
      innerGradient.addColorStop(0, `hsla(${hue}, 100%, 60%, 0.6)`);
      innerGradient.addColorStop(1, `hsla(${hue}, 100%, 40%, 0.1)`);
      
      this.ctx.fillStyle = innerGradient;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, pulsingRadius, 0, Math.PI * 2);
      this.ctx.fill();
      
      // Contour fin
      this.ctx.strokeStyle = `hsla(${hue}, 100%, 70%, 0.4)`;
      this.ctx.lineWidth = 2;
      this.ctx.stroke();
    });
  }
  
  animate = () => {
    this.state.time++;
    
    this.updateAudio();
    this.updateParticles();
    this.draw();
    
    this.animationId = requestAnimationFrame(this.animate);
  }
  
  start() {
    this.animate();
  }
  
  stop() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
    this.stopAudio();
  }
  
  // =================== ENREGISTREMENT (DÉSACTIVÉ) ===================
  // Les fonctionnalités d'enregistrement sont volontairement désactivées
  // pour empêcher les visiteurs de capturer l'installation.
  // Le code est conservé commenté pour une éventuelle réactivation future.
  
  /*
  startRecording() {
    // Capturer le canvas (vidéo)
    const videoStream = this.canvas.captureStream(60); // 60 FPS
    
    // Capturer l'audio Web Audio API
    const audioDestination = this.audioContext.createMediaStreamDestination();
    
    // Router l'audio vers la destination de streaming
    // dryGain et wetGain sont déjà connectés à audioContext.destination
    // On peut les connecter AUSSI vers la destination de streaming
    this.dryGain.connect(audioDestination);
    this.wetGain.connect(audioDestination);
    
    // Ajouter la piste audio au stream vidéo
    audioDestination.stream.getAudioTracks().forEach(track => {
      videoStream.addTrack(track);
    });
    
    const options = { 
      audioBitsPerSecond: 192000,
      videoBitsPerSecond: 3000000,
      mimeType: 'video/webm;codecs=vp8,opus'
    };
    
    this.mediaRecorder = new MediaRecorder(videoStream, options);
    this.chunks = [];
    
    this.mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        this.chunks.push(e.data);
      }
    };
    
    this.mediaRecorder.onstop = () => {
      const blob = new Blob(this.chunks, { type: 'video/webm' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'cyclops_sonoris_recording.webm';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    };
    
    this.mediaRecorder.start();
    console.log('Enregistrement démarré (vidéo + audio)');
  }
  
  stopRecording() {
    if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
      this.mediaRecorder.stop();
      console.log('Enregistrement arrêté et téléchargement');
    }
  }
  */
}

// Exposer la classe globalement
window.AudiovisualInstallation = AudiovisualInstallation;

// =================== INITIALISATION ===================

(function() {
  let installation = null;

  window.initInstallation = function() {
    const canvas = document.getElementById('installationCanvas');
    if (canvas && !installation) {
      try {
        installation = new AudiovisualInstallation(canvas);
        console.log('Installation démarrée');
      } catch (e) {
        console.error('Erreur lors du démarrage de l\'installation:', e);
      }
    }
  };

  window.destroyInstallation = function() {
    if (installation) {
      installation.stop();
      installation = null;
      console.log('Installation arrêtée');
    }
  };
  
  // =================== ENREGISTREMENT (DÉSACTIVÉ) ===================
  // Les fonctionnalités d'enregistrement sont volontairement désactivées
  // pour empêcher les visiteurs de capturer l'installation.
  
  /*
  window.startCyclopsRecording = function() {
    if (installation) {
      installation.startRecording();
    } else {
      console.warn('Installation non active');
    }
  };
  
  window.stopCyclopsRecording = function() {
    if (installation) {
      installation.stopRecording();
    } else {
      console.warn('Installation non active');
    }
  };
  */

  // Attendre que le DOM soit prêt
  function setupListeners() {
    const installationOverlay = document.getElementById('installationOverlay');
    const installationCloseBtn = document.getElementById('installationCloseBtn');
    
    if (!installationOverlay) {
      // Réessayer plus tard
      setTimeout(setupListeners, 100);
      return;
    }
    
    // Observer pour détecter l'ouverture de la modale
    const observer = new MutationObserver(() => {
      const isVisible = installationOverlay.style.display !== 'none';
      
      if (isVisible && !installation) {
        setTimeout(() => {
          window.initInstallation();
        }, 100);
      }
    });
    
    observer.observe(installationOverlay, {
      attributes: true,
      attributeFilter: ['style']
    });
    
    // Fermeture par bouton
    if (installationCloseBtn) {
      installationCloseBtn.addEventListener('click', () => {
        window.destroyInstallation();
      });
    }
    
    // Fermeture par fond
    installationOverlay.addEventListener('click', (e) => {
      if (e.target === installationOverlay) {
        window.destroyInstallation();
      }
    });
    
    // Fermeture par Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && installationOverlay && installationOverlay.style.display === 'flex') {
        window.destroyInstallation();
      }
    });
  }
  
  // Attendre que le DOM soit chargé
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupListeners);
  } else {
    setupListeners();
  }
})();
