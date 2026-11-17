// js/team.js
import { PASS, TEAM_CATS, FIELDS, mark } from '../data/team.js';

function passHTML(p) {
  const num = String(p.n).padStart(2, '0');
  // Собираем поля для обратной стороны
  const fields = [
    { label: 'Роль', value: p.role },
    { label: 'Направления', value: p.skills },
    { label: 'Интересы', value: p.interests },
    { label: 'Почерк', value: p.style },
  ].map(f => `<span class="kv"><span>${f.label}</span><span>${f.value}</span></span>`).join('');

  return `<div class="pp-card" data-dir="${p.dir}">
    <button class="pp-btn" data-flip aria-pressed="false" aria-label="Перевернуть паспорт ${p.name}">
      <span class="pp-in">
        <span class="face front">
          <span class="pp-top"><span>Паспорт ${num}</span><span>${p.dirName}</span></span>
          ${mark(p.n + 10)}
          <span class="nm">${p.name}</span>
          <span class="rl">${p.role}</span>
          <span class="hint">нажмите, чтобы открыть</span>
        </span>
        <span class="face back">
          <span class="pp-top"><span>Паспорт ${num}</span><span>обратная сторона</span></span>
          ${fields}
        </span>
      </span>
    </button>
  </div>`;
}

export function initTeam(isHome = false) {
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-flip]');
    if (!btn) return;
    const card = btn.closest('.pp-card');
    if (!card) return;
    const on = !card.classList.contains('flipped');
    card.classList.toggle('flipped', on);
    btn.setAttribute('aria-pressed', String(on));
  });

  if (isHome) {
    const homeGrid = document.getElementById('passHome');
    // На главной показываем оба паспорта
    if (homeGrid) homeGrid.innerHTML = PASS.map(passHTML).join('');
    return;
  }

  const grid = document.getElementById('passGrid');
  const filt = document.getElementById('teamFilt');
  if (!grid || !filt) return;

  filt.innerHTML = TEAM_CATS.map(([id, label]) => `<button data-tcat="${id}" aria-pressed="${id === 'all'}">${label}</button>`).join('');

  function renderTeam(cat = 'all') {
    const list = PASS.filter(p => cat === 'all' || p.dir === cat);
    grid.innerHTML = list.length ? list.map(passHTML).join('') : '<p class="small" style="grid-column:1/-1;padding:24px 0">В этом направлении пока никого.</p>';
    filt.querySelectorAll('button[data-tcat]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.tcat === cat)));
  }

  filt.addEventListener('click', e => {
    const btn = e.target.closest('[data-tcat]');
    if (btn) renderTeam(btn.dataset.tcat);
  });

  renderTeam('all');
}