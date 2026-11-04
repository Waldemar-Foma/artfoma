(function () {
  window.ART = window.ART || {};

  var ORDER = [
    "scroll", "header", "menu", "cursor", "reveal",
    "parallax", "marquee",
    "hero",
    "works", "services", "calculator", "form", "sandbox"
  ];

  function boot() {
    try { if (ART.data && ART.data.validate) ART.data.validate(); }
    catch (e) { console.warn("[ART] validate:", e); }

    ORDER.forEach(function (name) {
      var f = ART.features && ART.features[name];
      if (!f || typeof f.mount !== "function") return;
      try { f.mount(document); }
      catch (e) { console.error("[ART] mount " + name, e); }
    });

    window.addEventListener("beforeunload", function () {
      ORDER.forEach(function (name) {
        var f = ART.features && ART.features[name];
        if (f && typeof f.destroy === "function") {
          try { f.destroy(); } catch (e) { /* noop */ }
        }
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();