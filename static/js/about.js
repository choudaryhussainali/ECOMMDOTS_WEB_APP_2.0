/* ─── CUSTOM CURSOR ─── */
(function() {
  const dot  = document.getElementById('cur-dot');
  const ring = document.getElementById('cur-ring');
  let mx = 0, my = 0, rx = 0, ry = 0;

  document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; dot.style.left = mx + 'px'; dot.style.top = my + 'px'; });

  (function animRing() {
    rx += (mx - rx) * 0.12;
    ry += (my - ry) * 0.12;
    ring.style.left = rx + 'px';
    ring.style.top  = ry + 'px';
    requestAnimationFrame(animRing);
  })();

  document.querySelectorAll('a, button, .port-card, .team-card, .pillar-item, .value-card, .pf-tab, .tt-btn').forEach(el => {
    el.addEventListener('mouseenter', () => { dot.classList.add('hov'); ring.classList.add('hov'); });
    el.addEventListener('mouseleave', () => { dot.classList.remove('hov'); ring.classList.remove('hov'); });
  });

  document.addEventListener('mousedown', () => { dot.classList.add('tap'); ring.classList.add('tap'); });
  document.addEventListener('mouseup',   () => { dot.classList.remove('tap'); ring.classList.remove('tap'); });
})();

/* ─── SCROLL REVEAL ─── */
(function() {
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('up');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale').forEach(el => io.observe(el));

  // Timeline line animation
  const tsLine = document.getElementById('tsLine');
  if (tsLine) {
    const tlObs = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) { tsLine.classList.add('animated'); tlObs.disconnect(); }
    }, { threshold: 0.4 });
    tlObs.observe(tsLine);
  }
})();


/* ════════════════════════════════════════════════════════════
   SOCIAL SIDEBAR TOGGLE ENGINE
   ════════════════════════════════════════════════════════════ */
(function(){
  const sidebar = document.getElementById('socialSidebar');
  const toggleBtn = document.getElementById('toggleBtn');
  if(sidebar && toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      sidebar.classList.toggle('open');
    });
  }
})();

/* ════════════════════════════════════════════════════════════
   CALENDLY POPUP ENGINE (STEALTH MODE)
   ════════════════════════════════════════════════════════════ */
(function(){
  const calUrl='https://calendly.com/mailhussainali00/30min?hide_event_type_details=1&background_color=0a0a0a&text_color=ffffff&primary_color=d9232d';
  const openCal=(e)=>{
    e.preventDefault();
    if(typeof Calendly !== 'undefined'){
      Calendly.initPopupWidget({url: calUrl});
    }
    return false;
  };
  
  ['desktopCalendlyBtn','mobileCalendlyBtn'].forEach(id=>{
    const el = document.getElementById(id);
    if(el) { el.addEventListener('click', openCal); }
  });
})();

/* ════════════════════════════════════════════════════════════
   MOBILE HAMBURGER & NAV OVERLAY
   ════════════════════════════════════════════════════════════ */
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

/* ════════════════════════════════════════════════════════════
   SMOOTH SCROLL ROUTING
   ════════════════════════════════════════════════════════════ */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        const targetId = this.getAttribute('href');
        if (targetId === '#') return; 
        
        // Standard smooth scroll for navigation
        const target = document.querySelector(targetId);
        if (target) { 
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
/* ─── PORTFOLIO FILTERS ─── */
document.querySelectorAll('.pf-tab').forEach(tab => {
  tab.addEventListener('click', function() {
    document.querySelectorAll('.pf-tab').forEach(t => t.classList.remove('active'));
    this.classList.add('active');
    // Visual-only demo — in production, filter .port-card by data attributes
    document.querySelectorAll('.port-card').forEach((card, i) => {
      card.style.opacity = '0';
      card.style.transform = 'scale(0.95)';
      setTimeout(() => {
        card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        card.style.opacity = '1';
        card.style.transform = 'scale(1)';
      }, i * 60 + 100);
    });
  });
});

/* ─── TEAM DEPT TABS ─── */
document.querySelectorAll('.tt-btn').forEach(btn => {
  btn.addEventListener('click', function() {
    document.querySelectorAll('.tt-btn').forEach(b => b.classList.remove('active'));
    this.classList.add('active');
  });
});

/* ─── COUNTER ANIMATION ─── */
(function() {
  const counters = document.querySelectorAll('[data-count]');
  const cObs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseFloat(el.getAttribute('data-count'));
      const duration = 2000;
      const start = performance.now();
      function tick(now) {
        const p = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - p, 4);
        el.textContent = (eased * target).toFixed(target % 1 !== 0 ? 1 : 0);
        if (p < 1) requestAnimationFrame(tick);
        else el.textContent = target;
      }
      requestAnimationFrame(tick);
      cObs.unobserve(el);
    });
  }, { threshold: 0.5 });
  counters.forEach(c => cObs.observe(c));
})();



/* ─── CINEMATIC JOURNEY SCROLL SYNC ─── */
(function() {
  const track = document.getElementById('pjTrack');
  const fill = document.getElementById('pjFill');
  const nodes = document.querySelectorAll('.pj-node');
  
  if(!track || !fill || nodes.length === 0) return;

  const updateJourney = () => {
    const rect = track.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    
    // 1. Calculate dynamic scroll laser line
    // Starts tracking when the top of the track hits 60% of the viewport height
    const trackStart = viewportHeight * 0.6;
    // Calculate progress (0 to 1) based on scroll position
    let progress = (trackStart - rect.top) / (rect.height - 50); 
    progress = Math.max(0, Math.min(1, progress));
    fill.style.height = (progress * 100) + '%';
    
    // 2. Trigger Node Reveals & Glow States
    nodes.forEach(node => {
      const nRect = node.getBoundingClientRect();
      const dotTrigger = viewportHeight * 0.65; // Trigger point for dot glow

      // Fade up the card when it enters viewport
      if (nRect.top < viewportHeight * 0.85) {
        node.classList.add('in-view');
      }
      
      // Light up the dot only when the laser line reaches it
      if (nRect.top + (nRect.height / 2) < dotTrigger) {
        node.classList.add('is-active');
      } else {
        node.classList.remove('is-active');
      }
    });
  };

  // Bind to scroll with passive listener for maximum performance
  window.addEventListener('scroll', updateJourney, { passive: true });
  // Fire once on load to establish initial state
  updateJourney();
})();


/* ─── FORM SUCCESS TOGGLE ─── */
document.getElementById('formSubmit').addEventListener('click', function() {
    const btn = this;
    btn.innerHTML = '<span>SENDING...</span>';
    setTimeout(() => {
        const formContainer = document.getElementById('contactForm');
        const successContainer = document.getElementById('formSuccess');
        if(formContainer && successContainer) {
            formContainer.style.display = 'none';
            successContainer.classList.add('show');
        }
    }, 1500);
});
