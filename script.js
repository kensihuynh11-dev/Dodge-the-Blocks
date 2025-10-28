// Chờ DOM load xong
window.addEventListener("DOMContentLoaded", () => {
  const gameArea = document.getElementById("gameArea");
  const player = document.getElementById("player");
  const scoreDisplay = document.getElementById("score");
  const livesDisplay = document.getElementById("lives");
  const gameOverScreen = document.getElementById("gameOver");
  const finalScore = document.getElementById("finalScore");
  const restartButton = document.getElementById("restartButton");

  let score = 0;
  let lives = 3;
  let playerX = 180;
  let items = [];
  let spawnInterval = 1000;
  let speed = 1.8;
  let speedIncrease = 0.002;
  let gameRunning = true;

  // 🏆 Lưu điểm cao
  let highScore = parseInt(localStorage.getItem("highScore")) || 0;

  // 🔊 Âm thanh
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  function playSound(type) {
    try {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.connect(g);
      g.connect(ctx.destination);
      o.type = "sine";
      if (type === "catch") o.frequency.value = 700;
      else if (type === "miss") o.frequency.value = 200;
      else if (type === "boom") o.frequency.value = 80;
      g.gain.setValueAtTime(0.1, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      o.start();
      o.stop(ctx.currentTime + 0.3);
    } catch {}
  }

  // ❤️ Hiển thị tim
  function updateLives() {
    const hearts = "❤️".repeat(lives) + "🤍".repeat(3 - lives);
    livesDisplay.innerHTML = hearts;
  }

  // 💫 Hiệu ứng flash màn hình
  function flashEffect(color = "gold") {
    const flash = document.createElement("div");
    flash.style.cssText = `
      position:absolute;top:0;left:0;width:100%;height:100%;
      background:${color};opacity:0.4;transition:opacity 0.3s;
      pointer-events:none;
    `;
    gameArea.appendChild(flash);
    setTimeout(() => (flash.style.opacity = "0"), 50);
    setTimeout(() => flash.remove(), 300);
  }

  // ✨ Hiệu ứng +1 hoặc -1 nổi lên
  function showFloatingText(text, color = "gold") {
    const floatText = document.createElement("div");
    floatText.textContent = text;
    floatText.style.cssText = `
      position: absolute;
      left: ${player.offsetLeft + player.offsetWidth / 2 - 10}px;
      top: ${player.offsetTop - 20}px;
      color: ${color};
      font-weight: bold;
      font-size: 20px;
      text-shadow: 0 0 5px black;
      opacity: 1;
      transition: transform 1s ease-out, opacity 1s ease-out;
      transform: translateY(0);
      pointer-events: none;
    `;
    gameArea.appendChild(floatText);
    setTimeout(() => {
      floatText.style.transform = "translateY(-40px)";
      floatText.style.opacity = "0";
    }, 50);
    setTimeout(() => floatText.remove(), 1000);
  }

  // 💥 Hiệu ứng nổ bom
  function boomEffect(x, y) {
    const explosion = document.createElement("div");
    explosion.style.cssText = `
      position: absolute;
      left: ${x - 25}px;
      top: ${y - 25}px;
      width: 50px;
      height: 50px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(255,0,0,0.8), rgba(255,0,0,0));
      opacity: 0.8;
      transform: scale(1);
      pointer-events: none;
      transition: transform 0.5s ease-out, opacity 0.5s ease-out;
    `;
    gameArea.appendChild(explosion);
    setTimeout(() => {
      explosion.style.transform = "scale(4)";
      explosion.style.opacity = "0";
    }, 10);
    setTimeout(() => explosion.remove(), 600);
  }

  // 🍎 / 💣 Sinh vật
  function spawnItem() {
    const item = document.createElement("div");
    const isBomb = Math.random() < 0.2; // 20% là bom
    item.classList.add("block");
    item.style.left = Math.random() * (gameArea.clientWidth - 30) + "px";
    item.style.top = "0px";
    item.y = 0;
    item.dataset.type = isBomb ? "bomb" : "normal";
    item.caught = false;
    if (isBomb) {
      item.style.background = "red";
      item.style.boxShadow = "0 0 12px red";
    } else {
      item.style.background = "orange";
      item.style.boxShadow = "0 0 10px orange";
    }
    gameArea.appendChild(item);
    items.push(item);
  }

  // 💀 Kết thúc game
  function gameOver() {
    gameRunning = false;
    if (score > highScore) {
      highScore = score;
      localStorage.setItem("highScore", highScore);
    }
    finalScore.textContent = `${score} (Kỷ lục: ${highScore})`;
    gameOverScreen.style.display = "block";
  }

  // 🔁 Chơi lại
  function restartGame() {
    items.forEach(i => i.remove());
    items = [];
    score = 0;
    lives = 3;
    playerX = 180;
    updateLives();
    scoreDisplay.textContent = `Điểm: ${score} (🏆 ${highScore})`;
    gameOverScreen.style.display = "none";
    gameRunning = true;
    speed = 1.8;
    requestAnimationFrame(gameLoop);
  }

  restartButton.addEventListener("click", restartGame);
  restartButton.addEventListener("touchstart", e => {
    e.preventDefault();
    restartGame();
  });

  // 🎮 Di chuyển bằng phím
  const keys = {};
  document.addEventListener("keydown", e => (keys[e.key] = true));
  document.addEventListener("keyup", e => (keys[e.key] = false));
// Di chuyển bằng nút ảo (mobile)
if (moveLeft) smoothTargetX -= 6;
if (moveRight) smoothTargetX += 6;

  // 📱 Cảm ứng
  let touchStartX = null;
  let smoothTargetX = playerX;
  let currentX = playerX;

  gameArea.addEventListener("touchstart", e => {
    touchStartX = e.touches[0].clientX;
  }, { passive: true });

  gameArea.addEventListener("touchmove", e => {
    if (touchStartX === null) return;
    const delta = e.touches[0].clientX - touchStartX;
    smoothTargetX += delta * 0.7;
    touchStartX = e.touches[0].clientX;
  }, { passive: true });

  gameArea.addEventListener("touchend", () => {
    touchStartX = null;
  });

  // ⚡ Game loop
  function gameLoop() {
    if (!gameRunning) return;
    if (speed < 6) speed += speedIncrease;

    // Di chuyển nhân vật
    if (keys["ArrowLeft"]) smoothTargetX -= 6;
    if (keys["ArrowRight"]) smoothTargetX += 6;
    smoothTargetX = Math.max(0, Math.min(smoothTargetX, gameArea.clientWidth - player.offsetWidth));
    currentX += (smoothTargetX - currentX) * 0.2;
    player.style.left = currentX + "px";

    // ✅ Chỉ 1 vật rơi 1 lúc
    if (items.length === 0 && gameRunning) {
      setTimeout(() => {
        if (gameRunning && items.length === 0) spawnItem();
      }, spawnInterval);
    }

    const playerRect = player.getBoundingClientRect();

    for (let i = items.length - 1; i >= 0; i--) {
      const item = items[i];
      if (item.caught) continue;

      item.y += speed;
      item.style.top = item.y + "px";
      const itemRect = item.getBoundingClientRect();

      const isColliding =
        itemRect.bottom >= playerRect.top - 10 &&
        itemRect.top <= playerRect.bottom + 10 &&
        itemRect.left < playerRect.right &&
        itemRect.right > playerRect.left;

      if (isColliding) {
        item.caught = true;

        if (item.dataset.type === "bomb") {
          lives--;
          updateLives();
          playSound("boom");
          boomEffect(itemRect.left + itemRect.width / 2, itemRect.top + itemRect.height / 2);
          showFloatingText("-1 ❤️", "red");
          flashEffect("red");
        } else {
          score++;
          playSound("catch");
          flashEffect("gold");
          showFloatingText("+1", "gold");
          if (score > highScore) {
            highScore = score;
            localStorage.setItem("highScore", highScore);
          }
        }

        item.remove();
        items.splice(i, 1);
        scoreDisplay.textContent = `Điểm: ${score} (🏆 ${highScore})`;

        if (lives <= 0) {
          gameOver();
          return;
        }
        continue;
      }

      if (item.y > gameArea.clientHeight) {
        item.caught = true;
        if (item.dataset.type === "bomb") {
          item.remove();
          items.splice(i, 1);
        } else {
          lives--;
          updateLives();
          playSound("miss");
          flashEffect("red");
          showFloatingText("-1 ❤️", "red");
          if (lives <= 0) {
            gameOver();
            return;
          }
          item.remove();
          items.splice(i, 1);
        }
      }
    }

    scoreDisplay.textContent = `Điểm: ${score} (🏆 ${highScore})`;
    requestAnimationFrame(gameLoop);
  }

  updateLives();
  scoreDisplay.textContent = `Điểm: ${score} (🏆 ${highScore})`;
  requestAnimationFrame(gameLoop);
});
// 🎮 Nút điều khiển cảm ứng (trái/phải)
const btnLeft = document.getElementById("btnLeft");
const btnRight = document.getElementById("btnRight");
let moveLeft = false;
let moveRight = false;

// Giữ nút -> di chuyển liên tục
btnLeft.addEventListener("touchstart", e => {
  e.preventDefault();
  moveLeft = true;
});
btnLeft.addEventListener("touchend", () => moveLeft = false);

btnRight.addEventListener("touchstart", e => {
  e.preventDefault();
  moveRight = true;
});
btnRight.addEventListener("touchend", () => moveRight = false);

