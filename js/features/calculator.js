/* UI калькулятора. Логика — в ART.state.calculator (чистая).
   Состояние — в ART.state.store. Связи — только через ART.bus. */
   (function () {
    var pricing, stepsEl, summaryEl, store;
    var unsubStore = null, unsubSelect = null;
  
    function render() {
      var s = store.get();
      var r = ART.state.calculator.compute(s, pricing);
      renderSteps(s);
      renderSummary(r);
      ART.bus.emit("calc:changed", r);
    }
  
    function renderSteps(s) {
      var html = "";
  
      /* 1. Услуга */
      html += '<div class="calc-step"><p class="calc-step__title">1. Услуга</p><div class="calc-options">';
      pricing.services.forEach(function (svc) {
        var sel = s.serviceId === svc.id;
        html += '<button type="button" class="calc-opt' + (sel ? " is-selected" : "") + '" ' +
          'data-svc="' + svc.id + '" aria-pressed="' + sel + '">' +
          '<span class="check" aria-hidden="true">✓</span>' + svc.name + '</button>';
      });
      html += '</div></div>';
  
      /* 2. Параметры */
      var svc = s.serviceId ? pricing.services.filter(function (x) { return x.id === s.serviceId; })[0] : null;
      if (svc) {
        html += '<div class="calc-step"><p class="calc-step__title">2. Параметры</p>';
        svc.options.forEach(function (o) {
          if (o.type === "toggle") {
            var on = !!s.options[o.id];
            html += '<div class="calc-param">' +
              '<span class="calc-param__label">' + o.name +
                '<span class="calc-param__price">+' + ART.format.moneyCur(o.price) + ' / +' + o.days + ' дн.</span>' +
              '</span>' +
              '<button type="button" class="toggle" role="switch" aria-checked="' + on + '" ' +
                'aria-label="' + o.name + '" data-opt="' + o.id + '"></button>' +
            '</div>';
          } else if (o.type === "counter") {
            var v = s.options[o.id] != null ? s.options[o.id] : o.min;
            html += '<div class="calc-param">' +
              '<span class="calc-param__label">' + o.name +
                '<span class="calc-param__price">' + ART.format.moneyCur(o.price) + ' за ед.</span>' +
              '</span>' +
              '<span class="counter">' +
                '<button type="button" data-counter="-1" data-opt="' + o.id + '" aria-label="Меньше">−</button>' +
                '<span class="counter__val" data-counter-val="' + o.id + '">' + v + '</span>' +
                '<button type="button" data-counter="1" data-opt="' + o.id + '" aria-label="Больше">+</button>' +
              '</span>' +
            '</div>';
          } else if (o.type === "select") {
            var cur = s.options[o.id] || (o.choices[0] && o.choices[0].id);
            html += '<div class="calc-param">' +
              '<span class="calc-param__label">' + o.name + '</span>' +
              '<select class="calc-select" data-select="' + o.id + '">' +
                o.choices.map(function (ch) {
                  return '<option value="' + ch.id + '"' + (ch.id === cur ? " selected" : "") + '>' +
                    ch.name + (ch.price ? " (+" + ART.format.money(ch.price) + ")" : "") +
                  '</option>';
                }).join("") +
              '</select>' +
            '</div>';
          }
        });
        html += '</div>';
      }
  
      /* 3. Срочность */
      html += '<div class="calc-step"><p class="calc-step__title">3. Срочность</p><div class="calc-options">';
      pricing.urgency.forEach(function (u) {
        var sel = s.urgencyId === u.id;
        html += '<button type="button" class="calc-opt' + (sel ? " is-selected" : "") + '" ' +
          'data-urg="' + u.id + '" aria-pressed="' + sel + '">' +
          '<span class="check" aria-hidden="true">✓</span>' + u.name + '</button>';
      });
      html += '</div></div>';
  
      stepsEl.innerHTML = html;
    }
  
    function renderSummary(r) {
      if (!r.ok) {
        summaryEl.innerHTML =
          '<p class="calc-summary__title">Итог</p>' +
          '<div class="calc-summary__placeholder">Выбери услугу, и мы всё посчитаем.</div>';
        return;
      }
  
      /* HTML-версия с <span class="money-prefix">от/до</span> */
      var rng = ART.format.rangeHtml(r.total, r.high);
      var days = ART.format.days(r.days, r.highDays);
  
      summaryEl.innerHTML =
        '<div class="calc-summary__compact">' +
          '<span class="calc-summary__amount">' + rng + '</span>' +
          '<button type="button" class="calc-summary__compact-toggle" aria-label="Подробнее">↑</button>' +
        '</div>' +
        '<p class="calc-summary__title">Итог</p>' +
        '<div class="calc-summary__amount" id="calcAmount">' + rng + '</div>' +
        '<div class="calc-summary__days" id="calcDays">' + days + '</div>' +
        '<ul class="calc-summary__list">' +
          r.lines.map(function (l) {
            return '<li><span>' + l.label + '</span><span>' + ART.format.moneyCur(l.price) + '</span></li>';
          }).join("") +
          '<li><span>Срочность</span><span>' + r.urgencyName + '</span></li>' +
        '</ul>' +
        '<p class="calc-summary__note">Это ориентир, точную стоимость назовём после короткого брифа.</p>' +
        '<div class="calc-summary__actions">' +
          '<button type="button" class="btn btn--primary" id="calcSend">Отправить расчёт</button>' +
          '<button type="button" class="btn btn--ghost" id="calcCopy">Скопировать расчёт</button>' +
        '</div>';
  
      /* Анимация суммы — обязательно innerHTML, т.к. rangeHtml содержит <span> */
      var amountEl = summaryEl.querySelector("#calcAmount");
      if (amountEl && ART.motion.gsap && !ART.motion.reduced) {
        var obj = { v: r.total * 0.7 };
        ART.motion.gsap.to(obj, {
          v: r.total, duration: 0.5, ease: "power2.out",
          onUpdate: function () {
            amountEl.innerHTML = ART.format.rangeHtml(obj.v, obj.v * (1 + pricing.spread));
          }
        });
      }
  
      /* Мобильная свёртка */
      var comp = summaryEl.querySelector(".calc-summary__compact");
      if (comp) {
        comp.addEventListener("click", function () {
          summaryEl.classList.toggle("is-expanded");
          var btn = comp.querySelector(".calc-summary__compact-toggle");
          btn.textContent = summaryEl.classList.contains("is-expanded") ? "↓" : "↑";
        });
      }
  
      /* Отправить расчёт */
      var send = summaryEl.querySelector("#calcSend");
      if (send) send.addEventListener("click", function () {
        var text = buildText(r);
        ART.bus.emit("calc:send-to-form", { text: text });
        ART.scroll.to("#contacts");
      });
  
      /* Скопировать */
      var copy = summaryEl.querySelector("#calcCopy");
      if (copy) copy.addEventListener("click", function () {
        var text = buildText(r);
        if (navigator.clipboard) {
          navigator.clipboard.writeText(text).then(function () {
            copy.textContent = "Скопировано";
            setTimeout(function () { copy.textContent = "Скопировать расчёт"; }, 1600);
          });
        }
      });
    }
  
    /* buildText — чистый текст (без HTML), для буфера и формы */
    function buildText(r) {
      return "Расчёт ART.Foma:\nУслуга: " + r.serviceName + "\n" +
        r.lines.map(function (l) { return "- " + l.label + ": " + ART.format.moneyCur(l.price); }).join("\n") +
        "\nСрочность: " + r.urgencyName +
        "\nСумма: " + ART.format.range(r.total, r.high) +
        "\nСрок: " + ART.format.days(r.days, r.highDays);
    }
  
    function bind() {
      stepsEl.addEventListener("click", function (e) {
        var svc = e.target.closest("[data-svc]");
        if (svc) {
          store.update(function (s) {
            return ART.state.calculator.selectService(s, pricing, svc.getAttribute("data-svc"));
          });
          return;
        }
        var urg = e.target.closest("[data-urg]");
        if (urg) {
          store.update(function (s) {
            return ART.state.calculator.setUrgency(s, urg.getAttribute("data-urg"));
          });
          return;
        }
        var tgl = e.target.closest(".toggle");
        if (tgl) {
          var id = tgl.getAttribute("data-opt");
          store.update(function (s) {
            return ART.state.calculator.setOption(s, id, !s.options[id]);
          });
          return;
        }
        var cnt = e.target.closest("[data-counter]");
        if (cnt) {
          var optId = cnt.getAttribute("data-opt");
          var dir = parseInt(cnt.getAttribute("data-counter"), 10);
          store.update(function (s) {
            var svcObj = pricing.services.filter(function (x) { return x.id === s.serviceId; })[0];
            if (!svcObj) return s;
            var o = svcObj.options.filter(function (x) { return x.id === optId; })[0];
            if (!o) return s;
            var v = s.options[optId] != null ? s.options[optId] : o.min;
            v = Math.max(o.min, Math.min(o.max, v + dir * (o.step || 1)));
            return ART.state.calculator.setOption(s, optId, v);
          });
          return;
        }
      });
  
      stepsEl.addEventListener("change", function (e) {
        var sel = e.target.closest("[data-select]");
        if (!sel) return;
        var id = sel.getAttribute("data-select");
        store.update(function (s) {
          return ART.state.calculator.setOption(s, id, sel.value);
        });
      });
    }
  
    ART.features.calculator = {
      name: "calculator",
      mount: function (root) {
        pricing = window.ART_DATA && ART_DATA.pricing;
        if (!pricing) return;
        stepsEl = root.getElementById("calcSteps");
        summaryEl = root.getElementById("calcSummary");
        if (!stepsEl || !summaryEl) return;
  
        store = ART.state.store.create(ART.state.calculator.initialState(pricing));
        unsubStore = store.subscribe(render);
  
        unsubSelect = ART.bus.on("calc:select-service", function (p) {
          store.update(function (s) {
            return ART.state.calculator.selectService(s, pricing, p.id);
          });
        });
  
        bind();
      },
      destroy: function () {
        if (unsubStore) unsubStore();
        if (unsubSelect) unsubSelect();
      }
    };
  })();