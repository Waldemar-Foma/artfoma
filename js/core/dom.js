/* DOM-утилиты: фокус-трап, блокировка скролла, escape. */
(function () {
    var lockedScrolls = 0;
  
    ART.dom = {
      createEl: function (tag, className, html) {
        var el = document.createElement(tag);
        if (className) el.className = className;
        if (html != null) el.innerHTML = html;
        return el;
      },
  
      lockScroll: function () {
        lockedScrolls++;
        if (lockedScrolls === 1) {
          document.body.style.overflow = "hidden";
        }
      },
      unlockScroll: function () {
        lockedScrolls = Math.max(0, lockedScrolls - 1);
        if (lockedScrolls === 0) {
          document.body.style.overflow = "";
        }
      },
  
      trapFocus: function (root, onEscape) {
        function focusables() {
          return Array.prototype.slice.call(
            root.querySelectorAll(
              'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
            )
          ).filter(function (el) { return el.offsetParent !== null; });
        }
  
        function onKey(e) {
          if (e.key === "Escape" && typeof onEscape === "function") {
            e.preventDefault();
            onEscape();
            return;
          }
          if (e.key !== "Tab") return;
          var f = focusables();
          if (!f.length) return;
          var first = f[0], last = f[f.length - 1];
          if (e.shiftKey && document.activeElement === first) {
            e.preventDefault(); last.focus();
          } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault(); first.focus();
          }
        }
        document.addEventListener("keydown", onKey, true);
        return function () {
          document.removeEventListener("keydown", onKey, true);
        };
      }
    };
  })();