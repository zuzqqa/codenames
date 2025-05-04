const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

io.on('connection', (socket) => {
  socket.on('joinGame', (gameId) => {
    console.log(`Dolaczono: ${gameId}`)
    socket.join(gameId);
  });

  socket.on('gameSessionUpdate', (gameId, gameSession) => {
    io.to(gameId).emit('gameSessionUpdate', gameSession);
  });

  socket.on("gameSessionData", (gameId, gameSessionJson) => {
    console.log("Odebrano dane dla gry:", gameId);
    io.to(gameId).emit('gameSessionData', gameSessionJson);
  });

  socket.on('gameSessionsList', (gameSessions) => {
    io.emit('gameSessionsList', gameSessions);
  });
});

server.listen(8080, () => {
  console.log('Socket.IO server is running on port 8080');
});
