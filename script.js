// Liste des images avec titre
const images = [
  { src: 'images/visuel_1.webp', title: 'Étranger à tout' },
  { src: 'images/visuel_2.webp', title: 'Éclats du Néant' },
  { src: 'images/visuel_3.webp', title: 'Topographie du Rêve' },
  { src: 'images/visuel_4.webp', title: 'Fragment de Temps' },
  { src: 'images/visuel_5.webp', title: 'Mémoire Liquide' },
  { src: 'images/visuel_6.webp', title: 'Lignes d’Errance' },
  { src: 'images/visuel_7.webp', title: 'Spectres de Lumière' },
  { src: 'images/visuel_8.webp', title: 'Respiration du Vide' },
  { src: 'images/visuel_9.webp', title: 'Flux Intemporel' },
  { src: 'images/visuel_10.webp', title: 'Matière du Souffle' },
  { src: 'images/visuel_11.webp', title: 'Échos du Silence' },
  { src: 'images/visuel_12.webp', title: 'Gravité Inversée' },
  { src: 'images/visuel_13.webp', title: 'Cartographie de l’Invisible' },
  { src: 'images/visuel_14.webp', title: 'Osmose des Couleurs' },
];

const gallery = document.getElementById('gallery');

// Création de la grille
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

gallery.appendChild(grid);

// =================== MODALE ===================
let currentImageIndex = 0;

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
  const img = images[currentImageIndex];
  modalImage.src = img.src;
  modalImage.alt = img.title;
  modalTitle.textContent = img.title;
  modalCounter.textContent = `${currentImageIndex + 1} / ${images.length}`;
}

function showNextImage() {
  currentImageIndex = (currentImageIndex + 1) % images.length;
  updateModalImage();
}

function showPreviousImage() {
  currentImageIndex = (currentImageIndex - 1 + images.length) % images.length;
  updateModalImage();
}

function closeModal() {
  modalOverlay.style.display = 'none';
  document.body.style.overflow = 'auto';
}
