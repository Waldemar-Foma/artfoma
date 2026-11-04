/* Кастомный курсор. Только при input=mouse. Цвета — через CSS-переменные
   (--accent на светлом, --butter на Ink-секциях).
   data-cursor-ready на <html> включает cursor:none у body. */
   (function () {
    var el, label, html;
    var mx = 0, my = 0, cx = 0, cy = 0;
    var rafId = 0;
    var attached = false;
    var magnets = [];
    var magnetHandlers = [];
  
    function isMouse() {
      return ART.env && ART.env.state.input === "mouse";
    }
  
    function move(e) {
      mx = e.clientX; my = e.clientY;
      el.classList.add("is-visible");
      if (!html.hasAttribute("data-cursor-ready")) {
        html.setAttribute("data-cursor-ready", "true");
      }
    }
  
    function loop() {
      cx += (mx - cx) * 0.2;
      cy += (my - cy) * 0.2;
      el.style.transform = "translate(" + cx + "px," + cy + "px) translate(-50%,-50%)";
      rafId = requestAnimationFrame(loop);
    }
  
    function updateTheme(e) {
      var t = document.elementFromPoint(e.clientX, e.clientY);
      var dark = t && t.closest('[data-theme="dark"]');
      html.toggleAttribute("data-cursor-dark", !!dark);
    }
  
    function onOver(e) {
      var target = e.target.closest("[data-cursor-label]");
      if (target) {
        el.classList.add("is-big");
        label.textContent = target.getAttribute("data-cursor-label") || "";
      }
    }
    function onOut(e) {
      if (e.target.closest("[data-cursor-label]")) {
        el.classList.remove("is-big");
        label.textContent = "";
      }
    }
  
    function bindMagnets() {
      magnets = Array.prototype.slice.call(document.querySelectorAll(".btn, .work-card__arrow"));
      magnetHandlers = magnets.map(function (m) {
        function mm(e) {
          var r = m.getBoundingClientRect();
          var dx = (e.clientX - (r.left + r.width / 2)) * 0.15;
          var dy = (e.clientY - (r.top + r.height / 2)) * 0.15;
          var lim = 8;
          m.style.transform =
            "translate(" + Math.max(-lim, Math.min(lim, dx)) + "px," +
                          Math.max(-lim, Math.min(lim, dy)) + "px) scale(1.03)";
        }
        function ml() { m.style.transform = ""; }
        m.addEventListener("mousemove", mm);
        m.addEventListener("mouseleave", ml);
        return { el: m, move: mm, leave: ml };
      });
    }
  
    function unbindMagnets() {
      magnetHandlers.forEach(function (h) {
        h.el.removeEventListener("mousemove", h.move);
        h.el.removeEventListener("mouseleave", h.leave);
        h.el.style.transform = "";
      });
      magnetHandlers = [];
      magnets = [];
    }
  
    function attach() {
      if (attached || !isMouse() || !el) return;
      attached = true;
      document.addEventListener("mousemove", move, { passive: true });
      document.addEventListener("mousemove", updateTheme, { passive: true });
      document.addEventListener("mouseover", onOver);
      document.addEventListener("mouseout", onOut);
      if (ART.env.state.motionTier === "full") bindMagnets();
      rafId = requestAnimationFrame(loop);
      el.classList.add("is-visible");
    }
  
    function detach() {
      if (!attached) return;
      attached = false;
      document.removeEventListener("mousemove", move);
      document.removeEventListener("mousemove", updateTheme);
      document.removeEventListener("mouseover", onOver);
      document.removeEventListener("mouseout", onOut);
      cancelAnimationFrame(rafId);
      rafId = 0;
      html.removeAttribute("data-cursor-ready");
      html.removeAttribute("data-cursor-dark");
      el.classList.remove("is-visible", "is-big");
      label.textContent = "";
      unbindMagnets();
    }
  
    function onEnv() {
      if (isMouse()) attach();
      else detach();
    }
  
    ART.features.cursor = {
      name: "cursor",
      mount: function (root) {
        el = root.getElementById("cursor");
        label = root.getElementById("cursorLabel");
        html = document.documentElement;
        if (!el) return;
        onEnv();
        window.addEventListener("art:env", onEnv);
      },
      destroy: function () {
        window.removeEventListener("art:env", onEnv);
        detach();
      }
    };
  })();