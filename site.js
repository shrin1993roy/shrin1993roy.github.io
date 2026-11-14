/* Shared scripts for the case study pages (aera.html, circuvo.html) */

const navLinks = document.querySelectorAll('.section-nav a');
const sections = document.querySelectorAll('.section[id]');

const obs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      navLinks.forEach(l => {
        l.classList.toggle('active', l.getAttribute('href') === '#' + e.target.id);
      });
      // Phone: slide the nav so the open section's link is always in view
      const act = document.querySelector('.section-nav a.active');
      const nav = document.querySelector('.section-nav');
      if (act && nav.scrollWidth > nav.clientWidth) {
        const left = act.offsetLeft - nav.offsetLeft - parseFloat(getComputedStyle(nav).paddingLeft);
        nav.scrollTo({ left: Math.max(0, left), behavior: 'smooth' });
      }
    }
  });
}, { rootMargin: '-20% 0px -70% 0px' });

sections.forEach(s => obs.observe(s));

// Keep the sticky section nav tucked under the top bar, and stop anchor jumps from hiding headings behind it
const topBar = document.querySelector('.top-bar');
const secNav = document.querySelector('.section-nav');
function setStickyOffsets() {
  const bar = getComputedStyle(topBar).display === 'none' ? 0 : topBar.offsetHeight;
  document.documentElement.style.setProperty('--bar-h', bar + 'px');
  document.documentElement.style.scrollPaddingTop = (bar + secNav.offsetHeight) + 'px';
}
window.addEventListener('resize', setStickyOffsets);
window.addEventListener('load', setStickyOffsets);
// Fade on the right of the section nav only while there is more to scroll to
function navFade() { secNav.classList.toggle('more-right', secNav.scrollLeft + secNav.clientWidth < secNav.scrollWidth - 4); }
secNav.addEventListener('scroll', navFade, { passive: true });
window.addEventListener('resize', navFade);
window.addEventListener('load', navFade);
navFade();
setStickyOffsets();

// Each section can be closed with its own toggle; jumping to a section from the nav reopens it
document.querySelectorAll('.sec-toggle').forEach(btn => {
  btn.addEventListener('click', () => {
    const open = btn.getAttribute('aria-expanded') === 'true';
    btn.setAttribute('aria-expanded', String(!open));
    btn.closest('.section').classList.toggle('is-closed', open);
  });
});
// Subheadings with their own + and − (Survey, Interview...)
document.querySelectorAll('.sub-toggle').forEach(btn => {
  btn.addEventListener('click', () => {
    const open = btn.getAttribute('aria-expanded') === 'true';
    btn.setAttribute('aria-expanded', String(!open));
    btn.closest('.sub-block').classList.toggle('is-closed', open);
  });
});
// Any link that jumps within the page (section nav, or a link like Outcome's "Shopify store") reopens a closed section first
document.querySelectorAll('a[href^="#"]').forEach(l => l.addEventListener('click', () => {
  const href = l.getAttribute('href'); if (href.length < 2) return;
  const target = document.querySelector(href); if (!target) return;
  const sec = target.closest('.section');
  if (sec && sec.classList.contains('is-closed')) {
    sec.classList.remove('is-closed');
    sec.querySelector('.sec-toggle').setAttribute('aria-expanded', 'true');
  }
}));
// Store password: one click copies it
document.querySelectorAll('.copy-pw').forEach(btn => {
  btn.addEventListener('click', () => {
    const done = () => { btn.textContent = 'Copied'; btn.classList.add('done'); setTimeout(() => { btn.textContent = 'Copy'; btn.classList.remove('done'); }, 1800); };
    const fallback = () => { const r = document.createRange(); r.selectNodeContents(btn.parentElement.querySelector('.pw')); const sel = getSelection(); sel.removeAllRanges(); sel.addRange(r); try { document.execCommand('copy'); } catch (e) {} done(); };
    if (navigator.clipboard && window.isSecureContext) { navigator.clipboard.writeText(btn.dataset.copy).then(done, fallback); } else { fallback(); }
  });
});
// Competitor names: hover or tap to show the takeaway
(function () {
  const note = document.querySelector('.brand-note');
  if (!note) return;
  const hint = note.dataset.hint;
  if (window.matchMedia('(hover: none)').matches) { note.textContent = 'Tap a brand to see what I took from it.'; }
  const reset = () => { note.textContent = window.matchMedia('(hover: none)').matches ? 'Tap a brand to see what I took from it.' : hint; };
  document.querySelectorAll('.bname').forEach(b => {
    const show = () => { document.querySelectorAll('.bname').forEach(x => x.classList.toggle('on', x === b)); note.textContent = b.dataset.note; };
    b.addEventListener('mouseenter', show);
    b.addEventListener('focus', show);
    b.addEventListener('click', show);
    b.addEventListener('mouseleave', () => { b.classList.remove('on'); reset(); });
  });
})();

// Screen overlay: click or tap a screen in Design to open it large with its write up
(function () {
  const SCREENS = window.SCREENS || [];
  const lb = document.getElementById('lb'); if (!lb || !SCREENS.length) return;
  const pic = document.getElementById('lb-pic'), scroller = document.getElementById('lb-scroll');
  const title = document.getElementById('lb-title'), text = document.getElementById('lb-text'), pri = document.getElementById('lb-pri'), priT = document.getElementById('lb-pri-t');
  const count = document.getElementById('lb-count'), prev = document.getElementById('lb-prev'), next = document.getElementById('lb-next'), close = document.getElementById('lb-close');
  const names = document.querySelectorAll('.screen-names .sn');
  // A screen image that isn't there yet shows as a grey box instead of a broken image
  pic.addEventListener('error', () => pic.parentElement.classList.add('is-missing'));
  pic.addEventListener('load', () => pic.parentElement.classList.remove('is-missing'));
  // Optional live video over part of a screenshot (Circuvo's homepage hero). Nothing loads until that screen is opened.
  const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const vbox = document.createElement('div'); vbox.className = 'lb-vid'; vbox.hidden = true;
  vbox.innerHTML = '<video muted loop playsinline preload="none" aria-hidden="true"></video><img class="lb-vid-top" alt=""><button type="button" class="vid-toggle lb-vid-btn">Pause</button>';
  pic.parentElement.appendChild(vbox);
  const vid = vbox.querySelector('video'), vtop = vbox.querySelector('.lb-vid-top'), vbtn = vbox.querySelector('.lb-vid-btn');
  let vidPaused = calm;
  const vset = () => { const on = !vid.paused; vbtn.textContent = on ? 'Pause' : 'Play'; vbtn.setAttribute('aria-label', on ? 'Pause video' : 'Play video'); };
  vid.addEventListener('play', vset); vid.addEventListener('pause', vset);
  vbtn.addEventListener('click', () => { if (vid.paused) { vidPaused = false; vid.play().catch(() => {}); } else { vidPaused = true; vid.pause(); } });
  function videoFor(d) {
    if (!d.video) { vbox.hidden = true; if (!vid.paused) vid.pause(); return; }
    vbox.style.top = d.video.top; vbox.style.height = d.video.height;
    if (vid.getAttribute('src') !== d.video.src) { vid.setAttribute('src', d.video.src); vtop.src = d.video.top_image || ''; }
    vbox.hidden = false; vset();
    if (!vidPaused) vid.play().catch(() => {});
  }
  let cur = 0, opener = null;
  if (window.matchMedia('(hover: none)').matches) { const h = document.querySelector('.screen-cta span'); if (h) h.textContent = '+ Tap a screen to view it in detail'; }
  function show(i) {
    cur = i; const d = SCREENS[i];
    pic.src = d.img; pic.alt = (lb.dataset.alt ? lb.dataset.alt + ' ' : '') + d.name + ' screen';
    title.textContent = d.name;
    text.textContent = d.text || 'Write up to come.';
    text.style.color = d.text ? '' : 'var(--grey)';
    pri.hidden = !d.pri; priT.textContent = d.pri;
    count.textContent = String(i + 1).padStart(2, '0') + ' / ' + String(SCREENS.length).padStart(2, '0');
    prev.disabled = i === 0; next.disabled = i === SCREENS.length - 1;
    prev.textContent = i === 0 ? '← Previous' : '← ' + SCREENS[i - 1].name;
    next.textContent = i === SCREENS.length - 1 ? 'Next →' : SCREENS[i + 1].name + ' →';
    scroller.scrollTop = 0; lb.scrollTop = 0;
    videoFor(d);
  }
  function open(i, from) { opener = from || null; show(i); lb.hidden = false; document.body.classList.add('lb-open'); close.focus(); }
  function shut() { if (!vid.paused) vid.pause(); lb.hidden = true; document.body.classList.remove('lb-open'); if (opener) opener.focus(); }
  document.querySelectorAll('.hit, .screen-names .sn').forEach(b => b.addEventListener('click', () => open(+b.dataset.i, b)));
  document.querySelectorAll('.hit').forEach(b => {
    b.addEventListener('mouseenter', () => names[+b.dataset.i].classList.add('lit'));
    b.addEventListener('mouseleave', () => names[+b.dataset.i].classList.remove('lit'));
  });
  close.addEventListener('click', shut);
  prev.addEventListener('click', () => { if (cur > 0) show(cur - 1); });
  next.addEventListener('click', () => { if (cur < SCREENS.length - 1) show(cur + 1); });
  document.addEventListener('keydown', e => {
    if (lb.hidden) return;
    if (e.key === 'Escape') shut();
    else if (e.key === 'ArrowRight' && cur < SCREENS.length - 1) show(cur + 1);
    else if (e.key === 'ArrowLeft' && cur > 0) show(cur - 1);
    else if (e.key === 'Tab') {
      const f = [...lb.querySelectorAll('button:not([disabled])')]; const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });
})();

// Flow viewer: Next (inside the box) or a flow's name switches the image
document.querySelectorAll('.flows').forEach(box => {
  const slides = [...box.querySelectorAll('.flow-slide')], picks = [...box.querySelectorAll('.flow-pick')], next = box.querySelector('.flow-next');
  if (!slides.length) return;
  let cur = 0;
  function show(i) {
    cur = i;
    slides.forEach((s, k) => s.classList.toggle('is-on', k === i));
    picks.forEach((p, k) => { p.classList.toggle('on', k === i); p.setAttribute('aria-pressed', String(k === i)); });
    if (next) next.textContent = 'Next: ' + picks[(i + 1) % picks.length].textContent + ' \u2192';
  }
  picks.forEach((p, k) => p.addEventListener('click', () => show(k)));
  if (next) next.addEventListener('click', () => show((cur + 1) % slides.length));
  show(0);
});

// Large board viewer: the button carries the large image in data-large
(function () {
  const open = document.querySelector('.board-open'); if (!open) return;
  const bz = document.getElementById('bz'), img = document.getElementById('bz-img'), sc = document.getElementById('bz-scroll');
  const hint = document.getElementById('bz-hint'), close = document.getElementById('bz-close');
  const setHint = () => { hint.textContent = bz.classList.contains('zoomed') ? 'Drag to move around, click to zoom out' : 'Click the board to zoom in'; };
  // When zoomed in, press and drag (mouse or pen) to move around; touch screens keep their own swipe scrolling.
  // A drag never counts as a click, so letting go doesn't zoom out.
  let drag = null, dragged = false;
  img.draggable = false;
  img.addEventListener('dragstart', e => e.preventDefault());
  sc.addEventListener('pointerdown', e => {
    if (!bz.classList.contains('zoomed') || e.pointerType === 'touch' || e.button !== 0) return;
    drag = { x: e.clientX, y: e.clientY, left: sc.scrollLeft, top: sc.scrollTop }; dragged = false;
  });
  window.addEventListener('pointermove', e => {
    if (!drag) return;
    const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
    if (!dragged && Math.abs(dx) + Math.abs(dy) > 4) { dragged = true; bz.classList.add('dragging'); }
    if (dragged) { sc.scrollLeft = drag.left - dx; sc.scrollTop = drag.top - dy; e.preventDefault(); }
  });
  window.addEventListener('pointerup', () => { drag = null; bz.classList.remove('dragging'); });
  function show() { if (!img.src) img.src = open.dataset.large; bz.hidden = false; bz.classList.add('open'); bz.classList.remove('zoomed'); img.style.width = ''; setHint(); document.body.style.overflow = 'hidden'; close.focus(); }
  function hide() { bz.classList.remove('open', 'zoomed'); img.style.width = ''; bz.hidden = true; document.body.style.overflow = ''; open.focus(); }
  open.addEventListener('click', show);
  close.addEventListener('click', hide);
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && bz.classList.contains('open')) hide(); });
  img.addEventListener('click', e => {
    if (dragged) { dragged = false; return; }
    const r = img.getBoundingClientRect(), fx = (e.clientX - r.left) / r.width, fy = (e.clientY - r.top) / r.height;
    bz.classList.toggle('zoomed'); setHint();
    // Zoom to the image's real pixels (never stretched), at most 3 times the screen width
    img.style.width = bz.classList.contains('zoomed') ? (img.naturalWidth ? Math.min(img.naturalWidth / (window.devicePixelRatio || 1), sc.clientWidth * 3) : sc.clientWidth * 2) + 'px' : '';
    if (bz.classList.contains('zoomed')) { sc.scrollLeft = fx * img.offsetWidth - sc.clientWidth / 2; sc.scrollTop = fy * img.offsetHeight - sc.clientHeight / 2; }
  });
})();

// Videos: each plays muted on a loop with one small Pause / Play button (any number per page: every .hero-vid with a video and a .vid-toggle)
(function () {
  const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.querySelectorAll('.hero-vid').forEach(box => {
    const v = box.querySelector('video'), b = box.querySelector('.vid-toggle'); if (!v || !b) return;
    let userPaused = calm; // people who ask for less motion press Play themselves
    const set = () => { const on = !v.paused; b.textContent = on ? 'Pause' : 'Play'; b.setAttribute('aria-label', on ? 'Pause video' : 'Play video'); };
    b.addEventListener('click', () => { if (v.paused) { userPaused = false; v.play(); } else { userPaused = true; v.pause(); } });
    v.addEventListener('play', set); v.addEventListener('pause', set); set();
    // Load and play only when the video is on screen, pause when it scrolls away
    new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) { if (!userPaused) v.play().catch(() => {}); }
      else if (!v.paused) v.pause();
    }), { threshold: 0.25 }).observe(v);
  });
})();
