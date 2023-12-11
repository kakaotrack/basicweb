const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let hero, lasers, enemies, score, isGameOver;

function initializeGame() {
  hero = {
    x: canvas.width / 2 - 25,
    y: canvas.height - 50,
    width: 50,
    height: 50,
    speed: 5,
    dx: 0,
  };

  lasers = [];
  enemies = [];
  score = 0;
  isGameOver = false;
}

function drawHero() {
  ctx.fillStyle = "red";
  ctx.fillRect(hero.x, hero.y, hero.width, hero.height);
}

function drawLasers() {
  ctx.fillStyle = "blue";
  lasers.forEach((laser) => {
    ctx.fillRect(laser.x, laser.y, laser.width, laser.height);
  });
}

function drawEnemies() {
  ctx.fillStyle = "green";
  enemies.forEach((enemy) => {
    ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
  });
}

function drawScore() {
  ctx.fillStyle = "white";
  ctx.font = "20px Arial";
  ctx.fillText("Score: " + score, 10, 30);
}

function showGameOver() {
  ctx.fillStyle = "white";
  ctx.font = "30px Arial";
  ctx.fillText("Game Over", canvas.width / 2 - 100, canvas.height / 2 - 15);
  ctx.fillText("Score: " + score, canvas.width / 2 - 60, canvas.height / 2 + 15);
  ctx.fillText("Press R to Restart", canvas.width / 2 - 120, canvas.height / 2 + 50);
}

function update() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (!isGameOver) {
    drawHero();
    drawLasers();
    drawEnemies();
    drawScore();

    moveHero();
    moveLasers();
    moveEnemies();
    checkCollision();
    createEnemy();
  } else {
    showGameOver();
  }

  requestAnimationFrame(update);
}

function onKeyDown(e) {
  switch (e.key) {
    case "ArrowLeft":
      hero.dx = -hero.speed;
      break;
    case "ArrowRight":
      hero.dx = hero.speed;
      break;
    case " ":
      shootLaser();
      break;
    case "r":
      if (isGameOver) {
        initializeGame();
        update();
      }
      break;
  }
}

function onKeyUp(e) {
  switch (e.key) {
    case "ArrowLeft":
    case "ArrowRight":
      hero.dx = 0;
      break;
  }
}

function shootLaser() {
  const laser = {
    x: hero.x + hero.width / 2 - 5,
    y: hero.y,
    width: 10,
    height: 20,
    speed: 8,
  };
  lasers.push(laser);
}

function moveHero() {
  hero.x += hero.dx;
  if (hero.x < 0) {
    hero.x = 0;
  } else if (hero.x + hero.width > canvas.width) {
    hero.x = canvas.width - hero.width;
  }
}

function moveLasers() {
  lasers.forEach((laser) => {
    laser.y -= laser.speed;
  });
  lasers = lasers.filter((laser) => laser.y > 0);
}

function createEnemy() {
  if (Math.random() < 0.02) {
    const enemy = {
      x: Math.random() * (canvas.width - 30),
      y: 0,
      width: 30,
      height: 30,
      speed: 2 + score / 100, // Adjust speed based on score
    };
    enemies.push(enemy);
  }
}

function moveEnemies() {
  enemies.forEach((enemy) => {
    enemy.y += enemy.speed;
  });
  enemies = enemies.filter((enemy) => enemy.y < canvas.height);
}

function checkCollision() {
  lasers.forEach((laser) => {
    enemies.forEach((enemy, index) => {
      if (
        laser.x < enemy.x + enemy.width &&
        laser.x + laser.width > enemy.x &&
        laser.y < enemy.y + enemy.height &&
        laser.y + laser.height > enemy.y
      ) {
        lasers.splice(lasers.indexOf(laser), 1);
        enemies.splice(index, 1);
        score += 10;
      }
    });
  });

  enemies.forEach((enemy) => {
    if (
      hero.x < enemy.x + enemy.width &&
      hero.x + hero.width > enemy.x &&
      hero.y < enemy.y + enemy.height &&
      hero.y + hero.height > enemy.y
    ) {
      isGameOver = true;
    }
  });
}

document.addEventListener("keydown", onKeyDown);
document.addEventListener("keyup", onKeyUp);

initializeGame();
update();