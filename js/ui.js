// js/ui.js
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const fine = matchMedia('(pointer: fine)').matches;
const isTouch = matchMedia('(pointer: coarse)').matches;

export function initAccordions() {
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-tog]');
    if (!btn) return;
    const id = btn.dataset.tog;
    const panel = document.getElementById(id);
    if (!panel) return;
    const open = btn.getAttribute('aria-expanded') === 'true';
    btn.setAttribute('aria-expanded', String(!open));
    panel.hidden = open;
    btn.setAttribute('aria-controls', id);
  });
}

export function initReveal() {
  if (reduce) { document.querySelectorAll('[data-r]').forEach((el) => el.classList.add('in')); return; }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
  }, { rootMargin: '0px 0px -10% 0px', threshold: 0.1 });
  document.querySelectorAll('[data-r]').forEach((el) => io.observe(el));
}

export function initMagnetic() {
  if (isTouch || !fine || reduce) return;
  document.querySelectorAll('.mag').forEach((b) => {
    b.addEventListener('pointermove', (e) => {
      const r = b.getBoundingClientRect();
      const x = (e.clientX - r.left - r.width / 2) * 0.18;
      const y = (e.clientY - r.top - r.height / 2) * 0.25;
      b.style.transform = `translate(${x.toFixed(1)}px,${y.toFixed(1)}px)`;
    });
    b.addEventListener('pointerleave', () => { b.style.transform = ''; });
  });
}

export function initCursorRing() {
  const ring = document.getElementById('ring');
  if (!ring || isTouch || !fine || reduce) return;
  let rx = 0, ry = 0, tx = 0, ty = 0, raf = 0;
  window.addEventListener('pointermove', (e) => { tx = e.clientX; ty = e.clientY; if (!raf) raf = requestAnimationFrame(loop); });
  function loop() {
    rx += (tx - rx) * 0.2; ry += (ty - ry) * 0.2;
    ring.style.transform = `translate(${rx}px,${ry}px) translate(-50%,-50%)`;
    raf = 0;
    if (Math.abs(tx - rx) > 0.5 || Math.abs(ty - ry) > 0.5) raf = requestAnimationFrame(loop);
  }
  document.addEventListener('pointerover', (e) => { ring.classList.toggle('big', !!e.target.closest('a,button,.card,.idx button,input,textarea')); });
}

export function initHeaderTone() {
  const hdr = document.getElementById('hdr');
  if (!hdr) return;
  const parse = (c) => { if (!c || c === 'rgba(0, 0, 0, 0)' || c === 'transparent') return null; const m = c.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/); return m ? [+m[1], +m[2], +m[3]] : null; };
  const isDark = ([r, g, b]) => 0.299 * r + 0.587 * g + 0.114 * b < 128;
  function setTone() {
    if (document.body.classList.contains('menu-open')) { hdr.style.color = ''; return; }
    const el = document.elementFromPoint(window.innerWidth / 2, 40);
    if (!el) return;
    let node = el, bg = null;
    while (node && node !== document.documentElement) { bg = parse(getComputedStyle(node).backgroundColor); if (bg) break; node = node.parentElement; }
    hdr.style.color = (!bg) ? '' : (isDark(bg) ? '#F2F1EC' : '');
  }
  let raf = 0;
  window.addEventListener('scroll', () => { if (!raf) raf = requestAnimationFrame(() => { raf = 0; setTone(); }); }, { passive: true });
  window.addEventListener('resize', setTone, { passive: true });
  setTone();
}

export function initCounters() {
  if (reduce) return;
  const els = document.querySelectorAll('[data-count]');
  if (!els.length) return;
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      const el = en.target, target = Number(el.dataset.count) || 0, dur = 1200, t0 = performance.now();
      (function step(t) {
        const p = Math.min(1, (t - t0) / dur), eased = 1 - Math.pow(1 - p, 3);
        el.textContent = String(Math.round(target * eased));
        if (p < 1) requestAnimationFrame(step); else el.textContent = String(target);
      })(t0);
      io.unobserve(el);
    });
  }, { threshold: 0.5 });
  els.forEach((el) => io.observe(el));
}

export function initPassportsTilt() {
  if (isTouch || !fine || reduce) return;
  document.addEventListener('pointermove', (e) => {
    const pp = e.target.closest && e.target.closest('.pp-card');
    if (!pp || pp.classList.contains('flipped')) return;
    const r = pp.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
    pp.style.transform = `perspective(800px) rotateY(${(x * 10).toFixed(1)}deg) rotateX(${(-y * 10).toFixed(1)}deg)`;
  });
  document.addEventListener('pointerout', (e) => { const pp = e.target.closest && e.target.closest('.pp-card'); if (pp) pp.style.transform = ''; });
}

export function initDragScroll(root = document) {
  if (isTouch || !fine || reduce) return;
  root.querySelectorAll('.track').forEach((track) => {
    let isDown = false, startX = 0, startScroll = 0, moved = false;
    let velocity = 0, lastX = 0, lastTime = 0, rafId = 0;

    track.addEventListener('pointerdown', (e) => {
      const card = e.target.closest('.card');
      if (card) card.setAttribute('draggable', 'false');

      isDown = true; moved = false;
      startX = e.clientX; startScroll = track.scrollLeft;
      lastX = e.clientX; lastTime = performance.now(); velocity = 0;
      
      cancelAnimationFrame(rafId);
      track.classList.add('drag');
      track.setPointerCapture(e.pointerId);
    });

    track.addEventListener('pointermove', (e) => {
      if (!isDown) return;
      const dx = e.clientX - startX;
      if (Math.abs(dx) > 5) moved = true;

      const now = performance.now();
      const dt = now - lastTime;
      if (dt > 0) velocity = (e.clientX - lastX) / dt;
      lastX = e.clientX; lastTime = now;

      track.scrollLeft = startScroll - dx;
    });

    const endDrag = () => {
      isDown = false;
      track.classList.remove('drag');
      if (Math.abs(velocity) > 0.1) {
        let v = velocity * 15;
        const inertia = () => {
          track.scrollLeft -= v;
          v *= 0.95;
          if (Math.abs(v) > 0.5) rafId = requestAnimationFrame(inertia);
        };
        rafId = requestAnimationFrame(inertia);
      }
    };

    track.addEventListener('pointerup', (e) => { if (moved) { e.preventDefault(); e.stopPropagation(); } endDrag(); });
    track.addEventListener('pointercancel', endDrag);
    track.addEventListener('pointerleave', () => { if (isDown) endDrag(); });
    track.addEventListener('click', (e) => { if (moved) { e.preventDefault(); e.stopPropagation(); } }, true);
  });
}

export function initHeroTitle() {
  const hx = document.getElementById('hx');
  if (!hx) return;
  const SEG = [{ t: 'Айдентики, сайты и упаковка, ', it: 0 }, { t: 'которые не спутать.', it: 1 }];
  const chars = []; let idx = 0;
  
  SEG.forEach(seg => {
    seg.t.split(' ').forEach((word, wi, arr) => {
      const w = document.createElement('span'); w.className = 'w';
      [...word].forEach(c => {
        const el = document.createElement('span'); el.className = 'ch' + (seg.it ? ' it' : '');
        el.textContent = c; el.style.setProperty('--i', idx++); w.appendChild(el); chars.push(el);
      });
      hx.appendChild(w);
      if (wi < arr.length - 1) hx.appendChild(document.createTextNode(' '));
    });
  });

  if (isTouch || !fine || reduce) return;
  hx.addEventListener('pointermove', e => {
    for (const c of chars) {
      const r = c.getBoundingClientRect(); if (!r.width) continue;
      const d = Math.hypot(e.clientX - (r.left + r.width / 2), e.clientY - (r.top + r.height / 2));
      c.style.fontWeight = Math.round(400 + Math.max(0, 1 - d / 240) * 400);
    }
  });
  hx.addEventListener('pointerleave', () => chars.forEach(c => c.style.fontWeight = ''));
}