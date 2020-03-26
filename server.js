/**
 * Created by Magnus Compus on 3/26/2020.
 */
const path = require('path');
const http = require('http');
const express = require("express");
const socketIo = require('socket.io');
const formatMessage = require('./utils/messages');
const botName = 'Chat bot';
const { userJoin, getCurrentUser, userLeaves, getRoomUsers } = require('./utils/users');


const app = express();
const server = http.createServer(app);
const io = socketIo(server);
// Set static folder
app.use(express.static(path.join(__dirname, 'public')));

// Run when a client connects
io.on('connection', (socket) => {
    // Join Room
    socket.on('joinRoom', ({username, room}) => {
        const user = userJoin(socket.id, username, room);

        socket.join(user.room);
        // Welcome current user
        socket.emit('message', formatMessage(botName, 'Welcome to the chat room'));

        // Broadcast a user
        socket.broadcast.to(user.room).emit('message', formatMessage(botName, `User ${user.username} has joined the chat`));

        // Send users and room info
        io.to(user.room).emit('roomUsers', {
            room: user.room,
            users: getRoomUsers(user.room)
        });

    });

    // Listen for chatMessage
    socket.on('chatMessage', (msg) => {
        const user = getCurrentUser(socket.id);
        io.to(user.room).emit('message', formatMessage(user.username, msg));
    });

    // Runs when client disconnect
    socket.on('disconnect', () => {
        const user = userLeaves(socket.id);

        if(user) {
            io.to(user.room).emit('message', formatMessage(botName, `${user.username} leave the chat room`));

            // Send users and room info
            io.to(user.room).emit('roomUsers', {
                room: user.room,
                users: getRoomUsers(user.room)
            });

        }

    });

});


const PORT = 3000 || process.env.PORT;

server.listen(PORT, () => {
    console.log(`The server is running on port: ${PORT}`);
});

