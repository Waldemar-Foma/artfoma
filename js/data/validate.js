/* Проверка схемы данных. Пишет проблемы в консоль, не бросает исключений. */
(function () {
    ART.data = ART.data || {};
  
    ART.data.validate = function () {
      var D = window.ART_DATA || {};
      var errors = [];
  
      if (!D.pricing) {
        errors.push("ART_DATA.pricing отсутствует");
      } else {
        var P = D.pricing;
        if (typeof P.currency !== "string") errors.push("pricing.currency должен быть строкой");
        if (typeof P.spread !== "number") errors.push("pricing.spread должен быть числом");
        if (!Array.isArray(P.urgency) || !P.urgency.length) errors.push("pricing.urgency должен быть непустым массивом");
        if (!Array.isArray(P.services) || !P.services.length) errors.push("pricing.services должен быть непустым массивом");
  
        (P.services || []).forEach(function (s, i) {
          var p = "services[" + i + "]";
          if (!s.id) errors.push(p + ".id пуст");
          if (typeof s.basePrice !== "number") errors.push(p + ".basePrice не число");
          if (typeof s.baseDays !== "number") errors.push(p + ".baseDays не число");
          (s.options || []).forEach(function (o, j) {
            var op = p + ".options[" + j + "]";
            if (!o.id) errors.push(op + ".id пуст");
            if (["toggle", "counter", "select"].indexOf(o.type) === -1) {
              errors.push(op + ".type неизвестен: " + o.type);
            }
            if (o.type === "counter") {
              if (typeof o.min !== "number" || typeof o.max !== "number") {
                errors.push(op + " counter требует min/max");
              }
            }
            if (o.type === "select" && (!Array.isArray(o.choices) || !o.choices.length)) {
              errors.push(op + " select требует непустой choices");
            }
          });
        });
      }
  
      if (!Array.isArray(D.cases)) errors.push("ART_DATA.cases должен быть массивом");
      if (!Array.isArray(D.reviews)) errors.push("ART_DATA.reviews должен быть массивом");
      if (!Array.isArray(D.team)) errors.push("ART_DATA.team должен быть массивом");
  
      if (errors.length) {
        console.warn("[ART.data] Проблемы в данных:\n— " + errors.join("\n— "));
      }
      return errors;
    };
  })();