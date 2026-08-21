(function () {
  const canvas = document.getElementById("board");
  const ctx = canvas.getContext("2d");
  const scoreEl = document.getElementById("score");
  const bestEl = document.getElementById("best");
  const overlay = document.getElementById("overlay");
  const overlayText = document.getElementById("overlay-text");

  const GRID_SIZE = 20;
  const CELL = canvas.width / GRID_SIZE;
  const TICK_MS = 110;
  const BEST_KEY = "snake-best-score";

  const DIRECTIONS = {
    ArrowUp: { x: 0, y: -1 },
    ArrowDown: { x: 0, y: 1 },
    ArrowLeft: { x: -1, y: 0 },
    ArrowRight: { x: 1, y: 0 },
    w: { x: 0, y: -1 },
    s: { x: 0, y: 1 },
    a: { x: -1, y: 0 },
    d: { x: 1, y: 0 },
  };

  let snake, direction, nextDirection, food, score, best, running, paused, timer;

  function loadBest() {
    const stored = Number(localStorage.getItem(BEST_KEY));
    return Number.isFinite(stored) ? stored : 0;
  }

  function saveBest(value) {
    try {
      localStorage.setItem(BEST_KEY, String(value));
    } catch (e) {
      // storage unavailable; ignore
    }
  }

  function randomCell() {
    return {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE),
    };
  }

  function placeFood() {
    let cell;
    do {
      cell = randomCell();
    } while (snake.some((s) => s.x === cell.x && s.y === cell.y));
    return cell;
  }

  function reset() {
    snake = [
      { x: 10, y: 10 },
      { x: 9, y: 10 },
      { x: 8, y: 10 },
    ];
    direction = { x: 1, y: 0 };
    nextDirection = direction;
    score = 0;
    paused = false;
    running = false;
    food = placeFood();
    scoreEl.textContent = "0";
    best = loadBest();
    bestEl.textContent = String(best);
    draw();
  }

  function showOverlay(text) {
    overlayText.textContent = text;
    overlay.classList.remove("hidden");
  }

  function hideOverlay() {
    overlay.classList.add("hidden");
  }

  function start() {
    if (running) return;
    running = true;
    paused = false;
    hideOverlay();
    clearInterval(timer);
    timer = setInterval(tick, TICK_MS);
  }

  function gameOver() {
    running = false;
    clearInterval(timer);
    if (score > best) {
      best = score;
      saveBest(best);
      bestEl.textContent = String(best);
    }
    showOverlay(`Game over — score ${score}. Press Enter to restart.`);
  }

  function tick() {
    if (paused) return;
    direction = nextDirection;
    const head = {
      x: snake[0].x + direction.x,
      y: snake[0].y + direction.y,
    };

    const hitsWall =
      head.x < 0 || head.y < 0 || head.x >= GRID_SIZE || head.y >= GRID_SIZE;
    const hitsSelf = snake.some((s) => s.x === head.x && s.y === head.y);

    if (hitsWall || hitsSelf) {
      gameOver();
      return;
    }

    snake.unshift(head);

    if (head.x === food.x && head.y === food.y) {
      score += 10;
      scoreEl.textContent = String(score);
      food = placeFood();
    } else {
      snake.pop();
    }

    draw();
  }

  function draw() {
    ctx.fillStyle = "#22262f";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#e0555a";
    ctx.fillRect(food.x * CELL, food.y * CELL, CELL - 1, CELL - 1);

    snake.forEach((segment, i) => {
      ctx.fillStyle = i === 0 ? "#5ec26a" : "#3f8a4a";
      ctx.fillRect(segment.x * CELL, segment.y * CELL, CELL - 1, CELL - 1);
    });
  }

  function isOpposite(a, b) {
    return a.x === -b.x && a.y === -b.y;
  }

  document.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      reset();
      start();
      return;
    }

    if (e.key === " ") {
      if (running) {
        paused = !paused;
        showOverlayIfPaused();
      }
      return;
    }

    const dir = DIRECTIONS[e.key];
    if (!dir) return;

    e.preventDefault();

    if (!running) {
      start();
    }

    if (!isOpposite(dir, direction)) {
      nextDirection = dir;
    }
  });

  function showOverlayIfPaused() {
    if (paused) {
      showOverlay("Paused — press Space to resume");
    } else {
      hideOverlay();
    }
  }

  reset();
  showOverlay("Press any arrow key to start");
})();
