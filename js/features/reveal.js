/* Появление блоков. GSAP+motionTier=full: сдвиг 16–24px.
   lite: сдвиг 12px. reduced: сразу видимо. Без GSAP: сразу видимо. */
   (function () {
    var stInstances = [];
  
    function mount() {
      var reduce = ART.motion.reduced;
      var els = Array.prototype.slice.call(document.querySelectorAll(
        ".section-head, .work-card, .service-row, .process-step, .team-card, .review-card, .calc-steps, .contacts__grid"
      ));
  
      if (reduce || !ART.motion.gsap || !ART.motion.ScrollTrigger) {
        els.forEach(function (el) { el.style.opacity = 1; });
        return;
      }
  
      var tierFull = ART.motion.tier === "full";
      var shift = tierFull ? 20 : 12;
  
      els.forEach(function (el) {
        if (el.dataset.revealBound) return;
        el.dataset.revealBound = "1";
        el.style.opacity = 0;
        var st = ART.motion.gsap.fromTo(el,
          { y: shift, opacity: 0 },
          {
            y: 0, opacity: 1, duration: tierFull ? 0.6 : 0.45, ease: "power2.out",
            scrollTrigger: { trigger: el, start: "top 88%", once: true }
          }
        );
        stInstances.push(st);
      });
    }
  
    ART.features.reveal = {
      name: "reveal",
      mount: function (root) {
        /* Hero-строки — отдельный таймлайн, чтобы "торкало" сразу */
        var heroTitle = root.querySelector("[data-reveal-words]");
        if (heroTitle && ART.motion.gsap && !ART.motion.reduced) {
          var lines = heroTitle.querySelectorAll(".hero__line");
          if (lines.length) {
            var tl = ART.motion.timeline({ delay: 0.1 });
            if (tl) tl.from(lines, { y: 24, opacity: 0, duration: 0.7, ease: "power3.out", stagger: 0.08 });
          }
        }
        mount();
      },
      destroy: function () {
        stInstances.forEach(function (st) {
          try { if (st && st.kill) st.kill(); } catch (e) { /* noop */ }
        });
        stInstances = [];
      }
    };
  })();