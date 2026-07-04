// =========================
// NAVBAR SCROLL
// =========================
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 40);
});

// =========================
// MOBILE NAV TOGGLE
// =========================
function toggleNav() {
  document.getElementById('navLinks').classList.toggle('open');
}

// =========================
// NAV LINKS - INSTANT JUMP
// =========================
const navLinks = document.querySelectorAll('.nav-links a');
const sections = document.querySelectorAll('section');

navLinks.forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();

    // Remove active from all then add to clicked
    navLinks.forEach(l => l.classList.remove('active'));
    link.classList.add('active');

    // Close mobile menu
    document.getElementById('navLinks').classList.remove('open');

    // Instant jump - no smooth scroll
    const targetId = link.getAttribute('href').replace('#', '');
    const target = document.getElementById(targetId);
    if (target) {
      window.scrollTo({ top: target.offsetTop - 70, behavior: 'instant' });
    }
  });
});

// =========================
// ACTIVE NAV LINK ON SCROLL
// =========================
window.addEventListener('scroll', () => {
  let current = '';
  const scrollY = window.scrollY;
  const windowHeight = window.innerHeight;
  const docHeight = document.documentElement.scrollHeight;

  if (scrollY + windowHeight >= docHeight - 10) {
    current = 'contact';
  } else {
    sections.forEach(section => {
      const sectionTop = section.offsetTop - 150;
      const sectionBottom = sectionTop + section.offsetHeight;
      if (scrollY >= sectionTop && scrollY < sectionBottom) {
        current = section.getAttribute('id');
      }
    });
  }

  navLinks.forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href') === '#' + current) {
      link.classList.add('active');
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
  document.body.style.overflow = 'hidden';
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
  document.body.style.overflow = '';
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
        document.body.style.overflow = '';
      });
    }
  }
});

// =========================
// REVEAL ON SCROLL
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

// =========================
// SCROLL TO TOP ON REFRESH
// =========================
window.onbeforeunload = () => window.scrollTo(0, 0);