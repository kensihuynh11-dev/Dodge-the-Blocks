const gameArea = document.getElementById("gameArea");
const player = document.getElementById("player");
const scoreDisplay = document.getElementById("score");
const livesDisplay = document.getElementById("lives");
const message = document.getElementById("message");

let score = 0;
let lives = 3;
let playerX = 180;
let gameRunning = true;

// 🎮 Di chuyển người chơi
document.addEventListener("keydown", (e) => {
  if (!gameRunning) return;
  if (e.key === "ArrowLeft" && playerX > 0) playerX -= 20;
  if (e.key === "ArrowRight" && playerX < 340) playerX += 20;
  player.style.left = playerX + "px";
});

// 🍎 Tạo vật rơi
function createItem() {
  const item = document.createElement("div");
  item.classList.add("block");
  item.style.left = Math.random() * 370 + "px";
  gameArea.appendChild(item);

  let itemY = 0;
  const fall = setInterval(() => {
    if (!gameRunning) {
      clearInterval(fall);
      item.remove();
      return;
    }

    itemY += 5;
    item.style.top = itemY + "px";

    const playerRect = player.getBoundingClientRect();
    const itemRect = item.getBoundingClientRect();

    // 🧮 Nếu bắt được → +1 điểm
    if (
      itemRect.bottom >= playerRect.top &&
      itemRect.top <= playerRect.bottom &&
      itemRect.left < playerRect.right &&
      itemRect.right > playerRect.left
    ) {
      score++;
      scoreDisplay.textContent = "Điểm: " + score;
      clearInterval(fall);
      item.remove();
      return;
    }

    // ⏬ Nếu vật rơi khỏi màn hình → mất 1 tim
    if (itemY > 500) {
      clearInterval(fall);
      item.remove();
      loseLife();
    }
  }, 30);
}

// ❤️ Mất 1 mạng
function loseLife() {
  lives--;
  updateLives();

  if (lives <= 0) {
    gameOver();
  }
}

// 🩶 Cập nhật số tim hiển thị
function updateLives() {
  const hearts = "❤️".repeat(lives) + "🤍".repeat(3 - lives);
  livesDisplay.innerHTML = hearts;
}

// ❌ Game Over
function gameOver() {
  gameRunning = false;
  message.textContent = "💥 Game Over! Nhấn Enter để chơi lại.";
}

// 🔄 Bắt đầu lại game
function restartGame() {
  score = 0;
  lives = 3;
  playerX = 180;
  scoreDisplay.textContent = "Điểm: 0";
  message.textContent = "";
  updateLives();
  gameRunning = true;
}

// ⏳ Sinh vật rơi liên tục
setInterval(() => {
  if (gameRunning) createItem();
}, 1000);

// ⌨️ Nhấn Enter để bắt đầu lại
document.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !gameRunning) {
    restartGame();
  }
});

// Bắt đầu ban đầu
updateLives();
