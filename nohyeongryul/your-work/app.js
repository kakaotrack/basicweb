// @ts-check
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
}
// //EventEmitter 클래스는 이벤트를 관리하는 기본적인 이벤트 에미터를 구현합니다.
// on 메서드는 특정 이벤트에 대한 리스너를 추가합니다.
// emit 메서드는 특정 이벤트를 발생시키며, 등록된 모든 리스너에게 메시지를 전달합니다.

// @ts-ignore
class GameObject {
	constructor(x, y) {
		this.x = x;
		this.y = y;
		this.dead = false;
		this.type = '';
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
// GameObject 클래스는 게임의 모든 객체의 기본이 되는 클래스입니다.
// draw 메서드는 객체를 캔버스에 그립니다.
// rectFromGameObject 메서드는 객체의 위치를 나타내는 사각형을 반환합니다.
// @ts-ignore
class Hero extends GameObject {
	constructor(x, y) {
		super(x, y);
		(this.width = 99), (this.height = 75);
		this.type = 'Hero';
		this.speed = { x: 0, y: 0 };
		this.cooldown = 0;
		this.life = 3;
		this.points = 0;
	} // ... (플레이어의 속성 및 메서드 정의)
	fire() {
		gameObjects.push(new Laser(this.x + 45, this.y - 10));
		this.cooldown = 500;

		let id = setInterval(() => {
			if (this.cooldown > 0) {
				this.cooldown -= 50;
				if(this.cooldown === 0) {
					clearInterval(id);
				}
			}
		}, 50);
	}// ... (레이저 발사 및 쿨다운 관련 로직)
	canFire() {
		return this.cooldown === 0;
	}
	decrementLife() {
		this.life--;
		if (this.life === 0) {
			this.dead = true;
		}
	} // ... (플레이어 생명력 감소 로직)
	incrementPoints() {
		this.points += 100;
	}// ... (플레이어 점수 증가 로직)
}

// @ts-ignore
class Enemy extends GameObject {
	constructor(x, y) {
		super(x, y);
		(this.width = 98), (this.height = 50);
		this.type = 'Enemy';
		let id = setInterval(() => {
			if (this.y < canvas.height - this.height) {
				this.y += 5;
			} else {
				console.log('Stopped at', this.y);
				clearInterval(id);
			} // ... (적의 속성 및 이동 로직 정의)
		}, 300);
	}
}

class Laser extends GameObject {
	constructor(x, y) {
		super(x, y);
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
		}, 100);
	}// ... (레이저의 속성 및 이동 로직 정의)
}
// loadTexture: 이미지를 비동기적으로 로드하는 함수.
function loadTexture(path) {
	return new Promise((resolve) => {
		const img = new Image();
		img.src = path;
		img.onload = () => {
			resolve(img);
		};
	});
}

function intersectRect(r1, r2) {
	return !(r2.left > r1.right || r2.right < r1.left || r2.top > r1.bottom || r2.bottom < r1.top);
}
// intersectRect: 두 사각형이 교차하는지 여부를 확인하는 함수.

const Messages = {
	KEY_EVENT_UP: 'KEY_EVENT_UP',
	KEY_EVENT_DOWN: 'KEY_EVENT_DOWN',
	KEY_EVENT_LEFT: 'KEY_EVENT_LEFT',
	KEY_EVENT_RIGHT: 'KEY_EVENT_RIGHT',
	KEY_EVENT_SPACE: 'KEY_EVENT_SPACE',
	COLLISION_ENEMY_LASER: 'COLLISION_ENEMY_LASER',
	COLLISION_ENEMY_HERO: 'COLLISION_ENEMY_HERO',
};



let heroImg,
	enemyImg,
	laserImg,
	lifeImg,
	canvas,
	ctx,
	gameObjects = [],
	hero,
	eventEmitter = new EventEmitter();
// @ts-ignore
let isMovingUp = false;
let isMovingDown = false;
let isMovingLeft = false;
let isMovingRight = false;
let isFiring = false;
let fireInterval;
// EVENTS
// @ts-ignore
let onKeyDown = function (e) {
	// console.log(e.keyCode);
	switch (e.keyCode) {
		case 37: // Left arrow key
			isMovingLeft = true;
			break;
		case 39: // Right arrow key
			isMovingRight = true;
			break;
		case 38: // Up arrow key
			isMovingUp = true;
			break;
		case 40: // Down arrow key
			isMovingDown = true;
			break;
		case 32: // Space key
            e.preventDefault();
            if (!isFiring) {
                isFiring = true;
                fireInterval = setInterval(() => {
                    eventEmitter.emit(Messages.KEY_EVENT_SPACE);
                }, 20); // 발사 간격 조절 (100ms)
            }
            break;
		default:
			break; // do not block other keys
	}
};
window.addEventListener('keydown', onKeyDown);

// TODO make message driven
window.addEventListener('keyup', (evt) => {
	if (evt.key === 'ArrowUp') {
		isMovingUp = false;
		eventEmitter.emit(Messages.KEY_EVENT_UP);
	} else if (evt.key === 'ArrowDown') {
		isMovingDown = false;
		eventEmitter.emit(Messages.KEY_EVENT_DOWN);
	} else if (evt.key === 'ArrowLeft') {
		isMovingLeft = false;
		eventEmitter.emit(Messages.KEY_EVENT_LEFT);
	} else if (evt.key === 'ArrowRight') {
		isMovingRight = false;
		eventEmitter.emit(Messages.KEY_EVENT_RIGHT);
	} else if (evt.keyCode === 32) {
        isFiring = false;
        clearInterval(fireInterval);
    } 
});

//createEnemies: 초기에 적들을 생성하는 함수.
function createEnemies() {
	const MONSTER_TOTAL = 5;
	const MONSTER_WIDTH = MONSTER_TOTAL * 98;
	const START_X = (canvas.width - MONSTER_WIDTH) / 2;
	const STOP_X = START_X + MONSTER_WIDTH;

	for (let x = START_X; x < STOP_X; x += 98) {
		for (let y = 0; y < 50 * 5; y += 50) {
			const enemy = new Enemy(x, y);
			enemy.img = enemyImg;
			gameObjects.push(enemy);
		}
	}
}
//createHero: 초기에 플레이어를 생성하는 함수.
function createHero() {
	hero = new Hero(canvas.width / 2 - 45, canvas.height - canvas.height / 4);
	hero.img = heroImg;
	gameObjects.push(hero);
}

//updateGameObjects: 게임 객체들을 업데이트하고 충돌을 확인하는 함수.
function updateGameObjects() {
	const enemies = gameObjects.filter((go) => go.type === 'Enemy');
	const lasers = gameObjects.filter((go) => go.type === 'Laser');

	enemies.forEach((enemy) => {
		const heroRect = hero.rectFromGameObject();
		if (intersectRect(heroRect, enemy.rectFromGameObject())) {
			// @ts-ignore
			eventEmitter.emit(Messages.COLLISION_ENEMY_HERO, { enemy });
		}
	});

	// laser hit something
	lasers.forEach((l) => {
		enemies.forEach((m) => {
			if (intersectRect(l.rectFromGameObject(), m.rectFromGameObject())) {
				// @ts-ignore
				eventEmitter.emit(Messages.COLLISION_ENEMY_LASER, {
					first: l,
					second: m,
				});
			}
		});
	});
	// 이 부분에서 상태에 따라 움직임을 처리합니다.
	if (isMovingUp) hero.y -= 10;
	if (isMovingDown) hero.y += 10;
	if (isMovingLeft) hero.x -= 10;
	if (isMovingRight) hero.x += 10;

	gameObjects = gameObjects.filter((go) => !go.dead);
}


//drawGameObjects: 캔버스에 게임 객체들을 그리는 함수.
function drawGameObjects(ctx) {
	gameObjects.forEach((go) => go.draw(ctx));
}

//
//initGame: 게임 초기화 함수.
function initGame() {
	gameObjects = [];
	createEnemies();
	createHero();

	eventEmitter.on(Messages.KEY_EVENT_UP, () => {
		if (isMovingUp) hero.y -= 5;
	});

	eventEmitter.on(Messages.KEY_EVENT_DOWN, () => {
		if (isMovingDown) hero.y += 5;
	});

	eventEmitter.on(Messages.KEY_EVENT_LEFT, () => {
		if (isMovingLeft) hero.x -= 20;
	});

	eventEmitter.on(Messages.KEY_EVENT_RIGHT, () => {
		if (isMovingRight) hero.x += 20;
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
	});

	eventEmitter.on(Messages.COLLISION_ENEMY_HERO, (_, { enemy }) => {
		enemy.dead = true;
		hero.decrementLife();
	});
}


//drawLife 및 drawPoints: 생명력과 점수를 화면에 표시하는 함수들.
function drawLife() {
	// TODO, 35, 27
	//

	const START_POS = canvas.width - 180;
	for (let i = 0; i < hero.life; i++) {
		ctx.drawImage(lifeImg, START_POS + 45 * (i + 1), canvas.height - 37);
	}
}

function drawPoints() {
	ctx.font = '30px Arial';
	ctx.fillStyle = 'red';
	ctx.textAlign = 'left';
	drawText('Points: ' + hero.points, 10, canvas.height - 20);
}

function drawText(message, x, y) {
	ctx.fillText(message, x, y);
}

//window.onload: 페이지 로딩이 완료되면 초기화 함수 호출 및 게임 루프 설정.
// ...

//window.onload: 페이지 로딩이 완료되면 초기화 함수 호출 및 게임 루프 설정.
window.onload = async () => {
    canvas = document.getElementById('canvas');
    // @ts-ignore
    ctx = canvas.getContext('2d');
    heroImg = await loadTexture('assets/player.png');
    enemyImg = await loadTexture('assets/enemyShip.png');
    laserImg = await loadTexture('assets/laserRed.png');
    lifeImg = await loadTexture('assets/life.png');

    initGame();

    // @ts-ignore
    let lastTimestamp = 0;

    function gameLoop(timestamp) {
        const deltaTime = timestamp - lastTimestamp;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        drawPoints();
        drawLife();
        updateGameObjects();
        drawGameObjects(ctx);

        lastTimestamp = timestamp;

        // @ts-ignore
        requestAnimationFrame(gameLoop);
    }

    // @ts-ignore
    requestAnimationFrame(gameLoop);
};
