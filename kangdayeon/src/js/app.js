let canvas = null

//2. set the context to 2D to draw basic shapes
let ctx = null
let gameLoopId = null;
let moveInterval = null;
let keyState = {};

const HERO_W = 200;
const HERO_H = 200;

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



// ******** CLASS *********

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
    this.type = "hero";
    this.speed = { x: 400, y: 400};
    this.cooldown = 0;
    this.life = 3;
    this.points = 0;
    this.laserColors = ["PinkLaser", "BlueLaser", "Laser"];
    this.currentLaserColorIndex = 0;
  }

  fire() {
    if (this.canFire()) {
      const laserColor = this.laserColors[this.currentLaserColorIndex];
      gameObjects.push(new Laser(this.x + 15, this.y - HERO_H + 50, laserColor));
      this.currentLaserColorIndex = (this.currentLaserColorIndex + 1) % this.laserColors.length;
      this.cooldown = 500;

      let id = setInterval(() => {
        if (this.cooldown > 0) {
          this.cooldown -= 100;
        } else {
          clearInterval(id);
        }
      }, 200);
    }
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
    this.speed = 8.0; // Set the speed to 2.0
    let id = setInterval(() => {
      if (this.y < canvas.height - this.height) {
        this.y += this.speed;
      } else {
        console.log('Stopped at', this.y)
        clearInterval(id);
      }
    }, 300);
  }
}

class Laser extends GameObject {
  constructor(x, y, color) {
    super(x, y);
    this.width = 70;
    this.height = 200;
    this.type = color;
    this.img = getLaserImg(color);
    let id = setInterval(() => {
      if (this.y > 0) {
        this.y -= 30;
      } else {
        this.dead = true;
        clearInterval(id);
      }
    }, 100);
  }
}

class BlueLaser extends Laser{
  constructor(x,y){
    super(x,y);
    (this.width=70), (this.height =200);
    this.type='BlueLaser';
    this.img = blueLaserImg;
    let id = setInterval(() => {
      if (this.y > 0) {
        this.y -= 30;
      } else {
        this.dead = true;
        clearInterval(id);
      }
    }, 100)
  }
}

class PinkLaser extends Laser{
  constructor(x,y){
    super(x,y);
    (this.width=70), (this.height =200);
    this.type = 'PinkLaser';
    this.img = pinkLaserImg;
    let id = setInterval(() => {
      if (this.y > 0) {
        this.y -= 30;
      } else {
        this.dead = true;
        clearInterval(id);
      }
    }, 100)
  }
}

// ******** Event Emitter Class ********
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

let heroImg, 
    enemyImg, 
    laserImg,
    lifeImg,
    blueLaserImg,
    pinkLaserImg,
    gameObjects = [], 
    hero, 
    eventEmitter = new EventEmitter();


// draws a red rectangle
//1. get the canvas reference

//3. fill it with the color red

//4. and draw a rectangle with these parameters, setting location and size

/*const img = new Image();
img.src = 'C:\Users\강다연\work\assets\enemyShip.png';
img.onload = () => {
  // image loaded and ready to be used
}
*/
function loadAsset(path) {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = path;
      img.onload = () => {
        // image loaded and ready to be used
        resolve(img);
      }
    })
  }

  function createEnemies() {
    const NUM_ENEMIES = 25;
    const enemyWidth = 98;
    const enemyHeight = 50;
    const enemyMargin = 10;
  
    for (let i = 0; i < NUM_ENEMIES; i++) {
      let validPosition = false;
      let enemyX, enemyY;
  
      // Keep generating positions until a valid one is found
      while (!validPosition) {
        enemyX = Math.random() * (canvas.width - enemyWidth);
        enemyY = Math.random() * -canvas.height;
  
        // Check for overlap with existing enemies
        const overlap = gameObjects.some((go) => {
          if (go.type === "Enemy") {
            const rect1 = { left: enemyX, top: enemyY, right: enemyX + enemyWidth, bottom: enemyY + enemyHeight };
            const rect2 = go.rectFromGameObject();
            return intersectRect(rect1, rect2);
          }
          return false;
        });
  
        // If no overlap, set validPosition to true
        if (!overlap) {
          validPosition = true;
        }
      }
  
      const enemy = new Enemy(enemyX, enemyY);
      enemy.img = enemyImg;
      gameObjects.push(enemy);
    }
  }


  function createHero() {
    hero = new Hero(
      canvas.width / 2 - 45,
      canvas.height - canvas.height / 4
    );
    hero.img = heroImg;
    gameObjects.push(hero);
  }

  function drawGameObjects(ctx) {
    gameObjects.forEach(go => go.draw(ctx));
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
  const enemies = gameObjects.filter(go => go.type === 'Enemy');
  const lasers = gameObjects.filter((go) => go.type === "Laser");
  const bluelasers = gameObjects.filter((go) => go.type === "BlueLaser");
  const pinklasers = gameObjects.filter((go) => go.type ==="PinkLaser");
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
  gameObjects = gameObjects.filter(go => !go.dead);

bluelasers.forEach((l) => {
  enemies.forEach((m) => {
    if (intersectRect(l.rectFromGameObject(), m.rectFromGameObject())) {
    eventEmitter.emit(Messages.COLLISION_ENEMY_LASER, {
      first: l,
      second: m,
    });
  }
});
});
  gameObjects = gameObjects.filter(go => !go.dead);

pinklasers.forEach((l) => {
  enemies.forEach((m) => {
    if (intersectRect(l.rectFromGameObject(), m.rectFromGameObject())) {
    eventEmitter.emit(Messages.COLLISION_ENEMY_LASER, {
      first: l,
      second: m,
    });
  }
});
});
  gameObjects = gameObjects.filter(go => !go.dead);
  enemies.forEach(enemy => {
    const heroRect = hero.rectFromGameObject();
    if (intersectRect(heroRect, enemy.rectFromGameObject())) {
      eventEmitter.emit(Messages.COLLISION_ENEMY_HERO, { enemy });
    }
  })
}
 
function drawLife() {
  // TODO, 35, 27
  const START_POS = canvas.width - 300;
  for(let i=0; i < hero.life; i++ ) {
    ctx.drawImage(
      lifeImg, 
      START_POS + (45 * (i+1) ), 
      canvas.height - 100);
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

function isHeroDead() {
  return hero.life <= 0;
}

function isEnemiesDead() {
  const enemies = gameObjects.filter((go) => go.type === "Enemy" && !go.dead);
  return enemies.length === 0;
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
 function getLaserImg(color) {
  switch (color) {
    case "BlueLaser":
      return blueLaserImg;
    case "PinkLaser":
      return pinkLaserImg;
    case "Laser":
    default:
      return laserImg;
  }
}
 
function isKeyDown(keyCode) {
  return keyState[keyCode] === true;
}
  //  use like so
  // (async function run () {
  //   let c = 100;
  //   const heroImg = await loadAsset('img/player.png')
  //   const monsterImg = await loadAsset('img/enemyShip.png')
  //   ctx.fillRect(0,0, 1400, 700) // x,y,width, height
  //   ctx.drawImage(heroImg, canvas.width/2 - HERO_W/2,canvas.height-HERO_H, HERO_W, HERO_H);
  //   for (let x = START_X; x < STOP_X; x += 98) {
  //     for (let y = 0; y < 50 * 5; y += 50) {
  //       ctx.drawImage(monsterImg, x, y);
  //     }
  //   }
  // })();

// ***** INIT Game **************
  function initGame() {
    gameObjects = [];
    createEnemies();
    createHero();
    
    eventEmitter.on(Messages.KEY_EVENT_UP, () => {
     hero.y -=10 ;
    })
    
    eventEmitter.on(Messages.KEY_EVENT_DOWN, () => {
     hero.y += 10;
    });
    
    eventEmitter.on(Messages.KEY_EVENT_LEFT, () => {
     hero.x -= 10;
    });
    
    eventEmitter.on(Messages.KEY_EVENT_RIGHT, () => {
     hero.x += 10;
    });

    eventEmitter.on(Messages.KEY_EVENT_SPACE, () => {
      if (hero.canFire()) 
      {
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

let onKeyDown = function (e) {
  console.log(e.keyCode);
  keyState[e.keyCode] = true;

  switch (e.keyCode) {
    case 37: // Left arrow
      e.preventDefault(); // Prevent default behavior
      hero.moveLeft();
      break;
    case 39: // Right arrow
      e.preventDefault(); // Prevent default behavior
      hero.moveRight();
      break;
    case 38: // Up arrow
      e.preventDefault(); // Prevent default behavior
      hero.y -= 10;
      break;
    case 40: // Down arrow
      e.preventDefault(); // Prevent default behavior
      hero.y += 10;
      break;
    case 32: // Space
      e.preventDefault(); // Prevent default behavior
      eventEmitter.emit(Messages.KEY_EVENT_SPACE);
      break;
    case 13: // Enter
      e.preventDefault(); // Prevent default behavior
      eventEmitter.emit(Messages.KEY_EVENT_ENTER);
      break;
    default:
      break; // do not block other keys
  }

  // Update the camera position based on the hero's x-coordinate
  cameraX = hero.x - canvas.width / 2;
};

let onKeyUp = function (e) {
  keyState[e.keyCode] = false;

};


window.addEventListener("keydown", onKeyDown);
window.addEventListener("keyup", onKeyUp);

window.addEventListener("keydown", (evt) => {
  if (evt.key === "ArrowUp") {
    eventEmitter.emit(Messages.KEY_EVENT_UP);
  } else if (evt.key === "ArrowDown") {
    eventEmitter.emit(Messages.KEY_EVENT_DOWN);
  } else if (evt.key === "ArrowLeft") {
    eventEmitter.emit(Messages.KEY_EVENT_LEFT);
  } else if (evt.key === "ArrowRight") {
    eventEmitter.emit(Messages.KEY_EVENT_RIGHT);
  } else if(evt.keyCode === 32) {
    eventEmitter.emit(Messages.KEY_EVENT_SPACE);
  }
  else if(evt.key === "Enter") {
    eventEmitter.emit(Messages.KEY_EVENT_ENTER);
  }
  
});

window.addEventListener("keyup", (evt) => {
  if (evt.key === "ArrowUp") {
    eventEmitter.emit(Messages.KEY_EVENT_UP);
  } else if (evt.key === "ArrowDown") {
    eventEmitter.emit(Messages.KEY_EVENT_DOWN);
  } else if (evt.key === "ArrowLeft") {
    eventEmitter.emit(Messages.KEY_EVENT_LEFT);
  } else if (evt.key === "ArrowRight") {
    eventEmitter.emit(Messages.KEY_EVENT_RIGHT);
  } else if(evt.keyCode === 32) {
    eventEmitter.emit(Messages.KEY_EVENT_SPACE);
  }
  else if(evt.key === "Enter") {
    eventEmitter.emit(Messages.KEY_EVENT_ENTER);
  }
});



window.onload = async () => {
  canvas = document.getElementById("myCanvas");
  ctx = canvas.getContext("2d");
  heroImg = await loadAsset("img/player.png");
  enemyImg = await loadAsset("img/enemyShip.png");
  laserImg = await loadAsset("img/laser.png")
  lifeImg = await loadAsset("img/life.png");
  blueLaserImg = await loadAsset("img/blueLaser.png");
  pinkLaserImg = await loadAsset("img/pinkLaser.png");

  initGame();
  
  gameLoopId = setInterval(() => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  
    if (isKeyDown(37)) {
      // 왼쪽 화살표
      hero.x -= 20;
    }
  
    if (isKeyDown(39)) {
      // 오른쪽 화살표
      hero.x += 20;
    }
  
    if (isKeyDown(38)) {
      // 위쪽 화살표
      hero.y -= 20;
    }
  
    if (isKeyDown(40)) {
      // 아래쪽 화살표
      hero.y += 20;
    }
  
    drawGameObjects(ctx);
    updateGameObjects();
    drawPoints();
    drawLife();
  }, 100);
  
  
};