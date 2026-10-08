/* =========================================================================
   Pixel pals in the footer yard. Without JavaScript they just stand in a
   row on the grass. With it they wander: each pal walks for a bit, then
   stops for a bit (the cat naps when it stops). Clicking a pal makes it
   hop, pop a heart and say something. With "reduce motion" on they stay
   put, and clicking only shows the speech bubble.
   ========================================================================= */
(function () {
  "use strict";

  const yard = document.querySelector(".yard");
  if (!yard) return;

  const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const SAYS = { cat: "mrrp!", dog: "woof!", tux: "sudo pet" };
  const rand = (lo, hi) => lo + Math.random() * (hi - lo);

  const pals = [...yard.querySelectorAll(".pal")].map((el) => ({
    el,
    kind: el.dataset.pal,
    img: el.querySelector("img"),
    x: 0,
    dir: Math.random() < 0.5 ? -1 : 1,
    speed: rand(18, 30), // px per second
    walking: false,
    until: 0,            // when the current walk or rest ends
    pettedUntil: 0,
  }));

  /* ---- PETTING --------------------------------------------------------- */
  function pet(p) {
    const now = performance.now();
    p.pettedUntil = now + 1600;
    if (p.kind === "cat") p.img.src = "assets/cat-awake.png";

    const bubble = document.createElement("span");
    bubble.className = "bubble";
    bubble.textContent = SAYS[p.kind];
    p.el.appendChild(bubble);

    if (!still) {
      const heart = document.createElement("img");
      heart.className = "heart";
      heart.src = "assets/heart.png";
      heart.alt = "";
      p.el.appendChild(heart);
      p.el.classList.remove("hop");
      void p.el.offsetWidth; // restart the hop animation
      p.el.classList.add("hop");
      setTimeout(() => heart.remove(), 1000);
    }
    setTimeout(() => {
      bubble.remove();
      if (still && p.kind === "cat") p.img.src = "assets/cat.gif";
    }, 1600);
  }
  pals.forEach((p) => p.el.addEventListener("click", () => pet(p)));

  if (still) return;

  /* ---- WANDERING ------------------------------------------------------- */
  // Positions are kept in JS and applied as transforms; the yard switches
  // from a flex row to absolute positioning once the pals start roaming.
  function spread() {
    const w = yard.clientWidth;
    pals.forEach((p, i) => {
      p.x = ((i + 0.5) / pals.length) * w - p.el.offsetWidth / 2;
    });
  }
  yard.classList.add("roaming");
  spread();

  function setWalking(p, walking, now) {
    p.walking = walking;
    p.until = now + (walking ? rand(2500, 6000) : rand(2000, 5000));
    if (walking && Math.random() < 0.4) p.dir *= -1;
  }

  let last = performance.now();
  pals.forEach((p) => setWalking(p, Math.random() < 0.6, last));

  function tick(now) {
    const dt = Math.min(0.1, (now - last) / 1000); // don't leap after a hidden tab
    last = now;
    const max = yard.clientWidth;

    for (const p of pals) {
      const petted = now < p.pettedUntil;
      if (!petted && now > p.until) setWalking(p, !p.walking, now);
      if (p.walking && !petted) {
        p.x += p.dir * p.speed * dt;
        const right = max - p.el.offsetWidth;
        if (p.x < 0) { p.x = 0; p.dir = 1; }
        if (p.x > right) { p.x = right; p.dir = -1; }
      }
      p.el.classList.toggle("walking", p.walking && !petted);
      if (!petted && p.kind === "cat") {
        const src = p.walking ? "assets/cat-awake.png" : "assets/cat.gif";
        if (!p.img.src.endsWith(src)) p.img.src = src;
      }
      p.el.style.transform = `translateX(${Math.round(p.x)}px)`;
    }
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);

  // Keep everyone in the yard if the window gets narrower.
  window.addEventListener("resize", () => {
    const max = yard.clientWidth;
    pals.forEach((p) => { p.x = Math.min(p.x, max - p.el.offsetWidth); });
  });
})();
