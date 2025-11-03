const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: [
      "https://codenames-frontend-524815217558.europe-central2.run.app",
      "https://codenames-backend-524815217558.europe-central2.run.app",
      "http://localhost:5173",
      "http://localhost:8080",
    ],
    methods: ["GET", "POST"],
    credentials: true,
  },
  transports: ["polling", "websocket"],
});

// --- GAME NAMESPACE (/game) ---
const gameNamespace = io.of("/game");

gameNamespace.on("connection", (socket) => {
  console.log(`[GAME] Client connected: ${socket.id}`);

  socket.on("joinGame", (gameId) => {
    console.log(`[GAME] User joined game room: ${gameId}`);
    socket.join(gameId);
  });

  socket.on("gameSessionUpdate", (gameId, gameSession) => {
    console.log(`[GAME] Game session update for room: ${gameId}`);
    gameNamespace.to(gameId).emit("gameSessionUpdate", gameSession);
  });

  socket.on("gameSessionData", (gameId, gameSessionJson) => {
    console.log(`[GAME] Game session data sent to room: ${gameId}`);
    gameNamespace.to(gameId).emit("gameSessionData", gameSessionJson);
  });

  socket.on("gameSessionsList", (gameSessions) => {
    console.log("[GAME] Broadcasting game sessions list");
    gameNamespace.emit("gameSessionsList", gameSessions);
  });

  socket.on("disconnectUser", (userId, gameId) => {
    console.log(`[GAME] Disconnecting user: ${userId}`);
    gameNamespace.to(gameId).emit("disconnectUser", userId);
  });
});

const textChatNamespace = io.of("/chat");

textChatNamespace.on("connection", (socket) => {
  console.log("[CHAT] User connected:", socket.id);

  socket.on("joinGame", (gameID) => {
    socket.join(gameID);
    console.log(`[CHAT] ${socket.id} joined room ${gameID}`);
  });

  socket.on("chatMessage", (msg) => {
    console.log(`[CHAT] ${msg.sender} sent message to game ${msg.gameID}`);

    textChatNamespace.to(msg.gameID).emit("chatMessage", msg);
  });

  socket.on("disconnect", () => {
    console.log("[CHAT] User disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`-> Socket.IO server is running on port ${PORT}.`);
});
