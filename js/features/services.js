(function () {
  function fmt(n) {
    return ART.format.moneyCur(n);
  }

  var cancelFallback = null;

  function skeletonRows(count) {
    var html = "";
    for (var i = 0; i < count; i++) {
      html +=
        '<li class="service-row service-row--skeleton" aria-hidden="true">' +
          '<span class="service-row__num">0' + (i + 1) + '</span>' +
          '<span class="service-row__info">' +
            ART.skeleton.line() +
            '<div style="height:6px"></div>' +
            ART.skeleton.line() +
          '</span>' +
          '<span class="service-row__meta">' +
            '<div style="width:80px">' + ART.skeleton.line() + '</div>' +
          '</span>' +
        '</li>';
    }
    return html;
  }

  ART.features.services = {
    name: "services",
    mount: function (root) {
      var list = root.getElementById("servicesList");
      var pricing = window.ART_DATA && ART_DATA.pricing;
      if (!list || !pricing) return;

      if (ART.skeleton) {
        var count = (pricing.services && pricing.services.length) || 5;
        list.innerHTML = skeletonRows(count);
        if (cancelFallback) cancelFallback();
        cancelFallback = ART.skeleton.fallback(
          list,
          5000,
          "Не удалось загрузить услуги. <a href='#contacts'>Напишите нам</a>."
        );
      }

      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          if (cancelFallback) { cancelFallback(); cancelFallback = null; }
          list.innerHTML = "";

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
        });
      });
    },
    destroy: function () {
      if (cancelFallback) { cancelFallback(); cancelFallback = null; }
    }
  };
})();