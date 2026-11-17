// js/works.js
import { P, KEYS, CATS } from '../data/projects.js';

function cardHTML(key) {
  const p = P[key];
  if (!p) return '';
  return `<a class="card ${p.f}" href="pages/case.html?project=${key}" draggable="false" style="--pbg:${p.bg};--pfg:${p.fg};--pacc:${p.ac}">
    <span class="ck"><span>${p.k}</span><span>${p.y}</span></span>
    <span class="cn">${p.n}</span>
    <span class="cc">${p.lang}</span>
    <span class="cb" aria-hidden="true"><svg class="ic"><use href="#i-arr"/></svg></span>
  </a>`;
}

export function initWorks(isHome = false) {
  if (isHome) {
    const track = document.getElementById('trackHome');
    if (track) track.innerHTML = KEYS.map(cardHTML).join('');
    return;
  }

  const grid = document.getElementById('gridWorks');
  const filt = document.getElementById('filters');
  if (!grid || !filt) return;

  filt.innerHTML = CATS.map(([id, label]) => `<button data-cat="${id}" aria-pressed="${id === 'all'}">${label}</button>`).join('');

  function renderGrid(cat = 'all') {
    const list = KEYS.filter(k => cat === 'all' || P[k].cat.includes(cat));
    grid.innerHTML = list.length ? list.map(cardHTML).join('') : '<p class="small" style="grid-column:1/-1;padding:24px 0">Нет проектов.</p>';
    filt.querySelectorAll('button[data-cat]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.cat === cat)));
  }

  filt.addEventListener('click', e => {
    const btn = e.target.closest('[data-cat]');
    if (btn) renderGrid(btn.dataset.cat);
  });
  
  renderGrid('all');
}