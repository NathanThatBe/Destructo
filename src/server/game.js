const GameState = () => {
    var boardSize = 16
    var ships = createRandomShips(15, boardSize)
    return {
        boardSize: boardSize,
        ships: ships
    }
}

function createRandomShips(numberOfShips, boardSize) {
    function randNum() { return Math.floor(Math.random() * boardSize) }
    var ships = []
    for (var i = 0; i < numberOfShips; i++) {
        ships.push({x: randNum(), y: randNum()})
    }
    // TODO(nthunt): Avoid duplicates
    return ships
}

module.exports = {
    GameState,
}