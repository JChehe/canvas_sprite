require('../index.html')
require('../css/main.scss')
require('../img/coin_sprite.png')
require('../img/bear.png')
require('../img/jd_sprite.png')
var Preloader = require('preloader.js')
preloader = new Preloader({
	concurrency: 3,
	perMinTime: 1000,
  resources: ['../img/coin_sprite.png'
  	, '../img/bear.png'
  	, '../img/jd_sprite.png']
})

function isFunction(obj) {
  return typeof(obj) === 'function';
}

;(function() {
    var lastTime = 0;
    var vendors = ['ms', 'moz', 'webkit', 'o'];
    for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
        window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame'] 
                                   || window[vendors[x]+'CancelRequestAnimationFrame'];
    }
 
    if (!window.requestAnimationFrame)
        window.requestAnimationFrame = function(callback, element) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function() { callback(currTime + timeToCall); }, 
              timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };
 
    if (!window.cancelAnimationFrame)
        window.cancelAnimationFrame = function(id) {
            clearTimeout(id);
        };
}());


var DESIGN_WIDTH = 375 // 以iphone 6 为基准

// 让canvas自适应
function setCanvasScale() {
	var docWidth = window.document.documentElement.getBoundingClientRect().width
	var zoom = docWidth / DESIGN_WIDTH

	var style = document.getElementById('canvas_style')
	if(!style) {
		style = document.createElement('style')
		style.id = 'canvas_style'
	}

	style.innerHTML = '.canvas_reponse { -webkit-transform: scale('+ zoom +'); -moz-transform: scale('+ zoom +'); -ms-transform: scale('+ zoom +'); -o-transform: scale('+ zoom +'); transform: scale('+ zoom +') }'
	document.getElementsByTagName('head')[0].appendChild(style)
}

window.addEventListener('resize', function(e) {
	setCanvasScale()
}, false);

setCanvasScale()


function getRatio(context) {
  var devicePixelRatio = window.devicePixelRatio || 1;
  var backingStorePixelRatio = context.webkitBackingStorePixelRatio ||
		context.mozBackingStorePixelRatio ||
		context.msBackingStorePixelRatio ||
		context.oBackingStorePixelRatio ||
		context.backingStorePixelRatio || 1;
  var ratio = devicePixelRatio / backingStorePixelRatio;
  return ratio;
}

/**
 * Canvas 逐帧动画构造函数
 * 
 * @param {Object} options 含所有初始化属性的对象
 * 
 * options 对象可含有以下属性
 * sWidth 雪碧图中每帧的原始宽度
 * sHeight 雪碧图中每帧的原始宽度
 * dWidth 实际渲染在页面的Canvas 元素宽度
 * dHeight 实际渲染在页面的Canvas 元素高度
 * image image 对象
 * imageDirection 雪碧图的方向 左->右 left-right / 上->下 top-bottom
 * numberOfFrames 共多少帧
 * animationDirction 帧动画的运动方式，与CSS3 animation-direction 相同
 * _frameIndex 当前第几帧
 * _tickCount 由于 requestAnimation 是 60帧，但一般逐帧动画并不需要这么多帧。
 * _ticksPerFrame _tickCount 与 _ticksPerFrame 配合使用，用于控制每秒含有多少帧，若 _ticksPerFrame 设置为4，则每秒执行15帧
 * _loopCount 已执行次数
 * _iterationCount 与 animation-iteration-count 相同，控制动画的执行次数
 * _zoom canvas 是否自适应，一般用户移动端
 * _ratio 获取当前像素比，用于避免渲染模糊
 * _loopId requestAnimationFrame 返回的 id
 * _loopStatus 获取当前对象的运行状态
 * _finishHandle 动画结束时的回调函数
 * 
 */
function Sprite (options) {
	this.canvas = options.canvas
	this.context = options.canvas.getContext('2d')
	this.sWidth = options.sWidth
	this.sHeight = options.sHeight
	this._dWidth = options.dWidth || options.canvas.width
	this._dHeight = options.dHeight || options.canvas.height
	this.image = options.image
	this.imageDirection = options.imageDirection || 'left-right' // left-right / top-bottom
	this.numberOfFrames = options.numberOfFrames || 1
	this.animationDirction = options.animationDirction || 'normal'
	this._frameIndex
	this._tickCount = 0
	this._ticksPerFrame = options.ticksPerFrame || 0
	this._loopCount = 0
	this._iterationCount = options.iterationCount || 'infinite'
	this._zoom = options.zoom || false
	this._ratio = getRatio(this.context)
	this._loopId
	this._loopStatus = options.loopStatus || true
	this._finishHandle = options.finishHandle
	this.init()
}
Sprite.prototype.init = function() {
	this.initFrameIndex()

	this.canvas.width = this._dWidth * this._ratio
	this.canvas.height = this._dHeight * this._ratio
	this.canvas.style.width = this._dWidth + 'px'
	this.canvas.style.height = this._dHeight + 'px'

	if(this._zoom) {
		this.canvas.classList.add('canvas_reponse')
	}

}
Sprite.prototype.initFrameIndex = function() {
	this._frameIndex = (this.animationDirction === 'reverse' 
		|| this.animationDirction === 'alternate-reverse') 
		? this.numberOfFrames - 1 : 0
}
Sprite.prototype._render = function() {
	this.context.clearRect(0, 0, this._dWidth * this._ratio, this._dHeight * this._ratio)
	if(this.imageDirection === 'top-bottom') {
		this.context.drawImage(
			this.image,
			0, 
			this._frameIndex * this.sHeight, 
			this.sWidth,
			this.sHeight,
			0, 
			0, 
			this._dWidth * this._ratio, 
			this._dHeight * this._ratio)
	} else {
		this.context.drawImage(
			this.image, 
			this._frameIndex * this.sWidth, 
			0,
			this.sWidth, 
			this.sHeight, 
			0, 
			0, 
			this._dWidth * this._ratio, 
			this._dHeight * this._ratio)
	}
}

Sprite.prototype._update = function() {
	this._tickCount += 1

	if(this._tickCount > this._ticksPerFrame) {
		this._tickCount = 0
		
		if(this.animationDirction === "reverse") {
			if(this._frameIndex > 0) {
				this._frameIndex--
			} else {
				this._frameIndex = this.numberOfFrames - 1
				this._loopCount++
			}
		} else if(this.animationDirction === "alternate") {
			if(this._loopCount % 2 === 0) {
				if(this._frameIndex < this.numberOfFrames - 1) {
					this._frameIndex += 1	
				} else {
					this._loopCount += 1
				}
			} else {
				if(this._frameIndex > 0) {
					this._frameIndex -= 1
				} else {
					this._loopCount += 1
				}
			}
		} else if(this.animationDirction === 'alternate-reverse') {
			if(this._loopCount % 2 === 0) {
				if(this._frameIndex > 0) {
					this._frameIndex--
				} else {
					this._loopCount++
				}
			} else {
				if(this._frameIndex < this.numberOfFrames -1 ) {
					this._frameIndex += 1
				} else {
					this._loopCount++
				}
			}
		} else {
			if(this._frameIndex < this.numberOfFrames - 1) {
				this._frameIndex += 1
			} else {
				this._frameIndex = 0
				this._loopCount++
			}
		}

		if(this._loopCount >= this._iterationCount) {
			this.pause()
			cancelAnimationFrame(this._loopId)
			if(isFunction(this._finishHandle)) {
				this._finishHandle()
			}
		}
	}
}

Sprite.prototype.loop = function() {
	this._loopId = requestAnimationFrame(this.loop.bind(this))	
	if(this._loopStatus) {
		this._update()
		this._render()	
	}
}

Sprite.prototype.pause = function() {
	this._loopStatus = false
}

Sprite.prototype.play = function() {
	this._loopStatus = true
}

Sprite.prototype.restartAndPlay = function() {
	this.initFrameIndex()
}

Sprite.prototype.getLoopStatus = function() {
	return this._loopStatus
}

Sprite.prototype.toFirstFrameAndPause = function() {
	this.initFrameIndex()
	this.pause()
	this._render()
}

Sprite.prototype.LoopAfterFinsh = Sprite.prototype.loopAgain = function() {
	this._loopStatus = true
	this._loopCount = 0
	this.initFrameIndex()
	cancelAnimationFrame(this._loopId)
	this.loop()
}



// 业务代码


var coin = null
var bear = null
var jd = null

preloader.addProgressListener(function (loaded, length) {
  console.log('loaded', loaded, length, loaded / length)
})
preloader.addCompletionListener(function () {
  $('#o2_loading').remove()
  $('#o2_main').removeClass('hide')

  coin = new Sprite({
		canvas: document.getElementById('coin-sprite'),
		sWidth: 1000/10,
		sHeight: 100,
		dWidth: 1000/10,
		dHeight: 100,
		image: this.get('../img/coin_sprite.png'),
		ticksPerFrame: 4,
		numberOfFrames: 10,
		zoom: true
	})
  coin.loop()

  bear = new Sprite({
		canvas: document.getElementById('bear-sprite'),
		sWidth: 960/20,
		sHeight: 27,
		dWidth: 960/20,
		dHeight: 27,
		image: this.get('../img/bear.png'),
		ticksPerFrame: 4,
		numberOfFrames: 20,
		animationDirction: 'alternate',
		iterationCount: 3,
		zoom: false,
		finishHandle: function() {
			console.log('bear finish!!')
		}
	})
  bear.loop()

  jd = new Sprite({
  	canvas: document.getElementById('jd-sprite'),
  	sWidth: 200,
  	sHeight: 618/3,
  	dWidth: 200 / 2,
  	dHeight: 618/3 / 2,
  	image: this.get('../img/jd_sprite.png'),
  	ticksPerFrame: 20,
  	numberOfFrames: 3,
  	iterationCount: 'infinite',
  	imageDirection: 'top-bottom',
  	zoom: false,
  	finishHandle: function() {
  		console.log('JD Sprite finish!')
  	}
  })
  jd.loop()
})
preloader.start()



document.getElementById('reset').addEventListener('click', function(e) {
	e.stopPropagation()
	e.preventDefault()

	coin.restartAndPlay()

}, false)

document.getElementById('toFirst').addEventListener('click', function(e) {
	e.stopPropagation()
	e.preventDefault()
	coin.toFirstFrameAndPause()
	document.querySelector('#pause').innerText = 'play'
}, false)


document.getElementById('pause').addEventListener('click', function(e) {
	e.preventDefault()
	console.log(coin.getLoopStatus())
	if(coin.getLoopStatus()) {
		coin.pause()
		this.innerText = 'play'
	} else {
		coin.play()
		this.innerText = 'pause'
	}
}, false)


document.querySelector('.loopAgain').addEventListener('click', function(e) {
	e.preventDefault()
	bear.loopAgain()
}, false)

