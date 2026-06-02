// =================== INSTALLATION AUDIOVISUELLE GÉNÉRATIVE ===================
// Installation "Drone" : oscillateurs qui dérivent + cercles flottants

class AudiovisualInstallation {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.width = canvas.width;
    this.height = canvas.height;
    
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
  
  // =================== WEB AUDIO API ===================
  
  initAudio() {
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      
      // Créer 3 oscillateurs pour le "drone" avec des types différents
      const baseFreq = 55; // Fréquence grave de base
      const waveTypes = ['sine', 'sawtooth', 'triangle'];
      
      this.oscillators = [];
      this.gains = [];
      
      // Créer un filtre lowpass pour moduler le timbre
      this.filter = this.audioContext.createBiquadFilter();
      this.filter.type = 'lowpass';
      this.filter.frequency.value = 1000; // Fréquence de coupure initiale
      this.filter.Q.value = 1;
      
      // Créer une reverb avec des delays et feedback
      this.dryGain = this.audioContext.createGain();
      this.wetGain = this.audioContext.createGain();
      this.wetGain.gain.value = 0.55; // Baissé de 0.65 à 0.55 pour éviter saturation
      
      // Créer plusieurs delays pour simuler une reverb
      const delayTimes = [0.05, 0.1, 0.15, 0.25]; // Ajout d'un délai supplémentaire
      this.delayNodes = [];
      
      delayTimes.forEach(time => {
        const delayNode = this.audioContext.createDelay(0.5);
        const feedbackGain = this.audioContext.createGain();
        const delayGain = this.audioContext.createGain();
        
        delayNode.delayTime.value = time;
        feedbackGain.gain.value = 0.60; // Baissé de 0.70 à 0.60 pour réduire saturation
        delayGain.gain.value = 0.70; // Baissé de 0.80 à 0.70
        
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
      this.lfo.frequency.value = 0.1; // Modulation très lente (réduit de 0.3 à 0.1)
      this.lfoGain.gain.value = 0.15; // Force de la modulation
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
      
      for (let i = 0; i < 3; i++) {
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        
        // Varier les types d'ondes
        osc.type = waveTypes[i];
        osc.frequency.value = baseFreq * (i + 1); // 55, 110, 165 Hz
        
        // Volume légèrement plus faible pour les ondes complexes
        const volumeFactor = i === 0 ? 0.1 : 0.08;
        gain.gain.value = volumeFactor;
        
        osc.connect(gain);
        gain.connect(this.filter);
        
        // Connecter le LFO pour moduler le volume
        this.lfoGain.connect(gain.gain);
        
        osc.start();
        
        this.oscillators.push(osc);
        this.gains.push(gain);
      }
      this.lfo.start();
      
      // Connecter le filtre à la sortie (dry + wet)
      this.dryGain.connect(this.audioContext.destination);
      this.wetGain.connect(this.audioContext.destination);
      
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
      // Faire dériver les fréquences lentement
      const drift = Math.sin(this.state.time * 0.0005) * 20;
      
      this.oscillators.forEach((osc, i) => {
        const baseFreq = 55 * (i + 1);
        osc.frequency.setTargetAtTime(
          baseFreq + drift,
          this.audioContext.currentTime,
          0.1
        );
      });
      
      // Moduler la fréquence de coupure du filtre
      // Variation lente et fluide
      const filterFreq = 500 + Math.sin(this.state.time * 0.001) * 400 + Math.cos(this.state.time * 0.0008) * 200;
      if (this.filter) {
        this.filter.frequency.setTargetAtTime(
          Math.max(200, Math.min(2000, filterFreq)),
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
        radius: Math.random() * 30 + 20,
        speedX: (Math.random() - 0.5) * 0.8,      // Réduit de 2 à 0.8
        speedY: (Math.random() - 0.5) * 0.8,      // Réduit de 2 à 0.8
        hueOffset: (i / count) * 360
      });
    }
    return particles;
  }
  
  updateParticles() {
    this.particles.forEach(p => {
      // Mouvement influencé par l'énergie audio (réduit de 2 à 1.2)
      p.x += p.speedX * (1.2 + this.state.energy * 0.3);
      p.y += p.speedY * (1.2 + this.state.energy * 0.3);
      
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
    // Fond blanc avec légère traînée (trail effect)
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    this.ctx.fillRect(0, 0, this.width, this.height);
    this.ctx.globalAlpha = 1.0;
    
    // Dessiner les lignes de connexion entre les sphères
    const hue1 = (this.state.time * 0.01 + 240) % 360;
    this.ctx.strokeStyle = `hsla(${hue1}, 50%, 40%, 0.1)`;
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
      const hue = (p.hueOffset + this.state.time * 0.02) % 360;
      
      // Effet de pulsation basé sur l'énergie audio
      const pulseFactor = 1 + this.state.energy * 0.3;
      const pulsingRadius = p.radius * pulseFactor;
      
      // Traînée (trails)
      if (this.trails[index]) {
        this.trails[index].push({x: p.x, y: p.y});
        if (this.trails[index].length > 8) {
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
