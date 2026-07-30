/* ============================================================
   HOMEMAKERS SUPER INFRA — main.js
   Mobile nav · scroll reveal · lift indicator · enquiry forms
   (inline WhatsApp/email form, modal + Apps Script backend,
   honeypot, mailto fallback, visit counter)
   ============================================================ */
(() => {
  'use strict';

  /* ---------- config ---------- */
  const APPS_SCRIPT_URL = 'PASTE-YOUR-APPS-SCRIPT-WEB-APP-URL-HERE';
  const LEAD_EMAIL      = 'thakuramit3572@gmail.com';
  const WHATSAPP_NUMBER = '917021362405';
  const PROJECT_LABEL   = 'HomeMakers Aradhana, Chembur';

  const $ = (id) => document.getElementById(id);

  /* ---------- mobile nav ---------- */
  const tgl = $('navToggle');
  const nav = $('topNav');
  tgl.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    tgl.setAttribute('aria-expanded', String(open));
  });
  nav.querySelectorAll('a').forEach((a) =>
    a.addEventListener('click', () => {
      nav.classList.remove('open');
      tgl.setAttribute('aria-expanded', 'false');
    })
  );

  /* ---------- scroll reveal ---------- */
  const revealObs = new IntersectionObserver(
    (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add('in'); }),
    { threshold: 0.12 }
  );
  document.querySelectorAll('.reveal').forEach((el) => revealObs.observe(el));

  /* ---------- lift indicator (section spy) ---------- */
  const stops = Array.from(document.querySelectorAll('#lift a'));
  const cab = $('cab');
  const secIds = ['contact', 'team', 'history', 'projects', 'plans', 'mangala', 'about', 'top'];

  function setCab(id) {
    const a = stops.find((s) => s.dataset.sec === id);
    if (!a) return;
    stops.forEach((s) => {
      s.classList.toggle('on', s === a);
      if (s === a) s.setAttribute('aria-current', 'true');
      else s.removeAttribute('aria-current');
    });
    cab.style.top = (a.offsetTop + a.offsetHeight / 2 - 5) + 'px';
  }

  const secObs = new IntersectionObserver(
    (entries) => entries.forEach((e) => { if (e.isIntersecting) setCab(e.target.id); }),
    { rootMargin: '-40% 0px -55% 0px' }
  );
  secIds.forEach((id) => { const el = $(id); if (el) secObs.observe(el); });
  setCab('top');

  /* ---------- shared helpers ---------- */
  const PHONE_RE = /^[+0-9 ()-]{8,17}$/;
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function enquiryText(d) {
    let text = 'Pre-launch enquiry - ' + PROJECT_LABEL + '\nName: ' + d.name + '\nPhone: ' + d.phone;
    if (d.email) text += '\nEmail: ' + d.email;
    if (d.msg)   text += '\nMessage: ' + d.msg;
    return text;
  }
  function openWhatsApp(d) {
    window.open('https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(enquiryText(d)), '_blank', 'noopener');
  }

  /* ---------- inline contact form ---------- */
  const eqStatusEl = $('eqStatus');

  function eqDetails() {
    const d = {
      name:  $('eqName').value.trim(),
      phone: $('eqPhone').value.trim(),
      email: $('eqEmail').value.trim(),
      msg:   $('eqMsg').value.trim()
    };
    eqStatusEl.className = 'eq-status';
    if (!d.name) { eqStatusEl.textContent = 'Please enter your name.'; eqStatusEl.classList.add('err'); return null; }
    if (!PHONE_RE.test(d.phone)) { eqStatusEl.textContent = 'Please enter a valid phone number.'; eqStatusEl.classList.add('err'); return null; }
    return d;
  }

  $('eqWhatsApp').addEventListener('click', () => {
    const d = eqDetails(); if (!d) return;
    openWhatsApp(d);
    eqStatusEl.textContent = 'Opening WhatsApp with your enquiry…';
    eqStatusEl.classList.add('ok');
  });

  $('eqEmailBtn').addEventListener('click', () => {
    const d = eqDetails(); if (!d) return;
    window.location.href = 'mailto:homemakers.mum@gmail.com?subject=' +
      encodeURIComponent('Pre-launch Enquiry - HomeMakers Aradhana') +
      '&body=' + encodeURIComponent(enquiryText(d));
    eqStatusEl.textContent = 'Opening your email app with the enquiry…';
    eqStatusEl.classList.add('ok');
  });

  /* ---------- enquiry modal ---------- */
  const eqModal   = $('eqModal');
  const mStatus   = $('mStatus');
  const mFormWrap = $('eqModalForm');
  const mDoneWrap = $('eqModalDone');
  const mSubmitBt = $('mSubmit');
  let lastFocused = null;

  function openModal() {
    lastFocused = document.activeElement;
    mFormWrap.style.display = '';
    mDoneWrap.style.display = 'none';
    mStatus.textContent = '';
    mStatus.className = 'eq-status';
    eqModal.classList.add('open');
    document.body.style.overflow = 'hidden';
    setTimeout(() => $('mName').focus(), 60);
  }
  function closeModal() {
    eqModal.classList.remove('open');
    document.body.style.overflow = '';
    if (lastFocused) lastFocused.focus();
  }

  $('enquireFab').addEventListener('click', openModal);
  $('eqModalClose').addEventListener('click', closeModal);
  $('eqModalDoneClose').addEventListener('click', closeModal);
  eqModal.addEventListener('click', (e) => { if (e.target === eqModal) closeModal(); });

  document.addEventListener('keydown', (e) => {
    if (!eqModal.classList.contains('open')) return;

    if (e.key === 'Escape') { closeModal(); return; }

    /* focus trap — keep Tab cycling inside the dialog */
    if (e.key === 'Tab') {
      const focusables = Array.from(eqModal.querySelectorAll(
        'button, input, textarea, a[href]'
      )).filter((el) => el.offsetParent !== null && el.tabIndex !== -1);
      if (!focusables.length) return;
      const first = focusables[0];
      const last  = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  function modalDetails() {
    const d = {
      name:  $('mName').value.trim(),
      phone: $('mPhone').value.trim(),
      email: $('mEmail').value.trim(),
      msg:   $('mMsg').value.trim()
    };
    mStatus.className = 'eq-status';
    if (!d.name) { mStatus.textContent = 'Please enter your name.'; mStatus.classList.add('err'); return null; }
    if (!PHONE_RE.test(d.phone)) { mStatus.textContent = 'Please enter a valid phone number.'; mStatus.classList.add('err'); return null; }
    if (d.email && !EMAIL_RE.test(d.email)) { mStatus.textContent = 'Please enter a valid email or leave it blank.'; mStatus.classList.add('err'); return null; }
    return d;
  }

  mSubmitBt.addEventListener('click', async () => {
    const d = modalDetails(); if (!d) return;

    if (APPS_SCRIPT_URL.indexOf('script.google.com') === -1) {
      mStatus.textContent = 'Form backend not configured yet — please use WhatsApp below.';
      mStatus.classList.add('err');
      return;
    }

    mSubmitBt.disabled = true;
    mSubmitBt.textContent = 'Sending…';
    mStatus.textContent = '';
    mStatus.className = 'eq-status';

    try {
      const res = await fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        body: JSON.stringify({
          name: d.name,
          phone: d.phone,
          email: d.email,
          msg: d.msg,
          page: window.location.href,
          company: $('mCompany').value /* honeypot */
        })
      });
      let out = {};
      try { out = await res.json(); } catch (e) { /* non-JSON response */ }

      if (res.ok && out.success === true) {
        mFormWrap.style.display = 'none';
        mDoneWrap.style.display = 'block';
        ['mName', 'mPhone', 'mEmail', 'mMsg'].forEach((id) => { $(id).value = ''; });
        $('eqModalDoneClose').focus();
      } else {
        const why = (out && out.message) ? String(out.message) : ('HTTP ' + res.status);
        mStatus.innerHTML = 'Not sent (' + why.replace(/[<>]/g, '') +
          '). Tap "WhatsApp instead" below, or <a href="#" id="mMailtoFallback">send by email app</a>.';
        mStatus.classList.add('err');
        wireMailtoFallback(d);
      }
    } catch (err) {
      mStatus.innerHTML = 'Could not reach the form service — tap "WhatsApp instead" below, or ' +
        '<a href="#" id="mMailtoFallback">send by email app</a>.';
      mStatus.classList.add('err');
      wireMailtoFallback(d);
    } finally {
      mSubmitBt.disabled = false;
      mSubmitBt.textContent = 'Submit enquiry';
    }
  });

  function wireMailtoFallback(d) {
    const a = $('mMailtoFallback');
    if (!a) return;
    a.addEventListener('click', (ev) => {
      ev.preventDefault();
      window.location.href = 'mailto:' + LEAD_EMAIL +
        '?subject=' + encodeURIComponent('NEW LEAD - HomeMakers Aradhana Pre-Launch Enquiry') +
        '&body=' + encodeURIComponent(enquiryText(d));
    });
  }

  $('mWhatsApp').addEventListener('click', () => {
    const d = modalDetails(); if (!d) return;
    openWhatsApp(d);
    mStatus.textContent = 'Opening WhatsApp with your enquiry…';
    mStatus.classList.add('ok');
  });

  /* ---------- visit counter ---------- */
  (function initVisitCounter() {
    if (APPS_SCRIPT_URL.indexOf('script.google.com') === -1) return; /* backend not wired yet */
    const action = sessionStorage.getItem('hmVisited') ? 'count' : 'visit';
    fetch(APPS_SCRIPT_URL + '?action=' + action)
      .then((r) => r.json())
      .then((data) => {
        if (!data || data.success !== true || typeof data.count !== 'number') return;
        sessionStorage.setItem('hmVisited', '1');
        $('visitCount').textContent = String(data.count).padStart(5, '0');
        $('visitCounter').style.display = 'flex';
      })
      .catch(() => { /* counter is non-critical */ });
  })();
})();
