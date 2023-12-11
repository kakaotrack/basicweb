"use strict";

var canvas = document.getElementById('game');
var context = canvas.getContext('2d');

/*
 * 비행기 객체의 정보.
 */
var spaceship = {
  x: 100,
  y: 700,
  width: 40,
  height: 40,
  counter: 0
};

/* 
 * 게임 상태 정보
 */
var game = {
  state: "start"
};

//눌린 키보드 값
var keyboard = {};

//사용자의 레이저
var lasers = [];

//적 기기 객체
var invaders = [];

//5단계 보스
var king = [];

//적 기기의 미사일
var invaderMissiles = [];

//적 비행기 목숨. 스테이지별로 달라진다.
var invader_life = []	

/*
 * 각 객체의 이미지 및 소리
 */
var spaceship_image;				//사용자 비행기
var invader_image;					//적 비행기
var missle_image;					//적 미사일
var laser_image;					//사용자 미사일
var boom_image;						//비행기 폭발 이미지
var invaderboom_image;    //적 폭발 이미지
var hit_invader;					//적 비행기가 맞았을 경우
var star_image1;					//별 이미지 1
var star_image2;					//별 이미지 2
var star_image3;					//별 이미지 3
var star_image4;					//별 이미지 4
var star_image5;					//별 이미지 5

var laser_sound;					//사용자 미사일 발사 소리
var missle_sound;					//적 미사일 소리
var explosion_sound;				//폭발 소리
var invader_explosion_sound;		//적기기 파괴 소리
var play_again_sound;				//게임 재시작 소리
var win_sound;				//승리 사운드
var back_ground_image_search = 0;	//배경 이미지 변환 변수
var user_laser_num			 = 0;	//사용자 비행기 미사일 개수 제한

var start_video = document.getElementById('start_video');

start_video.addEventListener('ended', function() {
  this.currentTime = 0; // 비디오 재생 시간을 다시 0으로 설정하여 반복 재생
  this.play();
}, false);


var level					 = 1;	//스테이지 레벨 변수.
var invader_index;

var game_loop_control;

var random_x = new Array();
var random_y = new Array();

//clearInterval(game_loop_control);
//비디오를 재로딩 함으로써 멈추는 함수
function video_stop()
{
	start_video.load();	
}

//깃발을 지우는 함수.
function picture_clean()
{
	$("#start_picture").hide("fast");
}

/*
 * 게임 종료시 텍스트 출력 변수
 */
var textOverlay = {
  counter: -1,
  title: "",
  subtitle: ""
};

/* 
 *	게임의 상태 갱신
 */
function updateGameState() {
  //게임중이고 적 비행기 숫자가 0일 경우
  if(game.state === "playing" && invaders.length === 0) {
    game.state = "won";
    textOverlay.title = "라운드 클리어";
    textOverlay.subtitle = "Press your space bar";
    textOverlay.counter = 0;
	
    win_sound.play();
	
	//비디오를 꺼내고 재생한다.
	$("#start_video").show("fast");
	start_video.play();
  }
  
  //죽은 상태고 스페이스바를 눌렀을 때
  if(game.state === "over" && keyboard[32]) {
    game.state = "start";
    spaceship.state = "alive";
    textOverlay.counter = -1;

    play_again_sound.pause();
    play_again_sound.currentTime = 0;
  }

  //이긴 상태고 스페이스바를 눌렀을 때
  if(game.state === "won" && keyboard[32]) {
    game.state = "start";
    spaceship.state = "alive";
    textOverlay.counter = -1;

    win_sound.pause();
    win_sound.currentTime = 0;
	level++;
	if(level > 5)
		level = 1;
	}

  if(textOverlay.counter >= 0 ) {
    textOverlay.counter++;
  }
}

/*
 * 게임이 시작되거나 끝날때..
 */
function updateBackground() {
  // 게임이 실행되면 동영상을 감춘다.  
  if(game.state == "start")
  {
	$("#start_video").hide("fast");	//감춘다
	video_stop();
  }

  
}

// 적 비행기 미사일 객체 정보 반환 함수
function addInvaderMissle(invader){

  missle_sound.play(); 				//소리재생

  return {
    x: invader.x,
    y: invader.y,
    width: 10,
    height: 33,
    counter: 0
  };
}

/*
 * 적 미사일 객체 그리기 함수
 */
function drawInvaderMissiles() {
  for(var iter in invaderMissiles) {
    var missle = invaderMissiles[iter];

	if(level == 5)
	{
		context.drawImage(
		  missle_image,
		  missle.x, missle.y, missle.width, missle.height
		);
		context.drawImage(
		  missle_image,
		  missle.x+120, missle.y, missle.width, missle.height
		);
		context.drawImage(
		  missle_image,
		  missle.x+240, missle.y, missle.width, missle.height
		);
		context.drawImage(
		  missle_image,
		  missle.x-120, missle.y, missle.width, missle.height
		);
	}
	else
	{
		context.drawImage(
		  missle_image,
		  missle.x, missle.y, missle.width, missle.height
		);
	}
  }
}

/*
 *	적 미사일 객체 속도
 */
function updateInvaderMissiles() {
  for(var iter in invaderMissiles) {
    var laser = invaderMissiles[iter];
	if(level == 5)
	{
		laser.y += 10;
		laser.counter++;
	}
	else
	{
		laser.y += 4;
		laser.counter++;
	}
  }
  //적 미사일이 맵을 넘어가면 삭제
  invaderMissiles = invaderMissiles.filter(function(laser) {
    return laser.y <= 800;
  });
}

/*
 * 적 비행기 그리기 함수
 */
function updateInvaders() {
  // populate invaders array
  if(game.state === "start") {

    invaders = []; // be sure to reset the invaders array when starting a new game

	if (level == 1)
	{
		for(var iter = 0; iter < 10; iter++) {
		  invaders.push({
			x: 10 + iter * 40, //간격 사이에 영향을 준다.
			y: 10,
			height: 40,
			width: 40,
			phase: Math.floor(Math.random() * 50),
			counter: 0,
			life : 10,
			reverse : 0,
			state: "alive"
		  });
		}
	}
	
	if (level == 2)
	{
		for(var iter = 0; iter < 20; iter++) {
		  invaders.push({
			x: 10 + iter * 30,
			y: 10,
			height: 40,
			width: 40,
			phase: Math.floor(Math.random() * 100),
			counter: 0,
			life : 20,
			reverse : 0,
			state: "alive"
		  });
		}
	}
	
	if (level == 3)
	{
		for(var iter = 0; iter < 30; iter++) {
		  invaders.push({
			x: 10 + iter * 30,
			y: 10,
			height: 40,
			width: 40,
			phase: Math.floor(Math.random() * 150),
			counter: 0,
			life : 30,
			reverse : 0,
			state: "alive"
		  });
		}
	}
	
	if (level == 4)
	{
		for(var iter = 0; iter < 40; iter++) {
		  invaders.push({
			x: 10 + iter * 30,
			y: 10,
			height: 40,
			width: 40,
			phase: Math.floor(Math.random() * 200),
			counter: 0,
			life : 40,
			reverse : 0,
			state: "alive"
		  });
		}
	}
	
	if (level == 5)
	{
		for(var iter = 0; iter < 1; iter++) {
		  invaders.push({
			x: 20 + iter * 10,
			y: 10,
			height: 200,
			width: 200,
			phase: Math.floor(Math.random() * 250),
			counter: 0,
			life : 800,
			reverse : 0,
			state: "alive"
		  });
		}
	}
    game.state = "playing";
  }

  // invaders float back and forth
  for(var iter2 in invaders) {
    var invader = invaders[iter2];

    if(!invader) {
      continue;
    }
	
	//적 객체가 살아있는 상태에서 counter 값이 1 증가하고 반동하게 된다.
    if(invader && invader.state === "alive") {
      invader.counter++;
	  
	  if(level == 5)
	  {
		  if(invader.reverse == 1)	//만약 오른쪽 라인에 걸치게 되면 반대로 움직인다.
			invader.x -= Math.sin(invader.counter * Math.PI * 2 / 100) * 10;	//객제 반동 
		  else if (invader.reverse == 2)	
			invader.x += Math.sin(invader.counter * Math.PI * 2 / 100) * 10;	//객제 반동 
		  else						//기본움직임
			invader.x += Math.sin(invader.counter * Math.PI * 2 / 100) * 10;	//객제 반동 
			
		  if(invader.x >= 550)
		  {
			invader.reverse = 1;
			invader.x = 550;
			invader.x -= Math.sin(invader.counter * Math.PI * 2 / 100) * 10;	//객제 반동 
		  }
		  else if(invader.x <= 50)
		  {
			invader.reverse = 2;
			invader.x = 50;
			invader.x += Math.sin(invader.counter * Math.PI * 2 / 100) * 10;	//객제 반동 
		  }
	  }
	  
	  else{
	  
		  if(invader.reverse == 1)	//만약 오른쪽 라인에 걸치게 되면 반대로 움직인다.
			invader.x -= Math.sin(invader.counter * Math.PI * 2 / 100) * 3;	//객제 반동 
		  else if (invader.reverse == 2)	
			invader.x += Math.sin(invader.counter * Math.PI * 2 / 100) * 3;	//객제 반동 
		  else						//기본움직임
			invader.x += Math.sin(invader.counter * Math.PI * 2 / 100) * 3;	//객제 반동 
			
		  if(invader.x >= 550)
		  {
			invader.reverse = 1;
			invader.x = 550;
			invader.x -= Math.sin(invader.counter * Math.PI * 2 / 100) * 3;	//객제 반동 
		  }
		  else if(invader.x <= 50)
		  {
			invader.reverse = 2;
			invader.x = 50;
			invader.x += Math.sin(invader.counter * Math.PI * 2 / 100) * 3;	//객제 반동 
		  }
	  }
	  
      // 동시에 미사일 발사
	  if(level == 5)
	  {
		  if((invader.counter + invader.phase) % 13 === 0) {
			invaderMissiles.push(addInvaderMissle(invader));
		  }
	  }
	  else{
		  if((invader.counter + invader.phase) % 200 === 0) {
			invaderMissiles.push(addInvaderMissle(invader));
		  }
	  }
    }
	
	// 적 객체가 공격당하면 counter가 늘어난다.
    if(invader && invader.state === "hit") {
//		if(level == 1)
			invader.counter++;
      // change state to dead to be cleaned up
	  //초기에 counter 가 1이므로 비행기 10개면 10이 된다. 여기서 죽을때마다 1씩 증가하므로 20개가  전멸한것이다.
      if(invader.counter >= 20) {
        invader.state = "dead";
        invader.counter = 0;
      }
    }

  }

  invaders = invaders.filter(function(event) {
    if (event && event.state !== 'dead') { return true; }
    return false;
  });

}

/*
 * 적 객체 이미지 생성
 */
function drawInvaders() { 
  for(var iter in invaders) {
    var invader = invaders[iter];

    if(invader.state === "alive") {
      context.drawImage(
        invader_image, 
        invader.x, invader.y, invader.width, invader.height
      );	  
    }
	//적의 미사일에 맞은 경우 먼저 check 상태로 진입한다. 이곳에서 life 변수를 체크하여 0보다 낮을 경우 hit 상태로 변경시켜준다.
	//그 외의 경우에는 check 상태의 이미지를 띄운 후 alive 상태로 돌려준다.
    if(invader.state === "check") {
			invader_explosion_sound.play();
			context.drawImage(hit_invader,invader.x, invader.y, invader.width, invader.height);
			invader.state = "alive";
			if(invader.life <= 0)
				invader.state = "hit";
    }
	
	//적이 미사일에 맞을 경우
    if(invader.state === "hit") {
			invader_explosion_sound.play();
			context.drawImage(invaderboom_image,invader.x, invader.y, invader.width, invader.height);
    }
	//적이 미사일에 맞아 죽을 경우
    if(invader.state === "dead") {
      context.fillStyle = "black";
      context.fillRect(invader.x, invader.y, invader.width, invader.height);
    }

  }
}

/*
 * 배경을 그린다(검정색 , canvas 전체)
 */
function drawBackground() {

	context.fillStyle = "#000000";							// 바탕을 검음색으로
	context.fillRect(0, 0, canvas.width, canvas.height);	// 범위는 캔버스 전체
	
	var star_number = 25;									// 별의 개수는 25개
	
	if(back_ground_image_search/70 == 1){					// 배경 체크 변수가 70으로 나누어 떨어지면 별의 좌표를 랜덤으로 지정.
		for(var i = 0; i < star_number; i++)
		{
			random_x[i] = Math.floor(Math.random() * 550)+1;	//x축 지정
			random_y[i] = Math.floor(Math.random() * 750)+1;	//y축 지정
		}
	}
	else if (back_ground_image_search == 0)					//첫 시작의 경우 
	{
		for(var i = 0; i < star_number; i++)
		{
			random_x[i] = Math.floor(Math.random() * 550)+1;
			random_y[i] = Math.floor(Math.random() * 750)+1;
		}
	}
			
	for(var i = 0; i < 100; i++)							//반짝이며 다섯개의 이미지가 랜덤으로 출력됨.
	{
		var image_num = Math.floor(Math.random() * 5)+1;
		if(image_num == 1)
			context.drawImage(star_image1,random_x[i], random_y[i], 20,20);
		else if(image_num == 2)
			context.drawImage(star_image2,random_x[i], random_y[i], 20,20);
		else if(image_num == 3)
			context.drawImage(star_image3,random_x[i], random_y[i], 20,20);
		else if(image_num == 4)
			context.drawImage(star_image4,random_x[i], random_y[i], 20,20);
		else if(image_num == 5)
			context.drawImage(star_image5,random_x[i], random_y[i], 20,20);
	}
	//배경 체크 변수가 70이 되면 1로 다시 되돌린다.
	if(back_ground_image_search == 70)
			back_ground_image_search = 1;
		
}

/*
 * 사용자 미사일 속도
 */
function updateLasers() {
  // move the laser
  for(var iter in lasers) {
    var laser = lasers[iter];
    laser.y -= 12;
    laser.counter++;
	
	if(laser.y < 0)		//벽을 넘어갈 경우 미사일 한도갯수를 늘려준다.
		user_laser_num--;
	
  }

  // remove lasers that are off the screen
  // 스크린 밖의 미사일을 없앤다.
  lasers = lasers.filter(function(laser) {
    return laser.y >= 0;
  });

}

// 사용자 미사일 객체의 값 저장한다.
function fireLaser() {
  //만약 발사된 미사일 개수가 3개가 넘어갈경우 발사 안됨.
  if(user_laser_num >= 3)
  {
	return;
  }
	//미사일을 쏘면 한도 갯수를 줄여준다.
	user_laser_num++;
	if(user_laser_num > 3)
		user_laser_num = 3;
	if(user_laser_num < 0)            
		user_laser_num = 0;
  
  laser_sound.play();	//소리 재생

  lasers.push ({
    x: spaceship.x + 20, //offset 
    y: spaceship.y - 10,
    width: 5,
    height: 30,
    counter: 0
  });
}

//사용자 비행기의 상태를 업데이트 한다.
function updateSpaceship() {
  //죽을 경우 함수 종료
  
  if(keyboard[32] && spaceship.state === "hit")
  {
	$("#start_video").show("fast");
      start_video.play();
	return;
  }
  
  if (spaceship.state === 'dead') {
    return;
  }

  // move left
  if(keyboard[37]) {
    spaceship.x -= 8;
    if(spaceship.x < 0) { 
      spaceship.x = 0;
    }
  }

  // move right 
  if(keyboard[39]) {
    spaceship.x += 8;
    var right = canvas.width - spaceship.width;
    if(spaceship.x > right) {
      spaceship.x = right;
    }
  }

  if(keyboard[32]) {
    // only fire one laser
    if(!keyboard.fired) {
		fireLaser();
      keyboard.fired = true;
    } else {
      keyboard.fired = false;
    }
  }

  //맞았을 경우
  if(spaceship.state === "hit") {
    spaceship.counter++;
    if(spaceship.counter >= 40) {
      spaceship.counter = 0;			//카운터 초기화
      spaceship.state = "dead";			//비행기 상태를 죽음으로
      game.state = "over";				//게임상태를 패배
      textOverlay.title = "테란 패배";	
      textOverlay.subtitle = "press space bar to play again";
      textOverlay.counter = 0;			//텍스트 카운트 0
      play_again_sound.play();			//소리재생
	  
	  // 숨겨진 동영상을 보여준다.
	  $("#start_video").show("fast");
      start_video.play();
    }
  }
   
 }

function drawSpaceship() {
	//비행기가 죽을 경우
  if(spaceship.state === "dead") {
	context.drawImage(boom_image,spaceship.x, spaceship.y, spaceship.width, spaceship.height);
	return;
  }
  //미사일 맞을 경우
  if(spaceship.state === "hit") {
    explosion_sound.play();
//    context.fillStyle = "black";
//   context.fillRect(spaceship.x, spaceship.y, spaceship.width, spaceship.height);
	context.drawImage(boom_image,spaceship.x, spaceship.y, spaceship.width, spaceship.height);	
	return;
  }

  context.drawImage(
    spaceship_image,
    0, 0, 50, 50,
    spaceship.x, spaceship.y, spaceship.width, spaceship.height
  );
}

function drawLasers() {
  context.fillStyle = "white";

  for(var iter in lasers) {
    var laser = lasers[iter];
    var count = Math.floor(laser.counter / 4);
    var xoffset = (count % 4) * 24;

    context.drawImage(
      laser_image,
      //24 + 10, 9, 8, 8,
      laser.x, laser.y, laser.width, laser.height
    );

    //context.fillRect(laser.x, laser.y, laser.width, laser.height);
  }
}

function hit(a, b) {
  var ahit = false;
  // horizontal collisions
  if(b.x + b.width >= a.x && b.x < a.x + a.width) {
    // vertical collision
    if(b.y + b.height >= a.y && b.y < a.y + a.height) {
      ahit = true;
    }
  }

  // a in b
  if(b.x <= a.x && b.x + b.width >= a.x + a.width) {
    if(b.y <= a.y && b.y + b.height >= a.y + a.height) {
      ahit = true;
    }
  }

  // b in a
  if(a.x <= b.x && a.x + a.width >- b.x + b.width) {
    if(a.y <= b.y && a.y + a.height >= b.y + b.height) {
      ahit = true;
    }
  }

  return ahit;
}

//
function checkHits() {
  for(var iter in lasers) {
    var laser = lasers[iter];
    for(var inv in invaders) {
      var invader = invaders[inv];
	  invader_index = inv;
      if(hit(laser, invader)) {
		if(level == 1)
		{
			laser.state = "hit";
//			invader.state = "hit";
			invader.state = "check";
			invader.life--;
			invader.counter = 0;
			invader_explosion_sound.play();
		}
		
		else if(level == 2)
		{
			laser.state = "hit";
//			invader.state = "hit";
			invader.state = "check";
			invader.life--;
			invader.counter = 0;
			invader_explosion_sound.play();
		}
		
		else if(level == 3)
		{
			laser.state = "hit";
//			invader.state = "hit";
			invader.state = "check";
			invader.life--;
			invader.counter = 0;
			invader_explosion_sound.play();
		}
		
		else if(level == 4)
		{
			laser.state = "hit";
//			invader.state = "hit";
			invader.state = "check";
			invader.life--;
			invader.counter = 0;
			invader_explosion_sound.play();
		}
		
		else if(level == 5)
		{
			laser.state = "hit";
//			invader.state = "hit";
			invader.state = "check";
			invader.life--;
			invader.counter = 0;
			invader_explosion_sound.play();
			invaderMissiles.push(addInvaderMissle(invader));
		}
		
      }
    }
  }

  // check for enemy hits on the spaceship
  if(spaceship.state === "hit" || spaceship.state === "dead") {
    return;
  }

  for(var iter2 in invaderMissiles) {
    var missle = invaderMissiles[iter2];
    if(hit(missle, spaceship)) {
      missle.state = "hit";
      spaceship.state = "hit";
      spaceship.counter = 0;
    }
  }
}

//
function addEvent(node, name, func) {
  if(node.addEventListener) {
    node.addEventListener(name, func, false);
  } else if(node.attachEvent) {
    // handle Microsoft browsers too
    node.attachEvent(name, func);
  }
}

// 키보드 이벤트
function addKeyboardEvents() {
  addEvent(document, "keydown", function(e) {
    keyboard[e.keyCode] = true;
  });

  addEvent(document, "keyup", function(e) {
    keyboard[e.keyCode] = false;
  });

}

function drawTextOverlay() {
  
  //텍스트 couner가 -1 일 경우 함수 종료
  if(textOverlay.counter === -1) {
    return;
  }

  var alpha = textOverlay.counter / 50.0;

  if(alpha > 1 ) {
    alpha = 1;
  }

  context.globalAlpha = alpha;
  context.save();
  
//졌을경우 
  if(game.state === "over") {
    context.fillStyle = "white";
    context.font = "Bold 40pt Arial";
    context.fillText(textOverlay.title, 140, 400);
    context.font = "14pt Helvectica";
    context.fillText(textOverlay.subtitle, 190, 450);
  }

  //이겼을경우
  if(game.state === "won") {
    context.fillStyle = "white";
    context.font = "Bold 40pt Arial";
    context.fillText(textOverlay.title, 100, 400);
    context.font = "14pt Helvectica";
    context.fillText(textOverlay.subtitle, 190, 450);
  }

 context.restore();
}

function gameLoop() {

  //draw();
  updateGameState();
  updateBackground();
  updateInvaders();
  updateSpaceship();

  updateLasers();
  updateInvaderMissiles();

  checkHits();

  drawBackground();
  drawSpaceship();
  drawInvaders();

  drawInvaderMissiles();
  drawLasers();
  drawTextOverlay();
  
  back_ground_image_search++;	//반복문 실행시마다 1씩 증가.
}

function playSound(file) {
  var sound = document.createElement("audio");
  sound.setAttribute("src", "sounds/" + file + ".wav");
  sound.play();
}

function loadResources() {
  spaceship_image = new Image();
  spaceship_image.src = 'images/spaceship.png';

  missle_image = new Image();
  missle_image.src = 'images/torpedo.png';

  invader_image = new Image();
  invader_image.src = 'images/invader.png';
  
  hit_invader 	= new Image();
  hit_invader.src	= 'images/hit_invader.png';
  
  laser_image = new Image();
  laser_image.src = 'images/laser.png';
  
  invaderboom_image = new Image();
  invaderboom_image.src = 'images/boom.gif';

  boom_image = new Image();
  boom_image.src = 'images/boom.png';
  
  star_image1 = new Image();
  star_image1.src = 'images/star1.png';
  
  star_image2 = new Image();
  star_image2.src = 'images/star2.png';
  
  star_image3 = new Image();
  star_image3.src = 'images/star3.png';
  
  star_image4 = new Image();
  star_image4.src = 'images/star4.png';
  
  star_image5 = new Image();
  star_image5.src = 'images/star5.png';

  missle_sound = document.createElement("audio");
  document.body.appendChild(missle_sound);
  missle_sound.setAttribute("src", "sounds/rocket.wav");

  laser_sound = document.createElement("audio");
  document.body.appendChild(laser_sound);
  laser_sound.setAttribute("src", "sounds/laser.wav");

  explosion_sound = document.createElement("audio");
  document.body.appendChild(explosion_sound);
  explosion_sound.setAttribute("src", "sounds/explosion.wav");

  invader_explosion_sound = document.createElement("audio");
  document.body.appendChild(invader_explosion_sound);
  invader_explosion_sound.setAttribute("src", "sounds/invader_explosion.wav");

  play_again_sound = document.createElement("audio");
  document.body.appendChild(play_again_sound);
  play_again_sound.setAttribute("src", "sounds/darkfactory.ogg");

  win_sound = document.createElement("audio");
  document.body.appendChild(win_sound);
  win_sound.setAttribute("src", "sounds/win.ogg");

}
$("#start_video").hide("fast");		//초기 실행시 동영상을 감춘다.

setTimeout(picture_clean , 3000); 	//3초뒤 화면을 지운다.
setTimeout(loadResources , 3000); 	//3초뒤 이미지 등록을 한다.. 3초뒤 게임이 시작하게 된다.
addKeyboardEvents();
game_loop_control = setInterval(gameLoop, 1000/60);