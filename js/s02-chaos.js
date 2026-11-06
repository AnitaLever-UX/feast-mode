/* =========================================================
   SECTION 02 — A LITTLE FLAVOUR CHAOS
   Motion identity: "kinetic type that gets bowled over"
   - enter (scrub): the three lines converge from different
     directions, specks + cutouts parallax at their own speeds
   - ambient: food slowly slides INSIDE the BORING letters,
     cutouts bob between the type layers
   - pinned (scrub): the tomato from S01 rolls across and
     knocks BORING out letter by letter → "boring" is struck
     through → labels pop → hand-off to S03
   ========================================================= */
FM.section("flavour-chaos", (sec) => {
  const { q, qa } = FM;
  const stage = q("#chaos-stage", sec);
  const svg = q("#boring", sec);
  const group = q("#boring-letters", sec);
  const NS = "http://www.w3.org/2000/svg";

  /* ---------- specks: seeded jittered grid, like the reference ---------- */
  let seed = 23;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const specks = q("#chaos-specks", sec);
  const kinds = ["pepper", "pepper", "salt", "salt", "yolk"];
  for (let r = 0; r < 6; r++) for (let c = 0; c < 9; c++) {
    if (rnd() < 0.25) continue;
    const s = document.createElement("span");
    s.className = "speck speck--" + kinds[Math.floor(rnd() * kinds.length)];
    s.style.cssText = `--x:${((c + 0.15 + rnd() * 0.7) / 9) * 100}%;--y:${((r + 0.15 + rnd() * 0.7) / 6) * 100}%;--r:${rnd() * 90}deg`;
    s.dataset.speed = (0.3 + rnd() * 1.2).toFixed(2);
    specks.appendChild(s);
  }

  /* ---------- BORING: one live <text> per letter, filled with food ---------- */
  const WORD = "BORING", FS = 300, GAP = 10;
  let letters = [];
  function buildWord() {
    group.textContent = "";
    let x = 0;
    letters = [...WORD].map((ch) => {
      const g = document.createElementNS(NS, "g");
      g.setAttribute("class", "b-letter");
      const t = document.createElementNS(NS, "text");
      t.setAttribute("x", x); t.setAttribute("y", FS * 0.82);
      t.setAttribute("fill", "url(#foodTile)");
      t.textContent = ch;
      g.appendChild(t); group.appendChild(g);
      x += t.getComputedTextLength() + GAP;
      return g;
    });
    const b = group.getBBox();
    svg.setAttribute("viewBox", `${b.x - 6} ${b.y - 6} ${b.width + 12} ${b.height + 12}`);
  }

  // fonts are guaranteed loaded here (FM.ready), so letters measure correctly
  buildWord();
  initMotion();

  function initMotion() {
    const we = q(".chaos__we", sec), food = q(".chaos__food", sec);
    const tags = qa(".chaos__tag", sec);
    const cuts = qa(".chaos__cut", sec);
    const tomato = q("#chaos-tomato", sec);
    const struck = q("#chaos-struck", sec);
    const pattern = q("#foodTile", sec);

    FM.mm.add({ motion: FM.conditions.motion }, (ctx) => {
      const { motion } = ctx.conditions;
      if (!motion) return;

      /* enter: lines converge, layers parallax */
      const enter = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: { trigger: sec, start: "top bottom", end: "top top", scrub: FM.scrub },
      });
      enter
        .from(we, { xPercent: -45, opacity: 0 }, 0)
        .from(food, { xPercent: 60, opacity: 0 }, 0)
        .from(letters, { yPercent: 60, rotation: (i) => (i % 2 ? 8 : -8), opacity: 0, stagger: 0.05 }, 0.1)
        .from(tags, { y: 60, opacity: 0, stagger: 0.08 }, 0.2)
        .from(qa(".speck", sec), { y: (i, el) => 160 * el.dataset.speed }, 0)
        .from(cuts, { y: (i, el) => 260 * el.dataset.speed, rotation: (i) => (i % 2 ? 40 : -40) }, 0);

      /* pinned: the tomato bowls BORING over */
      gsap.set(tomato, { autoAlpha: 1, x: () => -tomato.offsetWidth * 1.1 });
      const travel = () => innerWidth + tomato.offsetWidth * 2.2;
      const push = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: sec, start: "top top", end: () => "+=" + innerHeight * (FM.wide() ? 1.4 : 1.1),
          pin: true, scrub: FM.scrub, anticipatePin: 1, invalidateOnRefresh: true,
        },
      });
      push.fromTo(tomato, { x: () => -tomato.offsetWidth * 1.1, rotation: 0 }, { x: () => innerWidth + tomato.offsetWidth * 1.1, rotation: 900, duration: 1 }, 0);

      // knock each letter out at the moment the tomato reaches it
      letters.forEach((L, i) => {
        const at = () => {
          const r = L.getBoundingClientRect();
          return gsap.utils.clamp(0, 0.95, (r.left + r.width / 2 + tomato.offsetWidth * 0.6) / travel());
        };
        // explicit start values: scrolling back always rebuilds the word cleanly
        push.fromTo(L, { x: 0, y: 0, rotation: 0, opacity: 1 }, {
          x: () => innerWidth * (0.35 + i * 0.04), y: () => -innerHeight * (0.15 + (i % 3) * 0.08),
          rotation: gsap.utils.random(25, 70) * (i % 2 ? 1 : -1), opacity: 0, duration: 0.28, ease: "power2.in", immediateRender: false,
        }, at());
      });

      push
        .fromTo(struck, { opacity: 0 }, { opacity: 1, duration: 0.12, immediateRender: false }, 0.72)
        .fromTo(struck, { "--strike": 0 }, { "--strike": 1, duration: 0.12, immediateRender: false }, 0.8)
        .fromTo(tags, { scale: 1, rotation: 0 }, { scale: 1.12, rotation: (i) => [-4, 3, -2][i], duration: 0.1, stagger: 0.04, ease: "back.out(3)", immediateRender: false }, 0.82)
        .fromTo(cuts, { y: 0 }, { y: (i, el) => -120 * el.dataset.speed, duration: 0.3, immediateRender: false }, 0.7)
        .to({}, { duration: 0.08 }); // short hold on the punchline before release

      /* ambient (paused off-screen): food drifts inside the letters; cutouts bob
         on yPercent/scale so they never fight the scroll-driven y/rotation */
      FM.loop(sec, () => {
        gsap.fromTo(pattern, { attr: { x: 0, y: 0 } }, { attr: { x: 1000, y: 520 }, duration: 60, ease: "none", repeat: -1 });
        cuts.forEach((c) => gsap.to(c, {
          yPercent: gsap.utils.random(-14, -6), rotation: gsap.utils.random(-8, 8),
          duration: gsap.utils.random(2.6, 4.4), ease: FM.ease.float, yoyo: true, repeat: -1,
        }));
      });
    });
  }
});
