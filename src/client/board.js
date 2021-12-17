'use strict'

// TODO(nthunt): Rename this file; it will probably end up representing all game logic.

const Board = (length) => {
    return {
        // Data:
        position: { x: 0, y: 0 },
        length: length,
        tiles: [],

        // Presentation:
        size: 100,
    }
}

const BoardTile = (x, y) => {
    return {
        // Position:
        x: x,
        y: y,
        
        // Debug:
        decay: 0,
    }
}

function createDefaultBoard() {
    var length = 16  // 16x16 board
    var board = Board(length)
    for (var y = 0; y < length; y++) {
        var row = []
        for (var x = 0; x < length; x++) {
            row.push(BoardTile(x, y))
        }
        board.tiles.push(row)
    }
    return board
}

function updateBoard(board, _ctx) {
    // TODO(ntunt): Merge data and presentation logic.
    // Add decay to tiles under cursor.
    var cursorX = _ctx.input.mouse.x
    var cursorY = _ctx.input.mouse.y
    var tileSize = board.size / board.length
    function inTile(tile) {
        var tileX = board.position.x + tile.x * tileSize
        var tileY = board.position.y + tile.y * tileSize
        return (cursorX >= tileX && cursorX <= tileX + tileSize) && (cursorY >= tileY && cursorY <= tileY + tileSize)
    }

    board.tiles.forEach(row => {
        row.forEach(tile => {
            if (inTile(tile)) {
                tile.decay = 1
            } else {
                tile.decay *= 0.85
            }
        })
    })
}

function drawBoard(board, _ctx) {
    var pos = board.position
    var size = board.size
    var length = board.length
    var tileSize = size / board.length

    // Draw board tiles.
    _ctx.strokeStyle = COLORS.boardLines
    _ctx.lineWidth = 1
    board.tiles.forEach(row => {
        row.forEach(tile => {
            // Draw outline.
            _ctx.strokeRect(pos.x + tile.x * tileSize, pos.y + tile.y * tileSize, tileSize, tileSize)

            // Draw fill.
            _ctx.fillStyle = `rgba(255, 255, 255, ${lerp(0, 0.8, tile.decay)})`
            _ctx.fillRect(pos.x + tile.x * tileSize, pos.y + tile.y * tileSize, tileSize, tileSize)
        })
    })

    // Draw board outline.
    var outlineOffset = 15
    _ctx.strokeStyle = COLORS.text
    _ctx.lineWidth = 2
    _ctx.strokeRect(pos.x - outlineOffset, pos.y - outlineOffset, size + outlineOffset * 2, size + outlineOffset * 2)

    // Draw rulers.
    _ctx.fillStyle = COLORS.debugText
    _ctx.textBaseline = 'top'
    _ctx.textAlign = 'right'
    for (var y = 0; y < length; y++) {
        _ctx.fillText(`${y}`, pos.x - tileSize, pos.y + y * tileSize + tileSize * 0.25)
    }
    var letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    _ctx.textBaseline = 'bottom'
    _ctx.textAlign = 'left'
    for (var x = 0; x < length; x++) {
        _ctx.fillText(`${letters.charAt(x)}`, pos.x + x * tileSize + tileSize * 0.25, pos.y - tileSize * 0.75)
    }
}