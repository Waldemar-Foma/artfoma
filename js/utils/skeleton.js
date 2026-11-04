(function () {
  ART.skeleton = {
    line: function (cls) {
      return '<div class="skeleton-line' + (cls ? " " + cls : "") + '"></div>';
    },

    card: function () {
      return (
        '<div class="skeleton-card" aria-hidden="true">' +
          '<div class="ph avatar"></div>' +
          '<div class="ph line w60"></div>' +
          '<div class="ph line"></div>' +
          '<div class="ph line w80"></div>' +
        '</div>'
      );
    },

    fill: function (container, count, renderer) {
      if (!container) return;
      container.innerHTML = "";
      var frag = document.createDocumentFragment();
      for (var i = 0; i < count; i++) {
        var wrap = document.createElement("div");
        wrap.className = "skeleton-placeholder";
        wrap.setAttribute("aria-hidden", "true");
        wrap.innerHTML = renderer ? renderer(i) : ART.skeleton.card();
        frag.appendChild(wrap);
      }
      container.appendChild(frag);
    },

    clear: function (container) {
      if (!container) return;
      container.innerHTML = "";
    },

    fallback: function (container, ms, message) {
      if (!container) return function () {};
      var t = setTimeout(function () {
        var placeholders = container.querySelectorAll(".skeleton-placeholder");
        if (placeholders.length && placeholders.length === container.children.length) {
          container.innerHTML = '<p class="skeleton-error" role="status">' +
            (message || "Не удалось загрузить. Обновите страницу.") + '</p>';
        }
      }, ms);
      return function () { clearTimeout(t); };
    }
  };
})();