// =================== PROTECTION DE L'IMAGE HEADER ===================

// Empêcher le téléchargement de l'image du header
const headerImg = document.querySelector('.img_header');
if (headerImg) {
  headerImg.addEventListener('contextmenu', (e) => e.preventDefault());
  headerImg.addEventListener('dragstart', (e) => e.preventDefault());
}

// =================== GESTION MODE SOMBRE ===================

const themeToggle = document.getElementById('themeToggle');
const htmlElement = document.documentElement;

// Charger la préférence de thème
const savedTheme = localStorage.getItem('theme') || 'light';
if (savedTheme === 'dark') {
  document.body.classList.add('dark-mode');
  themeToggle.textContent = '☀️';
}

themeToggle.addEventListener('click', () => {
  document.body.classList.toggle('dark-mode');
  
  if (document.body.classList.contains('dark-mode')) {
    localStorage.setItem('theme', 'dark');
    themeToggle.textContent = '☀️';
    themeToggle.setAttribute('aria-label', 'Activer le mode clair');
  } else {
    localStorage.setItem('theme', 'light');
    themeToggle.textContent = '🌙';
    themeToggle.setAttribute('aria-label', 'Activer le mode sombre');
  }
  // Annoncer le changement aux lecteurs d'écran
  const announcement = document.body.classList.contains('dark-mode') ? 'Mode sombre activé' : 'Mode clair activé';
  const ariaLive = document.createElement('div');
  ariaLive.setAttribute('role', 'status');
  ariaLive.setAttribute('aria-live', 'polite');
  ariaLive.style.position = 'absolute';
  ariaLive.style.left = '-10000px';
  ariaLive.textContent = announcement;
  document.body.appendChild(ariaLive);
  setTimeout(() => ariaLive.remove(), 1000);
});

// =================== LISTES DES IMAGES ===================

// Liste des images - Galerie 1
const images1 = [
  { src: 'images/visuel_1.webp', title: 'Alienus Omnium' },
  { src: 'images/visuel_2.webp', title: 'Splendores Nihili' },
  { src: 'images/visuel_3.webp', title: 'Topographia Somni' },
  { src: 'images/visuel_4.webp', title: 'Fragmentum Temporis' },
  { src: 'images/visuel_6.webp', title: 'Viae Errantes' },
  { src: 'images/visuel_7.webp', title: 'Spectra Lucis' },
  { src: 'images/visuel_8.webp', title: 'Respiratio Vacui' },
  { src: 'images/visuel_9.webp', title: 'Fluxus Aeternalis' },
  { src: 'images/visuel_10.webp', title: 'Materia Spiritus' },
  { src: 'images/visuel_11.webp', title: 'Echoes Silentii' },
  { src: 'images/visuel_13.webp', title: 'Cartographia Invisibilis' },
  { src: 'images/visuel_14.webp', title: 'Osmosis Colorum' },
];

// Liste des images - Galerie 2
const images2 = [
  //{ src: 'images/visuel_23.webp', title: 'Harmonie Chromatique 1' },
  { src: 'images/visuel_24.webp', title: 'Saltus Tincturarum' },
  { src: 'images/visuel_25.webp', title: 'Fusio Colorata' },
  { src: 'images/visuel_26.webp', title: 'Murmura Chromatica' },
  { src: 'images/visuel_27.webp', title: 'Symphonia Tacita' },
  { src: 'images/visuel_28.webp', title: 'Vibratio Chromatica' },
  { src: 'images/visuel_29.webp', title: 'Consonantia Abstracta' },
  { src: 'images/visuel_30.webp', title: 'Dissonantia Harmoniosa' },
  { src: 'images/visuel_31.webp', title: 'Crescendo Visualis' },
  //{ src: 'images/visuel_33.webp', title: 'Vertigines Coloratae' },
  { src: 'images/visuel_34.webp', title: 'Resonantia Infinita' },
  { src: 'images/visuel_35.webp', title: 'Conclusio Somnialis' },
];

let currentGallery = 'gallery1';
let currentImages = images1;
let currentImageIndex = 0;

const gallery1 = document.getElementById('gallery1');
const gallery2 = document.getElementById('gallery2');

// Vérifier que les conteneurs existent
if (!gallery1 || !gallery2) {
  console.error('Erreur: Les conteneurs de galerie n\'existent pas dans le DOM');
}

// Créer les deux galeries
function createGallery(containerEl, images) {
  const grid = document.createElement('div');
  grid.className = 'gallery-grid';

  images.forEach((img, index) => {
    const item = document.createElement('div');
    item.className = 'gallery-item';
    item.setAttribute('role', 'button');
    item.setAttribute('tabindex', '0');
    item.setAttribute('aria-label', `${img.title} - Cliquez pour agrandir`);

    const wrapper = document.createElement('div');
    wrapper.className = 'img-wrapper';

    const imageEl = document.createElement('img');
    imageEl.alt = img.title;
    imageEl.loading = 'lazy';
    // Utiliser data-src pour lazy loading manuel
    imageEl.dataset.src = img.src;
    imageEl.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"%3E%3Crect fill="%23f0f0f0" width="400" height="300"/%3E%3C/svg%3E';

    const title = document.createElement('p');
    title.className = 'gallery-title';
    title.textContent = img.title;

    wrapper.appendChild(imageEl);
    item.appendChild(title);
    item.appendChild(wrapper);
    
    // Intersection Observer pour lazy loading
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          observer.unobserve(img);
        }
      });
    });
    imageObserver.observe(imageEl);

    // Ajouter une couche de protection invisible
    const protectionLayer = document.createElement('div');
    protectionLayer.className = 'image-protection';
    wrapper.appendChild(protectionLayer);

    // Bloquer le clic droit sur l'image
    imageEl.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      return false;
    });

    // Bloquer le drag-drop
    imageEl.addEventListener('dragstart', (e) => {
      e.preventDefault();
      return false;
    });

    // Bloquer le clic droit sur la couche de protection
    protectionLayer.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      return false;
    });

    // Bloquer le drag-drop sur la couche de protection
    protectionLayer.addEventListener('dragstart', (e) => {
      e.preventDefault();
      return false;
    });

    // Modale au clic ou Entrée/Espace
    item.addEventListener('click', () => openModal(index));
    item.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openModal(index);
      }
    });

    grid.appendChild(item);
  });

  containerEl.appendChild(grid);
}

createGallery(gallery1, images1);
createGallery(gallery2, images2);

// =================== MODALE BIO ===================

const bioBtn = document.getElementById('bioBtn');
const bioOverlay = document.createElement('div');
bioOverlay.className = 'bio-overlay';
bioOverlay.setAttribute('role', 'dialog');
bioOverlay.setAttribute('aria-label', 'Biographie de l\'artiste');

const bioContent = document.createElement('div');
bioContent.className = 'bio-content';

const bioCLoseBtn = document.createElement('button');
bioCLoseBtn.className = 'bio-close';
bioCLoseBtn.textContent = '×';
bioCLoseBtn.setAttribute('aria-label', 'Fermer');
bioCLoseBtn.addEventListener('click', () => closeBioModal());

const bioText = document.createElement('div');
bioText.className = 'bio-text';
bioText.innerHTML = `
  <h2>De Artifice duan rA</h2>
  <p>Salute in domicilium digitale duan rA, artificis qui limites inter abstractum et concretum, inter ordinem et chaos investigat. Creationes eius, in galleriis "Viae Errantes" et "Revolutiones Formales" congregatae, quaestionem perpetuam pulchritudinis sine fine exprimunt, ubi unaquaeque opus fabulam formarum, colorum et motus narratur.</p>
  <p>Pulchritudo sine fine - ornamentum aeternum - est philosophia quae artem eius regit.</p>
  <p><a href="https://www.instagram.com/projet_duanra/" target="_blank" rel="noopener noreferrer" aria-label="Compte Instagram de duan rA"><i class="fab fa-instagram"></i></a><span style="display: inline-block; width: 20px;"></span><a href="https://arnaudbonnafoux.github.io/" target="_blank" rel="noopener noreferrer" aria-label="Portfolio d'Arnaud Bonnafoux"><i class="fas fa-music"></i></a></p>
`;

bioContent.appendChild(bioCLoseBtn);
bioContent.appendChild(bioText);
bioOverlay.appendChild(bioContent);
document.body.appendChild(bioOverlay);

// Événements modale bio
if (bioBtn) {
  bioBtn.addEventListener('click', () => openBioModal());
} else {
  console.warn('Le bouton bioBtn n\'a pas été trouvé');
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && bioOverlay.style.display === 'flex') {
    closeBioModal();
  }
});

bioOverlay.addEventListener('click', (e) => {
  if (e.target === bioOverlay) {
    closeBioModal();
  }
});

function openBioModal() {
  bioOverlay.style.display = 'flex';
  document.body.style.overflow = 'hidden';
  bioCLoseBtn.focus();
}

function closeBioModal() {
  bioOverlay.style.display = 'none';
  document.body.style.overflow = 'auto';
}

// Gestion des onglets
const tabGallery2 = document.getElementById('tabGallery2');
const galleryTitle = document.getElementById('galleryTitle');
let isGallery2Active = false;

tabGallery2.addEventListener('click', () => {
  isGallery2Active = !isGallery2Active;
  
  gallery1.style.display = isGallery2Active ? 'none' : 'block';
  gallery2.style.display = isGallery2Active ? 'block' : 'none';
  
  tabGallery2.classList.toggle('active', isGallery2Active);
  
  // Changer le titre et le texte du bouton
  if (isGallery2Active) {
    galleryTitle.textContent = 'Galerie "Revolutiones Formales"';
    tabGallery2.textContent = 'Galerie Viae Errantes';
  } else {
    galleryTitle.textContent = 'Galerie "Viae Errantes"';
    tabGallery2.textContent = 'Galerie Revolutiones Formales';
  }
  
  // Mettre à jour la galerie actuelle
  currentGallery = isGallery2Active ? 'gallery2' : 'gallery1';
  currentImages = isGallery2Active ? images2 : images1;
  currentImageIndex = 0;
});

// =================== MODALE ===================

const modalOverlay = document.createElement('div');
modalOverlay.className = 'modal-overlay';
modalOverlay.setAttribute('role', 'dialog');
modalOverlay.setAttribute('aria-label', 'Visualisation agrandie de l\'image');

const modalContent = document.createElement('div');
modalContent.className = 'modal-content';

// Bouton précédent
const prevBtn = document.createElement('button');
prevBtn.className = 'modal-nav-btn modal-prev';
prevBtn.textContent = '❮';
prevBtn.setAttribute('aria-label', 'Image précédente');
prevBtn.addEventListener('click', () => showPreviousImage());

// Image
const modalImage = document.createElement('img');
modalImage.setAttribute('role', 'img');

// Ajouter protection sur l'image modale
modalImage.addEventListener('contextmenu', (e) => {
  e.preventDefault();
  return false;
});

modalImage.addEventListener('dragstart', (e) => {
  e.preventDefault();
  return false;
});

// Créer une couche de protection pour la modale
const modalImageWrapper = document.createElement('div');
modalImageWrapper.className = 'modal-image-wrapper';

// Créer la couche invisible de protection
const modalImageProtection = document.createElement('div');
modalImageProtection.className = 'modal-image-protection';

// Bloquer le clic droit sur la couche de protection modale
modalImageProtection.addEventListener('contextmenu', (e) => {
  e.preventDefault();
  return false;
});

// Bloquer le drag-drop sur la couche de protection modale
modalImageProtection.addEventListener('dragstart', (e) => {
  e.preventDefault();
  return false;
});

// Titre + compteur
const modalInfoContainer = document.createElement('div');
modalInfoContainer.className = 'modal-info';

const modalTitle = document.createElement('p');
modalTitle.className = 'modal-title';

const modalCounter = document.createElement('p');
modalCounter.className = 'modal-counter';

modalInfoContainer.appendChild(modalTitle);
modalInfoContainer.appendChild(modalCounter);

// Bouton suivant
const nextBtn = document.createElement('button');
nextBtn.className = 'modal-nav-btn modal-next';
nextBtn.textContent = '❯';
nextBtn.setAttribute('aria-label', 'Image suivante');
nextBtn.addEventListener('click', () => showNextImage());

// Playlist audio
const audioPlaylist = [
  'audio/Life motion-second movement.mp3',
  'audio/The light of inside.mp3'
  /*"audio/spirale_de_l'infini.mp3",
  'audio/Ritual song for your cat.mp3',
  'audio/fantasme_faune.mp3',
  'audio/bats_attack.mp3',
  'audio/Confinement_part 2.mp3',
  'audio/passions_infâmes.mp3'*/
];
let currentAudioIndex = 0;

// Élément audio
const modalAudio = document.createElement('audio');
modalAudio.id = 'modal-audio';
modalAudio.preload = 'auto';
modalAudio.src = audioPlaylist[currentAudioIndex];

// Gestion de la fin d'un morceau - passer au suivant
modalAudio.addEventListener('ended', () => {
  currentAudioIndex = (currentAudioIndex + 1) % audioPlaylist.length;
  modalAudio.src = audioPlaylist[currentAudioIndex];
  modalAudio.play();
});

// Bouton de contrôle audio
const audioToggleBtn = document.createElement('button');
audioToggleBtn.className = 'modal-audio-btn';
audioToggleBtn.textContent = '🔊';
audioToggleBtn.setAttribute('aria-label', 'Muet - Cliquez pour couper le son');
let isAudioPlaying = false;
audioToggleBtn.addEventListener('click', () => {
  if (isAudioPlaying) {
    modalAudio.pause();
    audioToggleBtn.textContent = '🔇';
    audioToggleBtn.setAttribute('aria-label', 'Son coupé - Cliquez pour activer le son');
    isAudioPlaying = false;
  } else {
    modalAudio.play();
    audioToggleBtn.textContent = '🔊';
    audioToggleBtn.setAttribute('aria-label', 'Son actif - Cliquez pour couper le son');
    isAudioPlaying = true;
  }
});

// Bouton fermer
const closeBtn = document.createElement('button');
closeBtn.className = 'modal-close';
closeBtn.textContent = '×';
closeBtn.setAttribute('aria-label', 'Fermer');
closeBtn.addEventListener('click', () => closeModal());

modalContent.appendChild(closeBtn);
modalContent.appendChild(audioToggleBtn);
modalContent.appendChild(prevBtn);
modalContent.appendChild(modalImageWrapper);
modalImageWrapper.appendChild(modalImage);
modalImageWrapper.appendChild(modalImageProtection);
modalContent.appendChild(modalInfoContainer);
modalContent.appendChild(nextBtn);
modalOverlay.appendChild(modalContent);
document.body.appendChild(modalOverlay);
document.body.appendChild(modalAudio);

// Fermeture avec Échap
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && modalOverlay.style.display === 'flex') {
    closeModal();
  }
  if (e.key === 'ArrowLeft' && modalOverlay.style.display === 'flex') {
    showPreviousImage();
  }
  if (e.key === 'ArrowRight' && modalOverlay.style.display === 'flex') {
    showNextImage();
  }
});

// Fermer en cliquant sur overlay
modalOverlay.addEventListener('click', (e) => {
  if (e.target === modalOverlay) {
    closeModal();
  }
});

function openModal(index) {
  currentImageIndex = index;
  updateModalImage();
  modalOverlay.style.display = 'flex';
  document.body.style.overflow = 'hidden';
  closeBtn.focus();
  // Lancer la musique
  modalAudio.currentTime = 0;
  modalAudio.play();
  isAudioPlaying = true;
  audioToggleBtn.textContent = '🔊';
}

function updateModalImage() {
  const img = currentImages[currentImageIndex];
  modalImage.src = img.src;
  modalImage.alt = img.title;
  modalTitle.textContent = img.title;
  modalCounter.textContent = `${currentImageIndex + 1} / ${currentImages.length}`;
}

function showNextImage() {
  currentImageIndex = (currentImageIndex + 1) % currentImages.length;
  updateModalImage();
}

function showPreviousImage() {
  currentImageIndex = (currentImageIndex - 1 + currentImages.length) % currentImages.length;
  updateModalImage();
}

function closeModal() {
  modalOverlay.style.display = 'none';
  document.body.style.overflow = 'auto';
  // Arrêter la musique
  modalAudio.pause();
  modalAudio.currentTime = 0;
  isAudioPlaying = false;
  audioToggleBtn.textContent = '🔇';
}
