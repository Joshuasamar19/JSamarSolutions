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
// NAV LINKS - CLICK & SCROLL
// =========================
const navLinks = document.querySelectorAll('.nav-links a');
const sections = document.querySelectorAll('section');

// Highlight immediately on click
navLinks.forEach(link => {
  link.addEventListener('click', () => {
    // Remove active from all
    navLinks.forEach(l => l.classList.remove('active'));
    // Add active to clicked one
    link.classList.add('active');
    // Close mobile menu
    document.getElementById('navLinks').classList.remove('open');
  });
});

// Update highlight on scroll
window.addEventListener('scroll', () => {
  let current = '';
  const scrollY = window.scrollY;
  const windowHeight = window.innerHeight;
  const docHeight = document.documentElement.scrollHeight;

  // Force contact when at very bottom
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