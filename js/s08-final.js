/* =========================================================
   SECTION 08 — THE FINAL BITE
   Motion identity: "the closing shot of the commercial"
   - pinned scrub: placemat settles, the plate glides in and
     lands, knife + glasses + flowers arrive, the fork lifts
     the bite toward the camera (scale + growing shadow),
     steam rises, the camera eases in, headline + CTA settle
   - footer wordmark rises letter by letter
   ========================================================= */
FM.section("final-bite", (sec) => {
  const { q, qa } = FM;

  /* ---------- scalloped placemat (herb green, cream piping) ---------- */
  const mat = q("#final-mat", sec);
  const scallop = (x0, y0, w, h, amp, period) => {
    const pts = [], per = 2 * (w + h);
    const n = Math.round(per / period) * 24;
    for (let i = 0; i <= n; i++) {
      const s = (i / n) * per;
      let x, y, nx, ny;
      if (s < w) { x = x0 + s; y = y0; nx = 0; ny = -1; }
      else if (s < w + h) { x = x0 + w; y = y0 + (s - w); nx = 1; ny = 0; }
      else if (s < 2 * w + h) { x = x0 + w - (s - w - h); y = y0 + h; nx = 0; ny = 1; }
      else { x = x0; y = y0 + h - (s - 2 * w - h); nx = -1; ny = 0; }
      const o = amp * Math.sin((s / per) * Math.PI * 2 * Math.round(per / period));
      pts.push((i ? "L" : "M") + (x + nx * o).toFixed(1) + " " + (y + ny * o).toFixed(1));
    }
    return pts.join("") + "Z";
  };
  mat.innerHTML = `
    <path d="${scallop(40, 40, 920, 640, 14, 64)}" fill="rgba(41,41,35,.08)" transform="translate(6 22)"/>
    <path d="${scallop(40, 40, 920, 640, 14, 64)}" fill="rgba(41,41,35,.10)" transform="translate(3 11)"/>
    <path d="${scallop(40, 40, 920, 640, 14, 64)}" fill="var(--herb)"/>
    <path d="${scallop(78, 78, 844, 564, 12, 64)}" fill="none" stroke="#F7EEDB" stroke-width="12" stroke-linejoin="round"/>
    <path d="${scallop(78, 78, 844, 564, 12, 64)}" fill="none" stroke="rgba(41,41,35,.18)" stroke-width="2" transform="translate(0 3)"/>`;

  const steam = FM.steam(q("#final-steam", sec), { wisps: 4 });

  /* footer wordmark */
  const footer = document.getElementById("footer");

  FM.mm.add({ motion: FM.conditions.motion }, (ctx) => {
    if (!ctx.conditions.motion) return; // reduced: the finished shot, still steam
    const plate = q("#final-plate", sec), fork = q("#final-fork", sec), scene = q("#final-scene", sec);
    const lines = qa(".final__title .line > span", sec);

    const tl = gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: { trigger: sec, start: "top top", end: () => "+=" + innerHeight * (FM.wide() ? 1.8 : 1.5), invalidateOnRefresh: true, pin: q("#final-pin", sec), scrub: FM.scrub, anticipatePin: 1 },
    });
    // every step has an explicit start AND end, so re-measuring (load, resize) can never freeze it half-way
    const IR = { immediateRender: false };
    tl.fromTo(mat, { scale: 0.86, rotation: -5, opacity: 0 }, { scale: 1, rotation: 0, opacity: 1, duration: 0.7, ease: "power2.out" }, 0)
      .fromTo(plate, { yPercent: 120, rotation: 30 }, { yPercent: 0, rotation: 0, duration: 1, ease: "power3.out" }, 0.15)
      .fromTo(q(".final__knife", sec), { xPercent: 260, rotation: 20 }, { xPercent: 0, rotation: 0, duration: 0.8, ease: "power3.out" }, 0.55)
      .fromTo(qa(".final__glass", sec), { yPercent: -140, scale: 1.25, opacity: 0 }, { yPercent: 0, scale: 1, opacity: 1, duration: 0.8, stagger: 0.12, ease: "power3.out" }, 0.5)
      .fromTo(q(".final__posy", sec), { yPercent: -140, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.8, ease: "power3.out" }, 0.74)
      // the fork only appears once the plate has landed, then the bite lifts toward the camera
      .fromTo(fork, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.2 }, 0.95)
      .fromTo(fork,
        { x: () => plate.offsetLeft - fork.offsetLeft + plate.offsetWidth * 0.18, y: () => plate.offsetTop - fork.offsetTop + plate.offsetHeight * 0.28, scale: 0.62 * FM.bake, rotation: 18 },
        { x: 0, y: 0, scale: FM.bake, rotation: 0, duration: 1.1, ease: "power2.inOut" }, 1.15)
      .fromTo(q("#final-steam", sec), { opacity: 0 }, { opacity: 1, duration: 0.6, onStart: steam.play, onReverseComplete: steam.pause }, 1.3)
      .fromTo(scene, { scale: 1 }, { scale: 1.08, duration: 1.4, ease: "power1.inOut", ...IR }, 1.3)
      .fromTo(q(".final__kicker", sec), { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.4 }, 1.7)
      .fromTo(lines, { yPercent: 110 }, { yPercent: 0, stagger: 0.15, duration: 0.6, ease: "power3.out" }, 1.8)
      .fromTo([q(".final__lead", sec), q(".final__cta", sec)], { opacity: 0, y: 24 }, { opacity: 1, y: 0, stagger: 0.12, duration: 0.5 }, 2.2)
      .to({}, { duration: 0.4 });

    // keep the steam alive after the pin releases while the shot is on screen
    ScrollTrigger.create({ trigger: sec, start: "top bottom", end: "bottom top", onLeave: steam.pause, onEnterBack: steam.play, onLeaveBack: steam.pause });

    // footer wordmark rises letter by letter
    gsap.from(qa(".fm-l", footer), {
      yPercent: 100, opacity: 0, stagger: 0.05, ease: "power3.out",
      scrollTrigger: { trigger: footer, start: "top 80%", end: "bottom bottom", scrub: FM.scrub },
    });
  });
});
