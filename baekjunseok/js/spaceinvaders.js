/*
  Game Class

  Game 클래스는 스페이스 인베이더 게임을 나타냄
  이를 인스턴스화하고 설정에서 기본값을 변경한 다음 'start'를 호출하여 게임을 실행

  'start' 이전에 'initialise'를 호출하여 게임이 그릴 캔버스를 설정

  'moveShip' 또는 'shipFire'를 호출하여 우주선을 제어

  'gameWon' 또는 'gameLost' 이벤트를 수신하여 게임 종료를 처리
*/

// 키보드에 대한 상수
var KEY_LEFT = 37;
var KEY_RIGHT = 39;
var KEY_SPACE = 32;

// Game 클래스의 인스턴스 생성
function Game() {

    // 초기 구성 설정
    this.config = {
        bombRate: 0.05,
        bombMinVelocity: 50,
        bombMaxVelocity: 50,
        invaderInitialVelocity: 25,
        invaderAcceleration: 0,
        invaderDropDistance: 20,
        rocketVelocity: 120,
        rocketMaxFireRate: 10,
        gameWidth: 400,
        gameHeight: 300,
        fps: 50,
        debugMode: false,
        invaderRanks: 4,
        invaderFiles: 8,
        shipSpeed: 120,
        levelDifficultyMultiplier: 0.2,
        pointsPerInvader: 5,
        limitLevelIncrease: 25
    };

    // 모든 상태 변수
    this.lives = 3;
    this.width = 0;
    this.height = 0;
    this.gameBounds = {left: 0, top: 0, right: 0, bottom: 0};
    this.intervalId = 0;
    this.score = 0;
    this.level = 1;
    this.enemyShipImage = null;
    this.playerImage = null;

    // 상태 스택
    this.stateStack = [];

    // 입력, 출력
    this.pressedKeys = {};
    this.gameCanvas =  null;

    // 터치를 위한 이전 x 위치
    this.previousX = 0;

    this.loadImages();
}

// Game을 캔버스로 초기화
Game.prototype.initialise = function(gameCanvas) {

    // 게임 캔버스 설정
    this.gameCanvas = gameCanvas;

    // 게임 너비 및 높이 설정
    this.width = gameCanvas.width;
    this.height = gameCanvas.height;

    // 상태 게임 바운더리 설정
    this.gameBounds = {
        left: gameCanvas.width / 2 - this.config.gameWidth / 2,
        right: gameCanvas.width / 2 + this.config.gameWidth / 2,
        top: gameCanvas.height / 2 - this.config.gameHeight / 2,
        bottom: gameCanvas.height / 2 + this.config.gameHeight / 2,
    };
};

// 
Game.prototype.loadImages = function () {
    var game = this;
    loadImage('../baekjunseok/assets/enemyShip.png', function (img) {
        game.enemyShipImage = img;
    });
    loadImage('../baekjunseok/assets/player.png', function (img) {
        game.playerImage = img;
    });
};

function loadImage(src, callback) {
    var img = new Image();
    img.onload = function () {
        callback(img);
    };
    img.src = src
}

// Ship 클래스에 이미지 그리는 메서드 추가
Ship.prototype.draw = function (ctx) {
    if (game.playerImage) {
        ctx.drawImage(game.playerImage, this.x - (this.width / 2), this.y - (this.height / 2), this.width, this.height);
    } else {
        // 이미지가 로드되지 않은 경우, 사각형으로 그림
        ctx.fillStyle = '#444444';
        ctx.fillRect(this.x - (this.width / 2), this.y - (this.height / 2), this.width, this.height);
    }
};

// Invader 클래스에 이미지 그리는 메서드 추가
Invader.prototype.draw = function (ctx) {
    if (game.enemyShipImage) {
        ctx.drawImage(game.enemyShipImage, this.x - (this.width / 2), this.y - (this.height / 2), this.width, this.height);
    } else {
        // 이미지가 로드되지 않은 경우, 사각형으로 그림
        ctx.fillStyle = '#006600';
        ctx.fillRect(this.x - this.width / 2, this.y - this.height / 2, this.width, this.height);
    }
};

Game.prototype.moveToState = function(state) {
 
   // 현재 상태를 떠남
   if(this.currentState() && this.currentState().leave) {
     this.currentState().leave(game);
     this.stateStack.pop();
   }
   
   // 새 상태에 대한 enter 함수가 있는 경우 호출
   if(state.enter) {
     state.enter(game);
   }
 
    // 현재 상태 설정
   this.stateStack.pop();
   this.stateStack.push(state);
 };

// 게임 시작
Game.prototype.start = function() {

    // 'welcome' 상태로 이동
    this.moveToState(new WelcomeState());

    // 게임 변수 설정
    this.lives = 3;
    this.config.debugMode = /debug=true/.test(window.location.href);

    // 게임 루프 시작
    var game = this;
    this.intervalId = setInterval(function () { GameLoop(game);}, 1000 / this.config.fps);

};

// 현재 상태 반환
Game.prototype.currentState = function() {
    return this.stateStack.length > 0 ? this.stateStack[this.stateStack.length - 1] : null;
};

//  메인 루프
function GameLoop(game) {
    var currentState = game.currentState();
    if(currentState) {

        //  Delta t는 업데이트/그리기 시간
        var dt = 1 / game.config.fps;

        //  드로잉 컨텍스트 가져오기.
        var ctx = this.gameCanvas.getContext("2d");
        
        // 업데이트 함수가 있는 경우 업데이트하고
        // 그리기 함수가 있는 경우 그리기
        if(currentState.update) {
            currentState.update(game, dt);
        }
        if(currentState.draw) {
            currentState.draw(game, dt, ctx);
        }
    }
}

// 새 상태를 푸시하고 상태에 대한 입력 함수 호출.
Game.prototype.pushState = function(state) {

    // 새 상태에 대한 입력 함수가 있으면 호출합니다.
    if(state.enter) {
        state.enter(game);
    }
    // 현재 상태 설정.
    this.stateStack.push(state);
};

Game.prototype.popState = function() {

    // 나가고 팝
    if(this.currentState()) {
        if(this.currentState().leave) {
            this.currentState().leave(game);
        }

        // 현재 상태 설정.
        this.stateStack.pop();
    }
};

// 게임을 중지합니다.
Game.prototype.stop = function Stop() {
    clearInterval(this.intervalId);
};

// 키가 눌렸음을 게임에 알립
Game.prototype.keyDown = function(keyCode) {
    this.pressedKeys[keyCode] = true;
    //  Delegate to the current state too.
    if(this.currentState() && this.currentState().keyDown) {
        this.currentState().keyDown(this, keyCode);
    }
};

// 터치 시작을 처리
Game.prototype.touchstart = function(s) {
    if(this.currentState() && this.currentState().keyDown) {
        this.currentState().keyDown(this, KEY_SPACE);
    }    
};

// 터치 종료를 처리
Game.prototype.touchend = function(s) {
    delete this.pressedKeys[KEY_RIGHT];
    delete this.pressedKeys[KEY_LEFT];
};

// 터치 이동을 처리
Game.prototype.touchmove = function(e) {
	var currentX = e.changedTouches[0].pageX;
    if (this.previousX > 0) {
        if (currentX > this.previousX) {
            delete this.pressedKeys[KEY_LEFT];
            this.pressedKeys[KEY_RIGHT] = true;
        } else {
            delete this.pressedKeys[KEY_RIGHT];
            this.pressedKeys[KEY_LEFT] = true;
        }
    }
    this.previousX = currentX;
};

// 키가 눌리지 않았음을 게임에 알림
Game.prototype.keyUp = function(keyCode) {
    delete this.pressedKeys[keyCode];
    // 현재 상태에도 위임
    if(this.currentState() && this.currentState().keyUp) {
        this.currentState().keyUp(this, keyCode);
    }
};

// 웰컴 상태 클래스
function WelcomeState() {

}

WelcomeState.prototype.update = function (game, dt) {


};

// 그리기 함수
WelcomeState.prototype.draw = function(game, dt, ctx) {

    //  배경 지우기
    ctx.clearRect(0, 0, game.width, game.height);

    ctx.font="30px Arial";
    ctx.fillStyle = '#ffffff';
    ctx.textBaseline="middle"; 
    ctx.textAlign="center"; 
    ctx.fillText("스페이스 인베이더", game.width / 2, game.height/2 - 40); 
    ctx.font="16px Arial";

    ctx.fillText("스페이스바를 눌러 게임 시작", game.width / 2, game.height/2); 
};

// 키가 눌렸음을 처리
WelcomeState.prototype.keyDown = function(game, keyCode) {
    if(keyCode == KEY_SPACE) {
        //  Space starts the game.
        game.level = 1;
        game.score = 0;
        game.lives = 3;
        game.moveToState(new LevelIntroState(game.level));
    }
};

// 게임 오버 상태 클래스.
function GameOverState() {

}

// 업데이트 함수
GameOverState.prototype.update = function(game, dt) {

};

// 그리기 함수
GameOverState.prototype.draw = function(game, dt, ctx) {

    // 배경을 지우기
    ctx.clearRect(0, 0, game.width, game.height);

    ctx.font="30px Arial";
    ctx.fillStyle = '#ffffff';
    ctx.textBaseline="center"; 
    ctx.textAlign="center"; 
    ctx.fillText("Game Over!", game.width / 2, game.height/2 - 40); 
    ctx.font="16px Arial";
    ctx.fillText("You scored " + game.score + " and got to level " + game.level, game.width / 2, game.height/2);
    ctx.font="16px Arial";
    ctx.fillText("Press 'Space' to play again.", game.width / 2, game.height/2 + 40);   
};

// 게임 오버 상태에서 스페이스 키가 눌렸을 때의 처리.
GameOverState.prototype.keyDown = function(game, keyCode) {
    if(keyCode == KEY_SPACE) {
        //  Space restarts the game.
        game.lives = 3;
        game.score = 0;
        game.level = 1;
        game.moveToState(new LevelIntroState(1));
    }
};

// 게임 설정 및 현재 레벨을 사용하여 PlayState를 생성
function PlayState(config, level) {
    this.config = config;
    this.level = level;

    // 게임 상태
    this.invaderCurrentVelocity =  10;
    this.invaderCurrentDropDistance =  0;
    this.invadersAreDropping =  false;
    this.lastRocketTime = null;

    // 게임 엔터티
    this.ship = null;
    this.invaders = [];
    this.rockets = [];
    this.bombs = [];
}

// PlayState에 진입할 때 호출되는 함수.
PlayState.prototype.enter = function(game) {

    // 우주선을 생성
    this.ship = new Ship(game.width / 2, game.gameBounds.bottom);

    // 초기 상태 설정
    this.invaderCurrentVelocity =  10;
    this.invaderCurrentDropDistance =  0;
    this.invadersAreDropping =  false;

    // 이 레벨을 위한 우주선 속도 및 침입자 매개변수 설정
    var levelMultiplier = this.level * this.config.levelDifficultyMultiplier;
    var limitLevel = (this.level < this.config.limitLevelIncrease ? this.level : this.config.limitLevelIncrease);
    this.shipSpeed = this.config.shipSpeed;
    this.invaderInitialVelocity = this.config.invaderInitialVelocity + 1.5 * (levelMultiplier * this.config.invaderInitialVelocity);
    this.bombRate = this.config.bombRate + (levelMultiplier * this.config.bombRate);
    this.bombMinVelocity = this.config.bombMinVelocity + (levelMultiplier * this.config.bombMinVelocity);
    this.bombMaxVelocity = this.config.bombMaxVelocity + (levelMultiplier * this.config.bombMaxVelocity);
    this.rocketMaxFireRate = this.config.rocketMaxFireRate + 0.4 * limitLevel;

    // 침입자들을 생성
    var ranks = this.config.invaderRanks + 0.1 * limitLevel;
    var files = this.config.invaderFiles + 0.2 * limitLevel;
    var invaders = [];
    for(var rank = 0; rank < ranks; rank++){
        for(var file = 0; file < files; file++) {
            invaders.push(new Invader(
                (game.width / 2) + ((files/2 - file) * 200 / files),
                (game.gameBounds.top + rank * 20),
                rank, file, 'Invader'));
        }
    }
    this.invaders = invaders;
    this.invaderCurrentVelocity = this.invaderInitialVelocity;
    this.invaderVelocity = {x: -this.invaderInitialVelocity, y:0};
    this.invaderNextVelocity = null;
};

// PlayState를 업데이트하는 함수
PlayState.prototype.update = function(game, dt) {
    
    // 왼쪽 또는 오른쪽 화살표 키가 눌린 경우 우주선을 이동시킵니다.
    // 부드러운 이동을 위해 keydown 이벤트 대신 틱에서 확인합니다.
    if(game.pressedKeys[KEY_LEFT]) {
        this.ship.x -= this.shipSpeed * dt;
    }
    if(game.pressedKeys[KEY_RIGHT]) {
        this.ship.x += this.shipSpeed * dt;
    }
    if(game.pressedKeys[KEY_SPACE]) {
        this.fireRocket();
    }

    // 우주선을 경계 안에 유지
    if(this.ship.x < game.gameBounds.left) {
        this.ship.x = game.gameBounds.left;
    }
    if(this.ship.x > game.gameBounds.right) {
        this.ship.x = game.gameBounds.right;
    }

    // 각 폭탄을 이동
    for(var i=0; i<this.bombs.length; i++) {
        var bomb = this.bombs[i];
        bomb.y += dt * bomb.velocity;

        // 폭탄이 화면을 벗어났다면 제거
        if(bomb.y > this.height) {
            this.bombs.splice(i--, 1);
        }
    }

    // 각 로켓을 이동
    for(i=0; i<this.rockets.length; i++) {
        var rocket = this.rockets[i];
        rocket.y -= dt * rocket.velocity;

        // 로켓이 화면을 벗어났다면 제거
        if(rocket.y < 0) {
            this.rockets.splice(i--, 1);
        }
    }

    // 침입자들을 이동
    var hitLeft = false, hitRight = false, hitBottom = false;
    for(i=0; i<this.invaders.length; i++) {
        var invader = this.invaders[i];
        var newx = invader.x + this.invaderVelocity.x * dt;
        var newy = invader.y + this.invaderVelocity.y * dt;
        if(hitLeft == false && newx < game.gameBounds.left) {
            hitLeft = true;
        }
        else if(hitRight == false && newx > game.gameBounds.right) {
            hitRight = true;
        }
        else if(hitBottom == false && newy > game.gameBounds.bottom) {
            hitBottom = true;
        }

        if(!hitLeft && !hitRight && !hitBottom) {
            invader.x = newx;
            invader.y = newy;
        }
    }

    // 침입자 속도를 업데이트
    if(this.invadersAreDropping) {
        this.invaderCurrentDropDistance += this.invaderVelocity.y * dt;
        if(this.invaderCurrentDropDistance >= this.config.invaderDropDistance) {
            this.invadersAreDropping = false;
            this.invaderVelocity = this.invaderNextVelocity;
            this.invaderCurrentDropDistance = 0;
        }
    }
    // 왼쪽에 닿으면 아래로 이동한 다음 오른쪽으로 이동
    if(hitLeft) {
        this.invaderCurrentVelocity += this.config.invaderAcceleration;
        this.invaderVelocity = {x: 0, y:this.invaderCurrentVelocity };
        this.invadersAreDropping = true;
        this.invaderNextVelocity = {x: this.invaderCurrentVelocity , y:0};
    }
    // 오른쪽에 닿으면 아래로 이동한 다음 왼쪽으로 이동
    if(hitRight) {
        this.invaderCurrentVelocity += this.config.invaderAcceleration;
        this.invaderVelocity = {x: 0, y:this.invaderCurrentVelocity };
        this.invadersAreDropping = true;
        this.invaderNextVelocity = {x: -this.invaderCurrentVelocity , y:0};
    }
    // 아래에 닿으면 게임 종료
    if(hitBottom) {
        game.lives = 0;
    }
    
    // 로켓과 침입자의 충돌을 확인
    for(i=0; i<this.invaders.length; i++) {
        var invader = this.invaders[i];
        var bang = false;

        for(var j=0; j<this.rockets.length; j++){
            var rocket = this.rockets[j];

            if(rocket.x >= (invader.x - invader.width/2) && rocket.x <= (invader.x + invader.width/2) &&
                rocket.y >= (invader.y - invader.height/2) && rocket.y <= (invader.y + invader.height/2)) {
                
                // 로켓을 제거하고 'bang'을 설정하여 이 로켓을 다시 처리하지 않도록 함.
                this.rockets.splice(j--, 1);
                bang = true;
                game.score += this.config.pointsPerInvader;
                break;
            }
        }
        if(bang) {
            this.invaders.splice(i--, 1);
            // 업그레이드 메뉴 재활성화
        }
        
    }

    // 가장 앞쪽의 침입자를 찾음
    var frontRankInvaders = {};
    for(var i=0; i<this.invaders.length; i++) {
        var invader = this.invaders[i];
        // 해당 게임 파일에 대한 침입자가 없거나 현재보다 뒤에 있는 경우,
        // 최전방 침입자를 해당 게임 파일로 설정
        if(!frontRankInvaders[invader.file] || frontRankInvaders[invader.file].rank < invader.rank) {
            frontRankInvaders[invader.file] = invader;
        }
    }

    // 가장 앞쪽 침입자에게 폭탄을 떨어뜨리기 위한 기회를 부여
    for(var i=0; i<this.config.invaderFiles; i++) {
        var invader = frontRankInvaders[i];
        if(!invader) continue;
        var chance = this.bombRate * dt;
        if(chance > Math.random()) {
            // 발사
            this.bombs.push(new Bomb(invader.x, invader.y + invader.height / 2, 
                this.bombMinVelocity + Math.random()*(this.bombMaxVelocity - this.bombMinVelocity)));
        }
    }

    // 폭탄/우주선 충돌을 확인
    for(var i=0; i<this.bombs.length; i++) {
        var bomb = this.bombs[i];
        if(bomb.x >= (this.ship.x - this.ship.width/2) && bomb.x <= (this.ship.x + this.ship.width/2) &&
                bomb.y >= (this.ship.y - this.ship.height/2) && bomb.y <= (this.ship.y + this.ship.height/2)) {
            this.bombs.splice(i--, 1);
            game.lives--;
        }
                
    }

    // 침입자/우주선 충돌을 확인
    for(var i=0; i<this.invaders.length; i++) {
        var invader = this.invaders[i];
        if((invader.x + invader.width/2) > (this.ship.x - this.ship.width/2) && 
            (invader.x - invader.width/2) < (this.ship.x + this.ship.width/2) &&
            (invader.y + invader.height/2) > (this.ship.y - this.ship.height/2) &&
            (invader.y - invader.height/2) < (this.ship.y + this.ship.height/2)) {
            // 충돌로 인한 사망
            game.lives = 0;
        }
    }

    // 실패 확인
    if(game.lives <= 0) {
        game.moveToState(new GameOverState());
    }

    // 승리 확인
    if (this.invaders.length === 0) {
        // 다음 레벨로 진행
        game.score += this.level * 50;
        game.level += 1;
        game.moveToState(new LevelIntroState(game.level));
    }
};

// PlayState를 그리는 함수.
PlayState.prototype.draw = function(game, dt, ctx) {

     // 배경 지우기
     ctx.clearRect(0, 0, game.width, game.height);

     // 우주선 그리기
     if (game.playerImage) {
         ctx.drawImage(game.playerImage, this.ship.x - (this.ship.width / 2), this.ship.y - (this.ship.height / 2), this.ship.width, this.ship.height);
     }
 
     // 침입자 그리기
     if (game.enemyShipImage) {
         for (var i = 0; i < this.invaders.length; i++) {
             var invader = this.invaders[i];
             ctx.drawImage(game.enemyShipImage, invader.x - invader.width / 2, invader.y - invader.height / 2, invader.width, invader.height);
         }
     }
 
     // 폭탄 그리기
     ctx.fillStyle = '#ff5555';
     for (var i = 0; i < this.bombs.length; i++) {
         var bomb = this.bombs[i];
         ctx.fillRect(bomb.x - 2, bomb.y - 2, 4, 4);
     }
 
     // 로켓 그리기
     ctx.fillStyle = '#ff0000';
     for (var i = 0; i < this.rockets.length; i++) {
         var rocket = this.rockets[i];
         ctx.fillRect(rocket.x, rocket.y - 2, 1, 4);
     }
 
     // 정보 그리기
     var textYpos = game.gameBounds.bottom + ((game.height - game.gameBounds.bottom) / 2) + 14 / 2;
     ctx.font = "14px Arial";
     ctx.fillStyle = '#ffffff';
     var info = "Lives: " + game.lives;
     ctx.textAlign = "left";
     ctx.fillText(info, game.gameBounds.left, textYpos);
     info = "Score: " + game.score + ", Level: " + game.level;
     ctx.textAlign = "right";
     ctx.fillText(info, game.gameBounds.right, textYpos);
 
     // 디버그 모드인 경우 경계를 그리기
     if (this.config.debugMode) {
         ctx.strokeStyle = '#ff0000';
         ctx.strokeRect(0, 0, game.width, game.height);
         ctx.strokeRect(game.gameBounds.left, game.gameBounds.top,
             game.gameBounds.right - game.gameBounds.left,
             game.gameBounds.bottom - game.gameBounds.top);
     }
 };

 // PlayState에서 키가 눌렸을 때의 처리
PlayState.prototype.keyDown = function(game, keyCode) {

    if(keyCode == KEY_SPACE) {
        //  발사
        this.fireRocket();
    }
    if(keyCode == 80) {
        //  일시 정지 상태
        game.pushState(new PauseState());
    }
};

PlayState.prototype.keyUp = function(game, keyCode) {

};

// 로켓 발사 함수
PlayState.prototype.fireRocket = function() {
    // 마지막 로켓 발사 시간이 없거나 마지막 로켓 발사 시간이
    // 최대 로켓 발사 속도보다 오래되었으면 발사 가능
    if(this.lastRocketTime === null || ((new Date()).valueOf() - this.lastRocketTime) > (1000 / this.rocketMaxFireRate))
    {   
        // 로켓 추가
        this.rockets.push(new Rocket(this.ship.x, this.ship.y - 12, this.config.rocketVelocity));
        this.lastRocketTime = (new Date()).valueOf();
    }
};

// 일시 정지 상태를 나타내는 객체
function PauseState() {

}

// 일시 정지 상태에서 키가 눌렸을 때의 처리
PauseState.prototype.keyDown = function(game, keyCode) {

    if(keyCode == 80) {
        // 일시 정지 상태를 팝
        game.popState();
    }
};

// 일시 정지 상태를 그리는 함수
PauseState.prototype.draw = function(game, dt, ctx) {

    // 배경을 지우기
    ctx.clearRect(0, 0, game.width, game.height);

    ctx.font="14px Arial";
    ctx.fillStyle = '#ffffff';
    ctx.textBaseline="middle";
    ctx.textAlign="center";
    ctx.fillText("일시 정지", game.width / 2, game.height/2);
    return;
};

/*  
    레벨 소개 상태

    레벨 소개 상태는 '레벨 X' 메시지와
    레벨에 대한 카운트다운을 표시
*/
function LevelIntroState(level) {
    this.level = level;
    this.countdownMessage = "3";
}

LevelIntroState.prototype.update = function(game, dt) {

    // 카운트다운 업데이트
    if(this.countdown === undefined) {
        this.countdown = 3; //  3초 동안 카운트다운
    }
    this.countdown -= dt;

    if(this.countdown < 2) { 
        this.countdownMessage = "2"; 
    }
    if(this.countdown < 1) { 
        this.countdownMessage = "1"; 
    } 
    if(this.countdown <= 0) {
        // 다음 레벨로 이동하고 이 상태를 팝
        game.moveToState(new PlayState(game.config, this.level));
    }

};

LevelIntroState.prototype.draw = function(game, dt, ctx) {

    // 배경 지우기
    ctx.clearRect(0, 0, game.width, game.height);

    ctx.font="36px Arial";
    ctx.fillStyle = '#ffffff';
    ctx.textBaseline="middle"; 
    ctx.textAlign="center"; 
    ctx.fillText("Level " + this.level, game.width / 2, game.height/2);
    ctx.font="24px Arial";
    ctx.fillText("Ready in " + this.countdownMessage, game.width / 2, game.height/2 + 36);      
    return;
};


/*
 
  Ship

  우주선은 위치만 갖고 있음

*/
function Ship(x, y) {
    this.x = x;
    this.y = y;
    this.width = 20;
    this.height = 16;
}

/*
    Rocket

    우주선에서 발사되고 위치, 속도 및 상태 가지고 있음

    */
function Rocket(x, y, velocity) {
    this.x = x;
    this.y = y;
    this.velocity = velocity;
}

/*
    Bomb

    침입자가 떨어뜨리는 폭탄으로 위치와 속도를 가지고 있음

*/
function Bomb(x, y, velocity) {
    this.x = x;
    this.y = y;
    this.velocity = velocity;
}
 
/*
    Invader 

    침입자는 위치, 유형, 순위/파일만을 가지고 있음
*/

function Invader(x, y, rank, file, type) {
    this.x = x;
    this.y = y;
    this.rank = rank;
    this.file = file;
    this.type = type;
    this.width = 18;
    this.height = 14;
}

/*
    게임 상태

    게임 상태는 간단히 업데이트 및 드로우 프로시저
    게임이 이 상태에 있을 때는 업데이트 및 드로우 프로시저가
    호출되며 dt 값이 전달됩니다 (dt는 시간 간격, 즉 초 단위로 전달)

*/
function GameState(updateProc, drawProc, keyDown, keyUp, enter, leave) {
    this.updateProc = updateProc;
    this.drawProc = drawProc;
    this.keyDown = keyDown;
    this.keyUp = keyUp;
    this.enter = enter;
    this.leave = leave;
}