/**
 * PATULANDIA — GALERÍA LIGHTBOX
 * ==============================
 * Se carga DESPUÉS de index.js, que ya maneja:
 *   - Header scroll, menú mobile, reveals, año del footer.
 * Este archivo solo maneja el lightbox.
 */

'use strict';

/* Estado global */
const LightboxState = {
  images: [],
  currentIndex: 0,
  isOpen: false,
};

let DOM = {};

function resolveDOM() {
  DOM = {
    lightbox: document.getElementById('lightbox'),
    backdrop: document.getElementById('lightboxBackdrop'),
    img:      document.getElementById('lightboxImg'),
    spinner:  document.getElementById('lightboxSpinner'),
    caption:  document.getElementById('lightboxCaption'),
    counter:  document.getElementById('lightboxCounter'),
    btnClose: document.getElementById('lightboxClose'),
    btnPrev:  document.getElementById('lightboxPrev'),
    btnNext:  document.getElementById('lightboxNext'),
    cards:    document.querySelectorAll('.gallery-card'),
  };
}

/* 1. Recolectar imágenes de las cards */
function collectImages() {
  LightboxState.images = [];
  DOM.cards.forEach((card, i) => {
    const imgEl    = card.querySelector('.gallery-card__img');
    const capEl    = card.querySelector('.gallery-card__caption');
    if (!imgEl) return;
    card.dataset.index = String(i);
    LightboxState.images.push({
      src:     imgEl.getAttribute('src') || '',
      alt:     imgEl.getAttribute('alt') || '',
      caption: capEl ? capEl.textContent.trim() : '',
    });
  });
}

/* 2. Abrir */
function openLightbox(index) {
  if (!LightboxState.images.length) return;
  LightboxState.isOpen = true;
  document.body.style.overflow = 'hidden';
  DOM.lightbox.classList.add('is-open');
  DOM.lightbox.setAttribute('aria-hidden', 'false');
  loadImage(index);
  DOM.btnClose.focus();
}

/* 3. Cerrar */
function closeLightbox() {
  if (!LightboxState.isOpen) return;
  LightboxState.isOpen = false;
  DOM.lightbox.classList.remove('is-open');
  DOM.lightbox.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  setTimeout(() => {
    DOM.img.src = '';
    DOM.img.classList.remove('is-loaded');
    DOM.spinner.classList.remove('is-hidden');
  }, 320);
}

/* 4. Navegar */
function goToPrev() {
  const t = LightboxState.images.length;
  loadImage((LightboxState.currentIndex - 1 + t) % t);
}
function goToNext() {
  loadImage((LightboxState.currentIndex + 1) % LightboxState.images.length);
}

/* 5. Cargar imagen con spinner */
function loadImage(index) {
  if (index < 0 || index >= LightboxState.images.length) return;
  LightboxState.currentIndex = index;
  const { src, alt, caption } = LightboxState.images[index];

  DOM.img.classList.remove('is-loaded');
  DOM.spinner.classList.remove('is-hidden');
  DOM.caption.textContent = caption;
  DOM.counter.textContent = `${index + 1} / ${LightboxState.images.length}`;
  DOM.img.alt = alt;

  const cleanup = () => {
    DOM.img.removeEventListener('load',  onLoad);
    DOM.img.removeEventListener('error', onError);
  };
  const onLoad  = () => { DOM.img.classList.add('is-loaded'); DOM.spinner.classList.add('is-hidden'); cleanup(); };
  const onError = () => { DOM.img.classList.add('is-loaded'); DOM.spinner.classList.add('is-hidden'); cleanup(); };

  DOM.img.addEventListener('load',  onLoad);
  DOM.img.addEventListener('error', onError);
  DOM.img.src = src;
}

/* 6. Teclado — ESC cierra, flechas navegan */
function initKeyboard() {
  document.addEventListener('keydown', (e) => {
    if (!LightboxState.isOpen) return;
    if (e.key === 'Escape')     closeLightbox();
    if (e.key === 'ArrowLeft')  { e.preventDefault(); goToPrev(); }
    if (e.key === 'ArrowRight') { e.preventDefault(); goToNext(); }
  });
}

/* 7. Swipe táctil */
function initSwipe() {
  let sx = 0, sy = 0;
  DOM.lightbox.addEventListener('touchstart', (e) => {
    sx = e.touches[0].clientX;
    sy = e.touches[0].clientY;
  }, { passive: true });
  DOM.lightbox.addEventListener('touchend', (e) => {
    if (!LightboxState.isOpen) return;
    const dx = e.changedTouches[0].clientX - sx;
    const dy = e.changedTouches[0].clientY - sy;
    if (Math.abs(dx) < 50 || Math.abs(dy) > Math.abs(dx)) return;
    dx < 0 ? goToNext() : goToPrev();
  }, { passive: true });
}

/* 8. Init */
function initGallery() {
  resolveDOM();
  if (!DOM.lightbox) return;
  collectImages();

  DOM.cards.forEach((card) => {
    card.setAttribute('tabindex', '0');
    card.setAttribute('role', 'button');
    card.addEventListener('click', () => openLightbox(parseInt(card.dataset.index, 10)));
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openLightbox(parseInt(card.dataset.index, 10));
      }
    });
  });

  DOM.btnClose.addEventListener('click', closeLightbox);
  DOM.backdrop.addEventListener('click', closeLightbox);
  DOM.btnPrev.addEventListener('click', (e) => { e.stopPropagation(); goToPrev(); });
  DOM.btnNext.addEventListener('click', (e) => { e.stopPropagation(); goToNext(); });

  initKeyboard();
  initSwipe();

  console.log('Patulandia Galeria — ' + LightboxState.images.length + ' imagenes listas');
}

document.addEventListener('DOMContentLoaded', initGallery);
