/* Мини-стор: get/set/subscribe. Без Proxy, без магии. */
(function () {
    ART.state.store = {
      create: function (initial) {
        var current = initial;
        var subs = [];
  
        function notify() {
          subs.slice().forEach(function (fn) {
            try { fn(current); } catch (e) { console.warn("[store]", e); }
          });
        }
  
        return {
          get: function () { return current; },
          set: function (next) {
            current = next;
            notify();
          },
          update: function (fn) {
            current = fn(current);
            notify();
          },
          subscribe: function (fn) {
            subs.push(fn);
            try { fn(current); } catch (e) { /* noop */ }
            return function () {
              var i = subs.indexOf(fn);
              if (i > -1) subs.splice(i, 1);
            };
          }
        };
      }
    };
  })();