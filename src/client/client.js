const COLORS = Object.freeze({
    'clear': '#00000000',
    'background': '#20142F',
    'text': '#eafffd',
    'debugText': '#EBBC70',
    'boardLines': '#ef959d',
    'cursor': '#ea526f',
    'ship': '#037971',
})

var _canvas = document.getElementById('canvas')
var _ctx = canvas.getContext('2d')
_ctx.time = {}
_ctx.time.currentTime = 0
_ctx.time.timeStep = 0
var _prevTime = currentTime()
function resetCanvas() {  // TODO(nthunt): Adjust aspect ratio
    const min_w = 160*2
    var containerDiv = document.getElementById("canvas-container")
    var max_w = containerDiv.offsetWidth
    var max_h = window.innerHeight
    var w = Math.max(Math.min(max_w, max_h), min_w)
    var h = Math.floor(w * (144/160))
    var ratio = window.devicePixelRatio || 1

    _canvas.width = w * ratio
    _canvas.height = h * ratio
    _ctx.scale(ratio, ratio)
    _ctx.w = w
    _ctx.h = h
    _ctx.safeMargin = w * 0.05
    _canvas.style.width = w + "px"
    _canvas.style.height = h + "px"
}
resetCanvas()  // !: Do before running game.
window.onresize = resetCanvas

var _mouseX = 0
var _mouseY = 0
_canvas.addEventListener('mousemove', (event) => {
    _mouseX = event.offsetX
    _mouseY = event.offsetY
})

function currentTime() {
    return Date.now() * 0.001
}

var _gameState = {}

function loop() {
    let prevTime = _prevTime
    let currTime = currentTime()
    let timeStep = currTime - prevTime
    _prevTime = currTime
    _ctx.time.currentTime += timeStep
    _ctx.time.timeStep = timeStep
    // Draw background
    _ctx.fillStyle = COLORS.background
    _ctx.fillRect(0, 0, _ctx.w, _ctx.h)

    // Draw debug text
    _ctx.fillStyle = COLORS.debugText
    _ctx.font = "24px Arial"
    _ctx.fillText(`debug: t=${_ctx.time.currentTime.toFixed(2)}s  ∆${(_ctx.time.timeStep * 1000).toFixed(2)}ms (${(1 / _ctx.time.timeStep).toFixed(0)}fps)`, 50, 50)

    // Draw board
    _ctx.strokeStyle = COLORS.boardLines
    _ctx.fillStyle = COLORS.clear
    var margin = _ctx.w * 0.15
    var boardSize = _gameState.boardSize
    var tileSize = (_ctx.w - margin * 2) / boardSize
    for (var y = 0; y < boardSize; y++) {
        for (var x = 0; x < boardSize; x++) {
            _ctx.strokeRect(margin + x * tileSize, margin + y * tileSize, tileSize * 0.85, tileSize * 0.85)
        }
    }
    _ctx.strokeStyle = COLORS.text
    _ctx.strokeRect(margin - tileSize * 0.15, margin - tileSize * 0.15, tileSize * boardSize + tileSize * 0.15, tileSize * boardSize + tileSize * 0.15)

    // Draw ships
    if (_gameState.ships) {
        _gameState.ships.forEach(ship => {
            _ctx.fillStyle = COLORS.ship
            _ctx.beginPath()
            _ctx.arc(margin + ship.x * tileSize + tileSize/2, margin + ship.y * tileSize + tileSize/2, tileSize*0.4, 0, 2*Math.PI)
            _ctx.fill()
            _ctx.closePath()
        })
    }

    // Draw cursor
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