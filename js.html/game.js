(() => {
  "use strict";
  window.__BLADE_BOOTED = true;

  document.addEventListener("DOMContentLoaded", () => {
    const debugEl = document.getElementById("debug");
    const bootEl = document.getElementById("boot");

    const dbg = (msg) => {
      if (!debugEl) return;
      debugEl.style.display = "block";
      debugEl.textContent = msg;
    };

    // ✅ game.js가 실행되면 LOADING을 즉시 꺼줌
    if (bootEl) bootEl.style.display = "none";

    try {
      const canvas = document.getElementById("gameCanvas");
      const ctx = canvas.getContext("2d");
      if (!canvas || !ctx) { dbg("Canvas/Context init failed."); return; }

      function resize(){
        const dpr = Math.max(1, window.devicePixelRatio || 1);
        const w = Math.max(320, window.innerWidth);
        const h = Math.max(240, window.innerHeight);
        canvas.style.width = w + "px";
        canvas.style.height = h + "px";
        canvas.width = Math.floor(w * dpr);
        canvas.height = Math.floor(h * dpr);
        ctx.setTransform(dpr,0,0,dpr,0,0);
      }
      window.addEventListener("resize", resize);
      resize();

      // ✅ “JS가 진짜 도는지” 확인용 렌더 테스트
      let t = 0;
      function loop(){
        t += 0.016;

        ctx.clearRect(0,0,canvas.width,canvas.height);
        ctx.fillStyle = "#05070c";
        ctx.fillRect(0,0,canvas.width,canvas.height);

        ctx.fillStyle = "rgba(255,255,255,0.22)";
        ctx.fillRect(0, canvas.height - 120, canvas.width, 6);

        const px = canvas.width * 0.5 + Math.sin(t)*120;
        const py = canvas.height - 120 - 90;
        ctx.fillStyle = "#00e5ff";
        ctx.fillRect(px-30, py, 60, 90);

        ctx.fillStyle = "#fff";
        ctx.font = "16px Arial";
        ctx.fillText("RENDER OK (game.js running)", 18, canvas.height - 18);

        requestAnimationFrame(loop);
      }
      loop();

      // ✅ 이 상태에서 RENDER OK가 보이면 “경로 문제 해결 완료”
      // 다음 단계에서 본 게임(보스/저장/상점/번개 등) 완전체를 여기로 붙이면 됨.

    } catch (e) {
      dbg(`BOOT ERROR:\n${e.stack || e.message || String(e)}`);
    }
  });
})();
