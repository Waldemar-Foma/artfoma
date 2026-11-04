(function () {
    var TAGS = [
      ["#айдентика",   "sticker--butter"],
      ["#логотипы",    "sticker--butter-soft"],
      ["#веб-дизайн",  "sticker--pine-mist"],
      ["#UX/UI",       "sticker--snow"],
      ["#упаковка",    "sticker--butter"],
      ["#соцсети",     "sticker--rose-soft"],
      ["#презентации", "sticker--butter-soft"],
      ["#моушн",       "sticker--pine-mist"],
      ["#иллюстрации", "sticker--snow"],
      ["#нейминг",     "sticker--butter"],
      ["#гайдлайны",   "sticker--butter-soft"],
      ["#3D",          "sticker--rose-soft"]
    ];
  
    function shapeSVG(kind) {
      if (kind === "star") {
        return '<svg viewBox="0 0 100 100"><path d="M50 4l13 32 34 2-26 22 8 33-29-20-29 20 8-33L3 38l34-2z" fill="var(--pine)"/></svg>';
      }
      if (kind === "flower") {
        return '<svg viewBox="0 0 100 100">' +
          '<g stroke="var(--ink)" stroke-width="1.5">' +
            '<circle cx="50" cy="28" r="18" fill="var(--butter)"/>' +
            '<circle cx="50" cy="72" r="18" fill="var(--butter)"/>' +
            '<circle cx="28" cy="50" r="18" fill="var(--butter)"/>' +
            '<circle cx="72" cy="50" r="18" fill="var(--butter)"/>' +
          '</g>' +
          '<circle cx="50" cy="50" r="12" fill="var(--ink)"/>' +
        '</svg>';
      }
      if (kind === "sun") {
        return '<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="20" fill="var(--ink)"/>' +
          Array.from({ length: 12 }).map(function (_, i) {
            var a = i * 30 * Math.PI / 180;
            var x1 = 50 + Math.cos(a) * 28, y1 = 50 + Math.sin(a) * 28;
            var x2 = 50 + Math.cos(a) * 44, y2 = 50 + Math.sin(a) * 44;
            return '<line x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 +
                   '" stroke="var(--ink)" stroke-width="5" stroke-linecap="round"/>';
          }).join("") +
        '</svg>';
      }
      return "";
    }
  
    var box, fallbackEl, hintEl, railEl, gravityBtn, shakeBtn;
    var stickers = [];
    var engine = null, runner = null, world = null;
    var MatterNS = null;
    var drag = null;
    var io = null;
    var orientationListener = null;
    var motionListener = null;
    var gyroEnabled = false;
    var gyro = { x: 0, y: 0 };
    var lastShake = 0;
    var resizeTimer = 0;
    var running = false;
    var mounted = false;
    var boundHandlers = null; 
  
    function isTouch() { return ART.env && ART.env.state.input === "touch"; }
    function reduced() { return ART.env && ART.env.state.reducedMotion; }
    function hasMatter() {
      return !!(window.Matter && window.Matter.Engine && window.Matter.Bodies);
    }
  
    /* ——— DOM стикеров ——— */
    function buildStickers() {
      stickers.forEach(function (s) { if (s.parentNode) s.parentNode.removeChild(s); });
      stickers = [];
  
      TAGS.forEach(function (t) {
        var el = document.createElement("div");
        el.className = "sticker " + t[1];
        el.textContent = t[0];
        el.setAttribute("tabindex", "0");
        el.setAttribute("data-cursor-label", "тяни");
        stickers.push(el);
      });
  

  
      stickers.forEach(function (el) {
        var rot = (Math.random() * 16 - 8).toFixed(1) + "deg";
        el.style.setProperty("--rot", rot);
        el.style.left = "0";
        el.style.top = "0";
        box.appendChild(el);
      });
    }
  
    /* ——— статичная россыпь ——— */
    function staticLayout() {
      box.classList.add("is-static");
      stickers.forEach(function (s) { s.style.display = "none"; });
      if (fallbackEl) {
        fallbackEl.hidden = false;
        fallbackEl.innerHTML = "";
        stickers.forEach(function (s) {
          var clone = s.cloneNode(true);
          clone.style.cssText = "";
          fallbackEl.appendChild(clone);
        });
      }
      if (gravityBtn) gravityBtn.style.display = "none";
      if (shakeBtn) shakeBtn.style.display = "none";
    }
  
    function unstatic() {
      box.classList.remove("is-static");
      stickers.forEach(function (s) { s.style.display = ""; });
      if (fallbackEl) { fallbackEl.hidden = true; fallbackEl.innerHTML = ""; }
    }
  
    function afterLayout(cb) {
      requestAnimationFrame(function () { requestAnimationFrame(cb); });
    }
  
    /* ——— Matter ——— */
    function initMatter() {
      if (!hasMatter()) { staticLayout(); return false; }
      MatterNS = window.Matter;
  
      var Engine = MatterNS.Engine;
      var Runner = MatterNS.Runner;
      var Bodies = MatterNS.Bodies;
      var Composite = MatterNS.Composite;
      var Body = MatterNS.Body;
      var Events = MatterNS.Events;
  
      engine = Engine.create();
      engine.gravity.y = 1;
      world = engine.world;
      runner = Runner.create();
      running = false;
  
      var boundBodies = [];
  
      function resetBounds() {
        if (!world) return;
        if (boundBodies && boundBodies.length) {
          boundBodies.forEach(function (b) {
            try { Composite.remove(world, b); } catch (e) {}
          });
        }
        boundBodies = [];
  
        var W = Math.max(1, box.clientWidth);
        var H = Math.max(1, box.clientHeight);
        var t = 60;
        
        // ИСПРАВЛЕНО: подняли потолок
        boundBodies.push(
          Bodies.rectangle(W / 2, -800, W * 3, t, { isStatic: true }),
          Bodies.rectangle(W / 2, H + t / 2, W * 3, t, { isStatic: true }), 
          Bodies.rectangle(-t / 2, H / 2, t, H * 3, { isStatic: true }), 
          Bodies.rectangle(W + t / 2, H / 2, t, H * 3, { isStatic: true }) 
        );
        Composite.add(world, boundBodies);
      }
  
      function createBodies() {
        var W = Math.max(1, box.clientWidth);
        var fallbackW = 120;
        var fallbackH = 44;
  
        stickers.forEach(function (el) {
          var r = el.getBoundingClientRect();
          var w = r.width  > 1 ? r.width  : fallbackW;
          var h = r.height > 1 ? r.height : fallbackH;
  
          var x = Math.random() * Math.max(80, W - 160) + 80;
          var y = -80 - Math.random() * 300;
  
          var b = Bodies.rectangle(x, y, w, h, {
            restitution: 0.4,
            friction: 0.3,
            frictionAir: 0.012,
            density: 0.001 + h * 0.00001
          });
          Body.setAngle(b, (Math.random() * 16 - 8) * Math.PI / 180);
          b._w = w;
          b._h = h;
          Composite.add(world, b);
          el._body = b;
        });
      }
  
      resetBounds();
      createBodies();
  
      /* ——— перетаскивание ——— */
      function pointerDown(e) {
        var t = e.target.closest(".sticker");
        if (!t || !t._body) return;
  
        // Запускаем гироскоп по первому касанию, если еще не запущен
        if (isTouch() && !gyroEnabled) {
            requestGyro();
        }
  
        e.preventDefault();
        try { t.setPointerCapture(e.pointerId); } catch (err) {}
        Body.setStatic(t._body, true);
        drag = {
          el: t, body: t._body,
          ox: e.clientX, oy: e.clientY,
          bx: t._body.position.x, by: t._body.position.y,
          lastX: e.clientX, lastY: e.clientY,
          vx: 0, vy: 0,
          moved: false, t: Date.now()
        };
        if (!running) start();
      }
      
      function pointerMove(e) {
        if (!drag) return;
        var dx = e.clientX - drag.ox;
        var dy = e.clientY - drag.oy;
        if (Math.abs(dx) + Math.abs(dy) > 3) drag.moved = true;
        Body.setPosition(drag.body, { x: drag.bx + dx, y: drag.by + dy });
        drag.vx = e.clientX - drag.lastX;
        drag.vy = e.clientY - drag.lastY;
        drag.lastX = e.clientX;
        drag.lastY = e.clientY;
      }
      
      function pointerUp() {
        if (!drag) return;
        Body.setStatic(drag.body, false);
        if (!drag.moved && Date.now() - drag.t < 300) {
          Body.setVelocity(drag.body, { x: 0, y: -12 });
        } else {
          Body.setVelocity(drag.body, { x: drag.vx * 0.6, y: drag.vy * 0.6 });
        }
        drag = null;
      }
  
      box.addEventListener("pointerdown", pointerDown, { passive: false });
      box.addEventListener("pointermove", pointerMove, { passive: false });
      box.addEventListener("pointerup", pointerUp);
      box.addEventListener("pointercancel", pointerUp);
  
      /* ——— клавиатура ——— */
      function keyDown(e) {
        var t = e.target.closest(".sticker");
        if (!t || !t._body) return;
        var b = t._body;
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          Body.setVelocity(b, { x: 0, y: -12 });
          return;
        }
        var step = 16;
        var dx = 0, dy = 0;
        if (e.key === "ArrowLeft")  dx = -step;
        if (e.key === "ArrowRight") dx =  step;
        if (e.key === "ArrowUp")    dy = -step;
        if (e.key === "ArrowDown")  dy =  step;
        if (dx || dy) {
          e.preventDefault();
          Body.setPosition(b, { x: b.position.x + dx, y: b.position.y + dy });
        }
      }
      box.addEventListener("keydown", keyDown);
  
      /* ——— синхронизация DOM → body ——— */
      function sync() {
        stickers.forEach(function (el) {
          if (!el._body) return;
          var b = el._body;
          el.style.transform =
            "translate(" + (b.position.x - b._w / 2) + "px," +
                          (b.position.y - b._h / 2) + "px) " +
            "rotate(" + b.angle + "rad)";
        });
      }
      Events.on(engine, "afterUpdate", sync);
  
      /* ——— старт / стоп ——— */
      function start() {
        if (!runner || running) return;
        Runner.run(runner, engine);
        running = true;
        sync();
      }
      function stop() {
        if (!runner || !running) return;
        Runner.stop(runner);
        running = false;
      }
  
      /* ——— видимость ——— */
      if ("IntersectionObserver" in window) {
        io = new IntersectionObserver(function (entries) {
          entries.forEach(function (en) {
            if (en.isIntersecting) start();
            else stop();
          });
        }, { threshold: 0.01 });
        io.observe(box);
      } else {
        start();
      }
  
      /* ——— resize / visibility ——— */
      function onResize() {
        if (!world) return;
        resetBounds();
        var W2 = Math.max(1, box.clientWidth);
        stickers.forEach(function (el) {
          if (!el._body) return;
          var pos = el._body.position;
          var x = Math.max(40, Math.min(W2 - 40, pos.x));
          Body.setPosition(el._body, { x: x, y: pos.y });
        });
      }
      var resizeHandler = function () {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(onResize, 150);
      };
      window.addEventListener("resize", resizeHandler, { passive: true });
  
      function onVisibility() {
        if (!world) return;
        if (document.hidden) stop();
        else if (box && box.getBoundingClientRect().top < window.innerHeight) start();
      }
      document.addEventListener("visibilitychange", onVisibility);
  
      /* ——— гироскоп / наклоны ——— */
      function orientationAngle() {
        if (screen && screen.orientation && typeof screen.orientation.angle === "number") {
          return screen.orientation.angle;
        }
        if (typeof window.orientation === "number") return window.orientation;
        return 0;
      }
  
      function rotation(beta, gamma, angle) {
        var dx = Math.sin((gamma || 0) * Math.PI / 180);
        var dy = Math.sin((beta  || 0) * Math.PI / 180);
        var a = ((angle % 360) + 360) % 360;
        if (a === 90)  return { x:  dy, y: -dx };
        if (a === 180) return { x: -dx, y: -dy };
        if (a === 270) return { x: -dy, y:  dx };
        return { x: dx, y: dy };
      }
  
      function installOrientation() {
        if (orientationListener) return;
        orientationListener = function (e) {
          var v = rotation(e.beta, e.gamma, orientationAngle());
          var magnitude = Math.sqrt(v.x * v.x + v.y * v.y);
          if (magnitude < 0.05) {
            gyro.x += (0 - gyro.x) * 0.15;
            gyro.y += (0.3 - gyro.y) * 0.15;
          } else {
            gyro.x += (v.x - gyro.x) * 0.15;
            gyro.y += (v.y - gyro.y) * 0.15;
          }
          
          // Увеличено влияние гравитации
          engine.gravity.x = gyro.x * 2.5;
          engine.gravity.y = gyro.y * 2.5;
          
          if (!running) start();
        };
        window.addEventListener("deviceorientation", orientationListener, { passive: true });
  
        motionListener = function (e) {
          var a = e.accelerationIncludingGravity;
          if (!a) return;
          var mag = Math.sqrt(a.x * a.x + a.y * a.y + a.z * a.z);
          var now = Date.now();
          if (mag > 18 && now - lastShake > 800) {
            lastShake = now;
            stickers.forEach(function (el) {
              if (!el._body) return;
              Body.setVelocity(el._body, {
                x: (Math.random() - 0.5) * 12,
                y: -Math.random() * 12
              });
            });
          }
        };
        window.addEventListener("devicemotion", motionListener, { passive: true });
      }
  
      function uninstallOrientation() {
        if (orientationListener) {
          window.removeEventListener("deviceorientation", orientationListener);
          orientationListener = null;
        }
        if (motionListener) {
          window.removeEventListener("devicemotion", motionListener);
          motionListener = null;
        }
        if (engine) { engine.gravity.x = 0; engine.gravity.y = 1; }
      }
  
      function enableGyro(persist) {
        gyroEnabled = true;
        installOrientation();
        if (gravityBtn) {
          gravityBtn.textContent = "Гравитация: вкл";
          gravityBtn.setAttribute("aria-pressed", "true");
        }
        if (persist) { try { localStorage.setItem("art:gyro", "1"); } catch (e) {} }
      }
  
      function disableGyro() {
        gyroEnabled = false;
        uninstallOrientation();
        if (gravityBtn) {
          gravityBtn.textContent = "Гравитация: выкл";
          gravityBtn.setAttribute("aria-pressed", "false");
        }
        try { localStorage.setItem("art:gyro", "0"); } catch (e) {}
      }
  
      function requestGyro() {
        if (typeof DeviceOrientationEvent !== "undefined" &&
            typeof DeviceOrientationEvent.requestPermission === "function") {
          DeviceOrientationEvent.requestPermission()
            .then(function (r) { if (r === "granted") enableGyro(true); })
            .catch(function () {});
        } else {
          enableGyro(true);
        }
      }
  
      /* ——— кнопки ——— */
      if (gravityBtn) {
        if (isTouch() && ART.env && ART.env.state.hasGyro) {
          // Мы скрываем кнопку гравитации, так как запускаем ее автоматически по клику на стикер
          gravityBtn.style.display = "none";
          try {
            if (localStorage.getItem("art:gyro") === "1") enableGyro(false);
          } catch (e) {}
        } else {
          gravityBtn.style.display = "none";
        }
      }
  
      if (shakeBtn) {
        if (!isTouch()) {
          shakeBtn.style.display = "";
          shakeBtn.onclick = function () {
            stickers.forEach(function (el) {
              if (!el._body) return;
              Body.setVelocity(el._body, {
                x: (Math.random() - 0.5) * 14,
                y: -Math.random() * 12
              });
            });
            if (!running) start();
          };
        } else {
          shakeBtn.style.display = "none";
        }
      }
  
      boundHandlers = {
        down: pointerDown,
        move: pointerMove,
        up: pointerUp,
        key: keyDown,
        resize: resizeHandler,
        visibility: onVisibility
      };
  
      return true;
    }
  
    function teardownMatter() {
      if (io) { io.disconnect(); io = null; }
  
      if (box && boundHandlers) {
        box.removeEventListener("pointerdown", boundHandlers.down);
        box.removeEventListener("pointermove", boundHandlers.move);
        box.removeEventListener("pointerup", boundHandlers.up);
        box.removeEventListener("pointercancel", boundHandlers.up);
        box.removeEventListener("keydown", boundHandlers.key);
      }
      if (boundHandlers) {
        if (boundHandlers.resize) window.removeEventListener("resize", boundHandlers.resize);
        if (boundHandlers.visibility) document.removeEventListener("visibilitychange", boundHandlers.visibility);
      }
      boundHandlers = null;
  
      if (gravityBtn) gravityBtn.onclick = null;
      if (shakeBtn) shakeBtn.onclick = null;
  
      if (runner && MatterNS) { try { MatterNS.Runner.stop(runner); } catch (e) {} }
      if (engine && MatterNS) { try { MatterNS.Engine.clear(engine); } catch (e) {} }
      engine = null; runner = null; world = null;
      running = false;
      stickers.forEach(function (el) { el._body = null; });
    }
  
    function rebuild() {
      teardownMatter();
      unstatic();
      if (!mounted) return;
  
      if (reduced() || !hasMatter()) {
        staticLayout();
        return;
      }
  
      afterLayout(function () {
        if (!mounted) return;
        initMatter();
      });
    }
  
    function onEnv() {
      rebuild();
    }
  
    ART.features.sandbox = {
      name: "sandbox",
      mount: function (root) {
        box = root.getElementById("sandbox");
        fallbackEl = root.getElementById("sandboxFallback");
        hintEl = root.getElementById("sandboxHint");
        railEl = box ? box.querySelector(".sandbox__scroll-rail") : null;
        gravityBtn = root.getElementById("sandboxGravity");
        shakeBtn = root.getElementById("sandboxShake");
        if (!box) return;
  
        mounted = true;
  
        buildStickers();
        rebuild();
  
        window.addEventListener("art:env", onEnv);
      },
      destroy: function () {
        window.removeEventListener("art:env", onEnv);
        mounted = false;
        teardownMatter();
        stickers.forEach(function (s) { if (s.parentNode) s.parentNode.removeChild(s); });
        stickers = [];
      }
    };
  })();