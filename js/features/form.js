(function () {
  var FORM_ENDPOINT = "";

  var form, statusEl, submitBtn;
  var unsub = null;

  function setError(name, msg) {
    var input = form.querySelector('[name="' + name + '"]');
    var err = form.querySelector('[data-error-for="' + name + '"]');
    if (input) input.closest(".field").classList.toggle("has-error", !!msg);
    if (err) err.textContent = msg || "";
  }

  function validate(payload) {
    var ok = true;
    if (!payload.name || payload.name.trim().length < 2) {
      setError("name", "Напиши имя — хотя бы пару букв");
      ok = false;
    } else {
      setError("name", "");
    }

    if (!payload.contact || payload.contact.trim().length < 5) {
      setError("contact", "Оставь телефон, Telegram или почту");
      ok = false;
    } else {
      setError("contact", "");
    }

    if (!payload.message || payload.message.trim().length < 10) {
      setError("message", "Пару слов о задаче — и поедем");
      ok = false;
    } else {
      setError("message", "");
    }

    return ok;
  }

  function fallback(payload) {
    var text = encodeURIComponent(
      "Заявка ART.Foma\nИмя: " + payload.name +
      "\nКонтакт: " + payload.contact +
      "\nСообщение: " + payload.message +
      "\nРасчёт: " + payload.calc
    );
    statusEl.innerHTML =
      'Не получилось отправить автоматически. Напиши напрямую: ' +
      '<a href="https://t.me/" target="_blank" rel="noopener">Telegram</a> · ' +
      '<a href="mailto:hello@artfoma.ru?subject=Заявка&body=' + text + '">Почта</a>';
  }

  function onSubmit(e) {
    e.preventDefault();
    if (form.querySelector("#lf-hp").value) return;

    var payload = {
      name: form.name.value,
      contact: form.contact.value,
      message: form.message.value,
      calc: form.calc.value
    };
    if (!validate(payload)) return;

    if (!FORM_ENDPOINT) { fallback(payload); return; }

    submitBtn.disabled = true;
    statusEl.textContent = "Отправляем…";

    fetch(FORM_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify(Object.assign({ _subject: "Заявка с сайта ART.Foma" }, payload))
    })
      .then(function (res) {
        if (!res.ok) throw new Error("bad");
        statusEl.textContent = "Готово! Вернёмся с вопросами в ближайшее время.";
        form.reset();
        ART.bus.emit("form:success", payload);
      })
      .catch(function () {
        fallback(payload);
        ART.bus.emit("form:fallback", payload);
      })
      .finally(function () { submitBtn.disabled = false; });
  }

  ART.features.form = {
    name: "form",
    mount: function (root) {
      form = root.getElementById("leadForm");
      statusEl = root.getElementById("formStatus");
      submitBtn = root.getElementById("leadSubmit");
      if (!form) return;

      form.addEventListener("submit", onSubmit);

      unsub = ART.bus.on("calc:send-to-form", function (p) {
        var hidden = form.querySelector("#lf-calc");
        var msg = form.querySelector('[name="message"]');
        if (hidden) hidden.value = p.text || "";
        if (msg && !msg.value.trim()) msg.value = "Хочу проект. Вот расчёт:\n" + (p.text || "");
      });
    },
    destroy: function () {
      if (form) form.removeEventListener("submit", onSubmit);
      if (unsub) unsub();
    }
  };
})();