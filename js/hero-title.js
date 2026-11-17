// js/hero-title.js
// Hero-заголовок: посимвольное появление + изменение веса при наведении.
// Данные — HERO_TITLE из data/content.js.

import { HERO_TITLE } from '../data/content.js';

export function initHeroTitle() {
  const hx = document.getElementById('hx');
  if (!hx) return;

  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(pointer: fine)').matches;

  // Собираем символы
  const chars = [];
  let idx = 0;

  HERO_TITLE.forEach((seg) => {
    const words = seg.text.split(' ');
    words.forEach((word, wi) => {
      const w = document.createElement('span');
      w.className = 'w';
      [...word].forEach((c) => {
        const el = document.createElement('span');
        el.className = 'ch' + (seg.italic ? ' it' : '');
        el.textContent = c;
        el.style.setProperty('--i', idx++);
        w.appendChild(el);
        chars.push(el);
      });
      hx.appendChild(w);
      if (wi < words.length - 1) hx.appendChild(document.createTextNode(' '));
    });
  });

  // Hover-вес только на точных указателях и без reduce-motion
  if (!fine || reduce) return;

  let raf = 0;
  let lastX = 0;
  let lastY = 0;

  function update() {
    raf = 0;
    for (const c of chars) {
      const r = c.getBoundingClientRect();
      if (!r.width) continue;
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const d = Math.hypot(lastX - cx, lastY - cy);
      c.style.fontWeight = String(Math.round(400 + Math.max(0, 1 - d / 240) * 400));
    }
  }

  hx.addEventListener('pointermove', (e) => {
    lastX = e.clientX;
    lastY = e.clientY;
    if (!raf) raf = requestAnimationFrame(update);
  });

  hx.addEventListener('pointerleave', () => {
    chars.forEach((c) => {
      c.style.fontWeight = '';
    });
  });
}