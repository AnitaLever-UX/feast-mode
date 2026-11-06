/* =========================================================
   SECTION 03 — THE INGREDIENTS LABORATORY
   Motion identity: "gravity assembles the dish"
   - rest frame = Reference 03: everything suspended mid-air
   - pinned scrub: flour streams in, then each ingredient
     falls, spins and drops into the bowl; every landing makes
     the bowl "plop" and fills it a step (empty → full pasta)
   - finale: oil pours, steam rises, assembly meter hits 100%
   ========================================================= */
FM.section("lab", (sec) => {
  const { q, qa } = FM;
  const NS = "http://www.w3.org/2000/svg";
  let seed = 41;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const gauss = () => (rnd() + rnd() + rnd() - 1.5) / 1.5;

  /* ---------- flour cloud (procedural) ---------- */
  const flour = q("#lab-flour", sec);
  flour.innerHTML = '<defs><radialGradient id="puffGrad"><stop offset="0" stop-color="#FFFDF6"/><stop offset=".55" stop-color="#FFFDF6" stop-opacity=".85"/><stop offset="1" stop-color="#FFFDF6" stop-opacity="0"/></radialGradient></defs>';
  const puffs = [], grains = [];
  for (let i = 0; i < 9; i++) {
    const c = document.createElementNS(NS, "circle");
    c.setAttribute("cx", 170 + gauss() * 90); c.setAttribute("cy", 120 + gauss() * 55);
    c.setAttribute("r", 22 + rnd() * 30); c.setAttribute("class", "puff");
    flour.appendChild(c); puffs.push(c);
  }
  for (let i = 0; i < 150; i++) {
    const c = document.createElementNS(NS, "circle");
    const far = rnd() < 0.35;
    c.setAttribute("cx", 170 + gauss() * (far ? 200 : 110)); c.setAttribute("cy", 120 + gauss() * (far ? 130 : 70));
    c.setAttribute("r", far ? 0.8 + rnd() * 1.8 : 2 + rnd() * 6);
    flour.appendChild(c); grains.push(c);
  }

  /* ---------- olive oil streams ---------- */
  const oil = q("#lab-oil", sec);
  oil.innerHTML = `<defs><linearGradient id="oilGrad" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0" stop-color="#B98914"/><stop offset=".45" stop-color="#F2CC4E"/><stop offset="1" stop-color="#B98914"/></linearGradient></defs>`;
  const streams = [[45, 7, 0.36], [105, 10, 0.44], [160, 6, 0.3]].map(([x, w, rest], i) => {
    let d = `M${x} -10`;
    for (let y = 20; y <= 600; y += 30) d += ` L${(x + Math.sin(y * 0.012 + i) * (6 + y * 0.02)).toFixed(1)} ${y}`;
    const p = document.createElementNS(NS, "path");
    Object.entries({ d, fill: "none", stroke: "url(#oilGrad)", "stroke-width": w, "stroke-linecap": "round",
      pathLength: 1, "stroke-dasharray": 1, "stroke-dashoffset": 1 - rest, "vector-effect": "non-scaling-stroke" })
      .forEach(([k, v]) => p.setAttribute(k, v));
    oil.appendChild(p);
    return { p, rest };
  });

  /* ---------- spice rain: diagonal band, like the reference ---------- */
  const spiceBox = q("#lab-spice", sec);
  const spices = [];
  for (let i = 0; i < 46; i++) {
    const t = rnd();
    const s = document.createElement("span");
    const isChili = rnd() < 0.4;
    s.className = isChili ? "chili" : "pepper";
    s.style.cssText = `--x:${36 + t * 30 + gauss() * 7}%;--y:${8 + t * 44 + gauss() * 8}%;--s:${isChili ? 7 + rnd() * 6 : 6 + rnd() * 6}px;--r:${rnd() * 180}deg`;
    spiceBox.appendChild(s); spices.push(s);
  }

  /* ---------- water splash around the tomato ---------- */
  const splashBox = q("#lab-splash", sec);
  const drops = [];
  for (let i = 0; i < 20; i++) {
    const a = rnd() * Math.PI * 2, r = 4 + rnd() * 9;
    const d = document.createElement("span");
    d.className = "drop";
    d.style.cssText = `--x:${16 + Math.cos(a) * r}%;--y:${66 + Math.sin(a) * r * 1.3}%;--s:${4 + rnd() * 9}px`;
    splashBox.appendChild(d); drops.push(d);
  }

  /* ---------- steam (shared module) ---------- */
  const steam = FM.steam(q("#lab-steam", sec), { wisps: 5 });

  /* ================= MOTION ================= */
  const bowl = q("#lab-bowl", sec);
  const full = q(".lab__bowl-full", sec);
  const ings = qa(".lab-ing", sec);
  const lines = qa(".lab__title .line > span", sec);
  const pct = q("#lab-pct", sec);

  FM.mm.add({ motion: FM.conditions.motion }, (ctx) => {
    const { motion } = ctx.conditions;
    if (!motion) { steam.pause(); return; } // reduced: reference frame, full bowl, still steam

    gsap.set(full, { opacity: 0 });
    gsap.set(q("#lab-steam", sec), { opacity: 0 });
    pct.textContent = "0";

    /* headline reveal on arrival */
    gsap.from(lines, {
      yPercent: 110, duration: 1, ease: FM.ease.out, stagger: 0.1,
      scrollTrigger: { trigger: sec, start: "top 65%", toggleActions: "play none none reverse" },
    });
    gsap.from([q(".lab__lead", sec), q(".lab__kicker", sec)], {
      y: 20, opacity: 0, duration: 0.8, ease: FM.ease.out, delay: 0.3,
      scrollTrigger: { trigger: sec, start: "top 65%", toggleActions: "play none none reverse" },
    });

    /* target: centre of the bowl's mouth, measured in stage space */
    const mouth = () => ({ x: bowl.offsetLeft + bowl.offsetWidth * 0.5, y: bowl.offsetTop + bowl.offsetHeight * 0.22 });
    const centreOf = (el) => ({ x: el.offsetLeft + el.offsetWidth / 2, y: el.offsetTop + el.offsetHeight / 2 });

    const tl = gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: {
        trigger: sec, start: "top top", end: () => "+=" + innerHeight * (FM.wide() ? 2 : 1.5),
        pin: true, scrub: FM.scrub, anticipatePin: 1, invalidateOnRefresh: true,
        onUpdate: (s) => { pct.textContent = Math.round(s.progress * 100); },
      },
    });

    // flour streams down first
    const stage = q("#lab-stage", sec);
    const fb = () => { const b = flour.getBoundingClientRect(), s = stage.getBoundingClientRect();
      return { l: b.left - s.left, t: b.top - s.top, sx: b.width / 400, sy: b.height / 300 }; };
    tl.to(grains, {
      x: (i, el) => { const b = fb(), m = mouth(); return (m.x - (b.l + el.cx.baseVal.value * b.sx)) / b.sx; },
      y: (i, el) => { const b = fb(), m = mouth(); return (m.y - (b.t + el.cy.baseVal.value * b.sy)) / b.sy; },
      opacity: 0, duration: 1.4, stagger: { each: 0.006, from: "random" }, ease: "power2.in",
    }, 0.2)
      .to(puffs, { opacity: 0, scale: 0.4, duration: 1.2 }, 0.6);

    // ingredients fall in, one after another
    const order = [6, 0, 4, 5, 3, 2, 1, 7, 8, 9]; // pasta, tomato, garlic, avocado, cucumber, slice, basil, thyme, parsley, thyme
    const N = order.length;
    order.forEach((idx, k) => {
      const ing = ings[idx];
      if (getComputedStyle(ing).display === "none") return;
      const t = 1 + k * 0.45;
      const spin = (k % 2 ? 1 : -1) * gsap.utils.random(200, 520);
      tl.to(ing, {
        x: () => mouth().x - centreOf(ing).x + gsap.utils.random(-30, 30),
        y: () => mouth().y - centreOf(ing).y,
        rotation: spin, scale: 0.32, duration: 1, ease: "power2.in",
      }, t)
        .to(ing, { opacity: 0, duration: 0.15 }, t + 0.88)
        // plop + fill step on landing
        .to(bowl, { scaleY: 0.96, scaleX: 1.025, duration: 0.08, ease: "power1.out" }, t + 1)
        .to(bowl, { scaleY: 1, scaleX: 1, duration: 0.2, ease: "back.out(3)" }, t + 1.08)
        .to(full, { opacity: (k + 1) / N, duration: 0.25 }, t + 1);
      if (idx === 0) tl.to(drops, { // tomato leaves its splash behind
        x: () => gsap.utils.random(-120, 120), y: () => gsap.utils.random(-160, 60), opacity: 0, duration: 0.8, ease: "power2.out",
      }, t);
    });

    // spice rain falls in
    const tSpice = 1 + N * 0.45;
    tl.to(spices, {
      x: (i, el) => mouth().x - (el.offsetLeft + 4),
      y: (i, el) => mouth().y - (el.offsetTop + 4),
      opacity: 0, duration: 1, stagger: { each: 0.012, from: "random" }, ease: "power2.in",
    }, tSpice - 1.6);

    // finale: oil pours into the bowl, steam rises
    const tOil = tSpice + 0.4;
    streams.forEach(({ p }, i) => tl.to(p, { attr: { "stroke-dashoffset": 0 }, duration: 0.9, ease: "power1.in" }, tOil + i * 0.12));
    tl.to(oil, { opacity: 0, duration: 0.4 }, tOil + 1.2)
      .to(full, { opacity: 1, duration: 0.3 }, tOil + 0.6)
      .to(q("#lab-steam", sec), { opacity: 1, duration: 0.6, onStart: steam.play, onReverseComplete: steam.pause }, tOil + 0.9)
      .to(bowl, { scale: 1.06, duration: 0.8, ease: "power1.out" }, tOil + 1)
      .to({}, { duration: 0.5 });

    /* ambient (paused off-screen): suspended things breathe. Spices bob on
       yPercent and puffs on their radius, so nothing fights the scroll tweens */
    FM.loop(sec, () => {
      ings.forEach((ing) => gsap.to(ing.querySelector("img"), {
        y: gsap.utils.random(-16, -6), rotation: gsap.utils.random(-10, 10),
        duration: gsap.utils.random(2.4, 4.2), ease: FM.ease.float, yoyo: true, repeat: -1,
      }));
      gsap.to(puffs, { attr: { r: "+=5" }, duration: 3, ease: FM.ease.float, yoyo: true, repeat: -1, stagger: 0.3 });
      gsap.to(spices, { yPercent: () => gsap.utils.random(60, 160), duration: () => gsap.utils.random(2, 3.5), ease: FM.ease.float, yoyo: true, repeat: -1 });
    });
  });
});
