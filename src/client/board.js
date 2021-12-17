'use strict'

// TODO(nthunt): Rename this file; it will probably end up representing all game logic.

const Board = (length) => {
    return {
        length: length
    }
}

function createDefaultBoard() {
    return Board(16)  // 16x16
}

function drawBoard(board, _ctx) {
     // Draw board.
     _ctx.strokeStyle = COLORS.boardLines
     _ctx.fillStyle = COLORS.clear
     var margin = _ctx.w * 0.15
     var boardSize = board.length
     var tileSize = (_ctx.w - margin * 2) / boardSize
     for (var y = 0; y < boardSize; y++) {
         for (var x = 0; x < boardSize; x++) {
             _ctx.strokeRect(margin + x * tileSize, margin + y * tileSize, tileSize * 0.85, tileSize * 0.85)
         }
     }
     _ctx.strokeStyle = COLORS.text
     _ctx.strokeRect(margin - tileSize * 0.15, margin - tileSize * 0.15, tileSize * boardSize + tileSize * 0.15, tileSize * boardSize + tileSize * 0.15)
}