/* Модуль окружения. Подключается ПЕРВЫМ после vendor и данных.
   Ставит на <html> data-input / data-compact / data-reduced / data-motion.
   Шлёт CustomEvent('art:env') при любом изменении. */
   (function () {
    window.ART = window.ART || {};
  
    var state = {
      input: "mouse",
      isCompact: false,
      isLandscapePhone: false,
      reducedMotion: false,
      hasGyro: false,
      motionTier: "full"
    };
  
    var mediaMouse = window.matchMedia("(hover: hover) and (pointer: fine)");
    var mediaCoarse = window.matchMedia("(hover: none) and (pointer: coarse)");
    var mediaReduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  
    function computeTier() {
      if (state.input !== "mouse") return "lite";
      if (state.isCompact) return "lite";
      if (window.innerWidth < 1024) return "lite";
      if (navigator.connection && navigator.connection.saveData) return "lite";
      return "full";
    }
  
    function apply() {
      state.reducedMotion = mediaReduced.matches;
      state.isCompact = window.innerWidth <= 767;
      state.isLandscapePhone =
        window.innerHeight <= 500 && window.innerWidth > window.innerHeight;
      state.hasGyro = typeof window.DeviceOrientationEvent !== "undefined";
      state.motionTier = computeTier();
  
      var html = document.documentElement;
      html.setAttribute("data-input", state.input);
      html.setAttribute("data-compact", String(state.isCompact));
      html.setAttribute("data-reduced", String(state.reducedMotion));
      html.setAttribute("data-motion", state.motionTier);
  
      window.dispatchEvent(new CustomEvent("art:env", { detail: Object.assign({}, state) }));
    }
  
    function initInput() {
      if (mediaMouse.matches) state.input = "mouse";
      else if (mediaCoarse.matches) state.input = "touch";
    }
    initInput();
  
    var pointerSeen = false;
    function onPointer(e) {
      if (pointerSeen) return;
      if (e.pointerType === "touch" || e.pointerType === "pen") state.input = "touch";
      else if (e.pointerType === "mouse") state.input = "mouse";
      else return;
      pointerSeen = true;
      apply();
      window.removeEventListener("pointerdown", onPointer, true);
      window.removeEventListener("pointermove", onPointer, true);
    }
    window.addEventListener("pointerdown", onPointer, { capture: true, passive: true });
    window.addEventListener("pointermove", onPointer, { capture: true, passive: true });
  
    var timer = 0;
    function schedule() {
      clearTimeout(timer);
      timer = setTimeout(apply, 150);
    }
    window.addEventListener("resize", schedule, { passive: true });
    window.addEventListener("orientationchange", schedule, { passive: true });
  
    if (mediaReduced.addEventListener) mediaReduced.addEventListener("change", apply);
    else if (mediaReduced.addListener) mediaReduced.addListener(apply);
  
    if (mediaMouse.addEventListener) {
      mediaMouse.addEventListener("change", function () {
        if (mediaMouse.matches) state.input = "mouse";
        else if (mediaCoarse.matches) state.input = "touch";
        apply();
      });
    }
  
    ART.env = {
      get state() { return Object.assign({}, state); },
      refresh: apply
    };
  
    apply();
  })();