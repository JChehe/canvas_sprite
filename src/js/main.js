require('../index.html')
require('../css/main.scss')
// require('../img/coin_sprite.png')

window.requestAnimFrame = (function(callback) {
  return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame ||
  function(callback) {
    window.setTimeout(callback, 1000 / 60);
  };
})();



function Sprite (options) {
	this.context = options.context
	this.width = options.width
	this.height = options.height
	this.image = options.image
	this.imageDirection = options.imageDirection || 'left-right' // left-right / top-bottom
	this.numberOfFrames = options.numberOfFrames || 1
	this.animationDirction = options.animationDirction || 'normal'
	this.frameIndex = (this.animationDirction === 'reverse' || this.animationDirction === 'alternate-reverse') ? this.numberOfFrames - 1 : 0
	// 由于 requestAnimation 的 60帧，当一般逐帧动画并不需要这么多帧。
	// tickCount 与 tickPerFrame 配合使用，用于控制每帧率含有多少帧，若 tickPerFrame 设置为4，则每秒执行15帧
	this.tickCount = 0
	this.ticksPerFrame = options.ticksPerFrame || 0

	this.loopCount = 0
}

Sprite.prototype._render = function() {
	this.context.clearRect(0, 0, this.width, this.height)
	// context.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh)

	if(this.imageDirection === 'top-bottom') {
		this.context.drawImage(
			this.image,
			0, 
			this.frameIndex * this.height, 
			this.width,
			this.height,
			0, 
			0, 
			this.width, 
			this.height)
	} else {
		this.context.drawImage(
			this.image, 
			this.frameIndex * this.width, 
			0,
			this.width, 
			this.height, 
			0, 
			0, 
			this.width, 
			this.height)
	}
}

Sprite.prototype._update = function() {
	this.tickCount += 1

	if(this.tickCount > this.ticksPerFrame) {
		this.tickCount = 0
		
		if(this.animationDirction === "reverse") {
			if(this.frameIndex > 0) {
				this.frameIndex--
			} else {
				this.frameIndex = this.numberOfFrames - 1
				this.loopCount++
			}
		} else if(this.animationDirction === "alternate") {
			if(this.loopCount % 2 === 0) {
				if(this.frameIndex < this.numberOfFrames - 1) {
					this.frameIndex += 1	
				} else {
					this.loopCount += 1
				}
			} else {
				if(this.frameIndex > 0) {
					this.frameIndex -= 1
				} else {
					this.loopCount += 1
				}
			}
		} else if(this.animationDirction === 'alternate-reverse') {
			if(this.loopCount % 2 === 0) {
				if(this.frameIndex > 0) {
					this.frameIndex--
				} else {
					this.loopCount++
				}
			} else {
				if(this.frameIndex < this.numberOfFrames -1 ) {
					this.frameIndex += 1
				} else {
					this.loopCount++
				}
			}
		} else {
			if(this.frameIndex < this.numberOfFrames - 1) {
				this.frameIndex += 1
			} else {
				this.frameIndex = 0
				this.loopCount++
			}
		}
	}
}

Sprite.prototype.loop = function() {
	requestAnimFrame(this.loop.bind(this))	
	this._update()
	this._render()
}


var coinImage = new Image()
var coinImageSrc = "img/coin_sprite.png"

coinImage.src = coinImageSrc

var coin = new Sprite({
	context: document.getElementById('coin-sprite').getContext('2d'),
	width: 100,
	height: 100,
	image: coinImage,
	ticksPerFrame: 4,
	numberOfFrames: 10
})

coinImage.onload = function() {
	coin.loop()
}

var bearImageSrc = "img/bear.png"
var bearImage = new Image()
bearImage.src = bearImageSrc
var bear = new Sprite({
	context: document.getElementById('bear-sprite').getContext('2d'),
	width: 960/20,
	height: 27,
	image: bearImage,
	ticksPerFrame: 4,
	numberOfFrames: 20,
	animationDirction: 'alternate-reverse'
})
bearImage.onload = function() {
	bear.loop()
}