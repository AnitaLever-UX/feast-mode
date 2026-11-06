/* =========================================================
   SECTION 07 — GOOD FOOD HAS A PERSONALITY
   Motion identity: "posters pasted up, type with attitude"
   - pinned scrub: each poster slides in tilted and pastes
     over the last (the old one steps back); inside, words
     slide / rotate / scale; the X in EXTRA scissors shut
   - the disco tomato travels across all three statements
   - ambient: fruit + spheres bob, the orange-slice O turns,
     wave bands drift, the disco ball sparkles
   ========================================================= */
FM.section("personality", (sec) => {
  const { q, qa } = FM;

  FM.mm.add({ motion: FM.conditions.motion }, (ctx) => {
    if (!ctx.conditions.motion) return;
    const posters = qa(".poster", sec);
    const W = (p, k) => q(`[data-w="${k}"]`, posters[p]);
    const trav = q("#pers-traveller", sec);
    const vw = () => innerWidth / 100, vh = () => innerHeight / 100;

    /* poster 1 arrives with the section */
    gsap.timeline({ defaults: { ease: "none" }, scrollTrigger: { trigger: sec, start: "top bottom", end: "top top", scrub: FM.scrub } })
      .from(posters[0], { yPercent: 40, rotation: 5, scale: 0.92 }, 0)
      .from(W(0, "l"), { xPercent: -120, rotation: -8 }, 0.1)
      .from(W(0, "r"), { xPercent: 70, opacity: 0 }, 0.2)
      .from(q(".swap", posters[0]), { rotation: -540, scale: 0 }, 0.3)
      .from(trav, { y: () => -60 * vh(), rotation: -200 }, 0);

    /* posters 2 + 3 paste over, pinned */
    gsap.set(posters[1], { yPercent: 115, rotation: 9 });
    gsap.set(posters[2], { xPercent: -115, rotation: -12 });
    const fork = q(".x-fork", sec), knife = q(".x-knife", sec);
    gsap.set([fork, knife], { rotation: 0 });

    const tl = gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: { trigger: sec, start: "top top", end: () => "+=" + innerHeight * (FM.wide() ? 2.4 : 2), invalidateOnRefresh: true, pin: q("#pers-pin", sec), scrub: FM.scrub, anticipatePin: 1 },
    });
    // explicit start AND end on every step: re-measuring can never freeze a poster half-way
    const IR = { immediateRender: false };
    tl.fromTo(posters[0], { rotation: 0, scale: 1 }, { rotation: -1.2, duration: 0.6, ...IR }, 0)
      // poster 2
      .fromTo(posters[1], { yPercent: 115, rotation: 9 }, { yPercent: 0, rotation: 1.6, duration: 1, ease: "power2.out" }, 0.6)
      .fromTo(posters[0], { scale: 1, rotation: -1.2 }, { scale: 0.93, rotation: -3.5, duration: 1, ...IR }, 0.6)
      .fromTo(W(1, "rot"), { rotation: -14, scale: 1.4, opacity: 0 }, { rotation: 0, scale: 1, opacity: 1, duration: 0.8, ease: "back.out(1.6)" }, 1.0)
      .fromTo(W(1, "up"), { yPercent: 90, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.6, ease: "power3.out" }, 1.3)
      .fromTo(q(".swap--apple", sec), { y: -200, rotation: 120 }, { y: 0, rotation: 0, duration: 0.6, ease: "bounce.out" }, 1.2)
      .fromTo(trav, { x: 0, y: 0, rotation: 0, scale: 1 }, { x: () => -60 * vw(), y: () => 2 * vh(), rotation: 300, scale: 1.25, duration: 1.2, ease: "power2.inOut", ...IR }, 0.6)
      // poster 3
      .fromTo(posters[2], { xPercent: -115, rotation: -12 }, { xPercent: 0, rotation: -1, duration: 1, ease: "power2.out" }, 2.3)
      .fromTo(posters[1], { scale: 1, rotation: 1.6 }, { scale: 0.94, rotation: 3.5, duration: 1, ...IR }, 2.3)
      .fromTo(posters[0], { scale: 0.93 }, { scale: 0.88, duration: 1, ...IR }, 2.3)
      .fromTo(W(2, "l"), { xPercent: -110 }, { xPercent: 0, duration: 0.7, ease: "power3.out" }, 2.7)
      .fromTo(W(2, "scale"), { scale: 1.7, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.7, ease: "power3.out" }, 2.85)
      .fromTo(fork, { rotation: 0 }, { rotation: 38, duration: 0.5, ease: "back.out(2)" }, 3.3)
      .fromTo(knife, { rotation: 0 }, { rotation: -38, duration: 0.5, ease: "back.out(2)" }, 3.3)
      .fromTo(trav, { x: () => -60 * vw(), y: () => 2 * vh(), rotation: 300, scale: 1.25 }, { x: () => -6 * vw(), y: () => 46 * vh(), rotation: 560, scale: 0.9, duration: 1.2, ease: "power2.inOut", ...IR }, 2.3)
      .to({}, { duration: 0.5 });

    /* ambient (paused off-screen) */
    FM.loop(sec, () => {
    qa("[data-bob]", sec).forEach((el) => gsap.to(el, {
      y: gsap.utils.random(-18, -8), rotation: gsap.utils.random(-8, 8),
      duration: gsap.utils.random(2.4, 4), ease: FM.ease.float, yoyo: true, repeat: -1, delay: gsap.utils.random(0, 1),
    }));
    gsap.to(qa("[data-spin]", sec), { rotation: 360, duration: 18, ease: "none", repeat: -1 });
    gsap.to(qa(".sparkle", sec), { keyframes: { opacity: [0, 1, 0], scale: [0.4, 1.2, 0.4] }, duration: 1.6, repeat: -1, stagger: { each: 0.5, repeat: -1 }, ease: "sine.inOut" });
    gsap.to(trav.querySelector("img"), { y: -12, duration: 2.2, ease: FM.ease.float, yoyo: true, repeat: -1 });
    });
  });
});
