let canvas = null;
let ctx = null;

const Messages = {
    KEY_EVENT_UP: "KEY_EVENT_UP",
    KEY_EVENT_DOWN: "KEY_EVENT_DOWN",
    KEY_EVENT_LEFT: "KEY_EVENT_LEFT",
    KEY_EVENT_RIGHT: "KEY_EVENT_RIGHT",
    KEY_EVENT_SPACE: "KEY_EVENT_SPACE",
    KEY_EVENT_ENTER: "KEY_EVENT_ENTER",
    COLLISION_ENEMY_LASER: "COLLISION_ENEMY_LASER",
    COLLISION_ENEMY_HERO: "COLLISION_ENEMY_HERO",
    HERO_HEART_GET: "HERO_HEART_GET",
    HERO_ITEM_GET: "HERO_ITEM_GET",
    GAME_END_LOSS: "GAME_END_LOSS",
    GAME_END_WIN: "GAME_END_WIN",
};

let gameLoopId,
createEnemyLoopId,
createHeartLoopId,
heroImg, 
enemyImg, 
laserPurpleImg,
laserRedImg,
gameObjects = [], 
hero,
livesImg,
heartImg,
laseritemImg; 

//  ***** Class ***** 
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

    rectFromGameObject(){
        return {
            top: this.y,
            left: this.x,
            bottom: this.y + this.height,
            right: this.x + this.width
        }
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
        gameObjects.push(new PurpleLaser(this.x + 45, this.y - 10));
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

    // laseritem을 얻으면 3초동안 연속 레이저 발사
    constantLaser() {
        let itemid = setInterval(() => {
            gameObjects.push(new RedLaser(this.x + 45, this.y - 10));
            }, 300);
        setTimeout(clearInterval, 3000, itemid);
    }

    incrementLife() {
        if(this.life + 1 < 4)
            this.life++;
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
                this.dead = true;
                clearInterval(id);
            }
        }, 200)
    }
}

// Event Emitter Class
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

let eventEmitter = new EventEmitter();

// 보라색 레이저
class PurpleLaser extends GameObject {
    constructor(x, y) {
    super(x,y);
    (this.width = 9), (this.height = 33);
    this.type = 'Laser';
    this.img = laserPurpleImg;
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

// 아이템용 빨간색 레이저
class RedLaser extends GameObject {
    constructor(x, y) {
    super(x,y);
    (this.width = 9), (this.height = 33);
    this.type = 'Laser';
    this.img = laserRedImg;
    let id = setInterval(() => {
        if (this.y > 0) {
        this.y -= 20;
        } else {
        this.dead = true;
        clearInterval(id);
        }
        }, 200)
    }
}

// 회복용 하트 아이템
class Heart extends GameObject {
    constructor(x, y) {
        super(x, y);
        (this.width = 40), (this.height = 30);
        this.type = "Heart";
        let id = setInterval(() => {
        if (this.y < canvas.height - this.height) {
            this.y += 5;
        } else {
            this.dead = true;
            clearInterval(id);
        }
        }, 300)
    }
}

// 공격 아이템
class LaserItem extends GameObject {
    constructor(x, y) {
        super(x, y);
        (this.width = 40), (this.height = 30);
        this.type = "LaserItem";
        let id = setInterval(() => {
        if (this.y < canvas.height - this.height) {
            this.y += 5;
        } else {
            this.dead = true;
            clearInterval(id);
        }
        }, 300);
    }
}

function loadAsset(path){
    return new Promise((resolve) => {
        const img = new Image();
        img.src = path;
        img.onload = () => {
        resolve(img);
        }
    })
}

// 적 생성
async function createEnemies() {
    const START_ENEMY_X = Math.floor(Math.random()  * (500 - 50)) + 50;

    for (let x = START_ENEMY_X; x < 900;) {
            const enemy = new Enemy(x, 0);
            enemy.img = enemyImg;
            gameObjects.push(enemy);
            x += Math.floor(Math.random()  * (700 - 100)) + 100;
    }
}

// 플레이어 생성
function createHero() {
    hero = new Hero(canvas.width / 2 - 45, canvas.height - canvas.height / 4);
    hero.width = 100
    hero.height = 100
    hero.type = "hero"
    hero.img = heroImg;
    gameObjects.push(hero);
}

// 회복 아이템 생성
function createHeart() {
    const START_HEART_X = Math.floor(Math.random()  * (860 - 50)) + 50;
    const heart = new Heart(START_HEART_X, 0);
    heart.img = heartImg;
    gameObjects.push(heart);
}

// 공격 아이템 생성
function createLaserItem() {
    const START_HEART_X = Math.floor(Math.random()  * (860 - 50)) + 50;
    const laserItem = new LaserItem(START_HEART_X, 0);
    laserItem.img = laseritemImg;
    gameObjects.push(laserItem);
}

let onKeyDown = function (e) {
    console.log(e.keyCode);
        //...add the code from the lesson above to stop default behavior
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

function drawGameObjects(ctx) {
    gameObjects.forEach(go => go.draw(ctx));
}

function initGame() {
        gameObjects = [];
        createEnemies();
        createHero();
        createHeart();
        createLaserItem();
        
        // 플레이어가 화면을 벗어나지 않으면서 이동
        eventEmitter.on(Messages.KEY_EVENT_UP, () => {
            if(hero.y - 5 >= 40)
                hero.y -=5 ;
        })
        
        eventEmitter.on(Messages.KEY_EVENT_DOWN, () => {
            if(hero.y + 5  <= 550)
                hero.y += 5;
        });
        
        eventEmitter.on(Messages.KEY_EVENT_LEFT, () => {
            if(hero.x - 5 >= 25)
                hero.x -= 5;
        });
        
        eventEmitter.on(Messages.KEY_EVENT_RIGHT, () => {
            if(hero.x + 5 <= 900)
                hero.x += 5;
        });

        // space 키 누르면 레이저 발사
        eventEmitter.on(Messages.KEY_EVENT_SPACE, () => {
            if (hero.canFire()) {
                hero.fire();
        }});

        // laseritem 먹으면 연속 레이저 발사
        eventEmitter.on(Messages.HERO_ITEM_GET, (_, { laseritem }) => {
            laseritem.dead = true;
                hero.constantLaser();
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

        // 회복 아이템 얻으면 하트 이미지 삭제, 생명 증가
        eventEmitter.on(Messages.HERO_HEART_GET, (_, { heart }) => {
            heart.dead = true;
            hero.incrementLife();
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


// 충돌 확인 함수
function intersectRect(r1, r2) {
    return !(r2.left > r1.right ||
        r2.right < r1.left ||
        r2.top > r1.bottom ||
        r2.bottom < r1.top);
}

function updateGameObjects() {
    const enemies = gameObjects.filter(go => go.type === 'Enemy');
    const lasers = gameObjects.filter(go => go.type === "Laser");
    const hearts = gameObjects.filter(go => go.type === "Heart");
    const laseritem = gameObjects.filter(go => go.type === "LaserItem");

    // 레이저와 적이 충돌하면
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

    const heroRect = hero.rectFromGameObject();
    // 플레이어와 적이 충돌하면
    enemies.forEach(enemy => {
        if (intersectRect(heroRect, enemy.rectFromGameObject())) {
            eventEmitter.emit(Messages.COLLISION_ENEMY_HERO, { enemy });
        }
    });
    
    // 플레이어가 회복 아이템을 얻으면
    hearts.forEach(heart => {
        if (intersectRect(heroRect, heart.rectFromGameObject())) {
            eventEmitter.emit(Messages.HERO_HEART_GET, { heart });
        }
    });

    // 플레이어가 공격 아이템을 얻으면
    laseritem.forEach(laseritem => {
        if (intersectRect(heroRect, laseritem.rectFromGameObject())) {
            eventEmitter.emit(Messages.HERO_ITEM_GET, { laseritem });
        }
    });

    gameObjects = gameObjects.filter(go => !go.dead);
}  

function drawLife() {
    const START_POS = canvas.width - 180;
    for(let i=0; i < hero.life; i++ ) {
        ctx.drawImage(
        livesImg, 
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

// 게임 종료
function endGame(win) {
    clearInterval(gameLoopId);
    clearInterval(createEnemyLoopId);
    clearInterval(createHeartLoopId);

    setTimeout(() => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    if (win) {
        displayMessage(
            "승리하였습니다! 재시작 - Enter",
            "green"
        );
    } else {
        displayMessage(
            "졌습니다. 재시작 - Enter"
        );
    }
    }, 200)  
}

// 게임 재시작
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
        createEnemyLoopId = setInterval(() => {
            createEnemies();
        }, 4000);
        createHeartLoopId = setInterval(() => {
            createHeart();
            createLaserItem();
        }, 30000);
        setTimeout(clearInterval, 30000, createEnemyLoopId);
        setTimeout(clearInterval, 30000, createHeartLoopId);
    }
}

(async function run() {
    const heroImg = await loadAsset('img/player.png');
    canvas = document.getElementById("myCanvas");
    ctx = canvas.getContext("2d");
    ctx.fillStyle = 'black';
    ctx.fillRect(0,0, 1024, 700); // x,y,width, height  
    ctx.drawImage(heroImg, canvas.width/2 - 45, canvas.height - canvas.height / 5);
    
    createEnemyLoopId = setInterval(() => {
        createEnemies();
    }, 4000);
    createHeartLoopId = setInterval(() => {
        createHeart();
        createLaserItem();
    }, 25000);
    setTimeout(clearInterval, 30000, createEnemyLoopId);
    setTimeout(clearInterval, 30000, createHeartLoopId);
})()

window.addEventListener("keydown", (evt) => {
    if (evt.key === "ArrowUp") {
        eventEmitter.emit(Messages.KEY_EVENT_UP);
    } else if (evt.key === "ArrowDown") {
        eventEmitter.emit(Messages.KEY_EVENT_DOWN);
    } else if (evt.key === "ArrowLeft") {
        eventEmitter.emit(Messages.KEY_EVENT_LEFT);
    } else if (evt.key === "ArrowRight") {
        eventEmitter.emit(Messages.KEY_EVENT_RIGHT);
    } else if(evt.key === " ") {
        eventEmitter.emit(Messages.KEY_EVENT_SPACE);
    } else if(evt.key === "Enter") {
        eventEmitter.emit(Messages.KEY_EVENT_ENTER);
    }
});

window.addEventListener("keyup", onKeyDown);


window.onload = async () => {
    heroImg = await loadAsset("img/player.png");
    enemyImg = await loadAsset("img/enemyShip.png");
    laserPurpleImg = await loadAsset("img/laser.png");
    laserRedImg = await loadAsset("img/laserred.png");
    heartImg = await loadAsset("img/live2.png");
    laseritemImg = await loadAsset("img/item.png");
    livesImg = await loadAsset('img/life.png');
    ctx.fillStyle = 'black';
    ctx.fillRect(0,0, 1024, 700); // x,y,width, height  
    initGame();
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