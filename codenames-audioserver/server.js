//npm run devStart
//peerjs --port 3001

const express = require('express')
const app = express()
const server = require('http').Server(app)
//const io = require('socket.io')(server)
const { Server } = require("socket.io");
//const { v4: uuidV4 } = require('uuid')

const cors = require('cors'); // Import CORS middleware

const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173",  // Allow connections from your frontend
        methods: ["GET", "POST"],
        allowedHeaders: ["Content-Type"],
    }
});

app.use(express.static('public'))

app.get('/', (req, res) => {
    res.redirect(`/room1`)
    //res.redirect(`/${roomId}`)
})

app.get('/:room', (req, res) => {
    res.render('room', { roomId: req.params.room })
})

io.on('connection', socket => {
    socket.on('join-room', (roomId, userId) => {
        socket.join(roomId)
        socket.to(roomId).emit('user-connected', userId)

        socket.on('disconnect', () => {
            socket.to(roomId).emit('user-disconnected', userId)
        })

        socket.on('leave-room', (roomId, userId) => {
            socket.leave(roomId)
            socket.to(roomId).emit('user-disconnected', userId)
        })
    })
})

server.listen(3000)