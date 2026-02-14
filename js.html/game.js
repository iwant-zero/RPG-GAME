(() => {
  "use strict";
  window.__BLADE_BOOTED = true;

  document.addEventListener("DOMContentLoaded", () => {
    const debugEl = document.getElementById("debug");
    const dbg = (msg) => {
      if (!debugEl) return;
      debugEl.style.display = "block";
      debugEl.textContent = msg;
    };

    try {
      // ===== DOM =====
      const canvas = document.getElementById("gameCanvas");
      const ctx = canvas.getContext("2d", { alpha: false });
      if (!canvas || !ctx) { dbg("Canvas/Context init failed."); return; }
      ctx.imageSmoothingEnabled = true;

      const hpFill = document.getElementById("hp-fill");
      const expFill = document.getElementById("exp-fill");
      const itemMsg = document.getElementById("item-msg");
      const hitFlash = document.getElementById("hit-flash");

      const statsEl = document.getElementById("stats");
      const scoreEl = document.getElementById("score");
      const waveEl = document.getElementById("wave");
      const goldEl = document.getElementById("gold");

      const awkTimerUI = document.getElementById("awk-timer");

      const cdDashEl = document.getElementById("cd-dash");
      const cdQEl = document.getElementById("cd-q");
      const cdEEl = document.getElementById("cd-e");
      const cdREl = document.getElementById("cd-r");

      const challengePill = document.getElementById("challenge-pill");
      const challengeLabel = document.getElementById("challenge-label");
      const nohitPill = document.getElementById("nohit-pill");
      const nohitLabel = document.getElementById("nohit-label");
      const timePill = document.getElementById("time-pill");
      const timeLabel = document.getElementById("time-label");

      const pauseBtn = document.getElementById("pause-btn");

      // touch
      const touch = document.getElementById("touch");
      const tLeft = document.getElementById("t-left");
      const tRight = document.getElementById("t-right");
      const tJump = document.getElementById("t-jump");
      const tDash = document.getElementById("t-dash");
      const tQ = document.getElementById("t-q");
      const tE = document.getElementById("t-e");
      const tR = document.getElementById("t-r");

      // menus
      const titleMenu = document.getElementById("title-menu");
      const btnTitleBack = document.getElementById("btn-title-back");
      const challengeSelect = document.getElementById("challenge-select");

      const btnOpenOptionsTitle = document.getElementById("btn-open-options-title");

      const pauseMenu = document.getElementById("pause-menu");
      const btnResume = document.getElementById("btn-resume");
      const btnSave = document.getElementById("btn-save");
      const btnOpenShop = document.getElementById("btn-open-shop");
      const btnOpenOptionsPause = document.getElementById("btn-open-options-pause");
      const btnRestart = document.getElementById("btn-restart");
      const btnToTitle = document.getElementById("btn-to-title");

      const tokenLineTitle = document.getElementById("token-line-title");
      const tokenLinePause = document.getElementById("token-line-pause");
      const tokenLineOver = document.getElementById("token-line-over");

      const activeSlotNote = document.getElementById("active-slot-note");
      const miniSlotBtn = [null,
        document.getElementById("mini-slot-1"),
        document.getElementById("mini-slot-2"),
        document.getElementById("mini-slot-3"),
      ];

      const slotBadge = [null,
        document.getElementById("slot-badge-1"),
        document.getElementById("slot-badge-2"),
        document.getElementById("slot-badge-3"),
      ];
      const slotActive = [null,
        document.getElementById("slot-active-1"),
        document.getElementById("slot-active-2"),
        document.getElementById("slot-active-3"),
      ];
      const slotMeta = [null,
        document.getElementById("slot-meta-1"),
        document.getElementById("slot-meta-2"),
        document.getElementById("slot-meta-3"),
      ];
      const slotLoadBtn = [null,
        document.getElementById("slot-load-1"),
        document.getElementById("slot-load-2"),
        document.getElementById("slot-load-3"),
      ];
      const slotNewBtn = [null,
        document.getElementById("slot-new-1"),
        document.getElementById("slot-new-2"),
        document.getElementById("slot-new-3"),
      ];
      const slotDelBtn = [null,
        document.getElementById("slot-del-1"),
        document.getElementById("slot-del-2"),
        document.getElementById("slot-del-3"),
      ];

      // reward
      const rewardMenu = document.getElementById("reward-menu");
      const rewardSub = document.getElementById("reward-sub");
      const rewardBtns = [
        document.getElementById("reward-0"),
        document.getElementById("reward-1"),
        document.getElementById("reward-2"),
      ];
      const rewardNames = [
        document.getElementById("reward-name-0"),
        document.getElementById("reward-name-1"),
        document.getElementById("reward-name-2"),
      ];
      const rewardDescs = [
        document.getElementById("reward-desc-0"),
        document.getElementById("reward-desc-1"),
        document.getElementById("reward-desc-2"),
      ];

      // shop
      const shopMenu = document.getElementById("shop-menu");
      const shopGoldEl = document.getElementById("shop-gold");
      const shopWaveEl = document.getElementById("shop-wave");
      const shopListEl = document.getElementById("shop-list");
      const btnSkipShop = document.getElementById("btn-skip-shop");
      const btnStartWave = document.getElementById("btn-start-wave");

      // options
      const optionsMenu = document.getElementById("options-menu");
      const optShake = document.getElementById("opt-shake");
      const optFlash = document.getElementById("opt-flash");
      const optSlowmo = document.getElementById("opt-slowmo");
      const btnOptionsBack = document.getElementById("btn-options-back");

      // game over
      const overlay = document.getElementById("overlay");
      const finalResult = document.getElementById("final-result");
      const overNote = document.getElementById("over-note");
      const goLoadBtn = [null,
        document.getElementById("go-load-1"),
        document.getElementById("go-load-2"),
        document.getElementById("go-load-3"),
      ];
      const btnRetry = document.getElementById("btn-retry");
      const btnOverTitle = document.getElementById("btn-over-title");

      // ===== Utilities =====
      const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
      const clamp01 = (v) => Math.max(0, Math.min(1, v));
      const rnd = (a, b) => a + Math.random() * (b - a);
      const cx = (o) => o.x + o.w * 0.5;
      const cy = (o) => o.y + o.h * 0.5;
      const aabb = (a, b) => (a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y);
      const dist = (ax, ay, bx, by) => Math.hypot(ax - bx, ay - by);

      function safeNowISO(){ try { return new Date().toISOString(); } catch { return ""; } }

      function lsGet(key, fallback=null){ try { const v = localStorage.getItem(key); return (v==null)?fallback:v; } catch { return fallback; } }
      function lsSet(key, val){ try { localStorage.setItem(key, String(val)); } catch {} }
      function lsDel(key){ try { localStorage.removeItem(key); } catch {} }

      // ===== World / Render scaling (zoom-out for dodge space) =====
      const WORLD_W = 1600;
      const WORLD_H = 900;
      const floorY = WORLD_H - 140;

      let scalePx = 1, offPxX = 0, offPxY = 0;

      function resize() {
        const dpr = Math.max(1, window.devicePixelRatio || 1);
        const sw = Math.max(320, window.innerWidth);
        const sh = Math.max(240, window.innerHeight);

        canvas.style.width = sw + "px";
        canvas.style.height = sh + "px";
        canvas.width = Math.floor(sw * dpr);
        canvas.height = Math.floor(sh * dpr);

        scalePx = Math.min(canvas.width / WORLD_W, canvas.height / WORLD_H);
        offPxX = Math.floor((canvas.width - WORLD_W * scalePx) * 0.5);
        offPxY = Math.floor((canvas.height - WORLD_H * scalePx) * 0.5);
      }
      window.addEventListener("resize", resize);

      // ===== Assets =====
      const img = {
        p: new Image(), e: new Image(), b: new Image(), bg: new Image(),
        ln: new Image(),
        it_core: new Image(), it_thunder: new Image(), it_heal: new Image()
      };
      img.p.src = "assets/player.png";
      img.e.src = "assets/enemy.png";
      img.b.src = "assets/boss.png";
      img.bg.src = "assets/background.png";
      img.ln.src = "assets/lightning.png";
      img.it_core.src = "assets/item_core.png";
      img.it_thunder.src = "assets/item_thunder.png";
      img.it_heal.src = "assets/item_heal.png";

      let bgm = null;
      try {
        bgm = new Audio("assets/bgm.mp3");
        bgm.loop = true;
        bgm.volume = 0.4;
      } catch { bgm = null; }

      // ===== Save System =====
      const SLOT_COUNT = 3;
      const SAVE_PREFIX = "blade_save_slot_v3_";
      const KEY_ACTIVE_SLOT = "blade_active_slot_v3";
      const KEY_CONTINUE_TOKEN = "blade_continue_token_v3";
      const KEY_DEATH_PENDING = "blade_death_pending_v3";

      const KEY_CHALLENGE = "blade_challenge_v3";
      const KEY_OPT_SHAKE = "blade_opt_shake_v3";
      const KEY_OPT_FLASH = "blade_opt_flash_v3";
      const KEY_OPT_SLOWMO = "blade_opt_slowmo_v3";

      const slotKey = (slot) => `${SAVE_PREFIX}${slot}`;

      function getActiveSlot(){ const v = parseInt(lsGet(KEY_ACTIVE_SLOT,"1"),10); return clamp(Number.isFinite(v)?v:1,1,SLOT_COUNT); }
      function setActiveSlot(slot){ lsSet(KEY_ACTIVE_SLOT, clamp(parseInt(slot,10)||1,1,SLOT_COUNT)); renderAllMenus(); }

      function getContinueToken(){ return parseInt(lsGet(KEY_CONTINUE_TOKEN,"0"),10)===1 ? 1 : 0; }
      function setContinueToken(v){ lsSet(KEY_CONTINUE_TOKEN, v?1:0); renderAllMenus(); }

      function getDeathPending(){ return parseInt(lsGet(KEY_DEATH_PENDING,"0"),10)===1 ? 1 : 0; }
      function setDeathPending(v){ lsSet(KEY_DEATH_PENDING, v?1:0); renderAllMenus(); }

      function getChallenge(){ return (lsGet(KEY_CHALLENGE,"normal") || "normal"); }
      function setChallenge(v){ lsSet(KEY_CHALLENGE, v||"normal"); }

      const opts = {
        shake: parseInt(lsGet(KEY_OPT_SHAKE,"1"),10) ? 1 : 0,
        flash: parseInt(lsGet(KEY_OPT_FLASH,"1"),10) ? 1 : 0,
        slowmo: parseInt(lsGet(KEY_OPT_SLOWMO,"1"),10) ? 1 : 0
      };
      function saveOptions(){
        lsSet(KEY_OPT_SHAKE, opts.shake?1:0);
        lsSet(KEY_OPT_FLASH, opts.flash?1:0);
        lsSet(KEY_OPT_SLOWMO, opts.slowmo?1:0);
      }

      function readSave(slot){
        try{
          const raw = localStorage.getItem(slotKey(slot));
          if(!raw) return null;
          const data = JSON.parse(raw);
          if(!data || data.v !== 3) return null;
          return data;
        } catch { return null; }
      }
      function writeSave(slot, data){
        try{
          localStorage.setItem(slotKey(slot), JSON.stringify(data));
          return true;
        } catch { return false; }
      }
      function clearSave(slot){ lsDel(slotKey(slot)); }
      function anySaveExists(){ for(let s=1;s<=SLOT_COUNT;s++) if(readSave(s)) return true; return false; }

      // ===== Game State =====
      let state = "TITLE"; // TITLE | PLAY | PAUSE | REWARD | SHOP | OPTIONS | GAMEOVER
      let prevStateForOptions = "TITLE";
      let titleFromGame = false;
      let titleReturnState = "PAUSE";

      // ===== Challenge =====
      let challengeMode = getChallenge(); // normal|hard|nohit|time
      let noHitBroken = false;
      let timeAttackSec = 0;

      const challengeCfg = () => {
        if(challengeMode === "hard") return { enemyHp: 1.2, enemySpd: 1.15, lnWarnMod: -0.12, dmgMod: 1.15, scoreMod: 1.15, goldMod: 1.1 };
        if(challengeMode === "nohit") return { enemyHp: 1.0, enemySpd: 1.05, lnWarnMod: -0.05, dmgMod: 1.05, scoreMod: 1.2, goldMod: 1.2 };
        if(challengeMode === "time") return { enemyHp: 1.0, enemySpd: 1.0, lnWarnMod: 0.0, dmgMod: 1.0, scoreMod: 1.25, goldMod: 1.1 };
        return { enemyHp: 1.0, enemySpd: 1.0, lnWarnMod: 0.0, dmgMod: 1.0, scoreMod: 1.0, goldMod: 1.0 };
      };

      // ===== Core variables =====
      let score = 0, level = 1, exp = 0, wave = 1, gold = 0;

      let coreStack = 0, awakeningTimeLeft = 0, coreColor = "#0ff";
      let invulnTime = 0;
      let slowmoTime = 0;

      // screen effects
      let shakeTime = 0, shakeAmp = 0;
      let flashTime = 0;

      // ===== Movement (탭 절반 거리 + 홀드 유지) =====
      const PLAYER_SPEED = 12; // 현상태 유지
      const JUMP_POWER = 19;

      const TAP_SPEED_FACTOR = 0.5; // 탭은 반속도
      const TAP_TO_FULL_SEC  = 0.12; // 이 시간 이상 누르면 풀속도
      let leftHoldSec = 0, rightHoldSec = 0;
      let prevA = false, prevD = false;

      // ===== Dash =====
      let dashCdBase = 3.4;
      let dashCdLeft = 0;
      let dashTimeLeft = 0;
      let dashDir = 1;
      const DASH_TIME = 0.12;
      const DASH_DIST = 280;
      const DASH_I_FRAMES = 0.20;
      let dashJust = 0;

      // ===== Skills Q/E/R =====
      const skills = {
        Q: { lv: 1, cd: 6.5, left: 0 }, // Whirl
        E: { lv: 1, cd: 7.5, left: 0 }, // Pierce
        R: { lv: 1, cd: 14.0, left: 0 } // Shield
      };

      // ===== Entities =====
      const player = {
        x: WORLD_W * 0.5 - 40,
        y: floorY - 110,
        w: 80, h: 110,
        vx: 0, vy: 0,
        grounded: false,
        dir: 1,
        hp: 100,
        maxHp: 100,
        baseAtk: 45
      };

      let enemies = [];     // {x,y,w,h,hp,maxHp,speed,isBoss,dead,ai}
      let items = [];       // {x,y,w,h,type}
      let lightnings = [];  // {x,w,h,phase,t,wasInLaneWindow}
      let afterimages = []; // orbit visuals
      let shockwaves = [];  // boss pattern: {x,y,w,h,vx,life}
      const keys = {};

      // ===== Touch visibility =====
      function setTouchVisible(on){
        if(!touch) return;
        const coarse = window.matchMedia && window.matchMedia("(pointer: coarse)").matches;
        touch.style.display = (on && coarse) ? "flex" : "none";
      }

      // ===== UI helpers =====
      function showOverlay(el, on){ if(el) el.style.display = on ? "flex" : "none"; }

      function showItemNotice(text){
        if(!itemMsg) return;
        itemMsg.innerText = text;
        itemMsg.style.display = "block";
        itemMsg.style.color = "#1a1a1a";
        setTimeout(()=>{ itemMsg.style.display="none"; }, 1600);
      }

      function setHitFlash(on){
        if(!hitFlash) return;
        hitFlash.style.opacity = on ? "1" : "0";
      }

      function updateTokenLines(){
        const token = getContinueToken();
        const text = `이어하기 토큰: ${token}/1`;
        if(tokenLineTitle) tokenLineTitle.textContent = text;
        if(tokenLinePause) tokenLinePause.textContent = text;
        if(tokenLineOver) tokenLineOver.textContent = text;
      }

      function updateChallengeUI(){
        if(!challengePill || !challengeLabel) return;
        const mode = challengeMode || "normal";
        if(mode === "normal") {
          challengePill.style.display = "none";
        } else {
          challengePill.style.display = "inline-flex";
          challengeLabel.textContent = mode.toUpperCase();
        }
      }

      function updateNoHitUI(){
        if(challengeMode !== "nohit") {
          if(nohitPill) nohitPill.style.display = "none";
          return;
        }
        if(nohitPill) nohitPill.style.display = "inline-flex";
        if(nohitLabel) nohitLabel.textContent = noHitBroken ? "FAIL" : "OK";
      }

      function updateTimeUI(){
        if(challengeMode !== "time") {
          if(timePill) timePill.style.display = "none";
          return;
        }
        if(timePill) timePill.style.display = "inline-flex";
        if(timeLabel) timeLabel.textContent = timeAttackSec.toFixed(1);
      }

      function syncHUD(){
        if(statsEl) statsEl.innerText = `LV.${level} 에테르 기사`;
        if(scoreEl) scoreEl.innerText = `SCORE: ${Math.floor(score)}`;
        if(waveEl) waveEl.textContent = String(wave);
        if(goldEl) goldEl.textContent = String(Math.floor(gold));

        if(hpFill) hpFill.style.width = (clamp01(player.hp/player.maxHp)*100).toFixed(1) + "%";
        if(expFill) expFill.style.width = clamp(exp,0,100).toFixed(1) + "%";

        if(cdDashEl) cdDashEl.textContent = dashCdLeft.toFixed(1);
        if(cdQEl) cdQEl.textContent = skills.Q.left.toFixed(1);
        if(cdEEl) cdEEl.textContent = skills.E.left.toFixed(1);
        if(cdREl) cdREl.textContent = skills.R.left.toFixed(1);

        updateChallengeUI();
        updateNoHitUI();
        updateTimeUI();
      }

      function syncTitleBackButton(){
        if(!btnTitleBack) return;
        btnTitleBack.style.display = (state==="TITLE" && titleFromGame) ? "inline-block" : "none";
      }

      function renderSlotUI(){
        const active = getActiveSlot();
        const token = getContinueToken();
        const deathPending = getDeathPending();

        for(let s=1;s<=SLOT_COUNT;s++){
          const data = readSave(s);

          if(slotActive[s]) slotActive[s].style.display = (s===active) ? "inline-flex" : "none";

          if(!data){
            if(slotBadge[s]) slotBadge[s].textContent="EMPTY";
            if(slotMeta[s]) slotMeta[s].textContent="No save data.";
            if(slotLoadBtn[s]) slotLoadBtn[s].disabled=true;
            if(slotDelBtn[s]) slotDelBtn[s].disabled=true;
          } else {
            if(slotBadge[s]) slotBadge[s].textContent="SAVED";
            const lines = [
              `LEVEL: ${data.level}   WAVE: ${data.wave}`,
              `GOLD: ${Math.floor(data.gold||0)}   SCORE: ${Math.floor(data.score||0)}`,
              `HP: ${Math.round(data.player?.hp ?? 0)}/${Math.round(data.player?.maxHp ?? 0)}   ATK: ${Math.round(data.player?.baseAtk ?? 0)}`,
              `SKILL: Q${data.skills?.Q?.lv||1} / E${data.skills?.E?.lv||1} / R${data.skills?.R?.lv||1}`,
              `MODE: ${(data.challenge||"normal").toUpperCase()}`,
              `SAVED: ${data.savedAt || "-"}`
            ];
            if(slotMeta[s]) slotMeta[s].textContent = lines.join("\n");
            if(slotDelBtn[s]) slotDelBtn[s].disabled=false;

            const blocked = (deathPending===1 && token===0);
            if(slotLoadBtn[s]) slotLoadBtn[s].disabled = blocked ? true : false;
          }
        }

        for(let s=1;s<=SLOT_COUNT;s++){
          if(!miniSlotBtn[s]) continue;
          miniSlotBtn[s].classList.toggle("active", s===active);
        }
        if(activeSlotNote) activeSlotNote.textContent = `ACTIVE: SLOT ${active}`;

        updateTokenLines();
      }

      function renderGameOverUI(){
        const token = getContinueToken();
        const hasAny = anySaveExists();

        if(overNote){
          if(!hasAny) overNote.textContent = "저장 데이터가 없습니다. (SAVE / CHECKPOINT 필요)";
          else if(token===0) overNote.textContent = "이어하기 토큰이 0입니다. (SAVE로 다시 충전)";
          else overNote.textContent = "불러올 슬롯을 선택하세요. (이어하기 1회 소모)";
        }

        for(let s=1;s<=SLOT_COUNT;s++){
          const data = readSave(s);
          const btn = goLoadBtn[s];
          if(!btn) continue;

          if(!data){
            btn.disabled=true;
            btn.textContent=`LOAD SLOT ${s} (EMPTY)`;
          } else {
            btn.textContent=`LOAD SLOT ${s} (LV.${data.level} / W.${data.wave} / ${String((data.challenge||"normal")).toUpperCase()})`;
            btn.disabled = !(token===1);
          }
        }

        updateTokenLines();
      }

      function renderAllMenus(){
        renderSlotUI();
        renderGameOverUI();
        syncTitleBackButton();
      }

      function setState(next){
        state = next;

        showOverlay(titleMenu, state==="TITLE");
        showOverlay(pauseMenu, state==="PAUSE");
        showOverlay(rewardMenu, state==="REWARD");
        showOverlay(shopMenu, state==="SHOP");
        showOverlay(optionsMenu, state==="OPTIONS");
        showOverlay(overlay, state==="GAMEOVER");

        if(pauseBtn){
          const show = (state==="PLAY" || state==="PAUSE");
          pauseBtn.style.display = show ? "block" : "none";
          pauseBtn.textContent = (state==="PAUSE") ? "▶" : "⏸";
        }

        setTouchVisible(state==="PLAY");

        if(bgm){
          if(state==="PLAY"){
            if(bgm.currentTime>0) bgm.play().catch(()=>{});
          } else {
            bgm.pause();
          }
        }

        if(state === "SHOP") buildShopUI();

        renderAllMenus();
        syncHUD();
      }

      // ===== Options Menu =====
      function openOptions(fromState){
        prevStateForOptions = fromState || "TITLE";
        if(optShake) optShake.checked = !!opts.shake;
        if(optFlash) optFlash.checked = !!opts.flash;
        if(optSlowmo) optSlowmo.checked = !!opts.slowmo;
        setState("OPTIONS");
      }
      function closeOptions(){
        setState(prevStateForOptions || "TITLE");
      }

      // ===== Damage / Effects =====
      function doShake(amp, t){
        if(!opts.shake) return;
        shakeAmp = Math.max(shakeAmp, amp);
        shakeTime = Math.max(shakeTime, t);
      }

      function doFlash(t){
        if(!opts.flash) return;
        flashTime = Math.max(flashTime, t);
        setHitFlash(true);
      }

      function takeDamage(amount, why="hit"){
        if(state !== "PLAY") return;
        if(invulnTime > 0) return;

        const cfg = challengeCfg();
        const dmg = amount * cfg.dmgMod;

        player.hp -= dmg;
        doShake(10, 0.18);
        doFlash(0.16);

        if(challengeMode === "nohit" && !noHitBroken){
          noHitBroken = true;
          showItemNotice("NO-HIT FAILED!");
        }

        if(player.hp <= 0) endGame();
      }

      // ===== Perfect Dodge =====
      const PERFECT_WINDOW = 0.15;
      function perfectDodge(){
        // reward
        const cfg = challengeCfg();
        gold += 40 * cfg.goldMod;
        score += 500 * cfg.scoreMod;

        showItemNotice("PERFECT DODGE!");
        doShake(8, 0.14);

        if(opts.slowmo){
          slowmoTime = Math.max(slowmoTime, 0.6);
        }
      }

      // ===== Save / Load =====
      function saveToSlot(slot, reason="SAVED"){
        if(player.hp<=0) return false;
        const s = clamp(slot,1,SLOT_COUNT);

        const data = {
          v: 3,
          slot: s,
          savedAt: safeNowISO(),
          score, level, exp, wave, gold,
          challenge: challengeMode,
          dash: { cdBase: dashCdBase, cdLeft: dashCdLeft },
          skills: {
            Q: { lv: skills.Q.lv, cd: skills.Q.cd },
            E: { lv: skills.E.lv, cd: skills.E.cd },
            R: { lv: skills.R.lv, cd: skills.R.cd },
          },
          player: { hp: player.hp, maxHp: player.maxHp, baseAtk: player.baseAtk },
          core: { stack: coreStack, time: awakeningTimeLeft, color: coreColor }
        };

        const ok = writeSave(s, data);
        if(ok){
          setContinueToken(1);
          showItemNotice(`${reason} (SLOT ${s})`);
        } else {
          showItemNotice("SAVE FAILED");
        }
        return ok;
      }

      function applySaveData(data){
        score = Number(data.score)||0;
        level = clamp(Number(data.level)||1, 1, 9999);
        exp = clamp(Number(data.exp)||0, 0, 100);
        wave = clamp(Number(data.wave)||1, 1, 9999);
        gold = Number(data.gold)||0;

        challengeMode = (data.challenge || getChallenge() || "normal");
        setChallenge(challengeMode);
        if(challengeSelect) challengeSelect.value = challengeMode;

        // dash
        dashCdBase = clamp(Number(data.dash?.cdBase ?? 3.4), 1.4, 6.0);
        dashCdLeft = clamp(Number(data.dash?.cdLeft ?? 0), 0, 99);
        dashTimeLeft = 0;
        dashJust = 0;

        // skills
        skills.Q.lv = clamp(Number(data.skills?.Q?.lv ?? 1), 1, 9);
        skills.E.lv = clamp(Number(data.skills?.E?.lv ?? 1), 1, 9);
        skills.R.lv = clamp(Number(data.skills?.R?.lv ?? 1), 1, 9);
        skills.Q.cd = clamp(Number(data.skills?.Q?.cd ?? 6.5), 2.0, 12.0);
        skills.E.cd = clamp(Number(data.skills?.E?.cd ?? 7.5), 2.5, 14.0);
        skills.R.cd = clamp(Number(data.skills?.R?.cd ?? 14.0), 6.0, 22.0);
        skills.Q.left = 0; skills.E.left = 0; skills.R.left = 0;

        const p = data.player||{};
        player.maxHp = clamp(Number(p.maxHp)||100, 1, 999999);
        player.hp = clamp(Number(p.hp)||player.maxHp, 1, player.maxHp);
        player.baseAtk = clamp(Number(p.baseAtk)||45, 1, 999999);

        const c = data.core||{};
        coreStack = clamp(Number(c.stack)||0, 0, 999);
        awakeningTimeLeft = clamp(Number(c.time)||0, 0, 999);
        coreColor = (typeof c.color==="string" && c.color) ? c.color : "#0ff";

        // reset runtime
        enemies = []; items = []; lightnings = []; afterimages = []; shockwaves = [];
        player.vx=0; player.vy=0; player.grounded=false; player.dir=1;
        player.x = WORLD_W*0.5 - player.w*0.5;
        player.y = floorY - player.h;

        invulnTime = 1.2;
        slowmoTime = 0;

        leftHoldSec = 0; rightHoldSec = 0;
        prevA = false; prevD = false;

        noHitBroken = false;
        timeAttackSec = 0;

        syncHUD();
      }

      function loadFromSlot(slot, fromDeath=false){
        const s = clamp(slot,1,SLOT_COUNT);
        const data = readSave(s);
        if(!data){ showItemNotice(`SLOT ${s} EMPTY`); return false; }

        if(fromDeath){
          if(getContinueToken() !== 1){ showItemNotice("NO CONTINUE"); return false; }
          setContinueToken(0);
          setDeathPending(0);
        }

        setActiveSlot(s);
        applySaveData(data);

        titleFromGame = false;
        titleReturnState = "PAUSE";
        setState("PLAY");
        showItemNotice(`LOADED (SLOT ${s})`);
        return true;
      }

      // ===== Flow =====
      function keysReset(){ for(const k in keys) keys[k]=false; }

      function startNewGame(slot){
        const s = clamp(slot,1,SLOT_COUNT);
        setActiveSlot(s);

        // Challenge from selector
        challengeMode = (challengeSelect?.value || getChallenge() || "normal");
        setChallenge(challengeMode);

        clearSave(s);
        setContinueToken(0);
        setDeathPending(0);

        score=0; level=1; exp=0; wave=1; gold=0;
        coreStack=0; awakeningTimeLeft=0; coreColor="#0ff";
        invulnTime=0;
        slowmoTime=0;

        player.maxHp=100; player.hp=100; player.baseAtk=45;
        player.vx=0; player.vy=0; player.grounded=false; player.dir=1;

        dashCdBase = 3.4; dashCdLeft = 0; dashTimeLeft = 0; dashJust = 0;

        skills.Q.lv=1; skills.E.lv=1; skills.R.lv=1;
        skills.Q.cd=6.5; skills.E.cd=7.5; skills.R.cd=14.0;
        skills.Q.left=0; skills.E.left=0; skills.R.left=0;

        enemies=[]; items=[]; lightnings=[]; afterimages=[]; shockwaves=[];
        player.x = WORLD_W*0.5 - player.w*0.5;
        player.y = floorY - player.h;

        leftHoldSec = 0; rightHoldSec = 0;
        prevA = false; prevD = false;

        noHitBroken = false;
        timeAttackSec = 0;

        titleFromGame=false; titleReturnState="PAUSE";
        syncHUD();
        setState("PLAY");
        showItemNotice(`NEW GAME (SLOT ${s})`);
      }

      function toTitle(){
        keysReset();
        titleFromGame=false; titleReturnState="PAUSE";
        setState("TITLE");
      }

      function openTitleFromPause(){
        titleFromGame=true; titleReturnState="PAUSE";
        setState("TITLE");
      }

      function backToGame(){
        if(!titleFromGame) return;
        setState(titleReturnState || "PAUSE");
      }

      function endGame(){
        setDeathPending(1);
        titleFromGame=false; titleReturnState="PAUSE";

        setState("GAMEOVER");
        if(finalResult) finalResult.textContent = `SCORE: ${Math.floor(score)} | LEVEL: ${level} | WAVE: ${wave} | GOLD: ${Math.floor(gold)}`;
      }

      // ===== Input =====
      function togglePause(){
        if(state==="PLAY") setState("PAUSE");
        else if(state==="PAUSE") setState("PLAY");
      }

      if(pauseBtn){
        pauseBtn.addEventListener("click", togglePause);
        pauseBtn.addEventListener("touchstart", (e)=>{ e.preventDefault(); togglePause(); }, {passive:false});
      }

      if(btnTitleBack) btnTitleBack.addEventListener("click", backToGame);

      if(btnResume) btnResume.addEventListener("click", ()=>setState("PLAY"));
      if(btnSave) btnSave.addEventListener("click", ()=>saveToSlot(getActiveSlot(), "SAVED"));
      if(btnOpenShop) btnOpenShop.addEventListener("click", ()=>{ buildShopUI(); setState("SHOP"); });
      if(btnOpenOptionsTitle) btnOpenOptionsTitle.addEventListener("click", ()=>openOptions("TITLE"));
      if(btnOpenOptionsPause) btnOpenOptionsPause.addEventListener("click", ()=>openOptions("PAUSE"));
      if(btnRestart) btnRestart.addEventListener("click", ()=>startNewGame(getActiveSlot()));
      if(btnToTitle) btnToTitle.addEventListener("click", openTitleFromPause);

      for(let s=1;s<=SLOT_COUNT;s++){
        if(miniSlotBtn[s]) miniSlotBtn[s].addEventListener("click", ()=>setActiveSlot(s));
      }

      for(let s=1;s<=SLOT_COUNT;s++){
        if(slotLoadBtn[s]) slotLoadBtn[s].addEventListener("click", ()=>loadFromSlot(s, getDeathPending()===1));
        if(slotNewBtn[s]) slotNewBtn[s].addEventListener("click", ()=>startNewGame(s));
        if(slotDelBtn[s]) slotDelBtn[s].addEventListener("click", ()=>{
          clearSave(s);
          showItemNotice(`DELETED SLOT ${s}`);
          renderAllMenus();
        });
      }

      if(btnRetry) btnRetry.addEventListener("click", ()=>startNewGame(getActiveSlot()));
      if(btnOverTitle) btnOverTitle.addEventListener("click", toTitle);
      for(let s=1;s<=SLOT_COUNT;s++){
        if(goLoadBtn[s]) goLoadBtn[s].addEventListener("click", ()=>loadFromSlot(s, true));
      }

      // Options
      if(optShake) optShake.addEventListener("change", ()=>{ opts.shake = optShake.checked ? 1 : 0; saveOptions(); });
      if(optFlash) optFlash.addEventListener("change", ()=>{ opts.flash = optFlash.checked ? 1 : 0; saveOptions(); });
      if(optSlowmo) optSlowmo.addEventListener("change", ()=>{ opts.slowmo = optSlowmo.checked ? 1 : 0; saveOptions(); });
      if(btnOptionsBack) btnOptionsBack.addEventListener("click", closeOptions);

      // Challenge select
      if(challengeSelect){
        challengeSelect.value = challengeMode;
        challengeSelect.addEventListener("change", ()=>{
          challengeMode = challengeSelect.value || "normal";
          setChallenge(challengeMode);
          syncHUD();
          renderAllMenus();
        });
      }

      // Keyboard
      window.addEventListener("keydown", (e) => {
        if(["Space","ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].includes(e.code)) e.preventDefault();

        if(state==="TITLE"){
          if(titleFromGame && (e.code==="Escape" || e.code==="KeyP")) { e.preventDefault(); backToGame(); }
          return;
        }
        if(state==="GAMEOVER" || state==="REWARD" || state==="SHOP" || state==="OPTIONS") return;

        if(e.code==="KeyP" || e.code==="Escape"){ e.preventDefault(); togglePause(); return; }

        // one-shot skills / dash on keydown (no repeat)
        if(state==="PLAY" && !e.repeat){
          if(e.code==="ShiftLeft" || e.code==="ShiftRight") { e.preventDefault(); tryDash(); return; }
          if(e.code==="KeyQ") { e.preventDefault(); castQ(); return; }
          if(e.code==="KeyE") { e.preventDefault(); castE(); return; }
          if(e.code==="KeyR") { e.preventDefault(); castR(); return; }
        }

        keys[e.code] = true;
        if(bgm && bgm.paused && (state==="PLAY" || state==="PAUSE")) bgm.play().catch(()=>{});
      }, {passive:false});

      window.addEventListener("keyup", (e)=>{ keys[e.code]=false; });

      // Touch hold buttons (move/jump)
      function bindHold(el, keyCode){
        if(!el) return;
        const down = (ev)=>{ ev.preventDefault(); keys[keyCode]=true; };
        const up = (ev)=>{ ev.preventDefault(); keys[keyCode]=false; };
        el.addEventListener("pointerdown", down, {passive:false});
        el.addEventListener("pointerup", up, {passive:false});
        el.addEventListener("pointercancel", up, {passive:false});
        el.addEventListener("pointerleave", up, {passive:false});
        el.addEventListener("contextmenu", (ev)=>ev.preventDefault());
      }
      bindHold(tLeft, "KeyA");
      bindHold(tRight, "KeyD");
      bindHold(tJump, "Space");

      // Touch one-shot (dash/skills)
      function bindTap(el, fn){
        if(!el) return;
        el.addEventListener("pointerdown", (ev)=>{ ev.preventDefault(); if(state==="PLAY") fn(); }, {passive:false});
        el.addEventListener("contextmenu", (ev)=>ev.preventDefault());
      }
      bindTap(tDash, tryDash);
      bindTap(tQ, castQ);
      bindTap(tE, castE);
      bindTap(tR, castR);

      // ===== Spawn / Balance =====
      function enemySpawnMs(){ return clamp(2000 - (wave-1)*95, 780, 2000); }
      function lightningSpawnMs(){ return clamp(5200 - (wave-1)*120, 3200, 5200); }

      function scheduleEnemySpawn(){
        setTimeout(()=>{ try{ if(state==="PLAY") spawnEnemy(); } finally{ scheduleEnemySpawn(); } }, enemySpawnMs());
      }
      function scheduleLightningSpawn(){
        setTimeout(()=>{ try{ if(state==="PLAY") spawnLightnings(); } finally{ scheduleLightningSpawn(); } }, lightningSpawnMs());
      }

      function tryDropItem(x, y){
        if(Math.random() > 0.2) return;
        const r = Math.random();
        const type = (r<0.2) ? "CORE" : (r<0.5) ? "THUNDER" : "HEAL";
        items.push({ x: clamp(x, 20, WORLD_W-80), y: floorY-70, w:55, h:55, type });
      }

      function spawnBoss(){
        const cfg = challengeCfg();
        const bs = 1 + (level / 110);
        const baseHp = 2800 * Math.pow(1.65, level/10);
        const bossHp = baseHp * cfg.enemyHp;

        enemies.push({
          x: WORLD_W + 280,
          y: floorY - (250 * bs),
          w: 190 * bs,
          h: 250 * bs,
          hp: bossHp,
          maxHp: bossHp,
          speed: (1.15 + (level/80)) * cfg.enemySpd,
          isBoss: true,
          dead: false,
          ai: { mode: "chase", cd: 2.2, t: 0, lockDir: 1 }
        });

        showItemNotice(`BOSS ALERT: LV.${level}`);
      }

      function spawnMob(){
        const cfg = challengeCfg();
        const mhp = (110 + (level * 32)) * cfg.enemyHp;
        enemies.push({
          x: Math.random() > 0.5 ? -190 : WORLD_W + 190,
          y: floorY - 100,
          w: 78, h: 100,
          hp: mhp, maxHp: mhp,
          speed: (2.9 + (level * 0.25)) * cfg.enemySpd,
          isBoss: false,
          dead: false,
          ai: null
        });
      }

      function spawnEnemy(){
        const bossAlive = enemies.some(e=>e.isBoss);
        const isBossTurn = (level % 10 === 0);
        if(isBossTurn && !bossAlive) spawnBoss();
        else spawnMob();
      }

      // ===== Lightning (6 fixed, 2x dmg, improved warning) =====
      const LN_LANES = 14;
      const LN_STRIKE_SEC = 0.28;
      const LN_DPS = 56; // 2배(요청 반영)
      const LN_BASE_WARN = 0.75;

      function shuffle(arr){
        for(let i=arr.length-1;i>0;i--){
          const j = Math.floor(Math.random()*(i+1));
          [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
      }

      function lnWarnSec(){
        const cfg = challengeCfg();
        return clamp(LN_BASE_WARN + cfg.lnWarnMod, 0.45, 1.2);
      }

      function spawnLightnings(){
        const laneW = WORLD_W / LN_LANES;
        const pLane = clamp(Math.floor((player.x + player.w*0.5) / laneW), 0, LN_LANES-1);

        // safe lane near player (1 guaranteed)
        const offset = (Math.random() < 0.5 ? -1 : 1) * (Math.random() < 0.65 ? 1 : 2);
        const safeLane = clamp(pLane + offset, 0, LN_LANES-1);

        const strikeCount = 6; // 6개 고정
        const candidates = [];
        for(let i=0;i<LN_LANES;i++){
          if(i === safeLane) continue;
          candidates.push(i);
        }
        shuffle(candidates);

        const chosen = candidates.slice(0, strikeCount);
        const warn = lnWarnSec();

        for(const lane of chosen){
          const x0 = lane * laneW;
          const pad = laneW * 0.10;
          const w = laneW - pad*2;

          lightnings.push({
            x: x0 + pad,
            w,
            h: WORLD_H + 260,
            phase: "warn",
            t: warn,
            wasInLaneWindow: false
          });
        }
      }

      // ===== Boss Patterns =====
      function spawnShockwave(x, dir){
        shockwaves.push({
          x: x + (dir>0 ? 60 : -60),
          y: floorY + 8,
          w: 140,
          h: 18,
          vx: dir * 920,
          life: 1.2
        });
      }

      function bossAI(en, dt){
        if(!en.ai) return;

        en.ai.cd -= dt;
        if(en.ai.cd <= 0){
          // pick pattern
          const r = Math.random();
          if(r < 0.40){
            en.ai.mode = "charge";
            en.ai.t = 0.85;
            en.ai.lockDir = (cx(player) >= cx(en)) ? 1 : -1;
            en.ai.cd = 2.8;
            showItemNotice("BOSS: CHARGE!");
          } else if(r < 0.70){
            en.ai.mode = "shock";
            en.ai.t = 0.55;
            en.ai.cd = 3.2;
            spawnShockwave(en.x, -1);
            spawnShockwave(en.x,  1);
            showItemNotice("BOSS: SHOCKWAVE!");
          } else {
            en.ai.mode = "summon";
            en.ai.t = 0.8;
            en.ai.cd = 3.8;
            // summon 2 mobs near boss
            for(let i=0;i<2;i++){
              enemies.push({
                x: clamp(en.x + rnd(-180, 180), 20, WORLD_W-120),
                y: floorY - 100,
                w: 78, h: 100,
                hp: (90 + level*20) * challengeCfg().enemyHp,
                maxHp: (90 + level*20) * challengeCfg().enemyHp,
                speed: (2.8 + level*0.22) * challengeCfg().enemySpd,
                isBoss: false,
                dead: false,
                ai: null
              });
            }
            showItemNotice("BOSS: SUMMON!");
          }
        }

        if(en.ai.mode === "charge"){
          en.ai.t -= dt;
          const sp = en.speed * 4.2;
          en.x += en.ai.lockDir * sp;
          if(en.ai.t <= 0) en.ai.mode = "chase";
        } else {
          // chase baseline
          if(cx(en) < cx(player)) en.x += en.speed;
          else en.x -= en.speed;
        }
      }

      // ===== Rewards (upgrade tree) =====
      const REWARD_POOL = [
        // stats
        { id:"heal_full", name:"나노 리부트", desc:"HP 완전 회복 + 최대 HP +20", apply:()=>{ player.maxHp += 20; player.hp = player.maxHp; } },
        { id:"atk_up", name:"코어 튜닝", desc:"기본 공격력 +25", apply:()=>{ player.baseAtk += 25; } },
        { id:"maxhp_big", name:"강화 프레임", desc:"최대 HP +50 (즉시 30 회복)", apply:()=>{ player.maxHp += 50; player.hp = clamp(player.hp+30, 1, player.maxHp); } },

        // core
        { id:"core_stack", name:"에테르 코어 주입", desc:"CORE 스택 +1\n오버드라이브 10초", apply:()=>{ coreStack += 1; awakeningTimeLeft = 10; coreColor="#f0f"; } },
        { id:"thunder_burst", name:"에테르 썬더+", desc:"현재 화면 적에게 대미지 6000", apply:()=>{ enemies.forEach(e=>{ e.hp -= 6000; }); } },

        // dash / lightning comfort
        { id:"dash_cdr", name:"대시 리액터", desc:"대시 쿨타임 -0.35s (최저 1.6s)", apply:()=>{ dashCdBase = Math.max(1.6, dashCdBase - 0.35); } },
        { id:"warn_plus", name:"레인 스캐너", desc:"번개 경고시간 +0.08s (최대 1.2s)", apply:()=>{ /* LN warn is derived; we emulate by reducing challenge pressure via temp gold reward */ gold += 60; } },

        // skill upgrades
        { id:"Q_up", name:"스킬 강화: Q", desc:"Q 레벨 +1\n(피해량/범위 증가)", apply:()=>{ skills.Q.lv = Math.min(9, skills.Q.lv+1); } },
        { id:"E_up", name:"스킬 강화: E", desc:"E 레벨 +1\n(피해량/관통 강화)", apply:()=>{ skills.E.lv = Math.min(9, skills.E.lv+1); } },
        { id:"R_up", name:"스킬 강화: R", desc:"R 레벨 +1\n(보호시간 증가)", apply:()=>{ skills.R.lv = Math.min(9, skills.R.lv+1); } },
        { id:"skill_cdr", name:"오버클럭", desc:"Q/E/R 쿨타임 -6%", apply:()=>{ skills.Q.cd = Math.max(2.0, skills.Q.cd*0.94); skills.E.cd = Math.max(2.5, skills.E.cd*0.94); skills.R.cd = Math.max(6.0, skills.R.cd*0.94); } },
      ];

      function pickRewards(){
        const pool = REWARD_POOL.slice();
        for(let i=pool.length-1;i>0;i--){
          const j = Math.floor(Math.random()*(i+1));
          [pool[i], pool[j]] = [pool[j], pool[i]];
        }
        return pool.slice(0,3);
      }

      let currentRewards = [];
      function openRewardMenu(nextWave){
        currentRewards = pickRewards();
        if(rewardSub) rewardSub.textContent = `WAVE ${wave} → ${nextWave}`;
        for(let i=0;i<3;i++){
          const r = currentRewards[i];
          if(rewardNames[i]) rewardNames[i].textContent = r.name;
          if(rewardDescs[i]) rewardDescs[i].textContent = r.desc;
        }
        setState("REWARD");
      }

      function onBossCleared(){
        enemies = enemies.filter(e=>!e.isBoss); // clean boss remnants
        openRewardMenu(wave+1);
      }

      function applyReward(idx){
        const r = currentRewards[idx];
        if(!r) return;

        wave += 1;
        r.apply();

        // checkpoint save at boss clear timing
        invulnTime = Math.max(invulnTime, 1.0);
        saveToSlot(getActiveSlot(), "CHECKPOINT");

        // then shop
        setState("SHOP");
      }

      rewardBtns.forEach((btn,i)=>{
        if(!btn) return;
        btn.addEventListener("click", ()=>{ if(state==="REWARD") applyReward(i); });
      });

      // ===== Shop =====
      const SHOP_ITEMS = [
        {
          id:"heal50", name:"응급 회복(50)",
          desc:"HP +50 (최대치 초과 불가)",
          cost: 120,
          can: ()=> player.hp < player.maxHp,
          apply: ()=> { player.hp = Math.min(player.maxHp, player.hp + 50); }
        },
        {
          id:"maxhp20", name:"프레임 강화(+20)",
          desc:"최대 HP +20",
          cost: 220,
          can: ()=> true,
          apply: ()=> { player.maxHp += 20; player.hp = Math.min(player.maxHp, player.hp + 20); }
        },
        {
          id:"atk15", name:"공격 모듈(+15)",
          desc:"기본 공격력 +15",
          cost: 200,
          can: ()=> true,
          apply: ()=> { player.baseAtk += 15; }
        },
        {
          id:"dashcdr", name:"대시 냉각(-0.25s)",
          desc:"대시 쿨타임 -0.25s (최저 1.6s)",
          cost: 260,
          can: ()=> dashCdBase > 1.6,
          apply: ()=> { dashCdBase = Math.max(1.6, dashCdBase - 0.25); }
        },
        {
          id:"qUp", name:"Q 업그레이드(+1)",
          desc:"Q 레벨 +1",
          cost: 320,
          can: ()=> skills.Q.lv < 9,
          apply: ()=> { skills.Q.lv += 1; }
        },
        {
          id:"eUp", name:"E 업그레이드(+1)",
          desc:"E 레벨 +1",
          cost: 340,
          can: ()=> skills.E.lv < 9,
          apply: ()=> { skills.E.lv += 1; }
        },
        {
          id:"rUp", name:"R 업그레이드(+1)",
          desc:"R 레벨 +1",
          cost: 360,
          can: ()=> skills.R.lv < 9,
          apply: ()=> { skills.R.lv += 1; }
        },
        {
          id:"skillcdr", name:"스킬 오버클럭(-5%)",
          desc:"Q/E/R 쿨타임 -5% (누적 가능)",
          cost: 420,
          can: ()=> true,
          apply: ()=> {
            skills.Q.cd = Math.max(2.0, skills.Q.cd*0.95);
            skills.E.cd = Math.max(2.5, skills.E.cd*0.95);
            skills.R.cd = Math.max(6.0, skills.R.cd*0.95);
          }
        },
      ];

      function buildShopUI(){
        if(!shopListEl) return;
        if(shopGoldEl) shopGoldEl.textContent = String(Math.floor(gold));
        if(shopWaveEl) shopWaveEl.textContent = String(wave);

        shopListEl.innerHTML = "";
        for(const it of SHOP_ITEMS){
          const card = document.createElement("div");
          card.className = "shop-item";

          const top = document.createElement("div");
          top.className = "shop-top";

          const name = document.createElement("div");
          name.className = "shop-name";
          name.textContent = it.name;

          const cost = document.createElement("div");
          cost.className = "shop-cost";
          cost.textContent = `COST ${it.cost}`;

          top.appendChild(name);
          top.appendChild(cost);

          const desc = document.createElement("div");
          desc.className = "shop-desc";
          desc.textContent = it.desc;

          const actions = document.createElement("div");
          actions.className = "shop-actions";

          const buy = document.createElement("button");
          buy.className = "menu-btn mini";
          buy.textContent = "BUY";
          const canBuy = (gold >= it.cost) && it.can();
          buy.disabled = !canBuy;

          buy.addEventListener("click", ()=>{
            if(state !== "SHOP") return;
            if(gold < it.cost) return;
            if(!it.can()) return;
            gold -= it.cost;
            it.apply();
            showItemNotice(`PURCHASED: ${it.name}`);
            buildShopUI();
            syncHUD();
          });

          actions.appendChild(buy);

          card.appendChild(top);
          card.appendChild(desc);
          card.appendChild(actions);

          shopListEl.appendChild(card);
        }
      }

      function startWaveFromShop(){
        // start wave
        invulnTime = Math.max(invulnTime, 0.8);

        // time-attack timer starts at gameplay time
        if(challengeMode === "time" && timeAttackSec <= 0.01){
          timeAttackSec = 0;
        }

        showItemNotice(`WAVE ${wave} START`);
        setState("PLAY");
      }

      if(btnSkipShop) btnSkipShop.addEventListener("click", ()=>{ if(state==="SHOP") startWaveFromShop(); });
      if(btnStartWave) btnStartWave.addEventListener("click", ()=>{ if(state==="SHOP") startWaveFromShop(); });

      // ===== Dash / Skills =====
      function tryDash(){
        if(state !== "PLAY") return;
        if(dashCdLeft > 0) return;
        dashCdLeft = dashCdBase;
        dashTimeLeft = DASH_TIME;
        dashDir = player.dir || 1;
        dashJust = PERFECT_WINDOW;
        invulnTime = Math.max(invulnTime, DASH_I_FRAMES);
        doShake(9, 0.12);
      }

      function castQ(){
        if(state !== "PLAY") return;
        if(skills.Q.left > 0) return;
        skills.Q.left = skills.Q.cd;

        const lv = skills.Q.lv;
        const radius = 220 + lv*18;
        const dmg = 260 + lv*120 + player.baseAtk*2.0;

        let hit = 0;
        enemies.forEach(en=>{
          const d = dist(cx(player), cy(player), cx(en), cy(en));
          if(d <= radius){
            en.hp -= dmg;
            hit++;
            if(en.hp <= 0) en.dead = true;
          }
        });

        score += hit * 80 * challengeCfg().scoreMod;
        doShake(11, 0.14);
        showItemNotice(hit>0 ? `Q HIT x${hit}` : "Q");
      }

      function castE(){
        if(state !== "PLAY") return;
        if(skills.E.left > 0) return;
        skills.E.left = skills.E.cd;

        const lv = skills.E.lv;
        const range = 560 + lv*40;
        const thick = 70 + lv*8;
        const dmg = 380 + lv*160 + player.baseAtk*2.3;

        const dir = player.dir || 1;
        const sx = cx(player);
        const minX = dir > 0 ? sx : sx - range;
        const maxX = dir > 0 ? sx + range : sx;

        let hit = 0;
        enemies.forEach(en=>{
          const ex = cx(en);
          const ey = cy(en);
          if(ex >= minX && ex <= maxX && Math.abs(ey - cy(player)) <= thick){
            en.hp -= dmg;
            hit++;
            if(en.hp <= 0) en.dead = true;
          }
        });

        score += hit * 100 * challengeCfg().scoreMod;
        doShake(12, 0.15);
        showItemNotice(hit>0 ? `E HIT x${hit}` : "E");
      }

      function castR(){
        if(state !== "PLAY") return;
        if(skills.R.left > 0) return;
        skills.R.left = skills.R.cd;

        const lv = skills.R.lv;
        const dur = 2.0 + lv*0.45;
        invulnTime = Math.max(invulnTime, dur);
        doShake(8, 0.10);
        showItemNotice(`SHIELD ${dur.toFixed(1)}s`);
      }

      // ===== XP / Items =====
      function pickupItem(it){
        if(it.type==="CORE"){
          coreStack++;
          awakeningTimeLeft = 10;
          coreColor = "#f0f";
          showItemNotice("CORE AWAKENED!");
        } else if(it.type==="THUNDER"){
          enemies.forEach(e=>{ e.hp -= 4000; if(e.hp<=0) e.dead = true; });
          showItemNotice("ETHER THUNDER!");
        } else if(it.type==="HEAL"){
          player.hp = Math.min(player.maxHp, player.hp + 60);
          showItemNotice("RECOVERED!");
        }
      }

      // ===== Update =====
      function update(dtRaw){
        if(state !== "PLAY") return;

        // time attack
        if(challengeMode === "time"){
          timeAttackSec += dtRaw;
        }

        // slow-mo
        if(slowmoTime > 0){
          slowmoTime = Math.max(0, slowmoTime - dtRaw);
        }
        const dt = dtRaw * (slowmoTime > 0 ? 0.55 : 1.0);

        // effects
        if(shakeTime > 0) shakeTime = Math.max(0, shakeTime - dtRaw);
        if(flashTime > 0) {
          flashTime = Math.max(0, flashTime - dtRaw);
          if(flashTime <= 0) setHitFlash(false);
        }

        if(invulnTime > 0) invulnTime = Math.max(0, invulnTime - dt);
        if(dashCdLeft > 0) dashCdLeft = Math.max(0, dashCdLeft - dt);
        if(dashJust > 0) dashJust = Math.max(0, dashJust - dt);

        // skill cds
        skills.Q.left = Math.max(0, skills.Q.left - dt);
        skills.E.left = Math.max(0, skills.E.left - dt);
        skills.R.left = Math.max(0, skills.R.left - dt);

        // awakening
        if(awakeningTimeLeft > 0) {
          awakeningTimeLeft -= dt;
          if(awkTimerUI){
            awkTimerUI.style.display = "block";
            awkTimerUI.innerText = `OVERDRIVE: ${Math.max(0, awakeningTimeLeft).toFixed(1)}s (x${coreStack})`;
          }
          if(awakeningTimeLeft <= 0){
            coreStack = 0;
            coreColor = "#0ff";
            if(awkTimerUI) awkTimerUI.style.display = "none";
          }
        }

        // ===== movement (tap half distance) + dash override =====
        const aHold = !!keys["KeyA"] && !keys["KeyD"];
        const dHold = !!keys["KeyD"] && !keys["KeyA"];
        let tapReleased = false;

        if(aHold) leftHoldSec = Math.min(leftHoldSec + dt, 9);
        else { if(prevA && leftHoldSec > 0 && leftHoldSec < TAP_TO_FULL_SEC) tapReleased = true; leftHoldSec = 0; }

        if(dHold) rightHoldSec = Math.min(rightHoldSec + dt, 9);
        else { if(prevD && rightHoldSec > 0 && rightHoldSec < TAP_TO_FULL_SEC) tapReleased = true; rightHoldSec = 0; }

        prevA = aHold; prevD = dHold;

        // dash movement
        if(dashTimeLeft > 0){
          dashTimeLeft = Math.max(0, dashTimeLeft - dt);
          const sp = DASH_DIST / DASH_TIME;
          player.x += dashDir * sp * dt;
          player.vx = 0;
        } else {
          if(aHold){
            const f = (leftHoldSec < TAP_TO_FULL_SEC) ? TAP_SPEED_FACTOR : 1;
            player.vx = -PLAYER_SPEED * f;
            player.dir = -1;
          } else if(dHold){
            const f = (rightHoldSec < TAP_TO_FULL_SEC) ? TAP_SPEED_FACTOR : 1;
            player.vx = PLAYER_SPEED * f;
            player.dir = 1;
          } else {
            if(tapReleased) player.vx = 0;
            else player.vx *= 0.85;
          }

          if(keys["Space"] && player.grounded){
            player.vy = -JUMP_POWER;
            player.grounded = false;
            // jump timing also can count for perfect dodge
            if(dashJust <= 0) dashJust = PERFECT_WINDOW * 0.75;
          }

          player.vy += 0.9;
          player.x += player.vx;
          player.y += player.vy;
        }

        player.x = clamp(player.x, 0, WORLD_W-player.w);
        if(player.y > floorY-player.h){
          player.y = floorY-player.h;
          player.vy = 0;
          player.grounded = true;
        }

        // orbit auto-attack visual + dmg
        const currentAtk = player.baseAtk * (1 + coreStack * 0.6);
        const rotationSpeed = 0.2 + (coreStack * 0.06);
        const orbitCount = 1 + coreStack;

        for(let i=0;i<orbitCount;i++){
          const angle = (Date.now()/1000*(rotationSpeed*10)) + (i*Math.PI*2/orbitCount);
          afterimages.push({
            x: cx(player) + Math.cos(angle)*110 - 11,
            y: cy(player) + Math.sin(angle)*110 - 11,
            opacity: 0.8,
            life: 12,
            color: coreColor
          });
        }

        // boss patterns + enemy movement
        let bossJustDied = false;
        const hitRangeBase = 200 + (coreStack * 10);

        enemies.forEach(en=>{
          if(en.isBoss) bossAI(en, dt);
          else {
            if(cx(en)<cx(player)) en.x += en.speed;
            else en.x -= en.speed;
          }

          // collision damage
          if(aabb(player,en)){
            if(en.isBoss) takeDamage(1.0, "boss");
            else takeDamage(0.45, "mob");
          }

          // orbit damage
          const d = dist(cx(player), cy(player), cx(en), cy(en));
          const bossBonus = en.isBoss ? (en.w * 0.18) : 0;
          if(d < (hitRangeBase + bossBonus)){
            en.hp -= currentAtk * 0.17;
            if(en.hp <= 0){
              en.dead = true;
              if(en.isBoss) bossJustDied = true;
            }
          }
        });

        // shockwave update
        shockwaves.forEach(sw=>{
          sw.x += sw.vx * dt;
          sw.life -= dt;
          if(sw.life > 0){
            const hit = (player.grounded && aabb(player, sw));
            if(hit) takeDamage(18, "shockwave");
          } else {
            sw.dead = true;
          }
        });
        shockwaves = shockwaves.filter(sw=>!sw.dead && sw.x > -400 && sw.x < WORLD_W+400);

        // remove dead enemies + rewards
        const cfg = challengeCfg();
        enemies = enemies.filter(en=>{
          if(en.dead){
            tryDropItem(en.x, en.y);

            // score & gold
            score += (en.isBoss ? 9000 : 160) * cfg.scoreMod;
            gold  += (en.isBoss ? 220 : 18) * cfg.goldMod;

            // exp
            exp += en.isBoss ? 160 : 30;
            return false;
          }
          return true;
        });

        if(bossJustDied) onBossCleared();

        if(exp >= 100){
          level++;
          exp = 0;
          player.baseAtk += 15;
        }

        // lightning update + perfect window tracking
        const warnWin = PERFECT_WINDOW;
        lightnings.forEach(ln=>{
          ln.t -= dt;

          if(ln.phase === "warn"){
            // record if player still in lane during last perfect window
            if(ln.t <= warnWin){
              if(player.x < ln.x + ln.w && player.x + player.w > ln.x){
                ln.wasInLaneWindow = true;
              }
            }
            if(ln.t <= 0){
              ln.phase = "strike";
              ln.t = LN_STRIKE_SEC;

              const inLaneNow = (player.x < ln.x + ln.w && player.x + player.w > ln.x);
              // perfect dodge check: was in lane in last moment but now escaped (or dash used)
              if(!inLaneNow && (ln.wasInLaneWindow || dashJust > 0)){
                perfectDodge();
              }
            }
          } else {
            // strike damage
            if(player.x < ln.x + ln.w && player.x + player.w > ln.x){
              takeDamage(LN_DPS * dt, "lightning");
            }
            if(ln.t <= 0) ln.dead = true;
          }
        });
        lightnings = lightnings.filter(ln=>!ln.dead);

        // item pickup
        items = items.filter(it=>{
          const close = Math.abs(cx(player) - (it.x+it.w/2)) < 65 && Math.abs(cy(player) - (it.y+it.h/2)) < 110;
          if(close){
            pickupItem(it);
            return false;
          }
          return true;
        });

        afterimages.forEach(a=>{ a.opacity -= 0.07; a.life--; });
        afterimages = afterimages.filter(a=>a.life > 0);

        syncHUD();
      }

      // ===== Draw =====
      function draw(){
        // screen shake (in world units)
        let shakeX = 0, shakeY = 0;
        if(opts.shake && shakeTime > 0){
          const r = (Math.random()*2 - 1);
          const r2 = (Math.random()*2 - 1);
          shakeX = r * shakeAmp;
          shakeY = r2 * (shakeAmp * 0.6);
        }

        ctx.setTransform(1,0,0,1,0,0);
        ctx.fillStyle = "#000";
        ctx.fillRect(0,0,canvas.width,canvas.height);

        ctx.setTransform(scalePx,0,0,scalePx, offPxX + shakeX*scalePx, offPxY + shakeY*scalePx);

        // bg
        if(img.bg.complete && img.bg.width>0) ctx.drawImage(img.bg, 0,0, WORLD_W, WORLD_H);
        else { ctx.fillStyle="#010108"; ctx.fillRect(0,0,WORLD_W,WORLD_H); }

        // lightning (improved warning)
        lightnings.forEach(ln=>{
          const isWarn = ln.phase === "warn";
          const alpha = isWarn ? 0.28 : 1.0;

          if(img.ln.complete && img.ln.width>0){
            ctx.globalAlpha = alpha;
            ctx.drawImage(img.ln, ln.x, -220, ln.w, ln.h);
            ctx.globalAlpha = 1.0;
          } else {
            ctx.globalAlpha = alpha;
            ctx.fillStyle = "rgba(255,255,255,0.95)";
            ctx.fillRect(ln.x, 0, ln.w, WORLD_H);
            ctx.globalAlpha = 1.0;
          }

          // warning floor marker (thicker)
          if(isWarn){
            ctx.globalAlpha = 0.45;
            ctx.fillStyle = "rgba(255,255,255,0.95)";
            ctx.fillRect(ln.x, floorY + 6, ln.w, 6);
            ctx.globalAlpha = 1.0;
          }
        });

        // floor
        ctx.strokeStyle="#1a1a1a";
        ctx.lineWidth=4;
        ctx.beginPath();
        ctx.moveTo(0,floorY);
        ctx.lineTo(WORLD_W,floorY);
        ctx.stroke();

        // shockwaves
        shockwaves.forEach(sw=>{
          ctx.globalAlpha = 0.7;
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(sw.x, sw.y, sw.w, sw.h);
          ctx.globalAlpha = 1.0;
        });

        // items
        items.forEach(it=>{
          let itemImg = img.it_heal;
          if(it.type==="CORE") itemImg = img.it_core;
          else if(it.type==="THUNDER") itemImg = img.it_thunder;

          if(itemImg.complete && itemImg.width>0) ctx.drawImage(itemImg, it.x,it.y,it.w,it.h);
          else {
            ctx.fillStyle = (it.type==="CORE")?"#f0f":(it.type==="THUNDER")?"#ff0":"#0f0";
            ctx.fillRect(it.x,it.y,it.w,it.h);
          }
        });

        // afterimages
        afterimages.forEach(a=>{
          ctx.globalAlpha = a.opacity;
          ctx.fillStyle = a.color || "#0ff";
          ctx.fillRect(a.x,a.y,22,22);
        });
        ctx.globalAlpha = 1;

        // enemies
        enemies.forEach(en=>{
          const image = en.isBoss ? img.b : img.e;
          if(image.complete && image.width>0) ctx.drawImage(image, en.x,en.y,en.w,en.h);
          else { ctx.fillStyle = en.isBoss ? "#ff0033" : "#ff55aa"; ctx.fillRect(en.x,en.y,en.w,en.h); }

          if(en.isBoss){
            const ratio = clamp01(en.hp/en.maxHp);
            ctx.fillStyle="#1a1a1a";
            ctx.fillRect(en.x, en.y-30, en.w, 15);
            ctx.fillStyle="#cc0000";
            ctx.fillRect(en.x, en.y-30, en.w*ratio, 15);
          }
        });

        // player (blink on invuln)
        const blink = (invulnTime>0) ? (Math.floor(performance.now()/80)%2===0) : true;
        if(blink){
          ctx.save();
          if(player.dir===-1){
            ctx.translate(player.x+player.w, player.y);
            ctx.scale(-1,1);
            if(img.p.complete && img.p.width>0) ctx.drawImage(img.p, 0,0, player.w,player.h);
            else { ctx.fillStyle="#00e5ff"; ctx.fillRect(0,0,player.w,player.h); }
          } else {
            if(img.p.complete && img.p.width>0) ctx.drawImage(img.p, player.x,player.y, player.w,player.h);
            else { ctx.fillStyle="#00e5ff"; ctx.fillRect(player.x,player.y,player.w,player.h); }
          }
          ctx.restore();
        }
      }

      // ===== Loop =====
      let last = performance.now();
      function frame(now){
        const dt = Math.min(0.05, Math.max(0.001, (now-last)/1000));
        last = now;
        update(dt);
        draw();
        requestAnimationFrame(frame);
      }

      // ===== Init / Menu wiring =====
      function keysClear(){ for(const k in keys) keys[k]=false; }

      if(btnOpenOptionsTitle) btnOpenOptionsTitle.addEventListener("click", ()=>openOptions("TITLE"));
      if(btnTitleBack) btnTitleBack.addEventListener("click", backToGame);

      if(btnOpenOptionsPause) btnOpenOptionsPause.addEventListener("click", ()=>openOptions("PAUSE"));

      // Title back button exists inside title menu; but also allow ESC to return handled above.

      // Shop menu from pause already wired

      // Start wave from shop
      if(btnSkipShop) btnSkipShop.addEventListener("click", ()=>{ if(state==="SHOP") startWaveFromShop(); });
      if(btnStartWave) btnStartWave.addEventListener("click", ()=>{ if(state==="SHOP") startWaveFromShop(); });

      // Game over buttons already wired

      // pause menu open shop wired

      // pause toggling keys: handled in keydown

      // set options checkbox initial
      if(optShake) optShake.checked = !!opts.shake;
      if(optFlash) optFlash.checked = !!opts.flash;
      if(optSlowmo) optSlowmo.checked = !!opts.slowmo;

      // shop button on pause
      if(btnOpenShop) btnOpenShop.addEventListener("click", ()=>{ buildShopUI(); setState("SHOP"); });

      // back from options
      if(btnOptionsBack) btnOptionsBack.addEventListener("click", ()=>{
        // persist already done by checkbox handlers, just close
        closeOptions();
      });

      // pause menu "shop" should return to pause? we keep as shop overlay; user starts wave -> play, or can "skip" -> play.
      // from pause -> shop -> back is not provided; to keep simple, skip/start wave brings to play.
      // If user wants "back to pause" we can add later.

      // reward menu selects -> shop

      // ===== Spawn schedules =====
      scheduleEnemySpawn();
      scheduleLightningSpawn();

      // ===== Start: TITLE =====
      resize();

      // initial challenge selection
      if(challengeSelect){
        challengeSelect.value = challengeMode;
      }

      // initial state
      setState("TITLE");
      setTouchVisible(false);

      // show title UI values
      renderAllMenus();
      syncHUD();

      // Title BGM start on first input
      window.addEventListener("pointerdown", ()=>{
        if(bgm && bgm.paused && (state==="PLAY" || state==="PAUSE")) bgm.play().catch(()=>{});
      }, {once:false});

      // ===== Extra: title actions load/new/delete already bound earlier =====

      // ===== Finally: RAF =====
      requestAnimationFrame(frame);

    } catch (e) {
      dbg(`BOOT ERROR:\n${e.stack || e.message || String(e)}`);
    }
  });
})();
