(function () {
  ART.utils = {
    qs: function (sel, root) { return (root || document).querySelector(sel); },
    qsa: function (sel, root) {
      return Array.prototype.slice.call((root || document).querySelectorAll(sel));
    },
    closest: function (el, sel) { return el && el.closest ? el.closest(sel) : null; },

    rafThrottle: function (fn) {
      var scheduled = false, lastArgs = null;
      return function () {
        lastArgs = arguments;
        if (scheduled) return;
        scheduled = true;
        requestAnimationFrame(function () {
          scheduled = false;
          fn.apply(null, lastArgs);
        });
      };
    },

    debounce: function (fn, ms) {
      var t = 0;
      return function () {
        var args = arguments;
        clearTimeout(t);
        t = setTimeout(function () { fn.apply(null, args); }, ms);
      };
    },

    prefersReducedMotion: function () {
      return !!(ART.env && ART.env.state.reducedMotion);
    },

    clamp: function (v, a, b) { return Math.min(b, Math.max(a, v)); },

    cssVar: function (name) {
      return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    }
  };
})();