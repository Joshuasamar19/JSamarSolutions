// =========================
// SECTION MANAGER
// =========================
const sections = document.querySelectorAll('section');
const navLinks = document.querySelectorAll('.nav-links a');

function showSection(id) {
  sections.forEach(s => s.classList.remove('active-section'));
  const target = document.getElementById(id);
  if (target) {
    target.classList.add('active-section');
    target.scrollTop = 0;
  }
  navLinks.forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href') === '#' + id) {
      link.classList.add('active');
    }
  });
}

window.addEventListener('load', () => {
  showSection('home');
});

// =========================
// BLOCK SCROLL BETWEEN SECTIONS
// BUT ALLOW INSIDE SECTION
// =========================
window.addEventListener('wheel', (e) => {
  // Allow inside modals and lightbox
  if (document.querySelector('.modal.active') ||
      document.getElementById('lightbox').classList.contains('active')) {
    return;
  }

  const activeSection = document.querySelector('section.active-section');
  if (!activeSection) return;

  // Let the section handle its own scroll
  // Only block if section itself doesn't scroll
  const canScrollDown = activeSection.scrollHeight > activeSection.clientHeight &&
                        activeSection.scrollTop + activeSection.clientHeight < activeSection.scrollHeight;
  const canScrollUp = activeSection.scrollTop > 0;

  if (e.deltaY > 0 && !canScrollDown) {
    e.preventDefault(); // Block scrolling to next section
  } else if (e.deltaY < 0 && !canScrollUp) {
    e.preventDefault(); // Block scrolling to prev section
  }
  // Otherwise let section scroll normally
}, { passive: false });

// Block touch scroll between sections
let touchStartY = 0;
window.addEventListener('touchstart', (e) => {
  touchStartY = e.touches[0].clientY;
});

window.addEventListener('touchmove', (e) => {
  if (document.querySelector('.modal.active') ||
      document.getElementById('lightbox').classList.contains('active')) {
    return;
  }

  const activeSection = document.querySelector('section.active-section');
  if (!activeSection) return;

  const touchY = e.touches[0].clientY;
  const direction = touchStartY - touchY;

  const canScrollDown = activeSection.scrollHeight > activeSection.clientHeight &&
                        activeSection.scrollTop + activeSection.clientHeight < activeSection.scrollHeight;
  const canScrollUp = activeSection.scrollTop > 0;

  if (direction > 0 && !canScrollDown) {
    e.preventDefault();
  } else if (direction < 0 && !canScrollUp) {
    e.preventDefault();
  }
}, { passive: false });

// =========================
// NAVBAR STYLE
// =========================
const navbar = document.getElementById('navbar');
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

// Handle hero buttons (View Projects, Hire Me)
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