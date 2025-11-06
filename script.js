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

images.forEach(img => {
  const item = document.createElement('div');
  item.className = 'gallery-item';

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


  // Modale au clic
  item.addEventListener('click', () => openModal(img.src, img.title));

  grid.appendChild(item);
});

gallery.appendChild(grid);

// =================== MODALE ===================
const modalOverlay = document.createElement('div');
modalOverlay.className = 'modal-overlay';

const modalContent = document.createElement('div');
modalContent.className = 'modal-content';

const modalImage = document.createElement('img');
const modalTitle = document.createElement('p');
modalTitle.className = 'modal-title';

const closeBtn = document.createElement('button');
closeBtn.className = 'modal-close';
closeBtn.textContent = '×';
closeBtn.addEventListener('click', () => {
  modalOverlay.style.display = 'none';
});

modalContent.appendChild(closeBtn);
modalContent.appendChild(modalImage);
modalContent.appendChild(modalTitle);
modalOverlay.appendChild(modalContent);
document.body.appendChild(modalOverlay);

function openModal(src, title) {
  modalImage.src = src;
  modalImage.alt = title;
  modalTitle.textContent = title;
  modalOverlay.style.display = 'flex';
}
