/* ═══════════════════════════════════════════════════════════
   1. GLOBAL STATE & CONFIGURATION
═══════════════════════════════════════════════════════════ */
const SUPABASE_URL = 'https://dmvnyhzlsnzrovclhjeb.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRtdm55aHpsc256cm92Y2xoamViIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODExMTMxMDYsImV4cCI6MjA5NjY4OTEwNn0.9DHfyeeoG90YeQJ8h3_LREGTa5LUHo-mKvAq2U9AB2Q';

// DECLARE AS NULL TO PREVENT FATAL CRASHES
let supabaseClient = null; 

const APPLY_FORM_DEFAULT = 'mailto:careers@ecommdots.com';
let jobs = [];
let activeFilter = 'All';
let editingJobId = null;
let isAdmin = false;

const FAQ_DATA = [
    { q: 'Do I need Amazon-specific experience to apply?', a: 'For most marketing and strategy roles, yes — Amazon platform knowledge is required. For design, development, and operations roles, we value adjacent skills and will provide onboarding to our systems and processes.' },
    { q: 'Is the team fully remote?', a: 'Yes, most of our team works remotely across multiple time zones. Some operational roles based in Lahore offer a hybrid arrangement. Each listing specifies the working arrangement clearly.' },
    { q: 'What does the interview process look like?', a: 'We run a four-step process: application form, intro call, skills assessment, and final interview. From first contact to offer, the process typically takes 1–2 weeks.' },
    { q: 'Can I apply to multiple roles?', a: 'Yes, if your skills are genuinely relevant to more than one position, applying to multiple roles is fine. We ask that you tailor each application to the specific role.' },
    { q: 'Do you hire internationally?', a: 'Yes. We have team members across eight nationalities. We hire based on talent and timezone fit, not geography. All positions are paid in USD unless otherwise noted.' },
    { q: 'Is there room for career progression?', a: 'Absolutely. We promote internally first. Most of our senior team leads started in entry or mid-level roles. Growth is tied directly to your contribution, not your tenure.' }
];

/* ═══════════════════════════════════════════════════════════
   2. SECURE DATABASE OPERATIONS
═══════════════════════════════════════════════════════════ */
async function loadJobs() {
    if (!supabaseClient) return;
    try {
        const { data, error } = await supabaseClient
            .from('jobs')
            .select('*')
            .order('sort_order', { ascending: true });

        if (error) throw error;
        jobs = data || [];
    } catch(e) {
        console.error("Vault Connection Error:", e);
        jobs = []; 
    }
    renderJobs();
    if (isAdmin) renderAdminList();
}

async function saveJobOrder() {
    if (!supabaseClient) return;
    try {
        const updates = jobs.map((job, index) => ({
            id: job.id,
            title: job.title,
            dept: job.dept,
            type: job.type,
            desc: job.desc,
            applyLink: job.applyLink,
            sort_order: index,
            visible: job.visible
        }));
        await supabaseClient.from('jobs').upsert(updates);
    } catch(e) {
        console.error("Failed to sync order to vault", e);
    }
}

async function saveEditForm() {
    if (!supabaseClient) return alert("Database connection unavailable.");

    const title = document.getElementById('fieldTitle').value.trim();
    const dept = document.getElementById('fieldDept').value;
    const type = document.getElementById('fieldType').value;
    const location = document.getElementById('fieldLocation').value.trim();
    const desc = document.getElementById('fieldDesc').value.trim();
    const applyLink = document.getElementById('fieldApplyLink').value.trim();

    if (!title || !desc || !applyLink) {
        alert('Protocol Error: Title, Description, and Apply Link are required.');
        return;
    }

    const saveBtn = document.getElementById('editFormSave');
    saveBtn.textContent = "SAVING TO VAULT...";

    const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const todayStr = `${monthNames[new Date().getMonth()]} ${new Date().getFullYear()}`;

    const payload = { title, dept, type, location, desc, applyLink, date: todayStr };

    try {
        if (editingJobId) {
            const { error } = await supabaseClient.from('jobs').update(payload).eq('id', editingJobId);
            if (error) throw error;
        } else {
            payload.visible = true;
            payload.sort_order = jobs.length;
            const { error } = await supabaseClient.from('jobs').insert([payload]);
            if (error) throw error;
        }
    } catch(e) {
        alert("Operation failed: " + e.message);
    }

    saveBtn.textContent = "SAVE POSITION";
    await loadJobs(); 
    closeEditForm();
}




function initSocialSidebar() {
    const sidebar = document.getElementById('socialSidebar');
    const btn = document.getElementById('sidebarToggle');
    if (sidebar && btn) {
        btn.addEventListener('click', () => sidebar.classList.toggle('open'));
    }
}

function initScrollAnimations() {
    const targets = document.querySelectorAll('.benefit-card, .workflow-step');
    if (targets.length === 0) return;

    const obs = new IntersectionObserver((entries) => {
        entries.forEach(e => { 
            if (e.isIntersecting) { 
                e.target.classList.add('visible'); 
                obs.unobserve(e.target); 
            } 
        });
    }, { threshold: 0.12 });

    targets.forEach(el => obs.observe(el));
}

function renderFaq() {
    const list = document.getElementById('faqList');
    if (!list) return;

    list.innerHTML = FAQ_DATA.map((item, i) => `
        <div class="faq-item" data-idx="${i}">
            <button class="faq-question" aria-expanded="false">
                <span class="faq-q-text">${item.q}</span>
                <div class="faq-toggle">
                    <svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                </div>
            </button>
            <div class="faq-answer"><div class="faq-answer-inner">${item.a}</div></div>
        </div>
    `).join('');

    list.querySelectorAll('.faq-question').forEach(btn => {
        btn.addEventListener('click', function() {
            const item = this.closest('.faq-item');
            const isOpen = item.classList.contains('open');
            list.querySelectorAll('.faq-item.open').forEach(el => {
                el.classList.remove('open');
                el.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
            });
            if (!isOpen) {
                item.classList.add('open');
                this.setAttribute('aria-expanded', 'true');
            }
        });
    });
}

function initFilters() {
    const filterContainer = document.getElementById('posFilters');
    if (!filterContainer) return;

    filterContainer.querySelectorAll('.pos-filter').forEach(btn => {
        btn.addEventListener('click', function() {
            filterContainer.querySelectorAll('.pos-filter').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            activeFilter = this.dataset.dept;
            renderJobs();
        });
    });
}

/* ═══════════════════════════════════════════════════════════
   4. RENDER SYSTEM (Dynamic Data)
═══════════════════════════════════════════════════════════ */
function renderJobs() {
    const grid = document.getElementById('jobsGrid');
    if (!grid) return;

    const visible = jobs.filter(j => j.visible && (activeFilter === 'All' || j.dept === activeFilter));

    if (visible.length === 0) {
        grid.innerHTML = `<div class="jobs-empty">
            <div class="jobs-empty-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M8 12h8M12 8v8"/></svg></div>
            <h3>NO OPEN POSITIONS</h3>
            <p>Check back soon or email us your CV directly.</p>
        </div>`;
        return;
    }

    grid.innerHTML = visible.map((job, i) => `
        <div class="job-card" style="animation-delay: ${i * 0.08}s;">
            <div class="job-card-top">
                <span class="job-dept-badge">${job.dept}</span>
                <span class="job-type-badge">${job.type}</span>
            </div>
            <div class="job-title">${job.title}</div>
            <div class="job-meta">
                <svg viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                <span class="job-location">${job.location}</span>
            </div>
            <div class="job-desc">${job.desc}</div>
            <div class="job-card-footer">
                <a href="${job.applyLink}" target="_blank" rel="noopener noreferrer" class="btn-apply">
                    <span>APPLY NOW</span>
                    <svg viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7" stroke-linecap="round" stroke-linejoin="round"/></svg>
                </a>
                <span class="job-date">Posted ${job.date}</span>
            </div>
        </div>
    `).join('');

    // Trigger animations for dynamically loaded cards
    const cards = grid.querySelectorAll('.job-card');
    const obs = new IntersectionObserver((entries) => {
        entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); } });
    }, { threshold: 0.1 });
    cards.forEach(c => obs.observe(c));
}

function renderAdminList() {
    const list = document.getElementById('adminJobList');
    if (!list) return;

    list.innerHTML = jobs.map(job => `
        <div class="admin-job-item" data-id="${job.id}">
            <div class="admin-job-drag" aria-label="Drag to reorder">
                <svg viewBox="0 0 24 24"><circle cx="9" cy="5" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="19" r="1"/></svg>
            </div>
            <div class="admin-job-info">
                <div class="admin-job-title">${job.title}</div>
                <div class="admin-job-meta">${job.dept} · ${job.type} · ${job.location}</div>
            </div>
            <div class="admin-job-toggle">
                <input type="checkbox" class="toggle-switch" ${job.visible ? 'checked' : ''} data-id="${job.id}">
            </div>
            <div class="admin-job-actions">
                <button class="admin-btn-icon edit" data-id="${job.id}"><svg viewBox="0 0 24 24"><path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg></button>
                <button class="admin-btn-icon delete" data-id="${job.id}"><svg viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6M10 11v6M14 11v6M9 6V4h6v2"/></svg></button>
            </div>
        </div>
    `).join('');

    // Toggle Supabase Visibility
    list.querySelectorAll('.toggle-switch').forEach(sw => {
        sw.addEventListener('change', async function() {
            if (!supabaseClient) return;
            const id = this.dataset.id;
            const job = jobs.find(j => j.id === id);
            if (job) { 
                job.visible = this.checked; 
                await supabaseClient.from('jobs').update({ visible: this.checked }).eq('id', id);
                renderJobs(); 
            }
        });
    });

    // Admin Controls
    list.querySelectorAll('.admin-btn-icon.edit').forEach(btn => {
        btn.addEventListener('click', function() { openEditForm(this.dataset.id); });
    });
    
    list.querySelectorAll('.admin-btn-icon.delete').forEach(btn => {
        btn.addEventListener('click', async function() {
            if (!supabaseClient) return;
            if (confirm('Ecommdots Protocol: Delete this position permanently?')) {
                await supabaseClient.from('jobs').delete().eq('id', this.dataset.id);
                loadJobs(); 
            }
        });
    });

    initDragSort(list);
}

function initDragSort(container) {
    let dragged = null;

    container.querySelectorAll('.admin-job-item').forEach(item => {
        item.setAttribute('draggable', true);
        item.addEventListener('dragstart', function() {
            dragged = this;
            setTimeout(() => this.style.opacity = '0.4', 0);
        });
        item.addEventListener('dragend', function() {
            this.style.opacity = '';
            dragged = null;
        });
        item.addEventListener('dragover', function(e) {
            e.preventDefault();
            if (!dragged || dragged === this) return;
            const rect = this.getBoundingClientRect();
            const mid = rect.top + rect.height / 2;
            if (e.clientY < mid) {
                container.insertBefore(dragged, this);
            } else {
                container.insertBefore(dragged, this.nextSibling);
            }
            
            const newOrder = [...container.querySelectorAll('.admin-job-item')].map(el => el.dataset.id);
            jobs.sort((a, b) => newOrder.indexOf(a.id) - newOrder.indexOf(b.id));
            renderJobs();
            saveJobOrder(); 
        });
    });
}

/* ═══════════════════════════════════════════════════════════
   5. ADMIN PANEL CONTROLS
═══════════════════════════════════════════════════════════ */
function initAdmin() {
    const fab = document.getElementById('adminFab');
    const overlay = document.getElementById('adminOverlay');
    const closeBtn = document.getElementById('adminClose');
    const addBtn = document.getElementById('adminAddBtn');
    const saveBtn = document.getElementById('editFormSave');
    const cancelBtn = document.getElementById('editFormCancel');
    const editOverlay = document.getElementById('editFormOverlay');

    if(fab) fab.addEventListener('click', () => { overlay.classList.add('open'); renderAdminList(); });
    if(closeBtn) closeBtn.addEventListener('click', () => overlay.classList.remove('open'));
    if(overlay) overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.classList.remove('open'); });
    if(addBtn) addBtn.addEventListener('click', () => openEditForm(null));
    if(saveBtn) saveBtn.addEventListener('click', saveEditForm);
    if(cancelBtn) cancelBtn.addEventListener('click', closeEditForm);
    if(editOverlay) editOverlay.addEventListener('click', (e) => { if (e.target === editOverlay) closeEditForm(); });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && overlay) {
            overlay.classList.remove('open');
            closeEditForm();
        }
    });

    // Stealth Login Logic
    document.addEventListener('keydown', async (e) => {
        if (e.ctrlKey && e.shiftKey && e.key === 'E') {
            if (!supabaseClient) return alert("System connecting to vault, please wait...");
            
            const email = prompt("Ecommdots Protocol: Enter Identity");
            if (!email) return;
            const password = prompt("Enter Passkey");
            if (!password) return;

            const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });

            if (error) {
                alert("Access Denied: " + error.message);
            } else {
                isAdmin = true;
                if(fab) fab.style.display = 'flex';
                renderAdminList();
                alert("Vault unlocked. Welcome to the Command Center.");
            }
        }
    });
}

function openEditForm(id) {
    editingJobId = id || null;
    const overlay = document.getElementById('editFormOverlay');
    const title = document.getElementById('editFormTitle');

    if (id) {
        const job = jobs.find(j => j.id === id);
        if (!job) return;
        title.textContent = 'EDIT POSITION';
        document.getElementById('fieldTitle').value = job.title;
        document.getElementById('fieldDept').value = job.dept;
        document.getElementById('fieldType').value = job.type;
        document.getElementById('fieldLocation').value = job.location;
        document.getElementById('fieldDesc').value = job.desc;
        document.getElementById('fieldApplyLink').value = job.applyLink;
    } else {
        title.textContent = 'ADD POSITION';
        document.getElementById('fieldTitle').value = '';
        document.getElementById('fieldDept').value = 'Marketing';
        document.getElementById('fieldType').value = 'Full-Time';
        document.getElementById('fieldLocation').value = 'Remote · Global';
        document.getElementById('fieldDesc').value = '';
        document.getElementById('fieldApplyLink').value = APPLY_FORM_DEFAULT;
    }
    if(overlay) overlay.classList.add('open');
}

function closeEditForm() {
    const overlay = document.getElementById('editFormOverlay');
    if(overlay) overlay.classList.remove('open');
    editingJobId = null;
}

/* ═══════════════════════════════════════════════════════════
   6. MASTER BOOT SEQUENCE (DOM SECURE)
═══════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', async () => {
    
    // 1. Initialize Visuals instantly to ensure UI works
    try { initSocialSidebar(); } catch(e) { console.error(e); }
    try { initScrollAnimations(); } catch(e) { console.error(e); }
    try { renderFaq(); } catch(e) { console.error(e); }
    try { initFilters(); } catch(e) { console.error(e); }
    try { initAdmin(); } catch(e) { console.error(e); }

    // 2. Hide admin tools by default
    const adminFab = document.getElementById('adminFab');
    if (adminFab) adminFab.style.display = 'none';

    // 3. Connect to Database securely
    if (window.supabase) {
        supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        
        try {
            const { data: { session } } = await supabaseClient.auth.getSession();
            if (session) {
                isAdmin = true;
                if (adminFab) adminFab.style.display = 'flex';
            }
        } catch(e) {
            console.error("Auth check failed:", e);
        }

        // Fetch live data
        await loadJobs();
    } else {
        console.error("Supabase CDN blocked or failed to load. Operating in offline mode.");
        renderJobs(); // Will render the empty state so UI doesn't look broken
    }
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