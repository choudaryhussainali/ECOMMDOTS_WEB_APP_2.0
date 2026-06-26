

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





/* ═══════════════════════════════════════════════════════════
   MILLION DOLLAR CMS ENGINE: CLIENT REVIEWS (SUPABASE)
═══════════════════════════════════════════════════════════ */
const SUPABASE_URL = 'https://dmvnyhzlsnzrovclhjeb.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRtdm55aHpsc256cm92Y2xoamViIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODExMTMxMDYsImV4cCI6MjA5NjY4OTEwNn0.9DHfyeeoG90YeQJ8h3_LREGTa5LUHo-mKvAq2U9AB2Q';

let supabaseClient = null;
let clientReviews = [];
let editingReviewId = null;
let isAdmin = false;

async function loadReviews() {
    if (!supabaseClient) return;
    try {
        const { data, error } = await supabaseClient
            .from('client_reviews')
            .select('*')
            .order('sort_order', { ascending: true });

        if (error) throw error;
        clientReviews = data || [];
    } catch(e) {
        console.error("Vault Connection Error:", e);
        clientReviews = [];
    }
    renderReviews();
    if (isAdmin) renderAdminReviewList();
}

/* ═══════════════════════════════════════════════════════════
   RENDER SYSTEM: DUAL UI ARCHITECTURE
═══════════════════════════════════════════════════════════ */
function createCardHTML(rev, i, isVault = false) {
    const featuredClass = rev.is_featured ? 'featured' : '';
    const delayClass = isVault ? '' : `del-${(i % 3) + 1}`; 
    
    let badgeClass = 'badge-direct';
    if (rev.platform && rev.platform.toLowerCase().includes('amazon')) badgeClass = 'badge-amazon';
    if (rev.platform && rev.platform.toLowerCase().includes('upwork')) badgeClass = 'badge-upwork';

    const stars = `
        <svg viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
        <svg viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
        <svg viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
        <svg viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
        <svg viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
    `;

    // DATA FAILSAFE: Ensure missing names don't break the initial generator
    const safeName = rev.author_name ? rev.author_name.trim() : 'Client';
    const initial = safeName.charAt(0).toUpperCase();

    const monogramHTML = `<div style="width:46px; height:46px; border-radius:50%; background:var(--red); display:flex; align-items:center; justify-content:center; color:#fff; font-weight:800; font-size:18px; flex-shrink:0;">${initial}</div>`;
    
    let avatarHtml = monogramHTML;
    
    if (rev.avatar_file && rev.avatar_file.trim() !== '') {
        avatarHtml = `
        <img class="rv-avatar" src="/static/images/testimonials/${rev.avatar_file}" alt="${safeName}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
        <div style="display:none; width:46px; height:46px; border-radius:50%; background:var(--red); align-items:center; justify-content:center; color:#fff; font-weight:800; font-size:18px; flex-shrink:0;">${initial}</div>
        `;
    }

    return `
    <div class="review-card reveal ${featuredClass} ${delayClass}">
        <div class="rv-header">
            <div class="rv-stars">${stars}</div>
            <span class="rv-platform-badge ${badgeClass}">${rev.platform || 'Direct'}</span>
        </div>
        <span class="rv-quote">"</span>
        <div class="rv-text">${rev.quote || ''}</div>
        <div class="rv-author">
            ${avatarHtml}
            <div>
                <div class="rv-name">${safeName}</div>
                <div class="rv-role">${rev.author_role || ''}</div>
            </div>
        </div>
    </div>
    `;
}

function renderReviews() {
    const grid = document.getElementById('dynamicReviewsGrid');
    const actionRow = document.getElementById('reviewsActionRow');
    const loadBtn = document.getElementById('btnLoadMoreReviews');
    
    if (!grid) return;

    const visibleReviews = clientReviews.filter(r => r.visible);

    if (visibleReviews.length === 0) {
        grid.innerHTML = `<div style="grid-column: span 3; text-align: center; color: #666; padding: 40px; font-family: var(--font-sans);">Awaiting verified client data...</div>`;
        if (actionRow) actionRow.style.display = 'none';
        return;
    }

    // STRICT LIMIT: The main page renders exactly 6 fully visible cards.
    const topReviews = visibleReviews.slice(0, 6);
    grid.innerHTML = topReviews.map((rev, i) => createCardHTML(rev, i, false)).join('');

    // Trigger initial animations
    const revObs = new IntersectionObserver(entries => {
        entries.forEach(e => { if(e.isIntersecting){ e.target.classList.add('is-visible'); revObs.unobserve(e.target); } });
    }, { rootMargin:'0px 0px -60px 0px' });
    document.querySelectorAll('#dynamicReviewsGrid .reveal').forEach(el => revObs.observe(el));

    // UI Routing: Do we need the Vault Button?
    if (actionRow && loadBtn) {
        if (visibleReviews.length > 6) {
            actionRow.style.display = 'block'; // Show the button row
            
            // Clone button to ensure clean event binding
            const newBtn = loadBtn.cloneNode(true);
            loadBtn.parentNode.replaceChild(newBtn, loadBtn);
            
            // BIND THEATER MODE
            newBtn.addEventListener('click', () => {
                renderVaultReviews(visibleReviews);
                document.getElementById('reviewVaultModal').classList.add('open');
                document.body.style.overflow = 'hidden'; 
            });
        } else {
            actionRow.style.display = 'none'; // Hide the button if 6 or fewer
        }
    }
}

function renderVaultReviews(allReviews) {
    const vaultGrid = document.getElementById('vaultReviewsGrid');
    if (!vaultGrid) return;
    
    // Renders every single review without stagger delays
    vaultGrid.innerHTML = allReviews.map((rev, i) => createCardHTML(rev, i, true)).join('');
    
    // Force them all to be visible immediately in the vault
    setTimeout(() => {
        document.querySelectorAll('#vaultReviewsGrid .review-card').forEach(el => el.classList.add('is-visible'));
    }, 100);
}

// Bind the Vault Close button
document.addEventListener('DOMContentLoaded', () => {
    const vaultCloseBtn = document.getElementById('rvVaultClose');
    const vaultModal = document.getElementById('reviewVaultModal');
    
    if (vaultCloseBtn && vaultModal) {
        vaultCloseBtn.addEventListener('click', () => {
            vaultModal.classList.remove('open');
            document.body.style.overflow = ''; // Unlocks background
        });
        
        // Close on background click
        vaultModal.addEventListener('click', (e) => {
            if (e.target === vaultModal) {
                vaultModal.classList.remove('open');
                document.body.style.overflow = '';
            }
        });
        
        // Close on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && vaultModal.classList.contains('open')) {
                vaultModal.classList.remove('open');
                document.body.style.overflow = '';
            }
        });
    }
});




/* ── ADMIN LIST RENDER & LOGIC ── */
function renderAdminReviewList() {
    const list = document.getElementById('adminReviewList');
    if (!list) return;

    list.innerHTML = clientReviews.map(rev => `
        <div class="admin-job-item" data-id="${rev.id}">
            <div class="admin-job-drag" aria-label="Drag to reorder">
                <svg viewBox="0 0 24 24"><circle cx="9" cy="5" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="19" r="1"/></svg>
            </div>
            <div class="admin-job-info">
                <div class="admin-job-title">${rev.author_name} ${rev.is_featured ? '<span style="color:var(--red);font-size:10px;margin-left:8px;">[FEATURED]</span>' : ''}</div>
                <div class="admin-job-meta">${rev.platform} · ${rev.author_role}</div>
            </div>
            <div class="admin-job-toggle">
                <input type="checkbox" class="toggle-switch" ${rev.visible ? 'checked' : ''} data-id="${rev.id}">
            </div>
            <div class="admin-job-actions">
                <button class="admin-btn-icon edit" data-id="${rev.id}"><svg viewBox="0 0 24 24"><path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg></button>
                <button class="admin-btn-icon delete" data-id="${rev.id}"><svg viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6M10 11v6M14 11v6M9 6V4h6v2"/></svg></button>
            </div>
        </div>
    `).join('');

    // Toggle
    list.querySelectorAll('.toggle-switch').forEach(sw => {
        sw.addEventListener('change', async function() {
            if (!supabaseClient) return;
            const id = this.dataset.id;
            const rev = clientReviews.find(r => r.id === id);
            if (rev) { 
                rev.visible = this.checked; 
                await supabaseClient.from('client_reviews').update({ visible: this.checked }).eq('id', id);
                renderReviews(); 
            }
        });
    });

    // Delete
    list.querySelectorAll('.admin-btn-icon.delete').forEach(btn => {
        btn.addEventListener('click', async function() {
            if (!supabaseClient) return;
            if (confirm('Permanently delete this review?')) {
                await supabaseClient.from('client_reviews').delete().eq('id', this.dataset.id);
                loadReviews(); 
            }
        });
    });

    // Edit
    list.querySelectorAll('.admin-btn-icon.edit').forEach(btn => {
        btn.addEventListener('click', function() { openReviewEditForm(this.dataset.id); });
    });

    initReviewDragSort(list);
}

/* ── ADMIN UI CONTROLS ── */
function initReviewAdmin() {
    const fab = document.getElementById('adminFab');
    const overlay = document.getElementById('adminOverlay');
    const closeBtn = document.getElementById('adminClose');
    const addBtn = document.getElementById('adminAddBtn');
    const saveBtn = document.getElementById('editFormSave');
    const cancelBtn = document.getElementById('editFormCancel');

    if(fab) fab.addEventListener('click', () => { overlay.classList.add('open'); renderAdminReviewList(); });
    if(closeBtn) closeBtn.addEventListener('click', () => overlay.classList.remove('open'));
    if(addBtn) addBtn.addEventListener('click', () => openReviewEditForm(null));
    if(saveBtn) saveBtn.addEventListener('click', saveReviewForm);
    if(cancelBtn) cancelBtn.addEventListener('click', closeReviewForm);

    // Stealth Login
    document.addEventListener('keydown', async (e) => {
        if (e.ctrlKey && e.shiftKey && e.key === 'E') {
            if (!supabaseClient) return alert("Vault connecting...");
            const email = prompt("Identity:");
            if (!email) return;
            const password = prompt("Passkey:");
            if (!password) return;

            const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
            if (error) { alert("Access Denied"); } 
            else {
                isAdmin = true;
                if(fab) fab.style.display = 'flex';
                renderAdminReviewList();
                alert("Vault Unlocked.");
            }
        }
    });
}

function openReviewEditForm(id) {
    editingReviewId = id || null;
    const overlay = document.getElementById('editFormOverlay');
    const title = document.getElementById('editFormTitle');

    if (id) {
        const rev = clientReviews.find(r => r.id === id);
        if (!rev) return;
        title.textContent = 'EDIT REVIEW';
        document.getElementById('rvName').value = rev.author_name;
        document.getElementById('rvRole').value = rev.author_role;
        document.getElementById('rvPlatform').value = rev.platform;
        document.getElementById('rvQuote').value = rev.quote;
        document.getElementById('rvFeatured').checked = rev.is_featured;
        document.getElementById('rvAvatar').value = rev.avatar_file || '';
    } else {
        title.textContent = 'ADD REVIEW';
        document.getElementById('rvName').value = '';
        document.getElementById('rvRole').value = '';
        document.getElementById('rvPlatform').value = 'Direct';
        document.getElementById('rvQuote').value = '';
        document.getElementById('rvFeatured').checked = false;
        document.getElementById('rvAvatar').value = '';
    }
    if(overlay) overlay.classList.add('open');
}

function closeReviewForm() {
    const overlay = document.getElementById('editFormOverlay');
    if(overlay) overlay.classList.remove('open');
    editingReviewId = null;
}

async function saveReviewForm() {
    if (!supabaseClient) return;

    const author_name = document.getElementById('rvName').value.trim();
    const author_role = document.getElementById('rvRole').value.trim();
    const platform = document.getElementById('rvPlatform').value;
    const quote = document.getElementById('rvQuote').value.trim();
    const is_featured = document.getElementById('rvFeatured').checked;
    const avatar_file = document.getElementById('rvAvatar').value.trim(); // NEW

    if (!author_name || !quote) { alert('Name and Quote are required.'); return; }

    const saveBtn = document.getElementById('editFormSave');
    saveBtn.textContent = "SAVING...";

    const payload = { author_name, author_role, platform, quote, is_featured, avatar_file };

    try {
        if (editingReviewId) {
            await supabaseClient.from('client_reviews').update(payload).eq('id', editingReviewId);
        } else {
            payload.visible = true;
            payload.sort_order = clientReviews.length;
            await supabaseClient.from('client_reviews').insert([payload]);
        }
    } catch(e) {
        alert("Operation failed.");
    }

    saveBtn.textContent = "SAVE REVIEW";
    await loadReviews(); 
    closeReviewForm();
}

function initReviewDragSort(container) {
    let dragged = null;
    container.querySelectorAll('.admin-job-item').forEach(item => {
        item.setAttribute('draggable', true);
        item.addEventListener('dragstart', function() { dragged = this; setTimeout(() => this.style.opacity = '0.4', 0); });
        item.addEventListener('dragend', function() { this.style.opacity = ''; dragged = null; });
        item.addEventListener('dragover', function(e) {
            e.preventDefault();
            if (!dragged || dragged === this) return;
            const mid = this.getBoundingClientRect().top + this.getBoundingClientRect().height / 2;
            container.insertBefore(dragged, e.clientY < mid ? this : this.nextSibling);
            
            const newOrder = [...container.querySelectorAll('.admin-job-item')].map(el => el.dataset.id);
            clientReviews.sort((a, b) => newOrder.indexOf(a.id) - newOrder.indexOf(b.id));
            renderReviews();
            
            const updates = clientReviews.map((rev, index) => ({ id: rev.id, sort_order: index }));
            supabaseClient.from('client_reviews').upsert(updates);
        });
    });
}

/* ── MASTER BOOT (DB CONNECTION) ── */
document.addEventListener('DOMContentLoaded', async () => {
    const adminFab = document.getElementById('adminFab');
    if (adminFab) adminFab.style.display = 'none';

    initReviewAdmin();

    if (window.supabase) {
        supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        try {
            const { data: { session } } = await supabaseClient.auth.getSession();
            if (session) {
                isAdmin = true;
                if (adminFab) adminFab.style.display = 'flex';
            }
        } catch(e) { console.error(e); }
        await loadReviews();
    }
});