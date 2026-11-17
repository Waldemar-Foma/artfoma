// js/contacts.js
// Форма обратной связи: валидация, XSS-safe вывод ошибок, фокус на первую ошибку.
// Реальной отправки нет — заглушка. Замени submitForm() на fetch к своему API.

import { esc } from './escape.js';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[+\d][\d\s()-]{6,}$/;
const TG_RE = /^@?[a-zA-Z0-9_]{4,32}$/;

function setError(field, msg) {
  const err = document.getElementById('e' + field.id.slice(1)); // fn → en, fc → ec, fm → em
  if (err) err.textContent = msg;
  if (field) {
    if (msg) field.setAttribute('aria-invalid', 'true');
    else field.removeAttribute('aria-invalid');
  }
}

function validate() {
  const fn = document.getElementById('fn');
  const fc = document.getElementById('fc');
  const fm = document.getElementById('fm');
  if (!fn || !fc || !fm) return false;

  let ok = true;
  let firstBad = null;

  // Имя: не пусто, >= 2 символов
  const name = fn.value.trim();
  if (name.length < 2) {
    setError(fn, 'Напишите имя (минимум 2 символа)');
    ok = false;
    firstBad = firstBad || fn;
  } else {
    setError(fn, '');
  }

  // Контакт: email ИЛИ телефон ИЛИ telegram
  const contact = fc.value.trim();
  const isEmail = EMAIL_RE.test(contact);
  const isPhone = PHONE_RE.test(contact);
  const isTg = TG_RE.test(contact);
  if (!contact) {
    setError(fc, 'Оставьте телефон, почту или Telegram');
    ok = false;
    firstBad = firstBad || fc;
  } else if (!isEmail && !isPhone && !isTg) {
    setError(fc, 'Не похоже на почту, телефон или @username');
    ok = false;
    firstBad = firstBad || fc;
  } else {
    setError(fc, '');
  }

  // Задача: не пусто, >= 10 символов
  const msg = fm.value.trim();
  if (msg.length < 10) {
    setError(fm, 'Расскажите о задаче хотя бы в двух предложениях');
    ok = false;
    firstBad = firstBad || fm;
  } else {
    setError(fm, '');
  }

  if (!ok) firstBad?.focus();
  return ok;
}

/**
 * Заглушка отправки. Замени на реальный fetch:
 *   await fetch('/api/contact', { method:'POST', headers:{'Content-Type':'application/json'},
 *     body: JSON.stringify({ name, contact, message }) });
 */
async function submitForm(data) {
  // Имитация задержки сети
  await new Promise((r) => setTimeout(r, 500));
  console.info('[contacts] submit (stub):', data);
  return { ok: true };
}

export function initContacts() {
  const form = document.getElementById('f');
  if (!form) return;

  const ok = document.getElementById('ok');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (ok) ok.hidden = true;

    if (!validate()) return;

    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.dataset.label = submitBtn.textContent;
      submitBtn.textContent = 'Отправляем…';
    }

    try {
      const data = {
        name: document.getElementById('fn').value.trim(),
        contact: document.getElementById('fc').value.trim(),
        message: document.getElementById('fm').value.trim(),
      };
      await submitForm(data);
      form.reset();
      [document.getElementById('fn'), document.getElementById('fc'), document.getElementById('fm')]
        .forEach((f) => f && setError(f, ''));
      if (ok) {
        ok.hidden = false;
        ok.focus();
      }
    } catch (err) {
      console.error(err);
      if (ok) {
        ok.hidden = false;
        ok.textContent = 'Что-то пошло не так. Попробуйте ещё раз или напишите на почту.';
      }
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = submitBtn.dataset.label || 'Отправить';
      }
    }
  });

  // Сбрасываем ошибку по мере ввода
  ['fn', 'fc', 'fm'].forEach((id) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('input', () => setError(el, ''));
  });
}