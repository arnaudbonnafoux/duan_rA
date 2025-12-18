// Liste des images - Galerie 1
const images1 = [
  { src: 'images/visuel_1.webp', title: 'Étranger à tout' },
  { src: 'images/visuel_2.webp', title: 'Éclats du Néant' },
  { src: 'images/visuel_3.webp', title: 'Topographie du Rêve' },
  { src: 'images/visuel_4.webp', title: 'Fragment de Temps' },
  { src: 'images/visuel_5.webp', title: 'Mémoire Liquide' },
  { src: 'images/visuel_6.webp', title: 'Lignes d\'Errance' },
  { src: 'images/visuel_7.webp', title: 'Spectres de Lumière' },
  { src: 'images/visuel_8.webp', title: 'Respiration du Vide' },
  { src: 'images/visuel_9.webp', title: 'Flux Intemporel' },
  { src: 'images/visuel_10.webp', title: 'Matière du Souffle' },
  { src: 'images/visuel_11.webp', title: 'Échos du Silence' },
  { src: 'images/visuel_12.webp', title: 'Gravité Inversée' },
  { src: 'images/visuel_13.webp', title: 'Cartographie de l\'Invisible' },
  { src: 'images/visuel_14.webp', title: 'Osmose des Couleurs' },
];

// Liste des images - Galerie 2
const images2 = [
  { src: 'images/visuel_23.webp', title: 'Harmonie Chromatique 1' },
  { src: 'images/visuel_24.webp', title: 'Harmonie Chromatique 2' },
  { src: 'images/visuel_25.webp', title: 'Harmonie Chromatique 3' },
  { src: 'images/visuel_26.webp', title: 'Harmonie Chromatique 4' },
  { src: 'images/visuel_27.webp', title: 'Harmonie Chromatique 5' },
  { src: 'images/visuel_28.webp', title: 'Harmonie Chromatique 6' },
  { src: 'images/visuel_29.webp', title: 'Harmonie Chromatique 7' },
  { src: 'images/visuel_30.webp', title: 'Harmonie Chromatique 8' },
  { src: 'images/visuel_31.webp', title: 'Harmonie Chromatique 9' },
];

let currentGallery = 'gallery1';
let currentImages = images1;
let currentImageIndex = 0;

const gallery1 = document.getElementById('gallery1');
const gallery2 = document.getElementById('gallery2');

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
    imageEl.src = img.src;
    imageEl.alt = img.title;

    const title = document.createElement('p');
    title.className = 'gallery-title';
    title.textContent = img.title;

    wrapper.appendChild(imageEl);
    item.appendChild(title);
    item.appendChild(wrapper);

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
    galleryTitle.textContent = 'Galerie "Chromesthésie"';
    tabGallery2.textContent = 'Galerie Lignes d\'Errance';
  } else {
    galleryTitle.textContent = 'Galerie "Lignes d\'Errance"';
    tabGallery2.textContent = 'Galerie Chromesthésie';
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

// Bouton fermer
const closeBtn = document.createElement('button');
closeBtn.className = 'modal-close';
closeBtn.textContent = '×';
closeBtn.setAttribute('aria-label', 'Fermer');
closeBtn.addEventListener('click', () => closeModal());

modalContent.appendChild(closeBtn);
modalContent.appendChild(prevBtn);
modalContent.appendChild(modalImage);
modalContent.appendChild(modalInfoContainer);
modalContent.appendChild(nextBtn);
modalOverlay.appendChild(modalContent);
document.body.appendChild(modalOverlay);

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
}
