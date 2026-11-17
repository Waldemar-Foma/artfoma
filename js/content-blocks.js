// js/content-blocks.js
import { APPROACH, FAQ } from '../data/content.js';
import { STEPS } from '../data/services.js';

export function initContentBlocks() {
  // Подход (Главная)
  const appRoot = document.getElementById('approachRoot');
  if (appRoot) {
    appRoot.innerHTML = APPROACH.map(item => `
      <button data-tog="${item.id}" aria-expanded="false">
        <span class="small">${item.n}</span>
        <span class="h2">${item.title}</span>
        <span class="x" aria-hidden="true"><i></i><i></i></span>
      </button>
      <p class="panel" id="${item.id}" hidden>${item.text}</p>
    `).join('');
  }

  // FAQ (Главная)
  const faqRoot = document.getElementById('faqRoot');
  if (faqRoot) {
    faqRoot.innerHTML = FAQ.map(item => `
      <button data-tog="${item.id}" aria-expanded="false">
        ${item.q}
        <span class="x" aria-hidden="true"><i></i><i></i></span>
      </button>
      <p class="panel" id="${item.id}" hidden>${item.a}</p>
    `).join('');
  }

  // Услуги (Главная)
  const svcHome = document.getElementById('svcHomeRoot');
  if (svcHome) {
    const HOME_SRV = [
      { id: 'h1s', icon: 'i-ident', title: 'Айдентика', price: 'от 60 000 ₽', desc: 'Стратегия, знак, типографика, цвет и брендбук.' },
      { id: 'h2s', icon: 'i-web', title: 'Сайты', price: 'от 90 000 ₽', desc: 'Структура, UX/UI и дизайн страниц. Адаптив закладываем сразу.' },
      { id: 'h3s', icon: 'i-pack', title: 'Упаковка', price: 'от 40 000 ₽', desc: 'Дизайн упаковки, макеты и подготовка к печати.' }
    ];
    svcHome.innerHTML = HOME_SRV.map(s => `
      <button data-tog="${s.id}" aria-expanded="false">
        <svg class="ic lg" aria-hidden="true"><use href="#${s.icon}"/></svg>
        <span class="h2">${s.title}</span>
        <span class="pr">${s.price}</span>
        <span class="x" aria-hidden="true"><i></i><i></i></span>
      </button>
      <p class="panel" id="${s.id}" hidden>${s.desc}</p>
    `).join('');
  }

  // Услуги (Страница)
  const svcPage = document.getElementById('svcServicesRoot');
  if (svcPage) {
    const PAGE_SRV = [
      { id: 's1', icon: 'i-ident', title: 'Айдентика и логотипы', price: 'от 60 000 ₽', desc: 'Стратегия, знак, типографика, цвет, базовые носители и брендбук.' },
      { id: 's2', icon: 'i-web', title: 'Сайты и веб-дизайн', price: 'от 90 000 ₽', desc: 'Структура, UX/UI, дизайн страниц, адаптив и передача к вёрстке.' },
      { id: 's3', icon: 'i-pack', title: 'Упаковка', price: 'от 40 000 ₽', desc: 'Дизайн, макеты, подготовка к печати.' },
      { id: 's4', icon: 'i-social', title: 'Соцсети и контент', price: 'от 25 000 ₽', desc: 'Визуальная система, шаблоны и серии постов.' },
      { id: 's5', icon: 'i-motion', title: 'Презентации и моушн', price: 'от 20 000 ₽', desc: 'Презентации и короткие анимации для бренда.' }
    ];
    svcPage.innerHTML = PAGE_SRV.map(s => `
      <button data-tog="${s.id}" aria-expanded="false">
        <svg class="ic lg" aria-hidden="true"><use href="#${s.icon}"/></svg>
        <span class="h2">${s.title}</span>
        <span class="pr">${s.price}</span>
        <span class="x" aria-hidden="true"><i></i><i></i></span>
      </button>
      <p class="panel" id="${s.id}" hidden>${s.desc}</p>
    `).join('');
  }

  // Шаги (Страница услуг)
  const stepsRoot = document.getElementById('stepsRoot');
  if (stepsRoot) {
    stepsRoot.innerHTML = STEPS.map(s => `
      <div>
        <span class="n">${s.n}</span>
        <div class="h3">${s.title}</div>
        <p>${s.text}</p>
      </div>
    `).join('');
  }
}