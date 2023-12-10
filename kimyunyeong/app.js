// app.js

// 게임 객체의 기본 클래스
class GameObject {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.dead = false;
    this.type = "";
    this.width = 0;
    this.height = 0;
    this.img = undefined;
  }

  draw(ctx) {
    ctx.drawImage(this.img, this.x, this.y, this.width, this.height);
  }
}

// 주인공 클래스
class Hero extends GameObject {
  constructor(x, y) {
    super(x, y);
    this.width = 50;
    this.height = 50;
    this.type = "Hero";
    this.speed = 10;
  }
}

// 적 클래스
class Enemy extends GameObject {
  constructor(x, y) {
    super(x, y);
    this.width = 50;
    this.height = 50;
    this.type = "Enemy";
    this.speed = 2; // 적의 이동 속도
  }

  move() {
    this.y += this.speed; // 적을 아래로 이동
  }
}

// 레이저 클래스
class Laser extends GameObject {
  constructor(x, y) {
    super(x, y);
    this.width = 30;
    this.height = 30;
    this.type = "Laser";
    this.speed = 10;
  }

  move() {
    this.y -= this.speed;
  }

  draw(ctx) {
    ctx.save(); // 현재 상태 저장
    ctx.translate(this.x + this.width / 2, this.y + this.height / 2); // 중심으로 이동
    ctx.rotate(-Math.PI / 180 * 58); // 45도 반시계 방향으로 회전
    ctx.drawImage(this.img, -this.width / 2, -this.height / 2, this.width, this.height); // 이미지 그리기
    ctx.restore(); // 이전 상태 복구
  }
}

class AttackLaser extends GameObject {
  constructor(x, y) {
    super(x, y);
    this.width = 40; 
    this.height = 40;
    this.type = "AttackLaser";
    this.speed = 5; // 필요에 따라 속도 조절
  }

  move() {
    this.y += this.speed; // "attack" 레이저를 아래로 이동
  }

  draw(ctx) {
    ctx.save(); // 현재 상태 저장
    ctx.translate(this.x + this.width / 2, this.y + this.height / 2); // 중심으로 이동
    ctx.rotate(Math.PI / 180 * 60); // 45도 반시계 방향으로 회전
    ctx.drawImage(this.img, -this.width / 2, -this.height / 2, this.width, this.height); // 이미지 그리기
    ctx.restore(); // 이전 상태 복구
  }
}


// 이벤트 처리를 위한 클래스
class EventEmitter {
  constructor() {
    this.listeners = {};
  }

  on(event, listener) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(listener);
  }

  emit(event, ...args) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(listener => listener(...args));
    }
  }
}

// 키 이벤트 메시지 정의
const Messages = {
  KEY_EVENT_UP: "KEY_EVENT_UP",
  KEY_EVENT_DOWN: "KEY_EVENT_DOWN",
  KEY_EVENT_LEFT: "KEY_EVENT_LEFT",
  KEY_EVENT_RIGHT: "KEY_EVENT_RIGHT",
  KEY_EVENT_SPACE: "KEY_EVENT_SPACE",
};

let canvas, ctx, heroImg, enemyImg, laserImg, hero, gameObjects = [];
const eventEmitter = new EventEmitter();
// 이미지 로드 함수
async function initGameObjects() {
  heroImg = await loadTexture("assets/player.png");
  enemyImg = await loadTexture("assets/enemyShip.png");
  laserImg = await loadTexture("assets/laser.png");
  attackLaserImg = await loadTexture("assets/attack.png"); 
}

// 객체들을 그리는 함수
function drawGameObjects(ctx) {
  gameObjects.forEach(go => go.draw(ctx));
}

// 스페이스바 이벤트 처리
window.addEventListener("keydown", (event) => {
  if (event.key === " ") {
    eventEmitter.emit(Messages.KEY_EVENT_SPACE);
  }
});

function handleShooting() {
  eventEmitter.on(Messages.KEY_EVENT_SPACE, () => {
    const laser = new Laser(hero.x + hero.width / 2 - 10, hero.y);
    laser.img = laserImg;
    gameObjects.push(laser);
  });
}

// 적 생성 함수
function createEnemies() {
  const enemy = new Enemy(Math.random() * (canvas.width - 50), 0);
  enemy.img = enemyImg;
  gameObjects.push(enemy);

// 적의 "attack" 레이저
  const attackLaser = new AttackLaser(enemy.x + enemy.width / 2 - 2.5, enemy.y + enemy.height);
  attackLaser.img = attackLaserImg;
  gameObjects.push(attackLaser);
}

// 주인공 생성 함수
function createHero() {
  try {
    hero = new Hero(canvas.width / 2 - 25, canvas.height - 60); 
    hero.img = heroImg;
    gameObjects.push(hero);

    console.log("Hero created:", hero);
  } catch (error) {
    console.error('Error in createHero:', error);
  }
}




// 객체 간 충돌 여부를 확인하는 함수
function isColliding(obj1, obj2) {
  if (!obj1 || !obj2) {
    return false;
  }

  return (
    obj1.x < obj2.x + obj2.width &&
    obj1.x + obj1.width > obj2.x &&
    obj1.y < obj2.y + obj2.height &&
    obj1.y + obj1.height > obj2.y
  );
}

// 게임 객체 업데이트 함수
function updateGameObjects() {
  gameObjects.forEach(go => {
    if (go instanceof Laser || go instanceof AttackLaser) {
      go.move();
      handleCollisions(go);
    } else if (go instanceof Enemy) {
      go.move();
      if (isColliding(go, hero)) {
        // 주인공이 적과 충돌하면 게임 종료
        gameOver();
      }
    }
  });
// 화면 밖으로 벗어난 "attack" 레이저를 제거
gameObjects = gameObjects.filter(go => !(go instanceof AttackLaser && go.y > canvas.height));
  // 충돌 확인 및 죽은 객체 제거
  gameObjects = gameObjects.filter(go => !go.dead);



  // 레이저와 적 간의 충돌 확인
  gameObjects.forEach(go => {
    if (go instanceof Laser) {
      gameObjects.forEach(enemy => {
        if (enemy instanceof Enemy && isColliding(go, enemy)) {
          go.dead = true;
          enemy.dead = true;
        }
      });
    }
  });
}

// 적과 레이저의 충돌을 처리하는 함수
function handleCollisions(obj) {
  gameObjects.forEach(go => {
    if (go instanceof Enemy && obj instanceof Laser && isColliding(obj, go)) {
      // 주인공의 레이저가 적에게 맞으면 적 제거
      obj.dead = true;
      go.dead = true;
    } else if (go instanceof Enemy && isColliding(obj, go)) {
      // 주인공이 적과 충돌하면 게임 종료
      gameOver();
    } else if ((go instanceof Laser || go instanceof AttackLaser) && go !== obj && isColliding(obj, go)) {
      // 레이저끼리 충돌 시
      obj.dead = true;
      go.dead = true;
    }
  });
}




function gameOver() {
  alert("게임 오버!");
  cancelAnimationFrame(gameLoopId); // 게임 루프를 멈춤
  resetGame();
}




// 이미지 로드 함수
function loadTexture(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(new Error(`이미지 로딩 중 오류 발생: ${url}. ${e.message}`));
    img.src = url;
  });
}



// 주인공 이동 상태 변수
let isMovingLeft = false;
let isMovingRight = false;

// 키보드 이벤트 처리
window.addEventListener("keydown", (event) => {
  switch (event.key) {
    case "ArrowLeft":
      isMovingLeft = true;
      break;
    case "ArrowRight":
      isMovingRight = true;
      break;
  }
});

window.addEventListener("keyup", (event) => { 
  switch (event.key) {
    case "ArrowLeft":
      isMovingLeft = false;
      break;
    case "ArrowRight":
      isMovingRight = false;
      break;
  }
});

// 주인공 이동 함수
function moveHero() {
  if (isMovingLeft && hero.x > 0) {
    hero.x -= 3; // 좌측으로 이동
  }

  if (isMovingRight && hero.x < canvas.width - hero.width) {
    hero.x += 3; // 우측으로 이동
  }
}


// 적이 10초에 1개씩 생성되도록 추가
setInterval(() => {
  createEnemies();
}, 5000);



  