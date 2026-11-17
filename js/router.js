// js/router.js
// Роутер: hash-based навигация между .view-секциями.
// - pushState при клике (back/forward работают)
// - hashchange → рендер (прямые ссылки)
// - фокус на <main> для a11y
// - aria-current на навигации
// - клики по [data-go] и по [data-case] (без data-go) → открыть кейс

const VIEWS = ['home', 'works', 'case', 'services', 'studio', 'team', 'lab', 'contacts'];
const FALLBACK = 'home';

let currentView = FALLBACK;
const listeners = new Set();

/** Подписка на смену view. Возвращает функцию отписки. */
export function onRoute(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

/** Текущее view (для проверок). */
export function getView() {
  return currentView;
}

/** Программный переход. Не пушит дубликат. */
export function go(view, { replace = false, silent = false } = {}) {
  const next = VIEWS.includes(view) ? view : FALLBACK;
  if (next === currentView && !replace) return;

  currentView = next;
  const hash = '#' + next;

  if (!silent) {
    if (replace) history.replaceState(null, '', hash);
    else history.pushState(null, '', hash);
  }

  render();
}

function render() {
  // 1. Показ нужной секции
  document.querySelectorAll('.view').forEach((s) => {
    s.classList.toggle('on', s.id === 'v-' + currentView);
  });

  // 2. aria-current на всех навигациях
  document
    .querySelectorAll('.dnav button[data-go], .bnav button[data-go], .menu button[data-go]')
    .forEach((b) => {
      if (b.dataset.go === currentView) b.setAttribute('aria-current', 'page');
      else b.removeAttribute('aria-current');
    });

  // 3. Скролл наверх + фокус на main (a11y)
  window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' });
  const main = document.getElementById('main');
  if (main) {
    main.setAttribute('tabindex', '-1');
    main.focus({ preventScroll: true });
  }

  // 4. Подписчики
  listeners.forEach((fn) => {
    try {
      fn(currentView);
    } catch (err) {
      console.error('[router] listener error', err);
    }
  });
}

/** Инициализация: читает hash и вешает слушатели. */
export function initRouter() {
  // Отключаем автоскролл браузера — мы управляем сами
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

  const fromHash = location.hash.replace('#', '');
  currentView = VIEWS.includes(fromHash) ? fromHash : FALLBACK;
  render();

  // Глобальный делегированный клик
  document.addEventListener('click', (e) => {
    // 1) Явный [data-go] — навигация
    const navBtn = e.target.closest('[data-go]');
    if (navBtn) {
      e.preventDefault();
      // data-go="case" с data-case="pair" → запоминаем pending
      if (navBtn.dataset.go === 'case' && navBtn.dataset.case) {
        sessionStorage.setItem('case:pending', navBtn.dataset.case);
      }
      go(navBtn.dataset.go);
      return;
    }

    // 2) [data-case] без [data-go] — карточки проектов и #pvB → открыть кейс
    const caseBtn = e.target.closest('[data-case]');
    if (caseBtn && caseBtn.dataset.case) {
      e.preventDefault();
      sessionStorage.setItem('case:pending', caseBtn.dataset.case);
      go('case');
    }
  });

  // Back/forward
  window.addEventListener('popstate', () => {
    const fromHash = location.hash.replace('#', '');
    currentView = VIEWS.includes(fromHash) ? fromHash : FALLBACK;
    render();
  });

  // Прямая смена hash (руками в адресной строке)
  window.addEventListener('hashchange', () => {
    const fromHash = location.hash.replace('#', '');
    if (VIEWS.includes(fromHash) && fromHash !== currentView) {
      currentView = fromHash;
      render();
    }
  });
}