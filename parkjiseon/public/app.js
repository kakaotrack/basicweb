// 게임 루프 ID를 파일 맨 위에 선언합니다.
let gameLoopId;

class EventEmitter {
  constructor() {
    // 이벤트 리스너를 저장할 객체를 초기화합니다.
    this.listeners = {};
  }

  on(message, listener) {
    // 메시지에 대한 리스너 배열을 만들고 리스너를 추가합니다.
    this.listeners[message] = this.listeners[message] || [];
    this.listeners[message].push(listener);
  }

  emit(message, payload = null) {
    // 등록된 모든 리스너에게 메시지를 발송합니다.
    if (this.listeners[message]) {
      this.listeners[message].forEach((l) => l(message, payload));
    }
  }

  clear() {
    // 모든 리스너를 초기화합니다.
    this.listeners = {};
  }
}

class GameObject {
  constructor(x, y) {
    // 게임 오브젝트의 초기 속성을 설정합니다.
    this.x = x;
    this.y = y;
    this.dead = false;
    this.type = "";
    this.width = 0;
    this.height = 0;
    this.img = undefined;
  }

  rectFromGameObject() {
    // 게임 오브젝트의 경계 상자를 반환합니다.
    return {
      top: this.y,
      left: this.x,
      bottom: this.y + this.height,
      right: this.x + this.width,
    };
  }

  draw(ctx) {
    // 캔버스에 게임 오브젝트를 그립니다.
    ctx.drawImage(this.img, this.x, this.y, this.width, this.height);
  }
}

class Hero extends GameObject {
  constructor(x, y) {
    // 영웅 클래스를 초기화합니다.
    super(x, y);
    this.width = 99;
    this.height = 75;
    this.type = "Hero";
    this.speed = 20;
    this.cooldown = 0;
    this.life = 3;
    this.points = 0;
  }

  fire() {
    // 새로운 레이저 오브젝트를 생성하고 쿨다운을 설정합니다.
    gameObjects.push(new Laser(this.x + 45, this.y - 10));
    this.cooldown = 500;

    let id = setInterval(() => {
      if (this.cooldown > 0) {
        this.cooldown -= 100;
      } else {
        clearInterval(id);
      }
    }, 200);
  }

  canFire() {
    return this.cooldown === 0;
  }

  decrementLife() {
    // 영웅의 생명을 감소시키고 생명이 0이 되면 죽습니다.
    this.life--;
    if (this.life === 0) {
      this.dead = true;
    }
  }

  incrementPoints() {
    // 영웅의 포인트를 증가시킵니다.
    this.points += 100;
  }
}

class Enemy extends GameObject {
    constructor(x, y) {
      // 적 클래스를 초기화합니다.
      super(x, y);
      this.width = 98;
      this.height = 50;
      this.type = "Enemy";
      
      // 랜덤한 간격으로 적을 아래로 이동시킵니다.
      let id = setInterval(() => {
        if (this.y < canvas.height) {
          this.y += 20;
        } else {
          console.log('Stopped at', this.y);
          clearInterval(id);
  
          // 다시 적을 생성하고 랜덤한 간격으로 이동시킵니다.
          this.resetEnemy();
        }
      }, this.getRandomInterval());
    }
  
    // 랜덤한 간격을 반환하는 함수
    getRandomInterval() {
      return Math.floor(Math.random() * (500 - 200 + 1)) + 200; // 300ms에서 700ms 사이의 랜덤한 값
    }
  
    // 적을 초기 위치로 리셋하는 함수
    resetEnemy() {
      this.y = 0;
      let id = setInterval(() => {
        if (this.y < canvas.height) {
          this.y += 20;
        } else {
          console.log('Stopped at', this.y);
          clearInterval(id);
  
          // 다시 적을 생성하고 랜덤한 간격으로 이동시킵니다.
          this.resetEnemy();
        }
      }, this.getRandomInterval());
    }
  }

class Laser extends GameObject {
  constructor(x, y) {
    // 레이저 클래스를 초기화합니다.
    super(x, y);
    this.width = 9;
    this.height = 33;
    this.type = 'Laser';
    this.img = laserImg;
    let id = setInterval(() => {
      // 레이저를 위로 이동시킵니다. 위에 닿으면 사망합니다.
      if (this.y > 0) {
        this.y -= 15;
      } else {
        this.dead = true;
        clearInterval(id);
      }
    }, 100);
  }
}

class Cooldown {
  constructor(time) {
    // 쿨다운 시간을 설정합니다.
    this.cool = false;
    setTimeout(() => {
      this.cool = true;
    }, time)
  }
}

class Weapon {
  fire() {
    if (!this.cooldown || this.cooldown.cool) {
      // 레이저를 생성하고 쿨다운을 설정합니다.
      this.cooldown = new Cooldown(500);
    } else {
      // 쿨다운이 아직 끝나지 않았으므로 아무것도하지 않습니다.
    }
  }
}

const Messages = {
  KEY_EVENT_UP: "KEY_EVENT_UP",
  KEY_EVENT_DOWN: "KEY_EVENT_DOWN",
  KEY_EVENT_LEFT: "KEY_EVENT_LEFT",
  KEY_EVENT_RIGHT: "KEY_EVENT_RIGHT",
  KEY_EVENT_SPACE: "KEY_EVENT_SPACE",
  COLLISION_ENEMY_LASER: "COLLISION_ENEMY_LASER",
  COLLISION_ENEMY_HERO: "COLLISION_ENEMY_HERO",
  GAME_END_LOSS: "GAME_END_LOSS",
  GAME_END_WIN: "GAME_END_WIN",
  KEY_EVENT_ENTER: "KEY_EVENT_ENTER",
};

let heroImg, enemyImg, laserImg, lifeImg, canvas, ctx, gameObjects = [], hero, eventEmitter = new EventEmitter();

function loadTexture(path) {
  // 이미지 텍스처를 비동기적으로 로드합니다.
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = path;
    img.onload = () => resolve(img);
    img.onerror = reject;
  });
}

function drawGameObjects(ctx) {
  // 캔버스에 모든 게임 오브젝트를 그립니다.
  gameObjects.forEach(go => go.draw(ctx));
}

function createEnemies() {
    const MONSTER_TOTAL = 3;
    const ENEMY_WIDTH = 98;
  
    for (let i = 0; i < MONSTER_TOTAL; i++) {
      // 랜덤한 X 좌표, 가장 위쪽에 위치한 Y 좌표
      const x = Math.random() * (canvas.width - ENEMY_WIDTH);
      const y = 0;
  
      const enemy = new Enemy(x, y);
      enemy.img = enemyImg;
      gameObjects.push(enemy);
    }
  }



function createHero() {
  // 영웅 오브젝트를 생성하고 게임 오브젝트 배열에 추가합니다.
  hero = new Hero(canvas.width / 2 - 45, canvas.height - canvas.height / 4);
  hero.img = heroImg;
  gameObjects.push(hero);
}

function drawLife() {
  // 생명을 캔버스에 그립니다.
  const START_POS = canvas.width - 350;
  for(let i = 0; i < hero.life; i++ ) {
    ctx.drawImage(
      lifeImg, 
      START_POS + (80 * (i + 1)), 
      canvas.height - 100,
      100,
      100
    );
  }
}

function drawPoints() {
  // 포인트를 캔버스에 그립니다.
  ctx.font = "30px Arial";
  ctx.fillStyle = "red";
  ctx.textAlign = "left";
  drawText("포인트: " + hero.points, 10, canvas.height - 20);

  // 포인트가 3000점 이상이면 승리 처리
  if (hero.points >= 3000) {
    eventEmitter.emit(Messages.GAME_END_WIN);
  }
}

function drawText(message, x, y) {
  // 텍스트를 캔버스에 그립니다.
  ctx.fillText(message, x, y);
}

function initGame() {
  // 게임 초기화 함수입니다.
  gameObjects = [];
  createEnemies();
  createHero();

  // 키 이벤트 리스너 등록
  eventEmitter.on(Messages.KEY_EVENT_UP, () => {
    hero.y -= hero.speed;
  });

  eventEmitter.on(Messages.KEY_EVENT_DOWN, () => {
    hero.y += hero.speed;
  });

  eventEmitter.on(Messages.KEY_EVENT_LEFT, () => {
    hero.x -= hero.speed;
  });

  eventEmitter.on(Messages.KEY_EVENT_RIGHT, () => {
    hero.x += hero.speed;
  });

  eventEmitter.on(Messages.KEY_EVENT_SPACE, () => {
    if (hero.canFire()) {
      hero.fire();
    }
  });

  eventEmitter.on(Messages.COLLISION_ENEMY_LASER, (_, { first, second }) => {
    // 적 레이저와 영웅의 충돌을 처리합니다.
    first.dead = true;
    second.dead = true;
    hero.incrementPoints();

    if (isEnemiesDead()) {
      eventEmitter.emit(Messages.GAME_END_WIN);
    }
  });

  eventEmitter.on(Messages.COLLISION_ENEMY_HERO, (_, { enemy }) => {
    // 적과 영웅의 충돌을 처리합니다.
    enemy.dead = true;
    hero.decrementLife();
    if (isHeroDead())  {
      eventEmitter.emit(Messages.GAME_END_LOSS);
      return; // 승리 전에 패배
    }
    if (isEnemiesDead()) {
      eventEmitter.emit(Messages.GAME_END_WIN);
    }
  });

  eventEmitter.on(Messages.GAME_END_WIN, () => {
    endGame(true);
  });

  eventEmitter.on(Messages.GAME_END_LOSS, () => {
    endGame(false);
  });

  eventEmitter.on(Messages.KEY_EVENT_ENTER, () => {
    resetGame();
  });
}

function intersectRect(r1, r2) {
  // 두 사각형이 교차하는지 확인합니다.
  return !(
    r2.left > r1.right ||
    r2.right < r1.left ||
    r2.top > r1.bottom ||
    r2.bottom < r1.top
  );
}

function isHeroDead() {
  // 영웅이 사망했는지 확인합니다.
  return hero.life <= 0;
}

function isEnemiesDead() {
  // 모든 적이 사망했는지 확인합니다.
  const enemies = gameObjects.filter((go) => go.type === "Enemy" && !go.dead);
  return enemies.length === 0;
}

function displayMessage(message, color = "red") {
  // 캔버스에 메시지를 표시합니다.
  ctx.font = "30px Arial";
  ctx.fillStyle = color;
  ctx.textAlign = "center";
  ctx.fillText(message, canvas.width / 2, canvas.height / 2);
}

function endGame(win) {
  // 게임을 종료하고 메시지를 표시합니다.
  clearInterval(gameLoopId);

  // 페인트가 완료됐다는 것을 확인하기 위해 지연을 설정합니다.
  setTimeout(() => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    if (win) {
      displayMessage(
        "Win!!!  [Enter] 키를 눌러 새 게임을 시작하세요.",
        "green"
      );
    } else {
      displayMessage(
        "Lose... [Enter] 키를 눌러 새 게임을 시작하세요."
      );
    }
  }, 200);
}

function resetGame() {
  // 게임 상태를 재설정합니다.
  if (gameLoopId) {
    clearInterval(gameLoopId);
    eventEmitter.clear();
    initGame();
    gameLoopId = setInterval(() => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "black";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      drawPoints();
      drawLife();
      updateGameObjects();
      drawGameObjects(ctx);
    }, 100);
  }
}

function playDeathSound() {
    // 적이 죽을 때 효과음을 재생합니다.
    const explosionSound = document.getElementById('explosionSound');
    explosionSound.play();
  }

function updateGameObjects() {
  // 충돌 및 이동 기반으로 게임 상태를 업데이트합니다.
  const enemies = gameObjects.filter(go => go.type === 'Enemy');
  const lasers = gameObjects.filter(go => go.type === 'Laser');

  lasers.forEach(l => {
    enemies.forEach(m => {
      if (intersectRect(l.rectFromGameObject(), m.rectFromGameObject())) {
        eventEmitter.emit(Messages.COLLISION_ENEMY_LASER, {
          first: l,
          second: m,
        });
      }
    });
  });

  gameObjects = gameObjects.filter(go => {
    // 사망한 게임 오브젝트를 제거합니다.
    const shouldKeep = !go.dead;
    if (!shouldKeep) {
      playDeathSound(); 
      console.log(`${go.type} at (${go.x}, ${go.y}) is dead.`);
    }
    return shouldKeep;
  });

  // 영웅과 적 간의 충돌을 확인하고 처리합니다.
  enemies.forEach(enemy => {
    const heroRect = hero.rectFromGameObject();
    if (intersectRect(heroRect, enemy.rectFromGameObject())) {
      eventEmitter.emit(Messages.COLLISION_ENEMY_HERO, { enemy });
    }
  })

}
  
  window.addEventListener("keydown", (evt) => {
    if (evt.key === "ArrowUp") {
      eventEmitter.emit(Messages.KEY_EVENT_UP);
    } else if (evt.key === "ArrowDown") {
      eventEmitter.emit(Messages.KEY_EVENT_DOWN);
    } else if (evt.key === "ArrowLeft") {
      eventEmitter.emit(Messages.KEY_EVENT_LEFT);
    } else if (evt.key === "ArrowRight") {
      eventEmitter.emit(Messages.KEY_EVENT_RIGHT);
    } else if (evt.key === " ") {
        eventEmitter.emit(Messages.KEY_EVENT_SPACE);
    } else if(evt.key === "Enter") {
        eventEmitter.emit(Messages.KEY_EVENT_ENTER);
    }
  });
  
  window.onload = async () => {
    canvas = document.getElementById("canvas");
    ctx = canvas.getContext("2d");

    heroImg = await loadTexture("assets/player.png");
    enemyImg = await loadTexture("assets/enemyShip.png");
    laserImg = await loadTexture("assets/player.png");
    lifeImg = await loadTexture("assets/bubble.png");
  
    initGame();

    // 5000ms(5초) 간격으로 createEnemies 함수 호출
    setInterval(() => {
      createEnemies();
    }, 4000);

    gameLoopId = setInterval(() => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "black";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      drawGameObjects(ctx);
      updateGameObjects();
      drawPoints();
      drawLife();
    }, 100);
  };
  