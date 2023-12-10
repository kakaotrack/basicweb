const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const backgroundImage = new Image();
backgroundImage.src = "images/background.jpg";
const spaceshipImage = new Image();
spaceshipImage.src = "images/spaceship.png";
const meteorImage = new Image();
meteorImage.src = "images/meteor.png";

let spaceshipX = canvas.width / 5;
let spaceshipY = canvas.height - 100;

let rightPressed = false;
let leftPressed = false;

let bullets = [];
const bulletSpeed = 5;

let meteors = [];
const meteorSpeed = 2;

let score = 0;
let gameOver = false;

document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);

// 키보드 이벤트 처리
function keyDownHandler(e) {
  if (e.key == "Right" || e.key == "ArrowRight") {
    rightPressed = true;
  } else if (e.key == "Left" || e.key == "ArrowLeft") {
    leftPressed = true;
  } else if (e.key == " " || e.key == "Spacebar") {
    bullets.push({ x: spaceshipX + spaceshipImage.width / 2, y: spaceshipY });
  }
}

function keyUpHandler(e) {
  if (e.key == "Right" || e.key == "ArrowRight") {
    rightPressed = false;
  } else if (e.key == "Left" || e.key == "ArrowLeft") {
    leftPressed = false;
  }
}

// 우주선 동작
function moveSpaceship() {
  if (rightPressed && spaceshipX + spaceshipImage.width < canvas.width) {
    spaceshipX += 5;
  } else if (leftPressed && spaceshipX > 0) {
    spaceshipX -= 5;
  }
}

// 우주선 그리기
function drawSpaceship() {
  ctx.drawImage(spaceshipImage, spaceshipX, spaceshipY);
}

// 총알 그리기
function drawBullets() {
  bullets = bullets.filter((bullet) => {
    bullet.y -= bulletSpeed;
    if (bullet.y < 0) return false;

    ctx.beginPath();
    ctx.arc(bullet.x, bullet.y, 7, 0, Math.PI * 2);
    ctx.fillStyle = "white";
    ctx.fill();
    ctx.closePath();
    return true;
  });
}

// 운석 생성
function createMeteors() {
  setInterval(() => {
    const xPosition = Math.random() * (canvas.width - 60);
    meteors.push({ x: xPosition, y: -60, width: 60, height: 60 });
  }, 2000);
}
createMeteors();

// 운석 그리기
function drawMeteors() {
  meteors.forEach((meteor, index) => {
    meteor.y += meteorSpeed;
    if (meteor.y > canvas.height) {
      gameOver = true;
    }
    ctx.drawImage(meteorImage, meteor.x, meteor.y, meteor.width, meteor.height);
  });
}

// 충돌 감지
function detectCollisions() {
  bullets.forEach((bullet, bulletIndex) => {
    meteors.forEach((meteor, meteorIndex) => {
      if (
        bullet.x > meteor.x &&
        bullet.x < meteor.x + meteor.width &&
        bullet.y > meteor.y &&
        bullet.y < meteor.y + meteor.height
      ) {
        bullets.splice(bulletIndex, 1);
        meteors.splice(meteorIndex, 1);
        score += 10;
      }
    });
  });
}

// 점수 업데이트
function updateScore() {
  document.getElementById("scoreBoard").innerText = "Score: " + score;
  if (score >= 100) {
    document.getElementById("congratulationsModal").style.display = "block";
    gameOver = true;
  }
}

function draw() {
  if (gameOver) {
    document.getElementById("gameOverModal").style.display = "block";
    return;
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);

  drawSpaceship();
  drawBullets();
  drawMeteors();
  moveSpaceship();
  detectCollisions();
  updateScore();
  requestAnimationFrame(draw);
}

backgroundImage.onload = draw;
