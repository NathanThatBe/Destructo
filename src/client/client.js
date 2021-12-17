'use strict'

const Destructo = () => {
    var _debug = true

    // Setup canvas and context.
    const _canvas = document.getElementById('canvas')
    const _ctx = canvas.getContext('2d')
    
    _ctx.resetTime = () => {
        _ctx.time = {}
        _ctx.time.gameTime = 0
        _ctx.time.wallTime = currentTime()
        _ctx.time.timeStep = 0
    }
    _ctx.resetTime()  // Run once at startup.

    _ctx.updateTime = () => {
        let prevTime = _ctx.time.wallTime
        let currTime = currentTime()
        let timeStep = currTime - prevTime
        _ctx.time.gameTime += timeStep
        _ctx.time.wallTime = currTime
        _ctx.time.timeStep = timeStep
    }

    _ctx.drawDebug = () => {
        _ctx.fillStyle = COLORS.debugText
        _ctx.font = FONTS.debug
        _ctx.textAlign = 'left'
        _ctx.textBaseline = 'top'
        
        // 'debug: t=[game time] ∆[time step] ([frame rate])'
        _ctx.fillText(`debug:  t=${_ctx.time.gameTime.toFixed(2)}s   ∆${(_ctx.time.timeStep * 1000).toFixed(2)}ms   (${(1 / _ctx.time.timeStep).toFixed(0)}fps)`, 0, 0)

        // 'keys: [pressed keys]'
        _ctx.fillText(`keys: [${_ctx.input.down}]`, 0, 24)

        // Draw debug cursor.
        var mouseX = _ctx.input.mouse.x
        var mouseY = _ctx.input.mouse.y
        _ctx.strokeStyle = COLORS.clear
        _ctx.fillStyle = COLORS.cursor
        _ctx.beginPath()
        _ctx.arc(mouseX, mouseY, 5, 0, 2*Math.PI)
        _ctx.fill()
        _ctx.closePath()

        _ctx.fillStyle = COLORS.debugText
        _ctx.textBaseline = 'bottom'
        _ctx.fillText(`x: ${mouseX}, y: ${mouseY}`, mouseX, mouseY)
    }
    
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

    _ctx.resetInput = () => {
        _ctx.input = {
            pressed: [],
            released: [],
            down: [],
            mouse: {
                x: 0,
                y: 0,
            }
        }
    }
    _ctx.resetInput()  // Run once at startup.
    _canvas.addEventListener('mousemove', (event) => {
        _ctx.input.mouse.x = event.offsetX
        _ctx.input.mouse.y = event.offsetY
    })
    document.onkeydown = (event) => {
        if (["Space", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].indexOf(event.code) > -1) {
            event.preventDefault()
        }
        if (event.code === "Backquote" || event.key.toUpperCase() === "P") {
            _debug = !_debug
        }
        if (_ctx.input.down.indexOf(event.key) < 0) {
            _ctx.input.pressed.push(event.key);
            _ctx.input.down.push(event.key);	
        }
    }
    document.onkeyup = (event) => {
        const ii = _ctx.input.down.indexOf(event.key);
        if (ii < 0) return;
        _ctx.input.down.splice(ii, 1);
        _ctx.input.released.push(event.key);
    }

    // Game state.
    var _gameState = {}
    var _board = createDefaultBoard()

    // Core game looooooop.
    function loop() {
        // Update time.
        _ctx.updateTime()

        // Draw background.
        _ctx.fillStyle = COLORS.background
        _ctx.fillRect(0, 0, _ctx.w, _ctx.h)

        // Run debug if enabled.
        if (_debug) _ctx.drawDebug()

        // Draw board.
        drawBoard(_board, _ctx)

        // Request next frame.
        window.requestAnimationFrame(loop)
    }

    // Set up socket events.
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