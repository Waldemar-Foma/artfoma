export function initPoster() {
    const PC = document.getElementById('poster');
    if (!PC) return;
    const pc = PC.getContext('2d');
  
    function posterDraw() {
      const r = PC.getBoundingClientRect(); if (!r.width) return;
      const d = devicePixelRatio || 1;
      PC.width = r.width * d; PC.height = r.height * d;
      pc.setTransform(d, 0, 0, d, 0, 0);
      
      const W = r.width, H = r.height;
      const pal = ['#3B5BDB', '#BDEBD8', '#F2B8D6', '#D9F26B', '#F2F1EC', '#1F4D3E'];
      const bg = pal[Math.floor(Math.random() * pal.length)];
      const cols = pal.filter(c => c !== bg);
      
      pc.fillStyle = bg; pc.fillRect(0, 0, W, H);
      
      for (let i = 0; i < 9; i++) {
        const x = Math.random() * W, y = Math.random() * H;
        const sz = Math.min(W, H) * (.15 + Math.random() * .4);
        const k = Math.floor(Math.random() * 3);
        pc.fillStyle = cols[Math.floor(Math.random() * cols.length)];
        pc.beginPath();
        if (k === 0) pc.arc(x, y, sz / 2, 0, Math.PI * 2);
        else if (k === 1) pc.rect(x - sz / 2, y - sz / 2, sz, sz);
        else pc.arc(x, y, sz / 2, 0, Math.PI);
        pc.fill();
      }
      
      pc.fillStyle = (bg === '#F2F1EC' || bg === '#D9F26B' || bg === '#BDEBD8' || bg === '#F2B8D6') ? '#1F4D3E' : '#F2F1EC';
      pc.font = '600 ' + Math.round(H * .16) + 'px Inter Tight, sans-serif';
      pc.fillText('ART.Foma', W * .06, H * .86);
    }
  
    PC.addEventListener('click', posterDraw);
    document.getElementById('postGen').addEventListener('click', posterDraw);
    window.addEventListener('resize', posterDraw);
    requestAnimationFrame(posterDraw);
  }