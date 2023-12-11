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
		}, 10);
	}// ... (레이저 발사 및 쿨다운 관련 로직)
	canFire() {
		return this.cooldown === 0;
	}
	decrementLife() {
		this.life--;
		if (this.life === 0) {
			this.dead = true;
			isGameOver = true;
		}
	} // ... (플레이어 생명력 감소 로직)
	incrementPoints() {
		this.points += 100;
	}// ... (플레이어 점수 증가 로직)
}


class Enemy extends GameObject {
	constructor(x, y) {
		super(x, y);
		(this.width = 98), (this.height = 70);
		this.isExploding = false; // 폭발 상태를 나타내는 플래그
		this.explosionDuration = 1000; // 폭발 지속 시간(1초)
		this.type = 'Enemy';
		
		let id = setInterval(() => {
			
			if (this.isExploding) {
				return;
			}

			// 플레이어 위치 추적
			if (hero.x > this.x){
				this.x += 5;
			} else if (hero.x < this.x){
				this.x -= 5;
			}

			if (this.y < canvas.height - this.height) {
				this.y += 5;
			} else {
				// console.log('Stopped at', this.y);
				this.dead = true; // 화면 바닥에 도달하면 사망처리
				clearInterval(id);
			} // ... (적의 속성 및 이동 로직 정의)
		}, 15);
	}

	hit() {
        this.isExploding = true;
		clearInterval(this.movementTimer); // 움직임 중지
        setTimeout(() => {
            this.dead = true; // 폭발 후 사망 처리
        }, this.explosionDuration);
    }

    draw(ctx) {
        if (this.isExploding) {
            ctx.drawImage(explosionImg, this.x, this.y, this.width, this.height);
        } else {
            ctx.drawImage(this.img, this.x, this.y, this.width, this.height);
        }
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
		},  30);
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
let isGameOver = false;

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

	const enemyInterval = 2000; // 적을 생성하는 간격(2초)

    const enemyCreation = setInterval(() => {
        if (isGameOver) {
            clearInterval(enemyCreation); // 게임 오버 시 적 생성 중지
            return;
        }

        // 적의 x 좌표를 무작위로 설정
        const randomX = Math.floor(Math.random() * (canvas.width - 98));
        const enemy = new Enemy(randomX, 0); // 적을 캔버스 상단에서 생성
        enemy.img = enemyImg;
        gameObjects.push(enemy);
    }, enemyInterval);
	
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

    enemies.forEach(enemy => {
        if (!enemy.isExploding) { // 폭발 중인 적과의 충돌은 무시
            const heroRect = hero.rectFromGameObject();
            if (intersectRect(heroRect, enemy.rectFromGameObject())) {
                eventEmitter.emit(Messages.COLLISION_ENEMY_HERO, { enemy });
            }
        }
    });


	// laser hit something
    lasers.forEach(laser => {
        enemies.forEach(enemy => {
            // 폭발 중이지 않은 적과 레이저의 충돌 검사
            if (!enemy.isExploding && intersectRect(laser.rectFromGameObject(), enemy.rectFromGameObject())) {
                laser.dead = true;
                enemy.hit(); // 적이 레이저에 맞았을 때 처리
                if (!enemy.isExploding) { // 폭발 상태가 아닌 경우에만 점수 증가
                    hero.incrementPoints();
                }
            }
        });
    });

	// 플레이어의 위치 업데이트
	if (isMovingUp && hero.y > 0) hero.y -= 10;
	if (isMovingDown && hero.y < canvas.height - hero.height) hero.y += 10;
	if (isMovingLeft && hero.x > 0) hero.x -= 10;
	if (isMovingRight && hero.x < canvas.width - hero.width) hero.x += 10;

	gameObjects = gameObjects.filter((go) => !go.dead); // 사망한 객체 제거
}


//drawGameObjects: 캔버스에 게임 객체들을 그리는 함수.
function drawGameObjects(ctx) {
	if (isGameOver) {
        ctx.font = '48px Arial';
        ctx.fillStyle = 'red';
        ctx.textAlign = 'center';
        ctx.fillText('Game Over', canvas.width / 2, canvas.height / 2);
	}
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

function restartGame() {
	gameObjects = [];
	isGameOver = false;
	createEnemies();
	createHero();
}

//window.onload: 페이지 로딩이 완료되면 초기화 함수 호출 및 게임 루프 설정.
// ...

//window.onload: 페이지 로딩이 완료되면 초기화 함수 호출 및 게임 루프 설정.
window.onload = async () => {
    canvas = document.getElementById('canvas');
    // @ts-ignore
    ctx = canvas.getContext('2d');
    heroImg = await loadTexture('assets/hero.png');
    enemyImg = await loadTexture('assets/enemy.png');
    laserImg = await loadTexture('assets/laserRed.png');
    lifeImg = await loadTexture('assets/hero_life.png');
	explosionImg = await loadTexture('assets/explosion.png');

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

window.addEventListener('keydown', function(e) {
	if (e.keyCode === 32){
		if (isGameOver) {
			restartGame();
		}
	}
})