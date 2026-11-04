/* Форматирование денег и дней. Валюта берётся из данных, не из кода. */
(function () {
    function getCurrency() {
      return (window.ART_DATA && ART_DATA.pricing && ART_DATA.pricing.currency) || "";
    }
  
    function fmtMoney(n) {
      var v = Math.round(n);
      try {
        return new Intl.NumberFormat("ru-RU").format(v);
      } catch (e) {
        return String(v);
      }
    }
  
    function fmtMoneyCur(n) {
      return fmtMoney(n) + " " + getCurrency();
    }
  
    function fmtRange(a, b) {
      return "от " + fmtMoney(a) + " до " + fmtMoney(b) + " " + getCurrency();
    }
  
    /* HTML-версия: «от» / «до» — в обёртке .money-prefix (мельче цифр),
       цифры и знак валюты — как есть. Для innerHTML, не для textContent. */
    function fmtRangeHtml(a, b) {
      return '<span class="money-prefix">от</span> ' + fmtMoney(a) +
             ' <span class="money-prefix">до</span> ' + fmtMoney(b) +
             ' ' + getCurrency();
    }
  
    function fmtDays(a, b) {
      if (a === b) return a + " дн.";
      return a + "–" + b + " дн.";
    }
  
    ART.format = {
      money: fmtMoney,
      moneyCur: fmtMoneyCur,
      range: fmtRange,
      rangeHtml: fmtRangeHtml,
      days: fmtDays
    };
  })();