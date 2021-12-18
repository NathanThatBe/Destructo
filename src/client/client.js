'use strict'

const COLORS = Object.freeze({
    // Generic:
    'clear': '#00000000',
    'white': '#FFFFFF',
    'black': '#000000',
    'yellow': 'rgb(255, 209, 102)',

    // Specific:
    'background': 'rgb(30, 42, 76)',
    'text': '#eafffd',
    'debugText': '#EBBC70',
    'boardLines': '#ef959d',
    'cursor': '#ea526f',
    'selection': '#ea526f',
})

const FONTS = Object.freeze({
    'debug': '24px Arial',
    'button': 'bold 36px Arial',
})

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
                down: false,
                pressed: false,
            }
        }
    }
    _ctx.resetInput()  // Run once at startup.
    _ctx.updateInput = () => {
        _ctx.input.pressed = []
        _ctx.input.released = []
        _ctx.input.mouse.pressed = false
    }
    _canvas.addEventListener('mousemove', (event) => {
        event.preventDefault()
        _ctx.input.mouse.x = event.offsetX
        _ctx.input.mouse.y = event.offsetY
    })
    _canvas.addEventListener('mousedown', (event) => {
        event.preventDefault()
        _ctx.input.mouse.down = true
        _ctx.input.mouse.pressed = true
    })
    _canvas.addEventListener('mouseup', (event) => {
        event.preventDefault()
        _ctx.input.mouse.down = false
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

    _ctx.fillPoint = (x, y, radius) => {
        _ctx.beginPath()
        _ctx.arc(x, y, radius, 0, 2*Math.PI)
        _ctx.fill()
    }

    _ctx.strokePoint = (x, y, radius) => {
        _ctx.beginPath()
        _ctx.arc(x, y, radius, 0, 2*Math.PI)
        _ctx.stroke()
    }
    
    _ctx.drawDebug = () => {
        _ctx.fillStyle = COLORS.debugText
        _ctx.font = FONTS.debug
        _ctx.textAlign = 'left'
        _ctx.textBaseline = 'top'
        
        var l = 0
        var lineHeight = 24
        function line() {
            return l++ * lineHeight
        }

        // 'debug: t=[game time] ∆[time step] ([frame rate])'
        _ctx.fillText(`debug:  t=${_ctx.time.gameTime.toFixed(2)}s   ∆${(_ctx.time.timeStep * 1000).toFixed(2)}ms   (${(1 / _ctx.time.timeStep).toFixed(0)}fps)`, 0, line())

        // 'keys: [pressed keys]'
        _ctx.fillText(`keys: [${_ctx.input.down}]`, 0, line())
        line()

        // 'instructions: ' ...
        _ctx.fillText(`instructions:`, 0, line())
        _ctx.fillText('WASD + Q/E to adjust board transform', 0, line())

        // Draw debug cursor.
        var mouseX = _ctx.input.mouse.x
        var mouseY = _ctx.input.mouse.y
        _ctx.strokeStyle = COLORS.cursor
        _ctx.fillStyle = COLORS.cursor
        _ctx.fillPoint(mouseX, mouseY, _ctx.input.mouse.down ? 8 : 4)
        if (_ctx.input.mouse.pressed)
            _ctx.strokePoint(mouseX, mouseY, 16)

        _ctx.fillStyle = COLORS.debugText
        _ctx.textBaseline = 'bottom'
        _ctx.fillText(`x: ${mouseX}, y: ${mouseY}`, mouseX, mouseY)
    }

    // Game state.
    var _gameState = {}
    var _board = createDefaultBoard()
    _board.position.x = _ctx.w * 0.25
    _board.position.y = _ctx.h * 0.25
    _board.size = _ctx.w * 0.5
    
    // UI. TODO(nthunt): Move this.
    var _overlay = Overlay()
    var button = OverlayButton('FIRE!')
    button.x = _ctx.w * 0.85
    button.y = _ctx.h * 0.90
    button.width = _ctx.w * 0.2
    button.height = _ctx.w * 0.1
    button.fillColor = COLORS.yellow
    _overlay.buttons.push(button)

    // Core game looooooop.
    function loop() {
        // Update time.
        _ctx.updateTime()

        // Draw background.
        _ctx.fillStyle = COLORS.background
        _ctx.fillRect(0, 0, _ctx.w, _ctx.h)

        // Update and draw board.
        var boardScrollSpeed = 1
        _ctx.input.down.forEach(key => {
            // Scrolling:
            if (key === 'w') _board.position.y -= boardScrollSpeed
            if (key === 'a') _board.position.x -= boardScrollSpeed
            if (key === 's') _board.position.y += boardScrollSpeed
            if (key === 'd') _board.position.x += boardScrollSpeed
            
            // Scaling:
            if (key === 'e') _board.size += boardScrollSpeed
            if (key === 'q') _board.size -= boardScrollSpeed
        })
        updateBoard(_board, _ctx)
        drawBoard(_board, _ctx)
        
        // Draw UI.
        updateOverlay(_overlay, _ctx)
        drawOverlay(_overlay, _ctx)
        
        // Run debug if enabled.
        if (_debug) _ctx.drawDebug()
        
        // Update input.
        _ctx.updateInput()

        // Request next frame.
        window.requestAnimationFrame(loop)
    }

    // Set up socket events.
    _ctx.socket = io()
    _ctx.socket.on('roomName', (roomName) =>{
        _ctx.roonName = roomName
        document.getElementById('roomNameDisplay').innerHTML = roomName
    })
    _ctx.socket.on('startGame', (gameState) => {
        _gameState = gameState
        loop()
    })

    // Trigger 'newGame' on client.
    _ctx.socket.emit('newGame')
}
Destructo()

function currentTime() {
    return Date.now() * 0.001
}

function lerp(value0, value1, t) {
	return value0 * (1 - t) + value1 * t;
}