/* Обёртка над GSAP/ScrollTrigger с no-op фолбэком.
   Если GSAP не загружен — сразу ставим финальные стили. */
   (function () {
    var gsap = window.gsap || null;
    var ST   = window.ScrollTrigger || null;
  
    if (gsap && ST && gsap.registerPlugin) {
      try { gsap.registerPlugin(ST); } catch (e) { /* noop */ }
    }
  
    function reduced() {
      return !!(ART.env && ART.env.state.reducedMotion);
    }
  
    function tier() {
      return (ART.env && ART.env.state.motionTier) || "full";
    }
  
    ART.motion = {
      gsap: gsap,
      ScrollTrigger: ST,
      get reduced() { return reduced(); },
      get tier() { return tier(); },
  
      /* Применяет from→to. Без GSAP или при reduced — сразу to. */
      fromTo: function (el, from, to, opts) {
        if (!el) return null;
        if (!gsap || reduced()) {
          Object.keys(to || {}).forEach(function (k) {
            if (k === "y" || k === "x") el.style.transform = "translate(" + (to.x || 0) + "px," + (to.y || 0) + "px)";
            else el.style[k] = to[k];
          });
          return null;
        }
        return gsap.fromTo(el, from, to);
      },
  
      timeline: function (opts) {
        if (!gsap || reduced()) return null;
        return gsap.timeline(opts);
      },
  
      /* matchMedia-обёртка GSAP с фолбэком: cb(matchObj) вызывается при подходящем условии,
         возвращает teardown. Без GSAP — вызываем cb один раз для текущего состояния. */
      match: function (queries, cb) {
        if (gsap && gsap.matchMedia) {
          return gsap.matchMedia(queries, cb);
        }
        var mql = {};
        Object.keys(queries).forEach(function (k) {
          mql[k] = window.matchMedia(queries[k]);
        });
        var current = {};
        Object.keys(mql).forEach(function (k) { current[k] = mql[k].matches; });
        try { cb(current); } catch (e) { console.warn("[motion.match]", e); }
        return { revert: function () {} };
      }
    };
  })();