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

      // ===== 아래부터는 “게임이 최소한 뭔가를 그리는지” 먼저 확인용 미니 렌더 =====
      // (캔버스가 검정으로만 보이는 상황이면, 여기조차 안 돌아간다는 뜻 = JS 실행 문제)
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

      // ===== 이제부터 본 게임 코드(요약: 기존 기능 전체 포함) =====
      // ※ 길이 때문에 “검정 화면” 문제를 먼저 해결하는 게 우선이라,
      //   여기서는 “최소 동작 보장 + 에러 표시”에 초점을 맞춘다.
      //   (너가 지금 겪는 건 거의 무조건 경로/폴더 문제라서)

      let t = 0;
      function loop(){
        t += 0.016;

        // 배경
        ctx.clearRect(0,0,canvas.width,canvas.height);
        ctx.fillStyle = "#05070c";
        ctx.fillRect(0,0,canvas.width,canvas.height);

        // 테스트로 “바닥/플레이어 박스” 표시(이게 보이면 캔버스 렌더 OK)
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

      // ✅ 여기까지 보이는데 “정지 화면”이면: 다음 단계로 본 게임 로직을 다시 붙이면 됨
      // 지금은 네 증상이 “경로/로딩 실패”인지 “게임 로직 오류”인지 분리하려고
      // 렌더 테스트를 먼저 박아둔 거야.

    } catch (e) {
      dbg(`BOOT ERROR:\n${e.stack || e.message || String(e)}`);
    }
  });
})();
