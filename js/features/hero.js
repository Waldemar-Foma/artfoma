/* HERO: рендер из ART_DATA.hero, появление, параллакс, дрейф, клики превью.
   Работает с разметкой из index.html: .hero__panel > .hero__content,
   .hero__previews (7 кнопок data-pos), .hero__proof, .hero__partners. */
   (function () {
    var DATA = null;
    var section, previewsEl, titleEl, tagEl, subtitleEl, ctaPrimary, ctaSecondary;
    var previewEls = [];
    var observer = null;
    var visible = true;
    var rafId = 0;
    var mx = 0, my = 0, tx = 0, ty = 0;
    var caseById = {};
  
    function isReduced() { return !!(ART.env && ART.env.state.reducedMotion); }
    function isFull() { return !!(ART.env && ART.env.state.motionTier === "full"); }
    function isMouse() { return !!(ART.env && ART.env.state.input === "mouse"); }
  
    /* ——— рендер из данных ——— */
    function shapeForBg(bg) {
      if (bg === "butter-soft") {
        return '<svg class="hero-preview__shape" viewBox="0 0 100 100" aria-hidden="true"><path d="M50 4l13 32 34 2-26 22 8 33-29-20-29 20 8-33L3 38l34-2z" fill="var(--butter)"/></svg>';
      }
      if (bg === "pine-mist") {
        return '<svg class="hero-preview__shape" viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="34" fill="var(--pine)"/></svg>';
      }
      if (bg === "ink") {
        return '<svg class="hero-preview__shape" viewBox="0 0 100 100" aria-hidden="true"><path d="M20 70 C 40 20, 70 20, 85 60" fill="none" stroke="var(--butter)" stroke-width="10" stroke-linecap="round"/></svg>';
      }
      return '<svg class="hero-preview__shape" viewBox="0 0 100 100" aria-hidden="true"><path d="M50 10 L60 40 L90 50 L60 60 L50 90 L40 60 L10 50 L40 40 Z" fill="var(--pine-mist)"/></svg>';
    }
  
    function renderPreviews() {
      if (!previewsEl) return;
      var list = DATA.previews.slice(0, 7);
      var bgs = ["pine-mist", "butter-soft", "snow", "pine-mist", "ink", "butter-soft", "snow"];
      previewEls = [];
      previewsEl.innerHTML = "";
      list.forEach(function (caseId, i) {
        var c = caseById[caseId];
        var bg = (c && c.bg)
          ? (c.bg === "pine" || c.bg === "ink"
              ? "ink"
              : (c.bg === "butter-soft"
                  ? "butter-soft"
                  : (c.bg === "snow" ? "snow" : "pine-mist")))
          : bgs[i % bgs.length];
        var btn = document.createElement("button");
        btn.type = "button";
        btn.className = "hero-preview";
        btn.setAttribute("data-bg", bg);
        btn.setAttribute("data-pos", String(i + 1));
        btn.setAttribute("aria-label", "Открыть кейс: " + (c ? c.title : caseId));
        btn.innerHTML =
          '<span class="hero-preview__inner">' + shapeForBg(bg) + '</span>' +
          '<span class="hero-preview__badge">смотреть</span>';
        btn.addEventListener("click", function () {
          ART.bus.emit("works:open-case", { id: caseId });
        });
        previewsEl.appendChild(btn);
        previewEls.push(btn);
      });
    }
  
    function renderHeadline() {
      if (!titleEl || !DATA.headline) return;
      var parts = DATA.headline;
  
      /* Разбиваем на строки: если 4 части — [0], [1], [2,3]. Иначе по одной. */
      var lines = parts.length === 4
        ? [[parts[0]], [parts[1]], [parts[2], parts[3]]]
        : parts.map(function (p) { return [p]; });
  
      var html = "";
      lines.forEach(function (line) {
        html += '<span class="hero__line">';
        line.forEach(function (part) {
          if (part.text) {
            part.text.split(" ").forEach(function (w) {
              html += '<span class="hero__word">' + w + '</span>';
            });
          } else if (part.pill === "star") {
            html += '<span class="hero__pill" aria-hidden="true">' +
                      '<svg viewBox="0 0 100 100"><path d="M50 6l12 32 34 2-26 22 8 33-29-20-29 20 8-33L3 40l34-2z" fill="var(--pine)"/></svg>' +
                    '</span>';
          } else if (part.mark) {
            html += '<span class="hero__word hero__mark">' + part.mark + '</span>';
          }
        });
        html += '</span>';
      });
      titleEl.innerHTML = html;
    }
  
    function renderAll() {
      if (!DATA) return;
      if (tagEl) tagEl.textContent = DATA.tag || "";
      if (subtitleEl) subtitleEl.textContent = DATA.subtitle || "";
      if (ctaPrimary) ctaPrimary.textContent = (DATA.cta && DATA.cta.primary) || "Обсудить проект";
      if (ctaSecondary) {
        var label = (DATA.cta && DATA.cta.secondary) || "Посчитать стоимость";
        ctaSecondary.innerHTML =
          '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">' +
            '<path d="M8 5v14l11-7z" fill="currentColor"/>' +
          '</svg>' + label;
      }
      renderHeadline();
      renderPreviews();
    }
  
    /* ——— анимация загрузки ——— */
    function runIntro() {
      var html = document.documentElement;
      if (html.classList.contains("is-ready")) return;
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          html.classList.add("is-ready");
        });
      });
    }
  
    /* ——— параллакс и курсор ——— */
    function applyParallax() {
      rafId = 0;
      if (!section || !visible) return;
      var env = ART.env && ART.env.state;
      if (!env || env.reducedMotion) return;
  
      if (isFull() && isMouse()) {
        tx += (mx - tx) * 0.08;
        ty += (my - ty) * 0.08;
        section.style.setProperty("--px", (-tx * 14).toFixed(2));
        section.style.setProperty("--py", (-ty * 14).toFixed(2));
      } else {
        tx += (0 - tx) * 0.08;
        ty += (0 - ty) * 0.08;
        section.style.setProperty("--px", "0");
        section.style.setProperty("--py", "0");
      }
  
      if (isFull() && isMouse() && (Math.abs(tx) > 0.001 || Math.abs(ty) > 0.001)) {
        rafId = requestAnimationFrame(applyParallax);
      }
    }
  
    function onMouseMove(e) {
      if (!isFull() || !isMouse()) return;
      var rect = section.getBoundingClientRect();
      var cx = rect.left + rect.width / 2;
      var cy = rect.top + rect.height / 2;
      mx = (e.clientX - cx) / (rect.width / 2);
      my = (e.clientY - cy) / (rect.height / 2);
      if (!rafId) rafId = requestAnimationFrame(applyParallax);
    }
  
    function onScroll() {
      if (!rafId) rafId = requestAnimationFrame(applyParallax);
    }
  
    function stopMotion() {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = 0;
    }
  
    /* ——— видимость ——— */
    function setupVisibility() {
      if (!("IntersectionObserver" in window)) return;
      observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          visible = en.isIntersecting;
          if (section) section.classList.toggle("is-paused", !visible);
          if (visible) {
            if (!rafId) rafId = requestAnimationFrame(applyParallax);
          } else {
            stopMotion();
          }
        });
      }, { threshold: 0.01 });
      observer.observe(section);
    }
  
    function onVisibilityChange() {
      if (document.hidden) stopMotion();
      else if (visible) { if (!rafId) rafId = requestAnimationFrame(applyParallax); }
    }
  
    /* ——— реакция на art:env ——— */
    function onEnv() {
      if (!section) return;
      var env = ART.env && ART.env.state;
      if (!env) return;
      section.setAttribute("data-tier", env.motionTier);
  
      if (env.reducedMotion || env.input !== "mouse") {
        section.style.setProperty("--px", "0");
        section.style.setProperty("--py", "0");
        window.removeEventListener("mousemove", onMouseMove);
      } else if (env.motionTier === "full") {
        window.addEventListener("mousemove", onMouseMove, { passive: true });
      } else {
        window.removeEventListener("mousemove", onMouseMove);
      }
  
      if (!rafId) rafId = requestAnimationFrame(applyParallax);
    }
  
    /* ——— публичное API ——— */
    ART.features.hero = {
      name: "hero",
      mount: function (root) {
        DATA = window.ART_DATA && window.ART_DATA.hero;
        if (!DATA) {
          console.warn("[ART.hero] Нет ART_DATA.hero");
          return;
        }
  
        section      = root.getElementById("hero");
        previewsEl   = root.getElementById("heroPreviews");
        titleEl      = root.getElementById("heroTitle");
        tagEl        = root.querySelector("[data-hero-tag]");
        subtitleEl   = root.querySelector("[data-hero-subtitle]");
        ctaPrimary   = root.querySelector("[data-hero-cta-primary]");
        ctaSecondary = root.querySelector("[data-hero-cta-secondary]");
        if (!section || !titleEl) return;
  
        /* Карта кейсов */
        (window.ART_DATA.cases || []).forEach(function (c) { caseById[c.id] = c; });
  
        document.documentElement.classList.add("js");
        renderAll();
        runIntro();
        setupVisibility();
  
        window.addEventListener("scroll", onScroll, { passive: true });
        document.addEventListener("visibilitychange", onVisibilityChange);
        window.addEventListener("art:env", onEnv);
        onEnv();
  
        if (!rafId) rafId = requestAnimationFrame(applyParallax);
      },
      destroy: function () {
        window.removeEventListener("mousemove", onMouseMove);
        window.removeEventListener("scroll", onScroll);
        document.removeEventListener("visibilitychange", onVisibilityChange);
        window.removeEventListener("art:env", onEnv);
        if (observer) { observer.disconnect(); observer = null; }
        stopMotion();
        previewEls = [];
        section = previewsEl = titleEl = null;
        tagEl = subtitleEl = ctaPrimary = ctaSecondary = null;
      }
    };
  })();