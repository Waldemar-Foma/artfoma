// js/calculator.js
// Калькулятор: чекбоксы услуг × сложность → вилка «от X до Y ₽».
// Данные — из data/services.js. Состояние только в DOM.

import { SERVICES_CALC, COMPLEXITY } from '../data/services.js';
import { esc } from './escape.js';

const nf = new Intl.NumberFormat('ru-RU');

/** Форматирование рублей с неразрывным пробелом. */
function money(n) {
  return nf.format(Math.round(n)) + ' ₽';
}

/** Рендер списка услуг и select сложности. */
function renderControls() {
  const opts = document.getElementById('opts');
  if (opts && !opts.dataset.ready) {
    opts.innerHTML = SERVICES_CALC.map(
      (s) =>
        `<label class="opt">
          <input type="checkbox" data-min="${s.min}" data-max="${s.max}" data-id="${esc(s.id)}">
          ${esc(s.label)}
        </label>`
    ).join('');
    opts.dataset.ready = '1';
  }

  const cx = document.getElementById('cx');
  if (cx && !cx.dataset.ready) {
    cx.innerHTML = COMPLEXITY.map(
      (c) => `<option value="${c.value}"${c.value === 1.4 ? ' selected' : ''}>${esc(c.label)}</option>`
    ).join('');
    cx.dataset.ready = '1';
  }
}

/** Пересчёт и вывод в #sum. */
function recalc() {
  const sumEl = document.getElementById('sum');
  if (!sumEl) return;

  const opts = document.getElementById('opts');
  const cx = document.getElementById('cx');
  if (!opts || !cx) return;

  const checked = [...opts.querySelectorAll('input[type="checkbox"]:checked')];
  const k = Number(cx.value) || 1;

  if (!checked.length) {
    sumEl.textContent = 'Выберите услуги';
    return;
  }

  let min = 0;
  let max = 0;
  for (const el of checked) {
    min += Number(el.dataset.min) || 0;
    max += Number(el.dataset.max) || 0;
  }

  sumEl.textContent = `${money(min * k)} — ${money(max * k)}`;
}

export function initCalculator() {
  const opts = document.getElementById('opts');
  const cx = document.getElementById('cx');
  if (!opts || !cx) return;

  renderControls();

  // Делегированные слушатели: любые изменения внутри блока
  opts.addEventListener('change', recalc);
  cx.addEventListener('change', recalc);

  recalc();
}