

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
  const calUrl='https://calendly.com/ecommdots/1hr?hide_event_type_details=1&background_color=0a0a0a&text_color=ffffff&primary_color=d9232d';
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
/* ── PROOF STRIP ── */
const tags = ['VERIFIED CLIENT REVIEWS','87+ BRANDS SCALED','5/5 STAR RATING','96% RENEWAL RATE','$100M+ REVENUE MANAGED','AMAZON EXPERTS SINCE 2019',
              'VERIFIED CLIENT REVIEWS','87+ BRANDS SCALED','5/5 STAR RATING','96% RENEWAL RATE','$100M+ REVENUE MANAGED','AMAZON EXPERTS SINCE 2019'];
const track = document.getElementById('stripTrack');
tags.forEach((t,i) => {
  const el = document.createElement('div');
  el.className = 'strip-item';
  el.innerHTML = `<span class="strip-text">${t}</span>${i<tags.length-1?'<span class="strip-dot"></span>':''}`;
  track.appendChild(el);
});




/* ── REVEAL OBSERVER ── */
const revObs = new IntersectionObserver(entries => {
  entries.forEach(e => { if(e.isIntersecting){ e.target.classList.add('is-visible'); revObs.unobserve(e.target); } });
}, { rootMargin:'0px 0px -60px 0px' });
document.querySelectorAll('.reveal,.review-card').forEach(el => revObs.observe(el));

/* ── COUNTER ANIMATION ── */
const cntObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if(e.isIntersecting){
      e.target.querySelectorAll('.counter').forEach(c => {
        const t = +c.dataset.target, d = 2000, s = performance.now();
        const upd = now => { const p=Math.min((now-s)/d,1), v=Math.floor((1-Math.pow(1-p,4))*t);c.textContent=v;if(p<1)requestAnimationFrame(upd);else c.textContent=t; };
        requestAnimationFrame(upd);
      });
      cntObs.unobserve(e.target);
    }
  });
},{threshold:.3});
document.querySelectorAll('.testi-hero').forEach(el => cntObs.observe(el));

/* ── RATING BARS ANIMATION ── */
const barObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if(e.isIntersecting){
      e.target.querySelectorAll('.ro-bar-fill').forEach((bar,i) => {
        const w = parseFloat(bar.dataset.width||0);
        setTimeout(()=>{ bar.style.transform=`scaleX(${w})`; bar.classList.add('animated'); },i*120);
      });
      barObs.unobserve(e.target);
    }
  });
},{threshold:.3});
document.querySelectorAll('.ro-bars').forEach(el => barObs.observe(el));

/* ── VIDEO CAROUSEL ── */
const vcTrack = document.getElementById('videoTrack');
const vcCards = vcTrack ? Array.from(vcTrack.querySelectorAll('.video-card')) : [];
const vcDotsEl = document.getElementById('vcDots');
let vcIdx = 0;

function getVcStep() {
  if(window.innerWidth > 1100) return 380+28;
  if(window.innerWidth > 640)  return 380+28;
  return window.innerWidth * 0.85 + 16;
}

function buildDots(){
  if(!vcDotsEl) return;
  vcDotsEl.innerHTML = '';
  vcCards.forEach((_,i)=>{
    const d = document.createElement('div');
    d.className='cc-dot'+(i===vcIdx?' active':'');
    d.addEventListener('click',()=>{ vcIdx=i;updateCarousel(); });
    vcDotsEl.appendChild(d);
  });
}

function updateCarousel(){
  const step = getVcStep();
  const maxIdx = Math.max(0, vcCards.length - Math.floor((vcTrack.parentElement.offsetWidth) / step));
  vcIdx = Math.max(0, Math.min(vcIdx, maxIdx));
  vcTrack.style.transform = `translateX(-${vcIdx * step}px)`;
  document.querySelectorAll('.cc-dot').forEach((d,i) => d.classList.toggle('active', i===vcIdx));
}

buildDots();

document.getElementById('vcPrev')?.addEventListener('click', () => { vcIdx=Math.max(0,vcIdx-1); updateCarousel(); });
document.getElementById('vcNext')?.addEventListener('click', () => { vcIdx++; updateCarousel(); });
window.addEventListener('resize', () => { buildDots(); updateCarousel(); });

/* ── VIDEO MODAL ── */
const vidModal = document.getElementById('vidModal');
const vidModalClose = document.getElementById('vidModalClose');

document.querySelectorAll('.vc-play').forEach(btn => {
  btn.addEventListener('click', () => {
    const card = btn.closest('.video-card');
    const clientName = card.dataset.client || 'Client Testimonial';
    document.getElementById('vidClientName').textContent = clientName + ' — Video Testimonial';
    vidModal.classList.add('open');
    document.body.style.overflow = 'hidden';
  });
});

const closeVidModal = () => { vidModal.classList.remove('open'); document.body.style.overflow = ''; };
vidModalClose?.addEventListener('click', closeVidModal);
vidModal?.addEventListener('click', e => { if(e.target === vidModal) closeVidModal(); });
document.addEventListener('keydown', e => { if(e.key === 'Escape') closeVidModal(); });


/* ── PORTRAIT CARD PARALLAX ── */
const pCards = document.querySelectorAll('.portrait-card');
document.addEventListener('mousemove', e => {
  if(window.innerWidth < 1100) return;
  const cx=window.innerWidth/2, cy=window.innerHeight/2;
  const dx=(e.clientX-cx)/cx, dy=(e.clientY-cy)/cy;
  pCards.forEach((c,i) => {
    const depth = [1.5,2.5,2,1,1.8][i] || 1.5;
    c.style.transform = `translate(${dx*depth*8}px, ${dy*depth*8}px)`;
  });
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