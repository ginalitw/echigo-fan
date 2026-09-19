(function () {
  const IN_AT = Date.parse("2027-07-22T13:00:00+09:00");
  const line = document.getElementById("count-line");
  const units = {
    days: line.querySelector('[data-unit="days"]'),
    hours: line.querySelector('[data-unit="hours"]'),
    mins: line.querySelector('[data-unit="mins"]'),
  };

  function pad(n) {
    return String(n).padStart(2, "0");
  }

  function tick() {
    const diff = IN_AT - Date.now();
    if (diff <= 0) {
      line.textContent = "入住日到了。直接去苗場街上對名單。";
      return;
    }
    const m = Math.floor(diff / 60000);
    units.days.textContent = String(Math.floor(m / 1440));
    units.hours.textContent = pad(Math.floor((m % 1440) / 60));
    units.mins.textContent = pad(m % 60);
  }

  tick();
  setInterval(tick, 30000);

  const nav = document.getElementById("nav");
  const toggle = document.getElementById("nav-toggle");
  const links = [...document.querySelectorAll('.nav-list a[href^="#"]')];

  toggle.addEventListener("click", function () {
    toggle.setAttribute("aria-expanded", String(nav.classList.toggle("is-open")));
  });
  links.forEach(function (a) {
    a.addEventListener("click", function () {
      nav.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
    });
  });

  const sections = [...document.querySelectorAll("section[data-nav]")];
  const byId = Object.fromEntries(links.map(function (a) {
    return [a.getAttribute("href").slice(1), a];
  }));

  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        const id = entry.target.getAttribute("data-nav");
        links.forEach(function (a) { a.removeAttribute("aria-current"); });
        if (byId[id]) byId[id].setAttribute("aria-current", "true");
      });
    }, { rootMargin: "-38% 0px -50% 0px" });
    sections.forEach(function (s) { io.observe(s); });
  }

  const form = document.getElementById("rsvp-form");
  const errorEl = document.getElementById("form-error");
  const thanks = document.getElementById("thanks");
  const rooms = {
    a: "和室 A（已滿，不會寫入）",
    b: "和室 B",
    c: "和室 C",
    d: "和室 D（無窗）",
  };

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    errorEl.hidden = true;
    const d = new FormData(form);
    const name = String(d.get("name") || "").trim();
    const email = String(d.get("email") || "").trim();
    const room = String(d.get("room") || "");
    const heads = String(d.get("heads") || "1");
    const note = String(d.get("note") || "").trim();

    if (name.length < 2) {
      errorEl.hidden = false;
      errorEl.textContent = "名字請至少兩個字。";
      form.name.focus();
      return;
    }
    if (!/[^\s@]+@[^\s@]+\.[^\s@]+/.test(email)) {
      errorEl.hidden = false;
      errorEl.textContent = "信箱格式不完整。";
      form.email.focus();
      return;
    }
    if (!room || room === "a") {
      errorEl.hidden = false;
      errorEl.textContent = "請選還有位子的房。";
      return;
    }

    document.getElementById("thanks-body").textContent =
      name + "，" + email + "，" + heads + " 人。" +
      (note ? " 你寫的：「" + note + "」。" : "");
    document.getElementById("thanks-room").textContent = rooms[room] || room;
    form.hidden = true;
    thanks.hidden = false;
    thanks.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  document.getElementById("rsvp-again").addEventListener("click", function () {
    form.reset();
    form.elements.room.value = "b";
    thanks.hidden = true;
    form.hidden = false;
    form.name.focus();
  });
})();
