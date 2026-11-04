/* WORKS: рендер кейсов из ART_DATA.cases + модалка кейса.
   Подписки:
   — клик по карточке открывает модалку;
   — событие 'works:open-case' (шлёт hero и другие секции) открывает модалку по id.
   Модалка: снизу выезжает, Esc / клик вне / крестик закрывают, фокус заперт. */
   (function () {
    var data = [];
    var byId = {};
    var grid = null;
    var modal = null;
    var untrap = null;
    var unsubOpen = null;
    var lastFocus = null;
    var isOpen = false;
    var currentIdx = -1;
  
    function phClassForBg(bg) {
      if (bg === "ink") return "ph--ink";
      if (bg === "pine") return "ph--pine-mist";
      if (bg === "pine-mist") return "ph--pine-mist";
      if (bg === "butter-soft") return "ph--butter-soft";
      if (bg === "butter") return "ph--butter";
      if (bg === "snow") return "ph--snow";
      return "ph--snow";
    }
  
    function buildModal(root) {
      if (modal) return;
      modal = document.createElement("div");
      modal.className = "case-modal";
      modal.setAttribute("role", "dialog");
      modal.setAttribute("aria-modal", "true");
      modal.setAttribute("aria-label", "Кейс");
      modal.innerHTML =
        '<div class="case-modal__inner">' +
          '<button type="button" class="case-modal__close" aria-label="Закрыть кейс">✕</button>' +
          '<div class="case-modal__body"></div>' +
        '</div>';
      root.body.appendChild(modal);
  
      modal.addEventListener("click", function (e) {
        if (e.target === modal) closeCase();
      });
      modal.querySelector(".case-modal__close").addEventListener("click", closeCase);
    }
  
    function renderCase(i) {
      if (!modal) return;
      var c = data[i];
      if (!c) return;
      currentIdx = i;
  
      var body = modal.querySelector(".case-modal__body");
      var tags = (c.tags || []).map(function (t) {
        return '<span class="case-modal__tag">#' + t + '</span>';
      }).join("");
  
      body.innerHTML =
        '<div class="case-modal__cover ph ' + phClassForBg(c.bg) + '"></div>' +
        '<h3 class="case-modal__title">' + c.title + '</h3>' +
        '<p class="case-modal__text"><strong>Задача:</strong> ' + c.task + '</p>' +
        '<p class="case-modal__text"><strong>Результат:</strong> ' + c.result + '</p>' +
        '<div class="case-modal__tags">' + tags + '</div>' +
        '<blockquote class="case-modal__quote">' + c.quote +
          '<br><small>' + c.author + '</small>' +
        '</blockquote>' +
        '<div class="case-modal__actions">' +
          '<button type="button" class="btn btn--primary" data-next>Следующий кейс</button>' +
          '<a class="btn btn--primary" href="#contacts" data-cta>Обсудить такой же проект</a>' +
        '</div>';
  
      body.querySelector("[data-next]").addEventListener("click", function () {
        openCase((i + 1) % data.length);
      });
      body.querySelector("[data-cta]").addEventListener("click", function (e) {
        e.preventDefault();
        closeCase();
        setTimeout(function () {
          if (ART.scroll && ART.scroll.to) ART.scroll.to("#contacts");
        }, 200);
      });
    }
  
    function openCase(i) {
      if (!modal || !data[i]) return;
  
      lastFocus = document.activeElement;
      renderCase(i);
  
      modal.classList.add("is-open");
      document.body.classList.add("has-modal");
      if (ART.dom && ART.dom.lockScroll) ART.dom.lockScroll();
      isOpen = true;
  
      /* Фокус-трап: Esc закрывает, Tab ходит по модалке */
      if (ART.dom && ART.dom.trapFocus) {
        untrap = ART.dom.trapFocus(modal, closeCase);
      } else {
        /* Фолбэк, если core/dom.js не подключён */
        untrap = function () {};
        document.addEventListener("keydown", escHandler, true);
      }
  
      var closeBtn = modal.querySelector(".case-modal__close");
      if (closeBtn) closeBtn.focus();
  
      ART.bus.emit("case:opened", { id: data[i].id, index: i });
    }
  
    function openCaseById(id) {
      if (!id) return;
      var idx = -1;
      for (var i = 0; i < data.length; i++) {
        if (data[i].id === id) { idx = i; break; }
      }
      if (idx > -1) openCase(idx);
    }
  
    function escHandler(e) {
      if (e.key === "Escape" && isOpen) {
        e.preventDefault();
        closeCase();
      }
    }
  
    function closeCase() {
      if (!modal || !isOpen) return;
  
      modal.classList.remove("is-open");
      document.body.classList.remove("has-modal");
      if (ART.dom && ART.dom.unlockScroll) ART.dom.unlockScroll();
      isOpen = false;
  
      if (untrap) {
        try { untrap(); } catch (e) { /* noop */ }
        untrap = null;
      }
      document.removeEventListener("keydown", escHandler, true);
  
      if (lastFocus && lastFocus.focus) {
        try { lastFocus.focus(); } catch (e) { /* noop */ }
      }
      lastFocus = null;
  
      var closedId = currentIdx > -1 && data[currentIdx] ? data[currentIdx].id : null;
      currentIdx = -1;
      ART.bus.emit("case:closed", { id: closedId });
    }
  
    function renderGrid() {
      if (!grid) return;
      grid.innerHTML = "";
  
      data.forEach(function (c, i) {
        var card = document.createElement("article");
        card.className = "work-card work-card--" + (c.size || "med");
        card.setAttribute("data-bg", c.bg || "snow");
        card.setAttribute("data-cursor-label", "смотреть");
        card.setAttribute("tabindex", "0");
        card.setAttribute("role", "button");
        card.setAttribute("aria-label", "Открыть кейс: " + c.title);
  
        card.innerHTML =
          '<span class="work-card__num">' + (c.num || ("0" + (i + 1))) + '</span>' +
          '<span class="work-card__title">' + c.title + '</span>' +
          '<span class="work-card__arrow" aria-hidden="true">↗</span>';
  
        card.addEventListener("click", function () { openCase(i); });
        card.addEventListener("keydown", function (e) {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            openCase(i);
          }
        });
  
        grid.appendChild(card);
      });
    }
  
    function bindBus() {
      /* Клики по превью в hero и любые другие вызовы «открой кейс id» */
      unsubOpen = ART.bus.on("works:open-case", function (payload) {
        if (!payload || !payload.id) return;
        openCaseById(payload.id);
      });
    }
  
    function unbindBus() {
      if (unsubOpen) {
        unsubOpen();
        unsubOpen = null;
      }
    }
  
    ART.features.works = {
      name: "works",
      mount: function (root) {
        grid = root.getElementById("worksGrid");
        if (!grid) return;
  
        data = (window.ART_DATA && window.ART_DATA.cases) || [];
        byId = {};
        data.forEach(function (c) { byId[c.id] = c; });
  
        renderGrid();
        buildModal(root);
        bindBus();
      },
      destroy: function () {
        unbindBus();
        document.removeEventListener("keydown", escHandler, true);
        if (untrap) {
          try { untrap(); } catch (e) { /* noop */ }
          untrap = null;
        }
        if (modal && modal.parentNode) modal.parentNode.removeChild(modal);
        modal = null;
        isOpen = false;
        currentIdx = -1;
        lastFocus = null;
        grid = null;
        data = [];
        byId = {};
      }
    };
  })();