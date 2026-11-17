// js/preview.js
import { P, KEYS } from '../data/projects.js';

export function initPreview() {
  const idx = document.getElementById('idx');
  const pv = document.getElementById('pv');
  if (!idx || !pv) return;

  // Рендерим список кнопок (используем button, чтобы не срабатывал a:hover)
  idx.innerHTML = KEYS.map(k => `
    <button data-pv="${k}" type="button" aria-controls="pv">
      <span>${P[k].n}</span>
      <small>${P[k].y}</small>
    </button>
  `).join('');

  let currentKey = null;

  function setPreview(k) {
    if (currentKey === k) return;
    currentKey = k;
    
    const p = P[k];
    if (!p) return;

    // Меняем CSS-переменные для смены цвета панели
    pv.style.setProperty('--pbg', p.bg);
    pv.style.setProperty('--pfg', p.fg);
    pv.style.setProperty('--pacc', p.ac);

    // Обновляем текст
    const pn = document.getElementById('pvN'); 
    if (pn) {
      pn.className = 'pn ' + p.f; 
      pn.textContent = p.n;
    }
    
    const pvK = document.getElementById('pvK');
    if (pvK) pvK.textContent = p.k;
    
    const pvY = document.getElementById('pvY');
    if (pvY) pvY.textContent = p.y;
    
    const pvC = document.getElementById('pvC');
    if (pvC) pvC.textContent = p.lang;

    // Обновляем ссылку на кейс внутри панели
    const btn = document.getElementById('pvB');
    if (btn) {
      btn.href = `pages/case.html?project=${k}`;
      btn.dataset.project = k; // запасной вариант
    }

    // Подсветка активной кнопки в списке
    idx.querySelectorAll('button').forEach(b => {
      if (b.dataset.pv === k) b.setAttribute('aria-current', 'true');
      else b.removeAttribute('aria-current');
    });
  }

  // Наведение
  idx.addEventListener('pointerover', (e) => {
    const btn = e.target.closest('button[data-pv]');
    if (btn) setPreview(btn.dataset.pv);
  });

  // Фокус с клавиатуры
  idx.addEventListener('focusin', (e) => {
    const btn = e.target.closest('button[data-pv]');
    if (btn) setPreview(btn.dataset.pv);
  });

  // Клик по названию проекта
  idx.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-pv]');
    if (btn) {
      window.location.href = `pages/case.html?project=${btn.dataset.pv}`;
    }
  });

  // Инициализация первого проекта
  setPreview(KEYS[0]);
}