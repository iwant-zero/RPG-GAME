(() => {
  "use strict";

  // index.html 로더가 성공한 경로에 맞춰 BASE를 주입함
  const BASE = (typeof window.__BLADE_BASE === "string" ? window.__BLADE_BASE : "./");
  window.__BLADE_BOOTED = true;

  const canvas = document.getElementById("gameCanvas");
  const ctx = canvas.getContext("2d");

  const pauseBtn = document.getElementById("pause-btn");
  const touch = document.getElementById("touch");

  // 터치면 버튼 표시
  const isTouch = matchMedia && matchMedia("(pointer:coarse)").matches;
  if (pauseBtn) pauseBtn.style.display = "block";
  if (touch && isTouch) touch.style.display = "flex";

  function resize(){
    const dpr = Math.max(1, window.devicePixelRatio || 1);
    const w = Math.max(320, innerWidth);
    const h = Math.max(240, innerHeight);
    canvas.style.width = w + "px";
    canvas.style.height = h + "px";
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    ctx.setTransform(dpr,0,0,dpr,0,0);
  }
  addEventListener("resize", resize);
  resize();

  // ✅ assets 경로도 BASE 기준으로 잡힘(추후 본 게임 코드에서 그대로 사용 가능)
  const testImg = new Image();
  testImg.src = BASE + "assets/player.png";

  let t = 0;
  function loop(){
    t += 0.016;

    ctx.clearRect(0,0,canvas.width,canvas.height);
    ctx.fillStyle = "#05070c";
    ctx.fillRect(0,0,canvas.width,canvas.height);

    // 바닥
    ctx.fillStyle = "rgba(255,255,255,0.22)";
    ctx.fillRect(0, canvas.height - 120, canvas.width, 6);

    // 플레이어(이미지 있으면 이미지, 없으면 네모)
    const px = (innerWidth * 0.5) + Math.sin(t)*120;
    const py = innerHeight - 120 - 90;

    if (testImg.complete && testImg.naturalWidth > 0) {
      ctx.drawImage(testImg, px - 32, py, 64, 90);
    } else {
      ctx.fillStyle = "#00e5ff";
      ctx.fillRect(px - 30, py, 60, 90);
    }

    ctx.fillStyle = "#fff";
    ctx.font = "16px Arial";
    ctx.fillText("RENDER OK (game.js running)", 18, innerHeight - 18);

    ctx.font = "12px ui-monospace,Consolas,monospace";
    ctx.fillText("BASE=" + BASE + "  player.png=" + testImg.src, 18, innerHeight - 36);

    requestAnimationFrame(loop);
  }
  loop();
})();
