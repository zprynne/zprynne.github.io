/* =========================================================================
   MATRIX DIGITAL RAIN
   A full-viewport canvas backdrop: columns of glyphs fall down the screen,
   with your initials Z / V / P highlighted among the standard katakana + digit
   "code". Decorative only — it sits behind all content and is aria-hidden.

   How the classic effect works:
     - The screen is divided into columns one glyph wide.
     - Each frame we paint a SEMI-TRANSPARENT background rectangle over the
       whole canvas. This doesn't erase — it slightly dims whatever was there,
       so older glyphs fade out and leave the trailing "comet tail". This is
       the core trick (alpha compositing / accumulation buffer).
     - Then each column draws one new glyph at its current head position and
       advances. Newest glyph = brightest; the fade handles the rest.
   ========================================================================= */
(function () {
  "use strict";

  const canvas = document.getElementById("matrix-rain");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  // Character pool: half-width katakana + digits (the recognizable "Matrix"
  // alphabet), plus your initials weighted in separately below.
  const KATAKANA = "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン";
  const STANDARD = (KATAKANA + "0123456789").split("");
  const BRAND = ["Z", "V", "P"];
  const BRAND_RATE = 0.12;          // ~12% of glyphs are a Z/V/P
  const FONT_SIZE = 16;
  const STEP_MS = 55;               // frame interval — the slightly steppy cadence

  // Per-theme colors. `fade` must match the page background so trails dissolve
  // into it. Dark → teal rain; light → blue rain (your chosen look).
  const THEMES = {
    dark:  { fade: "rgba(13, 17, 23, 0.08)",   glyph: "rgba(100, 255, 218, 0.38)", brand: "rgba(255, 210, 77, 0.8)" },
    light: { fade: "rgba(253, 253, 252, 0.12)", glyph: "rgba(37, 99, 235, 0.34)",  brand: "rgba(180, 83, 9, 0.8)" },
  };
  const palette = () =>
    THEMES[document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark"];

  let width, height, columns, drops;

  // (Re)compute the grid on load and whenever the window resizes. `drops[i]` is
  // the current row index of column i's head; negative staggers their starts.
  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    columns = Math.ceil(width / FONT_SIZE);
    drops = Array.from({ length: columns }, () => Math.floor(Math.random() * -50));
    ctx.font = FONT_SIZE + "px monospace";
    ctx.textBaseline = "top";
  }

  function pickGlyph() {
    return Math.random() < BRAND_RATE
      ? BRAND[(Math.random() * BRAND.length) | 0]
      : STANDARD[(Math.random() * STANDARD.length) | 0];
  }

  let rafId = null;
  let lastTime = 0;

  function frame(time) {
    rafId = requestAnimationFrame(frame);
    if (time - lastTime < STEP_MS) return;   // throttle to STEP_MS
    lastTime = time;

    const p = palette();
    ctx.fillStyle = p.fade;                   // dim previous frame (the trail)
    ctx.fillRect(0, 0, width, height);
    ctx.font = FONT_SIZE + "px monospace";

    for (let i = 0; i < columns; i++) {
      const ch = pickGlyph();
      const x = i * FONT_SIZE;
      const y = drops[i] * FONT_SIZE;
      const isBrand = ch === "Z" || ch === "V" || ch === "P";

      if (isBrand) {                          // make initials glow + stand out
        ctx.fillStyle = p.brand;
        ctx.shadowColor = p.brand;
        ctx.shadowBlur = 8;
      } else {
        ctx.fillStyle = p.glyph;
        ctx.shadowBlur = 0;
      }
      ctx.fillText(ch, x, y);
      ctx.shadowBlur = 0;

      // Reset a column to the top at random once it falls off-screen, so the
      // streams desynchronize over time instead of marching in lockstep.
      if (y > height && Math.random() > 0.975) drops[i] = Math.floor(Math.random() * -20);
      drops[i]++;
    }
  }

  function start() { if (!rafId) { lastTime = 0; rafId = requestAnimationFrame(frame); } }
  function stop() {
    if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
    ctx.clearRect(0, 0, width, height);
  }

  resize();
  window.addEventListener("resize", resize);

  // Accessibility: honor "reduce motion". Leave the canvas blank if set, and
  // react live if the user flips the OS setting.
  if (!reduceMotion.matches) start();
  reduceMotion.addEventListener("change", (e) => (e.matches ? stop() : start()));
})();
