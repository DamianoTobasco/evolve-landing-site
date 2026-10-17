/* Evolve Arena — theevolve.app (shared by every page; each block runs only when its section is on the page) */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

  const year = $("#year");
  if (year) year.textContent = new Date().getFullYear();

  /* ---------- Nav ---------- */
  const nav = $("#nav");
  const toggle = $("#navToggle");
  const setMenu = (open) => {
    if (!toggle) return;
    nav.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  };
  if (toggle) toggle.addEventListener("click", () => setMenu(!nav.classList.contains("is-open")));
  $$("#navLinks a").forEach((a) => a.addEventListener("click", () => setMenu(false)));
  addEventListener("keydown", (e) => { if (e.key === "Escape") setMenu(false); });

  const navLinks = $$('#navLinks a[href^="#"]');
  const sections = navLinks.map((a) => $(a.getAttribute("href"))).filter(Boolean);
  const spy = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      navLinks.forEach((a) => a.classList.toggle("is-active", a.getAttribute("href") === "#" + en.target.id));
    });
  }, { rootMargin: "-45% 0px -50% 0px" });
  // The key art has no nav link, so reaching it clears the highlight.
  [$("#top"), ...sections].filter(Boolean).forEach((s) => spy.observe(s));

  /* ---------- Reveal on scroll ---------- */
  const revealer = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (en.isIntersecting) { en.target.classList.add("is-in"); revealer.unobserve(en.target); }
    });
  }, { rootMargin: "0px 0px -8% 0px" });
  $$(".reveal").forEach((el) => revealer.observe(el));

  /* ---------- Phone screenshot cycler ---------- */
  $$("[data-cycle]").forEach((phone) => {
    const shots = $$(".phone-screen img", phone);
    const dots = $$(".phone-dots i", phone);
    if (shots.length < 2 || reduceMotion) return;
    let i = 0, timer = null;
    const show = (n) => {
      shots[i].classList.remove("is-on"); dots[i] && dots[i].classList.remove("is-on");
      i = n % shots.length;
      shots[i].classList.add("is-on"); dots[i] && dots[i].classList.add("is-on");
    };
    new IntersectionObserver(([en]) => {
      clearInterval(timer);
      if (en.isIntersecting) timer = setInterval(() => show(i + 1), 3200);
    }).observe(phone);
  });

  /* ---------- Hero roster ---------- */
  if ($("#roster")) {
    const CLASS = {
      bruiser: { name: "Bruiser", color: "#ff7a2f", attack: "Close-range blast of 5 pellets" },
      striker: { name: "Striker", color: "#36c9ff", attack: "Rapid 3-shot burst" },
      mystic: { name: "Mystic", color: "#a970ff", attack: "Long-range heavy orb" },
      vital: { name: "Vital", color: "#3ee08a", attack: "Twin shots that heal you" },
      guardian: { name: "Guardian", color: "#ffc83d", attack: "Heavy steady shot" },
    };
    const HEROES = [
      { id: "atlas", name: "Atlas", role: "Iron Brawler", cls: "bruiser", attack: "Iron Jab",
        sup: "Ground Slam", supDetail: "Shockwave around you that throws enemies back and dazes them",
        blurb: "A powerlifter with steel gauntlets. Heavy and tough: wade in and slam everyone back." },
      { id: "cortex", name: "Cortex", role: "Mind Bender", cls: "mystic", attack: "Mind Wave",
        sup: "Nova", supDetail: "Homing orb that explodes and slows everyone it hits",
        blurb: "A calm psychic who throws heavy mind waves from across the arena; his Nova leaves rivals slowed." },
      { id: "ion", name: "Ion", role: "Plasma Blaster", cls: "striker", attack: "Plasma Blast",
        sup: "Blitz", supDetail: "Dash through your rival",
        blurb: "The fastest hero in the arena: a sprinter who fires rapid plasma bolts from both palms. Light, so keep moving." },
      { id: "shade", name: "Shade", role: "Shadow Stalker", cls: "vital", attack: "Shadow Fangs",
        sup: "Vanish", supDetail: "Turn invisible and faster for 3.5 s; your first volley out of hiding hits 60% harder",
        blurb: "A shadow runner. Turns invisible, slips behind you and strikes twice as hard out of hiding." },
      { id: "quake", name: "Quake", role: "Seismic Titan", cls: "guardian", attack: "Boulder Toss",
        sup: "Titan Leap", supDetail: "Jump over walls and land with a quake that hits hard and stuns everyone nearby",
        blurb: "A walking mountain: the slowest, toughest hero. Leaps across the arena and lands with a quake that stuns everyone nearby." },
      { id: "salvo", name: "Salvo", role: "Airstrike Commander", cls: "mystic", attack: "Sky Missiles",
        attackDetail: "Two missiles lobbed over walls that burst where they land",
        sup: "Airstrike", supDetail: "Mark a zone anywhere in reach, even behind walls: after a short warning, 6 missiles rain down on it",
        blurb: "A rocket-pack commander who lobs missiles over walls from long range and calls in airstrikes. Fragile, and helpless up close: keep your distance." },
      { id: "ventus", name: "Ventus", role: "Storm Walker", cls: "bruiser", attack: "Gale Burst",
        attackDetail: "A gust all round him that hits everyone close at once",
        sup: "Tornado", supDetail: "Become a whirlwind for 4.5 s: faster and unstoppable, shredding everyone close",
        blurb: "Aurelia's wind-walker, half man, half living gale. Every blast is a gust all round him, so get close; his Tornado tears through anyone who can't outrun it." },
      { id: "volt", name: "Volt", role: "Electromagnetic Trooper", cls: "striker", attack: "Pulse Cannon",
        attackDetail: "An electromagnetic wave that spreads in a cone, hardest up close",
        sup: "Static Shock", supDetail: "Throw an EMP charge, even over walls: enemies caught in its blast freeze for a moment and take a shock",
        blurb: "A trooper charged with electromagnetic power. His pulse wave hits everyone in its path, and his EMP freezes whole squads for a moment. Get in, shock, strike." },
      { id: "kryll", name: "Kryll", role: "Hive Marshal", cls: "striker", attack: "Burst Spray",
        attackDetail: "A three-shot burst that sweeps left to right",
        sup: "Hive Strike", supDetail: "Three drone swarms dive on a marked zone",
        blurb: "An alien marshal from beyond the stars who commands a hive of attack drones. Quick and light: hit, slip away, let the drones finish it." },
      { id: "talon", name: "Talon", role: "Skyfire Raptor", cls: "bruiser", attack: "Bone Stars",
        attackDetail: "Sharp bone throwing stars that cut through one foe",
        sup: "Skyfire", supDetail: "Take flight for a few seconds, breathing fire on everyone below",
        blurb: "Half raptor, half machine: a winged hunter from Aurelia's cliffs. Tough on the ground and deadly from the sky." },
    ];

    const roster = $("#roster");
    const heroesSection = $("#heroes");
    const picker = $("#rosterPicker");
    const img = $("#heroImg");
    let current = 0;

    HEROES.forEach((h, i) => {
      const b = document.createElement("button");
      b.className = "pick";
      b.type = "button";
      b.setAttribute("role", "tab");
      b.setAttribute("aria-label", `${h.name}, ${h.role}`);
      b.style.setProperty("--c", CLASS[h.cls].color);
      b.innerHTML = `<img src="assets/arena/heroes/${h.id}.webp" alt="" loading="lazy"><span>${h.name}</span>`;
      b.addEventListener("click", () => setHero(i));
      picker.appendChild(b);
      new Image().src = `assets/arena/heroes/${h.id}.webp`;
    });
    const picks = $$(".pick", picker);

    function setHero(i, focus = false) {
      current = (i + HEROES.length) % HEROES.length;
      const h = HEROES[current];
      const c = CLASS[h.cls];
      heroesSection.style.setProperty("--cls", c.color);
      roster.dataset.class = h.cls;
      $("#heroClass").textContent = c.name;
      $("#heroName").textContent = h.name;
      $("#heroRole").textContent = h.role;
      $("#heroBlurb").textContent = h.blurb;
      $("#heroAttack").textContent = h.attack;
      $("#heroAttackDetail").textContent = h.attackDetail || c.attack;
      $("#heroSuper").textContent = h.sup;
      $("#heroSuperDetail").textContent = h.supDetail;
      img.src = `assets/arena/heroes/${h.id}.webp`;
      img.alt = `${h.name}, the ${h.role}`;
      img.classList.remove("is-swap"); void img.offsetWidth; img.classList.add("is-swap");
      picks.forEach((p, n) => {
        p.setAttribute("aria-selected", String(n === current));
        p.tabIndex = n === current ? 0 : -1;
      });
      const p = picks[current];
      if (picker.scrollWidth > picker.clientWidth) {
        picker.scrollTo({ left: p.offsetLeft - picker.clientWidth / 2 + p.offsetWidth / 2, behavior: reduceMotion ? "auto" : "smooth" });
      }
      if (focus) p.focus({ preventScroll: true });
    }
    $("#heroPrev").addEventListener("click", () => setHero(current - 1));
    $("#heroNext").addEventListener("click", () => setHero(current + 1));
    picker.addEventListener("keydown", (e) => {
      if (e.key === "ArrowRight") { e.preventDefault(); setHero(current + 1, true); }
      if (e.key === "ArrowLeft") { e.preventDefault(); setHero(current - 1, true); }
    });
    let touchX = null;
    const stage = $(".roster-stage");
    stage.addEventListener("touchstart", (e) => { touchX = e.touches[0].clientX; }, { passive: true });
    stage.addEventListener("touchend", (e) => {
      if (touchX === null) return;
      const dx = e.changedTouches[0].clientX - touchX;
      if (Math.abs(dx) > 40) setHero(current + (dx < 0 ? 1 : -1));
      touchX = null;
    });
    setHero(0);
  }

  /* ---------- Training → hero power ---------- */
  if ($("#powerCard")) {
    const STAT_TO_BAR = { strength: "dmg", cardio: "spd", mind: "rel", nutrition: "hp", consistency: "hp" };
    const LABEL = { strength: "+Damage", cardio: "+Speed", mind: "Faster reload", nutrition: "+Health", consistency: "+Health" };
    const bars = { hp: 30, dmg: 30, spd: 30, rel: 30 };
    let xp = 0, level = 1;
    const pop = $("#pcPop");
    const renderBars = () => {
      Object.entries(bars).forEach(([k, v]) => { $(`[data-bar="${k}"] b`).style.width = v + "%"; });
      $("#pcXp").style.width = (xp % 100) + "%";
      $("#pcLevel").textContent = level;
    };
    $$(".train-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const bar = STAT_TO_BAR[btn.dataset.stat];
        bars[bar] = Math.min(100, bars[bar] + 12);
        xp += 34;
        if (xp >= level * 100) level += 1;
        renderBars();
        const li = $(`[data-bar="${bar}"]`);
        li.classList.add("is-up"); setTimeout(() => li.classList.remove("is-up"), 700);
        btn.classList.remove("is-pulse"); void btn.offsetWidth; btn.classList.add("is-pulse");
        pop.textContent = LABEL[btn.dataset.stat];
        pop.classList.remove("is-on"); void pop.offsetWidth; pop.classList.add("is-on");
        if (Object.values(bars).every((v) => v >= 100)) {
          burst(btn.getBoundingClientRect());
          Object.keys(bars).forEach((k) => (bars[k] = 30));
          setTimeout(renderBars, 900);
        }
      });
    });
    renderBars();
  }

  /* ---------- Chests ---------- */
  const LOOT = { common: "+20 coins", rare: "+60 coins", epic: "+120 coins", legendary: "New skin!" };
  $$(".chest").forEach((chest) => {
    chest.addEventListener("click", () => {
      const r = chest.dataset.rarity;
      const im = $("img", chest);
      if (chest.classList.contains("is-open")) return;
      chest.classList.add("is-open");
      if (r === "legendary") setTimeout(() => { im.src = "assets/arena/chests/legendary-open.webp"; }, 380);
      const tag = document.createElement("span");
      tag.className = "chest-loot";
      tag.textContent = LOOT[r];
      chest.appendChild(tag);
      setTimeout(() => burst(chest.getBoundingClientRect(), r === "legendary" ? 140 : 70), 380);
      setTimeout(() => {
        tag.remove();
        chest.classList.remove("is-open");
        if (r === "legendary") im.src = "assets/arena/chests/legendary.webp";
      }, 2600);
    });
  });

  /* ---------- Worlds strip ---------- */
  const worlds = $$(".world");
  const openWorld = (w) => worlds.forEach((x) => x.classList.toggle("is-open", x === w));
  worlds.forEach((w) => {
    w.setAttribute("aria-label", w.textContent.trim().replace(/\s+/g, " "));
    w.addEventListener("click", () => openWorld(w));
    w.addEventListener("focus", () => openWorld(w));
    w.addEventListener("mouseenter", () => { if (matchMedia("(hover: hover) and (min-width: 761px)").matches) openWorld(w); });
  });

  /* ---------- Gallery arrows ---------- */
  const track = $("#galTrack");
  if (track) {
    const step = () => (track.querySelector("img")?.getBoundingClientRect().width || 300) + 22;
    $("#galPrev").addEventListener("click", () => track.scrollBy({ left: -step() * 2, behavior: reduceMotion ? "auto" : "smooth" }));
    $("#galNext").addEventListener("click", () => track.scrollBy({ left: step() * 2, behavior: reduceMotion ? "auto" : "smooth" }));
  }

  /* ---------- Confetti ---------- */
  const canvas = $("#confetti");
  const ctx = canvas && canvas.getContext("2d");
  let parts = [], raf = null;
  const COLORS = ["#ffc531", "#ffe27a", "#4a7bff", "#ff5ca3", "#36d17f", "#ffffff", "#a970ff"];
  function burst(rect, n = 90) {
    if (reduceMotion || !ctx) return;
    const dpr = Math.min(devicePixelRatio || 1, 2);
    canvas.width = innerWidth * dpr; canvas.height = innerHeight * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const x = rect.left + rect.width / 2, y = rect.top + rect.height / 3;
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2, s = 3 + Math.random() * 7;
      parts.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 5, r: Math.random() * 6.28, vr: (Math.random() - .5) * .4,
        w: 6 + Math.random() * 6, h: 4 + Math.random() * 4, c: COLORS[i % COLORS.length], life: 70 + Math.random() * 40 });
    }
    if (!raf) raf = requestAnimationFrame(tick);
  }
  function tick() {
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    parts = parts.filter((p) => p.life > 0);
    parts.forEach((p) => {
      p.vy += .28; p.vx *= .985; p.x += p.vx; p.y += p.vy; p.r += p.vr; p.life -= 1;
      ctx.save(); ctx.globalAlpha = Math.min(1, p.life / 30);
      ctx.translate(p.x, p.y); ctx.rotate(p.r); ctx.fillStyle = p.c; ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h); ctx.restore();
    });
    raf = parts.length ? requestAnimationFrame(tick) : null;
    if (!raf) ctx.clearRect(0, 0, innerWidth, innerHeight);
  }
})();
