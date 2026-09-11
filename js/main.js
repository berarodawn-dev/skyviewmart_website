(function () {
  "use strict";

  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* Mobile nav */
  var navToggle = document.getElementById("navToggle");
  var mobileNav = document.getElementById("mobileNav");
  if (navToggle && mobileNav) {
    navToggle.addEventListener("click", function () {
      var isOpen = navToggle.getAttribute("aria-expanded") === "true";
      navToggle.setAttribute("aria-expanded", String(!isOpen));
      navToggle.setAttribute("aria-label", isOpen ? "Open menu" : "Close menu");
      mobileNav.classList.toggle("is-open", !isOpen);
    });
    mobileNav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        navToggle.setAttribute("aria-expanded", "false");
        navToggle.setAttribute("aria-label", "Open menu");
        mobileNav.classList.remove("is-open");
      });
    });
  }

  /* Scroll reveal */
  var revealTargets = document.querySelectorAll("[data-reveal]");
  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function revealAll() {
    revealTargets.forEach(function (el) { el.classList.add("is-visible"); });
  }

  if (reducedMotion || !("IntersectionObserver" in window)) {
    revealAll();
  } else {
    document.documentElement.classList.add("js-reveal");
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -50px 0px" });
    revealTargets.forEach(function (el) { observer.observe(el); });

    // Backstop: never leave content hidden if the observer does not run.
    setTimeout(revealAll, 1500);
  }

  /* Store hours, Port Moresby time (UTC+10, no daylight saving) */
  var HOURS = {
    0: { open: 15 * 60, close: 19 * 60 + 30 },
    1: { open: 6 * 60 + 30, close: 19 * 60 + 30 },
    2: { open: 6 * 60 + 30, close: 19 * 60 + 30 },
    3: { open: 6 * 60 + 30, close: 19 * 60 + 30 },
    4: { open: 6 * 60 + 30, close: 19 * 60 + 30 },
    5: { open: 6 * 60 + 30, close: 19 * 60 + 30 },
    6: { open: 6 * 60 + 30, close: 19 * 60 + 30 }
  };
  var DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  function formatTime(minutes) {
    var h = Math.floor(minutes / 60);
    var m = minutes % 60;
    var period = h >= 12 ? "PM" : "AM";
    var h12 = h % 12 || 12;
    return h12 + ":" + String(m).padStart(2, "0") + " " + period;
  }

  function nowInPortMoresby() {
    try {
      var parts = new Intl.DateTimeFormat("en-US", {
        timeZone: "Pacific/Port_Moresby",
        weekday: "short", hour: "numeric", minute: "numeric", hour12: false
      }).formatToParts(new Date());

      var weekday = "", hour = 0, minute = 0;
      parts.forEach(function (p) {
        if (p.type === "weekday") weekday = p.value;
        if (p.type === "hour") hour = parseInt(p.value, 10);
        if (p.type === "minute") minute = parseInt(p.value, 10);
      });

      var map = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
      return { day: map[weekday], minutes: (hour % 24) * 60 + minute };
    } catch (e) {
      var now = new Date();
      return { day: now.getDay(), minutes: now.getHours() * 60 + now.getMinutes() };
    }
  }

  function setText(id, text) {
    var el = document.getElementById(id);
    if (el) el.textContent = text;
  }

  function updateStatus() {
    var now = nowInPortMoresby();
    var today = HOURS[now.day];
    var isOpen = now.minutes >= today.open && now.minutes < today.close;

    var detail;
    if (isOpen) {
      detail = "Closes " + formatTime(today.close) + " today";
    } else if (now.minutes < today.open) {
      detail = "Opens " + formatTime(today.open) + " today";
    } else {
      var next = (now.day + 1) % 7;
      detail = "Opens " + formatTime(HOURS[next].open) + " " + DAYS[next];
    }

    var label = isOpen ? "Open now" : "Closed now";
    setText("statusLabel", label);
    setText("statusLabelLarge", label);
    setText("statusToday", detail);
    setText("statusTodayLarge", detail);

    var dot = document.getElementById("statusDot");
    if (dot) {
      dot.classList.toggle("is-open", isOpen);
      dot.classList.toggle("is-closed", !isOpen);
    }

    var week = document.getElementById("hoursWeek");
    if (week) {
      week.querySelectorAll("li").forEach(function (li) {
        li.classList.toggle("is-today", parseInt(li.getAttribute("data-day"), 10) === now.day);
      });
    }
  }

  updateStatus();
  setInterval(updateStatus, 60000);
})();
