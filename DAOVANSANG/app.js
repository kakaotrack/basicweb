// Classes
// 다오반상-2020308001
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
  
    draw(ctx){
        ctx.drawImage(this.img, this.x, this.y, this.width, this.height);
    }
  
    rectFromGameObject() {
      return {
        top: this.y,
        left: this.x,
        bottom: this.y + this.height,
        right: this.x + this.width
      }
    }
  }
  
  class Hero extends GameObject {
    constructor(x, y){
        super(x,y);
        (this.width = 99), (this.height = 75);
        this.type = "Hero";
        this.speed = { x: 0, y: 0 };
        this.cooldown = 0;
        this.livesRemaining = 3;
    }
    fire() {
      gameObjects.push(new Laser(this.x + 45, this.y - 10));
      this.cooldown = 400;
   
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
   }
  
  class Enemy extends GameObject {
    constructor (x,y){
        super(x,y);
        (this.width = 98), (this.height = 50);
        this.type = "Enemy";
        let id = setInterval(() => {
            if (this.y < canvas.height - this.height) {
                this.y += 5;          //enemy 속도 
            }
            else {
                console.log('Stopped at', this.y);
                clearInterval(id);
            }
        }
        ,500)
    }
  }
  
  class LaserExplosion extends GameObject {
    constructor(x,y) {
      super(x,y);
      (this.width = 98), (this.height = 70);
      this.type = 'LaserExplosion';
      this.img = laserExplosionImg;
    }
  }
  
  class Laser extends GameObject {
    constructor(x, y) {
      super(x,y);
      (this.width = 9), (this.height = 33);
      this.type = 'Laser';
      this.img = laserImg;
      let id = setInterval(() => {
        if (this.y > 0) {
          this.y -= 20;           //속도 총알
        } else {
          this.dead = true;
          clearInterval(id);
        }
      }, 100)
    }
  }
  
  class EventEmitter {
    constructor(){
      this.listeners = {};
    }
    
    on(message, listener) {
      if (!this.listeners[message]){
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
  
  //Constants
  const Messages = {
    KEY_EVENT_UP: "KEY_EVENT_UP",
    KEY_EVENT_DOWN: "KEY_EVENT_DOWN",
    KEY_EVENT_LEFT: "KEY_EVENT_LEFT",
    KEY_EVENT_RIGHT: "KEY_EVENT_RIGHT",
    KEY_EVENT_SPACE: "KEY_EVENT_SPACE",
    KEY_EVENT_ENTER: "KEY_EVENT_ENTER",
    COLLISION_ENEMY_LASER: "COLLISION_ENEMY_LASER",
    COLLISION_ENEMY_HERO: "COLLISION_ENEMY_HERO",
    GAME_END_WIN: "GAME_END_WIN",
    GAME_END_LOSS: "GAME_END_LOSS",
  };
  
  //Variables
  let heroImg, 
      enemyImg, 
      laserImg,
      laserExplosionImg,
      lifeImg,
      canvas, 
      ctx, 
      gameObjects = [], 
      hero, 
      eventEmitter = new EventEmitter(),
      score = 0,
      gameLoopId;
  
  //Functions
  //공약을 이용해서 게임에 관련된 영상을 다운받아서
  function loadTexture(path) {
      return new Promise((resolve) => {
        const img = new Image()
        img.src = path
        img.onload = () => {
          resolve(img)
        }
      })
    }
    
    function createEnemies() {
      const MONSTER_TOTAL = 5;
      const MONSTER_WIDTH = MONSTER_TOTAL * 98;
      const START_X = (canvas.width - MONSTER_WIDTH) / 2;
      const STOP_X = START_X + MONSTER_WIDTH;
  
      for (let x = START_X; x < STOP_X; x += 98) {
        for (let y = 0; y < 40 * 5; y += 50) {
          const enemy = new Enemy(x, y);
          enemy.img = enemyImg;
          gameObjects.push(enemy);
        }
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
  
    //적과 레이저 물체를 모두 보고 충돌을 기반으로 게임 "dead"에서 제거함
    function updateGameObjects() {
      const enemies = gameObjects.filter(go => go.type === 'Enemy');
      const lasers = gameObjects.filter((go) => go.type === "Laser");
    // 레이저로 무언가를 쳤슴
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
  
    //적접전
    enemies.forEach(enemy => {
      let heroRect =  hero.rectFromGameObject();
      if (intersectRect(heroRect, enemy.rectFromGameObject())){
          eventEmitter.emit(Messages.COLLISION_ENEMY_HERO, {enemy});
          heroRect = 0;
      }
    })
     
      gameObjects = gameObjects.filter(go => !go.dead);
      //폭발을 죽은 것으로 표시함
       gameObjects.forEach((go) => {
         if(go.type === 'LaserExplosion'){
           go.dead = true;
         }
       })
    }
  
    //오른쪽 하단 화면에 점수 상세 내역을 추가하는 기능
    function printScore(message) {
      ctx.font = '25px Arial';
      ctx.strokeStyle = `rgb(210,39,48)`;
      ctx.textAlign = 'left';
      ctx.strokeText(message, 10, canvas.height - 50);
    }
  
    function drawLife() {
      //180 from 인생의 그림을 옆에서 그리기 시작함
      const START_POS = canvas.width - 180;
      for(let i=0; i < hero.livesRemaining; i++){
        ctx.drawImage(
          lifeImg, 
          //각 영상 이동 위치에 대해
          START_POS + (45 * (i+1)),
          canvas.height - 80
          );
      }
    }
  
    function displayMessage(message, color = 'rgb(210,39,48)'){
      ctx.font = '40px Arial';
      ctx.strokeStyle = color;
      ctx.textAlign = 'center';
      //console.log(message);
      ctx.strokeText(message, canvas.width / 2, canvas.height / 2);
    }
  
    function decrementLife() {
      hero.livesRemaining--;
      if (hero.livesRemaining === 0) {
        //Game over
        hero.dead = true;
      }
    }
  
    //종료 상태 확인
    function isHeroDead() {
      return hero.livesRemaining <= 0;
    }
  
    function allEnemiesDead() {
      const enemies = gameObjects.filter((go) => go.type === "Enemy" && !go.dead);
      return enemies.length === 0;
    }
  
    //전체 게임 상태를 초기화하여 영웅/적을 생성하고 이를 배출할 이벤트를 등록함
    function initGame() {
      gameObjects = [];
      createEnemies();
      createHero();
      score = 0;
      //키 명령어에 게시된 메시지 처리
      eventEmitter.on(Messages.KEY_EVENT_UP, () => {
        hero.y -=15 ;
      })
    
      eventEmitter.on(Messages.KEY_EVENT_DOWN, () => {
        hero.y += 15;
      });
    
      eventEmitter.on(Messages.KEY_EVENT_LEFT, () => {
        hero.x -= 15;
      });
    
      eventEmitter.on(Messages.KEY_EVENT_RIGHT, () => {
        hero.x += 15;
      });
  
      eventEmitter.on(Messages.KEY_EVENT_SPACE, () => {
        if (hero.canFire()) {
          hero.fire();
        }
      });
  
      //핸들 레이저/적 충돌
      eventEmitter.on(Messages.COLLISION_ENEMY_LASER, (_, { first, second }) => {
        first.dead = true;
        second.dead = true;
        //배를 폭파시키다
        gameObjects.push(new LaserExplosion(second.x , second.y))
        //점증 점수
        score += 100; 
  
        if (allEnemiesDead()) {
          eventEmitter.emit(Messages.GAME_END_WIN);
        }
      });
      
      //적/영웅 충돌 처리
      eventEmitter.on(Messages.COLLISION_ENEMY_HERO, (_, {enemy}) => {
        console.log(enemy);
        //적을 쳐부수다
        enemy.dead = true;
        //목숨을 잃다
        decrementLife();
  
        if (isHeroDead())  {
          eventEmitter.emit(Messages.GAME_END_LOSS);
          return; // 승리 전의 패배
          //그게 적들의 끝이었는지 확인함
        } else if (allEnemiesDead()) {
          eventEmitter.emit(Messages.GAME_END_WIN);
        }
      }
      );
  
      eventEmitter.on(Messages.GAME_END_WIN, () => {
        endGame(true);
      });
      
      eventEmitter.on(Messages.GAME_END_LOSS, () => {
        endGame(false);
      });
  
      eventEmitter.on(Messages.KEY_EVENT_ENTER, () => {
        resetGame();
      })
  
    }
  
    //게임의 끝을 보다
    function endGame(success){
      clearInterval(gameLoopId);
  
      //약간 지연하여 처리하고 진행 중임
      setTimeout(() => {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.fillStyle = "black";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          if (success) {
            displayMessage(
              "Victory!!! - Press [Enter] to start a new game",
              "green"
            );
          } else {
            displayMessage(
              "You died !!! Press [Enter] to start a new game");
          }
        },200)
    }
  
    //게임의 재설정을 처리함
    function resetGame() {
      if(gameLoopId){
        clearInterval(gameLoopId);
        eventEmitter.clear();
        initGame();
        gameLoopId = setInterval(() => {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.fillStyle = "black";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          printScore('Score: ' + score);
          updateGameObjects();
          drawLife();
          drawGameObjects(ctx);
        }, 100);
      }
    }
  
    //캔버스에 각 게임 오브젝트 그리기
    //게임 오브젝트 그리기 기능 호출
    function drawGameObjects(ctx) {
      gameObjects.forEach(go => go.draw(ctx));
    }
  
    //함수는 모든 교점을 기준으로 두 개의 직사각형을 취하고 참/거짓을 반환함
    function intersectRect(r1, r2) {
      return !(r2.left > r1.right ||
        r2.right < r1.left ||
        r2.top > r1.bottom ||
        r2.bottom < r1.top);
    }
  
  //창 로드 시(시작)
    window.onload = async () => {
      canvas = document.getElementById('canvas')
      ctx = canvas.getContext('2d')
      //핵심자산적재하                 (사진 연결)
      heroImg = await loadTexture('./assets/gun.png');
      enemyImg = await loadTexture('./assets/chicken.png');
      laserImg = await loadTexture('./assets/dan.png');
      laserExplosionImg = await loadTexture('./assets/chickenno.png');
      lifeImg = await loadTexture('./assets/chickenlife.png');
      
      //게임 초기화
      initGame();
      gameLoopId = setInterval(() => {
           
          ctx.clearRect(0,0,canvas.width, canvas.height);
          ctx.fillStyle = 'black'
          ctx.fillRect(0,0,canvas.width, canvas.height);
          printScore('Score: ' + score);
          updateGameObjects();
          drawLife();
          drawGameObjects(ctx);
          
        },100)
    }
    
    let onKeyDown = function(e) {
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
          break; // 다른 키를 차단하지 않음
      }
    };
  
    window.addEventListener("keydown", onKeyDown);
  
    //모든 컨트롤의 키업 리스너
    //작업관리: "보유" 방향 키를 처리하기 위해 리팩터
    //On ToDo: 일관된 이동을 처리하기 위해 현재 키다운으로 변경되었슴
    window.addEventListener("keydown", (evt) => {//
      if (evt.key === "ArrowUp") {
        eventEmitter.emit(Messages.KEY_EVENT_UP);
      } else if (evt.key === "ArrowDown") {
        eventEmitter.emit(Messages.KEY_EVENT_DOWN);
      } else if (evt.key === "ArrowLeft") {
        eventEmitter.emit(Messages.KEY_EVENT_LEFT);
      } else if (evt.key === "ArrowRight") {
        eventEmitter.emit(Messages.KEY_EVENT_RIGHT);
      } else if(evt.key === " ") { //Space bar 
       eventEmitter.emit(Messages.KEY_EVENT_SPACE);
      }
      else if(evt.key === "Enter") {
        eventEmitter.emit(Messages.KEY_EVENT_ENTER);
      }
    });