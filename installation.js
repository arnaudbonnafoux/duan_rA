// =================== INSTALLATION AUDIOVISUELLE GÉNÉRATIVE ===================
// Installation "Drone" : oscillateurs qui dérivent + cercles flottants

class AudiovisualInstallation {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    
    // Cycle de la pluie (apparition/disparition) : état initialisé avant le premier resize
    this.rainCyclePeriod = 40; // secondes pour un cycle complet
    this.rainCycleTime = 0;
    this.rainIntensity = 0;

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
    
    // Initialiser système de texte poétique
    this.setupText();
    
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
    this.rainDrops = this.createRainDrops();
    this.createVolcano();
    this.createBlackHole();
  }

  // =================== TROU NOIR ===================

  createBlackHole() {
    const r = Math.min(this.width, this.height) * 0.055;
    this.blackHole = {
      baseX: this.width * 0.7,
      baseY: this.height * 0.28,
      x: this.width * 0.7,
      y: this.height * 0.28,
      t: 0,
      baseTilt: -0.35,
      r,
      tilt: -0.35,
      particles: Array.from({ length: 140 }, () => ({
        angle: Math.random() * Math.PI * 2,
        dist: r * (1.5 + Math.random() * 2.6),
        size: 0.6 + Math.random() * 1.2
      }))
    };
  }

  updateBlackHole(deltaTime) {
    const bh = this.blackHole;
    if (!bh) return;
    // Dérive lente en ellipse et léger balancement du disque
    bh.t += deltaTime;
    bh.x = bh.baseX + Math.sin(bh.t * 0.12) * this.width * 0.04;
    bh.y = bh.baseY + Math.cos(bh.t * 0.09) * this.height * 0.035;
    bh.tilt = bh.baseTilt + Math.sin(bh.t * 0.2) * 0.12;
    bh.particles.forEach(p => {
      // Plus près = plus rapide
      p.angle += deltaTime * 0.9 * Math.pow(bh.r / p.dist, 1.2) * 2;
    });
  }

  drawBlackHole() {
    const bh = this.blackHole;
    if (!bh) return;
    const ctx = this.ctx;
    const squash = 0.28;
    ctx.save();
    ctx.translate(bh.x, bh.y);
    ctx.rotate(bh.tilt);

    // Halo de lentille gravitationnelle
    const halo = ctx.createRadialGradient(0, 0, bh.r, 0, 0, bh.r * 4.5);
    halo.addColorStop(0, 'rgba(255, 170, 90, 0.10)');
    halo.addColorStop(1, 'rgba(255, 170, 90, 0)');
    ctx.fillStyle = halo;
    ctx.beginPath();
    ctx.arc(0, 0, bh.r * 4.5, 0, Math.PI * 2);
    ctx.fill();

    // Particules du disque d'accrétion (partie lointaine, derrière l'horizon)
    ctx.globalCompositeOperation = 'lighter';
    const drawParticles = back => {
      bh.particles.forEach(p => {
        const sin = Math.sin(p.angle);
        if ((sin < 0) !== back) return;
        const x = Math.cos(p.angle) * p.dist;
        const y = sin * p.dist * squash;
        const heat = 1 - (p.dist - bh.r * 1.5) / (bh.r * 2.6);
        ctx.fillStyle = `rgba(255, ${Math.round(150 + heat * 90)}, ${Math.round(80 + heat * 150)}, ${0.25 + heat * 0.35})`;
        ctx.beginPath();
        ctx.arc(x, y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });
    };
    drawParticles(true);
    ctx.globalCompositeOperation = 'source-over';

    // Horizon des événements
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(0, 0, bh.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 200, 140, 0.35)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Partie proche du disque, devant l'horizon
    ctx.globalCompositeOperation = 'lighter';
    drawParticles(false);
    ctx.restore();
  }

  // =================== VOLCAN DE FOND (TRÈS DISCRET) ===================

  createVolcano() {
    const h = this.height;
    const w = this.width;
    this.volcano = {
      peakX: w * 0.24,
      peakY: h * 0.68,
      baseLeft: -w * 0.05,
      baseRight: w * 0.52,
      craterHalfWidth: w * 0.03,
      time: 0
    };
    this.embers = Array.from({ length: 14 }, () => this.createEmber(true));
  }

  createEmber(randomAge = false) {
    const v = this.volcano;
    const life = 5 + Math.random() * 5;
    return {
      x: v.peakX + (Math.random() - 0.5) * v.craterHalfWidth * 1.6,
      y: v.peakY - Math.random() * 6,
      vx: (Math.random() - 0.3) * 6,
      vy: -(14 + Math.random() * 22),
      size: 0.8 + Math.random() * 1.2,
      life,
      age: randomAge ? Math.random() * life : 0
    };
  }

  updateVolcano(deltaTime) {
    if (!this.volcano) return;
    this.volcano.time += deltaTime;
    this.embers.forEach((e, i) => {
      e.age += deltaTime;
      e.x += e.vx * deltaTime;
      e.y += e.vy * deltaTime;
      if (e.age >= e.life) this.embers[i] = this.createEmber();
    });
  }

  drawVolcano() {
    const v = this.volcano;
    if (!v) return;
    const ctx = this.ctx;
    const baseY = this.height;
    const pulse = 0.5 + 0.5 * Math.sin(v.time * 0.35);

    ctx.save();

    // Silhouette : flancs concaves, cratère légèrement échancré
    ctx.beginPath();
    ctx.moveTo(v.baseLeft, baseY);
    ctx.quadraticCurveTo(
      v.peakX - v.craterHalfWidth * 4, baseY - (baseY - v.peakY) * 0.18,
      v.peakX - v.craterHalfWidth, v.peakY
    );
    ctx.quadraticCurveTo(v.peakX, v.peakY + this.height * 0.012, v.peakX + v.craterHalfWidth, v.peakY);
    ctx.quadraticCurveTo(
      v.peakX + v.craterHalfWidth * 4.5, baseY - (baseY - v.peakY) * 0.2,
      v.baseRight, baseY
    );
    ctx.closePath();

    // Les alphas sont faibles : le fond se ré-estompe à chaque image et les cumule
    const body = ctx.createLinearGradient(0, v.peakY, 0, baseY);
    body.addColorStop(0, 'rgba(95, 40, 60, 0.13)');
    body.addColorStop(1, 'rgba(40, 18, 45, 0.04)');
    ctx.fillStyle = body;
    ctx.fill();

    // Lueur du cratère, qui respire très lentement
    ctx.globalCompositeOperation = 'lighter';
    const glowRadius = this.width * 0.09;
    const glow = ctx.createRadialGradient(v.peakX, v.peakY, 0, v.peakX, v.peakY, glowRadius);
    glow.addColorStop(0, `rgba(255, 110, 40, ${0.09 + 0.06 * pulse})`);
    glow.addColorStop(0.4, `rgba(200, 50, 30, ${0.035 + 0.025 * pulse})`);
    glow.addColorStop(1, 'rgba(120, 20, 20, 0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(v.peakX, v.peakY, glowRadius, 0, Math.PI * 2);
    ctx.fill();

    // Braises
    this.embers.forEach(e => {
      const t = e.age / e.life;
      const alpha = 0.35 * Math.sin(Math.PI * t);
      ctx.fillStyle = `rgba(255, ${140 - 70 * t}, 50, ${alpha})`;
      ctx.beginPath();
      ctx.arc(e.x, e.y, e.size, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.restore();
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
  
  // =================== TAMBOUR ===================

  // Planifie en avance les frappes de tambour sur l'horloge audio
  scheduleDrums() {
    const ctx = this.audioContext;
    // Le tambour arrive quand le texte a disparu
    if (this.textState && !this.textState.isComplete) return;
    if (this.nextBeatTime === undefined) {
      this.nextBeatTime = ctx.currentTime + 0.5;
      this.beatIndex = 0;
    }
    const stepDuration = 0.5; // Croche à 60 BPM : pulsation lente
    // Motif de 8 pas : 0 = silence, sinon intensité (tambour grave, ternaire discret)
    const pattern = [1, 0, 0.45, 0, 0.8, 0, 0.45, 0.3];
    while (this.nextBeatTime < ctx.currentTime + 0.3) {
      const velocity = pattern[this.beatIndex % pattern.length];
      if (velocity > 0) this.playDrum(this.nextBeatTime, velocity);
      this.nextBeatTime += stepDuration;
      this.beatIndex++;
    }
  }

  playDrum(time, velocity) {
    const ctx = this.audioContext;
    const env = ctx.createGain();
    env.gain.setValueAtTime(0.0001, time);
    env.gain.exponentialRampToValueAtTime(0.42 * velocity, time + 0.005);
    env.gain.exponentialRampToValueAtTime(0.0001, time + 0.6);

    // Corps : sinus + triangle pour des harmoniques plus claires
    [['sine', 1], ['triangle', 0.2]].forEach(([type, level]) => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      g.gain.value = level;
      osc.type = type;
      osc.frequency.setValueAtTime(140, time);
      osc.frequency.exponentialRampToValueAtTime(55, time + 0.2);
      osc.connect(g);
      g.connect(env);
      osc.start(time);
      osc.stop(time + 0.7);
    });

    // Contourne le filtre passe-bas du drone (sinon le son est étouffé), mais garde la réverbération
    const tone = ctx.createBiquadFilter();
    tone.type = 'lowpass';
    tone.frequency.value = 450;
    env.connect(tone);
    tone.connect(this.dryGain);
    tone.connect(this.wetGain);
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
      
      this.scheduleDrums();

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
      
      // Arrêter le LFO
      try {
        this.lfo.stop();
      } catch (e) {
        // Déjà arrêté
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

  createRainDrops() {
    const count = Math.min(1200, Math.max(300, Math.round(this.width * this.height / 2200)));
    const gaussian = () => {
      const u = 1 - Math.random();
      return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * Math.random());
    };

    // Bande diagonale (haut-droite → bas-gauche) : pente en pixels de x par pixel de y
    this.bandSlope = -0.7 * this.width / this.height;
    const norm = Math.hypot(this.bandSlope, 1);
    this.bandDirX = this.bandSlope / norm;
    this.bandDirY = 1 / norm;
    const bandSigma = this.width * 0.07;

    return Array.from({ length: count }, () => {
      const inBand = Math.random() < 0.8;
      return {
        y: Math.random() * this.height,
        // Décalage horizontal par rapport à l'axe de la bande : serré dans la bande, large pour les étoiles éparses
        offset: inBand ? gaussian() * bandSigma : (Math.random() - 0.5) * this.width * 1.2,
        length: Math.random() * 8 + 6,
        speed: Math.random() * 11 + 14,
        opacity: (Math.random() * 0.3 + 0.7) * (inBand ? 1 : 0.45),
        hue: 200 + Math.random() * 80,          // bleu → violet
        lightness: 75 + Math.random() * 20,     // blanc bleuté
        twinklePhase: Math.random() * Math.PI * 2,
        twinkleSpeed: 0.8 + Math.random() * 1.6
      };
    });
  }

  bandCenterX(y) {
    return this.width * 0.85 + this.bandSlope * y;
  }

  updateRain(deltaTime) {
    // Cycle d'apparition/disparition : 0 → 1 → 0 sur rainCyclePeriod secondes
    this.rainCycleTime = (this.rainCycleTime || 0) + deltaTime;
    const phase = (this.rainCycleTime / this.rainCyclePeriod) * Math.PI * 2;
    this.rainIntensity = 0.5 - 0.5 * Math.cos(phase);

    this.rainDrops.forEach(drop => {
      drop.y += drop.speed * deltaTime;
      if (drop.y - drop.length > this.height) {
        drop.y = -drop.length;
      }
    });
  }

  drawRain() {
    if (!this.rainIntensity || this.rainIntensity < 0.01) return;
    const seconds = this.rainCycleTime;

    this.ctx.save();
    // Mélange additif : les gouttes qui se superposent s'illuminent comme un amas d'étoiles
    this.ctx.globalCompositeOperation = 'lighter';
    this.ctx.lineCap = 'round';

    // Lueur diffuse le long de la bande, perpendiculairement à son axe
    const glowCenterX = this.bandCenterX(this.height / 2);
    const glowCenterY = this.height / 2;
    const perpX = this.bandDirY;
    const perpY = -this.bandDirX;
    const glowRadius = this.width * 0.2;
    const glow = this.ctx.createLinearGradient(
      glowCenterX - perpX * glowRadius, glowCenterY - perpY * glowRadius,
      glowCenterX + perpX * glowRadius, glowCenterY + perpY * glowRadius
    );
    const glowAlpha = 0.16 * this.rainIntensity;
    glow.addColorStop(0, 'hsla(230, 80%, 60%, 0)');
    glow.addColorStop(0.35, `hsla(250, 70%, 60%, ${glowAlpha * 0.5})`);
    glow.addColorStop(0.5, `hsla(215, 70%, 80%, ${glowAlpha})`);
    glow.addColorStop(0.65, `hsla(280, 70%, 60%, ${glowAlpha * 0.5})`);
    glow.addColorStop(1, 'hsla(230, 80%, 60%, 0)');
    this.ctx.fillStyle = glow;
    this.ctx.fillRect(0, 0, this.width, this.height);

    this.rainDrops.forEach(drop => {
      const twinkle = 0.65 + 0.35 * Math.sin(seconds * drop.twinkleSpeed + drop.twinklePhase);
      const alpha = Math.min(1, drop.opacity * this.rainIntensity * twinkle);
      const headX = this.bandCenterX(drop.y) + drop.offset;
      const tailX = headX - this.bandDirX * drop.length;
      const tailY = drop.y - this.bandDirY * drop.length;

      // Halo diffus
      this.ctx.beginPath();
      this.ctx.moveTo(tailX, tailY);
      this.ctx.lineTo(headX, drop.y);
      this.ctx.strokeStyle = `hsla(${drop.hue}, 90%, 70%, ${alpha * 0.35})`;
      this.ctx.lineWidth = 5;
      this.ctx.stroke();

      // Cœur lumineux
      this.ctx.beginPath();
      this.ctx.moveTo(tailX, tailY);
      this.ctx.lineTo(headX, drop.y);
      this.ctx.strokeStyle = `hsla(${drop.hue}, 80%, ${drop.lightness + 5}%, ${alpha})`;
      this.ctx.lineWidth = 2;
      this.ctx.stroke();
    });

    this.ctx.restore();
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
    this.drawVolcano();
    this.drawRain();
    this.drawBlackHole();
    
    // Dessiner les lignes de connexion entre les sphères (blanc)
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
    this.ctx.lineWidth = 1;
    for (let i = 0; i < this.particles.length; i += 3) {
      if (this.particles[i + 1]) {
        this.ctx.beginPath();
        this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
        this.ctx.lineTo(this.particles[i + 1].x, this.particles[i + 1].y);
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
  
  // =================== SYSTÈME DE RÉVÉLATION DU TEXTE ===================
  
  setupText() {
    this.textState = {
      // Les 5 phrases poétiques de l'installation
      phrases: [
        "Le Cyclope n'est pas tué.",
        "Son œil n'est plus.",
        "Sa vision devient résonance.",
        "Le centre disparaît.",
        "Le multiple révèle la conscience."
      ],
      
      // Timing : 15 secondes d'affichage total
      displayDuration: 2700,  // 45 secondes (2700 frames à 60fps)
      initialDelayFrames: 360,  // Délai initial de 6 secondes avant affichage
      
      // État courant
      frameCounter: 0,
      isDisplaying: false,
      isComplete: false
    };
  }
  
  updateText() {
    if (!this.textState) return;
    
    const ts = this.textState;
    ts.frameCounter++;
    
    // Vérifier si on est dans la phase de délai initial
    if (ts.frameCounter < ts.initialDelayFrames) {
      ts.isDisplaying = false;
      return;
    }
    
    // Vérifier si on est dans la plage d'affichage
    const framesSinceDelay = ts.frameCounter - ts.initialDelayFrames;
    if (framesSinceDelay < ts.displayDuration) {
      ts.isDisplaying = true;
    } else {
      ts.isDisplaying = false;
      ts.isComplete = true;
    }
  }
  
  drawText() {
    if (!this.textState) return;
    
    const ts = this.textState;
    
    // Vérifier si le texte est hors plage ou complet
    if (ts.frameCounter < ts.initialDelayFrames) return;
    const framesSinceDelay = ts.frameCounter - ts.initialDelayFrames;
    if (framesSinceDelay > ts.displayDuration) return; // Texte disparu
    
    this.ctx.save();
    
    // Calculer l'opacité (fade out les 3 dernières secondes : 180 frames)
    const fadeOutStart = ts.displayDuration - 180; // 27 sec
    let opacity = 1;
    if (framesSinceDelay > fadeOutStart) {
      const fadeProgress = (framesSinceDelay - fadeOutStart) / 180;
      opacity = Math.max(0, 1 - fadeProgress);
    }
    
    // Configuration du texte
    const fontSize = Math.min(48, this.width / 20);
    this.ctx.font = `bold ${fontSize}px Georgia, serif`;
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    
    // Afficher au centre avec espacement vertical
    const centerX = this.width / 2;
    const centerY = this.height / 2;
    const lineSpacing = fontSize * 1.6;
    const startY = centerY - (lineSpacing * 2); // Commencer 2 lignes avant le centre
    
    // Afficher les 5 phrases empilées verticalement
    // Apparition progressive : chaque phrase s'estompe 6 s après la précédente
    const fadeInFrames = 600;
    const fadeInStagger = 360;
    ts.phrases.forEach((phrase, index) => {
      const yPos = startY + (index * lineSpacing);
      const linearIn = Math.min(1, Math.max(0, (framesSinceDelay - index * fadeInStagger) / fadeInFrames));
      const fadeIn = linearIn * linearIn * (3 - 2 * linearIn); // smoothstep
      const phraseOpacity = opacity * fadeIn;
      if (phraseOpacity <= 0) return;
      
      // Ombre pour lisibilité
      this.ctx.fillStyle = `rgba(0, 0, 0, ${0.7 * phraseOpacity})`;
      this.ctx.fillText(phrase, centerX + 2, yPos + 2);
      
      // Texte principal blanc avec opacité variable
      this.ctx.fillStyle = `rgba(255, 255, 255, ${0.95 * phraseOpacity})`;
      this.ctx.fillText(phrase, centerX, yPos);
    });
    
    this.ctx.restore();
  }
  
  animate = (timestamp) => {
    const currentTime = timestamp ?? performance.now();
    const deltaTime = this.lastFrameTime === undefined
      ? 0
      : Math.min((currentTime - this.lastFrameTime) / 1000, 0.05);
    this.lastFrameTime = currentTime;
    this.state.time++;
    
    this.updateAudio();
    this.updateRain(deltaTime);
    this.updateVolcano(deltaTime);
    this.updateBlackHole(deltaTime);
    this.updateParticles();
    this.updateText();
    this.draw();
    this.drawText();
    
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
