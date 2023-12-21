const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const message = document.getElementById('message');
let playerLives = 3;
let gameOver = false;
let gameStarted = false;
let score = 0;
let round = 1;

// 캔버스 크기 설정
canvas.width = 800;
canvas.height = 800;

// 이미지 로드
const playerImg = new Image();
playerImg.src = 'player.png';

const enemyImg = new Image();
enemyImg.src = 'enemyShip.png';

const laserImg = new Image();
laserImg.src = 'laserRed.png';

const lifeImg = new Image();
lifeImg.src = 'life.png';

// 플레이어 캐릭터
const player = {
    x: canvas.width / 2,
    y: canvas.height - 50,
    width: 50,
    height: 50,
    speed: 5,
    image: playerImg
};

// 적 우주선
const enemy = {
  x: Math.random() * (canvas.width - 50),
  y: 10,
  width: 50,
  height: 50,
  speed: Math.random() * 2 + 1,
  image: enemyImg
};

// 레이저
const lasers = [];
const laser = {
    width: 2,
    height: 20,
    speed: 8,
    image: laserImg
};

// 플레이어 라이프를 위한 life 이미지를 그리는 함수
function drawLives() {
    let lifeX = canvas.width - 40;
    const lifeY = 10;
    const lifeWidth = 30;
    const lifeHeight = 30;

    for (let i = 0; i < playerLives; i++) {
        ctx.drawImage(lifeImg, lifeX, lifeY, lifeWidth, lifeHeight);
        lifeX -= 35; // 다음 라이프를 표시할 X 위치 조정
    }
}

// 플레이어와 적 우주선 충돌 시 라이프 감소 처리
function handlePlayerEnemyCollision() {
    if (player.x < enemy.x + enemy.width &&
    player.x + player.width > enemy.x &&
    player.y < enemy.y + enemy.height &&
    player.y + player.height > enemy.y) {
        playerLives--;
        if (playerLives === 0) {
          gameOver = true;
        } else {
          enemy.x = Math.random() * (canvas.width - enemy.width);
          enemy.y = 10;
        }
    }
}


// 이벤트 리스너: 플레이어 이동 및 발사
document.addEventListener('keydown', (event) => {
    if (!gameOver) {
        if (event.key === 'A' || event.key === 'a') {
            if (player.x - player.speed > 0) {
                player.x -= player.speed;
            }
        } else if (event.key === 'D' || event.key === 'd') {
            if (player.x + player.width + player.speed < canvas.width) {
                player.x += player.speed;
            }
        } else if (event.key === ' ' && lasers.length < 1) {
            fireLaser();
        }
    }
});

// 레이저 발사
function fireLaser() {
    lasers.push({
        x: player.x + player.width / 2 - laser.width / 2,
        y: player.y,
        width: laser.width,
        height: laser.height,
        speed: laser.speed
    });
}

// 게임 시작 메시지 표시
function showRoundStartMessage() {
    message.innerText = `Round ${round} Clear. New Round Starting!`;
    message.classList.remove('hidden');
    setTimeout(() => {
        message.classList.add('hidden');
    }, 2000); // 2초 후 메시지 숨김
}

// 라운드 업데이트
function updateRound() {
    round++;
    showRoundStartMessage();
    
    // 적 우주선 위치와 플레이어 위치 부드럽게 변경 (90도 회전)
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const playerDistance = 200; // 플레이어와 적 우주선 사이의 거리

    const playerAngle = ((round - 1) * Math.PI) / 2; // 라운드가 바뀔 때마다 90도(π/2) 회전
    player.x = centerX + playerDistance * Math.cos(playerAngle);
    player.y = centerY + playerDistance * Math.sin(playerAngle);

    const enemyAngle = playerAngle + Math.PI; // 플레이어와 반대 방향으로 설정
    enemy.x = centerX + playerDistance * Math.cos(enemyAngle);
    enemy.y = centerY + playerDistance * Math.sin(enemyAngle);

    player.imageAngle = playerAngle; // 플레이어 이미지 회전 각도 설정
    enemy.imageAngle = enemyAngle; // 적 우주선 이미지 회전 각도 설정
}

// 게임 루프
function draw() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 플레이어 비행기 그리기
    ctx.drawImage(playerImg, player.x, player.y, player.width, player.height);

    // 적 비행기 그리기
    ctx.drawImage(enemyImg, enemy.x, enemy.y, enemy.width, enemy.height);

    // 적 비행기 이동
    if (enemy.y < canvas.height) {
        enemy.y += enemy.speed;
    } else {
        enemy.x = Math.random() * (canvas.width - enemy.width);
        enemy.y = 10;
        enemy.speed = Math.random() * 2 + 1; // 랜덤 속도 재설정
    }

    // 레이저 그리기 및 이동
    for (let i = 0; i < lasers.length; i++) {
        ctx.drawImage(laserImg, lasers[i].x, lasers[i].y, lasers[i].width, lasers[i].height);
        lasers[i].y -= lasers[i].speed;

        // 적과 레이저 충돌 체크
        if (lasers[i].x < enemy.x + enemy.width &&
            lasers[i].x + lasers[i].width > enemy.x &&
            lasers[i].y < enemy.y + enemy.height &&
            lasers[i].y + lasers[i].height > enemy.y) {
        // 적 격추
        lasers.splice(i, 1);
        enemy.x = Math.random() * (canvas.width - enemy.width);
        enemy.y = 10;
        enemy.speed = Math.random() * 2 + 1; // 랜덤 속도 재설정
        score += 100; // 점수 추가
        }
        
        // 레이저가 화면 밖으로 나가면 제거
        if (lasers[i].y < 0) {
            lasers.splice(i, 1);
        }
    }

    // 플레이어와 적 충돌 체크
    if (player.x < enemy.x + enemy.width &&
        player.x + player.width > enemy.x &&
        player.y < enemy.y + enemy.height &&
        player.y + player.height > enemy.y) {
        playerLives--;
        if (playerLives === 0) {
            gameOver = true;
        } else {
            enemy.x = Math.random() * (canvas.width - enemy.width);
            enemy.y = 10;
        }
    }

    // 게임 오버 텍스트 표시
    if (gameOver) {
        ctx.fillStyle = 'white';
        ctx.font = '40px Arial';
        ctx.fillText('Game Over', canvas.width / 2 - 100, canvas.height / 2);
    }

    // 점수 표시
    ctx.fillStyle = 'white';
    ctx.font = '24px Arial';
    ctx.fillText('Score: ' + score, 10, 30);

    // 플레이어 라이프 그리기
    drawLives();

    requestAnimationFrame(draw);

    // 라운드 업데이트 조건 확인
    if (score >= 1000 * round) {
        updateRound();
    }
}

// 초기화 함수
function init() {
    canvas.width = 800;
    canvas.height = 800;
    round = 1; // 라운드 초기화
    showStartMessage();
}

// 게임 시작 함수
function startGame() {
    gameStarted = true;
    message.classList.add('hidden');
    draw();
}

// 게임 종료 함수
function endGame() {
    gameOver = true;
    gameStarted = false;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    message.innerText = 'Game Over. Press Enter to Restart';
    message.classList.remove('hidden');
}

// 이벤트 리스너: Enter 키를 눌러 게임 시작 또는 재시작
document.addEventListener('keydown', (event) => {
    if (!gameStarted && event.key === 'Enter') {
        gameStarted = true;
        message.classList.add('hidden');
        draw();
    } else if (gameOver && event.key === 'Enter') {
        playerLives = 3; // 플레이어 라이프 초기화
        gameOver = false;
        score = 0; // 점수 초기화
        message.classList.add('hidden');
        draw();
    }
});

// 초기화 함수 호출
init();
