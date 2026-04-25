// ---------- Sticky nav: scrolled state + dark-section awareness ----------
(() => {
  const nav = document.getElementById('nav');
  if (!nav) return;

  const darkSections = Array.from(document.querySelectorAll('.dark'));

  const update = () => {
    nav.classList.toggle('is-scrolled', window.scrollY > 24);

    // Probe a point just below the nav. If it lands inside a .dark section, go dark.
    const probeY = nav.getBoundingClientRect().bottom - 1;
    const onDark = darkSections.some((el) => {
      const r = el.getBoundingClientRect();
      return r.top <= probeY && r.bottom >= probeY;
    });
    nav.classList.toggle('nav--on-dark', onDark);
  };

  update();
  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
})();

// ---------- Slow reveal on scroll ----------
(() => {
  const els = document.querySelectorAll('.reveal');
  if (!els.length) return;

  // Stagger items inside the same section/list for a more editorial cadence
  els.forEach((el) => {
    const parent = el.parentElement;
    if (!parent) return;
    const siblings = Array.from(parent.querySelectorAll(':scope > .reveal'));
    const i = siblings.indexOf(el);
    if (i > -1) el.style.setProperty('--delay', `${i * 90}ms`);
  });

  if (!('IntersectionObserver' in window)) {
    els.forEach((el) => el.classList.add('is-in'));
    return;
  }

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
  );

  els.forEach((el) => io.observe(el));
})();

// ---------- Contact form submit ----------
(() => {
  // Paste your webhook URL here (e.g. n8n, Zapier, Make, your own endpoint).
  const WEBHOOK_URL = 'https://main-n8n-server.onrender.com/webhook/1b71cfb0-bce9-4f29-bc05-19dac99d01ee';

  const form = document.getElementById('contact-form');
  const thanks = document.getElementById('form-thanks');
  if (!form || !thanks) return;

  const submitBtn = form.querySelector('button[type="submit"]');
  const originalLabel = submitBtn ? submitBtn.textContent : '';

  // Inline error element (created lazily)
  let errorEl = null;
  const showError = (msg) => {
    if (!errorEl) {
      errorEl = document.createElement('p');
      errorEl.className = 'form__error';
      form.querySelector('.form__actions').appendChild(errorEl);
    }
    errorEl.textContent = msg;
  };
  const clearError = () => { if (errorEl) errorEl.textContent = ''; };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const data = new FormData(form);
    // Use URLSearchParams (application/x-www-form-urlencoded) so the request
    // qualifies as a CORS "simple request" and the browser skips preflight.
    const body = new URLSearchParams();
    body.set('name', (data.get('name') || '').toString().trim());
    body.set('business-type', (data.get('business') || '').toString().trim());
    body.set('email', (data.get('email') || '').toString().trim());
    body.set('need-help-with', (data.get('message') || '').toString().trim());

    clearError();
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending…';
    }

    try {
      // Fire-and-forget. We don't need to read the response, so use no-cors
      // mode — n8n still receives the POST regardless of its CORS headers.
      // The response will be opaque; only true network failures throw here.
      await fetch(WEBHOOK_URL, {
        method: 'POST',
        mode: 'no-cors',
        body,
      });

      if (submitBtn) submitBtn.textContent = 'Sent!';
      // Brief beat so the user sees the success label, then swap to thanks.
      setTimeout(() => {
        form.setAttribute('hidden', '');
        thanks.removeAttribute('hidden');
        thanks.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 600);
    } catch (err) {
      console.error('Form submit failed:', err);
      showError("Something went wrong. Try again, or email us directly.");
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = originalLabel;
      }
    }
  });
})();

// ---------- Hero load fade-in ----------
window.addEventListener('load', () => {
  document.querySelectorAll('.hero .reveal').forEach((el, i) => {
    setTimeout(() => el.classList.add('is-in'), 120 + i * 140);
  });
});
