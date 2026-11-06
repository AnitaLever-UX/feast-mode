/* =========================================================
   FEAST MODE — shared runtime (nav, motion conventions)
   Each section registers itself in its own file via FM.section().
   ========================================================= */
(function () {
  gsap.registerPlugin(ScrollTrigger);
  // mobile address-bar show/hide must not re-measure every pin mid-scroll
  ScrollTrigger.config({ ignoreMobileResize: true });

  const FM = (window.FM = {
    mm: gsap.matchMedia(),
    // motion conventions shared by every section
    ease: { out: "power3.out", inOut: "power2.inOut", float: "sine.inOut" },
    q: (s, el = document) => el.querySelector(s),
    qa: (s, el = document) => [...el.querySelectorAll(s)],
    conditions: {
      motion: "(prefers-reduced-motion: no-preference)",
      reduced: "(prefers-reduced-motion: reduce)",
      desktop: "(min-width: 1025px)",
      mobile: "(max-width: 1024px)",
      finePointer: "(pointer: fine)",
    },
    /* Sections register here; they initialise in page order once the
       brand fonts are ready (max 2.5s), so pinned ScrollTriggers are always
       created top-to-bottom and text measurements are correct. */
    // live layout check (never rebuilds animations; values re-read on refresh)
    wide: () => innerWidth > 1024,
    bake: 1.5, // baked-shadow images are drawn at 1.5× (see bake.py)
    // one scrub feel for the whole page: responsive, no lag when reversing
    scrub: 0.4,
    /* Idle loops for a section: everything created inside fn() runs only
       while the section is on screen (saves CPU, keeps scrolling smooth).
       Call it AFTER the section's pinned timeline. */
    loop(sec, fn) {
      const ctx = gsap.context(fn);
      const tweens = ctx.getTweens();
      const set = (on) => tweens.forEach((t) => t.paused(!on));
      set(false);
      ScrollTrigger.create({ trigger: sec, start: "top bottom", end: "bottom top", onToggle: (s) => set(s.isActive) });
      return ctx;
    },
    _queue: [],
    section(id, init) {
      const el = document.getElementById(id);
      if (el) FM._queue.push([el, init]);
    },
  });
  FM.ready = (document.fonts
    ? Promise.race([
        Promise.all(['400 100px "Bowlby One SC"', '400 16px "DM Sans"', 'italic 400 16px "Instrument Serif"'].map((f) => document.fonts.load(f))),
        new Promise((r) => setTimeout(r, 2500)),
      ])
    : Promise.resolve()
  ).catch(() => {});
  /* Measure scroll positions strictly top-to-bottom, whatever order the
     triggers were created in. Prevents one section's pin landing on top of
     another (the "scattered" overlap). */
  const sectionOf = (st) => {
    const t = st.trigger || st.pin;
    return t && t.closest ? t.closest("[data-section], footer") : null;
  };
  const order = (a, b) => {
    const sa = sectionOf(a), sb = sectionOf(b);
    if (!sa || !sb || sa === sb) return (sa ? 1 : 0) - (sb ? 1 : 0); // global triggers first, same-section keeps creation order
    return sa.compareDocumentPosition(sb) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1;
  };
  ScrollTrigger.addEventListener("refreshInit", () => ScrollTrigger.sort(order));

  const frame = () => new Promise((r) => requestAnimationFrame(() => r()));
  const boot = () => FM.ready.then(async () => {
    // build scenes one per frame, top to bottom: the hero starts instantly, no single long freeze
    const queue = FM._queue.sort((a, b) => (a[0].compareDocumentPosition(b[0]) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1));
    for (const [el, init] of queue) { init(el); await frame(); }
    // nav active states are created last so they account for every pin
    visible.forEach((a) => {
      const target = document.querySelector(a.getAttribute("href"));
      ScrollTrigger.create({
        trigger: target, start: "top 50%", end: "bottom 50%",
        onToggle: (s) => (s.isActive ? a.setAttribute("aria-current", "true") : a.removeAttribute("aria-current")),
      });
    });
    ScrollTrigger.refresh();
  });
  document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", boot) : setTimeout(boot);

  /* ---------- nav: hide links to sections that don't exist yet ---------- */
  const links = FM.qa(".nav__links a");
  links.forEach((a) => {
    const target = document.querySelector(a.getAttribute("href"));
    a.parentElement.hidden = !target || target.classList.contains("pending");
  });
  const visible = links.filter((a) => !a.parentElement.hidden);
  const toggle = FM.q(".nav__toggle");
  const list = FM.q("#nav-links");
  toggle.hidden = visible.length === 0;
  toggle.addEventListener("click", () => {
    const open = toggle.getAttribute("aria-expanded") !== "true";
    toggle.setAttribute("aria-expanded", open);
    toggle.textContent = open ? "Close" : "Menu";
    list.classList.toggle("is-open", open);
  });
  list.addEventListener("click", (e) => {
    if (e.target.closest("a") && toggle.getAttribute("aria-expanded") === "true") toggle.click();
  });

  /* nav: solid background at all times (see .nav in system.css) */

  /* ---------- section jumps (nav, CTAs, footer, back to top) ----------
     Smooth-scrolling through 7 pinned scenes fires every animation at
     once. Instead: a quick cream curtain, an instant jump, then reveal. */
  const curtain = document.createElement("div");
  curtain.className = "fm-curtain";
  curtain.setAttribute("aria-hidden", "true");
  document.body.appendChild(curtain);
  const reduced = matchMedia(FM.conditions.reduced);
  FM.jump = (hash) => {
    const el = hash === "#top" ? document.body : document.querySelector(hash);
    if (!el) return;
    const host = el.closest(".pin-spacer") || el;
    // sections marked data-jump="end" land on their finished frame (e.g. the final CTA)
    const pinST = el.dataset && el.dataset.jump === "end" && ScrollTrigger.getAll().find((s) => s.pin && (s.trigger === el || el.contains(s.trigger)));
    const go = () => {
      const top = hash === "#top" ? 0 : pinST ? pinST.end : host.getBoundingClientRect().top + scrollY;
      window.scrollTo({ top, behavior: "instant" });
      ScrollTrigger.update();
      // skip the scrub catch-up so every scene is already in its correct state when the curtain lifts
      ScrollTrigger.getAll().forEach((st) => { const tw = st.getTween && st.getTween(); if (tw) tw.progress(1); });
      if (el !== document.body) { el.setAttribute("tabindex", "-1"); el.focus({ preventScroll: true }); }
    };
    if (reduced.matches) return go();
    gsap.killTweensOf(curtain);
    gsap.to(curtain, { opacity: 1, duration: 0.18, ease: "power1.out", onComplete: () => {
      go();
      gsap.to(curtain, { opacity: 0, duration: 0.4, delay: 0.08, ease: "power1.in" });
    } });
  };
  document.addEventListener("click", (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a || a.getAttribute("href") === "#" || e.metaKey || e.ctrlKey) return;
    if (a.classList.contains("skip-link")) return; // skip link keeps native behaviour
    e.preventDefault();
    FM.jump(a.getAttribute("href"));
  });

  /* ---------- CTAs: fall back to the next built section ---------- */
  FM.qa("a[data-fallback]").forEach((a) => {
    const t = document.querySelector(a.getAttribute("href"));
    if (!t || t.classList.contains("pending")) a.setAttribute("href", a.dataset.fallback);
  });

  /* ---------- shared: rising steam (used by S03, S06, S08) ----------
     FM.steam(container, { wisps }) → { play(), pause(), el }
     Soft blurred wisps that rise, widen and dissolve on loop.      */
  FM.steam = (box, { wisps = 5 } = {}) => {
    // soft radial-gradient wisps moved with transforms only: GPU-composited, no blur filters
    const wrap = document.createElement("div");
    wrap.className = "fm-steam";
    const els = [];
    for (let i = 0; i < wisps; i++) {
      const w = document.createElement("span");
      w.className = "fm-steam__wisp";
      w.style.left = (12 + (i / Math.max(1, wisps - 1)) * 64) + "%";
      wrap.appendChild(w); els.push(w);
    }
    box.appendChild(wrap);
    const tl = gsap.timeline({ paused: true, repeat: -1 });
    els.forEach((el, i) => {
      tl.fromTo(el, { yPercent: 40, xPercent: 0, scaleX: 0.6, scaleY: 0.7, opacity: 0, rotation: 0 },
        { keyframes: [
            { yPercent: -10, xPercent: (i % 2 ? 12 : -12), scaleX: 0.95, scaleY: 1, opacity: 0.75, rotation: (i % 2 ? 6 : -6), duration: 1.6, ease: "sine.out" },
            { yPercent: -95, xPercent: (i % 2 ? -10 : 14), scaleX: 1.5, scaleY: 1.35, opacity: 0, rotation: (i % 2 ? -8 : 8), duration: 2.4, ease: "sine.in" }] },
        i * 0.8);
    });
    gsap.set(els, { opacity: 0.45 }); // static frame for reduced motion
    // only animate when asked to AND actually on screen
    let want = false, seen = false;
    const sync = () => (want && seen ? tl.play() : tl.pause());
    new IntersectionObserver(([e]) => { seen = e.isIntersecting; sync(); }).observe(box);
    return { el: wrap, play: () => { want = true; sync(); }, pause: () => { want = false; sync(); } };
  };


  /* ---------- preload + pre-decode images, section by section ----------
     Lazy images were downloading and decoding mid-scroll (the lag).
     After the hero is up, quietly fetch and decode everything in page
     order, so every scene is ready before you reach it. */
  const idle = window.requestIdleCallback || ((fn) => setTimeout(fn, 60));
  const preload = () => {
    const imgs = FM.qa("img[loading='lazy']");
    let i = 0;
    const next = () => {
      if (i >= imgs.length) return;
      const batch = imgs.slice(i, i + 4); i += 4;
      Promise.all(batch.map((img) => { img.loading = "eager"; return (img.decode ? img.decode() : Promise.resolve()).catch(() => {}); }))
        .then(() => idle(next));
    };
    idle(next);
  };

  window.addEventListener("load", () => { ScrollTrigger.refresh(); preload(); });
})();
