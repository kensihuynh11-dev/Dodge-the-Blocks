const gameArea = document.getElementById("gameArea");
const player = document.getElementById("player");
const scoreDisplay = document.getElementById("score");

let score = 0;
let playerX = 180;
let gameOver = false;

// Di chuyển người chơi bằng phím
document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowLeft" && playerX > 0) playerX -= 20;
  if (e.key === "ArrowRight" && playerX < 360) playerX += 20;
  player.style.left = playerX + "px";
});

// Hàm tạo block rơi xuống
function createBlock() {
  const block = document.createElement("div");
  block.classList.add("block");
  block.style.left = Math.random() * 370 + "px";
  gameArea.appendChild(block);

  let blockY = 0;
  const fall = setInterval(() => {
    if (gameOver) {
      clearInterval(fall);
      block.remove();
      return;
    }

    blockY += 5;
    block.style.top = blockY + "px";

    // Kiểm tra va chạm
    const playerRect = player.getBoundingClientRect();
    const blockRect = block.getBoundingClientRect();

    if (
      blockRect.bottom >= playerRect.top &&
      blockRect.top <= playerRect.bottom &&
      blockRect.left < playerRect.right &&
      blockRect.right > playerRect.left
    ) {
      gameOver = true;
      alert("💥 Game Over! Điểm của bạn: " + score);
      window.location.reload();
    }

    // Nếu block rơi hết màn → +1 điểm
    if (blockY > 500) {
      score++;
      scoreDisplay.textContent = "Điểm: " + score;
      clearInterval(fall);
      block.remove();
    }
  }, 30);
}

// Sinh block liên tục
setInterval(() => {
  if (!gameOver) createBlock();
}, 1000);
