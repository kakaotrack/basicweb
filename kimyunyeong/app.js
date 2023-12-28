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


let isGameOver = false; // 게임 오버 상태를 저장하는 변수
let houseImages = []; // 집 이미지 배열


// 집 이미지 로드 함수
async function loadHouseImages() {
  try {
    for (let i = 1; i <= 8; i++) {
      const houseImage = await loadTexture(`assets/house${i}.png`);
      houseImages.push(houseImage);
      console.log(`House image ${i} loaded successfully.`);
    }
  } catch (error) {
    console.error('Error loading house images:', error);
  }
}


// 선물 이미지 로드 함수
async function loadGiftImage() {
  try {
    const giftImage = await loadTexture("assets/present2.png");
    console.log("Gift image loaded successfully.");
    return giftImage;
  } catch (error) {
    console.error('Error loading gift image:', error);
  }
}

// 글리터 이미지 로드 함수
async function loadGlitterImage() {
  try {
    const glitterImage = await loadTexture("assets/glitter.png");
    console.log("Glitter image loaded successfully.");
    return glitterImage;
  } catch (error) {
    console.error('Error loading glitter image:', error);
  }
}

async function loadLaserImage() {
  try {
    const laserImage = await loadTexture("assets/laser.png");
    console.log("Laser image loaded successfully.");
    return laserImage;
  } catch (error) {
    console.error('Error loading laser image:', error);
  }
}

/// 집 객체 클래스
class House extends GameObject {
  constructor(x, y, img) {
    super(x, y);
    this.width = 80;
    this.height = 80;
    this.type = "House";
    this.img = img;
    this.speed = 1;
    this.growthRate = 0.08; // 크기 증가 속도
  }

  move() {
    this.y += this.speed; // 아래로 이동
    this.width += this.growthRate; // 가로 크기 증가
    this.height += this.growthRate; // 세로 크기 증가
  }
}

// 트리 객체 클래스
class Tree extends GameObject {
  constructor(x, y, img) {
    super(x, y);
    this.width = 80;
    this.height = 80;
    this.type = "Tree";
    this.img = img;
    this.speed = 1;
    this.growthRate = 0.08; // 크기 증가 속도
  }

  move() {
    this.y += this.speed; // 아래로 이동
    this.width += this.growthRate; // 가로 크기 증가
    this.height += this.growthRate; // 세로 크기 증가
  }
}


// 주인공 클래스
class Hero extends GameObject {
  constructor(x, y) {
    super(x, y);
    this.width = 100;
    this.height = 200;
    this.type = "Hero";
    this.speed = 10;
  }
}


// 적 클래스
class Enemy extends GameObject {
  constructor(x, y) {
    super(x, y);
    this.width = 80;
    this.height = 80;
    this.type = "Enemy";
    this.speed = 1.5; // 적의 이동 속도
  }
  move() {
    this.y += this.speed; // 적을 아래로 이동
  }
}


class AttackLaser extends GameObject {
  constructor(x, y) {
    super(x, y);
    this.width = 25; 
    this.height = 50;
    this.type = "AttackLaser";
    this.speed = 7; // 필요에 따라 속도 조절
  }
  move() {
    this.y += this.speed; // "attack" 레이저를 아래로 이동
  }
}


// 선물 객체 클래스
class Gift extends GameObject {
  constructor(x, y, img) {
    super(x, y);
    this.width = 50;
    this.height = 50;
    this.type = "Gift";
    this.img = img;
    this.speed = 3;
  }
  move() {
    this.y -= this.speed; // 위로 이동
  }
}


// 선물 객체 클래스
class Laser extends GameObject {
  constructor(x, y, img) {
    super(x, y);
    this.width = 25;
    this.height = 60;
    this.type = "Laser";
    this.img = img;
    this.speed = 3;
  }
  move() {
    this.y -= this.speed; // 위로 이동
  }
}

// 글리터 객체 클래스
class Glitter extends GameObject {
  constructor(x, y, img) {
    super(x, y);
    this.width = 80;
    this.height = 80;
    this.type = "Glitter";
    this.img = img;
    this.duration = 1200; // 글리터가 보여질 시간 (밀리초)
    this.createdAt = Date.now(); // 글리터가 생성된 시간
  } 
  draw(ctx) {
    // 현재 시간이 글리터가 생성된 시간과 duration을 더한 시간보다 작으면 글리터를 그린다
    if (Date.now() - this.createdAt < this.duration) {
      ctx.drawImage(this.img, this.x, this.y, this.width, this.height);
    }
  }
}

let canvas, ctx, heroImg, laserImg, giftImg, enemyImg, treeImage, hero, gameObjects = [];

canvas = document.getElementById("canvas");
ctx = canvas.getContext("2d");

// 이미지 로드 함수
async function initGameObjects() {
  heroImg = await loadTexture("assets/player.png");
  enemyImg = await loadTexture("assets/enemyShip.png");
  laserImg = await loadTexture("assets/laser.png");
  attackLaserImg = await loadTexture("assets/attack.png"); 
  snowhill = await loadTexture("assets/snowhill.png"); 
  giftImg = await loadTexture("assets/present1.png"); 
  glitterImg = await loadTexture("assets/glitter.png"); 
  treeImage = await loadTexture("assets/tree.png"); 
}


// 객체들을 그리는 함수
function drawGameObjects(ctx) {
  ctx.drawImage(snowhill, -200 , 100, 1000, 600);
  ctx.drawImage(snowhill, 150 , 100, 1000, 600);
  ctx.drawImage(snowhill, 400 , 100, 1000, 600);


  ctx.drawImage(snowhill, -150 , 400, 600, 450);
  ctx.drawImage(snowhill, 150 , 400, 800, 450);
  ctx.drawImage(snowhill, 350 , 400, 1000, 450);


  // 트리 객체 그리기
  const treeObjects = gameObjects.filter(go => go instanceof Tree);
  treeObjects.forEach(go => go.draw(ctx)); 

  // 집 객체 그리기
  const houseObjects = gameObjects.filter(go => go instanceof House);
  houseObjects.forEach(go => go.draw(ctx));

  // 집을 제외한 객체들 그리기
  const otherObjects = gameObjects.filter(go => !(go instanceof House) && !(go instanceof Tree));
  otherObjects.forEach(go => go.draw(ctx));
}

// 키 이벤트 메시지 정의
const Messages = {
  KEY_EVENT_UP: "KEY_EVENT_UP",
  KEY_EVENT_DOWN: "KEY_EVENT_DOWN",
  KEY_EVENT_LEFT: "KEY_EVENT_LEFT",
  KEY_EVENT_RIGHT: "KEY_EVENT_RIGHT",
  KEY_EVENT_SPACE: "KEY_EVENT_SPACE",
  KEY_EVENT_Z: "KEY_EVENT_Z",
  KEY_EVENT_X: "KEY_EVENT_X",
};


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

const LaserEventEmitter = new EventEmitter();
const GiftEventEmitter = new EventEmitter();

// 키 이벤트 처리
window.addEventListener("keydown", (event) => {
  if (event.key.toLowerCase() === "z") {
    LaserEventEmitter.emit(Messages.KEY_EVENT_Z);
  } else if (event.key.toLowerCase() === "x") {
    GiftEventEmitter.emit(Messages.KEY_EVENT_X); // GiftEventEmitter에도 스페이스바 이벤트 전달
  }
});


function handleShooting() {
  LaserEventEmitter.on(Messages.KEY_EVENT_Z, () => {
    console.log('Gift shooting event received.'); // 디버깅을 위한 로그
    const gift = new Gift(hero.x + hero.width / 2 - 15, hero.y - 100, giftImg);
    gameObjects.push(gift);
  });

  GiftEventEmitter.on(Messages.KEY_EVENT_X, () => {
    console.log('Laser shooting event received.'); // 디버깅을 위한 로그
    const laser = new Laser(hero.x + hero.width / 2 - 15, hero.y - 100, laserImg);
    laser.dead = false;
    gameObjects.push(laser);
    console.log('Laser added to gameObjects:', laser);
  });
}


// 이벤트 처리 호출 함수
function handleEvents() {
  handleShooting();
}


// 적 생성 함수
// function createEnemies() {
//   const enemy = new Enemy(Math.random() * (canvas.width - 50), 0);
//   enemy.img = enemyImg;
//   gameObjects.push(enemy);

// // 적의 "attack" 레이저
//   const attackLaser = new AttackLaser(enemy.x + enemy.width / 2 - 2.5, enemy.y + enemy.height);
//   attackLaser.img = attackLaserImg;
//   gameObjects.push(attackLaser);
// }


// 주인공 생성 함수
function createHero() {
  try {
    hero = new Hero(canvas.width / 2 - 25, canvas.height - 250); 
    hero.img = heroImg;
    gameObjects.push(hero);

    console.log("Hero created:", hero);
  } catch (error) {
    console.error('Error in createHero:', error);
  }
}


// 집 생성 함수
function createHouses() {
  const randomHouseIndex = Math.floor(Math.random() * houseImages.length);
  const randomX = Math.random() * (canvas.width - 100);
  const house = new House(randomX, 200, houseImages[randomHouseIndex]);
  gameObjects.push(house); 
}


// 트리 생성 함수
function createTree() {
  const randomX = Math.random() * (canvas.width - 100);
  const tree = new Tree(randomX, 200, treeImage);
  gameObjects.push(tree); 
}

// 집과 트리 생성 함수
function createHousesAndTrees() {
  const houseCount = getRandomNumber(1, 4);
  const treeCount = getRandomNumber(1, 5);

  for (let i = 0; i < houseCount; i++) {
    createHouses();
  }

  for (let i = 0; i < treeCount; i++) {
    createTree();
  }
}

// 적 생성 함수
function createEnemies() {
  const enemyCount = getRandomNumber(1, 3);
  for (let i = 0; i < enemyCount; i++) {
    const enemy = new Enemy(Math.random() * (canvas.width - 50), 0);
    enemy.img = enemyImg;
    gameObjects.push(enemy);
  // 적의 "attack" 레이저
    const attackLaser = new AttackLaser(enemy.x + enemy.width / 2 - 2.5, enemy.y + enemy.height);
    attackLaser.img = attackLaserImg;
    gameObjects.push(attackLaser);
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


// 선물과 집의 충돌을 처리하는 함수
function handleGiftHouseCollisions() {
  gameObjects.forEach(gift => {
    if (gift instanceof Gift) {
      gameObjects.forEach(house => {
        if (house instanceof House && isColliding(gift, house)) {
          // 선물과 집이 충돌하면 글리터 생성
          gift.dead = true;
          // 글리터 생성
          const glitter = new Glitter(house.x, house.y, glitterImg);
          gameObjects.push(glitter);
        }
      });
    }
  });
}
// 게임 객체 업데이트 함수
// 게임 객체 업데이트 함수
function updateGameObjects() {

  //  // 트리 이동
  //  gameObjects.forEach(go => {
  //   if (go instanceof Tree) {
  //     go.move();
  //   }
  // });

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
    } else if (go instanceof House || go instanceof Tree) {
      go.move(); // 집의 이동 메서드 호출 
    }
  });

 

  // 선물과 글리터 이동
  gameObjects.forEach(go => {
    if (go instanceof Gift || go instanceof House) {
      go.move();
    }
  });


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


  // 주인공과 "attack" 레이저 간의 충돌 확인 및 게임 종료
  gameObjects.forEach(go => {
    if (go instanceof AttackLaser && isColliding(go, hero)) {
      // 주인공이 "attack" 레이저와 충돌하면 게임 종료
      gameOver();
    }
  });


  // 선물과 집 간의 충돌 확인 및 글리터 생성
  handleGiftHouseCollisions();

  // 화면 밖으로 벗어난 "attack" 레이저를 제거
  gameObjects = gameObjects.filter(go => !(go instanceof AttackLaser && go.y > canvas.height));

  // 충돌 확인 및 죽은 객체 제거
  gameObjects = gameObjects.filter(go => !go.dead);
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
    } else if ((go instanceof Laser &&  obj instanceof AttackLaser) && go !== obj && isColliding(obj, go)) {
      // 레이저끼리 충돌 시
      obj.dead = true;
      go.dead = true;
      console.log('Laser and Enemy collided.');
    }
    if (go instanceof Gift && obj instanceof House && isColliding(obj, go)) {
      // 선물은 사라지고, 글리터가 생성된다.
      go.dead = true;
      const glitter = new Glitter(go.x, go.y, glitterImg);
      gameObjects.push(glitter);
    }
  });
}


// 게임 오버 함수
function gameOver() {
  isGameOver = true; // 게임 오버 상태로 설정
  restartButton.style.display = 'block'; // 재시작 버튼 표시
  gameOverScreen.style.display = 'block'; // 게임 오버 화면 표시
  // cancelAnimationFrame(gameLoopId); // 게임 루프를 멈춤
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


// 캔버스 리셋 함수
function resetCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}


function gameLoop() {
  if (!isGameOver) {
    updateGameObjects();
    resetCanvas();
    drawGameObjects(ctx);
    moveHero();
    gameLoopId = requestAnimationFrame(gameLoop);
  }
}


// 게임 초기화 함수
async function initGame() {
  try {
    await loadHouseImages();
    await loadLaserImage();
    await initGameObjects();
    createHero();
    handleEvents();
    // 게임 루프 시작
    gameLoopId = requestAnimationFrame(gameLoop);
  } catch (error) {
    console.error('Error in initializing the game:', error);
  }
}

function getRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// // 0.5초에 한 번씩 집이나 트리를 랜덤한 횟수로 생성
// setInterval(() => {
//   const houseCount = getRandomNumber(1, 4);
//   for (let i = 0; i < houseCount; i++) {
//     createHouses();
//   }

//   const treeCount = getRandomNumber(1, 5);
//   for (let i = 0; i < treeCount; i++) {
//     createTree();
//   }
// }, 1500);

// // 적이 5초에 1개씩 생성되도록 추가
// setInterval(() => {
//   const enemyCount = getRandomNumber(1, 3);
//   for (let i = 0; i < enemyCount; i++) {
//     createEnemies();
//   }
// }, 3000);


// 0.5초에 한 번씩 집이나 트리를 랜덤한 횟수로 생성
setInterval(createHousesAndTrees, 1500);

// 적이 5초에 1개씩 생성
setInterval(createEnemies, 5000);
