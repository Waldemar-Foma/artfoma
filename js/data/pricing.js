/* Цены и сроки. Меняй только здесь. Формат ложится на CSV (tools/csv-to-pricing.html). */
window.ART_DATA = window.ART_DATA || {};
window.ART_DATA.pricing = {
  currency: "₽",
  spread: 0.25,
  urgency: [
    { id: "normal", name: "Обычные сроки", priceMult: 1,   daysMult: 1   },
    { id: "fast",   name: "Быстро",         priceMult: 1.3, daysMult: 0.7 },
    { id: "asap",   name: "Горит",          priceMult: 1.6, daysMult: 0.5 }
  ],
  services: [
    {
      id: "logo", name: "Логотип", desc: "Знак и базовые правила",
      basePrice: 40000, baseDays: 10,
      options: [
        { id: "guide", name: "Мини-гайдлайн", type: "toggle", price: 15000, days: 3 },
        { id: "variants", name: "Количество концепций", type: "counter", min: 1, max: 5, step: 1, price: 8000, days: 2 },
        { id: "format", name: "Форматы", type: "select", choices: [
          { id: "base", name: "Базовые", price: 0, days: 0 },
          { id: "full", name: "Полный пакет", price: 10000, days: 2 }
        ]}
      ]
    },
    {
      id: "identity", name: "Айдентика", desc: "Лого, цвета, шрифты, носители",
      basePrice: 120000, baseDays: 24,
      options: [
        { id: "brandbook", name: "Брендбук", type: "toggle", price: 45000, days: 8 },
        { id: "motion", name: "Мини-моушн", type: "toggle", price: 30000, days: 5 },
        { id: "carriers", name: "Носители (пакет)", type: "select", choices: [
          { id: "basic", name: "Базовые", price: 0, days: 0 },
          { id: "full", name: "Полный", price: 25000, days: 4 }
        ]}
      ]
    },
    {
      id: "web", name: "Веб-дизайн", desc: "Лендинг или сайт под ключ",
      basePrice: 90000, baseDays: 18,
      options: [
        { id: "pages", name: "Количество экранов", type: "counter", min: 3, max: 15, step: 1, price: 6000, days: 1 },
        { id: "copy", name: "Копирайт", type: "toggle", price: 20000, days: 4 },
        { id: "dev", name: "Вёрстка", type: "toggle", price: 50000, days: 7 }
      ]
    },
    {
      id: "packaging", name: "Упаковка", desc: "Коробки, пакеты, этикетки",
      basePrice: 70000, baseDays: 14,
      options: [
        { id: "mockup", name: "3D-мокапы", type: "toggle", price: 18000, days: 3 },
        { id: "prepress", name: "Препресс", type: "toggle", price: 12000, days: 2 },
        { id: "qty", name: "Количество SKU", type: "counter", min: 1, max: 10, step: 1, price: 5000, days: 1 }
      ]
    },
    {
      id: "social", name: "Оформление соцсетей", desc: "Шаблоны, аватарки, обложки",
      basePrice: 35000, baseDays: 8,
      options: [
        { id: "stories", name: "Пакет сторис", type: "toggle", price: 10000, days: 2 },
        { id: "templates", name: "Количество шаблонов", type: "counter", min: 3, max: 12, step: 1, price: 3000, days: 0 },
        { id: "platform", name: "Платформа", type: "select", choices: [
          { id: "one", name: "Одна", price: 0, days: 0 },
          { id: "two", name: "Две", price: 8000, days: 2 }
        ]}
      ]
    }
  ]
};