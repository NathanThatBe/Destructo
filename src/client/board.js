'use strict'

// TODO(nthunt): Rename this file; it will probably end up representing all game logic.

const Board = (length) => {
    return {
        // Data:
        position: { x: 0, y: 0 },
        length: length,
        
        // Presentation:
        size: 100,
    }
}

function createDefaultBoard() {
    return Board(16)  // 16x16
}

function drawBoard(board, _ctx) {
    var pos = board.position
    var size = board.size
    var length = board.length
    var tileSize = size / board.length

    // Draw board tiles.
    _ctx.strokeStyle = COLORS.boardLines
    _ctx.lineWidth = 1
    for (var y = 0; y < length; y++) {
        for (var x = 0; x < length; x++) {
            _ctx.strokeRect(pos.x + x * tileSize, pos.y + y * tileSize, tileSize, tileSize)
        }
    }

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