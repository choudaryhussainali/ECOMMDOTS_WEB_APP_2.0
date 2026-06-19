document.addEventListener('DOMContentLoaded', () => {


    /* ════════════════════════════════════════════════════════════
       04. PERFORMANCE OBSERVERS (Reveal, Sticky Nav, & Lux Cards)
       ════════════════════════════════════════════════════════════ */
    // A. Sticky Sub-Nav Sync
    const snItems = document.querySelectorAll('.sn-item');
    const serviceSections = document.querySelectorAll('.premium-section[id]');
    
    const navObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                snItems.forEach(item => {
                    const targetId = item.getAttribute('href');
                    item.classList.toggle('active', targetId === '#' + entry.target.id);
                });
                
                // Smoothly scroll the sticky nav horizontally if on mobile
                const activeNav = document.querySelector(`.sn-item[href="#${entry.target.id}"]`);
                if(activeNav && window.innerWidth <= 1024) {
                    activeNav.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
                }
            }
        });
    }, { rootMargin: "-40% 0px -40% 0px" });
    serviceSections.forEach(sec => navObserver.observe(sec));

    // B. Base Reveal Animations
    const revealObserver = new IntersectionObserver(entries => {
        entries.forEach(e => { 
            if(e.isIntersecting){ 
                e.target.classList.add('is-visible'); 
                revealObserver.unobserve(e.target); 
            }
        });
    }, { rootMargin: "0px 0px -50px 0px" });
    document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

    // C. Lux Scrolling Cards (Cinematic Scrubbing)
    const luxCards = document.querySelectorAll('.lux-observe');
    const luxObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-active');
            } else {
                entry.target.classList.remove('is-active');
            }
        });
    }, { rootMargin: "-30% 0px -30% 0px", threshold: 0.1 });
    luxCards.forEach(card => luxObserver.observe(card));

    /* ════════════════════════════════════════════════════════════
       05. INTELLIGENT MODAL ENGINE
       ════════════════════════════════════════════════════════════ */
    const eliteModal = document.getElementById('eliteModal');
    const modalClose = document.getElementById('modalClose');
    const modalActionBtn = document.getElementById('modalActionBtn');
    const body = document.body;

    const popImg = document.getElementById('modalImg');
    const popIcon = document.getElementById('modalIcon');
    const popTitle = document.getElementById('modalTitle');
    const popLead = document.getElementById('modalLead');
    const popExt = document.getElementById('modalExtended');

    document.querySelectorAll('.sub-card-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const card = btn.closest('.sub-card');

            // Extract Data
            const imgSrc = card.querySelector('.sub-card-media img').src;
            const iconSvg = card.querySelector('.sub-card-icon').innerHTML;
            const title = card.querySelector('.sub-card-content h3').innerText;
            const leadText = card.querySelector('.sub-card-content p').innerText;
            const detailedDiv = card.querySelector('.hidden-details');
            
            const extendedHTML = detailedDiv 
                ? detailedDiv.innerHTML 
                : `<p>Deploy our proprietary framework to systematically capture market share, neutralize competitors, and scale revenue with algorithmic precision.</p>`;

            // Inject Data
            popImg.src = imgSrc;
            popIcon.innerHTML = iconSvg;
            popTitle.innerText = title;
            popLead.innerText = leadText;
            popExt.innerHTML = extendedHTML;

            const btnText = btn.innerText.trim();
            modalActionBtn.innerHTML = `${btnText} <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>`;

            // Trigger Animation
            eliteModal.classList.add('active');
            body.style.overflow = 'hidden'; 
        });
    });

    const closeEliteModal = () => {
        eliteModal.classList.remove('active');
        body.style.overflow = ''; 
    };

    if(modalClose) modalClose.addEventListener('click', closeEliteModal);
    if(eliteModal) eliteModal.addEventListener('click', (e) => {
        if(e.target === eliteModal) closeEliteModal();
    });

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

    /* ════════════════════════════════════════════════════════════
       03. SMOOTH SCROLL ROUTING & GLOBAL CTA INTERCEPTOR
       ════════════════════════════════════════════════════════════ */
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            // Ignore modal buttons to prevent logic conflicts
            if (this.classList.contains('sub-card-btn') || this.id === 'modalActionBtn') return;
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return; 
            
            // Intercept ANY link pointing to #contact and open the Form Modal instantly
            if (targetId === '#contact') {
                e.preventDefault();
                const formModal = document.getElementById('conciergeModal');
                if(formModal) {
                    formModal.classList.add('active');
                    document.body.style.overflow = 'hidden'; // Lock background scroll
                }
                
                // Also close mobile nav if open
                const mobileNav = document.getElementById('mobileNav');
                const hamburger = document.getElementById('hamburger');
                if(mobileNav && mobileNav.classList.contains('is-open')){
                    mobileNav.classList.remove('is-open');
                    hamburger && hamburger.classList.remove('is-open');
                    hamburger && hamburger.setAttribute('aria-expanded', 'false');
                }
                
                return;
            }
            
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
      // URL contains custom parameters for Obsidian Dark Mode & Agency Red
      const calUrl='https://calendly.com/ecommdots/1hr?hide_event_type_details=1&background_color=0a0a0a&text_color=ffffff&primary_color=d9232d';
      
      const openCal=(e)=>{
        e.preventDefault(); // Stops the page from jumping
        if(typeof Calendly !== 'undefined'){
          Calendly.initPopupWidget({url: calUrl});
        }
        return false;
      };
      
      // Bind the popup strictly to the header and mobile nav buttons
      ['desktopCalendlyBtn','mobileCalendlyBtn'].forEach(id=>{
        const el = document.getElementById(id);
        if(el) {
            el.addEventListener('click', openCal);
        }
      });
    })();


    /* ════════════════════════════════════════════════════════════
       06. DUAL-FUNCTION CONCIERGE ENGINE (THE CROSS-FADE MAGIC)
       ════════════════════════════════════════════════════════════ */
    const targetGroup = document.getElementById('targetGroup');
    const customSelectTrigger = document.getElementById('customSelectTrigger');
    const customSelectText = document.getElementById('customSelectText');
    const hiddenServiceInput = document.getElementById('serviceSubject');
    const allOptions = document.querySelectorAll('.custom-option');
    
    // Concierge Modal Elements
    const conciergeModal = document.getElementById('conciergeModal');
    const conciergeClose = document.getElementById('conciergeClose');

    // Toggle dropdown manually inside the form
    if(customSelectTrigger && targetGroup) {
        customSelectTrigger.addEventListener('click', () => targetGroup.classList.toggle('open'));

        allOptions.forEach(option => {
            option.addEventListener('click', () => {
                const selectedValue = option.getAttribute('data-value');
                customSelectText.innerText = selectedValue;
                hiddenServiceInput.value = selectedValue;
                
                allOptions.forEach(opt => opt.classList.remove('active'));
                option.classList.add('active');
                targetGroup.classList.remove('open');
            });
        });

        document.addEventListener('click', (e) => {
            if (!targetGroup.contains(e.target)) targetGroup.classList.remove('open');
        });
    }

    // Modal Cross-Fade Logic (From Service Modal -> To Form Modal)
    if(modalActionBtn && customSelectText) {
        modalActionBtn.addEventListener('click', (e) => {
            e.preventDefault(); 
            
            // 1. Grab service requested and update the form
            const requestedService = document.getElementById('modalTitle').innerText;
            customSelectText.innerText = requestedService;
            hiddenServiceInput.value = requestedService;
            
            allOptions.forEach(opt => {
                opt.classList.remove('active');
                if (opt.getAttribute('data-value') === requestedService) opt.classList.add('active');
            });
            
            // Trigger the visual pulse glow on the form input
            targetGroup.classList.remove('pulse-glow'); 
            void targetGroup.offsetWidth; 
            targetGroup.classList.add('pulse-glow');
            
            // 2. THE MILLION DOLLAR CROSS-FADE
            const eliteModal = document.getElementById('eliteModal');
            eliteModal.classList.remove('active'); // Gracefully fade out the info modal
            
            setTimeout(() => {
                conciergeModal.classList.add('active'); // Fade in the form exactly where they are looking
                
                // Focus the first input dynamically for frictionless typing
                setTimeout(() => document.getElementById('name').focus(), 400);
            }, 400); // 400ms perfectly aligns with your CSS blur/fade speeds
        });
    }

    // Close functionality for the new Concierge Modal
    const closeConciergeModal = () => {
        conciergeModal.classList.remove('active');
        document.body.style.overflow = ''; // Unlock background scroll
    };

    if(conciergeClose) conciergeClose.addEventListener('click', closeConciergeModal);
    if(conciergeModal) conciergeModal.addEventListener('click', (e) => {
        if(e.target === conciergeModal) closeConciergeModal();
    });

    /* ════════════════════════════════════════════════════════════
       07. PROCESS TRACK ENGINE & APEX RETURN
       ════════════════════════════════════════════════════════════ */
    const processTrack = document.getElementById('processTrack');
    const processLineFill = document.getElementById('processLineFill');
    const processSteps = document.querySelectorAll('.process-step');
    const apexReturnBtn = document.getElementById('apexReturn');

    window.addEventListener('scroll', () => {
        // Process Track Logic
        if(processTrack && processLineFill) {
            const trackRect = processTrack.getBoundingClientRect();
            const triggerPoint = window.innerHeight * 0.8;
            
            let progress = (triggerPoint - trackRect.top) / trackRect.height;
            progress = Math.max(0, Math.min(1, progress)); 
            processLineFill.style.height = `${progress * 100}%`;
            
            processSteps.forEach(step => {
                const stepRect = step.getBoundingClientRect();
                if(stepRect.top < triggerPoint) {
                    step.classList.add('active');
                } else {
                    step.classList.remove('active');
                }
            });
        }

        // Apex Return Reveal Logic
        if(apexReturnBtn) {
            if (window.scrollY > 800) { 
                apexReturnBtn.classList.add('visible');
            } else {
                apexReturnBtn.classList.remove('visible');
            }
        }
    }, {passive:true});

    if(apexReturnBtn) {
        apexReturnBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

}); // End of DOMContentLoaded Master Wrap


// CONTACT FORM CTA
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

/* ════════════════════════════════════════════════════════════
       08. CONCIERGE MODAL FORMSPREE ENGINE (ELITE PAYLOAD)
       ════════════════════════════════════════════════════════════ */
    const eliteContactForm = document.getElementById('eliteContactForm');
    const conciergeSuccess = document.getElementById('conciergeSuccess');
    
    // Fallback query in case the ID wasn't applied directly to the button
    const conciergeSubmitBtn = document.getElementById('conciergeSubmitBtn') || eliteContactForm?.querySelector('.form-submit-btn');

    if (eliteContactForm) {
        eliteContactForm.addEventListener('submit', async function(e) {
            e.preventDefault(); // Prevents page reload
            
            const originalBtnContent = conciergeSubmitBtn.innerHTML;
            
            // UX: Kinetic loading state
            conciergeSubmitBtn.innerHTML = '<span>TRANSMITTING...</span>';
            conciergeSubmitBtn.style.pointerEvents = 'none';

            // Constructing a premium, ordered JSON payload for Formspree
            const payload = {
                "=== 1. EXECUTIVE PROFILE ===": "",
                "01. Full Name": document.getElementById('name').value.trim(),
                "02. Work Email": document.getElementById('email').value.trim(),
                "03. Brand / Company": document.getElementById('brand').value.trim(),
                
                "=== 2. STRATEGIC TARGET ===": "",
                "04. Targeted Protocol": document.getElementById('serviceSubject').value || "General Audit Request",
                "05. Monthly Revenue & Goals": document.getElementById('message').value.trim()
            };

            try {
                const response = await fetch("https://formspree.io/f/mykaoybq", {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify(payload)
                });

                if (response.ok) {
                    // Million-dollar cross-fade to success state
                    eliteContactForm.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
                    eliteContactForm.style.opacity = '0';
                    eliteContactForm.style.transform = 'translateY(-10px)';
                    
                    setTimeout(() => {
                        eliteContactForm.style.display = 'none';
                        if (conciergeSuccess) {
                            conciergeSuccess.style.display = 'block';
                            // Slight delay ensures the browser registers display:block before fading in
                            setTimeout(() => conciergeSuccess.classList.add('show'), 50);
                        }
                    }, 400);

                    this.reset(); 
                    
                    // Visually reset the custom glass select engine
                    const selectText = document.getElementById('customSelectText');
                    const hiddenInput = document.getElementById('serviceSubject');
                    if (selectText) selectText.innerText = "General Audit Request";
                    if (hiddenInput) hiddenInput.value = "General Audit Request";
                    
                    document.querySelectorAll('.custom-option').forEach(opt => opt.classList.remove('active'));
                    const defaultOpt = document.querySelector('.custom-option[data-value="General Audit Request"]');
                    if (defaultOpt) defaultOpt.classList.add('active');
                    
                    const targetGroup = document.getElementById('targetGroup');
                    if (targetGroup) targetGroup.classList.remove('pulse-glow');

                } else {
                    const data = await response.json();
                    let errorMsg = "Transmission failed. Please try again.";
                    if (Object.hasOwn(data, 'errors')) {
                        errorMsg = data.errors.map(err => err.message).join(", ");
                    }
                    alert(errorMsg);
                    
                    conciergeSubmitBtn.innerHTML = originalBtnContent;
                    conciergeSubmitBtn.style.pointerEvents = 'auto';
                }
            } catch (error) {
                alert("Network error. Please check your connection and try again.");
                conciergeSubmitBtn.innerHTML = originalBtnContent;
                conciergeSubmitBtn.style.pointerEvents = 'auto';
            }
        });
    }