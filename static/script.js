// =========================
// SMOOTH SCROLL NAVIGATION
// =========================

document.querySelectorAll('nav a').forEach(anchor => {

    anchor.addEventListener('click', function(e) {

        e.preventDefault();

        const targetId = this.getAttribute('href');

        const targetSection = document.querySelector(targetId);

        if(targetSection){

            targetSection.scrollIntoView({
                behavior: 'smooth'
            });

        }

    });

});

// =========================
// ACTIVE NAVBAR LINK
// =========================

const sections = document.querySelectorAll("section");
const navLinks = document.querySelectorAll("nav a");

window.addEventListener("scroll", () => {

    let current = "";

    sections.forEach(section => {

        const sectionTop = section.offsetTop - 150;
        const sectionHeight = section.clientHeight;

        if(pageYOffset >= sectionTop){

            current = section.getAttribute("id");

        }

    });

    navLinks.forEach(link => {

        link.classList.remove("active");

        if(link.getAttribute("href").includes(current)){

            link.classList.add("active");

        }

    });

});

// =========================
// HERO FLOAT ANIMATION
// =========================

const heroCard = document.querySelector(".hero-content");

window.addEventListener("mousemove", (e) => {

    const x = (window.innerWidth / 2 - e.pageX) / 40;
    const y = (window.innerHeight / 2 - e.pageY) / 40;

    heroCard.style.transform = `rotateY(${x}deg) rotateX(${-y}deg)`;

});

// RESET POSITION

window.addEventListener("mouseleave", () => {

    heroCard.style.transform = "rotateY(0deg) rotateX(0deg)";

});

// =========================
// REVEAL ANIMATION
// =========================

const revealElements = document.querySelectorAll(
    ".project-card, .service-box, .about-card, .contact"
);

function revealOnScroll(){

    const triggerBottom = window.innerHeight * 0.85;

    revealElements.forEach(el => {

        const elementTop = el.getBoundingClientRect().top;

        if(elementTop < triggerBottom){

            el.classList.add("show");

        }

    });

}

window.addEventListener("scroll", revealOnScroll);

revealOnScroll();

// =========================
// BUTTON FUNCTIONS
// =========================

// VIEW PROJECTS BUTTON

const projectBtn = document.querySelector(".hero-buttons .btn");

if(projectBtn){

    projectBtn.addEventListener("click", () => {

        document.querySelector("#projects").scrollIntoView({
            behavior: "smooth"
        });

    });

}

// CONTACT BUTTON

const contactBtn = document.querySelector(".hero-buttons .secondary");

if(contactBtn){

    contactBtn.addEventListener("click", () => {

        document.querySelector("#contact").scrollIntoView({
            behavior: "smooth"
        });

    });

}

// =========================
// TYPEWRITER EFFECT
// =========================

const title = document.querySelector(".main-title");

if(title){

    const text = title.innerText;

    title.innerText = "";

    let index = 0;

    function typeEffect(){

        if(index < text.length){

            title.innerText += text.charAt(index);

            index++;

            setTimeout(typeEffect, 80);

        }

    }

    typeEffect();

}

// =========================
// GLOW EFFECT FOLLOW MOUSE
// =========================

document.addEventListener("mousemove", (e) => {

    const glow = document.querySelector(".hero");

    const x = e.clientX / window.innerWidth * 100;
    const y = e.clientY / window.innerHeight * 100;

    glow.style.backgroundPosition = `${x}% ${y}%`;

});

// =========================
// SCROLL TO TOP ON REFRESH
// =========================

window.onbeforeunload = function () {

    window.scrollTo(0, 0);

};