/* =========================================================
   SECTION 01 — THE APPETITE OPENER
   Motion identity: "the crown rises, then bursts toward you"
   - load: rings + line-art draw on, plate rises, ingredients
     spring out of the plate, headline lines stagger up
   - ambient: independent float/tilt loops, ring ripple,
     a live sauce ribbon (procedural SVG)
   - scroll (pinned, scrubbed): plate scales toward viewer,
     ingredients scatter by depth, tomato rolls on to S02
   ========================================================= */
FM.section("opener", (hero) => {
  const { q, qa } = FM;
  const stage = q("#stage", hero);
  const plate = q("#plate", hero);
  const ings = qa(".ing", hero);
  const lines = qa(".hero__title .line > span", hero);
  const lineMasks = qa(".hero__title .line", hero);
  const fades = qa("[data-hero-fade]", hero);           // intro only
  const copy = q(".hero__copy", hero), meta = q(".hero__meta", hero); // scroll only
  const plateImg = q("#plate img:not(.plate__reflection)", hero), plateRefl = q("#plate .plate__reflection", hero); // intro only (scroll moves #plate)
  const rings = qa("#rings ellipse", hero);

  /* ---------------- line art (wire meshes + molecule) ---------------- */
  const svg = q("#lineart", hero);
  const NS = "http://www.w3.org/2000/svg";
  const add = (tag, attrs, cls) => {
    const el = document.createElementNS(NS, tag);
    for (const k in attrs) el.setAttribute(k, attrs[k]);
    if (cls) el.setAttribute("class", cls);
    svg.appendChild(el);
    return el;
  };
  // seeded noise so the drawing is identical every load
  let seed = 7;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);

  function meshBlob(cx, cy, rx, ry, rings, spokes) {
    const jitter = Array.from({ length: spokes }, () => 0.8 + rnd() * 0.4);
    const pt = (r, i) => {
      const a = (i / spokes) * Math.PI * 2;
      const j = 1 + (jitter[i % spokes] - 1) * r;
      return [cx + Math.cos(a) * rx * r * j, cy + Math.sin(a) * ry * r * j * (a > Math.PI ? 1.25 : 0.7)];
    };
    for (let k = 1; k <= rings; k++) {
      const r = k / rings;
      let d = "";
      for (let i = 0; i <= spokes; i++) {
        const [x, y] = pt(r, i % spokes);
        d += (i ? "L" : "M") + x.toFixed(1) + " " + y.toFixed(1);
      }
      add("path", { d: d + "Z", pathLength: 1 }, "mesh draw");
    }
    for (let i = 0; i < spokes; i += 2) {
      const [x0, y0] = pt(0.12, i), [x1, y1] = pt(1, i);
      add("path", { d: `M${x0} ${y0}L${x1} ${y1}`, pathLength: 1 }, "mesh draw");
    }
  }
  meshBlob(190, 300, 150, 190, 6, 22);
  meshBlob(845, 290, 120, 170, 5, 18);
  meshBlob(470, 210, 120, 150, 4, 16);

  // molecule: two fused hexagons + branches
  const hex = (cx, cy, r) => Array.from({ length: 6 }, (_, i) => {
    const a = Math.PI / 6 + (i * Math.PI) / 3;
    return [cx + Math.cos(a) * r, cy + Math.sin(a) * r];
  });
  const h1 = hex(650, 150, 46), h2 = hex(650 + 46 * Math.sqrt(3), 150, 46);
  const nodes = [...h1, ...h2];
  [h1, h2].forEach((h) =>
    add("path", { d: "M" + h.map((p) => p.map((n) => n.toFixed(1)).join(" ")).join("L") + "Z", pathLength: 1 }, "mol draw"));
  const branches = [[h1[3], [560, 120]], [[560, 120], [528, 80]], [h1[2], [610, 260]], [h2[0], [800, 210]], [h2[5], [790, 70]], [[790, 70], [840, 40]], [h1[4], [622, 52]]];
  branches.forEach(([a, b]) => {
    add("path", { d: `M${a[0]} ${a[1]}L${b[0]} ${b[1]}`, pathLength: 1 }, "mol draw");
    nodes.push(b);
  });
  const nodeEls = nodes.map(([x, y]) => add("circle", { cx: x, cy: y, r: 4 }, "mol node"));

  /* ---------------- sauce ribbon (procedural, food colour) ---------------- */
  const body = q(".ribbon__body", hero);
  const gloss = q(".ribbon__gloss", hero);
  const ribbon = { time: 0, reveal: 1 };
  const N = 56;
  function drawRibbon() {
    const t0 = ribbon.time;
    const top = [], bot = [], gl = [];
    const maxI = Math.max(2, Math.round(N * ribbon.reveal));
    const center = (u) => {
      const x = -40 + u * 1080;
      const y = 520 - 380 * u + 58 * Math.sin(Math.PI * 2 * (u * 1.25) + t0 * 0.55) + 22 * Math.sin(Math.PI * 2 * u * 2.6 - t0 * 0.8);
      return [x, y];
    };
    for (let i = 0; i <= maxI; i++) {
      const u = i / N;
      const [x, y] = center(u);
      const [x2, y2] = center(u + 0.001);
      let nx = -(y2 - y), ny = x2 - x; const len = Math.hypot(nx, ny) || 1; nx /= len; ny /= len;
      const w = (34 * Math.pow(Math.sin(Math.PI * u), 0.75)) * (0.78 + 0.22 * Math.sin(t0 * 0.9 + u * 7));
      top.push([x + nx * w, y + ny * w]);
      bot.push([x - nx * w, y - ny * w]);
      if (u > 0.08 && u < 0.92) gl.push([x + nx * w * 0.45, y + ny * w * 0.45]);
    }
    const f = (p) => p[0].toFixed(1) + " " + p[1].toFixed(1);
    body.setAttribute("d", "M" + top.map(f).join("L") + "L" + bot.reverse().map(f).join("L") + "Z");
    gloss.setAttribute("d", gl.length > 1 ? "M" + gl.map(f).join("L") : "");
  }
  drawRibbon();

  /* =============== MOTION (skipped entirely for reduced motion) =============== */
  FM.mm.add(
    { motion: FM.conditions.motion },
    (ctx) => {
      const { motion } = ctx.conditions;
      if (!motion) return; // reduced motion: composed static frame, ribbon drawn once

      const draws = qa(".draw", svg);
      const stageBox = stage.getBoundingClientRect();
      const pBox = plate.getBoundingClientRect();
      const pcx = pBox.left + pBox.width / 2, pcy = pBox.top + pBox.height * 0.35;

      /* ---------- intro ---------- */
      const intro = gsap.timeline({ defaults: { ease: FM.ease.out } });
      gsap.set(draws, { strokeDasharray: 1, strokeDashoffset: 1 });
      intro
        .from(rings, { scale: 0.6, opacity: 0, transformOrigin: "50% 40%", stagger: 0.06, duration: 1.1 }, 0)
        .from(plateImg, { yPercent: 25, opacity: 0, duration: 1.2 }, 0.1)
        .from(plateRefl, { opacity: 0, duration: 1.2 }, 0.3)
        .to(draws, { strokeDashoffset: 0, duration: 1.6, stagger: { each: 0.015, from: "random" }, ease: "power2.inOut" }, 0.2)
        .from(nodeEls, { scale: 0, transformOrigin: "center", transformBox: "fill-box", stagger: 0.03, duration: 0.4 }, 0.9)
        .from(ribbon, { reveal: 0, duration: 1.6, ease: "power2.inOut" }, 0.3)
        .from(lines, { yPercent: 110, duration: 1, stagger: 0.12 }, 0.25)
        .from(fades, { y: 24, opacity: 0, duration: 0.8, stagger: 0.1 }, 0.75);

      ings.forEach((ing, i) => {
        const b = ing.getBoundingClientRect();
        intro.from(ing.firstElementChild, {
          x: pcx - (b.left + b.width / 2), y: pcy - (b.top + b.height / 2),
          scale: 0.2, opacity: 0, rotation: gsap.utils.random(-60, 60),
          duration: 1.3, ease: "back.out(1.4)",
        }, 0.55 + i * 0.07);
      });

      /* ---------- pointer depth (desktop, fine pointer) ---------- */
      {
        const movers = ings.map((ing) => ({
          d: parseFloat(ing.dataset.depth),
          x: gsap.quickTo(ing.firstElementChild, "x", { duration: 0.9, ease: "power3" }),
          y: gsap.quickTo(ing.firstElementChild, "y", { duration: 0.9, ease: "power3" }),
        }));
        const plateX = gsap.quickTo(plate, "x", { duration: 1.2, ease: "power3" });
        const fineMQ = matchMedia(FM.conditions.finePointer);
        const onMove = (e) => {
          if (!FM.wide() || !fineMQ.matches) return;
          const nx = e.clientX / innerWidth - 0.5, ny = e.clientY / innerHeight - 0.5;
          movers.forEach((m) => { m.x(nx * 38 * m.d); m.y(ny * 28 * m.d); });
          plateX(nx * -10);
        };
        intro.eventCallback("onComplete", () => hero.addEventListener("pointermove", onMove));
        ctx.add(() => () => hero.removeEventListener("pointermove", onMove));
      }

      /* ---------- scroll: plate comes toward you, crown bursts ---------- */
      const scroll = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: hero, start: "top top", end: () => "+=" + innerHeight * (FM.wide() ? 0.95 : 0.6),
          pin: true, scrub: FM.scrub, anticipatePin: 1, invalidateOnRefresh: true,
          // scrolling during the intro finishes it instantly, so scroll always owns the scene
          onUpdate: () => { if (intro.isActive()) intro.progress(1); },
        },
      });
      scroll
        .to(lineMasks, { y: (i) => -90 - i * 60, opacity: 0, stagger: 0.05 }, 0)
        // explicit start values: reversing always returns to the composed hero
        // the scroll moves the CONTAINERS; the intro moves the children. They never share a property,
        // so scrolling back to the top always restores the full hero: headline, copy, button, meta.
        .fromTo([copy, meta], { y: 0, autoAlpha: 1 }, { y: -80, autoAlpha: 0, stagger: 0.04, immediateRender: false }, 0)
        .fromTo(plate, { scale: 1, yPercent: 0, xPercent: 0 }, { scale: () => (FM.wide() ? 1.9 : 1.6), yPercent: 18, xPercent: () => (FM.wide() ? -14 : 0), immediateRender: false }, 0)
        .to("#rings", { scale: 1.9, opacity: 0, transformOrigin: "50% 40%" }, 0)
        .to(svg, { scale: 1.25, opacity: 0, transformOrigin: "50% 60%" }, 0)
        .to("#ribbon", { scaleX: 1.35, yPercent: -25, opacity: 0.55, transformOrigin: "30% 50%" }, 0);

      const vw = () => innerWidth / 100, vh = () => innerHeight / 100;
      ings.forEach((ing) => {
        const d = parseFloat(ing.dataset.depth);
        const [dx, dy] = ing.dataset.dir.split(",").map(Number);
        if (ing.dataset.travel === "tomato") {
          // hand-off object: rolls down-right toward Section 02
          scroll.to(ing, { x: () => 6 * vw(), y: () => 48 * vh(), scale: 1.7, rotation: 140 }, 0);
        } else {
          scroll.to(ing, {
            x: () => dx * 15 * vw() * d, y: () => dy * 18 * vh() * d,
            scale: 1 + d * 0.5, rotation: dx * 35, opacity: d > 1 ? 1 : 0.35,
          }, 0);
        }
      });

      /* ---------- ambient loops (each object on its own clock), paused off-screen ---------- */
      FM.loop(hero, () => {
      ings.forEach((ing) => {
        const img = ing.querySelector("img");
        const d = parseFloat(ing.dataset.depth);
        gsap.to(img, {
          y: gsap.utils.random(-22, -10) * (0.6 + d * 0.5),
          rotation: gsap.utils.random(-9, 9),
          duration: gsap.utils.random(2.8, 5),
          ease: FM.ease.float, yoyo: true, repeat: -1, delay: gsap.utils.random(0, 1.5),
        });
      });
      gsap.to(rings, {
        keyframes: { opacity: [1, 0.25, 1] }, duration: 3.2, ease: FM.ease.float,
        stagger: { each: 0.22, repeat: -1 },
      });
      gsap.to(plate.firstElementChild, { y: -8, duration: 3.6, ease: FM.ease.float, yoyo: true, repeat: -1 });
      });

      // live sauce ribbon: only drawn while the hero is on screen
      let lastDraw = 0;
      const tick = (time) => { if (time - lastDraw < 0.032) return; lastDraw = time; ribbon.time = time; drawRibbon(); };
      ScrollTrigger.create({
        trigger: hero, start: "top bottom", end: "bottom top",
        onToggle: (s) => (s.isActive ? gsap.ticker.add(tick) : gsap.ticker.remove(tick)),
      });

    }
  );
});
