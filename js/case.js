// js/case.js
import { P, KEYS, nextKey } from '../data/projects.js';

export function initCase() {
  const params = new URLSearchParams(window.location.search);
  const key = params.get('project') || KEYS[0];
  const p = P[key] || P[KEYS[0]];
  
  if (!p) return;

  const hero = document.getElementById('caseHero');
  if (hero) {
    hero.style.setProperty('--pbg', p.bg);
    hero.style.setProperty('--pfg', p.fg);
    hero.style.setProperty('--pacc', p.ac);
  }

  const set = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  };
  
  set('cTitle', p.n);
  set('cClient', p.cli);
  set('cSrv', p.srv);
  set('cYear', p.y);
  set('cTime', p.time);
  document.title = `${p.n} — ART.Foma`;

  const nextBtn = document.getElementById('cNext');
  if (nextBtn) {
    const nk = nextKey(key);
    nextBtn.textContent = P[nk].n;
    nextBtn.href = `case.html?project=${nk}`;
  }

  const cmp = document.getElementById('cmp');
  const after = document.getElementById('after');
  const line = document.getElementById('line');
  
  if (cmp && after && line) {
    const updateSplit = (val) => {
      after.style.clipPath = `inset(0 ${100 - val}% 0 0)`;
      line.style.left = val + '%';
    };
    
    cmp.addEventListener('input', () => updateSplit(Number(cmp.value)));
    updateSplit(Number(cmp.value));
  }
}