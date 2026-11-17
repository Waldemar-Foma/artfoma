// js/menu.js
const body = document.body;

export function initMenu() {
  const burger = document.getElementById('burger');
  const menu = document.getElementById('menu');
  const note = document.getElementById('note');
  if (!burger || !menu) return;

  const isOpen = () => body.classList.contains('menu-open');

  function setMenu(open) {
    if (open) {
      const br = burger.getBoundingClientRect();
      menu.style.setProperty('--bx', br.left + br.width / 2 + 'px');
      menu.style.setProperty('--by', br.top + br.height / 2 + 'px');
    }
    body.classList.toggle('menu-open', open);
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
    
    if (open) {
      setTimeout(() => {
        const first = menu.querySelector('a, button');
        first?.focus();
      }, 450);
    } else {
      note?.classList.remove('on');
    }
  }

  burger.addEventListener('click', () => setMenu(!isOpen()));

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isOpen()) {
      setMenu(false);
      burger.focus();
    }
  });

  menu.querySelectorAll('.ml a').forEach((a) => {
    const show = () => {
      const r = a.getBoundingClientRect();
      note.textContent = a.dataset.n || '';
      note.style.left = r.right + 24 + 'px';
      note.style.top = r.top + r.height / 2 + 'px';
      note.classList.add('on');
    };
    const hide = () => note.classList.remove('on');
    a.addEventListener('pointerenter', show);
    a.addEventListener('focus', show);
    a.addEventListener('pointerleave', hide);
    a.addEventListener('blur', hide);
  });
}