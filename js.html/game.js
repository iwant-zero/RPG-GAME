(() => {
  "use strict";
  window.__BLADE_BOOTED = true;

  // ===== Helpers =====
  const $ = (id) => document.getElementById(id);
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const now = () => performance.now();

  // ===== DOM =====
  const el = {
    boot: $("boot"),
    ui: $("ui"),
    stats: $("stats"),
    hpFill: $("hp-fill"),
    expFill: $("exp-fill"),
    score: $("score"),
    wave: $("wave"),
    gold: $("gold"),
    token: $("token"),
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

    // Menus
    titleMenu: $("title-menu"),
    pauseMenu: $("pause-menu"),
    rewardMenu: $("reward-menu"),
    optionsMenu: $("options-menu"),
    gameOver: $("overlay"),

    // Title
    titleActive: $("title-active"),
    tokenLineTitle: $("token-line-title"),
    slotActive: [null, $("slot-active-1"), $("slot-active-2"), $("slot-active-3")],
    slotBadge: [null, $("slot-badge-1"), $("slot-badge-2"), $("slot-badge-3")],
    slotMeta:  [null, $("slot-meta-1"),  $("slot-meta-2"),  $("slot-meta-3")],
    slotLoad:  [null, $("slot-load-1"),  $("slot-load-2"),  $("slot-load-3")],
    slotNew:   [null, $("slot-new-1"),   $("slot-new-2"),   $("slot-new-3")],
    slotDel:   [null, $("slot-del-1"),   $("slot-del-2"),   $("slot-del-3")],
    btnOpenOptionsTitle: $("btn-open-options-title"),

    // Pause
    activeSlotNote: $("active-slot-note"),
    tokenLinePause: $("token-line-pause"),
    miniSlot: [null, $("mini-slot-1"), $("mini-slot-2"), $("mini-slot-3")],
    btnResume: $("btn-resume"),
    btnSave: $("btn-save"),
    btnOpenOptionsPause: $("btn-open-options-pause"),
    btnRestart: $("btn-restart"),
    btnToTitle: $("btn-to-title"),

    // Reward
    rewardSub: $("reward-sub"),
    rewardBtn: [$("reward-0"), $("reward-1"), $("reward-2")],
    rewardName: [$("reward-name-0"), $("reward-name-1"), $("reward-name-2")],
    rewardDesc: [$("reward-desc-0"), $("reward-desc-1"), $("reward-desc-2")],

    // Options
    optShake: $("opt-shake"),
    optFlash: $("opt-flash"),
    optSlowmo: $("opt-slowmo"),
    btnOptionsBack: $("btn-options-back"),

    // GameOver
    finalResult: $("final-result"),
    tokenLineOver: $("token-line-over"),
    overNote: $("over-note"),
    goLoad: [null, $("go-load-1"), $("go-load-2"), $("go-load-3")],
    btnRetry: $("btn-retry"),
    btnOverTitle: $("btn-over-title"),
  };

  // ===== Canvas & View (WORLD FIT: PC/모바일 모두 “화면에 딱 맞게”) =====
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

    // letterbox fit (전체 월드를 항상 화면에 보여줌)
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
    p: new Image(),
    e: new Image(),
    b: new Image(),
    bg: new Image(),
    ln: new Image(),
    itCore: new Image(),
    itThunder: new Image(),
    itHeal: new Image(),
  };
  // ✅ 네 레포 구조 기준(현재 BASE는 항상 ./)
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

  // ===== Options (persist) =====
  const OPT_KEY = "blade_options_v1";
  const options = {
    shake: true,
    flash: true,
    slowmo: true,
  };
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

  // ===== Save system =====
  const SAVE_VER = 1;
  const ACTIVE_SLOT_KEY = "blade_active_slot_v1";
  const SLOT_KEY = (n) => `blade_slot_${n}_v${SAVE_VER}`;

  let activeSlot = Number(localStorage.getItem(ACTIVE_SLOT_KEY) || "1");
  if (![1,2,3].includes(activeSlot)) activeSlot = 1;

  function readSlot(n) {
    try {
      const raw = localStorage.getItem(SLOT_KEY(n));
      if (!raw) return null;
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }
  function writeSlot(n, data) {
    localStorage.setItem(SLOT_KEY(n), JSON.stringify(data));
  }
  function deleteSlot(n) {
    localStorage.removeItem(SLOT_KEY(n));
  }

  function fmtTime(ts) {
    try {
      const d = new Date(ts);
      return d.toLocaleString();
    } catch { return ""; }
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
      `CHECKPOINT: ${s.checkpointTag || "none"}`,
    ];
    return { badge: "SAVED", meta: lines.join("\n") };
  }

  function setActiveSlot(n) {
    activeSlot = n;
    localStorage.setItem(ACTIVE_SLOT_KEY, String(activeSlot));
    refreshSlotUI();
    refreshTokenLines();
    showToast(`ACTIVE SLOT: ${activeSlot}`);
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

      if (i === activeSlot) {
        el.slotBadge[i].classList.add("active");
      } else {
        el.slotBadge[i].classList.remove("active");
      }
    }
    el.titleActive.textContent = `ACTIVE SLOT: ${activeSlot}`;
    el.activeSlotNote.textContent = `ACTIVE: SLOT ${activeSlot}`;
  }

  // ===== Game state =====
  const STATE = {
    TITLE: "title",
    PLAY: "play",
    PAUSE: "pause",
    REWARD: "reward",
    OPTIONS: "options",
    GAMEOVER: "gameover",
  };
  let state = STATE.TITLE;

  // gameplay vars
  let wave = 1;
  let level = 1;
  let exp = 0;      // 0..100
  let score = 0;
  let gold = 0;

  // continue token: 1 = gameover에서 로드 1회 가능, 0 = 불가
  let continueToken = 1;

  // to avoid boss re-spawn at same level
  let bossSpawnedAtLevel = 0;

  const player = {
    x: WORLD.w * 0.5,
    y: FLOOR_Y - 110,
    w: 70,
    h: 110,
    vx: 0,
    vy: 0,
    grounded: true,
    dir: 1,
    hp: 100,
    maxHp: 100,
    baseAtk: 42,

    moveSpeed: 360, // hold speed 유지
    dashCD: 0,
    dashTime: 0,
    invuln: 0,

    qCD: 0,
    eCD: 0,
    rCD: 0,
  };

  let coreStack = 0;
  let overdrive = 0;

  const enemies = [];
  const items = [];
  const lightnings = [];
  const after = [];

  // ===== Input (tap move half distance) =====
  const keys = Object.create(null);
  const TAP_MS = 130;
  const TAP_NUDGE = 16; // “톡” 이동 (짧게 / 기존보다 줄임)
  const tap = { leftAt: 0, rightAt: 0 };

  function setKey(code, v) { keys[code] = v; }

  function requestAudio() {
    if (bgm.paused) bgm.play().catch(()=>{});
  }

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

    // tap nudge
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
  if (isTouch) {
    el.touch.style.display = "flex";
    el.pauseBtn.style.display = "block";
  } else {
    el.pauseBtn.style.display = "block";
  }

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

  // Pause button
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
    // hide all overlays
    el.titleMenu.style.display = "none";
    el.pauseMenu.style.display = "none";
    el.rewardMenu.style.display = "none";
    el.optionsMenu.style.display = "none";
    el.gameOver.style.display = "none";

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

  // ===== Save/load (core) =====
  function exportSnapshot(checkpointTag = "") {
    return {
      ver: SAVE_VER,
      time: Date.now(),
      checkpointTag,
      wave,
      level,
      exp,
      score,
      gold,
      continueToken,
      bossSpawnedAtLevel,
      player: {
        x: player.x, y: player.y,
        hp: player.hp, maxHp: player.maxHp,
        baseAtk: player.baseAtk,
      },
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

    player.x = (snap.player?.x ?? WORLD.w * 0.5);
    player.y = (snap.player?.y ?? FLOOR_Y - player.h);
    player.hp = snap.player?.hp ?? 100;
    player.maxHp = snap.player?.maxHp ?? 100;
    player.baseAtk = snap.player?.baseAtk ?? 42;

    coreStack = snap.core?.coreStack ?? 0;
    overdrive = snap.core?.overdrive ?? 0;

    // reset motion
    player.vx = 0; player.vy = 0; player.grounded = true;
    player.dashCD = 0; player.dashTime = 0; player.invuln = 0;
    player.qCD = 0; player.eCD = 0; player.rCD = 0;

    // reset entities
    enemies.length = 0;
    items.length = 0;
    lightnings.length = 0;
    after.length = 0;

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
    // ✅ 보스 클리어 직후 자동 저장 + 토큰 충전
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

    // ✅ 게임오버에서 로드하는 경우: 토큰 소모 1회
    if (consumeToken) {
      if (continueToken <= 0) { showToast("NO TOKEN"); return; }
      continueToken = 0;

      // 토큰 소모 상태를 슬롯에 “즉시 반영”해서 무한 로드 방지
      const patched = { ...snap, continueToken: 0, time: Date.now() };
      writeSlot(n, patched);
      refreshSlotUI();
    }

    importSnapshot(readSlot(n));
    startPlay();
  }

  function startNewGame(slotN) {
    setActiveSlot(slotN);

    wave = 1;
    level = 1;
    exp = 0;
    score = 0;
    gold = 0;
    continueToken = 1;
    bossSpawnedAtLevel = 0;

    player.x = WORLD.w * 0.5;
    player.y = FLOOR_Y - player.h;
    player.hp = 100;
    player.maxHp = 100;
    player.baseAtk = 42;

    coreStack = 0;
    overdrive = 0;

    enemies.length = 0;
    items.length = 0;
    lightnings.length = 0;
    after.length = 0;

    // 새게임은 “빈 상태로 시작”이지만, 저장은 수동/보스클리어에서만
    refreshHUD();
    refreshTokenLines();
    startPlay();
  }

  // ===== Menus actions =====
  function openTitle() {
    state = STATE.TITLE;
    setMenu(el.titleMenu);
    bgm.pause();
    refreshSlotUI();
    refreshTokenLines();
  }

  function startPlay() {
    state = STATE.PLAY;
    setMenu(null);
    refreshHUD();
    refreshTokenLines();
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

  // ===== Bind UI buttons =====
  // Title slots
  for (let i=1; i<=3; i++) {
    el.slotLoad[i].addEventListener("click", () => loadSlotToPlay(i, false));
    el.slotNew[i].addEventListener("click", () => {
      if (confirm(`SLOT ${i} 에 새 게임을 시작할까요? (기존 저장은 남아있고, 새 진행은 저장 시 덮어씁니다)`)) {
        startNewGame(i);
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

  // Pause menu
  el.btnResume.addEventListener("click", closePause);
  el.btnSave.addEventListener("click", () => manualSave());
  el.btnRestart.addEventListener("click", () => {
    if (confirm(`ACTIVE SLOT(${activeSlot})로 새게임(리셋)할까요?`)) startNewGame(activeSlot);
  });
  el.btnToTitle.addEventListener("click", () => openTitle());

  for (let i=1; i<=3; i++) {
    el.miniSlot[i].addEventListener("click", () => setActiveSlot(i));
  }

  // Options
  el.btnOpenOptionsTitle.addEventListener("click", () => openOptions(STATE.TITLE));
  el.btnOpenOptionsPause.addEventListener("click", () => openOptions(STATE.PAUSE));
  el.btnOptionsBack.addEventListener("click", closeOptions);

  el.optShake.addEventListener("change", () => { options.shake = el.optShake.checked; saveOptions(); });
  el.optFlash.addEventListener("change", () => { options.flash = el.optFlash.checked; saveOptions(); });
  el.optSlowmo.addEventListener("change", () => { options.slowmo = el.optSlowmo.checked; saveOptions(); });

  // GameOver
  for (let i=1; i<=3; i++) {
    el.goLoad[i].addEventListener("click", () => {
      // ✅ 토큰 1회 있을 때만 로드 가능
      if (continueToken <= 0) return;
      const snap = readSlot(i);
      if (!snap) return;
      loadSlotToPlay(i, true);
    });
  }
  el.btnRetry.addEventListener("click", () => startNewGame(activeSlot));
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
    // 보스 1마리만
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
    });
    showToast(`BOSS ALERT: LV.${level}`);
  }

  function tryDropItem(x) {
    if (Math.random() > 0.2) return;
    const r = Math.random();
    const type = (r < 0.25) ? "CORE" : (r < 0.55) ? "THUNDER" : "HEAL";
    items.push({ x: clamp(x, 20, WORLD.w - 60), y: FLOOR_Y - 60, w: 50, h: 50, type });
  }

  // ✅ 번개 6개 + 데미지 2배 (강하게)
  const LIGHTNING_COUNT = 6;
  const LIGHTNING_WARN = 0.75;
  const LIGHTNING_STRIKE = 0.28;
  const LIGHTNING_W = 60;
  const LIGHTNING_DPS = 480; // dt 기반(이전보다 강하게)

  function spawnLightningPack() {
    // 겹침 줄이기: 간단 spacing
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
      lightnings.push({ x, y: -120, w: LIGHTNING_W, h: WORLD.h + 200, t: 0 });
    }
  }

  // ===== Reward system =====
  let pendingReward = null;

  function rollRewards() {
    // 3개 고정(안전하게)
    return [
      { name: "+MAX HP", desc: "최대 체력 +20\n즉시 체력 +20", apply: () => { player.maxHp += 20; player.hp = Math.min(player.maxHp, player.hp + 20); } },
      { name: "+ATK", desc: "기본 공격력 +8\n(보스 체력도 잘 깎임)", apply: () => { player.baseAtk += 8; } },
      { name: "+GOLD / HEAL", desc: "골드 +120\n체력 +35", apply: () => { gold += 120; player.hp = Math.min(player.maxHp, player.hp + 35); } },
    ];
  }

  function onBossCleared() {
    // 다음 웨이브 준비
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

      // 웨이브 증가
      wave += 1;

      // ✅ 보스 클리어 직후에만 자동 저장 + 토큰 1회 충전
      checkpointSave(`boss_clear_wave_${wave-1}`);

      // 다음 웨이브로 복귀
      setMenu(null);
      state = STATE.PLAY;
      requestAudio();
    });
  }

  // ===== Combat / Movement =====
  function aabb(a, b) {
    return (a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y);
  }

  // “보스 피가 안 닳는다” 방지: dt 기반 DPS로 처리
  function auraDps() {
    const atk = player.baseAtk * (1 + coreStack * 0.6);
    const radius = 165 + coreStack * 12;
    const dps = atk * 2.6; // dt 기반(확실하게 닳게)
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

    // 보스 스폰(10/20/30/40…)
    if (level % 10 === 0 && bossSpawnedAtLevel !== level) {
      bossSpawnedAtLevel = level;
      spawnBoss();
    }
  }

  // ===== Overdrive / items =====
  function pickupItem(it) {
    if (it.type === "CORE") {
      coreStack += 1;
      overdrive = 10;
      showToast("CORE AWAKENED!");
    } else if (it.type === "THUNDER") {
      // 강력 광역
      for (const e of enemies) e.hp -= (1800 + wave * 220);
      showToast("ETHER THUNDER!");
    } else if (it.type === "HEAL") {
      player.hp = Math.min(player.maxHp, player.hp + 60);
      showToast("RECOVERED!");
    }
  }

  // ===== Main Loop =====
  let last = now();

  function update(dt) {
    // timers
    enemySpawnTimer += dt;
    lightningTimer += dt;

    // spawn enemies
    if (enemySpawnTimer >= 1.25) {
      enemySpawnTimer = 0;
      // 보스가 있으면 일반몹 스폰 약간 줄임
      if (!enemies.some(e => e.isBoss) || Math.random() < 0.5) spawnEnemy();
    }

    // spawn lightning pack
    if (lightningTimer >= 5.0) {
      lightningTimer = 0;
      spawnLightningPack();
    }

    // overdrive
    if (overdrive > 0) {
      overdrive -= dt;
      if (overdrive <= 0) {
        overdrive = 0;
        coreStack = 0;
      }
    }

    // cooldowns
    player.dashCD = Math.max(0, player.dashCD - dt);
    player.qCD = Math.max(0, player.qCD - dt);
    player.eCD = Math.max(0, player.eCD - dt);
    player.rCD = Math.max(0, player.rCD - dt);
    player.invuln = Math.max(0, player.invuln - dt);

    // input
    const left = keys["KeyA"] || keys["ArrowLeft"];
    const right = keys["KeyD"] || keys["ArrowRight"];
    const jump = keys["Space"];
    const dash = keys["ShiftLeft"] || keys["ShiftRight"];

    if (left && !right) player.dir = -1;
    if (right && !left) player.dir = 1;

    // dash
    if (dash && player.dashCD <= 0) {
      player.dashCD = 1.15;
      player.invuln = 0.18;
      player.vx = player.dir * 860;
      showToast("DASH!");
    }

    // horizontal (hold)
    if (!dash) {
      const target = (right ? 1 : 0) - (left ? 1 : 0);
      const tv = target * player.moveSpeed;
      // smoothing
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

    // bounds + floor
    player.x = clamp(player.x, 0, WORLD.w - player.w);
    if (player.y >= FLOOR_Y - player.h) {
      player.y = FLOOR_Y - player.h;
      player.vy = 0;
      player.grounded = true;
    }

    // skills
    if ((keys["KeyQ"]) && player.qCD <= 0) {
      player.qCD = 4.0;
      // 근접 폭발
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

    // afterimages + aura damage
    addAfterimages();
    const { radius, dps } = auraDps();

    for (const e of enemies) {
      // enemy movement toward player
      const dir = (player.x + player.w/2) < (e.x + e.w/2) ? -1 : 1;
      e.x += dir * e.spd * dt;
      e.x = clamp(e.x, -160, WORLD.w + 160);

      // contact damage
      if (player.invuln <= 0 && aabb(player, e)) {
        player.hp -= (e.isBoss ? 28 : 10) * dt; // dt 기반
        hitFlash();
      }

      // aura damage in range (dt 기반)
      const dx = (e.x + e.w*0.5) - (player.x + player.w*0.5);
      const dy = (e.y + e.h*0.5) - (player.y + player.h*0.5);
      const dist = Math.hypot(dx, dy);
      if (dist < radius) {
        e.hp -= dps * dt;
      }
    }

    // lightning update
    for (const ln of lightnings) {
      ln.t += dt;

      // strike phase
      if (ln.t > LIGHTNING_WARN && ln.t < (LIGHTNING_WARN + LIGHTNING_STRIKE)) {
        // overlap with player X-range
        const px1 = player.x;
        const px2 = player.x + player.w;
        const lx1 = ln.x;
        const lx2 = ln.x + ln.w;

        if (player.invuln <= 0 && px1 < lx2 && px2 > lx1) {
          player.hp -= LIGHTNING_DPS * dt; // ✅ 강하게(2배 느낌)
          hitFlash();
        }
      }
    }
    // remove expired lightning
    for (let i=lightnings.length-1; i>=0; i--) {
      const ln = lightnings[i];
      if (ln.t >= (LIGHTNING_WARN + LIGHTNING_STRIKE + 0.15)) lightnings.splice(i, 1);
    }

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

    // afterimage fade
    for (let i=after.length-1; i>=0; i--) {
      after[i].life -= dt;
      after[i].a -= dt * 3.6;
      if (after[i].life <= 0 || after[i].a <= 0) after.splice(i, 1);
    }

    // deaths (enemies)
    for (let i=enemies.length-1; i>=0; i--) {
      const e = enemies[i];
      if (e.hp <= 0) {
        // drop + rewards
        tryDropItem(e.x);
        score += e.isBoss ? 8000 : 150;
        gold += e.isBoss ? 250 : 25;
        exp += e.isBoss ? 170 : 30;
        enemies.splice(i, 1);

        if (e.isBoss) {
          // 보스 클리어
          levelUpIfNeeded();
          onBossCleared();
          return; // reward로 넘어가면 이번 프레임 종료
        }
      }
    }

    // level up
    levelUpIfNeeded();

    // player death
    if (player.hp <= 0) {
      player.hp = 0;

      // GAME OVER 화면에 선택지 제공 (강제 타이틀 이동 X)
      el.finalResult.textContent = `SCORE: ${score} | LEVEL: ${level} | WAVE: ${wave}`;
      openGameOver();

      // 버튼 활성/비활성 갱신
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

  function draw() {
    beginWorld();

    // background
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

      // warn marker
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

      if (im.complete && im.naturalWidth > 0) {
        ctx.drawImage(im, it.x, it.y, it.w, it.h);
      } else {
        ctx.fillStyle = (it.type === "CORE") ? "#ff4dff" : (it.type === "THUNDER") ? "#ffee55" : "#44ff44";
        ctx.fillRect(it.x, it.y, it.w, it.h);
      }
    }

    // afterimages (aura)
    for (const a of after) {
      ctx.globalAlpha = Math.max(0, a.a);
      ctx.fillStyle = coreStack > 0 ? "rgba(255,70,255,0.9)" : "rgba(0,229,255,0.9)";
      ctx.fillRect(a.x - 10, a.y - 10, 20, 20);
      ctx.globalAlpha = 1;
    }

    // enemies
    for (const e of enemies) {
      const im = e.isBoss ? img.b : img.e;
      if (im.complete && im.naturalWidth > 0) {
        ctx.drawImage(im, e.x, e.y, e.w, e.h);
      } else {
        ctx.fillStyle = e.isBoss ? "#ff3b3b" : "#ff4da6";
        ctx.fillRect(e.x, e.y, e.w, e.h);
      }

      // boss hp bar
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

    endWorld();
  }

  function loop(t) {
    const dt = Math.min(0.033, (t - last) / 1000);
    last = t;

    if (state === STATE.PLAY) {
      update(dt);
    } else {
      // 메뉴 상태에서도 HUD는 유지
      refreshHUD();
    }

    draw();
    requestAnimationFrame(loop);
  }

  // ===== Initial menu + boot off =====
  if (el.boot) el.boot.style.display = "none";

  // Show title menu first
  refreshSlotUI();
  refreshHUD();
  refreshTokenLines();
  openTitle();

  // Title menu에서 active slot 표시 갱신
  refreshSlotUI();

  // Options back
  // (options menu는 타이틀/일시정지에서 열림)
  // 버튼 이벤트는 이미 바인딩됨

  requestAnimationFrame(loop);
})();
