const fine = matchMedia('(pointer: fine)').matches;
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

export function initWeight() {
  const WG = document.getElementById('wgt');
  if (!WG) return;
  const WORD = 'реагирует';
  
  WG.innerHTML = 'Текст <span class="it"></span>';
  const itSpan = WG.querySelector('.it');
  const spans = [];
  
  [...WORD].forEach(c => {
    const s = document.createElement('span');
    s.textContent = c;
    s.style.display = 'inline-block';
    s.style.fontWeight = '400';
    itSpan.appendChild(s);
    spans.push(s);
  });

  if (!fine || reduce) return;
  
  WG.addEventListener('pointermove', e => {
    for (const c of spans) {
      const r = c.getBoundingClientRect(); if (!r.width) continue;
      const d = Math.hypot(e.clientX - (r.left + r.width / 2), e.clientY - (r.top + r.height / 2));
      c.style.fontWeight = Math.round(400 + Math.max(0, 1 - d / 200) * 400);
    }
  });
  WG.addEventListener('pointerleave', () => spans.forEach(c => c.style.fontWeight = '400'));
}