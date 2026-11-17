// js/lab/snake.js
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const isTouch = matchMedia('(pointer: coarse)').matches;

export function initSnake() {
  const sc = document.getElementById('snake');
  if (!sc) return;
  const sx = sc.getContext('2d');
  const hud = document.getElementById('hud');
  const sMsg = document.getElementById('sMsg');
  const sBtn = document.getElementById('sBtn');
  if (!sx) return;

  const G = { c: 20, r: 14 };
  let snake = [], dir = { x: 1, y: 0 }, nextDir = { x: 1, y: 0 }, food = { x: 0, y: 0 }, score = 0, alive = true, timer = 0, CW = 1, CH = 1;

  function sizeSnake() {
    const r = sc.getBoundingClientRect(), d = devicePixelRatio || 1;
    sc.width = Math.round(r.width * d); sc.height = Math.round(r.height * d);
    sx.setTransform(d, 0, 0, d, 0, 0);
    CW = r.width / G.c; CH = r.height / G.r; drawSnake();
  }

  function placeFood() {
    do { food = { x: Math.floor(Math.random() * G.c), y: Math.floor(Math.random() * G.r) }; }
    while (snake.some(p => p.x === food.x && p.y === food.y));
  }

  function resetSnake() {
    snake = [{ x: 6, y: 7 }, { x: 5, y: 7 }, { x: 4, y: 7 }];
    dir = { x: 1, y: 0 }; nextDir = { x: 1, y: 0 }; score = 0; alive = true; placeFood(); updHud(); drawSnake();
  }

  function updHud() { if (hud) hud.textContent = 'Счёт: ' + score; }

  function stepSnake() {
    if (!alive) return;
    dir = nextDir;
    const h = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };
    if (h.x < 0 || h.y < 0 || h.x >= G.c || h.y >= G.r || snake.some(p => p.x === h.x && p.y === h.y)) {
      alive = false; stopSnake(); drawSnake();
      if (sMsg) sMsg.textContent = 'Игра окончена. Нажмите «Заново», чтобы сыграть ещё.';
      if (sBtn) sBtn.textContent = 'Старт'; return;
    }
    snake.unshift(h);
    if (h.x === food.x && h.y === food.y) { score++; placeFood(); updHud(); } else snake.pop();
    drawSnake();
  }

  function startSnake() {
    if (!alive) resetSnake();
    if (timer) return;
    timer = setInterval(stepSnake, reduce ? 260 : 120);
    if (sBtn) sBtn.textContent = 'Пауза';
    if (sMsg) sMsg.textContent = 'Поехали. Пробел — пауза.';
  }

  function stopSnake() { clearInterval(timer); timer = 0; if (sBtn) sBtn.textContent = 'Старт'; }

  function toggleSnake() {
    if (timer) { stopSnake(); if (sMsg) sMsg.textContent = 'Пауза. Пробел — продолжить.'; }
    else startSnake();
  }

  function turn(x, y) {
    if (x === -dir.x && y === -dir.y) return;
    nextDir = { x, y };
    if (alive && !timer) startSnake();
  }

  function drawSnake() {
    const w = sc.clientWidth || sc.width, h = sc.clientHeight || sc.height;
    sx.clearRect(0, 0, w, h);
    
    // Шахматный фон
    sx.fillStyle = 'rgba(0,0,0,.08)';
    for (let x = 0; x < G.c; x++) for (let y = 0; y < G.r; y++) if ((x + y) % 2 === 0) sx.fillRect(x * CW, y * CH, CW, CH);
    
    // Еда (розовая)
    sx.fillStyle = '#F2B8D6';
    sx.beginPath(); sx.arc((food.x + .5) * CW, (food.y + .5) * CH, Math.min(CW, CH) * .36, 0, Math.PI * 2); sx.fill();
    
    // Змея (голова лайм, тело белое)
    snake.forEach((p, i) => {
      sx.fillStyle = i === 0 ? '#D9F26B' : '#F2F1EC';
      const pad = Math.min(CW, CH) * .08;
      sx.beginPath();
      if (sx.roundRect) sx.roundRect(p.x * CW + pad, p.y * CH + pad, CW - pad * 2, CH - pad * 2, Math.min(CW, CH) * .25);
      else sx.rect(p.x * CW + pad, p.y * CH + pad, CW - pad * 2, CH - pad * 2);
      sx.fill();
    });
  }

  // --- СВАЙПЫ (МОБИЛЬНЫЕ) ---
  let touchStart = null;

  sc.addEventListener('touchstart', (e) => {
    if (e.touches.length > 0) {
      touchStart = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
  }, { passive: true });

  sc.addEventListener('touchmove', (e) => {
    if (!touchStart) return;
    if (e.cancelable) e.preventDefault(); // Блокируем скролл страницы

    if (e.touches.length > 0) {
      const x = e.touches[0].clientX;
      const y = e.touches[0].clientY;
      const dx = x - touchStart.x;
      const dy = y - touchStart.y;

      if (Math.hypot(dx, dy) > 30) {
        if (Math.abs(dx) > Math.abs(dy)) turn(dx > 0 ? 1 : -1, 0);
        else turn(0, dy > 0 ? 1 : -1);
        touchStart = { x, y }; // Сброс для следующего свайпа
      }
    }
  }, { passive: false });

  sc.addEventListener('touchend', () => { touchStart = null; });

  // --- МЫШЬ ---
  let mouseStart = null;
  sc.addEventListener('pointerdown', (e) => {
    if (e.pointerType === 'touch') return;
    mouseStart = { x: e.clientX, y: e.clientY };
  });
  sc.addEventListener('pointerup', (e) => {
    if (e.pointerType === 'touch' || !mouseStart) return;
    const dx = e.clientX - mouseStart.x;
    const dy = e.clientY - mouseStart.y;
    mouseStart = null;
    if (Math.hypot(dx, dy) < 24) return;
    if (Math.abs(dx) > Math.abs(dy)) turn(dx > 0 ? 1 : -1, 0);
    else turn(0, dy > 0 ? 1 : -1);
  });

  if (sBtn) sBtn.addEventListener('click', () => { if (!alive) resetSnake(); toggleSnake(); });
  const sReset = document.getElementById('sReset');
  if (sReset) sReset.addEventListener('click', () => { stopSnake(); resetSnake(); if (sBtn) sBtn.textContent = 'Старт'; if (sMsg) sMsg.textContent = 'Новая игра. Нажмите «Старт».'; });

  // Клавиатура (стрелки / WASD / пробел)
  const KEYDIR = { ArrowUp: [0, -1], w: [0, -1], W: [0, -1], ArrowDown: [0, 1], s: [0, 1], S: [0, 1], ArrowLeft: [-1, 0], a: [-1, 0], A: [-1, 0], ArrowRight: [1, 0], d: [1, 0], D: [1, 0] };
  document.addEventListener('keydown', (e) => {
    const t = e.target;
    if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
    if (KEYDIR[e.key]) { e.preventDefault(); turn(...KEYDIR[e.key]); }
    else if (e.key === ' ') { e.preventDefault(); toggleSnake(); }
  });

  window.addEventListener('resize', sizeSnake);
  sizeSnake(); resetSnake();
}