// js/main.js
import { initAccordions, initReveal, initMagnetic, initCursorRing, initHeaderTone, initCounters, initPassportsTilt, initDragScroll, initHeroTitle } from './ui.js';
import { initMenu } from './menu.js';
import { initPet } from './pet.js';
import { initContentBlocks } from './content-blocks.js';
import { initWorks } from './works.js';
import { initTeam } from './team.js';
import { initCase } from './case.js';
import { initCalculator } from './calculator.js';
import { initContacts } from './contacts.js';
import { initPreview } from './preview.js';
import { initLab } from './lab/index.js';

document.documentElement.classList.add('js');

function boot() {
  // 1. Глобальные штуки (работают на всех страницах)
  initMenu();
  initPet();
  initAccordions();
  initReveal();
  initMagnetic();
  initCursorRing();
  initHeaderTone();
  initCounters();
  initDragScroll();
  
  // 2. Определяем текущую страницу по URL
  const path = window.location.pathname;
  const isHome = path === '/' || path.includes('index.html') || path.endsWith('/');

  // 3. Запускаем специфичные скрипты
  if (isHome) {
    initHeroTitle();
    initPreview();
    initContentBlocks();
    initWorks(true); // true = только лента проектов
    initTeam(true);  // true = только 3 паспорта
  } 
  else if (path.includes('works.html')) {
    initWorks(false); // false = сетка с фильтрами
  }
  else if (path.includes('services.html')) {
    initContentBlocks();
    initCalculator();
  }
  else if (path.includes('team.html')) {
    initTeam(false);
    initPassportsTilt();
  }
  else if (path.includes('case.html')) {
    initCase();
  }
  else if (path.includes('contacts.html')) {
    initContacts();
  }
  else if (path.includes('lab.html')) {
    initLab();
  }

  highlightNav();
}

function highlightNav() {
  const path = window.location.pathname;
  const links = document.querySelectorAll('.dnav a, .bnav a');
  links.forEach(a => {
    const href = a.getAttribute('href');
    if (path.includes(href) || (path.endsWith('/') && href.includes('index.html')) || (path.endsWith('/') && href === '../index.html')) {
      a.setAttribute('aria-current', 'page');
    }
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot, { once: true });
} else {
  boot();
}