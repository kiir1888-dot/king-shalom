const filterButtons = document.querySelectorAll('.filter-chip');
const galleryItems = document.querySelectorAll('.gallery-item');
const lightbox = document.getElementById('lightbox');
const lightboxImage = document.getElementById('lightboxImage');
const closeButton = document.getElementById('lightboxClose');

filterButtons.forEach((button) => {
  button.addEventListener('click', () => {
    filterButtons.forEach((btn) => btn.classList.remove('active'));
    button.classList.add('active');

    const filter = button.getAttribute('data-filter');
    galleryItems.forEach((item) => {
      const category = item.getAttribute('data-category');
      item.style.display = filter === 'all' || filter === category ? 'block' : 'none';
    });
  });
});

galleryItems.forEach((item) => {
  item.addEventListener('click', () => {
    const img = item.querySelector('img');
    lightboxImage.src = img.src;
    lightbox.classList.add('open');
    lightbox.setAttribute('aria-hidden', 'false');
  });
});

function closeLightbox() {
  lightbox.classList.remove('open');
  lightbox.setAttribute('aria-hidden', 'true');
}

closeButton?.addEventListener('click', closeLightbox);
lightbox?.addEventListener('click', (event) => {
  if (event.target === lightbox) {
    closeLightbox();
  }
});
