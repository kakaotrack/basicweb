/*
	Starfield는 div를 가져와 starfield로 변환하는 기능을 제공

*/

// starfield 클래스를 정의
function Starfield() {
	this.fps = 30;
	this.canvas = null;
	this.width = 0;
	this.width = 0;
	this.minVelocity = 15;
	this.maxVelocity = 30;
	this.intervalId = 0;
}

//	starfield를 초기화
Starfield.prototype.initialise = function(div) {
	var self = this;

	//	div를 저장
	this.containerDiv = div;
	self.width = window.innerWidth;
	self.height = window.innerHeight;

	window.onresize = function(event) {
		self.width = window.innerWidth;
		self.height = window.innerHeight;
		self.canvas.width = self.width;
		self.canvas.height = self.height;
		self.draw();
 	}

	//	캔버스를 생성
	var canvas = document.createElement('canvas');
	div.appendChild(canvas);
	this.canvas = canvas;
	this.canvas.width = this.width;
	this.canvas.height = this.height;
};

Starfield.prototype.start = function() {

	var self = this;
	// 타이머를 시작
	this.intervalId = setInterval(function() {
		self.draw();	
	}, 1000 / this.fps);
};

Starfield.prototype.stop = function() {
	clearInterval(this.intervalId);
};

Starfield.prototype.draw = function() {

	// 그리기 컨텍스트를 가져오기
	var ctx = this.canvas.getContext("2d");

	// 배경을 그리기
 	ctx.fillStyle = '#000000';
	ctx.fillRect(0, 0, this.width, this.height);
};
