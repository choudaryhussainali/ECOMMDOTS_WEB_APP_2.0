// ---- TRUST STRIP ----
// ---- TRUST STRIP ----
const trustTags = [
  'AMAZON ADS ADVANCED PARTNER', 'HELIUM 10 CERTIFIED', 'A9 ALGORITHM EXPERTS', 
  '$50M+ MANAGED SPEND', 'AMAZON DSP MASTERS', 'PROFIT-FIRST PPC', 
  'DATADIVE PRO USERS', 'BRAND REGISTRY PROS', 'CONVERSION OPTIMIZED', 
  'FBA & FBM SPECIALISTS', 'MULTI-CHANNEL EXPANSION', 'TOP 1% SELLER AGENCY',
  /* Duplicated for seamless infinite scrolling */
  'AMAZON ADS ADVANCED PARTNER', 'HELIUM 10 CERTIFIED', 'A9 ALGORITHM EXPERTS', 
  '$50M+ MANAGED SPEND', 'AMAZON DSP MASTERS', 'PROFIT-FIRST PPC', 
  'DATADIVE PRO USERS', 'BRAND REGISTRY PROS', 'CONVERSION OPTIMIZED', 
  'FBA & FBM SPECIALISTS', 'MULTI-CHANNEL EXPANSION', 'TOP 1% SELLER AGENCY'
];
const track = document.getElementById('trustTrack');
trustTags.forEach((tag, i) => {
  const el = document.createElement('div');
  el.className = 'trust-item';
  // Removed icon span, kept the logo and separator spans
  el.innerHTML = `<span class="trust-item-logo">${tag}</span>${i < trustTags.length-1 ? '<span class="trust-sep"></span>' : ''}`;
  track.appendChild(el);
});



/* ─── FORM SUCCESS TOGGLE & FORMSPREE INTEGRATION ─── */
const contactForm = document.getElementById('contactForm');

if (contactForm) {
    contactForm.addEventListener('submit', async function(e) {
        e.preventDefault(); // Prevents the page from jumping/reloading
        
        const btn = document.getElementById('formSubmit');
        const originalBtnContent = btn.innerHTML;
        
        // UX: Kinetic loading state
        btn.innerHTML = '<span>AUTHORIZING & SENDING...</span>';
        btn.style.pointerEvents = 'none'; 
        
        // Gather all checked services into an array
        const servicesChecked = [];
        document.querySelectorAll('.form-check input[type="checkbox"]:checked').forEach(checkbox => {
            servicesChecked.push(checkbox.value);
        });

        // Construct a highly structured, premium payload for the Formspree email
        // Using numbers and caps forces Formspree to render a beautiful, ordered email
        const payload = {
            "=== 1. CLIENT PROFILE ===": "",
            "01. Full Name": document.getElementById('cf-name').value.trim(),
            "02. Business Email": document.getElementById('cf-email').value.trim(),
            "03. Brand / Company": document.getElementById('cf-brand').value.trim(),
            "04. Phone Number": document.getElementById('cf-phone').value.trim(),
            
            "=== 2. BUSINESS INTELLIGENCE ===": "",
            "05. Monthly Amazon Revenue": document.getElementById('cf-revenue').value || "Not Disclosed",
            "06. Primary Challenge": document.getElementById('cf-challenge').value || "Not Disclosed",
            "07. Requested Services": servicesChecked.length > 0 ? servicesChecked.join(' | ') : "None Selected",
            
            "=== 3. STRATEGIC BRIEF ===": "",
            "08. Brand Message / Notes": document.getElementById('cf-message').value.trim() || "No additional notes provided."
        };

        try {
            // Asynchronous Fetch to Formspree endpoint
            const response = await fetch("https://formspree.io/f/mykaoybq", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                // UX: Seamless transition to your existing success state
                btn.innerHTML = '<span>SECURELY TRANSMITTED</span>';
                setTimeout(() => {
                    const successContainer = document.getElementById('formSuccess');
                    contactForm.style.display = 'none';
                    successContainer.classList.add('show');
                }, 800);
            } else {
                // Formspree error handling
                const data = await response.json();
                if (Object.hasOwn(data, 'errors')) {
                    alert(data.errors.map(error => error.message).join(", "));
                } else {
                    alert("There was a problem transmitting your audit request. Please try again.");
                }
                // Reset button state
                btn.innerHTML = originalBtnContent;
                btn.style.pointerEvents = 'auto';
            }
        } catch (error) {
            // Network error handling
            alert("Network error. Please check your connection and try again.");
            btn.innerHTML = originalBtnContent;
            btn.style.pointerEvents = 'auto';
        }
    });
}

// 7. REFINED MOUSE PARALLAX ENGINE (Contact Form Removed)
// We removed '.contact-form-card' from this array so it no longer receives 3D math.
const floatingElements = document.querySelectorAll('.about-accent-box');

document.addEventListener('mousemove', (e) => {
    const { clientX, clientY } = e;
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;

    floatingElements.forEach(el => {
        const moveX = (clientX - centerX) / 60;
        const moveY = (clientY - centerY) / 60;
        
        el.style.transform = `perspective(1000px) rotateY(${moveX}deg) rotateX(${-moveY}deg) translateY(${moveY}px)`;
    });
});
// ═══════════════════ TYPING ENGINE (EXACT AS IS) ═══════════════════
const typedWord = document.querySelector('.typed-word');
const words = ['SCALE', 'GROW', 'ACCELERATE', 'DOMINATE'];
let wordIndex = 0, charIndex = 0, isDeleting = false;
function typeEffect() {
    const currentWord = words[wordIndex];
    if (isDeleting) { typedWord.textContent = currentWord.substring(0, charIndex - 1); charIndex--; }
    else { typedWord.textContent = currentWord.substring(0, charIndex + 1); charIndex++; }
    let typeSpeed = isDeleting ? 40 : 120;
    if (!isDeleting && charIndex === currentWord.length) { typeSpeed = 2500; isDeleting = true; }
    else if (isDeleting && charIndex === 0) { isDeleting = false; wordIndex = (wordIndex + 1) % words.length; typeSpeed = 500; }
    setTimeout(typeEffect, typeSpeed);
}
setTimeout(typeEffect, 1150);

// ═══════════════════ INTERSECTION OBSERVER ENGINE ═══════════════════
const observerOptions = { threshold: 0.15, rootMargin: '0px 0px -60px 0px' };

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Observe all animated elements
document.querySelectorAll(
    '.stat-card, .service-card, .result-block, .case-card, .team-card, ' +
    '.about-main-img, .about-accent-box, .about-content-col, ' +
    '.cta-eyebrow, .cta-h2, .cta-sub, .cta-form, .cta-image' +
    '.ap-img-wrap, .ap-glass-badge, .ap-content'
).forEach(el => observer.observe(el));

// ═══════════════════ COUNTER ANIMATION ═══════════════════
const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const counters = entry.target.querySelectorAll('.counter');
            counters.forEach(counter => {
                const target = parseFloat(counter.getAttribute('data-target'));
                const decimal = counter.getAttribute('data-decimal') || '';
                const duration = 2200;
                const start = performance.now();
                function update(now) {
                    const elapsed = now - start;
                    const progress = Math.min(elapsed / duration, 1);
                    const eased = 1 - Math.pow(1 - progress, 4);
                    const current = Math.floor(eased * target);
                    counter.textContent = current + decimal;
                    if (progress < 1) requestAnimationFrame(update);
                    else counter.textContent = target + decimal;
                }
                requestAnimationFrame(update);
            });
            counterObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.3 });

const statsSection = document.querySelector('.stats-section');
if (statsSection) counterObserver.observe(statsSection);



/* ─── SMOOTH SCROLL & MENU AUTO-CLOSE ─── */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    const id = this.getAttribute('href');
    if(id === '#') return;
    const target = document.querySelector(id);
    if(target) {
      e.preventDefault();
      // Close mobile nav if open
      const mobileNav = document.getElementById('mobileNav');
      const hamburger = document.getElementById('hamburger');
      if(mobileNav && mobileNav.classList.contains('is-open')){
        mobileNav.classList.remove('is-open');
        hamburger && hamburger.classList.remove('is-open');
        hamburger && hamburger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      }
      // Calculate offset to account for the pinned header
      const headerH = document.getElementById('mainHeader')?.offsetHeight || 80;
      const top = target.getBoundingClientRect().top + window.scrollY - headerH - 16;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});

// ═══════════════════ PARALLAX HERO IMAGE ═══════════════════
const heroBg = document.querySelector('.hero-bg-img');
window.addEventListener('scroll', () => {
    const scrolled = window.scrollY;
    if (heroBg && scrolled < window.innerHeight) {
        heroBg.style.transform = `translateY(${scrolled * 0.2}px)`;
    }
}, { passive: true });


// ═══════════════════ BULLETPROOF EDITORIAL ENGINE ═══════════════════
(function initEditorialEngine() {
    const setup = () => {
        // 1. Scroll Reveal Observer (Loosened thresholds for large elements)
        const ecObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                // Trigger as soon as even 5% of the massive container hits the screen
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.05, rootMargin: "0px 0px 50px 0px" });

        // Grab everything that needs to reveal
        const elementsToReveal = document.querySelectorAll('.reveal-ec, .ec-row');
        elementsToReveal.forEach(el => ecObserver.observe(el));

        

        window.addEventListener('scroll', () => {
            if (!ticking) {
                window.requestAnimationFrame(updateParallax);
                ticking = true;
            }
        }, { passive: true });
        
        // Trigger once on load to set initial positions
        updateParallax();
    };

    // Run immediately if DOM is already fully loaded, otherwise wait for it
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', setup);
    } else {
        setup();
    }
})();

const sidebar = document.getElementById('socialSidebar');
const toggleBtn = document.getElementById('toggleBtn');

toggleBtn.addEventListener('click', () => {
sidebar.classList.toggle('open');
});
// 5. MILLION-DOLLAR KINETIC INERTIA ENGINE
document.addEventListener('DOMContentLoaded', () => {
    const track = document.getElementById('tlTrack');
    const wrapper = document.querySelector('.tl-carousel-wrapper');
    const btnPrev = document.getElementById('tlPrev');
    const btnNext = document.getElementById('tlNext');
    const cards = document.querySelectorAll('.tl-card');

    if (!track || !wrapper || !btnPrev || !btnNext || cards.length === 0) return;

    // --- PHYSICS CONFIGURATION ---
    const friction = 0.92; // How fast the slider drifts to a stop (higher = longer drift)
    const lerpFactor = 0.12; // Snap smoothness tracking core (lower = smoother)
    const gap = 24; // CSS space between cards
    const cardWidth = cards[0].getBoundingClientRect().width;
    const itemWidth = cardWidth + gap;

    // --- STATE TRACKING ---
    let targetX = 0;      // Where the slider wants to go
    let currentX = 0;     // Where the slider currently is (interpolated)
    let isDragging = false;
    let startX = 0;
    let dragTargetX = 0;
    let velocity = 0;
    let lastEventX = 0;
    let lastEventTime = 0;

    // Calculate maximum boundaries dynamically
    const getMinX = () => {
        const visibleWidth = wrapper.getBoundingClientRect().width;
        const totalWidth = (cards.length * itemWidth) - gap;
        return Math.min(0, visibleWidth - totalWidth - 40); // 40px padding buffer at the end
    };

    // --- PREMIUM 물리 CORE ANIMATION LOOP ---
    const updatePhysics = () => {
        const minX = getMinX();

        if (!isDragging) {
            // Apply ongoing velocity inertia friction
            targetX += velocity;
            velocity *= friction;

            // Edge bounce containment physics
            if (targetX > 0) {
                targetX = targetX * 0.5; // Snap back softly from left wall
                if (targetX < 1) targetX = 0;
            } else if (targetX < minX) {
                targetX = targetX * 0.5 + minX * 0.5; // Snap back softly from right wall
                if (targetX > minX - 1) targetX = minX;
            } else if (Math.abs(velocity) < 0.2) {
                // When drift slows to a crawl, smoothly snap to the nearest card layout
                velocity = 0;
                const closestIdx = Math.round(Math.abs(targetX) / itemWidth);
                targetX = -(closestIdx * itemWidth);
            }
        } else {
            // If dragging, completely clear velocity to stay 1:1 with input
            velocity = 0;
        }

        // Linear Interpolation (Lerp) for creamy visual translation glide
        currentX += (targetX - currentX) * lerpFactor;
        track.style.transform = `translate3d(${currentX}px, 0, 0)`;

        // Update button contrast elements
        btnPrev.style.opacity = targetX >= 0 ? '0.2' : '1';
        btnPrev.style.pointerEvents = targetX >= 0 ? 'none' : 'auto';
        btnNext.style.opacity = targetX <= minX ? '0.2' : '1';
        btnNext.style.pointerEvents = targetX <= minX ? 'none' : 'auto';

        requestAnimationFrame(updatePhysics);
    };

    // --- UNIFIED POINTER ENGINE (MOUSE, TOUCH, TRACKPAD) ---
    const onPointerDown = (e) => {
        isDragging = true;
        startX = e.clientX;
        dragTargetX = targetX;
        velocity = 0;
        
        lastEventX = e.clientX;
        lastEventTime = performance.now();
        
        wrapper.classList.add('is-dragging');
    };

    const onPointerMove = (e) => {
        if (!isDragging) return;

        const currentClientX = e.clientX;
        const diffX = currentClientX - startX;
        let nextX = dragTargetX + diffX;

        // Interactive elastic resistance boundary check
        const minX = getMinX();
        if (nextX > 0) {
            nextX = diffX * 0.25; // Left wall drag resistance
        } else if (nextX < minX) {
            nextX = minX + (nextX - minX) * 0.25; // Right wall drag resistance
        }

        targetX = nextX;

        // Velocity tracking logic
        const now = performance.now();
        const deltaTime = now - lastEventTime;
        if (deltaTime > 0) {
            velocity = (currentClientX - lastEventX) / deltaTime * 16; // Project speed to 60fps frame block
        }

        lastEventX = currentClientX;
        lastEventTime = now;
    };

    const onPointerUp = () => {
        if (!isDragging) return;
        isDragging = false;
        wrapper.classList.remove('is-dragging');

        // Clamp wild throwing speeds
        if (velocity > 45) velocity = 45;
        if (velocity < -45) velocity = -45;
    };

    // Wire up events using global PointerListeners
    wrapper.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);

    // --- DESKTOP WHEEL / TOUCHPAD EXTENSION ---
    wrapper.addEventListener('wheel', (e) => {
        // Track vertical or horizontal wheel interactions
        const scrollDelta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
        if (Math.abs(scrollDelta) < 1) return;

        e.preventDefault();
        velocity = -scrollDelta * 0.4; // Feed scroll directly into kinetic loop velocity
        targetX += velocity;
    }, { passive: false });

    // --- BUTTON CONTROL SYNC ---
    btnNext.addEventListener('click', () => {
        const currentIdx = Math.round(Math.abs(targetX) / itemWidth);
        const maxCardsVisible = Math.floor(wrapper.getBoundingClientRect().width / itemWidth) || 1;
        if (currentIdx < cards.length - maxCardsVisible) {
            targetX = -((currentIdx + 1) * itemWidth);
        }
    });

    btnPrev.addEventListener('click', () => {
        const currentIdx = Math.round(Math.abs(targetX) / itemWidth);
        if (currentIdx > 0) {
            targetX = -((currentIdx - 1) * itemWidth);
        }
    });

    // Fire Up engine tracking
    requestAnimationFrame(updatePhysics);
});





// ═══════════════════ LUXURY PRELOADER & HERO IGNITION ═══════════════════
document.addEventListener("DOMContentLoaded", () => {
    document.body.classList.add("locked");
    const preloader = document.getElementById("luxury-preloader");
    
    // The exact duration of your SVG choreography
    const PRELOADER_DURATION = 5200; 

    setTimeout(() => {
        // 1. Trigger the Warp-Speed Exit on the preloader
        preloader.classList.add("fade-out");
        
        // 2. Unlock the scroll
        document.body.classList.remove("locked");

        // 3. THE MAGIC HOOK: Tell the DOM the site is ready to ignite the Hero
        document.body.classList.add("site-ignited");

        // 4. Clean up the DOM
        setTimeout(() => {
            preloader.style.display = 'none';
        }, 1200);

    }, PRELOADER_DURATION);
});



/* ─── CALENDLY POPUP ─── */
(function(){
  const calUrl='https://calendly.com/ecommdots/1hr?hide_event_type_details=1&background_color=0a0a0a&text_color=ffffff&primary_color=d9232d';
  const openCal=(e)=>{
    e.preventDefault();
    if(typeof Calendly!=='undefined'){
      Calendly.initPopupWidget({url:calUrl});
    }
    return false;
  };
  ['desktopCalendlyBtn','mobileCalendlyBtn'].forEach(id=>{
    const el=document.getElementById(id);
    if(el)el.addEventListener('click',openCal);
  });
})();


/* ─── MOBILE HAMBURGER & NAV OVERLAY ─── */
(function(){
  const hamburger = document.getElementById('hamburger');
  const mobileNav = document.getElementById('mobileNav');
  if(!hamburger || !mobileNav) return;
  
  const toggle = (open) => {
    hamburger.classList.toggle('is-open', open);
    hamburger.setAttribute('aria-expanded', String(open));
    mobileNav.classList.toggle('is-open', open);
    document.body.style.overflow = open ? 'hidden' : '';
  };
  
  hamburger.addEventListener('click', () => toggle(!hamburger.classList.contains('is-open')));
  document.querySelectorAll('[data-close-nav]').forEach(a => a.addEventListener('click', () => toggle(false)));
  mobileNav.addEventListener('click', e => { if(e.target === mobileNav) toggle(false); });
  document.addEventListener('keydown', e => { if(e.key === 'Escape') toggle(false); });
})();

