'use strict'

const Destructo = () => {
    // Setup canvas and context.
    var _canvas = document.getElementById('canvas')
    var _ctx = canvas.getContext('2d')
    _ctx.resetTime = () => {
        _ctx.time = {}
        _ctx.time.gameTime = 0
        _ctx.time.wallTime = currentTime()
        _ctx.time.timeStep = 0
    }
    _ctx.drawDebug = () => {
        _ctx.fillStyle = COLORS.debugText
        _ctx.font = FONTS.debug
        _ctx.textAlign = 'left'
        _ctx.textBaseline = 'top'
        _ctx.fillText(`debug:  t=${_ctx.time.gameTime.toFixed(2)}s   ∆${(_ctx.time.timeStep * 1000).toFixed(2)}ms   (${(1 / _ctx.time.timeStep).toFixed(0)}fps)`, 0, 0)
    }
    _ctx.resetTime()  // Run once at startup.
    
    window.onresize = () => {
        var min_w = 160*2
        var containerDiv = document.getElementById("canvas-container")
        var max_w = containerDiv.offsetWidth
        var max_h = window.innerHeight
        var aspextRatio = (144 / 160)
        var w = Math.max(Math.min(max_w, max_h), min_w)
        var h = Math.floor(w * aspextRatio)
        var ratio = window.devicePixelRatio || 1
        _canvas.width = w * ratio
        _canvas.height = h * ratio
        _ctx.scale(ratio, ratio)
        _canvas.style.width = w + "px"
        _canvas.style.height = h + "px"
        // Set custom values on _ctx.
        _ctx.w = w
        _ctx.h = h
        _ctx.safeMargin = w * 0.05
    }
    window.onresize()  // Run once at startup.

    // Setup input.
    var _mouseX = 0
    var _mouseY = 0
    _canvas.addEventListener('mousemove', (event) => {
        _mouseX = event.offsetX
        _mouseY = event.offsetY
    })
    // TODO(nthunt): Handle keyboard input.
    var _gameState = {}
    var _board = createDefaultBoard()

    function loop() {
        let prevTime = _ctx.time.wallTime
        let currTime = currentTime()
        let timeStep = currTime - prevTime
        _ctx.time.gameTime += timeStep
        _ctx.time.wallTime = currTime
        _ctx.time.timeStep = timeStep
        // Draw background.
        _ctx.fillStyle = COLORS.background
        _ctx.fillRect(0, 0, _ctx.w, _ctx.h)

        // Draw debug text.
        _ctx.drawDebug()

        drawBoard(_board, _ctx)

        // Draw cursor.
        _ctx.strokeStyle = COLORS.clear
        _ctx.fillStyle = COLORS.cursor
        _ctx.beginPath()
        _ctx.arc(_mouseX, _mouseY, 5, 0, 2*Math.PI)
        _ctx.fill()
        _ctx.closePath()

        window.requestAnimationFrame(loop)
    }

    var socket = io()
    socket.on('roomName', (roomName) =>{
        document.getElementById('roomNameDisplay').innerHTML = roomName
    })
    socket.on('gameState', (gameState) => {
        _gameState = gameState
        console.log("Game state: ", _gameState)
    })
    socket.on('startGame', () => {
        loop()
    })

    socket.emit('newGame')
}
Destructo()

const COLORS = Object.freeze({
    'clear': '#00000000',
    'background': '#20142F',
    'text': '#eafffd',
    'debugText': '#EBBC70',
    'boardLines': '#ef959d',
    'cursor': '#ea526f',
    'ship': '#037971',
})

const FONTS = Object.freeze({
    'debug': '24px Arial',
})

function currentTime() {
    return Date.now() * 0.001
}