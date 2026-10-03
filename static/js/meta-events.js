/* ─────────────────────────────────────────────────────────────────────────
   ECOMMDOTS · Meta Pixel CTA tracking
   Pure event delegation — one deferred script, zero DOM/CSS changes.
   Fully guarded: tracking can never throw or interfere with page flow.
   ───────────────────────────────────────────────────────────────────────── */
(function () {
  'use strict';
  if (typeof window.fbq !== 'function') { return; }

  var booked = false;

  function fire(method, name, params) {
    try { window.fbq(method, name, params || {}); } catch (err) { /* no-op */ }
  }

  function label(el) {
    try {
      var t = el.getAttribute('aria-label') || el.getAttribute('title') || el.textContent || '';
      t = String(t).replace(/\s+/g, ' ').trim().slice(0, 60);
      return t || el.getAttribute('href') || 'cta';
    } catch (err) { return 'cta'; }
  }

  /* 1 · REAL CALENDLY BOOKINGS — the popup iframe posts this on completion. */
  window.addEventListener('message', function (e) {
    try {
      if (booked || !e || !e.data || e.data.event !== 'calendly.event_scheduled') { return; }
      if (String(e.origin || '').indexOf('calendly.com') === -1) { return; }
      booked = true;
      fire('track', 'Schedule', { content_name: 'Calendly Meeting Booked' });
    } catch (err) { /* no-op */ }
  });

  /* 2 · CONTACT FORM SUBMISSIONS — capture phase, so it fires regardless of
         what other handlers do; browser validation still gates it. */
  document.addEventListener('submit', function (e) {
    try {
      var f = e.target;
      if (!f || !f.matches || !f.matches('#contactForm, #eliteContactForm')) { return; }
      fire('track', 'Lead', {
        content_name: f.id === 'eliteContactForm' ? 'Elite Contact Form' : 'Contact Form',
        content_category: window.location.pathname
      });
    } catch (err) { /* no-op */ }
  }, true);

  /* 3 · CTA CLICKS — exactly one event per interaction, classified by target. */
  document.addEventListener('click', function (e) {
    try {
      if (e.button !== 0) { return; }
      var el = e.target && e.target.closest
        ? e.target.closest('a, button, [role="button"], input[type="submit"]')
        : null;
      if (!el) { return; }

      /* Site UI, not CTAs: menu dropdown, blog category filters, load-more. */
      if (el.closest('.nav-drop-trigger, .cat-btn, .load-more-btn')) { return; }

      /* Submit buttons of the tracked forms already fired Lead above. */
      var form = el.closest('form');
      if (form && form.matches('#contactForm, #eliteContactForm')) { return; }

      var href = el.getAttribute('href') || '';

      if (el.id === 'mobileCalendlyBtn' || el.id === 'desktopCalendlyBtn' ||
          href.indexOf('calendly.com') !== -1) {
        fire('trackCustom', 'CTA_Click', { cta_name: 'Book Free Consultation', page: window.location.pathname });
      } else if (href.indexOf('wa.me') !== -1 || href.indexOf('whatsapp') !== -1) {
        fire('track', 'Contact', { content_name: 'WhatsApp', page: window.location.pathname });
      } else if (href.indexOf('tel:') === 0 || href.indexOf('mailto:') === 0) {
        fire('track', 'Contact', { content_name: href.indexOf('tel:') === 0 ? 'Phone Click' : 'Email Click', page: window.location.pathname });
      } else {
        fire('trackCustom', 'CTA_Click', { cta_name: label(el), page: window.location.pathname });
      }
    } catch (err) { /* no-op */ }
  });
})();
