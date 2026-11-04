(function () {
  var overlay, burger, closeBtn;
  var isOpen = false;
  var lastFocus = null;
  var untrap = null;

  function open() {
    if (isOpen) return;
    isOpen = true;
    lastFocus = document.activeElement;
    overlay.hidden = false;
    requestAnimationFrame(function () { overlay.classList.add("is-open"); });
    burger.setAttribute("aria-expanded", "true");
    ART.dom.lockScroll();
    ART.bus.emit("menu:open", {});
    untrap = ART.dom.trapFocus(overlay, close);
    var f = overlay.querySelector('a[href], button');
    if (f) f.focus();
  }

  function close() {
    if (!isOpen) return;
    isOpen = false;
    overlay.classList.remove("is-open");
    burger.setAttribute("aria-expanded", "false");
    ART.dom.unlockScroll();
    ART.bus.emit("menu:close", {});
    if (untrap) { untrap(); untrap = null; }
    setTimeout(function () { if (!isOpen) overlay.hidden = true; }, 320);
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  function onKey(e) {
    if (e.key === "Escape" && isOpen) { e.preventDefault(); close(); }
  }

  function onOverlayClick(e) {
    var link = e.target.closest("a[href^='#']");
    if (!link) return;
    e.preventDefault();
    var target = link.getAttribute("href");
    close();
    setTimeout(function () { ART.scroll.to(target); }, 220);
  }

  ART.features.menu = {
    name: "menu",
    mount: function (root) {
      overlay = root.getElementById("overlayMenu");
      burger = root.getElementById("burger");
      closeBtn = root.getElementById("overlayClose");
      if (!overlay || !burger) return;

      burger.addEventListener("click", function () { isOpen ? close() : open(); });
      if (closeBtn) closeBtn.addEventListener("click", close);
      document.addEventListener("keydown", onKey);
      overlay.addEventListener("click", onOverlayClick);

      var countEl = overlay.querySelector("[data-cases-count]");
      if (countEl && ART_DATA.cases) countEl.textContent = ART_DATA.cases.length;
    },
    destroy: function () {
      document.removeEventListener("keydown", onKey);
      if (overlay) overlay.removeEventListener("click", onOverlayClick);
    }
  };
})();