/* =========================================================
   SECTION 06 — THE FEAST MODE RITUAL
   Motion identity: "the table sets itself, then breathes"
   - NO pin: as the section scrolls in, each object is laid
     onto the table from just outside its spot; the three
     phrases arrive one by one; the cocktails fill
   - ambient (calm): steam over the scallops, the fork and
     napkin barely shift, herb flecks drift, liquid shimmers
   ========================================================= */
FM.section("ritual", (sec) => {
  const { q, qa } = FM;
  const table = q(".ritual__table", sec);
  const objs = qa(".obj:not(.steam-host)", sec);
  const lines = qa(".ritual__title .line > span", sec);
  const fills = qa("[data-fill] .glass__liquid", sec);

  /* herb flecks */
  let seed = 61;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const flecks = Array.from({ length: 16 }, () => {
    const f = document.createElement("span");
    f.className = "fleck";
    f.style.cssText = `--x:${8 + rnd() * 84}%;--y:${10 + rnd() * 80}%;--s:${5 + rnd() * 6}px;--r:${rnd() * 180}deg`;
    q("#ritual-flecks", sec).appendChild(f);
    return f;
  });

  const steam = FM.steam(q("#ritual-steam", sec), { wisps: 4 });

  FM.mm.add({ motion: FM.conditions.motion }, (ctx) => {
    if (!ctx.conditions.motion) return; // reduced: set table, full glasses, still steam

    /* objects are placed from just outside their spot, toward the table centre */
    const tb = () => table.getBoundingClientRect();
    gsap.timeline({
      scrollTrigger: { trigger: sec, start: "top 85%", end: "top 5%", scrub: FM.scrub },
    }).from(objs, {
      x: (i, el) => { const b = tb(), r = el.getBoundingClientRect(); return Math.sign(r.left + r.width / 2 - (b.left + b.width / 2)) * 140; },
      y: (i, el) => { const b = tb(), r = el.getBoundingClientRect(); return Math.sign(r.top + r.height / 2 - (b.top + b.height / 2)) * 90; },
      rotation: (i) => (i % 2 ? 14 : -14), opacity: 0,
      stagger: { each: 0.06, from: "edges" }, ease: "power2.out",
    })
      .from(q(".runner", sec), { scaleX: 0.3, opacity: 0, ease: "power2.out", duration: 0.8 }, 0);

    /* the three phrases, one by one */
    gsap.timeline({ scrollTrigger: { trigger: sec, start: "top 55%", end: "top -10%", scrub: FM.scrub } })
      .from(q(".ritual__kicker", sec), { opacity: 0, y: 20, duration: 0.4 })
      .from(lines, { yPercent: 110, stagger: 0.5, duration: 0.6, ease: "power3.out" })
      .from(q(".ritual__lead", sec), { opacity: 0, y: 20, duration: 0.5 });

    /* the cocktails slowly fill */
    gsap.fromTo(fills, { scale: 0.05, opacity: 0.4 }, {
      scale: 1, opacity: 1, ease: "power1.out",
      scrollTrigger: { trigger: sec, start: "top 40%", end: "center 40%", scrub: FM.scrub },
    });

    /* ambient: alive but calm (xPercent/yPercent so it never fights the scroll placement) */
    const amb = gsap.timeline({ paused: true });
    amb.add(gsap.to(qa("[data-fork]", sec), { xPercent: 4, yPercent: -1.5, duration: 4.5, ease: FM.ease.float, yoyo: true, repeat: -1, stagger: 1.2 }), 0)
      .add(gsap.to(qa("[data-napkin]", sec), { xPercent: -2.5, yPercent: 1, duration: 6, ease: FM.ease.float, yoyo: true, repeat: -1, stagger: 2 }), 0)
      .add(gsap.to(flecks, { x: () => gsap.utils.random(-40, 40), y: () => gsap.utils.random(-30, 30), rotation: () => gsap.utils.random(-90, 90), duration: () => gsap.utils.random(6, 10), ease: FM.ease.float, yoyo: true, repeat: -1 }), 0)
    ScrollTrigger.create({
      trigger: sec, start: "top bottom", end: "bottom top",
      onToggle: (s) => { if (s.isActive) { amb.play(); steam.play(); } else { amb.pause(); steam.pause(); } },
    });
  });
});
