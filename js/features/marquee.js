/* Бегущая строка. Скорость зависит от скорости скролла.
   reduced — стоит на месте. */
   (function () {
    var track = null;
    var baseSpeed = 0.6;
    var offset = 0;
    var lastScrollY = 0;
    var rafId = 0;
    var contentWidth = 0;
    var running = false;
  
    function measure() {
      if (!track) return;
      contentWidth = track.scrollWidth / 2;
    }
  
    function loop() {
      rafId = 0;
      if (!running || !track) return;
      var env = ART.env && ART.env.state;
      if (env && env.reducedMotion) return;
  
      offset -= baseSpeed;
      if (contentWidth > 0 && -offset >= contentWidth) offset += contentWidth;
      track.style.transform = "translate3d(" + offset + "px,0,0)";
  
      rafId = requestAnimationFrame(loop);
    }
  
    function schedule() {
      if (!rafId) rafId = requestAnimationFrame(loop);
    }
  
    function onScroll() {
      var y = window.scrollY || 0;
      var v = Math.abs(y - lastScrollY);
      lastScrollY = y;
      baseSpeed = 0.6 + Math.min(v * 0.1, 6);
      schedule();
    }
  
    function start() {
      running = true;
      measure();
      schedule();
    }
  
    function stop() {
      running = false;
      if (rafId) cancelAnimationFrame(rafId);
      rafId = 0;
      if (track) track.style.transform = "";
    }
  
    function onEnv() {
      var env = ART.env && ART.env.state;
      if (!env || env.reducedMotion) stop();
      else start();
    }
  
    ART.features.marquee = {
      name: "marquee",
      mount: function (root) {
        track = root.getElementById("marqueeTrack");
        if (!track) return;
  
        /* Дублируем содержимое для бесшовности */
        if (!track.dataset.duplicated) {
          track.innerHTML = track.innerHTML + track.innerHTML;
          track.dataset.duplicated = "1";
        }
  
        window.addEventListener("scroll", onScroll, { passive: true });
        window.addEventListener("resize", measure, { passive: true });
        window.addEventListener("art:env", onEnv);
        onEnv();
      },
      destroy: function () {
        window.removeEventListener("scroll", onScroll);
        window.removeEventListener("resize", measure);
        window.removeEventListener("art:env", onEnv);
        stop();
      }
    };
  })();