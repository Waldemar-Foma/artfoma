(function () {
  var layers = [];
  var hero = null;
  var heroVisible = false;
  var mouse = { x: 0, y: 0, tx: 0, ty: 0, active: false };
  var gyro  = { x: 0, y: 0, tx: 0, ty: 0, active: false };
  var rafId = 0;
  var attached = false;
  var parallaxGyroRequested = false;

  function envState() { return ART.env ? ART.env.state : null; }

  function setupLayers() {
    layers = [];
    if (!hero) return;
    var blob = hero.querySelector(".hero__blob");
    var float = hero.querySelector(".hero__float");
    var dot  = hero.querySelector(".hero__rose-dot");
    var out  = hero.querySelector(".hero__outline");
    if (blob)  layers.push({ el: blob,  factor: 0.08, max: 60 });
    if (out)   layers.push({ el: out,   factor: 0.08, max: 60 });
    if (float) layers.push({ el: float, factor: 0.15, max: 60 });
    if (dot)   layers.push({ el: dot,   factor: 0.25, max: 60 });
  }

  function setVar(el, name, px) {
    el.style.setProperty(name, px.toFixed(2));
  }

  function loop() {
    rafId = 0;
    if (!heroVisible) return;
    var env = envState();
    if (!env || env.reducedMotion) return;

    mouse.x += (mouse.tx - mouse.x) * 0.08;
    mouse.y += (mouse.ty - mouse.y) * 0.08;
    gyro.x  += (gyro.tx  - gyro.x)  * 0.12;
    gyro.y  += (gyro.ty  - gyro.y)  * 0.12;

    var heroRect = hero.getBoundingClientRect();
    var progress = 0;
    if (heroRect.height) {
      progress = Math.min(1, Math.max(-1, -heroRect.top / heroRect.height));
    }
    var maxBase = env.isCompact ? 24 : 60;

    layers.forEach(function (L) {
      var scrollPx = -progress * maxBase * (L.factor / 0.15);
      var mousePx = 0, gyroPx = 0;
      if (env.motionTier === "full" && mouse.active) {
        mousePx = -mouse.x * 14 * (L.factor / 0.15);
      }
      if (env.input === "touch" && gyro.active) {
        gyroPx = gyro.x * 10 * (L.factor / 0.15);
      }
      setVar(L.el, "--py", scrollPx);
      setVar(L.el, "--px", mousePx + gyroPx);
    });

    scaleReviews();

    if (mouse.active || gyro.active) {
      rafId = requestAnimationFrame(loop);
    }
  }

  function schedule() {
    if (!rafId) rafId = requestAnimationFrame(loop);
  }

  function scaleReviews() {
    var track = document.getElementById("reviewsTrack");
    if (!track) return;
    var cards = track.querySelectorAll(".review-card");
    if (!cards.length) return;
    var box = track.getBoundingClientRect();
    var center = box.left + box.width / 2;
    cards.forEach(function (c) {
      var r = c.getBoundingClientRect();
      var d = Math.abs(r.left + r.width / 2 - center) / (box.width / 2);
      var s = 1 - Math.min(0.04, d * 0.04);
      c.style.transform = "scale(" + s.toFixed(3) + ")";
    });
  }

  function onScroll() { schedule(); }

  function onMouseMove(e) {
    var env = envState();
    if (!env || env.motionTier !== "full") { mouse.active = false; return; }
    mouse.active = true;
    var cx = window.innerWidth / 2;
    var cy = window.innerHeight / 2;
    mouse.tx = (e.clientX - cx) / cx;
    mouse.ty = (e.clientY - cy) / cy;
    schedule();
  }

  function onMouseLeave() {
    mouse.active = false;
    mouse.tx = 0;
    mouse.ty = 0;
    schedule();
  }

  function orientationAngle() {
    if (screen && screen.orientation && typeof screen.orientation.angle === "number") {
      return screen.orientation.angle;
    }
    if (typeof window.orientation === "number") return window.orientation;
    return 0;
  }

  var DEAD_ZONE = 3;
  function onOrientation(e) {
    var env = envState();
    if (!env || env.input !== "touch" || env.reducedMotion) return;
    
    var beta = e.beta || 0;
    var gamma = e.gamma || 0;
    var angle = orientationAngle();
    var a = ((angle % 360) + 360) % 360;
    
    var gx = gamma, gy = beta;
    if (a === 90) { gx = beta; gy = -gamma; }
    else if (a === 180) { gx = -gamma; gy = -beta; }
    else if (a === 270) { gx = -beta; gy = gamma; }

    if (Math.abs(gy) < DEAD_ZONE) gy = 0;
    if (Math.abs(gx) < DEAD_ZONE) gx = 0;
    
    gy = Math.max(-45, Math.min(45, gy));
    gx = Math.max(-45, Math.min(45, gx));
    
    gyro.active = true;
    gyro.tx = Math.sin(gx * Math.PI / 180);
    gyro.ty = Math.sin(gy * Math.PI / 180);
    schedule();
  }

  function attach() {
    if (attached) return;
    attached = true;
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });
    var env = envState();
    
    if (env && env.motionTier === "full") {
      window.addEventListener("mousemove", onMouseMove, { passive: true });
      document.addEventListener("mouseleave", onMouseLeave);
    }
    
    if (env && env.input === "touch" && env.hasGyro) {
      var initParallaxGyro = function() {
        if (parallaxGyroRequested) return;
        
        if (typeof DeviceOrientationEvent !== "undefined" && typeof DeviceOrientationEvent.requestPermission === "function") {
          DeviceOrientationEvent.requestPermission()
            .then(function(state) {
              if (state === "granted") {
                parallaxGyroRequested = true;
                window.addEventListener("deviceorientation", onOrientation, { passive: true });
              }
            })
            .catch(function() {}); 
        } else {
          parallaxGyroRequested = true;
          window.addEventListener("deviceorientation", onOrientation, { passive: true });
        }
      };

      document.addEventListener("touchstart", initParallaxGyro, { once: true, passive: true });
    }
    schedule();
  }

  function detach() {
    if (!attached) return;
    attached = false;
    window.removeEventListener("scroll", onScroll);
    window.removeEventListener("resize", schedule);
    window.removeEventListener("mousemove", onMouseMove);
    document.removeEventListener("mouseleave", onMouseLeave);
    window.removeEventListener("deviceorientation", onOrientation);
    mouse.active = false;
    gyro.active = false;
    if (rafId) cancelAnimationFrame(rafId);
    rafId = 0;
  }

  function onEnv() {
    detach();
    var env = envState();
    if (!env || env.reducedMotion) return;
    attach();
  }

  ART.features.parallax = {
    name: "parallax",
    mount: function (root) {
      hero = root.getElementById("hero");
      if (!hero) return;
      setupLayers();

      if ("IntersectionObserver" in window) {
        var io = new IntersectionObserver(function (entries) {
          entries.forEach(function (en) {
            heroVisible = en.isIntersecting;
            if (heroVisible) schedule();
          });
        }, { threshold: 0.01 });
        io.observe(hero);
      } else {
        heroVisible = true;
      }

      window.addEventListener("art:env", onEnv);
      onEnv();
    },
    destroy: function () {
      window.removeEventListener("art:env", onEnv);
      detach();
    }
  };
})();