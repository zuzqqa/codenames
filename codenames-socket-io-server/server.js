const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: [
      "https://codenames-frontend-35261654330.us-central1.run.app",
      "https://codenames-backend-35261654330.us-central1.run.app",
    ],
    methods: ["GET", "POST"],
    credentials: true,
  },
  transports: ["websocket"],
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
});

// --- VOICE CHAT NAMESPACE (/voice) ---
const chatNamespace = io.of("/voice");

chatNamespace.on("connection", (socket) => {
  console.log(`[VOICE] Client connected: ${socket.id}`);

  socket.on("join-room", (roomId, userId) => {
    console.log(`[VOICE] User ${userId} joined room: ${roomId}`);

    socket.join(roomId);
    socket.to(roomId).emit("user-connected", userId);

    socket.on("leave-room", (roomId, userId) => {
      console.log(`[VOICE] User ${userId} left room: ${roomId}`);
      socket.leave(roomId);
      socket.to(roomId).emit("user-disconnected", userId);
    });

    socket.on("disconnect", () => {
      console.log(`[VOICE] User ${userId} disconnected from room: ${roomId}`);
      socket.to(roomId).emit("user-disconnected", userId);
    });
  });
});

// --- START SERVER ---
const PORT = process.env.PORT || 8080;

server.listen(PORT, () => {
  console.log(`✅ Socket.IO server is running on port ${PORT}.`);
});
