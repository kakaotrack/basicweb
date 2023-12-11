class GameObject {
  constructor(x, y, type, width, height, imgPath) {
    this.x = x;
    this.y = y;
    this.dead = false;
    this.type = type;
    this.width = width;
    this.height = height;
    this.img = undefined;
  }


  draw(ctx) {
    ctx.drawImage(this.img, this.x, this.y, this.width, this.height);
  }
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
    this.speed = { x: 0, y: 0 };
    this.cooldown = 0;
    this.life = 3;
    this.points = 0;
  }
  fire() {
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
		this.life--;
		if (this.life === 0) {
			this.dead = true;
		}
	}
	incrementPoints() {
		this.points += 100;
	}
 }

class Enemy extends GameObject {
  constructor(x, y) {
    super(x, y);
    (this.width = 98), (this.height = 50);
    this.type = "Enemy";
    let id = setInterval(() => {
      if (this.y < canvas.height - this.height) {
        this.y += 5;
      } else {
        console.log('Stopped at', this.y)
        clearInterval(id);
      }
    }, 300)
  }
}

class Laser extends GameObject {
  constructor(x, y) {
    super(x,y);
    (this.width = 9), (this.height = 33);
    this.type = 'Laser';
    this.img = laserImg;
    let id = setInterval(() => {
      if (this.y > 0) {
        this.y -= 15;
      } else {
        this.dead = true;
        clearInterval(id);
      }
    }, 100)
  }
}

class EventEmitter {
  constructor() {
    this.listeners = {};
  }

  on(message, listener) {
    if (!this.listeners[message]) {
      this.listeners[message] = [];
    }
    this.listeners[message].push(listener);
  }

  emit(message, payload = null) {
    if (this.listeners[message]) {
      this.listeners[message].forEach((l) => l(message, payload));
    }
  }
  clear() {
    this.listeners = {};
  }
}

const Messages = {
  KEY_EVENT_UP: 'KEY_EVENT_UP',
  KEY_EVENT_DOWN: 'KEY_EVENT_DOWN',
  KEY_EVENT_LEFT: 'KEY_EVENT_LEFT',
  KEY_EVENT_RIGHT: 'KEY_EVENT_RIGHT',
  KEY_EVENT_SPACE: "KEY_EVENT_SPACE",
  COLLISION_ENEMY_LASER: "COLLISION_ENEMY_LASER",
  COLLISION_ENEMY_HERO: "COLLISION_ENEMY_HERO",
  GAME_END_LOSS: "GAME_END_LOSS",
  GAME_END_WIN: "GAME_END_WIN",
  KEY_EVENT_ENTER: "KEY_EVENT_ENTER",
};

let heroImg,
    enemyImg, 
    laserImg,
    lifeImg,
    canvas, ctx, 
    gameObjects = [], 
    hero, 
    eventEmitter = new EventEmitter();

    let onKeyDown = function (e) {
      // console.log(e.keyCode);
      switch (e.keyCode) {
        case 37:
        case 39:
        case 38:
        case 40: // Arrow keys
        case 32:
          e.preventDefault();
          break; // Space
        default:
          break; // do not block other keys
      }
    };

function loadAsset(path) {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = path;
    img.onload = () => resolve(img);
  });
}

async function loadAssets() {
  heroImg = await loadAsset('assets/player.png');
  heroImg2 = await loadAsset('assets/player.png');
  heroImg3 = await loadAsset('assets/player.png');
  enemyImg = await loadAsset('assets/enemyShip.png');
  laserImg = await loadAsset('assets/laserRed.png');
  lifeImg = await loadAsset('assets/life.png');
}

function displayMessage(message, color = "red") {
  ctx.font = "30px Arial";
  ctx.fillStyle = color;
  ctx.textAlign = "center";
  ctx.fillText(message, canvas.width / 2, canvas.height / 2);
 }

 function endGame(win) {
 clearInterval(gameLoopId);

 // set a delay so we are sure any paints have finished
 setTimeout(() => {
   ctx.clearRect(0, 0, canvas.width, canvas.height);
   ctx.fillStyle = "black";
   ctx.fillRect(0, 0, canvas.width, canvas.height);
   if (win) {
     displayMessage(
       "Victory!!! Pew Pew... - Press [Enter] to start a new game Captain Pew Pew",
       "green"
     );
   } else {
     displayMessage(
       "You died !!! Press [Enter] to start a new game Captain Pew Pew"
     );
   }
 }, 200)  
}

function endGame(win) {
  clearInterval(gameLoopId);

  // set a delay so we are sure any paints have finished
  setTimeout(() => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    if (win) {
      displayMessage(
        "Victory!!! Pew Pew... - Press [Enter] to start a new game Captain Pew Pew",
        "green"
      );
    } else {
      displayMessage(
        "You died !!! Press [Enter] to start a new game Captain Pew Pew"
      );
    }
  }, 200);
}


function resetGame() {
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


function setupCanvas() {
  canvas = document.getElementById('canvas');
  ctx = canvas.getContext('2d');
}

function isHeroDead() {
  return hero.life <= 0;
}

function isEnemiesDead() {
  const enemies = gameObjects.filter((go) => go.type === "Enemy" && !go.dead);
  return enemies.length === 0;
}

let gameLoopId;

function runGameLoop() {
  gameLoopId = setInterval(() => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    drawGameObjects();
    drawPoints();
    drawLife();
    updateGameObjects();

    // 추가된 부분: 게임 종료 여부 확인
    if (isHeroDead()) {
      eventEmitter.emit(Messages.GAME_END_LOSS);
    }

    if (isEnemiesDead()) {
      eventEmitter.emit(Messages.GAME_END_WIN);
    }

    // 추가된 부분: 게임 종료 후 루프 멈춤
    if (isHeroDead() || isEnemiesDead()) {
      clearInterval(gameLoopId);
    }

  }, 100);
}

function setupEventListeners() {
  window.addEventListener('keyup', (evt) => {
    if (evt.key === 'ArrowUp') {
      eventEmitter.emit(Messages.KEY_EVENT_UP);
    } else if (evt.key === 'ArrowDown') {
      eventEmitter.emit(Messages.KEY_EVENT_DOWN);
    } else if (evt.key === 'ArrowLeft') {
      eventEmitter.emit(Messages.KEY_EVENT_LEFT);
    } else if (evt.key === 'ArrowRight') {
      eventEmitter.emit(Messages.KEY_EVENT_RIGHT);
    } else if (evt.keyCode === 32) {
      eventEmitter.emit(Messages.KEY_EVENT_SPACE);
    } else if (evt.key === 'Enter') {
      eventEmitter.emit(Messages.KEY_EVENT_ENTER);
    }
  });
  window.addEventListener('keydown', handleKeyDown);
}

function initGame() {
  gameObjects = [];
  createEnemies();
  createHero();

  eventEmitter.on(Messages.KEY_EVENT_UP, () => {
    hero.y -= 5;
  });

  eventEmitter.on(Messages.KEY_EVENT_DOWN, () => {
    hero.y += 5;
  });

  eventEmitter.on(Messages.KEY_EVENT_LEFT, () => {
    hero.x -= 15;
  });

  eventEmitter.on(Messages.KEY_EVENT_RIGHT, () => {
    hero.x += 15;
  });
  eventEmitter.on(Messages.KEY_EVENT_SPACE, () => {
    if (hero.canFire()) {
      hero.fire();
    }
  });

  eventEmitter.on(Messages.COLLISION_ENEMY_LASER, (_, { first, second }) => {
    first.dead = true;
    second.dead = true;
    hero.incrementPoints();

    if (isEnemiesDead()) {
      eventEmitter.emit(Messages.GAME_END_WIN);
    }
});

eventEmitter.on(Messages.COLLISION_ENEMY_HERO, (_, { enemy }) => {
    enemy.dead = true;
    hero.decrementLife();
    if (isHeroDead())  {
      eventEmitter.emit(Messages.GAME_END_LOSS);
      return; // loss before victory
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
function handleKeyUp(evt) {
  switch (evt.key) {
    case 'ArrowUp':
      eventEmitter.emit(Messages.KEY_EVENT_UP);
      break;
    case 'ArrowDown':
      eventEmitter.emit(Messages.KEY_EVENT_DOWN);
      break;
    case 'ArrowLeft':
      eventEmitter.emit(Messages.KEY_EVENT_LEFT);
      break;
    case 'ArrowRight':
      eventEmitter.emit(Messages.KEY_EVENT_RIGHT);
      break;
    case 'Space':
      eventEmitter.emit(Messages.KEY_EVENT_SPACE);
      break;
    default:
      break;
  }
}

function handleKeyDown(evt) {
  if (evt.key === 'ArrowLeft') {
    eventEmitter.emit(Messages.HERO_MOVE_LEFT);
  }
}

function createEnemies() {
  const MONSTER_TOTAL = 10;
  const MONSTER_WIDTH = MONSTER_TOTAL * 98;
  const START_X = Math.random() * (canvas.width - MONSTER_WIDTH);

  for (let i = 0; i < MONSTER_TOTAL; i++) {
    const enemy = new Enemy(
      START_X + i * 98,  // i * 98를 추가하여 좀 더 균등한 간격으로 생성
      Math.random() * (canvas.height / 4)
    );
    enemy.img = enemyImg;
    gameObjects.push(enemy);
  }
}


function createHero() {
  hero = new Hero(canvas.width / 2 - 45, canvas.height - canvas.height / 4);
  hero.img = heroImg;
  gameObjects.push(hero);
}

function drawGameObjects() {
  gameObjects.forEach((go) => go.draw(ctx));
}

function drawLife() {
  // TODO, 35, 27
  const START_POS = canvas.width - 180;
  for(let i=0; i < hero.life; i++ ) {
    ctx.drawImage(
      lifeImg, 
      START_POS + (45 * (i+1) ), 
      canvas.height - 37);
  }
}

function drawPoints() {
  ctx.font = "30px Arial";
  ctx.fillStyle = "red";
  ctx.textAlign = "left";
  drawText("Points: " + hero.points, 10, canvas.height-20);
}

function drawText(message, x, y) {
  ctx.fillText(message, x, y);
}

function updateGameObjects() {
	const enemies = gameObjects.filter((go) => go.type === 'Enemy');
	const lasers = gameObjects.filter((go) => go.type === 'Laser');

	enemies.forEach((enemy) => {
		const heroRect = hero.rectFromGameObject();
		if (intersectRect(heroRect, enemy.rectFromGameObject())) {
			eventEmitter.emit(Messages.COLLISION_ENEMY_HERO, { enemy });
		}
	});
	// laser hit something
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

	gameObjects = gameObjects.filter((go) => !go.dead);
}

async function run() {
  await loadAssets();
  setupCanvas();
  initGame();
  runGameLoop();
  setupEventListeners();
}

function setupCanvas() {
  canvas = document.getElementById('canvas');

  // 이미지 로딩이 완료되지 않았을 때 대비
  if (!canvas) {
    console.error("Canvas 엘리먼트를 찾을 수 없습니다.");
    return;
  }

  ctx = canvas.getContext('2d');
}

function intersectRect(r1, r2) {
  return !(
    r2.left > r1.right ||
    r2.right < r1.left ||
    r2.top > r1.bottom ||
    r2.bottom < r1.top
  );
}
window.onload = async () => {
	canvas = document.getElementById('canvas');
	ctx = canvas.getContext('2d');
	heroImg = await loadTexture('assets/player.png');
	enemyImg = await loadTexture('assets/enemyShip.png');
	laserImg = await loadTexture('assets/laserRed.png');
	lifeImg = await loadTexture('assets/life.png');

	initGame();
	gameLoopId = setInterval(() => {
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		ctx.fillStyle = 'yellow';
		ctx.fillRect(0, 0, canvas.width, canvas.height);
		drawPoints();
		drawLife();
		updateGameObjects();
		drawGameObjects(ctx);
	}, 100);
};

run();