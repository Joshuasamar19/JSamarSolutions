// =========================
// SECTION MANAGER
// =========================
const sections = document.querySelectorAll('section');
const navLinks = document.querySelectorAll('.nav-links a');

function showSection(id) {
  sections.forEach(section => {
    section.classList.remove('active-section');
    section.scrollTop = 0;
  });

  const target = document.getElementById(id);
  if (target) {
    target.classList.add('active-section');

    // Mobile in-app browsers can restore the old position after layout.
    const resetToTop = () => {
      target.scrollTop = 0;
      target.scrollTo(0, 0);
    };

    resetToTop();
    requestAnimationFrame(resetToTop);
    setTimeout(resetToTop, 100);
  }

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
// DISABLE SCROLL BETWEEN SECTIONS
// BUT ALLOW INSIDE SECTION
// =========================
window.addEventListener('wheel', (e) => {
  if (document.querySelector('.modal.active') ||
      document.getElementById('lightbox').classList.contains('active')) {
    return;
  }

  const activeSection = document.querySelector('section.active-section');
  if (!activeSection) return;

  const atBottom = activeSection.scrollTop + activeSection.clientHeight >= activeSection.scrollHeight - 5;
  const atTop = activeSection.scrollTop <= 0;

  if ((e.deltaY > 0 && atBottom) || (e.deltaY < 0 && atTop)) {
    e.preventDefault();
  }
}, { passive: false });

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

  const atBottom = activeSection.scrollTop + activeSection.clientHeight >= activeSection.scrollHeight - 5;
  const atTop = activeSection.scrollTop <= 0;

  if ((direction > 0 && atBottom) || (direction < 0 && atTop)) {
    e.preventDefault();
  }
}, { passive: false });

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
    goToSection(targetId);
  });
});

// Handle hero buttons (excludes .nav-links a, which are already bound above)
document.querySelectorAll('a[href^="#"]:not(.nav-links a)').forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const targetId = link.getAttribute('href').replace('#', '');
    if (document.getElementById(targetId)) {
      goToSection(targetId);
    }
  });
});

// =========================
// PASSCODE GATE (server-side auth)
// The real passcode never ships to the browser. Every check is a
// network call to /check-passcode, which sets a signed session
// cookie on success. Project content and images are then fetched
// from routes that require that session — see loadProjectsContent().
// =========================
let projectsUnlocked = false;
let pendingSection = null;

function goToSection(targetId) {
  if (targetId === 'projects' && !projectsUnlocked) {
    pendingSection = targetId;
    openPasscodeGate();
    return;
  }
  showSection(targetId);
}

function openPasscodeGate() {
  const gate = document.getElementById('passcode-gate');
  const input = document.getElementById('passcode-input');
  const error = document.getElementById('passcode-error');
  error.classList.remove('show');
  error.textContent = 'Incorrect passcode. Try again.';
  input.value = '';
  gate.classList.add('active');
  setTimeout(() => input.focus(), 50);
}

function closePasscodeGate() {
  document.getElementById('passcode-gate').classList.remove('active');
  pendingSection = null;
}

async function checkPasscode() {
  const input = document.getElementById('passcode-input');
  const error = document.getElementById('passcode-error');
  const unlockBtn = document.querySelector('#passcode-gate .btn-primary');

  error.classList.remove('show');
  unlockBtn.disabled = true;
  unlockBtn.textContent = 'Checking...';

  try {
    const response = await fetch('/check-passcode', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ passcode: input.value })
    });

    if (response.ok) {
      const loaded = await loadProjectsContent();
      if (loaded) {
        projectsUnlocked = true;
        document.getElementById('passcode-gate').classList.remove('active');
        if (pendingSection) {
          showSection(pendingSection);
          pendingSection = null;
        }
      } else {
        error.textContent = 'Something went wrong loading the projects. Please try again.';
        error.classList.add('show');
      }
    } else if (response.status === 429) {
      error.textContent = 'Too many attempts. Please wait a moment and try again.';
      error.classList.add('show');
      input.value = '';
    } else {
      error.textContent = 'Incorrect passcode. Try again.';
      error.classList.add('show');
      input.value = '';
      input.focus();
    }
  } catch (err) {
    error.textContent = 'Network error. Please try again.';
    error.classList.add('show');
  }

  unlockBtn.disabled = false;
  unlockBtn.textContent = 'Unlock';
}

// Fetches the confidential Projects markup (cards + modals + protected
// image URLs) and injects it into the page. This only succeeds if the
// server session was just authorized by /check-passcode.
async function loadProjectsContent() {
  try {
    const response = await fetch('/projects-content');
    if (!response.ok) return false;

    const html = await response.text();
    const container = document.getElementById('projects-container');
    container.innerHTML = html;

    bindDynamicProjectHandlers();
    return true;
  } catch (err) {
    return false;
  }
}

// Modal-backdrop-click-to-close and the reveal-on-scroll animation are
// normally wired up once at page load. Since project cards/modals are
// injected later, re-run that wiring for the newly added elements.
function bindDynamicProjectHandlers() {
  document.querySelectorAll('#projects-container .modal').forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
      }
    });
  });

  document.querySelectorAll('#projects-container .project-card').forEach(card => {
    card.classList.add('reveal', 'show');
  });
}

// On page load, ask the server whether this browser's session is
// already unlocked (e.g. the user refreshed after unlocking earlier).
// If so, silently load the content so they don't have to re-enter
// the passcode every reload.
async function checkExistingSession() {
  try {
    const response = await fetch('/projects-status');
    if (!response.ok) return;
    const data = await response.json();
    if (data.unlocked) {
      const loaded = await loadProjectsContent();
      if (loaded) projectsUnlocked = true;
    }
  } catch (err) {
    // Fail silently — user will just be prompted for the passcode
    // when they try to open Projects.
  }
}

document.getElementById('passcode-input').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') checkPasscode();
});

document.getElementById('passcode-gate').addEventListener('click', (e) => {
  if (e.target.id === 'passcode-gate') closePasscodeGate();
});

window.addEventListener('load', () => {
  checkExistingSession();
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
  const description = item.querySelector('.gallery-info p, .gallery-info .process-list');
  const desc = description?.classList.contains('process-list')
    ? Array.from(description.querySelectorAll('li')).map(step => `• ${step.innerText}`).join('\n')
    : description?.innerText || '';
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
// CONTACT FORM
// =========================
const contactForm = document.getElementById('contact-form');
if (contactForm) {
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const submitBtn = document.getElementById('cf-submit');
    const status = document.getElementById('cf-status');
    const name = document.getElementById('cf-name').value.trim();
    const email = document.getElementById('cf-email').value.trim();
    const message = document.getElementById('cf-message').value.trim();

    status.textContent = '';
    status.className = 'contact-form-status';
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending...';

    try {
      const response = await fetch('/send-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message })
      });

      if (response.ok) {
        status.textContent = 'Message sent! I\'ll get back to you soon.';
        status.classList.add('success');
        contactForm.reset();
      } else {
        status.textContent = 'Something went wrong. Please try again.';
        status.classList.add('error');
      }
    } catch (err) {
      status.textContent = 'Network error. Please try again.';
      status.classList.add('error');
    }

    submitBtn.disabled = false;
    submitBtn.textContent = 'Send Message';
  });
}

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