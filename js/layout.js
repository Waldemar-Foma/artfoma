export async function injectLayout() {
    const paths = [
      { id: 'header-root', url: '/includes/header.html' },
      { id: 'menu-root',   url: '/includes/menu.html' },
      { id: 'footer-root', url: '/includes/footer.html' },
    ];
  
    for (const p of paths) {
      const el = document.getElementById(p.id);
      if (!el) continue;
      try {
        const res = await fetch(p.url);
        if (!res.ok) throw new Error('Network response was not ok');
        el.innerHTML = await res.text();
      } catch (err) {
        console.error(`Failed to load ${p.url}`, err);
      }
    }
  }