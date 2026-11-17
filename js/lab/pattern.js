export function initPattern() {
    const PAT = document.getElementById('pat');
    if (!PAT) return;
    const PCOL = ['#F2F1EC', '#BDEBD8', '#F2B8D6', '#D9F26B', '#3B5BDB'];
    let pstate = Array(36).fill(0);
  
    function paintPat() {
      PAT.innerHTML = '';
      pstate.forEach((v, i) => {
        const b = document.createElement('button');
        b.style.background = PCOL[v]; b.setAttribute('aria-label', 'Клетка ' + (i + 1));
        b.addEventListener('click', () => {
          pstate[i] = (pstate[i] + 1) % PCOL.length;
          b.style.background = PCOL[pstate[i]];
        });
        PAT.appendChild(b);
      });
    }
  
    paintPat();
    document.getElementById('patShuffle').addEventListener('click', () => {
      pstate = pstate.map(() => Math.floor(Math.random() * PCOL.length));
      paintPat();
    });
  }