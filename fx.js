/* =========================================================================
   Extras. The page works without this file; it only adds:
     1. The visit counter (this browser's visits, kept in localStorage)
     2. Stopping the <marquee> for visitors who ask for reduced motion
     3. A sparkle trail behind the mouse pointer
   ========================================================================= */
(function () {
  "use strict";

  /* ---- 1. VISIT COUNTER ------------------------------------------------ */
  // An honest counter: it can only see this browser, so it says "your visits".
  // localStorage can throw (private browsing, blocked storage), so the count
  // falls back to 1 for this visit.
  const counter = document.getElementById("visits");
  if (counter) {
    let visits = 1;
    try {
      visits = (parseInt(localStorage.getItem("visits"), 10) || 0) + 1;
      localStorage.setItem("visits", String(visits));
    } catch (e) { /* keep the fallback */ }
    counter.textContent = String(visits).padStart(6, "0");
  }

  /* ---- 2. REDUCED MOTION ----------------------------------------------- */
  // CSS and <picture> already swap the GIFs for stills; <marquee> has no CSS
  // off-switch, so stop it here, and skip the sparkles entirely.
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    document.querySelectorAll("marquee").forEach((m) => m.stop && m.stop());
    return;
  }

  /* ---- 3. SPARKLE TRAIL ------------------------------------------------ */
  // Only for a real mouse; on touch screens there's no pointer to follow.
  if (!window.matchMedia("(pointer: fine)").matches) return;

  // A fixed pool of sparkles, reused round-robin, so a long mouse wiggle
  // never piles up elements.
  const POOL = 14;
  const sparks = [];
  for (let i = 0; i < POOL; i++) {
    const s = document.createElement("span");
    s.className = "spark";
    s.setAttribute("aria-hidden", "true");
    document.body.appendChild(s);
    sparks.push(s);
  }

  let next = 0;
  let lastTime = 0;
  document.addEventListener("pointermove", (e) => {
    if (e.timeStamp - lastTime < 45) return; // ~20 sparkles a second at most
    lastTime = e.timeStamp;

    const s = sparks[next];
    next = (next + 1) % POOL;
    s.style.left = e.clientX + "px";
    s.style.top = e.clientY + "px";
    // Restart the CSS animation: drop the class, force a reflow, add it back.
    s.classList.remove("go");
    void s.offsetWidth;
    s.classList.add("go");
  });
})();
