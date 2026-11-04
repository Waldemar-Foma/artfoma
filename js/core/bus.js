/* Pub/sub. Ошибка в обработчике ловится и логируется. */
(function () {
    var listeners = Object.create(null);
  
    ART.bus = {
      on: function (event, fn) {
        (listeners[event] || (listeners[event] = [])).push(fn);
        return function () { ART.bus.off(event, fn); };
      },
      once: function (event, fn) {
        var un = ART.bus.on(event, function (p) { un(); fn(p); });
        return un;
      },
      off: function (event, fn) {
        var arr = listeners[event];
        if (!arr) return;
        var i = arr.indexOf(fn);
        if (i > -1) arr.splice(i, 1);
      },
      emit: function (event, payload) {
        var arr = listeners[event];
        if (!arr) return;
        arr.slice().forEach(function (fn) {
          try { fn(payload); } catch (e) { console.warn("[bus] " + event, e); }
        });
      }
    };
  })();