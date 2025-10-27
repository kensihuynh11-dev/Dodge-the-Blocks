const gameArea = document.getElementById("gameArea");
const player = document.getElementById("player");
const scoreDisplay = document.getElementById("score");
const livesDisplay = document.getElementById("lives");
const message = document.getElementById("message");

let score = 0;
let lives = 3;
let playerX = 180;
let items = [];
let lastSpawn = 0;
let spawnInterval = 1000;
let speed = 3;
let gameRunning = true;

// 🔊 Âm thanh (sử dụng Web Audio API)
const ctx = new (window.AudioContext || window.webkitAudioContext)();

function playSound(type) {
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.connect(g);
  g.connect(ctx.destination);

  if (type === "catch") {
    o.frequency.value = 700;
    g.gain.setValueAtTime(0.1, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
  } else if (type === "miss") {
    o.frequency.value = 150;
    g.gain.setValueAtTime(0.15, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
  }
  o.start();
  o.stop(ctx.currentTime + 0.3);
}

// 🎮 Di chuyển người chơi
const keys = {};
document.addEventListener("keydown", e => (keys[e.key] = true));
document.addEventListener("keyup", e => (keys[e.key] = false));

function movePlayer() {
  if (keys["ArrowLeft"] && playerX > 0) playerX -= 6;
  if (keys["ArrowRight"] && playerX < 340) playerX += 6;
  player.style.left = playerX + "px";
}

// 🍎 Tạo vật rơi
function spawnItem() {
  const item = document.createElement("div");
  item.classList.add("block");
  item.style.left = Math.random() * 370 + "px";
  item.y = 0;
  gameArea.appendChild(item);
  items.push(item);
}

// ❤️ Cập nhật tim
function updateLives() {
  const hearts = "❤️".repeat(lives) + "🤍".repeat(3 - lives);
  livesDisplay.innerHTML = hearts;
}

// 💫 Hiệu ứng sáng khi bắt được
function flashEffect(color = "gold") {
  const flash = document.createElement("div");
  flash.style.position = "absolute";
  flash.style.top = "0";
  flash.style.left = "0";
  flash.style.width = "100%";
  flash.style.height = "100%";
  flash.style.background = color;
  flash.style.opacity = "0.4";
  flash.style.transition = "opacity 0.3s";
  gameArea.appendChild(flash);
  setTimeout(() => (flash.style.opacity = "0"), 50);
  setTimeout(() => flash.remove(), 300);
}

// ❌ Game Over
function gameOver() {
  gameRunning = false;
  message.textContent = "💥 Game Over! Nhấn Enter để chơi lại.";
  flashEffect("red");
}

// 🔄 Reset game
function restartGame() {
  items.forEach(i => i.remove());
  items = [];
  score = 0;
  lives = 3;
  playerX = 180;
  message.textContent = "";
  scoreDisplay.textContent = "Điểm: 0";
  updateLives();
  gameRunning = true;
  lastSpawn = 0;
  requestAnimationFrame(gameLoop);
}

// ⚡ Game loop
function gameLoop(timestamp) {
  if (!gameRunning) return;

  movePlayer();

  // Sinh item mới
  if (timestamp - lastSpawn > spawnInterval) {
    spawnItem();
    lastSpawn = timestamp;
  }

  const playerRect = player.getBoundingClientRect();

  items.forEach((item, i) => {
    item.y += speed;
    item.style.top = item.y + "px";

    const itemRect = item.getBoundingClientRect();

    // ✅ Bắt trúng
    if (
      itemRect.bottom >= playerRect.top &&
      itemRect.top <= playerRect.bottom &&
      itemRect.left < playerRect.right &&
      itemRect.right > playerRect.left
    ) {
      score++;
      scoreDisplay.textContent = "Điểm: " + score;

      // Hiệu ứng nảy
      item.style.transform = "scale(1.4)";
      item.style.transition = "transform 0.1s";
      setTimeout(() => item.remove(), 100);

      items.splice(i, 1);
      flashEffect();
      playSound("catch");
    } 
    // ❌ Rơi khỏi màn hình
    else if (item.y > 500) {
      item.remove();
      items.splice(i, 1);
      lives--;
      updateLives();
      playSound("miss");
      flashEffect("red");

      if (lives <= 0) gameOver();
    }
  });

  requestAnimationFrame(gameLoop);
}

// ⌨️ Nhấn Enter để restart
document.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !gameRunning) {
    restartGame();
  }
});

updateLives();
requestAnimationFrame(gameLoop);
