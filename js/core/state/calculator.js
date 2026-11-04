(function () {
function find(list, id) {
    for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i];
    return null;
}

ART.state.calculator = {
    initialState: function (pricing) {
    return {
        serviceId: null,
        options: {},
        urgencyId: pricing.urgency[0].id
    };
    },

    selectService: function (state, pricing, id) {
    var svc = find(pricing.services, id);
    if (!svc) return state;
    var options = {};
    svc.options.forEach(function (o) {
        if (o.type === "toggle") options[o.id] = false;
        else if (o.type === "counter") options[o.id] = o.min;
        else if (o.type === "select") options[o.id] = o.choices[0].id;
    });
    return { serviceId: id, options: options, urgencyId: state.urgencyId };
    },

    setOption: function (state, optId, value) {
    var options = Object.assign({}, state.options);
    options[optId] = value;
    return Object.assign({}, state, { options: options });
    },

    setUrgency: function (state, id) {
    return Object.assign({}, state, { urgencyId: id });
    },

    compute: function (state, pricing) {
    var svc = state.serviceId && find(pricing.services, state.serviceId);
    if (!svc) return { ok: false, reason: "no-service" };

    var sum = svc.basePrice;
    var days = svc.baseDays;
    var lines = [{ label: svc.name, price: svc.basePrice }];

    svc.options.forEach(function (o) {
        var val = state.options[o.id];
        if (o.type === "toggle" && val) {
        sum += o.price; days += o.days;
        lines.push({ label: o.name, price: o.price });
        } else if (o.type === "counter" && val != null) {
        var add = o.price * val;
        sum += add; days += o.days * val;
        lines.push({ label: o.name + " ×" + val, price: add });
        } else if (o.type === "select") {
        var ch = find(o.choices, val);
        if (ch) {
            sum += ch.price; days += ch.days;
            lines.push({ label: o.name + ": " + ch.name, price: ch.price });
        }
        }
    });

    var u = find(pricing.urgency, state.urgencyId) || pricing.urgency[0];
    var total = sum * u.priceMult;
    var high = total * (1 + pricing.spread);
    var d1 = Math.max(1, Math.round(days * u.daysMult));
    var d2 = Math.max(d1, Math.round(d1 * (1 + pricing.spread)));

    return {
        ok: true,
        total: total,
        high: high,
        days: d1,
        highDays: d2,
        lines: lines,
        urgencyName: u.name,
        serviceName: svc.name
    };
    }
};
})();