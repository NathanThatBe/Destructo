'use strict'

const express = require('express')
const app = express()
const port = 3000
const http = require('http')

const server = http.createServer(app)
const { Server } = require("socket.io");
const io = new Server(server);

const { GameState } = require('./server/game.js')
const gameState = {}
const clientRooms = {}

app.use(express.static('client'))

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/client/index.html');
})

io.on('connection', (socket) => {
  socket.on('newGame', () => {
    let roomName = createRoomID(4)
    clientRooms[socket.id] = roomName;
    socket.emit('roomName', roomName)

    gameState[roomName] = GameState()
    socket.join(roomName)
    socket.number = 1
    socket.emit('startGame', gameState[roomName])
  })
})

server.listen(port, () => {
  console.log('\n\n')
  console.log(`DESCTRUCTO (ALPHA) :: Listening on ${port}`)

  // Run tests
  if (true) {
    testCreateRoomID();
    console.log("All tests passed")
  }
})

// Returns a random alpha-numeric room code as a string.
// Note: not guaranteed to be unique.
function createRoomID(length) {
  var result = '';
  var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  for (let i = 0; i < length; ++i) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

function testCreateRoomID() {
  var expectedLength = 4;
  var ID1 = createRoomID(expectedLength);
  var ID2 = createRoomID(expectedLength);

  console.assert(ID1.length === expectedLength);
  console.assert(ID2.length === expectedLength);
  console.assert(ID1 !== ID2);
}