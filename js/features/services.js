/* Список услуг. Клик по строке → emit('calc:select-service') + scroll к #calculator. */
(function () {
    function fmt(n) {
      return ART.format.moneyCur(n);
    }
  
    ART.features.services = {
      name: "services",
      mount: function (root) {
        var list = root.getElementById("servicesList");
        var pricing = window.ART_DATA && ART_DATA.pricing;
        if (!list || !pricing) return;
  
        pricing.services.forEach(function (s, i) {
          var li = document.createElement("li");
          li.className = "service-row";
          li.setAttribute("tabindex", "0");
          li.setAttribute("data-service-id", s.id);
          li.innerHTML =
            '<span class="service-row__num">0' + (i + 1) + '</span>' +
            '<span class="service-row__info">' +
              '<span class="service-row__name">' + s.name + '</span>' +
              '<span class="service-row__desc">' + s.desc + '</span>' +
            '</span>' +
            '<span class="service-row__meta">' +
              '<span class="service-row__price">от ' + fmt(s.basePrice) + '</span><br>' +
              '<span class="service-row__days">' + s.baseDays + ' дн.</span>' +
            '</span>' +
            '<span class="service-row__arrow" aria-hidden="true">→</span>';
  
          function go() {
            ART.bus.emit("calc:select-service", { id: s.id });
            ART.scroll.to("#calculator");
          }
          li.addEventListener("click", go);
          li.addEventListener("keydown", function (e) {
            if (e.key === "Enter" || e.key === " ") { e.preventDefault(); go(); }
          });
          list.appendChild(li);
        });
      },
      destroy: function () {}
    };
  })();