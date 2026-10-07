/* Evolve: Fitness Quest — site interactions */
(() => {
  "use strict";

  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const icon = (id, cls = "ic") => `<svg class="${cls}"><use href="#i-${id}"/></svg>`;

  $("#year").textContent = new Date().getFullYear();

  /* ---------------- Confetti ---------------- */
  const confetti = (() => {
    const cvs = $("#confetti");
    const ctx = cvs.getContext("2d");
    let parts = [];
    let raf = null;
    const colors = ["#c9bcff", "#a78bfa", "#e879f9", "#f472b6", "#fbbf24", "#4ade80", "#60a5fa"];
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      cvs.width = innerWidth * dpr;
      cvs.height = innerHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    addEventListener("resize", resize);
    const tick = () => {
      ctx.clearRect(0, 0, innerWidth, innerHeight);
      parts = parts.filter((p) => p.life > 0);
      for (const p of parts) {
        p.vy += 0.32;
        p.vx *= 0.985;
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.vr;
        p.life -= 1;
        ctx.save();
        ctx.globalAlpha = Math.min(1, p.life / 30);
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.c;
        if (p.round) {
          ctx.beginPath();
          ctx.arc(0, 0, p.s / 2, 0, Math.PI * 2);
          ctx.fill();
        } else ctx.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2);
        ctx.restore();
      }
      raf = parts.length ? requestAnimationFrame(tick) : null;
    };
    return (x, y, n = 90) => {
      if (reduceMotion) return;
      for (let i = 0; i < n; i++) {
        const a = Math.random() * Math.PI * 2;
        const v = 4 + Math.random() * 9;
        parts.push({
          x, y,
          vx: Math.cos(a) * v,
          vy: Math.sin(a) * v - 6,
          s: 6 + Math.random() * 7,
          rot: Math.random() * 6,
          vr: (Math.random() - 0.5) * 0.4,
          c: colors[(Math.random() * colors.length) | 0],
          round: Math.random() < 0.3,
          life: 70 + Math.random() * 50,
        });
      }
      if (!raf) raf = requestAnimationFrame(tick);
    };
  })();
  const burstFrom = (el, n) => {
    const r = el.getBoundingClientRect();
    confetti(r.left + r.width / 2, r.top + r.height / 2, n);
  };

  /* ---------------- Reveal on scroll ---------------- */
  const io = new IntersectionObserver(
    (entries) => entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add("in");
        io.unobserve(e.target);
      }
    }),
    { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
  );
  $$(".reveal").forEach((el, i) => {
    el.style.transitionDelay = `${(i % 4) * 70}ms`;
    io.observe(el);
  });

  /* ---------------- Nav: scrolled state, scroll XP, active link ---------------- */
  const nav = $("#nav");
  const navBar = $("#navBar");
  const navLvl = $("#navLvl");
  const toast = $("#lvlToast");
  const MAX_LVL = 10;
  let lastLvl = 1;
  let toastTimer;
  const onScroll = () => {
    const y = scrollY;
    nav.classList.toggle("scrolled", y > 20);
    const max = document.documentElement.scrollHeight - innerHeight;
    const p = max > 0 ? Math.min(1, y / max) : 0;
    const lvl = Math.min(MAX_LVL, 1 + Math.floor(p * MAX_LVL));
    const within = (p * MAX_LVL) % 1;
    navBar.style.width = `${lvl === MAX_LVL ? 100 : within * 100}%`;
    navLvl.textContent = lvl === MAX_LVL ? "MAX" : lvl;
    if (lvl > lastLvl) {
      toast.textContent = lvl === MAX_LVL ? "MAX LEVEL · You read the whole thing!" : `LEVEL ${lvl} · +XP for scrolling`;
      toast.classList.add("show");
      clearTimeout(toastTimer);
      toastTimer = setTimeout(() => toast.classList.remove("show"), 1600);
    }
    lastLvl = lvl;
  };
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  const navLinks = $$(".nav-links a");
  const sectionIO = new IntersectionObserver(
    (entries) => entries.forEach((e) => {
      if (e.isIntersecting) {
        navLinks.forEach((a) => a.classList.toggle("active", a.getAttribute("href") === `#${e.target.id}`));
      }
    }),
    { rootMargin: "-45% 0px -50% 0px" }
  );
  ["top", "quests", "journey", "stats", "features", "fridge", "badges", "wardrobe", "faq", "download"].forEach((id) => sectionIO.observe(document.getElementById(id)));

  /* ---------------- Hero parallax ---------------- */
  const hv = $("#heroVisual");
  if (hv && !reduceMotion && matchMedia("(pointer: fine)").matches) {
    const layers = $$("[data-depth]", hv);
    let tx = 0, ty = 0, cx = 0, cy = 0, running = false;
    const step = () => {
      cx += (tx - cx) * 0.08;
      cy += (ty - cy) * 0.08;
      layers.forEach((l) => {
        const d = parseFloat(l.dataset.depth);
        l.style.transform = `translate3d(${cx * d * 18}px, ${cy * d * 14}px, 0)`;
      });
      if (Math.abs(tx - cx) > 0.001 || Math.abs(ty - cy) > 0.001) requestAnimationFrame(step);
      else running = false;
    };
    $(".hero").addEventListener("pointermove", (e) => {
      tx = e.clientX / innerWidth - 0.5;
      ty = e.clientY / innerHeight - 0.5;
      if (!running) {
        running = true;
        requestAnimationFrame(step);
      }
    });
  }

  /* ---------------- Daily quests ---------------- */
  (() => {
    const card = $("#questCard");
    const quests = $$(".quest", card);
    const bar = $("#qBar");
    const xpEl = $("#qXp");
    const lvlEl = $("#qLvl");
    const msg = $("#qMsg");
    const streak = $("#qStreak");
    const streakText = $("#qStreakText");
    const nextBtn = $("#qNext");
    const dayEl = $("#qDay");
    const lvlUp = $("#levelUp");
    const NEED = 100;
    let xp = 0, lvl = 1, day = 1, streakDays = 0;

    const render = () => {
      xpEl.textContent = xp;
      lvlEl.textContent = lvl;
      bar.style.width = `${(xp / NEED) * 100}%`;
    };

    const floatXP = (btn, amount) => {
      const r = btn.getBoundingClientRect();
      const cr = card.getBoundingClientRect();
      const f = document.createElement("span");
      f.className = "xp-float";
      f.textContent = `+${amount} XP`;
      f.style.left = `${r.right - cr.left - 50}px`;
      f.style.top = `${r.top - cr.top}px`;
      card.appendChild(f);
      setTimeout(() => f.remove(), 1200);
    };

    quests.forEach((q) => q.addEventListener("click", () => {
      if (q.classList.contains("done")) return;
      q.classList.add("done");
      q.setAttribute("aria-pressed", "true");
      const amount = +q.dataset.xp;
      floatXP(q, amount);
      const doneCount = quests.filter((x) => x.classList.contains("done")).length;

      if (doneCount === 1) {
        streakDays += 1;
        streak.dataset.safe = "true";
        streakText.textContent = `${streakDays}-day streak`;
        msg.textContent = "Streak safe. One quest is all it takes.";
      } else if (doneCount === 2) {
        msg.textContent = "Two down. One to go…";
      }

      xp += amount;
      if (xp >= NEED) {
        xp -= NEED;
        bar.style.width = "100%";
        setTimeout(() => {
          lvl += 1;
          bar.style.transition = "none";
          render();
          bar.offsetWidth; // reflow so the bar restarts from the leftover XP
          bar.style.transition = "";
          lvlUp.classList.remove("show");
          void lvlUp.offsetWidth;
          lvlUp.classList.add("show");
          burstFrom(card, 140);
        }, 700);
      } else render();

      if (doneCount === 3) {
        msg.textContent = "All three cleared. That's a perfect day.";
        nextBtn.hidden = false;
      }
    }));

    nextBtn.addEventListener("click", () => {
      day += 1;
      dayEl.textContent = day;
      quests.forEach((q) => {
        q.classList.remove("done");
        q.removeAttribute("aria-pressed");
      });
      streak.dataset.safe = "false";
      streakText.textContent = `${streakDays}-day streak · at risk`;
      msg.textContent = "New day, new quests. Keep it going.";
      nextBtn.hidden = true;
    });
    render();
  })();

  /* ---------------- Journey + boss arena ---------------- */
  (() => {
    const regions = [
      {
        name: "Awakening", range: "Stages 1–8", color: "#4ade80",
        boss: {
          name: "Couch Potato King", stage: 8, xp: 500, img: "couch-potato-king",
          taunt: "“Just one more episode.”",
          reqs: ["10 workouts", "5-day streak"],
          attack: "log a workout",
          hits: ["Workout logged!", "Streak extended!", "Off the couch!"],
        },
      },
      {
        name: "Apprentice", range: "Stages 9–16", color: "#60a5fa",
        boss: {
          name: "Procrastination Demon", stage: 16, xp: 750, img: "procrastination-demon",
          taunt: "“Tomorrow. Definitely tomorrow.”",
          reqs: ["25 workouts", "10-day streak", "120 meditation minutes"],
          attack: "start today",
          hits: ["Reminder set!", "Did it today!", "Tomorrow cancelled!"],
        },
      },
      {
        name: "Warrior", range: "Stages 17–24", color: "#fb7185",
        boss: {
          name: "Stress Monster", stage: 24, xp: 1000, img: "stress-monster",
          taunt: "“Check your notifications. All of them.”",
          reqs: ["60 workouts", "300 meditation minutes", "21-day streak"],
          attack: "5-minute reset",
          hits: ["Deep breath!", "Five calm minutes!", "Notifications muted!"],
        },
      },
      {
        name: "Champion", range: "Stages 25–32", color: "#fbbf24",
        boss: {
          name: "Junk Food Goblin", stage: 32, xp: 1500, img: "junk-food-goblin",
          taunt: "“It's 11 PM. You deserve a snack.”",
          reqs: ["150 meals logged", "30 days of meal logging in a row", "100 workouts"],
          attack: "scan the fridge",
          hits: ["Fridge scanned!", "Meal logged!", "Snack denied!"],
        },
      },
      {
        name: "Mythic", range: "Stages 33–40", color: "#c084fc",
        boss: {
          name: "Laziness Dragon", stage: 40, xp: 5000, img: "laziness-dragon",
          damaged: "laziness-dragon-damaged", defeated: "laziness-dragon-defeated",
          taunt: "“Get up? Never heard of it.”",
          reqs: ["200 workouts", "90-day streak", "1,500 meditation minutes", "100 cardio miles", "300 meals logged"],
          attack: "get up",
          hits: ["Got up!", "Went for a run!", "90 days strong!", "Final blow!"],
        },
      },
    ];

    const track = $("#journeyTrack");
    const arena = $("#arena");
    const bossWrap = $("#bossWrap");
    const bossImg = $("#bossImg");
    const dmgLayer = $("#dmgLayer");
    const stamp = $("#defeatStamp");
    const hpBar = $("#hpBar");
    const hpGhost = $("#hpGhost");
    const hpNum = $("#hpNum");
    const attackBtn = $("#attackBtn");
    const attackLabel = $("#attackLabel");
    const rematch = $("#rematchBtn");
    const reqList = $("#bossReqs");
    const cleared = new Set();
    let current = 0, hp = 100, hitIdx = 0;

    track.innerHTML = regions.map((r, i) => `
      <button class="region" role="tab" aria-selected="${i === 0}" data-i="${i}" style="--c:${r.color}">
        <span class="check">${icon("check")}</span>
        <div class="region-top"><span class="region-name">${r.name}</span><span class="region-range">${r.range}</span></div>
        <div class="region-dots">${"<i></i>".repeat(7)}<span class="region-boss"><img src="assets/bosses/${r.boss.img}.webp" alt="" loading="lazy"></span></div>
      </button>`).join("");
    const regionBtns = $$(".region", track);

    const setImg = (name) => { bossImg.src = `assets/bosses/${name}.webp`; };

    const load = (i) => {
      current = i;
      const r = regions[i], b = r.boss;
      regionBtns.forEach((btn, j) => btn.setAttribute("aria-selected", j === i));
      arena.style.setProperty("--c", r.color);
      bossWrap.classList.add("swap");
      setTimeout(() => {
        setImg(b.img);
        bossImg.alt = `The ${b.name}`;
        bossWrap.classList.remove("swap");
      }, 180);
      $("#bossName").textContent = b.name;
      $("#bossRegion").textContent = `${r.name} · Stage ${b.stage}`;
      $("#bossReward").textContent = `+${b.xp.toLocaleString()} XP`;
      $("#bossTaunt").textContent = b.taunt;
      reqList.innerHTML = b.reqs.map((q) => `<li>${icon("check")}${q}</li>`).join("");
      attackLabel.textContent = `Attack: ${b.attack}`;
      reset(cleared.has(i));
    };

    const setHP = (v) => {
      hp = Math.max(0, v);
      hpBar.style.width = `${hp}%`;
      hpGhost.style.width = `${hp}%`;
      hpNum.textContent = `${Math.round(hp)} / 100`;
    };

    const reset = (alreadyCleared) => {
      hitIdx = 0;
      dmgLayer.innerHTML = "";
      if (alreadyCleared) {
        const b = regions[current].boss;
        if (b.defeated) setTimeout(() => setImg(b.defeated), 190);
        setHP(0);
        bossWrap.classList.add("dead");
        stamp.classList.add("show");
        attackBtn.disabled = true;
        rematch.hidden = false;
        $$("li", reqList).forEach((li) => li.classList.add("met"));
      } else {
        setHP(100);
        bossWrap.classList.remove("dead");
        stamp.classList.remove("show");
        attackBtn.disabled = false;
        rematch.hidden = true;
      }
    };

    regionBtns.forEach((btn) => btn.addEventListener("click", () => load(+btn.dataset.i)));

    attackBtn.addEventListener("click", () => {
      if (hp <= 0) return;
      const b = regions[current].boss;
      const hitsNeeded = b.hits.length;
      const isLast = hitIdx === hitsNeeded - 1;
      const dmg = isLast ? hp : Math.round(100 / hitsNeeded + (Math.random() * 6 - 3));
      const crit = isLast || Math.random() < 0.25;
      const label = b.hits[hitIdx] || "Hit!";
      hitIdx += 1;

      // mark requirements met in proportion to damage dealt
      const lis = $$("li", reqList);
      const metCount = Math.ceil((hitIdx / hitsNeeded) * lis.length);
      lis.forEach((li, k) => li.classList.toggle("met", k < metCount));

      bossWrap.classList.remove("hit");
      void bossWrap.offsetWidth;
      bossWrap.classList.add("hit");

      const stage = $(".arena-stage").getBoundingClientRect();
      const n = document.createElement("div");
      n.className = `dmg${crit ? " crit" : ""}`;
      n.innerHTML = `-${dmg}<small>${label.toUpperCase()}</small>`;
      n.style.left = `${40 + Math.random() * 20}%`;
      n.style.top = `${22 + Math.random() * 20}%`;
      dmgLayer.appendChild(n);
      setTimeout(() => n.remove(), 1000);
      const s = document.createElement("div");
      s.className = "slash";
      s.style.left = `${stage.width / 2 - 110 + (Math.random() * 60 - 30)}px`;
      s.style.top = `${stage.height * (0.35 + Math.random() * 0.25)}px`;
      s.style.transform = `rotate(${-35 + Math.random() * 70}deg)`;
      dmgLayer.appendChild(s);
      setTimeout(() => s.remove(), 400);

      setHP(hp - dmg);

      if (b.damaged && hp > 0 && hp <= 55) setImg(b.damaged);

      if (hp <= 0) {
        attackBtn.disabled = true;
        cleared.add(current);
        regionBtns[current].classList.add("cleared");
        setTimeout(() => {
          if (b.defeated) setImg(b.defeated);
          bossWrap.classList.add("dead");
          stamp.classList.add("show");
          rematch.hidden = false;
          burstFrom(stamp, 160);
          if (cleared.size === regions.length) {
            $("#bossTaunt").textContent = "All five bosses down. Now go do it for real.";
          }
        }, 380);
      }
    });

    rematch.addEventListener("click", () => {
      cleared.delete(current);
      regionBtns[current].classList.remove("cleared");
      const b = regions[current].boss;
      setImg(b.img);
      $$("li", reqList).forEach((li) => li.classList.remove("met"));
      reset(false);
    });

    load(0);
  })();

  /* ---------------- Five stats radar ---------------- */
  (() => {
    const stats = [
      { name: "Strength", short: "STR", color: "#ff6b81", v: 6 },
      { name: "Cardio", short: "CAR", color: "#4ade80", v: 7 },
      { name: "Mind", short: "MND", color: "#818cf8", v: 3 },
      { name: "Nutrition", short: "NUT", color: "#fb923c", v: 5 },
      { name: "Consistency", short: "CON", color: "#facc15", v: 4 },
    ];
    const MAX = 10;
    const svg = $("#radar");
    const rows = $("#statRows");
    const C = 160, R = 118;
    const ang = (i) => (-90 + i * 72) * (Math.PI / 180);
    const pt = (i, f) => [C + Math.cos(ang(i)) * R * f, C + Math.sin(ang(i)) * R * f];
    const shown = stats.map((s) => s.v);

    let html = `<defs><radialGradient id="radarFill" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="#e879f9" stop-opacity=".55"/><stop offset="100%" stop-color="#8b5cf6" stop-opacity=".3"/></radialGradient></defs>`;
    [0.25, 0.5, 0.75, 1].forEach((f) => {
      html += `<polygon class="grid" points="${stats.map((_, i) => pt(i, f).join(",")).join(" ")}"/>`;
    });
    stats.forEach((s, i) => {
      const [x, y] = pt(i, 1);
      html += `<line class="axis" x1="${C}" y1="${C}" x2="${x}" y2="${y}"/>`;
      const [lx, ly] = pt(i, 1.2);
      html += `<text x="${lx}" y="${ly + 4}" text-anchor="middle" style="fill:${s.color}">${s.short}</text>`;
    });
    html += `<polygon class="shape" id="radarShape"/>`;
    stats.forEach((s, i) => { html += `<circle class="vtx" r="5" id="vtx${i}" fill="${s.color}"/>`; });
    svg.innerHTML = html;
    const shape = $("#radarShape");

    rows.innerHTML = stats.map((s) => `
      <li style="--c:${s.color}">
        <span class="sn"><i></i>${s.name}</span><span class="sl">LV ${s.v}</span>
        <span class="sb"><i style="width:${(s.v / MAX) * 100}%"></i></span>
      </li>`).join("");
    const rowEls = $$("li", rows);

    const drawShape = () => {
      shape.setAttribute("points", shown.map((v, i) => pt(i, v / MAX).join(",")).join(" "));
      shown.forEach((v, i) => {
        const [x, y] = pt(i, v / MAX);
        const c = $(`#vtx${i}`);
        c.setAttribute("cx", x);
        c.setAttribute("cy", y);
      });
    };

    let anim = null;
    const animate = () => {
      let moving = false;
      shown.forEach((v, i) => {
        const t = stats[i].v;
        const nv = v + (t - v) * 0.14;
        shown[i] = Math.abs(t - nv) < 0.01 ? t : nv;
        if (shown[i] !== t) moving = true;
      });
      drawShape();
      anim = moving ? requestAnimationFrame(animate) : null;
    };

    const update = () => {
      const vals = stats.map((s) => s.v);
      const min = Math.min(...vals), max = Math.max(...vals);
      const balance = Math.round((min / max) * 100);
      const low = stats.findIndex((s) => s.v === min);
      $("#balNum").textContent = balance;
      $("#balHint").textContent = balance >= 90 ? "Beautifully balanced" : `Focus on ${stats[low].name}`;
      rowEls.forEach((li, i) => {
        $(".sl", li).textContent = stats[i].v >= MAX ? "MAX" : `LV ${stats[i].v}`;
        $(".sb i", li).style.width = `${(stats[i].v / MAX) * 100}%`;
        li.classList.toggle("low", i === low && balance < 90);
      });
      if (!anim) anim = requestAnimationFrame(animate);
    };

    $$("#statActions button").forEach((b) => {
      const i = +b.dataset.s;
      b.style.setProperty("--c", stats[i].color);
      b.addEventListener("click", () => {
        if (stats[i].v >= MAX) {
          // everything maxed? reset the run for replay value
          if (stats.every((s) => s.v >= MAX)) {
            stats.forEach((s, k) => (s.v = [6, 7, 3, 5, 4][k]));
            update();
          }
          return;
        }
        stats[i].v += 1;
        update();
        if (stats.every((s) => s.v >= MAX)) burstFrom($("#radar"), 140);
      });
    });

    drawShape();
    update();
  })();

  /* ---------------- Feature tabs ---------------- */
  (() => {
    const tabs = $$("#featTabs button");
    const panels = $$(".feat-panel");
    const shots = $$(".feat-phone .fs");
    const DUR = 7000;
    let idx = 0, timer = null, auto = true;

    const show = (i, fromUser) => {
      idx = i;
      tabs.forEach((t, j) => {
        t.setAttribute("aria-selected", j === i);
        const bar = $("i", t);
        bar.classList.remove("run");
        if (j === i && auto && !fromUser) {
          void bar.offsetWidth;
          bar.style.setProperty("--dur", `${DUR}ms`);
          bar.classList.add("run");
        }
      });
      panels.forEach((p, j) => p.classList.toggle("active", j === i));
      shots.forEach((s, j) => s.classList.toggle("active", j === i));
    };

    const schedule = () => {
      clearTimeout(timer);
      if (!auto || reduceMotion) return;
      timer = setTimeout(() => {
        show((idx + 1) % tabs.length);
        schedule();
      }, DUR);
    };

    tabs.forEach((t, i) => t.addEventListener("click", () => {
      auto = false;
      clearTimeout(timer);
      show(i, true);
    }));

    // only autoplay while visible
    new IntersectionObserver((es) => es.forEach((e) => {
      if (e.isIntersecting && auto) { show(idx); schedule(); }
      else clearTimeout(timer);
    }), { threshold: 0.35 }).observe($(".feat-stage"));
  })();

  /* ---------------- Fridge demo ---------------- */
  (() => {
    const ingredients = ["hummus", "carrots", "bell peppers", "yogurt", "eggs", "cheese slices", "cauliflower", "cherries", "strawberries", "asparagus", "lemon", "cherry tomatoes", "overnight oats", "orange slices", "almond milk", "juice", "sparkling water"];
    const recipes = [
      { name: "Vegetable Hummus Wrap", time: "15 min", cal: 400, p: 15, c: 50, f: 18, uses: ["hummus", "carrots", "bell peppers"], extra: "whole wheat tortillas" },
      { name: "Cherry Strawberry Smoothie", time: "10 min", cal: 300, p: 5, c: 40, f: 2, uses: ["cherries", "strawberries", "yogurt"] },
      { name: "Cauliflower & Cheese Omelette", time: "20 min", cal: 300, p: 18, c: 15, f: 22, uses: ["eggs", "cauliflower", "cheese slices"], extra: "salt, pepper, olive oil" },
    ];
    const selected = new Set(ingredients);
    const chips = $("#fdChips");
    const list = $("#fdRecipes");
    const count = $("#fdCount");

    chips.innerHTML = ingredients.map((n) => `<button class="chip" aria-pressed="true" data-n="${n}">${icon("check")}${n}</button>`).join("");
    list.innerHTML = recipes.map((r, i) => `
      <div class="recipe" data-i="${i}">
        <h4>${r.name}</h4>
        <div class="meta">${r.time} · ${r.cal} cal</div>
        <div class="macros"><span class="p"><b>${r.p}g</b>protein</span><span class="c"><b>${r.c}g</b>carbs</span><span class="f"><b>${r.f}g</b>fat</span></div>
        <div class="status"></div>
      </div>`).join("");
    const cards = $$(".recipe", list);

    const render = () => {
      count.textContent = selected.size;
      $$(".chip", chips).forEach((c) => c.setAttribute("aria-pressed", selected.has(c.dataset.n)));
      recipes.forEach((r, i) => {
        const missing = r.uses.filter((u) => !selected.has(u));
        const card = cards[i];
        card.classList.toggle("missing", missing.length > 0);
        card.classList.toggle("ready", missing.length === 0);
        $(".status", card).innerHTML = missing.length
          ? `Needs ${missing.join(", ")}`
          : `${icon("check")}Ready${r.extra ? ` · may need ${r.extra}` : ""}`;
      });
    };

    chips.addEventListener("click", (e) => {
      const c = e.target.closest(".chip");
      if (!c) return;
      const n = c.dataset.n;
      selected.has(n) ? selected.delete(n) : selected.add(n);
      render();
    });
    $("#fdAll").addEventListener("click", () => { ingredients.forEach((n) => selected.add(n)); render(); });
    $("#fdNone").addEventListener("click", () => { selected.clear(); render(); });
    render();

    // play the screen recording only when on screen
    const vid = $("#fridge video");
    if (vid) {
      new IntersectionObserver((es) => es.forEach((e) => {
        if (e.isIntersecting) vid.play().catch(() => {});
        else vid.pause();
      }), { threshold: 0.25 }).observe(vid);
    }
  })();

  /* ---------------- Badges ---------------- */
  (() => {
    const badges = [
      ["first-steps", "First Steps", "Complete your first activity"],
      ["iron-starter", "Iron Starter", "Complete your first workout"],
      ["clean-eater", "Clean Eater", "Log your first meal"],
      ["inner-peace", "Inner Peace", "Complete your first meditation"],
      ["first-mile", "First Mile", "Run your first mile"],
      ["gym-rat", "Gym Rat", "Complete 50 workouts"],
      ["road-runner", "Road Runner", "Run 100 miles total"],
      ["zen-master", "Zen Master", "Complete 100 meditations"],
      ["macro-master", "Macro Master", "Hit your macro goals on 30 days"],
      ["streak-master", "Streak Master", "Reach a 30-day streak"],
      ["marathon-legend", "Marathon Legend", "Run 500 miles total"],
      ["iron-legend", "Iron Legend", "Complete 500 workouts"],
      ["enlightened", "Enlightened", "Complete 365 meditations"],
      ["nutrition-king", "Nutrition King", "Hit your macro goals on 365 days"],
    ];
    const shelf = $("#shelf");
    const countEl = $("#badgeCount");
    const desc = $("#badgeDesc");
    shelf.innerHTML = badges.map(([id, name, d]) => `
      <button class="badge" data-name="${name}" data-desc="${d}" aria-label="${name}: ${d}" aria-pressed="false">
        <img src="assets/badges/${id}.webp" alt="" loading="lazy">
        ${icon("lock", "ic lock")}
        <span class="shine"></span>
      </button>`).join("");
    let n = 0;
    const describe = (b) => { desc.textContent = `${b.dataset.name} — ${b.dataset.desc}`; };
    $$(".badge", shelf).forEach((b) => {
      b.addEventListener("mouseenter", () => describe(b));
      b.addEventListener("focus", () => describe(b));
      b.addEventListener("click", () => {
        describe(b);
        if (b.classList.contains("on")) return;
        b.classList.add("on", "pop");
        b.setAttribute("aria-pressed", "true");
        setTimeout(() => b.classList.remove("pop"), 1000);
        n += 1;
        countEl.textContent = n;
        burstFrom(b, n === badges.length ? 200 : 40);
        if (n === badges.length) desc.textContent = "Full shelf! Now earn them for real.";
      });
    });
  })();

  /* ---------------- Wardrobe ---------------- */
  (() => {
    const suits = [
      ["orbital-seraph", "Orbital Seraph", "#fbbf24", false],
      ["paradox-ronin", "Paradox Ronin", "#60a5fa", false],
      ["prism-wraith", "Prism Wraith", "#f472b6", false],
      ["void-strider", "Void Strider", "#a78bfa", true],
      ["cryo-velocity", "Cryo Velocity", "#67e8f9", true],
      ["bloom-sovereign", "Bloom Sovereign", "#fb7185", false],
      ["solar-vanguard", "Solar Vanguard", "#fcd34d", true],
      ["ion-revenant", "Ion Revenant", "#f87171", true],
      ["verdant-aegis", "Verdant Aegis", "#4ade80", true],
      ["starter-no-equipment", "Starter Kit", "#c4b5fd", true],
    ];
    const rack = $("#rack");
    let gender = "male";
    const src = ([id, , , g]) => `assets/suits/${id}${g ? `-${gender}` : ""}.webp`;
    const renderRack = () => {
      rack.innerHTML = suits.map((s) => `
        <div class="suit" style="--c:${s[2]}"><img src="${src(s)}" alt="${s[1]} suit" loading="lazy"><span>${s[1]}</span></div>`).join("");
    };
    renderRack();

    const swap = (img, newSrc) => {
      if (img.getAttribute("src") === newSrc) return;
      img.classList.add("fading");
      setTimeout(() => {
        img.src = newSrc;
        img.onload = () => img.classList.remove("fading");
      }, 220);
    };

    $$("[data-g]").forEach((b) => b.addEventListener("click", () => {
      gender = b.dataset.g;
      $$("[data-g]").forEach((x) => x.setAttribute("aria-pressed", x === b));
      $$("#podium [data-suit]").forEach((img) => swap(img, `assets/suits/${img.dataset.suit}-${gender}.webp`));
      renderRack();
    }));
    $$("[data-goat]").forEach((b) => b.addEventListener("click", () => {
      $$("[data-goat]").forEach((x) => x.setAttribute("aria-pressed", x === b));
      swap($("#goatImg"), `assets/suits/apex-goat-${b.dataset.goat}.webp`);
    }));

    const scrollBy = (d) => rack.scrollBy({ left: d * (rack.clientWidth * 0.8), behavior: "smooth" });
    $("#rackPrev").addEventListener("click", () => scrollBy(-1));
    $("#rackNext").addEventListener("click", () => scrollBy(1));
  })();

  /* ---------------- Dragon ---------------- */
  (() => {
    const d = $("#dragon");
    const bubble = $("#dragonBubble");
    const lines = ["Hey, you!", "Ready to evolve?", "Tap me again!", "Small wins!", "Big evolution!", "Let's gooo", "Rawr (supportively)"];
    let i = 0;
    d.addEventListener("click", () => {
      i = (i + 1) % lines.length;
      bubble.textContent = lines[i];
      d.classList.remove("wiggle");
      void d.offsetWidth;
      d.classList.add("wiggle");
      if (i % 3 === 0) burstFrom(d, 50);
    });
  })();
})();
