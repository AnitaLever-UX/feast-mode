/* =========================================================
   SECTION 05 — FLAVOUR IN MOTION
   Motion identity: "liquid takes over the screen"
   - pinned scrub, three acts:
     1. the sauce crown erupts, droplets fly, headline splits
     2. sauce floods up from below while a dripping curtain
        pours from above; the headline turns cream inside it
     3. a wobbling hole tears through the sauce and grows
        to reveal the plated dish (camera settles in)
   - the liquid surface keeps moving even when you stop
   ========================================================= */
FM.section("flavour-in-motion", (sec) => {
  const { q, qa } = FM;
  const pin = q("#fim-pin", sec);
  const svg = q("#fim-flood", sec);
  const P = (id) => q("#" + id, sec);
  const surface = P("fl-surface"), curtain = P("fl-curtain"), gloss = P("fl-gloss"), rim = P("fl-rim");
  const cSurface = P("fc-surface"), cCurtain = P("fc-curtain");
  const reveal = P("fim-reveal");
  const creamTitle = q(".fim__title--cream", sec);

  /* ---------- droplets around the splash ---------- */
  let seed = 5;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const dropsBox = P("fim-drops");
  const drops = Array.from({ length: 26 }, () => {
    const d = document.createElement("span");
    d.className = "sdrop";
    d.style.cssText = `--x:${50 + (rnd() - 0.5) * 16}%;--y:${58 + (rnd() - 0.5) * 10}%;--s:${6 + rnd() * 16}px`;
    dropsBox.appendChild(d);
    return d;
  });

  /* ---------- liquid state, drawn every frame ---------- */
  const S = { level: 1.15, curtain: 0, hole: 0, amp: 14 }; // level/curtain as fraction of height
  let W = 1, H = 1, t = 0;
  const DRIPS = [[0.08, 0.05, 0.55], [0.22, 0.035, 0.9], [0.37, 0.05, 0.4], [0.55, 0.04, 0.75], [0.71, 0.06, 0.5], [0.88, 0.04, 0.85]];
  // always match the live size of the scene (full screen, panel resize, rotation)
  const size = () => {
    const w = pin.clientWidth, h = pin.clientHeight;
    if (w === W && h === H) return;
    W = w; H = h;
    svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
  };
  svg.setAttribute("preserveAspectRatio", "none");
  size();
  addEventListener("resize", size);
  if (window.ResizeObserver) new ResizeObserver(size).observe(pin);
  const f = (n) => n.toFixed(1);

  function draw() {
    size();
    // rising surface
    const base = S.level * H;
    let top = "", gl = "";
    for (let x = -20; x <= W + 20; x += 20) {
      const y = base + S.amp * Math.sin(x * 0.012 + t * 1.4) + S.amp * 0.5 * Math.sin(x * 0.027 - t * 0.9);
      top += (x === -20 ? "M" : "L") + f(x) + " " + f(y);
      if (x > 0 && x < W) gl += (gl ? "L" : "M") + f(x) + " " + f(y + 9);
    }
    const dS = top + `L${W + 20} ${H + 40}L-20 ${H + 40}Z`;
    // dripping curtain from above
    let dC = "";
    if (S.curtain > 0.001) {
      const band = S.curtain * H * 0.22;
      dC = "M-20 -40";
      for (let x = -20; x <= W + 20; x += 12) {
        let y = band + 6 * Math.sin(x * 0.02 + t);
        DRIPS.forEach(([dx, dw, dl]) => {
          const u = (x / W - dx) / dw;
          y += S.curtain * dl * H * 0.75 * Math.exp(-(u * u * u * u)) * (1 + 0.04 * Math.sin(t * 2 + dx * 9));
        });
        dC += `L${f(x)} ${f(y)}`;
      }
      dC += `L${W + 20} -40Z`;
    }
    surface.setAttribute("d", dS); cSurface.setAttribute("d", dS);
    // once sauce covers everything, the cream headline needs no clipping at all
    const covered = S.level < -0.06;
    if (covered !== draw.covered) { creamTitle.style.clipPath = covered ? "none" : ""; draw.covered = covered; }
    curtain.setAttribute("d", dC); cCurtain.setAttribute("d", dC);
    gloss.setAttribute("d", S.level < 1.05 ? gl : "");

    // organic hole revealing the dish
    if (S.hole <= 0.001) { reveal.style.clipPath = "inset(50%)"; rim.setAttribute("d", ""); return; }
    const R = S.hole * Math.hypot(W, H) * 0.62, cx = W / 2, cy = H * 0.5;
    if (S.hole >= 0.999) { reveal.style.clipPath = "none"; rim.setAttribute("d", ""); return; }
    let h = "";
    for (let i = 0; i <= 72; i++) {
      const a = (i / 72) * Math.PI * 2;
      const r = R * (1 + 0.07 * Math.sin(5 * a + t * 1.6) + 0.04 * Math.sin(9 * a - t * 1.1));
      h += (i ? "L" : "M") + f(cx + Math.cos(a) * r) + " " + f(cy + Math.sin(a) * r * 0.92);
    }
    h += "Z";
    reveal.style.clipPath = `path('${h}')`;
    rim.setAttribute("d", h);
  }

  FM.mm.add({ motion: FM.conditions.motion }, (ctx) => {
    if (!ctx.conditions.motion) { reveal.style.clipPath = ""; return; } // reduced: CSS shows both frames statically

    const tick = (time) => { t = time; draw(); };

    const splash = P("fim-splash");
    const l1 = qa(".fim__l1", sec), l2 = qa(".fim__l2", sec);
    const img = q("img", reveal), cap = q(".fim__caption", reveal);

    // arrival: splash crouches, headline slides in
    gsap.from(l1, { xPercent: -30, opacity: 0, ease: "none", scrollTrigger: { trigger: sec, start: "top bottom", end: "top 20%", scrub: FM.scrub } });
    gsap.from(l2, { xPercent: 30, opacity: 0, ease: "none", scrollTrigger: { trigger: sec, start: "top bottom", end: "top 20%", scrub: FM.scrub } });
    gsap.from(splash, { scaleY: 0.25, scaleX: 0.7, ease: "none", scrollTrigger: { trigger: sec, start: "top 80%", end: "top top", scrub: FM.scrub } });

    const tl = gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: { trigger: sec, start: "top top", end: () => "+=" + innerHeight * (FM.wide() ? 2.3 : 1.8), pin: pin, scrub: FM.scrub, anticipatePin: 1 },
    });

    // act 1 — eruption
    tl.fromTo(splash, { scaleY: 1, scaleX: 1, y: 0 }, { scaleY: 1.18, scaleX: 1.06, y: -30, duration: 1, ease: "power2.out", immediateRender: false }, 0)
      .fromTo(drops, { x: 0, y: 0, rotation: 0, scale: 1 }, {
        immediateRender: false,
        x: () => (rnd() - 0.5) * W * 0.9, y: () => -H * (0.2 + rnd() * 0.45), rotation: () => rnd() * 360,
        scale: () => 0.6 + rnd() * 1.4, duration: 1.4, ease: "power2.out", stagger: 0.01,
      }, 0.1)
      .to(l1, { x: () => -W * 0.015, duration: 1.2 }, 0)
      .to(l2, { x: () => W * 0.015, duration: 1.2 }, 0);

    // act 2 — the flood
    tl.to(S, { curtain: 1, duration: 1.6, ease: "power1.in" }, 0.8)
      .to(S, { level: -0.08, amp: 26, duration: 1.8, ease: "power2.inOut" }, 1.0)
      .fromTo(drops, { opacity: 1, yPercent: 0 }, { opacity: 0, yPercent: 600, duration: 0.8, immediateRender: false }, 1.6)
      .to({}, { duration: 0.5 }); // hold on the cream-on-sauce headline

    // act 3 — the reveal
    tl.fromTo(S, { hole: 0 }, { hole: 1, duration: 2, ease: "power2.in" }, 3.3)
      .fromTo(img, { scale: 1.25 }, { scale: 1, duration: 2.6, ease: "power2.out" }, 3.3)
      .fromTo(cap, { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5 }, 5)
      .to({}, { duration: 0.4 });

    // created after the pin so its range includes the pin spacing
    ScrollTrigger.create({
      trigger: sec, start: "top bottom", end: "bottom top",
      onToggle: (s) => (s.isActive ? gsap.ticker.add(tick) : gsap.ticker.remove(tick)),
    });
    draw();
  });
});
