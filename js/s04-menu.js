/* =========================================================
   SECTION 04 — THE MOVING MENU
   Motion identity: "a lazy-susan table sliding past"
   - pinned scrub: the overhead table slides horizontally;
     each plate turns like a turntable as it travels, the
     active dish grows, neighbours recede; fog drifts slower
   - prev/next jump the scroll to each dish; counter + bar
   - Discover dish → real <dialog> with ingredients + facts
   - reduced motion: native horizontal scroll-snap carousel
   ========================================================= */
FM.section("menu", (sec) => {
  const { q, qa } = FM;
  const DISHES = [
    { ings: ["Smashed beef ×2", "Aged cheddar", "House pickles", "Feast sauce", "Brioche bun", "Skin-on fries"], heat: "Mild", allergens: "Gluten, dairy, egg, mustard", price: "$16" },
    { ings: ["Spaghetti", "San Marzano tomato", "Garlic confit", "Aged parmesan", "Torn basil", "Olive oil"], heat: "None", allergens: "Gluten, dairy", price: "$18" },
    { ings: ["Turmeric rice", "Roasted squash", "Jammy egg", "Avocado", "Pickled radish", "Toasted seeds"], heat: "None", allergens: "Egg, sesame", price: "$15" },
    { ings: ["Buttermilk chicken", "Chilli hot honey", "Dill pickles", "Lime", "Chilli flakes"], heat: "Hot", allergens: "Gluten, dairy", price: "$17" },
  ];
  const dishes = qa(".dish", sec);
  const n = dishes.length;
  const track = q("#menu-track", sec);
  const viewport = q("#menu-viewport", sec);
  const cur = q("#menu-current", sec);
  const bar = q("#menu-bar", sec);
  const prev = q("#menu-prev", sec), next = q("#menu-next", sec);
  let active = 0;

  const setActive = (i) => {
    active = i;
    cur.textContent = String(i + 1).padStart(2, "0");
    prev.disabled = i === 0;
    next.disabled = i === n - 1;
  };
  setActive(0);

  /* ---------- fog blobs ---------- */
  const fogBox = q("#menu-fog", sec);
  const fogs = [[2, 58, 30], [18, 72, 26], [30, 40, 22], [46, 66, 34], [60, 30, 24], [72, 70, 30], [86, 46, 26], [96, 64, 22], [110, 36, 28]].map(([x, y, w]) => {
    const f = document.createElement("span");
    f.className = "fog";
    f.style.cssText = `--x:${x}%;--y:${y}%;--w:${w}vw`;
    fogBox.appendChild(f);
    return f;
  });

  /* ---------- dialog ---------- */
  const dlg = q("#dish-dialog", sec);
  const plate = q("#dd-plate", dlg);
  qa(".dish__cta", sec).forEach((btn) => btn.addEventListener("click", () => {
    const i = +btn.dataset.dish, d = DISHES[i], li = dishes[i];
    const srcPlate = li.querySelector(".dish__plate");
    plate.className = srcPlate.className;
    q("#dd-img", dlg).src = srcPlate.querySelector("img").src;
    q("#dd-img", dlg).alt = li.querySelector(".dish__name").textContent;
    q("#dd-num", dlg).innerHTML = li.querySelector(".dish__num").innerHTML;
    q("#dd-name", dlg).textContent = li.querySelector(".dish__name").textContent;
    q("#dd-desc", dlg).textContent = li.querySelector(".dish__desc").textContent;
    q("#dd-ings", dlg).innerHTML = d.ings.map((x) => `<li>${x}</li>`).join("");
    q("#dd-heat", dlg).textContent = d.heat;
    q("#dd-allergens", dlg).textContent = d.allergens;
    q("#dd-price", dlg).textContent = d.price;
    dlg.showModal();
  }));
  q(".dish-dialog__close", dlg).addEventListener("click", () => dlg.close());
  dlg.addEventListener("click", (e) => { if (e.target === dlg) dlg.close(); }); // backdrop click

  /* ---------- motion ---------- */
  FM.mm.add({ motion: FM.conditions.motion, reduced: FM.conditions.reduced }, (ctx) => {
    if (ctx.conditions.reduced) {
      // native carousel: arrows scroll the viewport; active follows the scroll
      const centreOf = (el) => el.offsetLeft + el.offsetWidth / 2 - viewport.clientWidth / 2;
      const go = (i) => viewport.scrollTo({ left: centreOf(dishes[i]), behavior: "auto" });
      const onScroll = () => {
        const x = viewport.scrollLeft;
        let best = 0;
        dishes.forEach((d, i) => { if (Math.abs(centreOf(d) - x) < Math.abs(centreOf(dishes[best]) - x)) best = i; });
        setActive(best);
        bar.style.transform = `scaleX(${(best + 1) / n})`;
      };
      const p = () => go(Math.max(0, active - 1)), nx = () => go(Math.min(n - 1, active + 1));
      prev.addEventListener("click", p); next.addEventListener("click", nx);
      viewport.addEventListener("scroll", onScroll, { passive: true });
      return () => { prev.removeEventListener("click", p); next.removeEventListener("click", nx); viewport.removeEventListener("scroll", onScroll); };
    }

    const media = dishes.map((d) => d.querySelector(".dish__media"));
    const plates = dishes.map((d) => d.querySelector(".dish__plate"));
    const infos = dishes.map((d) => d.querySelector(".dish__info"));
    const distance = () => {
      const last = dishes[n - 1];
      return last.offsetLeft + last.offsetWidth / 2 - innerWidth / 2;
    };

    const render = (p) => {
      const pos = p * (n - 1);
      dishes.forEach((d, i) => {
        const dd = Math.min(1, Math.abs(pos - i));
        gsap.set(media[i], { scale: 1 - dd * 0.22 });
        gsap.set(plates[i], { rotation: (pos - i) * -38 });
        gsap.set(infos[i], { opacity: 1 - dd * 0.75, y: dd * 30 });
      });
      gsap.set(fogBox, { x: -p * innerWidth * 0.25 });
      bar.style.transform = `scaleX(${(pos + 1) / n})`;
      const a = Math.round(pos);
      if (a !== active) setActive(a);
    };

    const tween = gsap.to(track, {
      x: () => -distance(), ease: "none",
      scrollTrigger: {
        trigger: sec, start: "top top", end: () => "+=" + distance() * 0.9,
        pin: true, scrub: FM.scrub, anticipatePin: 1, invalidateOnRefresh: true,
        onUpdate: (s) => render(s.progress), onRefresh: (s) => render(s.progress),
      },
    });
    render(0);

    // entry: headline + first dish arrive as the section scrolls in
    gsap.from([q(".menu__kicker", sec), q(".menu__title", sec), q(".menu__controls", sec)], {
      y: 40, opacity: 0, stagger: 0.08, duration: 0.9, ease: FM.ease.out,
      scrollTrigger: { trigger: sec, start: "top 70%", toggleActions: "play none none reverse" },
    });
    gsap.from(track, {
      xPercent: 12, ease: "none",
      scrollTrigger: { trigger: sec, start: "top bottom", end: "top top", scrub: FM.scrub },
    });

    // ambient (paused off-screen): fog breathes and drifts
    FM.loop(sec, () => {
    fogs.forEach((f) => gsap.to(f, {
      x: gsap.utils.random(-60, 60), y: gsap.utils.random(-20, 20), scale: gsap.utils.random(0.9, 1.2),
      duration: gsap.utils.random(5, 9), ease: FM.ease.float, yoyo: true, repeat: -1,
    }));
    dishes.forEach((d) => gsap.to(d.querySelector(".dish__garnish"), {
      y: -10, rotation: 10, duration: gsap.utils.random(2.5, 3.5), ease: FM.ease.float, yoyo: true, repeat: -1,
    }));
    });

    // arrows: jump the page scroll to the matching dish
    const st = tween.scrollTrigger;
    const go = (i) => window.scrollTo({ top: st.start + (st.end - st.start) * (i / (n - 1)), behavior: "smooth" });
    const p = () => go(Math.max(0, active - 1)), nx = () => go(Math.min(n - 1, active + 1));
    prev.addEventListener("click", p); next.addEventListener("click", nx);
    return () => { prev.removeEventListener("click", p); next.removeEventListener("click", nx); };
  });
});
