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

class Hero extends GameObject {
	constructor(x, y) {
		super(x, y);
		(this.width = 80), (this.height = 55);
		this.type = 'Hero';
		this.speed = { x: 0, y: 0 };
	}
}

class Laser extends GameObject {
	constructor(x, y) {
		super(x, y);
		this.width = 9;
		this.height = 33;
	}
}

// hero가 쏘는 빨간 레이저
class LaserRed extends Laser {
	constructor(x, y) {
		super(x, y);
		this.type = 'LaserRed';
		let id = setInterval(() => {
			if (!this.dead) {

				this.y = this.y > 0 ? this.y - 30 : this.y;
				if (this.y <= 0) {
					this.dead = true;
				}

			} else clearInterval(id);
		}, 100);
	}
}

// monster가 쏘는 초록 레이저
class LaserGreen extends Laser {
	constructor(x, y) {
		super(x, y);
		this.type = 'LaserGreen';
		let id = setInterval(() => {
			if (!this.dead) {

				this.y = this.y < HEIGHT ? this.y + 30 : this.y;
				if (this.y >= HEIGHT) {
					this.dead = true;
				}

			} else clearInterval(id);
		}, 100);
	}
}

class Explosion extends GameObject {
	constructor(x, y, img) {
		super(x, y);
		this.img = img;
		this.type = 'Explosion';
		(this.width = 56 * 2), (this.height = 54 * 2);
		setTimeout(() => {
			this.dead = true;
		}, 300);
	}
}

class Monster extends GameObject {
	constructor(x, y) {
		super(x, y);
		this.type = 'Monster';
		this.img = monsterImg;
		(this.width = 70), (this.height = 40);
		let id = setInterval(() => {
			// 살아있는 몬스터는 아래쪽 방향으로 점점 이동함
			if (!this.dead) {
				this.y = this.y < HEIGHT ? this.y + 2 : this.y;
				if (this.y >= HEIGHT - this.height) {
					this.dead = true;
					eventEmitter.emit('MONSTER_OUT_OF_BOUNDS');
				}
			} else {
				clearInterval(id);
			}
		}, 50);
	}
	// 몬스터가 레이저를 쏘는 함수 
	shoot() {
		if (!this.dead) {
			let l = new LaserGreen(this.x + this.width / 2, this.y + this.height);
			l.img = laserGreenImg;
			gameObjects.push(l);
		}
	}
}

class BossMonster extends GameObject {
	constructor(x, y) {
		super(x, y);
		this.type = 'BossMonster';
		this.width = 200;
		this.height = 200;
		this.maxHP = 500;
		this.hp = this.maxHP; //hp의 초기값은 최대 hp인 500
	}
	// 보스 몬스터가 레이저를 쏘는 함수
	shoot() {
		if (!this.dead && Math.random() < 0.05) { // 보스 몬스터가 레이저를 쏘는 속도 조절하고 숫자가 클수록 레이저를 쏘는 주기가 짧음
			let l = new LaserGreen(this.x + (this.width * Math.random()), this.y + this.height - 30); // 보스 몬스터의 본체 하단 무작위 위치에서 레이저가 발사됨
			l.img = laserGreenImg;
			gameObjects.push(l);
		}
	}

}

const Messages = {
	MONSTER_OUT_OF_BOUNDS: 'MONSTER_OUT_OF_BOUNDS',
	HERO_SPEED_LEFT: 'HERO_MOVING_LEFT',
	HERO_SPEED_RIGHT: 'HERO_MOVING_RIGHT',
	HERO_SPEED_ZERO: 'HERO_SPEED_ZERO',
	HERO_FIRE: 'HERO_FIRE',
	GAME_END_LOSS: 'GAME_END_LOSS',
	GAME_END_WIN: 'GAME_END_WIN',
	COLLISION_MONSTER_LASER: 'COLLISION_MONSTER_LASER',
	COLLISION_BOSSMONSTER_LASER: 'COLLISION_BOSSMONSTER_LASER',
	COLLISION_HERO_LASER: 'COLLISION_HERO_LASER',
	COLLISION_MONSTER_HERO: 'COLLISION_MONSTER_HERO',
	KEY_EVENT_LEFT: 'KEY_EVENT_LEFT',
	KEY_EVENT_RIGHT: 'KEY_EVENT_RIGHT',
	GAME_START: 'GAME_START',
};

class Game {
	constructor() {
		this.points = 0;
		this.life = 3;
		this.end = false;
		this.ready = false;
		this.bossAppears = false;

		// 몬스터가 화면의 바닥을 넘어가면 게임 종료
		eventEmitter.on(Messages.MONSTER_OUT_OF_BOUNDS, () => {
			hero.dead = true;
		});
		eventEmitter.on(Messages.HERO_SPEED_LEFT, () => {
			if (hero.x === 0) {
				hero.speed.x = 0;
			} else { hero.speed.x = -10 };
			hero.img = heroImgLeft;
		});
		eventEmitter.on(Messages.HERO_SPEED_RIGHT, () => {
			if (hero.x === WIDTH - hero.width) {
				hero.speed.x = 0;
			} else { hero.speed.x = 10 };
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
				let l = new LaserRed(hero.x + 45, hero.y - 30);
				l.img = laserRedImg;
				gameObjects.push(l);
				cooling();
			}
		});
		eventEmitter.on(Messages.BOSS_APPEARS, () => {
			game.bossAppears = true;
			createBossMonster(UFOImg);
			displayGauge(bossMonster);
			bossMonster.shoot();
		});
		eventEmitter.on(Messages.GAME_END_LOSS, (_, gameLoopId) => {
			game.end = true;
			displayMessage('You died...');
			clearInterval(gameLoopId);
		});
		eventEmitter.on(Messages.GAME_END_WIN, (_, gameLoopId) => {
			game.end = true;
			displayMessage('Victory!!!', 'green');
			clearInterval(gameLoopId);
		});
		// 몬스터가 히어로의 레이저에 맞으면 폭발하고 게임 점수가 100점 올라감
		eventEmitter.on(Messages.COLLISION_MONSTER_LASER, (_, { first: laser, second: monster }) => {
			laser.dead = true;
			monster.dead = true;
			this.points += 100;
			gameObjects.push(new Explosion(monster.x - 7, monster.y - 15, laserRedShot));
		});
		// 보스 몬스터가 히어로의 레이저에 맞으면 hp가 10 깎이고 hp가 0이면 게임 종료
		eventEmitter.on(Messages.COLLISION_BOSSMONSTER_LASER, (_, { first: laser, second: bossmonster }) => {
			laser.dead = true;
			bossmonster.hp -= 10;
			if (bossMonster.hp <= 0) {
				bossMonster.dead = true;
			}
			gameObjects.push(new Explosion(laser.x - 50, laser.y - 100 + Math.floor(Math.random() * 50), laserRedShot));
		});
		// 몬스터와 히어로가 부딪히면 히어로 목숨 하나 차감, 몬스터 죽음
		eventEmitter.on(Messages.COLLISION_MONSTER_HERO, (_, { monster: m, id }) => {
			game.life--;
			if (game.life === 0) {
				hero.dead = true;
				eventEmitter.emit(Messages.GAME_END_LOSS, id);
				gameObjects.push(new Explosion(hero.x, hero.y, laserGreenShot));
			}
			hero.img = heroImgDamaged;
			m.dead = true;
			gameObjects.push(new Explosion(m.x, m.y, laserRedShot));
		});
		// 히어로가 몬스터의 레이저에 맞으면 목숨 하나 차감하고 초록색 폭발 이미지 나옴
		eventEmitter.on(Messages.COLLISION_HERO_LASER, (_, { laser: l, id }) => {
			game.life--;
			if (game.life === 0) {
				hero.dead = true;
				eventEmitter.emit(Messages.GAME_END_LOSS, id);
			}
			hero.img = heroImgDamaged;
			l.dead = true;
			gameObjects.push(new Explosion(hero.x, hero.y, laserGreenShot));
		});
		eventEmitter.on(Messages.KEY_EVENT_LEFT, () => {
			hero.x = hero.x > 0 ? hero.x - 10 : hero.x;
		});
		eventEmitter.on(Messages.KEY_EVENT_RIGHT, () => {
			hero.x = hero.x < WIDTH ? hero.x + 10 : hero.x;
		});
		eventEmitter.on(Messages.GAME_START, () => {
			if (game.ready && game.end) {
			runGame();
			}
		});
	}
}

let eventEmitter = new EventEmitter();
let hero = new Hero(0, 0);
let bossMonster = new BossMonster(0, 0);
const WIDTH = 620;
const HEIGHT = 720;
let gameObjects = [];
let laserRedImg;
let laserRedShot;
let laserGreenImg;
let laserGreenShot;
let canvas;
let ctx;
let heroImg;
let heroImgLeft;
let heroImgRight;
let heroImgDamaged;
let lifeImg;
let monsterImg;
let UFOImg;


let coolDown = 0;

let game = new Game();

// 이미지 가져오는 함수
function loadTexture(path) {
	return new Promise((resolve) => {
		const img = new Image();
		img.src = path;
		img.onload = () => {
			resolve(img);
		};
	});
}

// 
// function rectFromGameObject(go) {
// 	return {
// 		top: go.y,
// 		left: go.x,
// 		bottom: go.y + go.height,
// 		right: go.x + go.width,
// 	};
// }

// 두 대상이 닿았는지 체크 (사각형의 범위가 겹치면 닿은걸로 간주함)
function intersectRect(r1, r2) {
	return !(r2.left > r1.right || r2.right < r1.left || r2.top > r1.bottom || r2.bottom < r1.top);
}

function draw(ctx, objects) {
	objects.forEach((obj) => {
		obj.draw(ctx);
	});
}

let onKeyDown = function (e) {
	console.log(e.keyCode);
	switch (e.keyCode) {
		case 37: // 왼쪽 방향키
		case 39: // 오른쪽 방향키
		case 32: // 스페이스바
			e.preventDefault(); // 키 입력시 기본 동작 방지 ex) 스페이스바 누르면 스크롤됨
			break;
		default:
			break;
	}
};


window.addEventListener('keydown', onKeyDown);

// 스페이스바나 방향키를 누르고 있으면 동작을 계속 실행하도록 하기 위해 변수를 만듬
let spacebarPressed = false;
let arrowKeys = { left: false, right: false };


window.addEventListener('keydown', (e) => {
	if (e.keyCode === 32) { // 스페이스바
		spacebarPressed = true;
		eventEmitter.emit(Messages.HERO_FIRE);
	} else if (e.keyCode === 37) { // 왼쪽 방향키
		arrowKeys.left = true;
		arrowKeys.right = false; // false로 바꿔야 왼쪽 오른쪽 키 동작이 충돌하지 않음
		eventEmitter.emit(Messages.HERO_SPEED_LEFT);
	} else if (e.keyCode === 39) { // 오른쪽 방향키
		arrowKeys.right = true;
		arrowKeys.left = false; // false로 바꿔야 왼쪽 오른쪽 키 동작이 충돌하지 않음
		eventEmitter.emit(Messages.HERO_SPEED_RIGHT);
	}
});

window.addEventListener('keyup', (e) => {
	if (e.keyCode === 32) { // 스페이스바
		spacebarPressed = false;
	} else if (e.keyCode === 37 || e.keyCode === 39) { // 순서대로 왼/오
		arrowKeys.left = false;
		arrowKeys.right = false; 
		eventEmitter.emit(Messages.HERO_SPEED_ZERO);
	}
	if (e.key === 'Enter') {
		eventEmitter.emit(Messages.GAME_START); // 시작화면에서 엔터키 누르면 게임 시작
	}
});

// 일정 시간마다 키가 눌러졌는지 체크
setInterval(() => {
	if (arrowKeys.left && !arrowKeys.right) {
		eventEmitter.emit(Messages.HERO_SPEED_LEFT);
	} else if (!arrowKeys.left && arrowKeys.right) {
		eventEmitter.emit(Messages.HERO_SPEED_RIGHT);
	} else {
		eventEmitter.emit(Messages.HERO_SPEED_ZERO);
	}
	if (spacebarPressed) {
		eventEmitter.emit(Messages.HERO_FIRE);
	}
}, 50);

// 레이저 쏘는 텀을 설정
function cooling() {
	coolDown = 400; 
	let id = setInterval(() => {
		coolDown -= 100;
		if (coolDown === 0) {
			clearInterval(id);
		}
	}, 100);
}

// 게임 점수 표시
function displayGameScore(message) {
	ctx.font = '30px PixelifySans';
	ctx.fillStyle = 'red';
	ctx.textAlign = 'right';
	ctx.fillText(message, canvas.width - 40, canvas.height - 40);
}

// 히어로 목숨 표시
function displayLife() {
	// should show tree ships.. 94 * 3
	const START_X = canvas.width - 150 - 30;
	for (let i = 0; i < game.life; i++) {
		ctx.drawImage(lifeImg, START_X + (i + 1) * 35, canvas.height - 100);
	}
}

// 보스 몬스터 hp 게이지 표시
function displayGauge(obj) {
	ctx.fillStyle = 'white';
	const hpWidth = (obj.hp / obj.maxHP) * obj.width;
	ctx.strokeStyle = 'white';
	ctx.strokeRect(obj.x - 2, obj.y - 15, obj.width + 4, 11)
	if (obj.hp < obj.maxHP / 3) {
		ctx.fillStyle = 'red';
		ctx.fillRect(obj.x, obj.y - 13, hpWidth, 7);
	} else if (obj.hp <= 0) {
		ctx.fillRect(obj.x, obj.y - 13, 0.1, 7);
	} else {
		ctx.fillRect(obj.x, obj.y - 13, hpWidth, 7);
	}
}

// 화면에 글자 표시
function displayMessage(message, color = 'red') {
	ctx.font = '30px PixelifySans';
	ctx.fillStyle = color;
	ctx.textAlign = 'center';
	ctx.fillText(message, canvas.width / 2, canvas.height / 2);
}

// 몬스터를 만듬
function createMonsters(start_x, start_y, column, row) {
	// 몬스터의 width = 70, height = 50 
	const MONSTER_COLUMN = column;
	const MONSTER_WIDTH = MONSTER_COLUMN * 70;
	const START_X = start_x == WIDTH / 2 ? start_x - MONSTER_WIDTH / 2 : start_x;
	const STOP_X = START_X + MONSTER_WIDTH;

	for (let x = START_X; x < STOP_X; x += 70) {
		for (let y = start_y; y < 50 * row; y += 50) {
			gameObjects.push(new Monster(x, y));
		}
	}
}

// 보스 몬스터를 만듬
function createBossMonster(BossMonsterImg) {
	bossMonster.dead = false;
	bossMonster.img = BossMonsterImg;
	bossMonster.x = WIDTH / 2 - bossMonster.width / 2;
	bossMonster.y = 50;
	gameObjects.push(bossMonster);
}

// 히어로를 만듬
function createHero(heroImg) {
	hero.dead = false;
	hero.img = heroImg;
	hero.y = (canvas.height / 4) * 3;
	hero.x = canvas.width / 2;
	gameObjects.push(hero);
}


function checkGameState(gameLoopId) {
	// 보스전에서 승패확인
	if (hero.dead) {
		eventEmitter.emit(Messages.GAME_END_LOSS, gameLoopId);
	} else if (bossMonster.dead) {
		eventEmitter.emit(Messages.GAME_END_WIN, gameLoopId);
	}

	// 남은 몬스터가 없으면 보스 등장
	const monsters = gameObjects.filter((go) => go.type === 'Monster');
	if (monsters.length === 0) {
		eventEmitter.emit(Messages.BOSS_APPEARS, gameLoopId);
	}

	// 히어로 위치 갱신
	if (hero.speed.x !== 0) {
		hero.x += hero.speed.x;
	}

	// 몬스터들이 무작위로 레이저를 발사함
	monsters.forEach((monster) => {
		if (Math.random() < 0.005) {
			monster.shoot();
		}
	});

	// 히어로가 레이저 맞았는지 확인하고 이벤트 처리
	const gLasers = gameObjects.filter((go) => go.type === 'LaserGreen');
	gLasers.forEach((l) => {
		if (intersectRect(l.rectFromGameObject(), hero.rectFromGameObject())) {
			eventEmitter.emit(Messages.COLLISION_HERO_LASER, { laser: l, id: gameLoopId });
		}
	})

	// 몬스터가 레이저 맞았는지 확인하고 이벤트 처리
	const rLasers = gameObjects.filter((go) => go.type === 'LaserRed');
	// laser hit something
	rLasers.forEach((l) => {
		//일반 몬스터
		monsters.forEach((m) => {
			if (intersectRect(l.rectFromGameObject(), m.rectFromGameObject())) {
				eventEmitter.emit(Messages.COLLISION_MONSTER_LASER, {
					first: l,
					second: m,
				});
			}
		});
		// 보스 몬스터
		if (game.bossAppears && intersectRect(l.rectFromGameObject(), bossMonster.rectFromGameObject())) {
			eventEmitter.emit(Messages.COLLISION_BOSSMONSTER_LASER, {
				first: l,
				second: bossMonster,
			});
		}
	});

	// 히어로와 몬스터 부딪혔는지 확인하고 이벤트 처리
	monsters.forEach((m) => {
		if (intersectRect(m.rectFromGameObject(), hero.rectFromGameObject())) {
			eventEmitter.emit(Messages.COLLISION_MONSTER_HERO, { monster: m, id: gameLoopId });
		}
	});

	gameObjects = gameObjects.filter((go) => !go.dead);
}

function runGame() {
	gameObjects = [];
	game.life = 3;
	game.points = 0;
	game.end = false;

	createMonsters(WIDTH / 2, 0, 4, 3);
	createHero(heroImg);

	// 일정시간마다 게임 갱신
	let gameLoopId = setInterval(() => {
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		ctx.fillStyle = 'black';
		ctx.fillRect(0, 0, canvas.width, canvas.height);
		displayGameScore('Score: ' + game.points);
		displayLife();
		checkGameState(gameLoopId);
		draw(ctx, gameObjects);
	}, 30); // 작아질수록 게임이 빨라짐 (히어로, 레이저 속도에 영향)

}

window.onload = async () => {
	canvas = document.getElementById('myCanvas');
	ctx = canvas.getContext('2d');

	heroImg = await loadTexture('spaceArt/png/player.png');
	heroImgLeft = await loadTexture('spaceArt/png/playerLeft.png');
	heroImgRight = await loadTexture('spaceArt/png/playerRight.png');
	heroImgDamaged = await loadTexture('spaceArt/png/playerDamaged.png');
	monsterImg = await loadTexture('spaceArt/png/enemyShip.png');
	UFOImg = await loadTexture('spaceArt/png/enemyUFO.png')
	laserRedImg = await loadTexture('spaceArt/png/laserRed.png');
	laserRedShot = await loadTexture('spaceArt/png/laserRedShot.png');
	laserGreenImg = await loadTexture('spaceArt/png/laserGreen.png');
	laserGreenShot = await loadTexture('spaceArt/png/laserGreenShot.png');
	lifeImg = await loadTexture('spaceArt/png/life.png');


	game.ready = true;
	game.end = true;
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	ctx.fillStyle = 'black';
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	displayMessage('Press [Enter] to start the game', 'blue');
};

