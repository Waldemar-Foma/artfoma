(function () {
  var lenis = null;
  var activeCb = null;
  var observer = null;
  var lastActiveId = null;

  function shouldUseLenis() {
    if (!window.Lenis) return false;
    var s = ART.env && ART.env.state;
    if (!s) return false;
    if (s.reducedMotion) return false;
    if (s.input !== "mouse") return false;
    return true;
  }

  function destroyLenis() {
    if (lenis) {
      try { lenis.destroy(); } catch (e) { /* noop */ }
      lenis = null;
    }
  }

  function createLenis() {
    destroyLenis();
    if (!shouldUseLenis()) return;
    try {
      lenis = new window.Lenis({ duration: 0.9, smoothWheel: true });
      function raf(t) {
        if (!lenis) return;
        lenis.raf(t);
        requestAnimationFrame(raf);
      }
      requestAnimationFrame(raf);
    } catch (e) {
      lenis = null;
    }
  }

  function headerOffset() {
    var h = document.querySelector(".site-header");
    if (!h) return 72;
    return h.offsetHeight || 72;
  }

  function scrollTo(target) {
    var el = typeof target === "string" ? document.querySelector(target) : target;
    if (!el) return;
    var offset = -headerOffset() - 8;
    if (lenis) {
      lenis.scrollTo(el, { offset: offset });
      return;
    }
    var rect = el.getBoundingClientRect();
    var top = rect.top + window.scrollY + offset;
    window.scrollTo({
      top: top,
      behavior: (ART.env && ART.env.state.reducedMotion) ? "auto" : "smooth"
    });
  }

  function setupActiveSection() {
    if (observer) { observer.disconnect(); observer = null; }
    if (!("IntersectionObserver" in window)) return;
    var sections = ["works", "services", "calculator", "contacts"]
      .map(function (id) { return document.getElementById(id); })
      .filter(Boolean);
    if (!sections.length) return;

    observer = new IntersectionObserver(function (entries) {
      var best = null, bestRatio = 0;
      entries.forEach(function (en) {
        if (en.intersectionRatio > bestRatio) {
          bestRatio = en.intersectionRatio;
          best = en.target;
        }
      });
      if (best && best.id !== lastActiveId) {
        lastActiveId = best.id;
        if (activeCb) activeCb(best.id);
        ART.bus.emit("section:active", { id: best.id });
      }
    }, { rootMargin: "-40% 0px -50% 0px", threshold: [0, 0.2, 0.5, 0.8, 1] });

    sections.forEach(function (s) { observer.observe(s); });
  }

  function onEnvChange() {
    if (shouldUseLenis()) createLenis();
    else destroyLenis();
  }

  ART.scroll = {
    init: function () {
      createLenis();
      window.addEventListener("art:env", onEnvChange);
      setupActiveSection();
    },
    to: scrollTo,
    onActiveSection: function (cb) { activeCb = cb; },
    get lenis() { return lenis; }
  };
})();