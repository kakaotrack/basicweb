/* --------구조체 설계----------*/

//오브젝트 구조체
class GameObject {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.type = "";
    this.dead = false;
    this.img = undefined;
  }
  //이동
  moveTo(x, y) {
    this.x = this.x+ x;
    this.y = this.y+ y;
  }
  //그리기
  draw(){
    if(this.dead == false){
      ctx.drawImage(this.img,this.x,this.y);
    }
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



class Player extends GameObject {
  constructor(x,y) {
    super(x,y);
    this.type = "Player";
    this.img = PlayerImg;
    this.height = this.img.height;
    this.width = this.img.width;
    this.speed = 10;
    this.cooldown = 0;
    this.life = 3;
    this.point = 0;
  }
  fire() {
    lasers.push(new Laser(this.x + 45, this.y - 10));
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
    this.point += 1;
  }
}

class Enemy extends GameObject {
  constructor(x,y) {
    super(x,y);
    this.img = EnemyImg;
    (this.width = 98), (this.height = 50);
    this.type = "Enemy";
    let id = setInterval(() => {
      if (this.y < canvas.height - this.height) {
        this.y += 5;
      } else {
        console.log('Stopped at', this.y)
        this.dead = true;
        player.decrementLife();
        clearInterval(id);
      }
    }, 300);
  }
} 

class Laser extends GameObject {
  constructor(x, y) {
    super(x,y);
    (this.width = 9), (this.height = 33);
    this.type = 'Laser';
    this.img = LaserImg;
    let id = setInterval(() => {
      if (this.y > 0) {
        this.y -= 15;
      } else {
        this.dead = true;
        clearInterval(id);
      }
    }, 100);
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


/* 기타 */
const Messages = {
  KEY_EVENT_UP: "KEY_EVENT_UP",
  KEY_EVENT_DOWN: "KEY_EVENT_DOWN",
  KEY_EVENT_LEFT: "KEY_EVENT_LEFT",
  KEY_EVENT_RIGHT: "KEY_EVENT_RIGHT",
  KEY_EVENT_ENTER: "KEY_EVENT_ENTER",
  KEY_EVENT_SPACE: "PLAYER_FIRE",
  COLLISION_ENEMY_LASER: "COLLISION_ENEMY_LASER",
  COLLISION_ENEMY_PLAYER: "COLLISION_ENEMY_PLAYER",
  GAME_END_LOSS: "GAME_END_LOSS",
  GAME_END_WIN: "GAME_END_WIN",
};
let PlayerImg, 
    EnemyImg, 
    LaserImg,
    lifeImg,
    KillMarkImg,
    PointImg,
    BackgroundImg,
    canvas,
    ctx, 
    player,
    enemys = [], 
    lasers = [],
    eventEmitter = new EventEmitter();


var gameLoopId;

let onKeyDown = function (e) {
  console.log(e.keyCode);
  switch (e.keyCode) {
    case 37:eventEmitter.emit(Messages.KEY_EVENT_LEFT);
      e.preventDefault();
      break;
    case 39:eventEmitter.emit(Messages.KEY_EVENT_RIGHT);
      e.preventDefault();
      break;
    case 38:eventEmitter.emit(Messages.KEY_EVENT_UP);
      e.preventDefault();
      break;
    case 40:eventEmitter.emit(Messages.KEY_EVENT_DOWN);
      e.preventDefault();
      break;
    case 32:eventEmitter.emit(Messages.PLAYER_FIRE);
      e.preventDefault();
      break; // Space
    default:
      break; // do not block other keys
  }
};

window.addEventListener("keydown", onKeyDown);

window.addEventListener('keyup', (evt) => {
	if (evt.key === 'ArrowUp') {
		eventEmitter.emit(Messages.KEY_EVENT_UP);
	} else if (evt.key === 'ArrowDown') {
		eventEmitter.emit(Messages.KEY_EVENT_DOWN);
	} else if (evt.key === 'ArrowLeft') {
		eventEmitter.emit(Messages.KEY_EVENT_LEFT);
	} else if (evt.key === 'ArrowRight') {
		eventEmitter.emit(Messages.KEY_EVENT_RIGHT);
	} else if (evt.key === 'Spacebar') {// space
		eventEmitter.emit(Messages.PLAYER_FIRE);
	} else if(evt.key === "Enter") {
    eventEmitter.emit(Messages.KEY_EVENT_ENTER);
  }
});



async function loadTexture(path) {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = path;
    img.onload = () => {
      resolve(img);
    }
    img.onerror = () =>{
    }
  });
}

//플레이어 기본
function createPlayer(){
  delete player;
  player = new Player(canvas.width / 2 - 45, canvas.height - canvas.height / 4, PlayerImg);
}
//적 기본
function createEnemies(){
  delete enemys;
  const MONSTER_TOTAL = 5;
  const MONSTER_WIDTH = MONSTER_TOTAL * 98;
  const START_X = (canvas.width - MONSTER_WIDTH) / 2;
  const STOP_X = START_X + MONSTER_WIDTH;
  for (let x = START_X; x < STOP_X; x += 98) {
    for (let y = 0; y < 50 * 5; y += 50) {
      const enemy = new Enemy(x, y, EnemyImg ,canvas);
      enemys.push(enemy);
    }
  }
}
function drawLife() {
  // TODO, 35, 27
  const START_POS = canvas.width - 180;
  for(let i=0; i < player.life; i++ ) {
    ctx.drawImage(
      lifeImg, 
      START_POS + (45 * (i+1) ), 
      canvas.height - 37);
  }
}

function drawPoints() {
  ctx.drawImage(KillMarkImg, (20), (canvas.height - 50), 50, 50);
  for(let i=0; i < player.point; i++ ) {
    console.log(player.point);
    var a = i%10;
    var b = Math.floor(i/10);
    ctx.drawImage(
      PointImg, 
      (70 + 25*a), (canvas.height-25 -b*25), 20, 20);
  }
}

function drawGameObjects(ctx) {
  player.draw(ctx);
  enemys.forEach(go => go.draw(ctx));
  lasers.forEach(go => go.draw(ctx));
  drawPoints();
  drawLife();
}
function rectFromGameObject(go) {
	return {
		top: go.y,
		left: go.x,
		bottom: go.y + go.height,
		right: go.x + go.width,
	};
}

function isPlayerDead() {
  return player.dead===true;
}

function isEnemiesDead() {
  return enemys.length === 0;
}

function intersectRect(r1, r2) {
  return !(
    r2.left > r1.right ||
    r2.right < r1.left ||
    r2.top > r1.bottom ||
    r2.bottom < r1.top
  );
}
function updateGameObjects() {
// laser hit something
  lasers.forEach((l) => {
    enemys.forEach((m) => {
      if (intersectRect(l.rectFromGameObject(), m.rectFromGameObject())) {
      eventEmitter.emit(Messages.COLLISION_ENEMY_LASER, {
        first: l,
        second: m,
      });
    }
   });
});
  enemys = enemys.filter(go => !go.dead);
  lasers = lasers.filter(go => !go.dead);
  enemys.forEach((m)=> {
    if (intersectRect(player.rectFromGameObject(), m.rectFromGameObject())) {
      eventEmitter.emit(Messages.COLLISION_ENEMY_PLAYER, m);
    }
  });
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
function resetGame() {
  if (gameLoopId) {
    clearInterval(gameLoopId);
    eventEmitter.clear();
    enemys.splice(0, enemys.length);
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
function initGame() {
  
  createEnemies();
  createPlayer();
  eventEmitter.on(Messages.KEY_EVENT_UP, () => {
    player.moveTo(0,-10);
  });
    
  eventEmitter.on(Messages.KEY_EVENT_DOWN, () => {
    player.moveTo(0,10);
  });
    
  eventEmitter.on(Messages.KEY_EVENT_LEFT, () => {
    player.moveTo(-10,0);
  });
  
  eventEmitter.on(Messages.KEY_EVENT_RIGHT, () => {
    player.moveTo(10,0);
  });

  eventEmitter.on(Messages.PLAYER_FIRE, () => {
    if (player.canFire()) {
      player.fire();
    }
  });
  eventEmitter.on(Messages.COLLISION_ENEMY_LASER, (_, { first, second }) => {
    first.dead = true;
    second.dead = true;
    player.incrementPoints();

    if (isEnemiesDead()) {
      eventEmitter.emit(Messages.GAME_END_WIN);
    }
  });
  eventEmitter.on(Messages.COLLISION_ENEMY_PLAYER, (_, m) => {
    player.decrementLife();
    m.dead = true;
    if(isPlayerDead()){
      eventEmitter.emit(Messages.GAME_END_LOSS);
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




/*----------시작----------*/
window.onload = async () => {
  canvas = document.getElementById("myCanvas");
  ctx = canvas.getContext("2d");
  // 캔버스에 검은색 채우기
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  PlayerImg = await loadTexture('assets/player.png');
  EnemyImg = await loadTexture('assets/enemyShip.png');
  LaserImg = await loadTexture('assets/laserRed.png');
  lifeImg = await loadTexture('assets/life.png');
  KillMarkImg = await loadTexture('assets/mark.png');
  PointImg = await loadTexture('assets/star.png');
  initGame();

  gameLoopId = setInterval(() => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    updateGameObjects();
    drawGameObjects(ctx);
  }, 100);
  
};