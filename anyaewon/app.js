let gameLoopId;
let energyLoopId;
let isSpace = false
let heroImg, 
    enemyImg, 
    laserImg,
    lifeImg,
    life, points,
    canvas, ctx, 
    gameObjects = [], 
    hero,
    eventEmitter 

let isCharge = false
let chargedTime = 0


    //======스페이스 바 누른 만큼 게이지 채우기========
    const gaugeWidth = 300; // 초기 게이지 너비
    const gaugeHeight = 20; // 게이지 높이
    const gaugeColor = "white"; // 게이지 색상
    const maxTime = 2000
    function drawGauge(ctx) {
      ctx.fillStyle = gaugeColor;
      ctx.fillRect(
        canvas.width / 2 - gaugeWidth / 2,
        canvas.height - gaugeHeight - 10,
        gaugeWidth,
        gaugeHeight
      );
      if(chargedTime >= maxTime) chargedTime = maxTime
      const chargedWidth = gaugeWidth * chargedTime / maxTime
      ctx.fillStyle = 'blue'
      ctx.fillRect(
        canvas.width / 2 - gaugeWidth / 2,
        canvas.height - gaugeHeight - 10,
        chargedWidth,
        gaugeHeight
      );
    }

//=================


//메시지 게시 클래스
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

eventEmitter = new EventEmitter();
    

//등장 요소들의 상위 클래스
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
    if(this.type === "Laser"){
      ctx.drawImage(this.img, this.x - this.width / 2 , this.y - this.height / 2, this.width, this.height);
      return 
    } 
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

//영웅(플레이어) 클래스
class Hero extends GameObject {
  constructor(x, y) {
    super(x,y);
    (this.width = 99), (this.height = 75);
    this.type = "Hero";
    this.speed = { x: 0, y: 0 };
    this.cooldown = 0;
    this.life = 3;
    this.points = 0;
    this.onKeyDown = null;
    this.onKeyUp = null;
    this.startTime = 0
    this.chargeLoopId = null
  }

  removeHero = () => {

  }
  fire = () => { 
      if(isSpace) return
      isSpace = true
      isCharge = true
      gameObjects.push(new Laser(this.x + 45, this.y - 10))
      // Start shooting when the space bar is pressed
    
    console.log("레이저 발사 fire 실행");
    this.startTime = new Date().getTime();
    this.chargeLoopId = setInterval(() => {
      chargedTime = new Date().getTime() - this.startTime
    }, 200)
  }

  fireUp = () => {
    if(!isSpace) return;
    isSpace = false;
    isCharge = false
    chargedTime = 0;
    clearInterval(this.chargeLoopId)
    this.chargeLoopId = null;

    // Calculate the duration of space bar press
    const duration = new Date().getTime() - this.startTime;
    console.log(`Space bar pressed for ${duration} milliseconds`);
    if(duration < 1000) return
    // Adjust the cooldown based on the duration
    this.cooldown = Math.max(0, 500 - duration);

    // Fire the laser if cooldown is still greater than 0

      if(energyLoopId) return
      let ct = 0
      energyLoopId = setInterval(() => {
        gameObjects.push(new Laser(this.x + 45, this.y - 10))
        ct++
        if(ct * 200 > duration) {
          clearInterval(energyLoopId)
          energyLoopId = null
        }
      }, 200)
    this.startTime = 0
  };

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

//적 클래스
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

//레이저 클래스
class Laser extends GameObject {
  constructor(x, y) {
    super(x,y);
    this.width = 50; 
    this.height = 50;
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


//이미지 로드 함수
async function loadTexture(path) {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = path;
    img.onload = () => {
      // image loaded and ready to be used
      resolve(img);
    }
  })
}

const Messages = {
  KEY_EVENT_UP: "KEY_EVENT_UP",
  KEY_EVENT_DOWN: "KEY_EVENT_DOWN",
  KEY_EVENT_LEFT: "KEY_EVENT_LEFT",
  KEY_EVENT_RIGHT: "KEY_EVENT_RIGHT",
  KEY_EVENT_SPACE: "KEY_EVENT_SPACE",
  KEY_EVENT_SPACE_UP: "KEY_EVENT_SPACE_UP",
  COLLISION_ENEMY_LASER: "COLLISION_ENEMY_LASER",
  COLLISION_ENEMY_HERO: "COLLISION_ENEMY_HERO",
  GAME_END_LOSS: "GAME_END_LOSS",
  GAME_END_WIN: "GAME_END_WIN",
  KEY_EVENT_ENTER: "KEY_EVENT_ENTER",
};



//게임 초기화 함수
function initGame() {
  gameObjects = [];
  createEnemies();
  createHero();
  
  eventEmitter.on(Messages.KEY_EVENT_UP, () => {
   hero.y -=5 ;
  })
  
  eventEmitter.on(Messages.KEY_EVENT_DOWN, () => {
   hero.y += 5;
  });
  
  eventEmitter.on(Messages.KEY_EVENT_LEFT, () => {
   hero.x -= 5;
  });
  
  eventEmitter.on(Messages.KEY_EVENT_RIGHT, () => {
   hero.x += 5;
  });

  eventEmitter.on(Messages.KEY_EVENT_SPACE, () => {
    console.log("레이저 발사");
    if (hero?.canFire())
      hero?.fire();
  });
  eventEmitter.on(Messages.KEY_EVENT_SPACE_UP, () => {
    console.log("레이저 발사 UP");
      hero?.fireUp();
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

//일정 간격으로 적을 이동시키는 함수
function createEnemies() {
  const MONSTER_TOTAL = 15;
  const MONSTER_WIDTH = MONSTER_TOTAL * 98;
  const START_X = (canvas.width - MONSTER_WIDTH) / 2;
  const STOP_X = START_X + MONSTER_WIDTH;
  const ENEMY_WIDTH = 98
  const ENEMY_HEIGHT = 50

  // for (let x = START_X; x < STOP_X; x += 98) {
  //   for (let y = 0; y < 50 * 5; y += 50) {
  //     const enemy = new Enemy(x, y);
  //     enemy.img = enemyImg;
  //     gameObjects.push(enemy);
  //   }
  // }

  for (let i = 0; i < MONSTER_TOTAL; i++) {
    const randomX = Math.random() * (canvas.width - ENEMY_WIDTH);
    const randomY = Math.random() * (canvas.height/2 -50);

    const enemy = new Enemy(randomX, randomY);  
    enemy.img = enemyImg;
    gameObjects.push(enemy);
  }
}

//영웅을 일정 간격 이동시키는 함수
function createHero() {
    if(hero){
      console.log(hero)
      hero.removeHero()
    }
    console.log(hero)

  console.log(gameObjects)

  hero = new Hero(
    canvas.width / 2 - 45,
    canvas.height - canvas.height / 4
  );
  hero.img = heroImg;
} 

//화면에 오브젝트를 그리는 함수
function drawGameObjects(ctx) {
  gameObjects.forEach(go => go.draw(ctx));
  hero.draw(ctx);
}

//충돌을 확인하는 함수
function intersectRect(r1, r2) {
  return !(
    r2.left > r1.right ||
    r2.right < r1.left ||
    r2.top > r1.bottom ||
    r2.bottom < r1.top
  );
}

//적군이 모두 파괴되면 화면에 메시지 출력하는 함수
function displayMessage(message, color = "red") {
  ctx.font = "30px Arial";
  ctx.fillStyle = color;
  ctx.textAlign = "center";
  ctx.fillText(message, canvas.width / 2, canvas.height / 2);
 }

 //게임 종료 시 사용할 함수
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

 //게임 리셋을 위한 함수
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
      if(isCharge) drawGauge(ctx)
    }, 100);
  }
 }


//충돌 처리 및 레이저에 대한 충돌 규칙 구현 함수
function updateGameObjects() {
  console.log("updateGame")
  const enemies = gameObjects.filter(go => go.type === 'Enemy');
  const lasers = gameObjects.filter((go) => go.type === "Laser");
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
  enemies.forEach((enemy, ind) => {
   const heroRect = hero.rectFromGameObject();
   if (intersectRect(heroRect, enemy.rectFromGameObject())) {
     eventEmitter.emit(Messages.COLLISION_ENEMY_HERO, { enemy });
   }
    // Check if enemy reaches the bottom of the canvas
    if (enemy.y + enemy.height >= canvas.height) {
    // Enemy reached the bottom, decrement player life
    eventEmitter.emit(Messages.COLLISION_ENEMY_HERO, { enemy });
  }
 })

  gameObjects = gameObjects.filter(go => !go.dead);
}  

//플레이어 생명을 관리하는 함수
function drawLife() {
  // TODO, 35, 27
  const START_POS = canvas.width - 250;
  var check = 0;

  for(let i=0; i < hero.life; i++ ) {
    ctx.drawImage(
      lifeImg, 
      START_POS + (45 * (i+1) ), 
      canvas.height - 110);
  }
}

//플레이어의 포인트를 관리하는 함수
function drawPoints() {
  ctx.font = "30px Arial";
  ctx.fillStyle = "red";
  ctx.textAlign = "left";
  drawText("Points: " + hero.points, 10, canvas.height-20);
}

//플레이어의 생명과 포인트를 표시하는 함수
function drawText(message, x, y) {
  ctx.fillText(message, x, y);
}

//플레이어 추적을 위한 함수
function isHeroDead() {
  return hero.life <= 0;
}

//적 추적을 위한 함수
function isEnemiesDead() {
  const enemies = gameObjects.filter((go) => go.type === "Enemy" && !go.dead);
  return enemies.length === 0;
}


(async function init(){
  window.onload = async () => {
    canvas = document.getElementById("gameCanvas");
    ctx = canvas.getContext("2d");
    heroImg = await loadTexture("assets/player3.jpg");
    enemyImg = await loadTexture("assets/enemy3.png");
    laserImg = await loadTexture("assets/ball.png");
    lifeImg = await loadTexture("assets/ohtani.jpg");
  
    initGame();
    gameLoopId = setInterval(() => { //게임루프 선언시 let 제거함
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "black";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      drawGameObjects(ctx);
      updateGameObjects();
      drawPoints();
      drawLife();
      if(isCharge) drawGauge(ctx)
    }, 100) 
  };

// 키 다운 이벤트 핸들러
let onKeyDown = function (e) {
  console.log(e.keyCode);
  switch (e.keyCode) {
      case 37: // 왼쪽 화살표
          hero.x -= 10;
          break;
      case 39: // 오른쪽 화살표
          hero.x += 10;
          break;
      case 38: // 위쪽 화살표
          hero.y -= 10;
          break;
      case 40: // 아래쪽 화살표
          hero.y += 10;
          break;
      default:
          break; // 다른 키는 무시
  }
  // 기본 동작 중지
  e.preventDefault();

};

window.addEventListener('keydown', onKeyDown);

window.addEventListener("keyup", (evt) => {
  if (evt.key === "ArrowUp") {
    eventEmitter.emit(Messages.KEY_EVENT_UP);
  } else if (evt.key === "ArrowDown") {
    eventEmitter.emit(Messages.KEY_EVENT_DOWN);
  } else if (evt.key === "ArrowLeft") {
    eventEmitter.emit(Messages.KEY_EVENT_LEFT);
  } else if (evt.key === "ArrowRight") {
    eventEmitter.emit(Messages.KEY_EVENT_RIGHT);
  } else if(evt.key === " ") {
    eventEmitter.emit(Messages.KEY_EVENT_SPACE_UP);
  } else if(evt.key === "Enter") {
    eventEmitter.emit(Messages.KEY_EVENT_ENTER);
  }
});
})();
window.addEventListener("keydown", (evt) => {
  if(evt.key === " ") {
    eventEmitter.emit(Messages.KEY_EVENT_SPACE)
    }
})