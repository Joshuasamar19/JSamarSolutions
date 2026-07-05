// =========================
// SECTION MANAGER
// =========================
const sections = document.querySelectorAll('section');
const navLinks = document.querySelectorAll('.nav-links a');

// Show first section on load
function showSection(id) {
  sections.forEach(s => s.classList.remove('active-section'));
  const target = document.getElementById(id);
  if (target) target.classList.add('active-section');

  // Update active nav link
  navLinks.forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href') === '#' + id) {
      link.classList.add('active');
    }
  });
}

// Show home on load
window.addEventListener('load', () => {
  showSection('home');
});

// =========================
// DISABLE ALL SCROLL
// =========================
window.addEventListener('wheel', (e) => {
  if (!document.querySelector('.modal.active') &&
      !document.getElementById('lightbox').classList.contains('active')) {
    e.preventDefault();
  }
}, { passive: false });

window.addEventListener('touchmove', (e) => {
  if (!document.querySelector('.modal.active') &&
      !document.getElementById('lightbox').classList.contains('active')) {
    e.preventDefault();
  }
}, { passive: false });

// =========================
// NAVBAR SCROLL STYLE
// =========================
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 40);
});
navbar.classList.add('scrolled');

// =========================
// MOBILE NAV TOGGLE
// =========================
function toggleNav() {
  document.getElementById('navLinks').classList.toggle('open');
}

// =========================
// NAV LINKS - ONLY WAY TO NAVIGATE
// =========================
navLinks.forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('navLinks').classList.remove('open');
    const targetId = link.getAttribute('href').replace('#', '');
    showSection(targetId);
  });
});

// Also handle hero buttons
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const targetId = link.getAttribute('href').replace('#', '');
    if (document.getElementById(targetId)) {
      showSection(targetId);
    }
  });
});

// =========================
// PROJECT MODALS
// =========================
function openModal(id) {
  document.getElementById(id).classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeModal(id) {
  document.getElementById(id).classList.remove('active');
  document.body.style.overflow = '';
}

document.querySelectorAll('.modal').forEach(modal => {
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.remove('active');
      document.body.style.overflow = '';
    }
  });
});

// =========================
// LIGHTBOX
// =========================
let currentGallery = [];
let currentIndex = 0;

function openLightbox(item) {
  const modal = item.closest('.modal-box');
  const allItems = modal.querySelectorAll('.gallery-item');
  currentGallery = Array.from(allItems);
  currentIndex = currentGallery.indexOf(item);
  showLightboxImage(currentIndex);
  document.getElementById('lightbox').classList.add('active');
}

function showLightboxImage(index) {
  const item = currentGallery[index];
  const img = item.querySelector('img');
  const title = item.querySelector('h4').innerText;
  const desc = item.querySelector('p').innerText;
  document.getElementById('lightbox-img').src = img.src;
  document.getElementById('lightbox-title').innerText = title;
  document.getElementById('lightbox-desc').innerText = desc;
}

function prevImage(e) {
  e.stopPropagation();
  currentIndex = (currentIndex - 1 + currentGallery.length) % currentGallery.length;
  showLightboxImage(currentIndex);
}

function nextImage(e) {
  e.stopPropagation();
  currentIndex = (currentIndex + 1) % currentGallery.length;
  showLightboxImage(currentIndex);
}

function closeLightbox() {
  document.getElementById('lightbox').classList.remove('active');
}

document.addEventListener('keydown', (e) => {
  if (document.getElementById('lightbox').classList.contains('active')) {
    if (e.key === 'ArrowLeft') prevImage(e);
    if (e.key === 'ArrowRight') nextImage(e);
    if (e.key === 'Escape') closeLightbox();
  } else {
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal.active').forEach(modal => {
        modal.classList.remove('active');
      });
    }
  }
});

// =========================
// REVEAL ANIMATION
// =========================
const revealEls = document.querySelectorAll(
  '.stat, .timeline-card, .skill-group, .project-card, .contact-item, .svc, .about-text, .about-stats'
);

revealEls.forEach(el => el.classList.add('reveal'));

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => entry.target.classList.add('show'), i * 80);
    }
  });
}, { threshold: 0.12 });

revealEls.forEach(el => observer.observe(el));