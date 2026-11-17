const MAP = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

export function esc(str) {
  return String(str).replace(/[&<>"']/g, (c) => MAP[c]);
}

// Безопасная сборка атрибута style из CSS-переменных
export function cssVars(obj) {
  return Object.entries(obj)
    .map(([k, v]) => `--${k}:${esc(v)}`)
    .join(';');
}
