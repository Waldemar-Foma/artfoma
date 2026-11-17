import { initSnake } from './snake.js';
import { initWeight } from './weight.js';
import { initLines } from './lines.js';
import { initPattern } from './pattern.js';
import { initPoster } from './poster.js';

let labOn = false;

export function initLab() {
  if (labOn) return;
  labOn = true;

  // Ждем следующего кадра, чтобы canvas получили правильные размеры
  requestAnimationFrame(() => {
    initSnake();
    initWeight();
    initLines();
    initPattern();
    initPoster();
  });
}