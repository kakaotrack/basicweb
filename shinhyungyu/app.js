class EventEmitter {
  constructor() {
    this.listeners = {};
  }

  // 이벤트 리스너 등록
  on(message, listener) {
    if (!this.listeners[message]) {
      this.listeners[message] = [];
    }
    this.listeners[message].push(listener);
  }

  // 이벤트 발생
  emit(message, payload = null) {
    if (this.listeners[message]) {
      this.listeners[message].forEach((l) => l(message, payload));
    }
  }
}

class Sprite {
  constructor(spriteSheet, { x, y, w, h }) {
    this.spriteSheet = spriteSheet;
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
  }

  // 스프라이트 그리기
  draw(ctx, x, y, w, h) {
    ctx.drawImage(this.spriteSheet, this.x, this.y, this.w, this.h, x, y, w, h);
  }
}

class GameObject {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.dead = false;
    this.type = "";
    this.width = 0;
    this.height = 0;
    this.sprite = undefined;
  }

  // 게임 객체 그리기
  draw(ctx) {
    this.sprite.draw(ctx, this.x, this.y, this.width, this.height);
  }

  // 게임 객체의 충돌 영역 계산
  rectFromGameObject() {
    return {
      top: this.y,
      left: this.x,
      bottom: this.y + this.height,
      right: this.x + this.width,
    };
  }
}

class Hero extends GameObject {
  constructor(x, y) {
    super(x, y);
    (this.width = 99), (this.height = 75);
    this.type = "Hero";
    this.speed = { x: 100, y: 100 };
    this.shotCooldown = 0;
    this.cooldownPerSecond = 100;
    this.life = 3;
    this.points = 0;
  }

  // 레이저 발사
  fire() {
    gameObjects.push(new Laser(this.x + 45, this.y - 10));
    this.shotCooldown = 50;
  }

  // 발사 가능 여부 체크
  canFire() {
    return this.shotCooldown === 0;
  }

  // 생명력 감소
  decrementLife() {
    console.log("라이프 감소");
    this.life--;
    if (this.life === 0) {
      this.dead = true;
    }
  }

  // 점수 증가
  incrementPoints() {
    this.points += 100;
  }
}

class Enemy extends GameObject {
  constructor(x, y) {
    super(x, y);
    // 적의 특수한 속성
    (this.width = 75), (this.height = 60);
    this.type = "Enemy";
    this.speed = 25;
  }
}

class Laser extends GameObject {
  constructor(x, y) {
    super(x, y);
    // 레이저의 특수한 속성
    (this.width = 9), (this.height = 33);
    this.type = "Laser";
    this.sprite = laserImg;
    this.speed = 500;
  }
}

class Star extends GameObject {
  constructor(x, y, sprite, speed, opacity) {
    super(x, y);
    // 별의 특수한 속성
    (this.width = 25), (this.height = 24);
    this.type = "Star";
    this.sprite = sprite;
    this.speed = speed;
    this.opacity = opacity;
  }

  // 별을 그릴 때 투명도 조절
  draw(ctx) {
    ctx.globalAlpha = this.opacity;
    super.draw(ctx);
    ctx.globalAlpha = 1.0;
  }
}

class KeyboardState {
  constructor() {
    // 화살표 키와 스페이스바의 상태를 추적
    this.arrowUp = false;
    this.arrowDown = false;
    this.arrowLeft = false;
    this.arrowRight = false;
    this.space = false;
  }
}

// 이미지를 비동기적으로 로드하는 함수
function loadTexture(path) {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = path;
    img.onload = () => {
      resolve(img);
    };
  });
}

// 두 사각형이 충돌하는지 확인하는 함수
function intersectRect(r1, r2) {
  return !(
    r2.left > r1.right ||
    r2.right < r1.left ||
    r2.top > r1.bottom ||
    r2.bottom < r1.top
  );
}

// 게임에서 사용되는 메시지 정의
const Messages = {
  KEY_DOWN_UP: "KEY_DOWN_UP",
  KEY_DOWN_DOWN: "KEY_DOWN_DOWN",
  KEY_DOWN_LEFT: "KEY_DOWN_LEFT",
  KEY_DOWN_RIGHT: "KEY_DOWN_RIGHT",
  KEY_DOWN_SPACE: "KEY_DOWN_SPACE",
  KEY_UP_UP: "KEY_UP_UP",
  KEY_UP_DOWN: "KEY_UP_DOWN",
  KEY_UP_LEFT: "KEY_UP_LEFT",
  KEY_UP_RIGHT: "KEY_UP_RIGHT",
  KEY_UP_SPACE: "KEY_UP_SPACE",
  KEY_UP_ENTER: "KEY_UP_ENTER",
  COLLISION_ENEMY_LASER: "COLLISION_ENEMY_LASER",
  COLLISION_ENEMY_HERO: "COLLISION_ENEMY_HERO",
  GAME_END_WIN: "GAME_END_WIN",
  GAME_END_LOSS: "GAME_END_LOSS",
};

// 이미지 및 게임 변수 초기화
let heroImg,
  enemyImg,
  laserImg,
  lifeImg,
  star1Sprite,
  star2Sprite,
  star3Sprite,
  starSpawnCooldown = 0,
  starCooldownPerSecond = 100,
  canvas,
  ctx,
  gameObjects = [],
  hero,
  eventEmitter = new EventEmitter(),
  gameLoopId,
  keyState,
  gameOver = false,
  secondsPassed = 0,
  oldTimeStamp = 0,
  spriteSheet;

// 키 다운 이벤트 핸들러
let onKeyDown = function (e) {
  // 키 코드에 따라 분기
  switch (e.keyCode) {
    case 37:
    case 39:
    case 38:
    case 40: // 화살표 키
    case 32:
      e.preventDefault();
      break; // 스페이스바
    default:
      break; // 다른 키는 블록하지 않음
  }
  if (e.key === "ArrowUp") {
    eventEmitter.emit(Messages.KEY_DOWN_UP);
  } else if (e.key === "ArrowDown") {
    eventEmitter.emit(Messages.KEY_DOWN_DOWN);
  } else if (e.key === "ArrowLeft") {
    eventEmitter.emit(Messages.KEY_DOWN_LEFT);
  } else if (e.key === "ArrowRight") {
    eventEmitter.emit(Messages.KEY_DOWN_RIGHT);
  } else if (e.code === "Space") {
    eventEmitter.emit(Messages.KEY_DOWN_SPACE);
  }
};

// 키 다운 이벤트 리스너 등록
window.addEventListener("keydown", onKeyDown);

// 키 업 이벤트 리스너 등록
window.addEventListener("keyup", (e) => {
  if (e.key === "ArrowUp") {
    eventEmitter.emit(Messages.KEY_UP_UP);
  } else if (e.key === "ArrowDown") {
    eventEmitter.emit(Messages.KEY_UP_DOWN);
  } else if (e.key === "ArrowLeft") {
    eventEmitter.emit(Messages.KEY_UP_LEFT);
  } else if (e.key === "ArrowRight") {
    eventEmitter.emit(Messages.KEY_UP_RIGHT);
  } else if (e.code === "Space") {
    eventEmitter.emit(Messages.KEY_UP_SPACE);
  } else if (e.key === "Enter") {
    eventEmitter.emit(Messages.KEY_UP_ENTER);
  }
});

// 적 생성 함수
function createEnemies() {
  const MONSTER_TOTAL = 5;
  const MONSTER_WIDTH = MONSTER_TOTAL * 98;
  const START_X = (canvas.width - MONSTER_WIDTH) / 2;
  const STOP_X = START_X + MONSTER_WIDTH;

  for (let x = START_X; x < STOP_X; x += 98) {
    for (let y = 0; y < 60 * 5; y += 60) {
      const enemy = new Enemy(x, y);
      enemy.sprite = enemyImg;
      gameObjects.push(enemy);
    }
  }
}

// 히어로 생성 함수
function createHero() {
  hero = new Hero(canvas.width / 2 - 45, canvas.height - canvas.height / 4);
  hero.sprite = heroImg;
  gameObjects.push(hero);
}

// 무작위 별 생성 함수
function createRandomStars() {
  let numStars = getRandomInt(25, 51);
  for (let i = 0; i < numStars; i++) {
    let x = getRandomInt(0, canvas.width);
    let y = getRandomInt(0, canvas.height);
    let variant = getRandomInt(1, 4);
    let opacity = getRandomInt(10, 51) / 100;
    let newStar;
    switch (variant) {
      case 1:
        newStar = new Star(x, y, star1Sprite, 0, opacity);
        break;
      case 2:
        newStar = new Star(x, y, star2Sprite, 0, opacity);
        break;
      case 3:
        newStar = new Star(x, y, star3Sprite, 0, opacity);
        break;
      default:
        break;
    }
    gameObjects.unshift(newStar);
  }
}

// 최소값과 최대값 사이의 무작위 정수 생성 함수
function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min); // 최대값은 제외, 최소값은 포함
}

// 게임 객체 업데이트 함수
function updateGameObjects(secondsPassed) {
  const enemies = gameObjects.filter((go) => go.type === "Enemy");
  const lasers = gameObjects.filter((go) => go.type === "Laser");
  const stars = gameObjects.filter((go) => go.type === "Star");

  // 별 생성 로직
  if (starSpawnCooldown === 0) {
    let variant = getRandomInt(1, 4);
    let speed = getRandomInt(25, 51);
    let xPos = getRandomInt(0, canvas.width);
    let opacity = getRandomInt(10, 51) / 100;
    let newStar;
    switch (variant) {
      case 1:
        newStar = new Star(xPos, 0, star1Sprite, speed, opacity);
        break;
      case 2:
        newStar = new Star(xPos, 0, star2Sprite, speed, opacity);
        break;
      case 3:
        newStar = new Star(xPos, 0, star3Sprite, speed, opacity);
        break;
      default:
        break;
    }

    gameObjects.unshift(newStar);
    starSpawnCooldown = getRandomInt(50, 201);
  }

  // 별 이동 및 제거 로직
  stars.forEach((star) => {
    if (star.y < canvas.height - star.height) {
      star.y += star.speed * secondsPassed;
    } else {
      star.dead = true;
    }
  });

  // 히어로와 적의 충돌 검사
  enemies.forEach((enemy) => {
    const heroRect = hero.rectFromGameObject();
    if (intersectRect(heroRect, enemy.rectFromGameObject())) {
      eventEmitter.emit(Messages.COLLISION_ENEMY_HERO, { enemy });
    }
  });

  // 레이저와 적의 충돌 검사
  lasers.forEach((l) => {
    enemies.forEach((m) => {
      if (intersectRect(l.rectFromGameObject(), m.rectFromGameObject())) {
        eventEmitter.emit(Messages.COLLISION_ENEMY_LASER, {
          first: l,
          second: m,
        });
      }
    });
  });

  // 죽은 객체 제거
  gameObjects = gameObjects.filter((go) => !go.dead);

  // 적 이동 로직
  enemies.forEach((enemy) => {
    if (enemy.y < canvas.height - enemy.height) {
      enemy.y += enemy.speed * secondsPassed;
    } else {
      console.log("화면 끝 도착", enemy.y);
      endGame(false);
    }
  });

  // 레이저 이동 로직
  lasers.forEach((laser) => {
    if (laser.y > 0) {
      laser.y -= laser.speed * secondsPassed;
    } else {
      laser.dead = true;
    }
  });

  // 키 입력에 따른 히어로 이동 로직
  if (keyState.arrowUp) {
    hero.y -= hero.speed.y * secondsPassed;
  }
  if (keyState.arrowDown) {
    hero.y += hero.speed.y * secondsPassed;
  }
  if (keyState.arrowLeft) {
    hero.x -= hero.speed.x * secondsPassed;
  }
  if (keyState.arrowRight) {
    hero.x += hero.speed.x * secondsPassed;
  }
  if (keyState.space) {
    if (hero.canFire()) {
      hero.fire();
    }
  }
  // 발사 쿨다운 로직
  if (hero.shotCooldown > 0) {
    hero.shotCooldown -= hero.cooldownPerSecond * secondsPassed;
  }
  if (hero.shotCooldown < 0) {
    hero.shotCooldown = 0;
  }

  // 별 생성 쿨다운 로직
  if (starSpawnCooldown > 0) {
    starSpawnCooldown -= starCooldownPerSecond * secondsPassed;
  }

  if (starSpawnCooldown < 0) {
    starSpawnCooldown = 0;
  }
}

// 게임 객체를 캔버스에 그리는 함수
function drawGameObjects(ctx) {
  gameObjects.forEach((go) => go.draw(ctx));
}

// 게임 초기화
function initGame() {
  // 게임 객체 초기화
  gameObjects = [];
  // 게임 오버 여부 초기화
  gameOver = false;
  // 무작위 별 생성
  createRandomStars();
  // 적 생성
  createEnemies();
  // 주인공 생성
  createHero();
  // 키보드 상태 초기화
  keyState = new KeyboardState();

  // 키 다운 및 업 이벤트에 대한 리스너 설정
  // 화살표 키
  eventEmitter.on(Messages.KEY_DOWN_UP, () => {
    keyState.arrowUp = true;
  });
  eventEmitter.on(Messages.KEY_UP_UP, () => {
    keyState.arrowUp = false;
  });
  eventEmitter.on(Messages.KEY_DOWN_DOWN, () => {
    keyState.arrowDown = true;
  });
  eventEmitter.on(Messages.KEY_UP_DOWN, () => {
    keyState.arrowDown = false;
  });
  eventEmitter.on(Messages.KEY_DOWN_LEFT, () => {
    keyState.arrowLeft = true;
  });
  eventEmitter.on(Messages.KEY_UP_LEFT, () => {
    keyState.arrowLeft = false;
  });
  eventEmitter.on(Messages.KEY_DOWN_RIGHT, () => {
    keyState.arrowRight = true;
  });
  eventEmitter.on(Messages.KEY_UP_RIGHT, () => {
    keyState.arrowRight = false;
  });

  // 스페이스 바 키
  eventEmitter.on(Messages.KEY_DOWN_SPACE, () => {
    keyState.space = true;
  });
  eventEmitter.on(Messages.KEY_UP_SPACE, () => {
    keyState.space = false;
  });

  // 엔터 키
  eventEmitter.on(Messages.KEY_UP_ENTER, () => {
    if (gameOver) {
      resetGame();
    }
  });

  // 충돌 이벤트에 대한 리스너 설정
  // 적과 레이저의 충돌
  eventEmitter.on(Messages.COLLISION_ENEMY_LASER, (_, { first, second }) => {
    first.dead = true;
    second.dead = true;
    hero.incrementPoints();

    if (isEnemiesDead()) {
      eventEmitter.emit(Messages.GAME_END_WIN);
    }
  });

  // 적과 주인공의 충돌
  eventEmitter.on(Messages.COLLISION_ENEMY_HERO, (_, { enemy }) => {
    enemy.dead = true;
    hero.decrementLife();
    if (isHeroDead()) {
      eventEmitter.emit(Messages.GAME_END_LOSS);
      return;
    }
    if (isEnemiesDead()) {
      eventEmitter.emit(Messages.GAME_END_WIN);
    }
  });

  // 게임 승리 이벤트
  eventEmitter.on(Messages.GAME_END_WIN, () => {
    endGame(true);
  });

  // 게임 패배 이벤트
  eventEmitter.on(Messages.GAME_END_LOSS, () => {
    endGame(false);
  });
}

// 주인공의 생명을 그리는 함수
function drawLife() {
  const START_POS = canvas.width - 180;
  for (let i = 0; i < hero.life; i++) {
    lifeImg.draw(ctx, START_POS + 45 * (i + 1), canvas.height - 37, 40, 30);
  }
}

// 현재 점수를 그리는 함수
function drawPoints() {
  ctx.font = "30px Arial";
  ctx.fillStyle = "red";
  ctx.textAlign = "left";
  drawText("포인트: " + hero.points, 10, canvas.height - 20);
}

// 텍스트를 그리는 함수
function drawText(message, x, y) {
  ctx.fillText(message, x, y);
}

// 메시지를 표시하는 함수
function displayMessage(message, color = "red") {
  ctx.font = "30px Arial";
  ctx.fillStyle = color;
  ctx.textAlign = "center";
  ctx.fillText(message, canvas.width / 2, canvas.height / 2);
}

// 주인공이 죽었는지 여부를 반환하는 함수
function isHeroDead() {
  return hero.life <= 0;
}

// 모든 적이 죽었는지 여부를 반환하는 함수
function isEnemiesDead() {
  const enemies = gameObjects.filter((go) => go.type === "Enemy" && !go.dead);
  return enemies.length === 0;
}

// 게임 종료 처리 함수
function endGame(win) {
  gameOver = true;

  // 0.2초 후에 화면을 지우고 메시지를 표시
  setTimeout(() => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    if (win) {
      displayMessage("승리!! [Enter]를 눌러 새 게임을 시작하세요.", "green");
    } else {
      displayMessage("패배!! [Enter]를 눌러 새 게임을 시작하세요.");
    }
  }, 200);
}

// 게임을 재설정하는 함수
function resetGame() {
  gameObjects = [];
  gameOver = false;
  createRandomStars();
  createEnemies();
  createHero();
}

// 스프라이트 정의
let spriteDefs = {
  enemyGreen1: { x: 425, y: 552, w: 93, h: 84 },
  playerShip1_red: { x: 224, y: 832, w: 99, h: 75 },
  laserRed01: { x: 858, y: 230, w: 9, h: 54 },
  playerLife1_red: { x: 775, y: 301, w: 33, h: 26 },
  star1: { x: 628, y: 681, w: 25, h: 24 },
  star2: { x: 222, y: 84, w: 25, h: 24 },
  star3: { x: 576, y: 300, w: 24, h: 24 },
};

// 윈도우 로딩 시 실행되는 함수
window.onload = async () => {
  // 캔버스 및 컨텍스트 초기화
  canvas = document.getElementById("canvas");
  ctx = canvas.getContext("2d");

  // 스프라이트 시트 로드
  spriteSheet = await loadTexture("./assets/Spritesheet/sheet.png");

  // 스프라이트 객체 초기화
  heroImg = new Sprite(spriteSheet, spriteDefs.playerShip1_red);
  enemyImg = new Sprite(spriteSheet, spriteDefs.enemyGreen1);
  laserImg = new Sprite(spriteSheet, spriteDefs.laserRed01);
  lifeImg = new Sprite(spriteSheet, spriteDefs.playerLife1_red);
  star1Sprite = new Sprite(spriteSheet, spriteDefs.star1);
  star2Sprite = new Sprite(spriteSheet, spriteDefs.star2);
  star3Sprite = new Sprite(spriteSheet, spriteDefs.star3);

  // 게임 초기화 함수 호출
  initGame();

  // 게임 루프 요청
  window.requestAnimationFrame(gameLoop);
};

// 게임 루프 함수
function gameLoop(timeStamp) {
  // 경과 시간 계산
  secondsPassed = (timeStamp - oldTimeStamp) / 1000;
  oldTimeStamp = timeStamp;

  // 게임 오버가 아니면 게임 업데이트 및 그리기 수행
  if (!gameOver) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    updateGameObjects(secondsPassed);
    drawPoints();
    drawLife();
    drawGameObjects(ctx);
  }

  // 다음 프레임 요청
  window.requestAnimationFrame(gameLoop);
}
