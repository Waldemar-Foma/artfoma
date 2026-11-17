// js/pet.js
const FOODS = { apple: 25, berry: 18, worm: 30 };
const pick = (a) => a[Math.floor(Math.random() * a.length)];

const HUNGER_TICK = 3000;
const SLEEP_AFTER = 30000;
const HUNGER_SPEECH = 12000;
const isTouch = matchMedia('(pointer: coarse)').matches;

export function initPet() {
  const pet = document.getElementById('pet');
  const hg = document.getElementById('hg');
  const eyeDot = document.getElementById('eyeDot');
  const eyeClosed = document.getElementById('eyeClosed');
  const bubble = document.getElementById('bubble');
  const hungerBar = document.getElementById('hungerBar');
  const statTxt = document.getElementById('statTxt');
  const tray = document.getElementById('tray');
  
  if (!pet || !hg || !tray || !hungerBar || !statTxt) return;

  let hunger = 60;
  let asleep = false;
  let selected = null;
  let lastTouch = Date.now();
  let lastSay = 0;
  let sayTimer = 0;
  let hoverTimer = 0;
  let isDragging = false; // Флаг, чтобы не путать перетаскивание с кликом

  function say(text, ms = 2600) {
    bubble.textContent = text;
    bubble.classList.add('on');
    clearTimeout(sayTimer);
    sayTimer = setTimeout(() => bubble.classList.remove('on'), ms);
    lastSay = Date.now();
  }

  function paintHunger() {
    hungerBar.style.width = hunger + '%';
    statTxt.textContent = hunger >= 60 ? 'сыт' : hunger >= 30 ? 'немного голоден' : 'голоден';
  }

  function touch() {
    lastTouch = Date.now();
    if (asleep) wake();
  }

  function setSleep(on) {
    asleep = on;
    pet.classList.toggle('sleep', on);
    if (eyeDot) eyeDot.style.opacity = on ? '0' : '1';
    if (eyeClosed) eyeClosed.setAttribute('opacity', on ? '1' : '0');
    if (on) bubble.classList.remove('on');
  }

  function wake() {
    setSleep(false);
    say(pick(['Ой, доброе утро!', 'Я не спал!', 'Ааам… привет']), 2200);
  }

  function hearts(n) {
    for (let i = 0; i < n; i++) {
      const h = document.createElement('span');
      h.className = 'heart';
      h.innerHTML = '<svg class="ic" aria-hidden="true"><use href="#i-heart"/></svg>';
      h.style.left = 30 + Math.random() * 50 + '%';
      h.style.top = 20 + Math.random() * 20 + '%';
      pet.appendChild(h);
      setTimeout(() => h.remove(), 1000);
    }
  }

  function selectFood(type) {
    selected = type;
    tray.querySelectorAll('[data-food]').forEach((b) => {
      b.setAttribute('aria-pressed', String(b.dataset.food === type));
    });
    if (type) say('Теперь нажмите на ежика', 2200);
  }

  function flash() {
    pet.classList.add('on');
    clearTimeout(hoverTimer);
    hoverTimer = setTimeout(() => pet.classList.remove('on'), 1500);
  }

  function feed(type) {
    hunger = Math.min(100, hunger + (FOODS[type] || 0));
    paintHunger();
    touch();
    flash();
    pet.classList.remove('eat');
    void pet.offsetWidth;
    pet.classList.add('eat');
    setTimeout(() => pet.classList.remove('eat'), 1000);
    say(hunger >= 90 ? 'Я сыт и доволен!' : pick(['Ммм, вкусно!', 'Спасибо!', 'Ещё бы!']));
    hearts(3);
    selectFood(null);
  }

  function petIt() {
    touch();
    flash();
    pet.classList.remove('hop');
    void pet.offsetWidth;
    pet.classList.add('hop');
    setTimeout(() => pet.classList.remove('hop'), 650);
    hearts(2);
    say(pick(['Приятно!', 'Хи-хи', 'Ты добрый']), 1600);
  }

  pet.addEventListener('click', (e) => {
    // Если кликнули по кнопке еды, игнорируем
    if (e.target.closest('.tray')) return;
    // Если только что перетаскивали — не гладим
    if (isDragging) return;
    
    touch();
    if (selected) feed(selected);
    else petIt();
  });

  pet.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      touch();
      if (selected) feed(selected);
      else petIt();
    }
  });

  // Перетаскивание еды (только для мыши)
  if (!isTouch) {
    let drag = null;
    tray.querySelectorAll('[data-food]').forEach((btn) => {
      btn.addEventListener('pointerdown', (e) => {
        e.stopPropagation(); // Не даём клику уйти на ежика
        drag = { btn, type: btn.dataset.food, x: e.clientX, y: e.clientY, moved: false };
        btn.setPointerCapture(e.pointerId);
      });
      
      btn.addEventListener('pointermove', (e) => {
        if (!drag || drag.btn !== btn) return;
        e.stopPropagation();
        
        if (!drag.moved && Math.hypot(e.clientX - drag.x, e.clientY - drag.y) > 8) {
          drag.moved = true;
          isDragging = true;
          btn.classList.add('drag');
        }
        if (drag.moved) {
          btn.style.left = e.clientX - 26 + 'px';
          btn.style.top = e.clientY - 26 + 'px';
        }
      });
      
      btn.addEventListener('pointerup', (e) => {
        if (!drag || drag.btn !== btn) return;
        e.stopPropagation();
        
        const d = drag;
        drag = null;
        btn.classList.remove('drag');
        btn.style.left = '';
        btn.style.top = '';
        
        if (d.moved) {
          const r = hg.getBoundingClientRect();
          if (e.clientX > r.left && e.clientX < r.right && e.clientY > r.top && e.clientY < r.bottom) {
            feed(d.type);
          } else {
            say('Положите еду прямо на ежика', 1800);
          }
          setTimeout(() => { isDragging = false; }, 50);
        } else {
          selectFood(selected === d.type ? null : d.type);
        }
      });
    });
  } else {
    // Тап по еде на мобильных
    tray.querySelectorAll('[data-food]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation(); // Чтобы не сработал клик по ежику
        e.preventDefault();
        selectFood(selected === btn.dataset.food ? null : btn.dataset.food);
      });
    });
  }

  paintHunger();
  setInterval(() => {
    if (asleep) return;
    hunger = Math.max(0, hunger - 1);
    paintHunger();
    if (hunger < 30 && Date.now() - lastSay > HUNGER_SPEECH) {
      say(pick(['Я голодный…', 'Есть что-нибудь?', 'Покорми меня, пожалуйста']), 2800);
    } else if (Date.now() - lastSay > 15000 && Math.random() < 0.5) {
      say(pick(['Привет!', 'Что нового?', 'Как проект?', 'Хочу в Lab', 'Почеши меня за ухом']), 2200);
    }
  }, HUNGER_TICK);

  setInterval(() => {
    if (!asleep && Date.now() - lastTouch > SLEEP_AFTER) setSleep(true);
  }, 1000);

  // Слежение за курсором (только для мыши)
  if (!isTouch) {
    let mx = window.innerWidth / 2;
    let my = window.innerHeight / 2;
    let raf = 0;
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

    function lookAt() {
      if (asleep) return;
      const r = hg.getBoundingClientRect();
      if (!r.width) return;
      const k = r.width / 80;
      const ex = r.left + 50.5 * k;
      const ey = r.top + 42.25 * k;
      const a = Math.atan2(my - ey, mx - ex);
      const d = Math.min(1.6, Math.hypot(mx - ex, my - ey) / 120);
      eyeDot.style.transform = `translate(${(Math.cos(a) * d).toFixed(2)}px,${(Math.sin(a) * d).toFixed(2)}px)`;
    }

    if (!reduce) {
      window.addEventListener('pointermove', (e) => {
        // Если тянем еду — не двигаем глаз
        if (isDragging) return;
        mx = e.clientX;
        my = e.clientY;
        touch();
        if (!raf) {
          raf = requestAnimationFrame(() => {
            raf = 0;
            lookAt();
          });
        }
      });
    }
    lookAt();
  }

  const dock = document.getElementById('dock');
  const dockTg = document.getElementById('dockTg');
  if (dock && dockTg) {
    dockTg.addEventListener('click', (e) => {
      e.stopPropagation();
      const open = dock.classList.toggle('open');
      dockTg.setAttribute('aria-checked', String(open));
      dockTg.classList.remove('roll');
      void dockTg.offsetWidth;
      dockTg.classList.add('roll');
      if (open) say('Привет! Я тут.', 1800);
    });
  }
}