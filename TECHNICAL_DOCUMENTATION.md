# Documentation Technique - Installation Audiovisuelle Générative

## 1. Vue d'ensemble

L'Installation Audiovisuelle Générative est une expérience immersive combinant synthèse sonore générative avec visualisation en temps réel. Elle crée une atmosphère méditative de type « drone » avec des oscillations sonores lentes et une représentation visuelle de l'énergie audio par des particules en mouvement.

**Objectif artistique** : Créer une cathédrale sonore et visuelle où l'audio et le visuel se répondent et évoluent ensemble de façon organique.

---

## 2. Architecture globale

### 2.1 Structure des fichiers

```
index.html              # Modèle HTML - ajoute le bouton et la modale
style.css              # Styles CSS - mise en forme modale et canvas
script.js              # Logique principale - gestion événements modales
installation.js        # Module audiovisuel - classe AudiovisualInstallation
```

### 2.2 Flux d'exécution

1. **Chargement initial** : Page HTML chargée, installation.js enregistre classe globale
2. **Interaction utilisateur** : Clic sur bouton "Installation Audiovisuelle"
3. **Initialisation** : Appel `window.initInstallation()` → création instance AudiovisualInstallation
4. **Animation** : Boucle `requestAnimationFrame` (~60 fps) met à jour audio et visuel
5. **Fermeture** : Clic sur ×, appel `window.destroyInstallation()` → cleanup audio

---

## 3. Composant Audio

### 3.1 Architecture du signal audio

```
┌─────────────────────────────────────────────────────────────┐
│                    Web Audio Graph                           │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Oscillators (3)          White Noise Buffer                 │
│  ├─ Sine 55 Hz           │                                   │
│  ├─ Sawtooth 110 Hz      └─ Highpass Filter (200Hz)         │
│  └─ Triangle 165 Hz                                          │
│       │                          │                           │
│       └──────────────┬───────────┘                           │
│                      │                                       │
│              Biquad Filter (Lowpass)                         │
│              Modulated: 200-2000 Hz                          │
│                      │                                       │
│          ┌───────────┴───────────┐                           │
│          │                       │                           │
│      Dry Gain              Reverb (Wet Path)                 │
│      (0.55)                     │                            │
│          │                ┌──────┴─────────┐                 │
│          │            Delay Nodes (4)      │                 │
│          │            ├─ 50ms              │                 │
│          │            ├─ 100ms             │                 │
│          │            ├─ 150ms             │                 │
│          │            └─ 250ms             │                 │
│          │            (feedback: 0.70)     │                 │
│          │                     │           │                 │
│          │                Wet Gain (0.65)  │                 │
│          └──────────────┬──────────────────┘                 │
│                         │                                    │
│                   Destination                                │
│                  (Main Out)                                  │
└─────────────────────────────────────────────────────────────┘
```

### 3.2 Composants audio détaillés

#### **Oscillateurs (3 voix)**
- **Sine** : 55 Hz (fondamentale, très pures - la base du drone)
- **Sawtooth** : 110 Hz (très riche en harmoniques - texture épaisse)
- **Triangle** : 165 Hz (harmoniques intermédiaires - équilibre timbre)
- **Modulation de fréquence** : Chaque oscillateur dérive lentement
  - Dérive = `baseFreq + sin(time × 0.0005) × 20 Hz`
  - Crée un effet de "glissement" naturel et méditation

#### **White Noise (Bruit blanc)**
- Joué en boucle continu au travers d'un filtre passe-haut (200 Hz)
- Ajoute de la texture et du "souffle" au drone
- Crée une ambiance aérienne et subtile

#### **Biquad Filter (Filtre passe-bas)**
- Modulation dynamique de la fréquence de coupure
- Fréquence = `500 + sin(time × 0.001) × 400 + cos(time × 0.0008) × 200`
- Clamped entre 200-2000 Hz
- Effet : Le timbre du drone "respire" et se transforme lentement

#### **LFO (Oscillateur Basse-Fréquence)**
- Fréquence : **0.1 Hz** (oscillation très lente - 10 secondes de période)
- Onde : Sinus
- Fonction : Module les gains des 3 oscillateurs
- Effet : Volume du drone augmente/diminue graduellement, crée pulsation

#### **Reverb (Chaîne de délais avec feedback)**
| Paramètre | Valeur | Rôle |
|-----------|--------|------|
| Wet Gain | 0.65 | Intensité du signal traité |
| Dry Gain | 0.55 | Signal direct non traité |
| Délais | 50, 100, 150, 250 ms | Crée effet de chambre spacieuse |
| Feedback | 0.70 | Résonance - longueur décroissance |
| Délai Gain | 0.80 | Niveau sortie de chaque délai |

**Caractéristique** : 4 nœuds délai en chaîne avec feedback, créant une queue de réverbération très longue et immersive.

### 3.3 Fonctions d'update audio

```javascript
updateAudio() {
  // Met à jour chaque frame
  
  // 1. Oscillateurs dérivent en fréquence
  freq = baseFreq + sin(time × 0.0005) × 20
  
  // 2. Filtre respire
  filterFreq = 500 + sin(time × 0.001) × 400 + cos(time × 0.0008) × 200
  filter.frequency = clamp(filterFreq, 200, 2000)
  
  // 3. Énergie = pulsation lente 0-1
  state.energy = sin(time × 0.001) × 0.5 + 0.5
  
  // 4. Drift pour contexte visuel
  state.drift = sin(time × 0.0005) × 0.5 + 0.5
}
```

---

## 4. Composant Visuel

### 4.1 Architecture Canvas

- **Résolution** : 800×600 pixels
- **Fréquence** : 60 FPS via `requestAnimationFrame`
- **Technique de rendu** : Semi-transparent background trail (motion blur naturel)

### 4.2 Particules

**Propriétés par particule** :
```javascript
{
  x, y           // Position (float)
  radius         // Rayon de base (20-50 px)
  speedX, speedY // Vitesse (-0.4 à +0.4 px/frame)
  hueOffset      // Décalage couleur (0-360°)
}
```

**Nombre** : 30 particules distribuées aléatoirement

**Physique** :
- Vitesse affectée par énergie audio : `vitesse × (1.2 + energy × 0.3)`
  - À énergie = 0 : vitesse × 1.2
  - À énergie = 1 : vitesse × 1.5
- Rebond sur bords canvas (vitesse inversée)
- Pas de friction - mouvement continu

### 4.3 Traînées (Trails)

- **Historique** : 8 positions précédentes conservées par particule
- **Technique** : Chaque position stockée avec alpha décroissante
- **Rendu** : Cercles progressivement plus transparents derrière particule
- **Effet** : Motion blur naturel montrant trajectoire récente

### 4.4 Visuels de connexion

- **Lignes entre particules** : Connectées tous les 3ème particule
- **Couleur** : Même teinte que particules source
- **Alpha** : 0.3 pour subtilité
- **Effet** : Crée impression de réseau/structure cohésif

### 4.5 Halos et pulsation

**Halo radial** :
- Gradient du centre (couleur) vers transparent
- Rayon : `radius × (1 + energy × 0.3)`
- Crée aura colorée autour de chaque sphère

**Pulsation** :
- Rayon multiplié par facteur : `1 + energy × 0.3`
- Synchronisé avec énergie audio
- Amplitude maximale : +30% du rayon

### 4.6 Palette de couleurs

- **Modèle** : HSL (teinte, saturation, luminosité)
- **Teinte** : `(hueOffset + time × 0.05) % 360°`
  - Rotation très lente pour évolution chromatique
- **Saturation** : 70% - couleurs vives mais pas écrasantes
- **Luminosité** : 50% - contraste élevé sur fond blanc

### 4.7 Fonction de rendu principal

```javascript
draw() {
  // 1. Fond semi-transparent = trail automatique
  ctx.fillStyle = 'rgba(255, 255, 255, 0.3)'
  ctx.fillRect(0, 0, width, height)
  
  // 2. Pour chaque particule:
  //    a. Stocker position dans historique
  //    b. Dessiner traînées (8 positions antérieures)
  //    c. Dessiner lignes de connexion
  //    d. Dessiner halo radial avec pulsation
  
  // 3. Pulsation synchronisée à energy
  pulseFactor = 1 + state.energy × 0.3
}
```

---

## 5. Synchronisation Audio ↔ Visuel

### 5.1 Variable partagée : `state.energy`

| Composant | Utilisation |
|-----------|-------------|
| Audio | LFO module gains oscillateurs |
| Visuel | Vitesse particules, rayon pulsation, intensité halos |

**Formule** : `sin(time × 0.001) × 0.5 + 0.5` → oscillation lente 0-1 Hz

### 5.2 Effet de synchronisation

- Quand énergie augmente → Son plus fort + Particules bougent plus vite + Halos plus grands
- Quand énergie diminue → Son plus doux + Particules ralentissent + Halos rétrécissent
- **Résultat** : Expérience cohérente où audio et visuel respirent ensemble

---

## 6. Intégration dans le site

### 6.1 Modifications HTML

**index.html** :
```html
<!-- Bouton onglet -->
<button class="tab-button" id="tabInstallation">
  Installation Audiovisuelle
</button>

<!-- Modale overlay -->
<div id="installationOverlay" class="installation-overlay">
  <div class="installation-content">
    <button id="installationCloseBtn">×</button>
    <canvas id="installationCanvas" width="800" height="600"></canvas>
  </div>
</div>
```

### 6.2 Styles CSS

**style.css** :
```css
.installation-overlay {
  position: fixed;
  top: 0; left: 0;
  width: 100%; height: 100%;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(5px);
  z-index: 1000;
  display: none; /* Caché par défaut */
  justify-content: center;
  align-items: center;
}

.installation-overlay[style*="display: flex"] {
  display: flex; /* Affiché quand modale ouverte */
}

.installation-content {
  width: 90%;
  max-width: 900px;
  height: 80vh;
  background: var(--color-bg-light);
  border-radius: 15px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.3);
  position: relative;
}

.installation-canvas {
  width: 100%;
  height: 100%;
  display: block;
}

.installation-close-btn {
  position: absolute;
  top: 20px; right: 20px;
  width: 40px; height: 40px;
  background: rgba(255, 255, 255, 0.7);
  border: none;
  border-radius: 50%;
  font-size: 24px;
  cursor: pointer;
  z-index: 10;
}
```

### 6.3 Gestion événements JavaScript

**script.js** :
```javascript
// Ouverture modale
document.getElementById('tabInstallation').addEventListener('click', () => {
  const overlay = document.getElementById('installationOverlay');
  overlay.style.display = 'flex';
  document.body.style.overflow = 'hidden';
  
  // Délai pour DOM ready
  setTimeout(() => window.initInstallation(), 100);
});

// Fermeture modale
document.getElementById('installationCloseBtn').addEventListener('click', () => {
  const overlay = document.getElementById('installationOverlay');
  overlay.style.display = 'none';
  document.body.style.overflow = '';
  
  window.destroyInstallation();
});

// Fermeture à Échap
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    document.getElementById('installationCloseBtn').click();
  }
});
```

---

## 7. Cycle de vie

### 7.1 Initialisation (`window.initInstallation()`)

1. Récupère canvas du DOM
2. Crée instance AudiovisualInstallation
3. Dans le constructeur :
   - Initialise AudioContext Web Audio API
   - Crée 3 oscillateurs + nœuds traitement
   - Créé 30 particules en positions aléatoires
   - Démarre boucle animation `requestAnimationFrame`

### 7.2 Boucle d'animation (chaque frame ~16ms)

```
updateAudio() {
  ├─ Met à jour fréquences oscillateurs
  ├─ Met à jour fréquence filtre
  ├─ Recalcule state.energy
  └─ Recalcule state.drift
  
updateParticles() {
  ├─ Applique vitesse modifiée par energy
  ├─ Détecte rebonds
  └─ Met à jour historique positions
  
draw() {
  ├─ Efface (semi-transparent)
  ├─ Dessine traînées
  ├─ Dessine connexions
  └─ Dessine halos pulsants
  
requestAnimationFrame() → Prochaine frame
```

### 7.3 Destruction (`window.destroyInstallation()`)

1. Arrête animation loop (`cancelAnimationFrame`)
2. Arrête LFO oscillateur
3. Arrête nœud bruit blanc
4. Arrête 3 oscillateurs principaux
5. Libère référence instance
6. Garbage collection automatique

---

## 8. Paramètres de tuning

### 8.1 Paramètres audio critiques

| Paramètre | Valeur | Effet |
|-----------|--------|-------|
| Fréq Sine | 55 Hz | Base drone - plus bas = plus sombre |
| Fréq Sawtooth | 110 Hz | Richesse harmonique |
| Fréq Triangle | 165 Hz | Équilibre timbre |
| LFO Fréq | 0.1 Hz | Vitesse respiration (10s période) |
| Filter Dry/Wet | 500-2000 Hz | Respiration timbre |
| Wet Gain | 0.65 | Intensité reverb |
| Feedback Reverb | 0.70 | Longueur décroissance |

### 8.2 Paramètres visuels critiques

| Paramètre | Valeur | Effet |
|-----------|--------|-------|
| Nombre particules | 30 | Densité visuelle |
| Rayon particules | 20-50 px | Taille variée |
| Vitesse base | 0.4 px/frame | Mouvement tranquille |
| Multiplicateur energy | 1.2 + energy×0.3 | Lien audio-visuel |
| Longueur traînées | 8 frames | Fluidité mouvement |
| Facteur pulsation | 1 + energy×0.3 | Synchronisation |

---

## 9. Notes de performance

### 9.1 Optimisations appliquées

1. **Trail semi-transparent** au lieu de clear() - une seule opération par frame
2. **Boucle animation arrow function** - préserve `this` sans bind
3. **Canvas attributes** (width/height) plutôt que CSS - évite distortion
4. **Création particules une fois** - pas de allocation dynamique en boucle

### 9.2 Estimations ressources

- **CPU** : ~5-10% (animation légère)
- **GPU** : Canvas 2D utilise CPU accélérée
- **Audio** : ~1-2% (Web Audio très optimisé)
- **RAM** : ~2-3 MB (AudioContext + particules + buffers)

### 9.3 Compatibilité

- **Navigateurs** : Tous les modernes (Chrome, Firefox, Safari, Edge 2020+)
- **Condition** : HTTPS recommandé pour Web Audio API full support
- **Résolution** : Responsive jusqu'à 900px de large

---

## 10. Architecture classe complète

```javascript
class AudiovisualInstallation {
  constructor(canvas)
  initAudio()              // Web Audio setup
  updateAudio()            // Chaque frame: modulation paramètres
  createParticles(count)   // Initialisation particules
  updateParticles()        // Physique et collisions
  draw()                   // Rendu Canvas
  animate = () => {}       // Boucle frame
  start()                  // Lance animation
  stop()                   // Arrête tout
}
```

---

## 11. Roadmap évolution possible

- [ ] Interaction utilisateur (souris → module oscillateurs)
- [ ] Enregistrement vidéo de la session
- [ ] Export audio 30 sec du moment
- [ ] Variation algorithme particules (Boid flocking)
- [ ] Visualiseur spectre FFT
- [ ] Multi-tracks audio (plusieurs drones simultanés)
- [ ] Connexion WebSocket pour expérience collaborative

---

**Document généré** : Juin 2026  
**Version Installation** : 1.0 - Reverb intensifiée  
**Auteur technique** : GitHub Copilot
