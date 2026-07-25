const navbar = document.querySelector('.navbar');
const loader = document.querySelector('.page-loader');
const progressBar = document.querySelector('.scroll-progress');
const backToTop = document.querySelector('.back-to-top');
let revealItems = Array.from(document.querySelectorAll('.reveal'));
const counters = Array.from(document.querySelectorAll('.counter-value'));
const faqItems = Array.from(document.querySelectorAll('.faq-item'));
const galleryButtons = Array.from(document.querySelectorAll('[data-lightbox]'));
const lightbox = document.getElementById('lightbox');
const lightboxImage = document.querySelector('.lightbox-image');
const closeLightbox = document.querySelector('.lightbox-close');
const themeToggle = document.getElementById('themeToggle');
const THEME_KEY = 'ks-theme';

const refreshRevealItems = () => {
  revealItems = Array.from(document.querySelectorAll('.reveal'));
};

const loadTeamContent = async () => {
  const mount = document.getElementById('teamContentMount');
  if (!mount || mount.dataset.loaded === 'true') {
    return;
  }

  const source = mount.dataset.source || 'founder-team.html';

  try {
    const response = await fetch(source, { cache: 'no-cache' });
    if (!response.ok) {
      throw new Error('Failed to load founder/team content');
    }

    mount.innerHTML = await response.text();
    mount.dataset.loaded = 'true';
    refreshRevealItems();
    revealOnScroll();
  } catch {
    mount.innerHTML = '<div class="container"><p class="section-copy">Team section is temporarily unavailable.</p></div>';
  }
};

const getPreferredTheme = () => {
  const stored = localStorage.getItem(THEME_KEY);
  if (stored === 'light' || stored === 'dark') {
    return stored;
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

const applyTheme = (theme) => {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem(THEME_KEY, theme);

  const isDark = theme === 'dark';
  themeToggle?.setAttribute('aria-pressed', String(isDark));
  themeToggle?.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');

  const themeMeta = document.querySelector('meta[name="theme-color"]');
  if (themeMeta) {
    themeMeta.content = isDark ? '#0b1524' : '#0A2E5D';
  }
};

const setNavbarState = () => {
  if (window.scrollY > 40) {
    navbar?.classList.add('scrolled');
  } else {
    navbar?.classList.remove('scrolled');
  }

  if (backToTop) {
    backToTop.classList.toggle('show', window.scrollY > 700);
  }

  if (progressBar) {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? scrollTop / docHeight : 0;
    progressBar.style.transform = `scaleX(${progress})`;
  }
};

const revealOnScroll = () => {
  revealItems.forEach((item) => {
    const rect = item.getBoundingClientRect();
    if (rect.top < window.innerHeight - 90) {
      item.classList.add('visible');
    }
  });
};

const animateCounter = (counter) => {
  if (counter.dataset.animated === 'true') {
    return;
  }

  counter.dataset.animated = 'true';

  const target = Number(counter.dataset.count || 0);
  const suffix = counter.dataset.suffix ?? (target >= 100 ? '+' : '');
  const duration = 1200;
  const startTime = performance.now();

  const step = (time) => {
    const progress = Math.min((time - startTime) / duration, 1);
    const current = Math.floor(progress * target);
    counter.textContent = `${current}${suffix}`;

    if (progress < 1) {
      requestAnimationFrame(step);
    } else {
      counter.textContent = `${target}${suffix}`;
    }
  };

  requestAnimationFrame(step);
};

const handleCounterVisibility = () => {
  counters.forEach((counter) => {
    const rect = counter.getBoundingClientRect();
    if (rect.top < window.innerHeight - 90) {
      animateCounter(counter);
    }
  });
};

const toggleFaq = (clickedItem) => {
  faqItems.forEach((item) => {
    if (item === clickedItem) {
      item.classList.toggle('active');
      const button = item.querySelector('.faq-question');
      const expanded = button?.getAttribute('aria-expanded') === 'true';
      button?.setAttribute('aria-expanded', String(!expanded));
    } else {
      item.classList.remove('active');
      const button = item.querySelector('.faq-question');
      button?.setAttribute('aria-expanded', 'false');
    }
  });
};

const removeMobileMenuOverlay = () => {
  document.querySelectorAll('.menu-overlay, .mobile-menu-overlay, .sidebar-overlay, .mobile-backdrop, .backdrop-overlay, .offcanvas-backdrop').forEach((overlay) => {
    overlay.classList.remove('open', 'active', 'show');
    if (overlay.classList.contains('offcanvas-backdrop')) {
      overlay.remove();
    }
  });
};

faqItems.forEach((item) => {
  item.querySelector('.faq-question')?.addEventListener('click', () => toggleFaq(item));
});

document.querySelectorAll('#navbarNav .nav-link').forEach((item) => {
  item.addEventListener('click', removeMobileMenuOverlay);
});

document.addEventListener('click', (event) => {
  const clickedTextMenuItem = event.target.closest('.mobile-menu-item, .sidebar-menu-item, .menu-item-text, [data-nav-target], [data-scroll-target]');
  if (clickedTextMenuItem) {
    removeMobileMenuOverlay();
  }
});

galleryButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const imageSrc = button.getAttribute('data-image');
    if (lightboxImage && imageSrc) {
      lightboxImage.src = imageSrc;
      lightbox?.classList.add('open');
      document.body.classList.add('locked');
    }
  });
});

const closeLightboxView = () => {
  lightbox?.classList.remove('open');
  document.body.classList.remove('locked');
};

closeLightbox?.addEventListener('click', closeLightboxView);
lightbox?.addEventListener('click', (event) => {
  if (event.target === lightbox) {
    closeLightboxView();
  }
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    closeLightboxView();
  }
});

backToTop?.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

themeToggle?.addEventListener('click', () => {
  const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
  applyTheme(currentTheme === 'dark' ? 'light' : 'dark');
});

window.addEventListener('scroll', () => {
  setNavbarState();
  revealOnScroll();
  handleCounterVisibility();
});

const hideLoader = () => {
  window.setTimeout(() => loader?.classList.add('hidden'), 500);
};

window.addEventListener('load', () => {
  loadTeamContent();
  applyTheme(getPreferredTheme());
  setNavbarState();
  revealOnScroll();
  requestAnimationFrame(handleCounterVisibility);
  hideLoader();
});

// Hide loader immediately if page is already loaded
if (document.readyState === 'complete' || document.readyState === 'interactive') {
  loadTeamContent();
  applyTheme(getPreferredTheme());
  setNavbarState();
  revealOnScroll();
  requestAnimationFrame(handleCounterVisibility);
  hideLoader();
}

// ── Contact Form Submission ────────────────────────
const contactForm = document.getElementById('contactForm');
const formSubmitBtn = document.getElementById('formSubmitBtn');
const formSuccess = document.getElementById('formSuccess');
const formError = document.getElementById('formError');

contactForm?.addEventListener('submit', async (e) => {
  e.preventDefault();

  // Hide previous messages
  formSuccess.hidden = true;
  formError.hidden = true;

  // Show spinner
  formSubmitBtn.querySelector('.btn-text').hidden = true;
  formSubmitBtn.querySelector('.btn-spinner').hidden = false;
  formSubmitBtn.disabled = true;

  try {
    const data = new FormData(contactForm);
    const response = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      body: data,
    });
    const result = await response.json();

    if (result.success) {
      formSuccess.hidden = false;
      contactForm.reset();
      formSuccess.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    } else {
      formError.hidden = false;
    }
  } catch {
    formError.hidden = false;
  } finally {
    formSubmitBtn.querySelector('.btn-text').hidden = false;
    formSubmitBtn.querySelector('.btn-spinner').hidden = true;
    formSubmitBtn.disabled = false;
  }
});
