export const FIELDS = ['Роль', 'Направления', 'Навыки', 'Интересы', 'Почерк', 'Проекты'];

export const PASS = [
  { 
    n: 1, 
    dir: 'ident', 
    dirName: 'Влад',
    name: 'Влад',
    role: 'Основатель студии, арт-директор',
    skills: 'Стратегия, айдентика, типографика',
    interests: 'Современное искусство, архитектура',
    style: 'Строгий, но живой',
  },
  { 
    n: 2, 
    dir: 'web', 
    dirName: 'Дашка',
    name: 'Дашка',
    role: 'Ведущий дизайнер',
    skills: 'UI/UX, веб-дизайн, моушн',
    interests: 'Фотография, путешествия',
    style: 'Чистый, функциональный',
  }
];

export const TEAM_CATS = [
  ['all', 'Все'],
  ['ident', 'Основатель'],
  ['web', 'Дизайнер'],
];

// Генератор уникального SVG-знака для паспорта
export function mark(seed) {
  let s = seed * 9301 + 49297;
  const rnd = () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
  const shapes = [
    '<circle cx="50" cy="50" r="34" fill="#1F4D3E"/>',
    '<rect x="18" y="18" width="64" height="64" rx="32" fill="#3B5BDB"/>',
    '<path d="M50 14 L86 80 L14 80 Z" fill="#F2B8D6"/>',
    '<circle cx="36" cy="50" r="22" fill="#D9F26B"/><circle cx="64" cy="50" r="22" fill="#1F4D3E"/>'
  ];
  const a = shapes[Math.floor(rnd() * shapes.length)];
  const b = `<circle cx="${Math.round(rnd() * 60 + 20)}" cy="${Math.round(rnd() * 60 + 20)}" r="${Math.round(rnd() * 8 + 6)}" fill="#F2F1EC"/>`;
  return `<svg viewBox="0 0 100 100" aria-hidden="true">${a}${b}</svg>`;
}