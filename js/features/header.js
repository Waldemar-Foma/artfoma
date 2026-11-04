/* Шапка: скрытие при скролле вниз, возврат при скролле вверх, активный пункт. */
(function () {
    var header, lastY = 0, ticking = false, unsubActive = null, unsubScroll = null;
  
    function onScroll() {
      var y = window.scrollY || 0;
      if (y > 8) header.classList.add("scrolled");
      else header.classList.remove("scrolled");
  
      var dy = y - lastY;
      if (Math.abs(dy) > 6) {
        if (dy > 0 && y > 120) header.classList.add("is-hidden");
        else header.classList.remove("is-hidden");
        lastY = y;
      }
      ticking = false;
    }
  
    function scrollHandler() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(onScroll);
    }
  
    function setActive(id) {
      var links = header.querySelectorAll(".nav-link");
      links.forEach(function (l) {
        l.classList.toggle("is-active", l.getAttribute("data-nav") === id);
      });
    }
  
    ART.features.header = {
      name: "header",
      mount: function (root) {
        header = root.getElementById("siteHeader");
        if (!header) return;
  
        window.addEventListener("scroll", scrollHandler, { passive: true });
  
        unsubScroll = ART.bus.on("section:active", function (p) { setActive(p.id); });
  
        ART.scroll.onActiveSection(function (id) { setActive(id); });
      },
      destroy: function () {
        window.removeEventListener("scroll", scrollHandler);
        if (unsubScroll) unsubScroll();
        if (unsubActive) unsubActive();
      }
    };
  })();