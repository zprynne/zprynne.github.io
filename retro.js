/* =========================================================================
   The secret. Typing the Konami code (up up down down left right left
   right B A), or swiping that pattern and tapping twice on a phone, turns
   on 1996 mode: peak GeoCities styling (the html.y1996 rules in
   styles.css) and three bonus ZAMP tracks, which stay unlocked. A "Back to
   2026" button turns it off with a burst of confetti, and the first return
   earns an achievement. Reduced motion skips the confetti and blinking.
   ========================================================================= */
(function () {
  "use strict";

  const CODE = ["up", "up", "down", "down", "left", "right", "left", "right", "b", "a"];
  const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const root = document.documentElement;
  let progress = 0;

  function input(move) {
    progress = move === CODE[progress] ? progress + 1 : move === CODE[0] ? 1 : 0;
    if (progress === CODE.length) {
      progress = 0;
      enter();
    }
  }

  /* ---- KEYBOARD -------------------------------------------------------- */
  const KEYS = { ArrowUp: "up", ArrowDown: "down", ArrowLeft: "left", ArrowRight: "right" };
  document.addEventListener("keydown", (e) => {
    if (e.target.closest("input, textarea, select")) return;
    input(KEYS[e.key] || e.key.toLowerCase());
  });

  /* ---- TOUCH ----------------------------------------------------------- */
  // Swipes stand in for the arrows; once all eight are in, two taps count
  // as B and A. Taps before that are ignored, so normal browsing never
  // trips it.
  let sx = 0, sy = 0;
  document.addEventListener("touchstart", (e) => {
    sx = e.touches[0].clientX;
    sy = e.touches[0].clientY;
  }, { passive: true });
  document.addEventListener("touchend", (e) => {
    const dx = e.changedTouches[0].clientX - sx;
    const dy = e.changedTouches[0].clientY - sy;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 30) {
      if (progress >= 8) input(CODE[progress]);
      return;
    }
    // Finger moving up means swiping up.
    input(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? "right" : "left") : (dy > 0 ? "down" : "up"));
  }, { passive: true });

  /* ---- 1996 MODE ------------------------------------------------------- */
  let backButton = null;

  function enter() {
    if (root.classList.contains("y1996")) return;
    root.classList.add("y1996");
    document.dispatchEvent(new Event("zamp:unlock"));
    toast("cheat", "★ CHEAT ACTIVATED ★", "Welcome to 1996! 3 bonus tracks unlocked in ZAMP.");

    backButton = document.createElement("button");
    backButton.type = "button";
    backButton.className = "back-2026";
    backButton.textContent = "Back to 2026";
    backButton.addEventListener("click", leave);
    document.body.appendChild(backButton);
    backButton.focus({ preventScroll: true });
  }

  function leave() {
    root.classList.remove("y1996");
    backButton.remove();
    backButton = null;
    if (!still) confetti();

    let earned = false;
    try {
      earned = localStorage.getItem("achievement-time-traveller") === "1";
      localStorage.setItem("achievement-time-traveller", "1");
    } catch (e) { /* show it every time, then */ }
    if (!earned) {
      toast("achievement", "\u{1F3C6} Achievement unlocked", "Time Traveller: visited 1996 and made it back.");
    }
  }

  /* ---- TOASTS ---------------------------------------------------------- */
  function toast(kind, title, text) {
    const el = document.createElement("div");
    el.className = "toast toast-" + kind;
    el.setAttribute("role", "status");
    const strong = document.createElement("strong");
    strong.textContent = title;
    el.append(strong, document.createElement("br"), text);
    document.body.appendChild(el);
    setTimeout(() => el.classList.add("toast-out"), 3600);
    setTimeout(() => el.remove(), 4000);
  }

  /* ---- CONFETTI -------------------------------------------------------- */
  // Square pixel confetti on a full-screen canvas that ignores clicks and
  // removes itself after under two seconds.
  function confetti() {
    const canvas = document.createElement("canvas");
    canvas.className = "confetti";
    canvas.setAttribute("aria-hidden", "true");
    const w = (canvas.width = window.innerWidth);
    const h = (canvas.height = window.innerHeight);
    document.body.appendChild(canvas);
    const g = canvas.getContext("2d");

    const COLORS = ["#ffff00", "#66ff66", "#00ffff", "#ff88ff", "#ff3366", "#ffffff"];
    const bits = Array.from({ length: 140 }, () => ({
      x: w / 2 + (Math.random() - 0.5) * 120,
      y: h * 0.45,
      vx: (Math.random() - 0.5) * 900,
      vy: -300 - Math.random() * 700,
      size: 4 + Math.floor(Math.random() * 3) * 2,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
    }));

    const DURATION = 1800;
    const start = performance.now();
    let last = start;
    function frame(now) {
      const dt = (now - last) / 1000;
      last = now;
      const t = now - start;
      g.clearRect(0, 0, w, h);
      g.globalAlpha = Math.min(1, (DURATION - t) / 400);
      for (const b of bits) {
        b.vy += 1400 * dt;
        b.x += b.vx * dt;
        b.y += b.vy * dt;
        g.fillStyle = b.color;
        g.fillRect(Math.round(b.x), Math.round(b.y), b.size, b.size);
      }
      if (t < DURATION) requestAnimationFrame(frame);
      else canvas.remove();
    }
    requestAnimationFrame(frame);
    // Animation frames pause in a hidden tab; make sure the canvas still goes.
    setTimeout(() => canvas.remove(), DURATION + 500);
  }
})();
