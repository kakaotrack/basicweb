var invaders;  // 애플 그룹
var canvas;  // 캔버스 엘리먼트
var context;  // 캔버스 컨텍스트
var direction = 0;  // 이동 방향 (0 = 오른쪽, 1 = 왼쪽)
var tank;  // 플레이어 탱크
var defenderImg;  // 안드로이드 이미지
var invaderImg;  // 애플 이미지
var descend = false;  // 애플 하강 여부
var laser = null;  // 레이저 객체
var invaderSpeed;  // 애플 이동 속도
var totalScore;  // 총 점수
var level;  // 현재 레벨

// 상수
var numColInvaders = 12;  // 애플 열 수
var numRowInvaders = 3;  // 애플 행 수
var invaderHeight;  // 애플 높이
var invaderWidth;  // 애플 너비
var laserWidth = 3;  // 레이저 너비
var laserHeight = 10;  // 레이저 높이
var defenderHeight = 30;  // 플레이어 높이
var defenderWidth = 30;  // 플레이어 너비
var tankHeightRatio = 0.9;  // 안드로이드높이 비율

// 애플 객체 생성자
function Invader(x, y) {
    this.x = x;
    this.y = y;
    this.hit = false;  // 맞았는지 여부
}

// 안드로이드객체 생성자
function Tank(x, y) {
    this.x = x;
    this.y = y;
}

// 레이저 객체 생성자
function Laser(x, y){
    this.x = x;
    this.y = y;
}

// 캔버스 컨텍스트에 clear 메서드 추가
CanvasRenderingContext2D.prototype.clear =
    CanvasRenderingContext2D.prototype.clear || function (preserveTransform) {
        if (preserveTransform) {
            this.save();
            this.setTransform(1, 0, 0, 1, 0, 0);
        }

        this.clearRect(0, 0, this.canvas.width, this.canvas.height);

        if (preserveTransform) {
            this.restore();
        }
    };

// 페이지 로드 시 초기화
window.onload = function() {
    canvas = document.getElementById("gameCanvas");
    context = canvas.getContext("2d");
    canvas.focus();
    keySetup("menu");
    menuSetup();
}

// 메뉴 설정
function menuSetup(){
    context.clear(true);
    context.font = '20pt Arial';
    context.textAlign = "center";
    context.fillStyle = "#000000";
    context.fillText("애플 침공", canvas.width/2, canvas.height/5);

    context.font = '15pt Arial';
    context.textAlign = "center";
    context.fillStyle = "#000000";
    context.fillText("1. Level 1", canvas.width/2, canvas.height/3.5);
    context.fillText("2. Level 2", canvas.width/2, canvas.height/2.7);
    context.fillText("3. Level 3", canvas.width/2, canvas.height/2.2);
    context.fillText(" 애플의 침공으로부터 막아내야한다 안드로이드여",canvas.width/2, canvas.height/1.6);
    context.fillText("제작자: 컴퓨터공학과 2018108251 김재형", canvas.width/2, canvas.height/1.2);
    totalScore = 0;
}

// 키 설정
function keySetup(type){
    switch(type){
        case "menu":
            canvas.onkeyup = function(event){
                var keyCode;
                if(event == null){
                    keyCode = window.event.keyCode;
                } else {
                    keyCode = event.keyCode;
                }
                switch(keyCode){
                    case 49:
                        level = 1;
                        initializeGame(1);
                        invaderSpeed = 700;
                        break;
                    case 50:
                        level = 2;
                        numRowInvaders = 3;
                        initializeGame(2);
                        invaderSpeed = 500;
                        break;
                    case 51:
                        level = 3;
                        numRowInvaders = 4;
                        initializeGame(3);
                        invaderSpeed = 200;
                        break;
                    default:
                        break;
                }
            }
            break;
        case "game":
            canvas.onkeydown = function(event){
                var keyCode;
                if (event == null){
                    keyCode = window.event.keyCode;
                } else{
                    keyCode = event.keyCode;
                }

                switch(keyCode){
                    // 왼쪽 키
                    case 37:
                        moveTankLeft();
                        break;
                    // 스페이스바 또는 위쪽 키
                    case 32:
                    case 38:
                        fire();
                        break;
                    // 오른쪽 키
                    case 39:
                        moveTankRight();
                        break;
                    default:
                        break;
                }
            }
            break;
        default:
            canvas.onkeyup = null;
            canvas.onkeydown = null;
    }
}

// 게임 초기화
function initializeGame(level){
    canvas.onkeyup = null;
    context.clear(true);

    invaderHeight = Math.round(canvas.width/18);
    invaderWidth = Math.round(canvas.width/18);

    tank = new Tank(canvas.width/2, canvas.height * tankHeightRatio);

    invaders = new Array(numRowInvaders);
    for (var i = 0; i < invaders.length; i++) {
        invaders[i] = new Array(numColInvaders);
    }

    defenderImg = new Image();
    defenderImg.src = 'images/android.png';

    invaderImg = new Image();
    invaderImg.src = 'images/apple.png';

    initializeInvaders();
}

// 애플 초기화
function initializeInvaders(){
    var x = 45;
    var y = 20;
    for(var i = 0; i < invaders.length; i++){
        for(var j = 0; j < invaders[i].length; j++){
            invaders[i][j] = new Invader(x, y);
            x += invaderWidth + 10;
        }
        x = 45;
        y += invaderHeight + 10;
    }

    draw();
    keySetup("game");
}

// 레이저 발사
function fire(){
    if (laser != null) return;
    laser = new Laser(tank.x + invaderWidth/2, tank.y - invaderHeight);
    drawLaser();
}

// 탱크를 왼쪽으로 이동
function moveTankLeft(){
    context.clearRect(tank.x, tank.y, defenderWidth, defenderHeight);
    context.clear
    if (tank.x - 8 > 0){
        tank.x -= 8;
    }
    context.drawImage(defenderImg, tank.x, tank.y, defenderWidth, defenderHeight);
}

// 탱크를 오른쪽으로 이동
function moveTankRight(){
    context.clearRect(tank.x, tank.y, defenderWidth, defenderHeight);
    if (tank.x + 38 < canvas.width){
        tank.x += 8;
    }
    context.drawImage(defenderImg, tank.x, tank.y, defenderWidth, defenderHeight);
}

// 레이저 그리기
function drawLaser() {
    if(laser == null) return;
    if(invaders[0][0].y > laser.y) {
        laser = null;
        return;
    }
    if (laser.y < 0) {
        laser = null;
        return;
    }

    context.clearRect(laser.x - 1, laser.y, laserWidth + 2, laserHeight);
    laser.y -= 10;
    context.fillStyle = "#00ff00";
    context.fillRect(laser.x, laser.y, laserWidth, laserHeight);

    for(var i = invaders.length - 1; i >= 0; i--){
        for(var j = 0; j < invaders[i].length; j++){
            if (!invaders[i][j].hit) {
                if (ifLaserHit(i, j)) break;
            }
        }
    }
    setTimeout(function() {drawLaser()}, 6);

}

// 레이저와 애플 충돌 여부 확인
function ifLaserHit(i, j) {
    if (laser == null) return;
    if (((laser.x > invaders[i][j].x || (laser.x + laserWidth) > invaders[i][j].x)
        && (laser.x < (invaders[i][j].x + invaderWidth) || (laser.x + laserWidth) < (invaders[i][j].x + invaderWidth)))
        && ((laser.y > invaders[i][j].y || (laser.y + laserHeight) > invaders[i][j].y)
        && (laser.y < (invaders[i][j].y + invaderHeight) || (laser.y + laserHeight) < (invaders[i][j].y + invaderHeight))))
    {
        invaders[i][j].hit = true;
        laser = null;
        totalScore += 100;
        return true;
    }
    return false;
}

// 레벨 클리어 여부 확인
function checkIfWon () {
    if (totalScore >= numColInvaders*numRowInvaders*100) {
        alert("You have passed level: " + level);
        menuSetup();
        keySetup("menu");
        canvas.onkeydown = null;
        return true;
    }
    return false;
}

// 게임 그리기
function draw(){
    context.clear(true);
    context.font = '15pt Arial';
    context.textAlign = "center";
    context.fillStyle = "#000000";
    context.fillText("Score: " + totalScore, 50, 20);
    for(var i = 0; i < invaders.length; i++){
        for(var j = 0; j < invaders[i].length; j++){
            if (invaders[i][j].hit == false){
                if(invaders[i][j].y + invaderHeight > canvas.height * tankHeightRatio){
                    alert("game over. Score :" + totalScore);
                    menuSetup();
                    keySetup("menu");
                    canvas.onkeydown = null;
                    return;
                }
                context.drawImage(invaderImg, invaders[i][j].x, invaders[i][j].y, invaderWidth, invaderHeight);
            }
            if (descend){
                invaders[i][j].y += 10;
            } else{
                if (direction == 0){
                    invaders[i][j].x += 10;
                } else {
                    invaders[i][j].x -= 10;
                }
            }
        }
    }
    if (descend){
        descend = false;
    } else{
        if(invaders[0][numColInvaders - 1].x + invaderWidth > (canvas.width * 0.98)){
            direction = 1;
            descend = true;
        } else if (invaders[0][0].x < (canvas.width * 0.03)) {
            direction = 0;
            descend = true;
        }
    }
    context.drawImage(defenderImg, tank.x, tank.y, defenderWidth, defenderHeight);
    if (laser != null) {
        context.fillStyle = '#00ff00';
        context.fillRect(laser.x, laser.y, laserWidth, laserHeight);
    }
    if(checkIfWon()){
        return;
    }
    setTimeout(function() {draw();}, invaderSpeed);
}
