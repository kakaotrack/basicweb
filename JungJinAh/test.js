User;

const Messages = {
  MONSTER_OUT_OF_BOUNDS: "MONSTER_OUT_OF_BOUNDS",
  HERO_SPEED_LEFT: "HERO_MOVING_LEFT",
  HERO_SPEED_RIGHT: "HERO_MOVING_RIGHT",
  HERO_SPEED_ZERO: "HERO_SPEED_ZERO",
  HERO_FIRE: "HERO_FIRE",
  GAME_END_LOSS: "GAME_END_LOSS",
  GAME_END_WIN: "GAME_END_WIN",
  COLLISION_MONSTER_LASER: "COLLISION_MONSTER_LASER",
  COLLISION_MONSTER_HERO: "COLLISION_MONSTER_HERO",
  KEY_EVENT_UP: "KEY_EVENT_UP",
  KEY_EVENT_DOWN: "KEY_EVENT_DOWN",
  KEY_EVENT_LEFT: "KEY_EVENT_LEFT",
  KEY_EVENT_RIGHT: "KEY_EVENT_RIGHT",
  GAME_START: "GAME_START",
};

class Game {
  constructor() {
    this.points = 0;
    this.life = 3;
    this.end = false;
    this.ready = false;

    eventEmitter.on(Messages.MONSTER_OUT_OF_BOUNDS, () => {
      hero.dead = true;
    });
    eventEmitter.on(Messages.HERO_SPEED_LEFT, () => {
      hero.speed.x = -10;
      hero.img = heroImgLeft;
    });
    eventEmitter.on(Messages.HERO_SPEED_RIGHT, () => {
      hero.speed.x = 10;
      hero.img = heroImgRight;
    });
    eventEmitter.on(Messages.HERO_SPEED_ZERO, () => {
      hero.speed = { x: 0, y: 0 };
      if (game.life === 3) {
        hero.img = heroImg;
      } else {
        hero.img = heroImgDamaged;
      }
    });
    eventEmitter.on(Messages.HERO_FIRE, () => {
      if (coolDown === 0) {
        let l = new Laser(hero.x + 45, hero.y - 30);
        l.img = laserRedImg;
        gameObjects.push(l);
        cooling();
      }
    });
    eventEmitter.on(Messages.GAME_END_LOSS, (_, gameLoopId) => {
      game.end = true;
      displayMessage(
        "You died... - Press [Enter] to start the game Captain Pew Pew"
      );
      clearInterval(gameLoopId);
    });

    eventEmitter.on(Messages.GAME_END_WIN, (_, gameLoopId) => {
      game.end = true;
      displayMessage(
        "Victory!!! Pew Pew... - Press [Enter] to start a new game Captain Pew Pew",
        "green"
      );
      clearInterval(gameLoopId);
    });
    eventEmitter.on(
      Messages.COLLISION_MONSTER_LASER,
      (_, { first: laser, second: monster }) => {
        laser.dead = true;
        monster.dead = true;
        this.points += 100;

        gameObjects.push(new Explosion(monster.x, monster.y, laserRedShot));
      }
    );
    eventEmitter.on(
      Messages.COLLISION_MONSTER_HERO,
      (_, { monster: m, id }) => {
        game.life--;
        if (game.life === 0) {
          hero.dead = true;
          eventEmitter.emit(Messages.GAME_END_LOSS, id);
          gameObjects.push(new Explosion(hero.x, hero.y, laserGreenShot));
        }
        hero.img = heroImgDamaged;
        m.dead = true;
        gameObjects.push(new Explosion(m.x, m.y, laserRedShot));
      }
    );
    eventEmitter.on(Messages.KEY_EVENT_UP, () => {
      hero.y = hero.y > 0 ? hero.y - 5 : hero.y;
    });
    eventEmitter.on(Messages.KEY_EVENT_DOWN, () => {
      hero.y = hero.y < HEIGHT ? hero.y + 5 : hero.y;
    });
    eventEmitter.on(Messages.KEY_EVENT_LEFT, () => {
      hero.x = hero.x > 0 ? hero.x - 10 : hero.x;
    });
    eventEmitter.on(Messages.KEY_EVENT_RIGHT, () => {
      hero.x = hero.x < WIDTH ? hero.x + 10 : hero.x;
    });
    eventEmitter.on(Messages.GAME_START, () => {
      if (game.ready && game.end) {
        // assets loaded
        runGame();
      }
    });
  }
}

const eventEmitter = new EventEmitter();
const hero = new Hero(0, 0);
const WIDTH = 1024;
const HEIGHT = 768;
let gameObjects = [];
let laserRedImg;
let laserRedShot;
let laserGreenShot;
let canvas;
let ctx;
let heroImg;
let heroImgLeft;
let heroImgRight;
let heroImgDamaged;
let lifeImg;
let monsterImg;

let coolDown = 0;

const game = new Game();

function loadTexture(path) {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = path;
    img.onload = () => {
      resolve(img);
    };
  });
}

function rectFromGameObject(go) {
  return {
    top: go.y,
    left: go.x,
    bottom: go.y + go.height,
    right: go.x + go.width,
  };
}

function intersectRect(r1, r2) {
  return !(
    r2.left > r1.right ||
    r2.right < r1.left ||
    r2.top > r1.bottom ||
    r2.bottom < r1.top
  );
}

function draw(ctx, objects) {
  objects.forEach((obj) => {
    obj.draw(ctx);
  });
}

let onKeyDown = function (e) {
  console.log(e.keyCode);
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

window.addEventListener("keydown", onKeyDown);
window.addEventListener("keydown", (e) => {
  switch (e.keyCode) {
    case 37:
      // if left
      eventEmitter.emit(Messages.HERO_SPEED_LEFT);
      break;
    case 39:
      eventEmitter.emit(Messages.HERO_SPEED_RIGHT);
      break;
  }
});

// TODO make message driven
window.addEventListener("keyup", (evt) => {
  eventEmitter.emit(Messages.HERO_SPEED_ZERO);
  if (evt.key === "ArrowUp") {
    eventEmitter.emit(Messages.KEY_EVENT_UP);
  } else if (evt.key === "ArrowDown") {
    eventEmitter.emit(Messages.KEY_EVENT_DOWN);
  } else if (evt.key === "ArrowLeft") {
    eventEmitter.emit(Messages.KEY_EVENT_LEFT);
  } else if (evt.key === "ArrowRight") {
    eventEmitter.emit(Messages.KEY_EVENT_RIGHT);
  } else if (evt.keyCode === 32) {
    // space
    eventEmitter.emit(Messages.HERO_FIRE);
  } else if (evt.key === "Enter") {
    eventEmitter.emit(Messages.GAME_START);
  }
});
