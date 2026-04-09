const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const scoreEl = document.getElementById("score");
const bestEl = document.getElementById("best");
const startBtn = document.getElementById("startBtn");
const pauseBtn = document.getElementById("pauseBtn");
const restartBtn = document.getElementById("restartBtn");
const mobilePad = document.querySelector(".mobile-pad");

const grid = 20;
const cells = canvas.width / grid;
const SPEED = 120;

let snake = [];
let food = { x: 0, y: 0 };
let direction = { x: 1, y: 0 };
let nextDirection = { x: 1, y: 0 };
let score = 0;
let best = Number(localStorage.getItem("snake_best") || 0);
let timer = null;
let started = false;
let paused = false;
let gameOver = false;

bestEl.textContent = String(best);

function resetGame() {
  snake = [
    { x: 5, y: 10 },
    { x: 4, y: 10 },
    { x: 3, y: 10 }
  ];
  direction = { x: 1, y: 0 };
  nextDirection = { x: 1, y: 0 };
  score = 0;
  scoreEl.textContent = "0";
  gameOver = false;
  paused = false;
  pauseBtn.textContent = "Pause";
  spawnFood();
  draw();
}

function spawnFood() {
  while (true) {
    const x = Math.floor(Math.random() * cells);
    const y = Math.floor(Math.random() * cells);
    const hit = snake.some((s) => s.x === x && s.y === y);
    if (!hit) {
      food = { x, y };
      return;
    }
  }
}

function step() {
  if (paused || gameOver) return;

  direction = nextDirection;
  const head = { ...snake[0] };
  head.x += direction.x;
  head.y += direction.y;

  const out = head.x < 0 || head.y < 0 || head.x >= cells || head.y >= cells;
  const biteSelf = snake.some((part) => part.x === head.x && part.y === head.y);
  if (out || biteSelf) {
    gameOver = true;
    stopLoop();
    draw();
    setTimeout(() => alert("Game over. Score: " + score), 10);
    return;
  }

  snake.unshift(head);
  if (head.x === food.x && head.y === food.y) {
    score += 1;
    scoreEl.textContent = String(score);
    if (score > best) {
      best = score;
      bestEl.textContent = String(best);
      localStorage.setItem("snake_best", String(best));
    }
    spawnFood();
  } else {
    snake.pop();
  }

  draw();
}

function drawGrid() {
  ctx.strokeStyle = "#e8eef7";
  ctx.lineWidth = 1;
  for (let i = 0; i <= cells; i += 1) {
    const p = i * grid;
    ctx.beginPath();
    ctx.moveTo(p, 0);
    ctx.lineTo(p, canvas.height);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, p);
    ctx.lineTo(canvas.width, p);
    ctx.stroke();
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawGrid();

  ctx.fillStyle = "#0f8f6f";
  for (let i = 0; i < snake.length; i += 1) {
    const part = snake[i];
    const pad = i === 0 ? 1 : 2;
    ctx.fillRect(part.x * grid + pad, part.y * grid + pad, grid - pad * 2, grid - pad * 2);
  }

  ctx.fillStyle = "#c73939";
  ctx.beginPath();
  const cx = food.x * grid + grid / 2;
  const cy = food.y * grid + grid / 2;
  ctx.arc(cx, cy, grid / 2 - 2, 0, Math.PI * 2);
  ctx.fill();

  if (!started) {
    overlayText("Click Start");
  } else if (paused) {
    overlayText("Paused");
  } else if (gameOver) {
    overlayText("Game Over");
  }
}

function overlayText(text) {
  ctx.fillStyle = "rgba(24, 49, 83, 0.65)";
  ctx.fillRect(0, canvas.height / 2 - 26, canvas.width, 52);
  ctx.fillStyle = "#ffffff";
  ctx.font = "700 24px Segoe UI";
  ctx.textAlign = "center";
  ctx.fillText(text, canvas.width / 2, canvas.height / 2 + 8);
}

function startLoop() {
  stopLoop();
  timer = setInterval(step, SPEED);
}

function stopLoop() {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
}

function startGame() {
  if (gameOver || !started) {
    resetGame();
  }
  started = true;
  paused = false;
  pauseBtn.textContent = "Pause";
  startLoop();
  draw();
}

function togglePause() {
  if (!started || gameOver) return;
  paused = !paused;
  pauseBtn.textContent = paused ? "Resume" : "Pause";
  draw();
}

function setDirectionByName(name) {
  const map = {
    up: { x: 0, y: -1 },
    down: { x: 0, y: 1 },
    left: { x: -1, y: 0 },
    right: { x: 1, y: 0 }
  };
  const next = map[name];
  if (!next) return;
  if (next.x + direction.x === 0 && next.y + direction.y === 0) return;
  nextDirection = next;
}

window.addEventListener("keydown", (e) => {
  const keyMap = {
    ArrowUp: "up",
    ArrowDown: "down",
    ArrowLeft: "left",
    ArrowRight: "right",
    w: "up",
    s: "down",
    a: "left",
    d: "right",
    W: "up",
    S: "down",
    A: "left",
    D: "right"
  };
  const dir = keyMap[e.key];
  if (dir) {
    e.preventDefault();
    setDirectionByName(dir);
  }
  if (e.key === " ") {
    e.preventDefault();
    if (!started) startGame();
    else togglePause();
  }
});

mobilePad.addEventListener("click", (e) => {
  const btn = e.target.closest("button[data-dir]");
  if (!btn) return;
  setDirectionByName(btn.dataset.dir);
});

startBtn.addEventListener("click", startGame);
pauseBtn.addEventListener("click", togglePause);
restartBtn.addEventListener("click", () => {
  started = true;
  resetGame();
  startLoop();
});

resetGame();
