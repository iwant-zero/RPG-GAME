(() => {
  "use strict";
  window.__BLADE_BOOTED = true;

  const $ = (id) => document.getElementById(id);
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const now = () => performance.now();

  const el = {
    boot: $("boot"),
    stats: $("stats"),
    hpFill: $("hp-fill"),
    expFill: $("exp-fill"),
    score: $("score"),
    wave: $("wave"),
    gold: $("gold"),
    token: $("token"),
    weapon: $("weapon"),
    awk: $("awk-timer"),
    cdDash: $("cd-dash"),
    cdQ: $("cd-q"),
    cdE: $("cd-e"),
    cdR: $("cd-r"),
    itemMsg: $("item-msg"),
    hitFlash: $("hit-flash"),

    canvas: $("gameCanvas"),

    pauseBtn: $("pause-btn"),
    touch: $("touch"),
    tLeft: $("t-left"),
    tRight: $("t-right"),
    tJump: $("t-jump"),
    tDash: $("t-dash"),
    tQ: $("t-q"),
    tE: $("t-e"),
    tR: $("t-r"),

    titleMenu: $("title-menu"),
    pauseMenu: $("pause-menu"),
    rewardMenu: $("reward-menu"),
    optionsMenu: $("options-menu"),
    gameOver: $("overlay"),

    weaponMenu: $("weapon-menu"),
    weaponSub: $("weapon-sub"),
    wBlade: $("w-blade"),
    wSpear: $("w-spear"),
    wGun: $("w-gun"),
    btnWeaponCancel: $("btn-weapon-cancel"),

    titleActive: $("title-active"),
    tokenLineTitle: $("token-line-title"),
    slotActive: [null, $("slot-active-1"), $("slot-active-2"), $("slot-active-3")],
    slotBadge: [null, $("slot-badge-1"), $("slot-badge-2"), $("slot-badge-3")],
    slotMeta:  [null, $("slot-meta-1"),  $("slot-meta-2"),  $("slot-meta-3")],
    slotLoad:  [null, $("slot-load-1"),  $("slot-load-2"),  $("slot-load-3")],
    slotNew:   [null, $("slot-new-1"),   $("slot-new-2"),   $("slot-new-3")],
    slotDel:   [null, $("slot-del-1"),   $("slot-del-2"),   $("slot-del-3")],
    btnOpenOptionsTitle: $("btn-open-options-title"),

    activeSlotNote: $("active-slot-note"),
    tokenLinePause: $("token-line-pause"),
    miniSlot: [null, $("mini-slot-1"), $("mini-slot-2"), $("mini-slot-3")],
    btnResume: $("btn-resume"),
    btnSave: $("btn-save"),
    btnOpenOptionsPause: $("btn-open-options-pause"),
    btnRestart: $("btn-restart"),
    btnToTitle: $("btn-to-title"),

    rewardSub: $("reward-sub"),
    rewardBtn: [$("reward-0"), $("reward-1"), $("reward-2")],
    rewardName: [$("reward-name-0"), $("reward-name-1"), $("reward-name-2")],
    rewardDesc: [$("reward-desc-0"), $("reward-desc-1"), $("reward-desc-2")],

    optShake: $("opt-shake"),
    optFlash: $("opt-flash"),
    optSlowmo: $("opt-slowmo"),
    btnOptionsBack: $("btn-options-back"),

    finalResult: $("final-result"),
    tokenLineOver: $("token-line-over"),
    overNote: $("over-note"),
    goLoad: [null, $("go-load-1"), $("go-load-2"), $("go-load-3")],
    btnRetry: $("btn-retry"),
    btnOverTitle: $("btn-over-title"),
  };

  // ===== View =====
  const ctx = el.canvas.getContext("2d");
  const WORLD = { w: 960, h: 540 };
  const FLOOR_Y = 440;
  const view = { w: 0, h: 0, dpr: 1, scale: 1, ox: 0, oy: 0 };

  function fit() {
    view.w = Math.max(320, innerWidth);
    view.h = Math.max(240, innerHeight);
    view.dpr = Math.max(1, window.devicePixelRatio || 1);

    el.canvas.width = Math.floor(view.w * view.dpr);
    el.canvas.height = Math.floor(view.h * view.dpr);
    el.canvas.style.width = view.w + "px";
    el.canvas.style.height = view.h + "px";

    view.scale = Math.min(view.w / WORLD.w, view.h / WORLD.h);
    view.ox = (view.w - WORLD.w * view.scale) / 2;
    view.oy = (view.h - WORLD.h * view.scale) / 2;
  }
  addEventListener("resize", fit);
  fit();

  function beginWorld() {
    ctx.setTransform(view.dpr, 0, 0, view.dpr, 0, 0);
    ctx.clearRect(0, 0, view.w, view.h);
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, view.w, view.h);

    ctx.save();
    ctx.translate(view.ox, view.oy);
    ctx.scale(view.scale, view.scale);
  }
  function endWorld() {
    ctx.restore();
  }

  // ===== Assets =====
  const img = {
    p: new Image(), e: new Image(), b: new Image(), bg: new Image(),
    ln: new Image(),
    itCore: new Image(), itThunder: new Image(), itHeal: new Image(),
  };
  img.p.src = "assets/player.png";
  img.e.src = "assets/enemy.png";
  img.b.src = "assets/boss.png";
  img.bg.src = "assets/background.png";
  img.ln.src = "assets/lightning.png";
  img.itCore.src = "assets/item_core.png";
  img.itThunder.src = "assets/item_thunder.png";
  img.itHeal.src = "assets/item_heal.png";

  const bgm = new Audio("assets/bgm.mp3");
  bgm.loop = true;
  bgm.volume = 0.35;

  // ===== Options =====
  const OPT_KEY = "blade_options_v1";
  const options = { shake: true, flash: true, slowmo: true };

  function loadOptions() {
    try {
      const raw = localStorage.getItem(OPT_KEY);
      if (!raw) return;
      const o = JSON.parse(raw);
      options.shake = !!o.shake;
      options.flash = !!o.flash;
      options.slowmo = !!o.slowmo;
    } catch {}
  }
  function saveOptions() {
    localStorage.setItem(OPT_KEY, JSON.stringify(options));
  }
  loadOptions();
  el.optShake.checked = options.shake;
  el.optFlash.checked = options.flash;
  el.optSlowmo.checked = options.slowmo;

  // ===== Save =====
  const SAVE_VER = 1;
  const ACTIVE_SLOT_KEY = "blade_active_slot_v1";
  const SLOT_KEY = (n) => `blade_slot_${n}_v${SAVE_VER}`;

  let activeSlot = Number(localStorage.getItem(ACTIVE_SLOT_KEY) || "1");
  if (![1,2,3].includes(activeSlot)) activeSlot = 1;

  function readSlot(n) {
    try { const raw = localStorage.getItem(SLOT_KEY(n)); return raw ? JSON.parse(raw) : null; }
    catch { return null; }
  }
  function writeSlot(n, data) { localStorage.setItem(SLOT_KEY(n), JSON.stringify(data)); }
  function deleteSlot(n) { localStorage.removeItem(SLOT_KEY(n)); }

  function fmtTime(ts) {
    try { return new Date(ts).toLocaleString(); } catch { return ""; }
  }

  // ===== State =====
  const STATE = { TITLE:"title", PLAY:"play", PAUSE:"pause", REWARD:"reward", OPTIONS:"options", GAMEOVER:"gameover", WEAPON:"weapon" };
  let state = STATE.TITLE;

  // ===== Weapons =====
  const WEAPONS = {
    blade: { name:"BLADE", auraRadius: 165, auraDpsMul: 2.6, gun: false },
    spear: { name:"SPEAR", auraRadius: 210, auraDpsMul: 2.1, gun: false },
    gun:   { name:"GUN",   auraRadius: 110, auraDpsMul: 1.4, gun: true  },
  };
  let weaponId = "blade";

  // ===== Game vars =====
  let wave = 1, level = 1, exp = 0, score = 0, gold = 0;
  let continueToken = 1;
  let bossSpawnedAtLevel = 0;

  // slowmo + perfect dodge
  let slowmo = 0;            // remaining seconds (game-time)
  let slowmoHold = 0;        // tiny lock to prevent spamming
  const SLOWMO_TIME = 0.5;
  const SLOWMO_SCALE = 0.35; // time scale while slowmo

  const player = {
    x: WORLD.w * 0.5, y: FLOOR_Y - 110,
    w: 70, h: 110,
    vx: 0, vy: 0,
    grounded: true,
    dir: 1,
    hp: 100, maxHp: 100,
    baseAtk: 42,

    moveSpeed: 360,
    dashCD: 0,
    invuln: 0,

    qCD: 0, eCD: 0, rCD: 0,
  };

  let coreStack = 0;
  let overdrive = 0;

  const enemies = [];
  const items = [];
  const lightnings = [];
  const after = [];
  const bullets = [];      // GUN
  const hazards = [];      // boss shockwave etc

  // ===== Input =====
  const keys = Object.create(null);
  const TAP_MS = 130;
  const TAP_NUDGE = 16;

  const tap = { leftAt: 0, rightAt: 0 };

  function setKey(code, v) { keys[code] = v; }
  function requestAudio() { if (bgm.paused) bgm.play().catch(()=>{}); }

  addEventListener("keydown", (e) => {
    if (e.code === "KeyP" || e.code === "Escape") {
      if (state === STATE.PLAY) openPause();
      else if (state === STATE.PAUSE) closePause();
      return;
    }
    if (!keys[e.code]) {
      if (e.code === "KeyA" || e.code === "ArrowLeft") tap.leftAt = now();
      if (e.code === "KeyD" || e.code === "ArrowRight") tap.rightAt = now();
    }
    setKey(e.code, true);
    requestAudio();
  });

  addEventListener("keyup", (e) => {
    setKey(e.code, false);
    if (state !== STATE.PLAY) return;

    if (e.code === "KeyA" || e.code === "ArrowLeft") {
      const dt = now() - tap.leftAt;
      if (dt > 0 && dt <= TAP_MS) player.x = clamp(player.x - TAP_NUDGE, 0, WORLD.w - player.w);
    }
    if (e.code === "KeyD" || e.code === "ArrowRight") {
      const dt = now() - tap.rightAt;
      if (dt > 0 && dt <= TAP_MS) player.x = clamp(player.x + TAP_NUDGE, 0, WORLD.w - player.w);
    }
  });

  // Touch
  const isTouch = !!(window.matchMedia && matchMedia("(pointer:coarse)").matches);
  el.pauseBtn.style.display = "block";
  if (isTouch) el.touch.style.display = "flex";

  function bindTouch(btn, down, up) {
    if (!btn) return;
    const d = (ev) => { ev.preventDefault(); down(); requestAudio(); };
    const u = (ev) => { ev.preventDefault(); up(); };
    btn.addEventListener("pointerdown", d);
    btn.addEventListener("pointerup", u);
    btn.addEventListener("pointercancel", u);
    btn.addEventListener("pointerleave", u);
  }

  bindTouch(el.tLeft, () => { setKey("ArrowLeft", true); tap.leftAt = now(); }, () => {
    setKey("ArrowLeft", false);
    const dt = now() - tap.leftAt;
    if (dt > 0 && dt <= TAP_MS) player.x = clamp(player.x - TAP_NUDGE, 0, WORLD.w - player.w);
  });
  bindTouch(el.tRight, () => { setKey("ArrowRight", true); tap.rightAt = now(); }, () => {
    setKey("ArrowRight", false);
    const dt = now() - tap.rightAt;
    if (dt > 0 && dt <= TAP_MS) player.x = clamp(player.x + TAP_NUDGE, 0, WORLD.w - player.w);
  });
  bindTouch(el.tJump, () => setKey("Space", true), () => setKey("Space", false));
  bindTouch(el.tDash, () => setKey("ShiftLeft", true), () => setKey("ShiftLeft", false));
  bindTouch(el.tQ, () => setKey("KeyQ", true), () => setKey("KeyQ", false));
  bindTouch(el.tE, () => setKey("KeyE", true), () => setKey("KeyE", false));
  bindTouch(el.tR, () => setKey("KeyR", true), () => setKey("KeyR", false));

  el.pauseBtn.addEventListener("click", () => {
    if (state === STATE.PLAY) openPause();
    else if (state === STATE.PAUSE) closePause();
  });

  // ===== UI helpers =====
  function showToast(text) {
    el.itemMsg.textContent = text;
    el.itemMsg.style.display = "block";
    setTimeout(() => { el.itemMsg.style.display = "none"; }, 1200);
  }

  function hitFlash() {
    if (!options.flash) return;
    el.hitFlash.style.opacity = "1";
    setTimeout(() => { el.hitFlash.style.opacity = "0"; }, 60);
  }

  function setMenu(showEl) {
    el.titleMenu.style.display = "none";
    el.pauseMenu.style.display = "none";
    el.rewardMenu.style.display = "none";
    el.optionsMenu.style.display = "none";
    el.gameOver.style.display = "none";
    el.weaponMenu.style.display = "none";
    if (showEl) showEl.style.display = "flex";
  }

  function refreshHUD() {
    el.stats.textContent = `LV.${level} 에테르 기사`;
    el.hpFill.style.width = `${clamp((player.hp / player.maxHp) * 100, 0, 100)}%`;
    el.expFill.style.width = `${clamp(exp, 0, 100)}%`;
    el.score.textContent = `SCORE: ${score}`;
    el.wave.textContent = String(wave);
    el.gold.textContent = String(gold);
    el.token.textContent = String(continueToken);
    el.weapon.textContent = WEAPONS[weaponId]?.name || "BLADE";

    el.cdDash.textContent = player.dashCD.toFixed(1);
    el.cdQ.textContent = player.qCD.toFixed(1);
    el.cdE.textContent = player.eCD.toFixed(1);
    el.cdR.textContent = player.rCD.toFixed(1);

    if (overdrive > 0) {
      el.awk.style.display = "block";
      el.awk.textContent = `OVERDRIVE: ${Math.max(0, overdrive).toFixed(1)}s (x${coreStack})`;
    } else {
      el.awk.style.display = "none";
    }
  }

  function refreshTokenLines() {
    el.tokenLineTitle.textContent = `이어하기 토큰: ${continueToken}/1`;
    el.tokenLinePause.textContent = `이어하기 토큰: ${continueToken}/1`;
    el.tokenLineOver.textContent = `이어하기 토큰: ${continueToken}/1`;
  }

  function setActiveSlot(n) {
    activeSlot = n;
    localStorage.setItem(ACTIVE_SLOT_KEY, String(activeSlot));
    refreshSlotUI();
    refreshTokenLines();
    showToast(`ACTIVE SLOT: ${activeSlot}`);
  }

  function slotSummary(s) {
    if (!s) return { badge: "EMPTY", meta: "No save data." };
    const lines = [
      `TIME: ${fmtTime(s.time || Date.now())}`,
      `WAVE: ${s.wave ?? 1}`,
      `LV: ${s.level ?? 1} (EXP ${s.exp ?? 0}%)`,
      `SCORE: ${s.score ?? 0}`,
      `GOLD: ${s.gold ?? 0}`,
      `TOKEN: ${s.continueToken ?? 1}/1`,
      `WEAPON: ${(WEAPONS[s.weaponId]?.name) || "BLADE"}`,
      `CHECKPOINT: ${s.checkpointTag || "none"}`,
    ];
    return { badge: "SAVED", meta: lines.join("\n") };
  }

  function refreshSlotUI() {
    for (let i=1; i<=3; i++) {
      const s = readSlot(i);
      const sum = slotSummary(s);
      el.slotBadge[i].textContent = sum.badge;
      el.slotMeta[i].textContent = sum.meta;
      el.slotActive[i].style.display = (i === activeSlot) ? "inline-flex" : "none";
      el.slotLoad[i].disabled = !s;
      el.slotDel[i].disabled = !s;
    }
    el.titleActive.textContent = `ACTIVE SLOT: ${activeSlot}`;
    el.activeSlotNote.textContent = `ACTIVE: SLOT ${activeSlot}`;
  }

  // ===== Save snapshot =====
  function exportSnapshot(checkpointTag = "") {
    return {
      ver: SAVE_VER,
      time: Date.now(),
      checkpointTag,
      wave, level, exp, score, gold,
      continueToken,
      bossSpawnedAtLevel,
      weaponId,
      player: { x: player.x, y: player.y, hp: player.hp, maxHp: player.maxHp, baseAtk: player.baseAtk },
      core: { coreStack, overdrive },
    };
  }

  function importSnapshot(snap) {
    wave = snap.wave ?? 1;
    level = snap.level ?? 1;
    exp = snap.exp ?? 0;
    score = snap.score ?? 0;
    gold = snap.gold ?? 0;
    continueToken = (snap.continueToken ?? 1) ? 1 : 0;
    bossSpawnedAtLevel = snap.bossSpawnedAtLevel ?? 0;

    weaponId = (snap.weaponId && WEAPONS[snap.weaponId]) ? snap.weaponId : "blade";

    player.x = (snap.player?.x ?? WORLD.w * 0.5);
    player.y = (snap.player?.y ?? FLOOR_Y - player.h);
    player.hp = snap.player?.hp ?? 100;
    player.maxHp = snap.player?.maxHp ?? 100;
    player.baseAtk = snap.player?.baseAtk ?? 42;

    coreStack = snap.core?.coreStack ?? 0;
    overdrive = snap.core?.overdrive ?? 0;

    player.vx = 0; player.vy = 0; player.grounded = true;
    player.dashCD = 0; player.invuln = 0;
    player.qCD = 0; player.eCD = 0; player.rCD = 0;

    slowmo = 0; slowmoHold = 0;

    enemies.length = 0;
    items.length = 0;
    lightnings.length = 0;
    after.length = 0;
    bullets.length = 0;
    hazards.length = 0;

    refreshHUD();
    refreshTokenLines();
  }

  function manualSave() {
    const snap = exportSnapshot("manual");
    writeSlot(activeSlot, snap);
    refreshSlotUI();
    showToast(`SAVED (SLOT ${activeSlot})`);
  }

  function checkpointSave(tag) {
    continueToken = 1;
    const snap = exportSnapshot(tag || "boss_clear");
    writeSlot(activeSlot, snap);
    refreshSlotUI();
    refreshTokenLines();
    showToast(`CHECKPOINT SAVED (SLOT ${activeSlot})`);
  }

  function loadSlotToPlay(n, consumeToken = false) {
    const snap = readSlot(n);
    if (!snap) { showToast("EMPTY SLOT"); return; }

    setActiveSlot(n);

    if (consumeToken) {
      if (continueToken <= 0) { showToast("NO TOKEN"); return; }
      continueToken = 0;
      const patched = { ...snap, continueToken: 0, time: Date.now() };
      writeSlot(n, patched);
      refreshSlotUI();
    }

    importSnapshot(readSlot(n));
    startPlay();
  }

  // ===== Menus =====
  function openTitle() {
    state = STATE.TITLE;
    setMenu(el.titleMenu);
    bgm.pause();
    refreshSlotUI();
    refreshHUD();
    refreshTokenLines();
  }

  function startPlay() {
    state = STATE.PLAY;
    setMenu(null);
    refreshHUD();
    refreshTokenLines();
    requestAudio();
  }

  function openPause() {
    if (state !== STATE.PLAY) return;
    state = STATE.PAUSE;
    setMenu(el.pauseMenu);
    bgm.pause();
    refreshSlotUI();
    refreshTokenLines();
  }

  function closePause() {
    if (state !== STATE.PAUSE) return;
    state = STATE.PLAY;
    setMenu(null);
    requestAudio();
  }

  function openOptions(prevState) {
    state = STATE.OPTIONS;
    setMenu(el.optionsMenu);
    el.optionsMenu.dataset.prev = prevState || STATE.TITLE;
    bgm.pause();
  }

  function closeOptions() {
    const prev = el.optionsMenu.dataset.prev || STATE.TITLE;
    if (prev === STATE.PAUSE) {
      state = STATE.PAUSE;
      setMenu(el.pauseMenu);
    } else {
      state = STATE.TITLE;
      setMenu(el.titleMenu);
    }
    refreshTokenLines();
  }

  function openReward() {
    state = STATE.REWARD;
    setMenu(el.rewardMenu);
    bgm.pause();
    refreshTokenLines();
  }

  function openGameOver() {
    state = STATE.GAMEOVER;
    setMenu(el.gameOver);
    bgm.pause();
    refreshTokenLines();
  }

  // ===== Weapon select flow =====
  let pendingNewSlot = 1;
  function openWeaponSelect(slotN) {
    pendingNewSlot = slotN;
    state = STATE.WEAPON;
    el.weaponSub.textContent = `SLOT ${slotN} · 시작 무기를 선택하세요`;
    setMenu(el.weaponMenu);
    bgm.pause();
  }

  function startNewGameWithWeapon(slotN, wpn) {
    setActiveSlot(slotN);

    wave = 1; level = 1; exp = 0; score = 0; gold = 0;
    continueToken = 1;
    bossSpawnedAtLevel = 0;

    weaponId = wpn;

    player.x = WORLD.w * 0.5;
    player.y = FLOOR_Y - player.h;
    player.hp = 100;
    player.maxHp = 100;
    player.baseAtk = 42;

    coreStack = 0; overdrive = 0;
    slowmo = 0; slowmoHold = 0;

    enemies.length = 0;
    items.length = 0;
    lightnings.length = 0;
    after.length = 0;
    bullets.length = 0;
    hazards.length = 0;

    refreshHUD();
    refreshTokenLines();
    startPlay();
  }

  el.wBlade.addEventListener("click", () => startNewGameWithWeapon(pendingNewSlot, "blade"));
  el.wSpear.addEventListener("click", () => startNewGameWithWeapon(pendingNewSlot, "spear"));
  el.wGun.addEventListener("click", () => startNewGameWithWeapon(pendingNewSlot, "gun"));
  el.btnWeaponCancel.addEventListener("click", openTitle);

  // ===== Bind UI buttons =====
  for (let i=1; i<=3; i++) {
    el.slotLoad[i].addEventListener("click", () => loadSlotToPlay(i, false));
    el.slotNew[i].addEventListener("click", () => {
      if (confirm(`SLOT ${i} 에 새 게임을 시작할까요?\n(시작 전 무기 선택)`) ) {
        openWeaponSelect(i);
      }
    });
    el.slotDel[i].addEventListener("click", () => {
      if (confirm(`SLOT ${i} 저장을 삭제할까요?`)) {
        deleteSlot(i);
        refreshSlotUI();
        showToast(`DELETED SLOT ${i}`);
      }
    });
  }

  el.btnResume.addEventListener("click", closePause);
  el.btnSave.addEventListener("click", () => manualSave());
  el.btnRestart.addEventListener("click", () => {
    if (confirm(`ACTIVE SLOT(${activeSlot})로 새게임(리셋)할까요?\n(무기 선택 다시)`) ) openWeaponSelect(activeSlot);
  });
  el.btnToTitle.addEventListener("click", () => openTitle());

  for (let i=1; i<=3; i++) el.miniSlot[i].addEventListener("click", () => setActiveSlot(i));

  el.btnOpenOptionsTitle.addEventListener("click", () => openOptions(STATE.TITLE));
  el.btnOpenOptionsPause.addEventListener("click", () => openOptions(STATE.PAUSE));
  el.btnOptionsBack.addEventListener("click", closeOptions);

  el.optShake.addEventListener("change", () => { options.shake = el.optShake.checked; saveOptions(); });
  el.optFlash.addEventListener("change", () => { options.flash = el.optFlash.checked; saveOptions(); });
  el.optSlowmo.addEventListener("change", () => { options.slowmo = el.optSlowmo.checked; saveOptions(); });

  for (let i=1; i<=3; i++) {
    el.goLoad[i].addEventListener("click", () => {
      if (continueToken <= 0) return;
      const snap = readSlot(i);
      if (!snap) return;
      loadSlotToPlay(i, true);
    });
  }
  el.btnRetry.addEventListener("click", () => openWeaponSelect(activeSlot));
  el.btnOverTitle.addEventListener("click", openTitle);

  // ===== Gameplay: spawn =====
  let enemySpawnTimer = 0;
  let lightningTimer = 0;

  function spawnEnemy() {
    const fromLeft = Math.random() < 0.5;
    enemies.push({
      isBoss: false,
      x: fromLeft ? -90 : WORLD.w + 90,
      y: FLOOR_Y - 90,
      w: 70,
      h: 90,
      hp: 120 + wave * 55 + level * 8,
      maxHp: 120 + wave * 55 + level * 8,
      spd: 120 + wave * 9,
    });
  }

  function spawnBoss() {
    if (enemies.some(e => e.isBoss)) return;

    const hp = Math.floor(2800 + (wave * 1300) + (level * 220));
    enemies.push({
      isBoss: true,
      x: WORLD.w + 140,
      y: FLOOR_Y - 230,
      w: 180,
      h: 230,
      hp,
      maxHp: hp,
      spd: 90 + wave * 4,

      // boss AI
      mode: "pursuit",
      modeT: 0,
      chargeCD: 2.8,
      slamCD: 4.2,
      chargeDir: 1,
      vx: 0,
      teleX: 0,
      pdUsed: false,
    });

    showToast(`BOSS ALERT: LV.${level}`);
  }

  function tryDropItem(x) {
    if (Math.random() > 0.2) return;
    const r = Math.random();
    const type = (r < 0.25) ? "CORE" : (r < 0.55) ? "THUNDER" : "HEAL";
    items.push({ x: clamp(x, 20, WORLD.w - 60), y: FLOOR_Y - 60, w: 50, h: 50, type });
  }

  // Lightning
  const LIGHTNING_COUNT = 6;
  const LIGHTNING_WARN = 0.75;
  const LIGHTNING_STRIKE = 0.28;
  const LIGHTNING_W = 60;
  const LIGHTNING_DPS = 480;

  function spawnLightningPack() {
    const xs = [];
    for (let i=0; i<LIGHTNING_COUNT; i++) {
      let x = Math.random() * (WORLD.w - LIGHTNING_W);
      for (let k=0; k<8; k++) {
        if (xs.every(v => Math.abs(v - x) > 70)) break;
        x = Math.random() * (WORLD.w - LIGHTNING_W);
      }
      xs.push(x);
    }
    for (const x of xs) {
      lightnings.push({ x, y: -120, w: LIGHTNING_W, h: WORLD.h + 200, t: 0, pd: false });
    }
  }

  // ===== Rewards =====
  let pendingReward = null;

  function rollRewards() {
    return [
      { name: "+MAX HP", desc: "최대 체력 +20\n즉시 체력 +20", apply: () => { player.maxHp += 20; player.hp = Math.min(player.maxHp, player.hp + 20); } },
      { name: "+ATK", desc: "기본 공격력 +8\n(보스 체력도 잘 깎임)", apply: () => { player.baseAtk += 8; } },
      { name: "+GOLD / HEAL", desc: "골드 +120\n체력 +35", apply: () => { gold += 120; player.hp = Math.min(player.maxHp, player.hp + 35); } },
    ];
  }

  function onBossCleared() {
    const nextWave = wave + 1;
    el.rewardSub.textContent = `WAVE ${wave} → ${nextWave}`;

    pendingReward = rollRewards();
    for (let i=0; i<3; i++) {
      el.rewardName[i].textContent = pendingReward[i].name;
      el.rewardDesc[i].textContent = pendingReward[i].desc;
    }
    openReward();
  }

  for (let i=0; i<3; i++) {
    el.rewardBtn[i].addEventListener("click", () => {
      if (state !== STATE.REWARD) return;

      pendingReward[i].apply();
      wave += 1;

      // boss clear checkpoint + token refuel
      checkpointSave(`boss_clear_wave_${wave-1}`);

      setMenu(null);
      state = STATE.PLAY;
      requestAudio();
    });
  }

  // ===== Combat / Movement =====
  function aabb(a, b) {
    return (a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y);
  }

  function auraDps() {
    const w = WEAPONS[weaponId] || WEAPONS.blade;
    const atk = player.baseAtk * (1 + coreStack * 0.6);

    const radius = (w.auraRadius + coreStack * 12);
    const dps = atk * (w.auraDpsMul + coreStack * 0.15); // dt 기반
    return { radius, dps };
  }

  function addAfterimages() {
    const count = 1 + coreStack;
    const rot = 2.2 + coreStack * 0.55;
    for (let i=0; i<count; i++) {
      const ang = (now()/1000) * rot + (i * Math.PI * 2 / count);
      after.push({
        x: player.x + player.w/2 + Math.cos(ang) * 90,
        y: player.y + player.h/2 + Math.sin(ang) * 90,
        life: 0.22,
        a: 0.8
      });
    }
  }

  function levelUpIfNeeded() {
    while (exp >= 100) {
      exp -= 100;
      level += 1;
      player.baseAtk += 6;
      player.maxHp += 4;
      player.hp = Math.min(player.maxHp, player.hp + 8);
      showToast(`LEVEL UP! → ${level}`);
    }

    if (level % 10 === 0 && bossSpawnedAtLevel !== level) {
      bossSpawnedAtLevel = level;
      spawnBoss();
    }
  }

  // Items
  function pickupItem(it) {
    if (it.type === "CORE") {
      coreStack += 1;
      overdrive = 10;
      showToast("CORE AWAKENED!");
    } else if (it.type === "THUNDER") {
      for (const e of enemies) e.hp -= (1800 + wave * 220);
      showToast("ETHER THUNDER!");
    } else if (it.type === "HEAL") {
      player.hp = Math.min(player.maxHp, player.hp + 60);
      showToast("RECOVERED!");
    }
  }

  // ===== PERFECT DODGE =====
  function triggerPerfectDodge() {
    if (!options.slowmo) return;
    if (slowmoHold > 0) return;

    slowmo = Math.max(slowmo, SLOWMO_TIME);
    slowmoHold = 0.35; // 연타 방지
    player.invuln = Math.max(player.invuln, 0.35);

    showToast("PERFECT DODGE!");
  }

  // ===== Boss Patterns (2) =====
  // 1) CHARGE: windup -> charge -> recover
  // 2) SLAM: tele circle -> shockwave expands
  function updateBossAI(b, dt) {
    // cooldowns
    b.chargeCD = Math.max(0, b.chargeCD - dt);
    b.slamCD = Math.max(0, b.slamCD - dt);

    const px = player.x + player.w/2;
    const bx = b.x + b.w/2;
    const dist = Math.abs(px - bx);

    b.modeT += dt;

    if (b.mode === "pursuit") {
      // pattern priority: slam(가끔) > charge
      if (b.slamCD <= 0) {
        b.mode = "slam_tele";
        b.modeT = 0;
        b.teleX = bx;
        b.pdUsed = false;
        b.slamCD = 6.2;
        return;
      }
      if (b.chargeCD <= 0 && dist < 520) {
        b.mode = "charge_windup";
        b.modeT = 0;
        b.chargeDir = (px < bx) ? -1 : 1;
        b.pdUsed = false;
        b.chargeCD = 5.0;
        return;
      }
      // pursuit move
      const dir = (px < bx) ? -1 : 1;
      b.x += dir * b.spd * dt;
      b.x = clamp(b.x, -160, WORLD.w + 160);
      return;
    }

    if (b.mode === "charge_windup") {
      // stand still + telegraph line
      if (b.modeT >= 0.55) {
        b.mode = "charge";
        b.modeT = 0;
        b.vx = b.chargeDir * 980;
      }
      return;
    }

    if (b.mode === "charge") {
      b.x += b.vx * dt;
      if (b.modeT >= 0.45) {
        b.mode = "recover";
        b.modeT = 0;
      }
      // clamp a bit
      b.x = clamp(b.x, -200, WORLD.w + 200);
      return;
    }

    if (b.mode === "recover") {
      if (b.modeT >= 0.55) {
        b.mode = "pursuit";
        b.modeT = 0;
      }
      return;
    }

    if (b.mode === "slam_tele") {
      // tele circle then spawn shockwave
      if (b.modeT >= 0.75) {
        hazards.push({
          type: "shockwave",
          x: b.teleX,
          y: FLOOR_Y,
          r: 20,
          maxR: 340,
          speed: 520,
          t: 0,
          pd: false
        });
        b.mode = "pursuit";
        b.modeT = 0;
      }
      return;
    }
  }

  function updateHazards(dt) {
    for (let i=hazards.length-1; i>=0; i--) {
      const h = hazards[i];
      h.t += dt;
      if (h.type === "shockwave") {
        h.r += h.speed * dt;
        if (h.r >= h.maxR) {
          hazards.splice(i,1);
          continue;
        }

        // damage check (ground-based)
        const px = player.x + player.w/2;
        const d = Math.abs(px - h.x);

        const inWave = d < h.r && d > (h.r - 55);
        if (inWave && player.grounded) {
          if (player.invuln <= 0) {
            player.hp -= 240 * dt;
            hitFlash();
          } else {
            if (!h.pd) { h.pd = true; triggerPerfectDodge(); }
          }
        }
      }
    }
  }

  // ===== GUN (auto projectiles) =====
  let shootTimer = 0;
  function updateBullets(dt) {
    for (let i=bullets.length-1; i>=0; i--) {
      const b = bullets[i];
      b.life -= dt;
      b.x += b.vx * dt;
      b.y += b.vy * dt;

      if (b.life <= 0 || b.x < -50 || b.x > WORLD.w + 50 || b.y < -50 || b.y > WORLD.h + 50) {
        bullets.splice(i,1);
        continue;
      }

      // collision
      for (const e of enemies) {
        if (b.x > e.x && b.x < e.x + e.w && b.y > e.y && b.y < e.y + e.h) {
          e.hp -= b.dmg;
          bullets.splice(i,1);
          break;
        }
      }
    }
  }

  function gunAutoShoot(dt) {
    shootTimer += dt;
    const fireRate = 0.18; // ~5.5 shots/sec
    if (shootTimer < fireRate) return;
    shootTimer = 0;

    let target = null;
    let best = 1e9;
    const px = player.x + player.w/2;
    const py = player.y + player.h*0.45;

    for (const e of enemies) {
      const ex = e.x + e.w/2;
      const ey = e.y + e.h*0.45;
      const d = Math.hypot(ex - px, ey - py);
      if (d < 520 && d < best) { best = d; target = e; }
    }
    if (!target) return;

    const ex = target.x + target.w/2;
    const ey = target.y + target.h*0.45;
    const dx = ex - px;
    const dy = ey - py;
    const len = Math.max(1, Math.hypot(dx, dy));

    const speed = 980;
    const vx = (dx / len) * speed;
    const vy = (dy / len) * speed;

    const dmg = Math.floor((player.baseAtk * 0.55) + wave * 4 + coreStack * 6);

    bullets.push({ x: px, y: py, vx, vy, life: 1.0, dmg });
  }

  // ===== Main Loop =====
  let last = now();

  let enemySpawnTimer = 0;
  let lightningTimer = 0;

  // overdrive colors/afterimg
  function updateOverdrive(dt) {
    if (overdrive > 0) {
      overdrive -= dt;
      if (overdrive <= 0) {
        overdrive = 0;
        coreStack = 0;
      }
    }
  }

  // boss cleared reward
  function handleBossDeath() {
    levelUpIfNeeded();
    onBossCleared();
  }

  function update(dtReal) {
    // slowmo logic (only during PLAY)
    if (slowmoHold > 0) slowmoHold = Math.max(0, slowmoHold - dtReal);

    let timeScale = 1;
    if (options.slowmo && slowmo > 0) {
      slowmo = Math.max(0, slowmo - dtReal);
      timeScale = SLOWMO_SCALE;
    }

    const dt = dtReal * timeScale;

    // timers
    enemySpawnTimer += dt;
    lightningTimer += dt;

    if (enemySpawnTimer >= 1.25) {
      enemySpawnTimer = 0;
      if (!enemies.some(e => e.isBoss) || Math.random() < 0.5) spawnEnemy();
    }

    if (lightningTimer >= 5.0) {
      lightningTimer = 0;
      spawnLightningPack();
    }

    updateOverdrive(dtReal);

    // cooldowns (real-time)
    player.dashCD = Math.max(0, player.dashCD - dtReal);
    player.qCD = Math.max(0, player.qCD - dtReal);
    player.eCD = Math.max(0, player.eCD - dtReal);
    player.rCD = Math.max(0, player.rCD - dtReal);
    player.invuln = Math.max(0, player.invuln - dtReal);

    // input
    const left = keys["KeyA"] || keys["ArrowLeft"];
    const right = keys["KeyD"] || keys["ArrowRight"];
    const jump = keys["Space"];
    const dash = keys["ShiftLeft"] || keys["ShiftRight"];

    if (left && !right) player.dir = -1;
    if (right && !left) player.dir = 1;

    // dash i-frame
    if (dash && player.dashCD <= 0) {
      player.dashCD = 1.15;
      player.invuln = Math.max(player.invuln, 0.18);
      player.vx = player.dir * 860;
      showToast("DASH!");
    }

    // horizontal (hold speed 유지)
    if (!dash) {
      const target = (right ? 1 : 0) - (left ? 1 : 0);
      const tv = target * player.moveSpeed;
      player.vx += (tv - player.vx) * Math.min(1, 14 * dt);
    }

    // jump
    if (jump && player.grounded) {
      player.vy = -540;
      player.grounded = false;
    }

    // gravity
    player.vy += 1600 * dt;

    // integrate
    player.x += player.vx * dt;
    player.y += player.vy * dt;

    player.x = clamp(player.x, 0, WORLD.w - player.w);
    if (player.y >= FLOOR_Y - player.h) {
      player.y = FLOOR_Y - player.h;
      player.vy = 0;
      player.grounded = true;
    }

    // skills (same)
    if ((keys["KeyQ"]) && player.qCD <= 0) {
      player.qCD = 4.0;
      for (const e of enemies) {
        const cx = (e.x + e.w*0.5) - (player.x + player.w*0.5);
        const cy = (e.y + e.h*0.5) - (player.y + player.h*0.5);
        const d = Math.hypot(cx, cy);
        if (d < 180) e.hp -= (520 + wave * 80);
      }
      showToast("Q: BLAST");
    }
    if ((keys["KeyE"]) && player.eCD <= 0) {
      player.eCD = 6.0;
      for (const e of enemies) e.hp -= (900 + wave * 140);
      showToast("E: SHOCK");
    }
    if ((keys["KeyR"]) && player.rCD <= 0) {
      player.rCD = 10.0;
      player.hp = Math.min(player.maxHp, player.hp + 55);
      showToast("R: RECOVER");
    }

    // aura visuals
    addAfterimages();
    const { radius, dps } = auraDps();

    // gun auto shoot
    if (WEAPONS[weaponId]?.gun) {
      gunAutoShoot(dt);
    }

    // enemy updates + boss AI + contact checks
    for (const e of enemies) {
      if (e.isBoss) updateBossAI(e, dt);

      const px = player.x + player.w/2;
      const ex = e.x + e.w/2;

      // move toward player unless in special mode that already moves a lot
      if (!e.isBoss || (e.isBoss && (e.mode === "pursuit"))) {
        const dir = (px < ex) ? -1 : 1;
        e.x += dir * e.spd * dt;
      }

      e.x = clamp(e.x, -200, WORLD.w + 200);

      // contact damage + perfect dodge (invuln overlap)
      if (aabb(player, e)) {
        if (player.invuln <= 0) {
          player.hp -= (e.isBoss ? 28 : 10) * dt;
          hitFlash();
        } else {
          // 회피 성공(무적 겹침)
          if (!e.pdUsed) { e.pdUsed = true; triggerPerfectDodge(); }
        }
      } else {
        // 떨어지면 다음 판정 가능하게
        if (e.pdUsed) e.pdUsed = false;
      }

      // aura damage
      const dx = (e.x + e.w*0.5) - (player.x + player.w*0.5);
      const dy = (e.y + e.h*0.5) - (player.y + player.h*0.5);
      const dist = Math.hypot(dx, dy);
      if (dist < radius) e.hp -= dps * dt;
    }

    // lightning update
    for (const ln of lightnings) {
      ln.t += dt;
      const inStrike = ln.t > LIGHTNING_WARN && ln.t < (LIGHTNING_WARN + LIGHTNING_STRIKE);

      if (inStrike) {
        const px1 = player.x, px2 = player.x + player.w;
        const lx1 = ln.x, lx2 = ln.x + ln.w;

        if (px1 < lx2 && px2 > lx1) {
          if (player.invuln <= 0) {
            player.hp -= LIGHTNING_DPS * dt;
            hitFlash();
          } else {
            if (!ln.pd) { ln.pd = true; triggerPerfectDodge(); }
          }
        }
      }
    }
    for (let i=lightnings.length-1; i>=0; i--) {
      const ln = lightnings[i];
      if (ln.t >= (LIGHTNING_WARN + LIGHTNING_STRIKE + 0.15)) lightnings.splice(i, 1);
    }

    // boss hazards
    updateHazards(dt);

    // bullets
    updateBullets(dt);

    // item pickup
    for (let i=items.length-1; i>=0; i--) {
      const it = items[i];
      const near = Math.abs((player.x + player.w/2) - (it.x + it.w/2)) < 55
                && Math.abs((player.y + player.h/2) - (it.y + it.h/2)) < 80;
      if (near) {
        pickupItem(it);
        items.splice(i, 1);
      }
    }

    // afterimages fade
    for (let i=after.length-1; i>=0; i--) {
      after[i].life -= dt;
      after[i].a -= dt * 3.6;
      if (after[i].life <= 0 || after[i].a <= 0) after.splice(i, 1);
    }

    // deaths
    for (let i=enemies.length-1; i>=0; i--) {
      const e = enemies[i];
      if (e.hp <= 0) {
        tryDropItem(e.x);
        score += e.isBoss ? 8000 : 150;
        gold += e.isBoss ? 250 : 25;
        exp += e.isBoss ? 170 : 30;
        enemies.splice(i, 1);

        if (e.isBoss) {
          levelUpIfNeeded();
          handleBossDeath();
          refreshHUD();
          refreshTokenLines();
          return;
        }
      }
    }

    // level up
    levelUpIfNeeded();

    // player death
    if (player.hp <= 0) {
      player.hp = 0;
      el.finalResult.textContent = `SCORE: ${score} | LEVEL: ${level} | WAVE: ${wave} | WEAPON: ${WEAPONS[weaponId]?.name || "BLADE"}`;
      openGameOver();

      for (let i=1; i<=3; i++) {
        const s = readSlot(i);
        el.goLoad[i].disabled = (!s || continueToken <= 0);
      }
      el.overNote.textContent = (continueToken > 0)
        ? "불러올 슬롯을 선택하세요(1회만 가능)."
        : "이어하기 토큰이 없습니다. (보스 클리어 체크포인트 필요)";

      refreshHUD();
      refreshTokenLines();
      return;
    }

    refreshHUD();
  }

  // ===== Reward selection (boss clear) =====
  let pendingReward = null;

  function rollRewards() {
    return [
      { name: "+MAX HP", desc: "최대 체력 +20\n즉시 체력 +20", apply: () => { player.maxHp += 20; player.hp = Math.min(player.maxHp, player.hp + 20); } },
      { name: "+ATK", desc: "기본 공격력 +8\n(보스 체력도 잘 깎임)", apply: () => { player.baseAtk += 8; } },
      { name: "+GOLD / HEAL", desc: "골드 +120\n체력 +35", apply: () => { gold += 120; player.hp = Math.min(player.maxHp, player.hp + 35); } },
    ];
  }

  function onBossCleared() {
    const nextWave = wave + 1;
    el.rewardSub.textContent = `WAVE ${wave} → ${nextWave}`;

    pendingReward = rollRewards();
    for (let i=0; i<3; i++) {
      el.rewardName[i].textContent = pendingReward[i].name;
      el.rewardDesc[i].textContent = pendingReward[i].desc;
    }
    openReward();
  }

  for (let i=0; i<3; i++) {
    el.rewardBtn[i].addEventListener("click", () => {
      if (state !== STATE.REWARD) return;

      pendingReward[i].apply();
      wave += 1;

      checkpointSave(`boss_clear_wave_${wave-1}`);

      setMenu(null);
      state = STATE.PLAY;
      requestAudio();
    });
  }

  // ===== Draw =====
  function draw() {
    beginWorld();

    if (img.bg.complete && img.bg.naturalWidth > 0) {
      ctx.drawImage(img.bg, 0, 0, WORLD.w, WORLD.h);
    } else {
      ctx.fillStyle = "#05070c";
      ctx.fillRect(0,0,WORLD.w,WORLD.h);
    }

    // floor
    ctx.strokeStyle = "rgba(255,255,255,0.18)";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(0, FLOOR_Y);
    ctx.lineTo(WORLD.w, FLOOR_Y);
    ctx.stroke();

    // boss telegraphs
    for (const e of enemies) {
      if (!e.isBoss) continue;

      if (e.mode === "charge_windup") {
        ctx.fillStyle = "rgba(255,80,80,0.18)";
        const dir = e.chargeDir || 1;
        const x = (dir > 0) ? (e.x + e.w) : (e.x - 240);
        ctx.fillRect(x, FLOOR_Y - 120, 240, 120);
      }

      if (e.mode === "slam_tele") {
        ctx.strokeStyle = "rgba(255,80,80,0.65)";
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(e.teleX, FLOOR_Y, 140, 0, Math.PI*2);
        ctx.stroke();
      }
    }

    // hazards draw
    for (const h of hazards) {
      if (h.type === "shockwave") {
        ctx.strokeStyle = "rgba(255,255,255,0.35)";
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(h.x, h.y, h.r, 0, Math.PI*2);
        ctx.stroke();
      }
    }

    // lightning draw
    for (const ln of lightnings) {
      const inWarn = ln.t <= LIGHTNING_WARN;
      const inStrike = ln.t > LIGHTNING_WARN && ln.t < (LIGHTNING_WARN + LIGHTNING_STRIKE);

      if (img.ln.complete && img.ln.naturalWidth > 0) {
        ctx.globalAlpha = inStrike ? 1.0 : 0.22;
        ctx.drawImage(img.ln, ln.x, ln.y, ln.w, ln.h);
        ctx.globalAlpha = 1.0;
      } else {
        ctx.fillStyle = inStrike ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.12)";
        ctx.fillRect(ln.x, 0, ln.w, WORLD.h);
      }
      if (inWarn) {
        ctx.fillStyle = "rgba(255,255,255,0.18)";
        ctx.fillRect(ln.x, FLOOR_Y - 6, ln.w, 6);
      }
    }

    // items
    for (const it of items) {
      let im = img.itHeal;
      if (it.type === "CORE") im = img.itCore;
      else if (it.type === "THUNDER") im = img.itThunder;

      if (im.complete && im.naturalWidth > 0) ctx.drawImage(im, it.x, it.y, it.w, it.h);
      else {
        ctx.fillStyle = (it.type === "CORE") ? "#ff4dff" : (it.type === "THUNDER") ? "#ffee55" : "#44ff44";
        ctx.fillRect(it.x, it.y, it.w, it.h);
      }
    }

    // afterimages
    for (const a of after) {
      ctx.globalAlpha = Math.max(0, a.a);
      ctx.fillStyle = coreStack > 0 ? "rgba(255,70,255,0.9)" : "rgba(0,229,255,0.9)";
      ctx.fillRect(a.x - 10, a.y - 10, 20, 20);
      ctx.globalAlpha = 1;
    }

    // bullets
    if (WEAPONS[weaponId]?.gun) {
      ctx.fillStyle = "rgba(255,255,255,0.9)";
      for (const b of bullets) {
        ctx.beginPath();
        ctx.arc(b.x, b.y, 4, 0, Math.PI*2);
        ctx.fill();
      }
    }

    // enemies
    for (const e of enemies) {
      const im = e.isBoss ? img.b : img.e;
      if (im.complete && im.naturalWidth > 0) ctx.drawImage(im, e.x, e.y, e.w, e.h);
      else {
        ctx.fillStyle = e.isBoss ? "#ff3b3b" : "#ff4da6";
        ctx.fillRect(e.x, e.y, e.w, e.h);
      }

      if (e.isBoss) {
        ctx.fillStyle = "rgba(0,0,0,0.55)";
        ctx.fillRect(e.x, e.y - 22, e.w, 12);
        ctx.fillStyle = "#cc0000";
        ctx.fillRect(e.x, e.y - 22, e.w * clamp(e.hp / e.maxHp, 0, 1), 12);

        ctx.fillStyle = "rgba(255,255,255,0.85)";
        ctx.font = "12px Arial";
        ctx.fillText(`BOSS HP ${Math.max(0, Math.floor(e.hp))}/${e.maxHp}`, e.x, e.y - 26);
      }
    }

    // player
    ctx.save();
    if (player.invuln > 0) {
      ctx.globalAlpha = 0.75;
    }

    if (player.dir === -1) {
      ctx.translate(player.x + player.w, player.y);
      ctx.scale(-1, 1);
      if (img.p.complete && img.p.naturalWidth > 0) ctx.drawImage(img.p, 0, 0, player.w, player.h);
      else { ctx.fillStyle = "#00e5ff"; ctx.fillRect(0,0,player.w,player.h); }
    } else {
      if (img.p.complete && img.p.naturalWidth > 0) ctx.drawImage(img.p, player.x, player.y, player.w, player.h);
      else { ctx.fillStyle = "#00e5ff"; ctx.fillRect(player.x, player.y, player.w, player.h); }
    }
    ctx.restore();
    ctx.globalAlpha = 1;

    endWorld();
  }

  function loop(t) {
    const dtReal = Math.min(0.033, (t - last) / 1000);
    last = t;

    if (state === STATE.PLAY) update(dtReal);
    else refreshHUD();

    draw();
    requestAnimationFrame(loop);
  }

  // ===== Init =====
  if (el.boot) el.boot.style.display = "none";

  refreshSlotUI();
  refreshHUD();
  refreshTokenLines();
  openTitle();

  requestAnimationFrame(loop);
})();
