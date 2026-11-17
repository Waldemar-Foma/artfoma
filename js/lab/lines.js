export function initLines() {
    const LN = document.getElementById('lines');
    if (!LN) return;
    const lx = LN.getContext('2d');
    let lmx = -1, lmy = -1, lraf = 0;
  
    function sizeLines() {
      const r = LN.getBoundingClientRect();
      if (r.width < 1) return;
      const d = devicePixelRatio || 1;
      LN.width = r.width * d; LN.height = r.height * d;
      lx.setTransform(d, 0, 0, d, 0, 0);
      drawLines();
    }
  
    function drawLines() {
      const w = LN.clientWidth, h = LN.clientHeight;
      if (w < 1) return;
      lx.clearRect(0, 0, w, h);
      
      const cols = 22, rows = 14, cw = w / cols, ch = h / rows;
      const tx = lmx < 0 ? w / 2 : lmx, ty = lmy < 0 ? h / 2 : lmy;
      
      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const cx0 = (i + .5) * cw, cy0 = (j + .5) * ch;
          const a = Math.atan2(ty - cy0, tx - cx0);
          const dist = Math.hypot(tx - cx0, ty - cy0);
          const L = Math.min(cw, ch) * .8;
          const near = Math.max(0, 1 - dist / 260);
          
          lx.strokeStyle = near > .4 ? '#D9F26B' : 'rgba(242,241,236,.85)';
          lx.lineWidth = 1 + near * 2.5;
          lx.lineCap = 'round';
          lx.beginPath();
          lx.moveTo(cx0 - Math.cos(a) * L / 2, cy0 - Math.sin(a) * L / 2);
          lx.lineTo(cx0 + Math.cos(a) * L / 2, cy0 + Math.sin(a) * L / 2);
          lx.stroke();
        }
      }
    }
  
    LN.addEventListener('pointermove', e => {
      const r = LN.getBoundingClientRect();
      lmx = e.clientX - r.left; lmy = e.clientY - r.top;
      if (!lraf) lraf = requestAnimationFrame(() => { lraf = 0; drawLines(); });
    });
    
    LN.addEventListener('pointerleave', () => { lmx = -1; lmy = -1; drawLines(); });
  
    window.addEventListener('resize', sizeLines);
    sizeLines();
  }