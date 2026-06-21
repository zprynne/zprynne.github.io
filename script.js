/* =========================================================================
   Progressive enhancement.
   The page works fully without this file — JS only ADDS conveniences:
     1. A persistent dark/light theme toggle
     2. Scroll-spy: highlight the nav link for the section you're viewing
     3. Auto-fill the copyright year
   ========================================================================= */

(function () {
  "use strict";

  /* ---- 1. THEME TOGGLE ------------------------------------------------- */
  const STORAGE_KEY = "preferred-theme";
  const root = document.documentElement; // the <html> element
  const toggle = document.getElementById("theme-toggle");

  // Resolve the initial theme: saved choice > OS preference > default (dark).
  // matchMedia lets us read the user's system-level "prefers light" setting.
  function getInitialTheme() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return saved;
    return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
  }

  function applyTheme(theme) {
    root.setAttribute("data-theme", theme);
    if (toggle) toggle.setAttribute("aria-pressed", String(theme === "light"));
  }

  applyTheme(getInitialTheme());

  if (toggle) {
    toggle.addEventListener("click", function () {
      const next = root.getAttribute("data-theme") === "light" ? "dark" : "light";
      applyTheme(next);
      localStorage.setItem(STORAGE_KEY, next); // remember across visits
    });
  }

  /* ---- 2. SCROLL-SPY NAV ----------------------------------------------- */
  // IntersectionObserver fires a callback when a section enters/leaves the
  // viewport. It's the efficient, modern alternative to listening to every
  // scroll event (which fires constantly and can jank the page).
  const sections = document.querySelectorAll("main section[id]");
  const navLinks = document.querySelectorAll('.nav__links a[href^="#"]');

  if (sections.length && navLinks.length && "IntersectionObserver" in window) {
    const linkFor = (id) =>
      document.querySelector('.nav__links a[href="#' + id + '"]');

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const link = linkFor(entry.target.id);
          if (link && entry.isIntersecting) {
            navLinks.forEach((l) => l.classList.remove("is-active"));
            link.classList.add("is-active");
          }
        });
      },
      // rootMargin shifts the "trigger zone" up so a section counts as active
      // once it reaches roughly the upper third of the screen.
      { rootMargin: "-30% 0px -60% 0px" }
    );

    sections.forEach((section) => observer.observe(section));
  }

  /* ---- 3. FOOTER YEAR -------------------------------------------------- */
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
