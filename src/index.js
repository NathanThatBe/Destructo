'use strict'

const express = require('express')
const app = express()
const port = 3000
const http = require('http')

const server = http.createServer(app)
const { Server } = require("socket.io");
const io = new Server(server);

app.use(express.static('client'))

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/client/index.html');
});

io.on('connection', (socket) => {
  socket.on('test', () => {
    console.log('test!')
  })
})

server.listen(port, () => {
  console.log(`Listening on ${port}`)
})