'use strict';

const express = require('express');
const socketIO = require('socket.io');

const port = process.env.PORT || 3000;
const index = '/pictionary.html';

const server = express()
    .use((req, res) => res.sendFile(index, { root: __dirname }))
    .listen(port, () => console.log('Server started on port', port));

const io = socketIO(server);

io.on('connection', (socket) => {
    console.log('A new user joined the game');

    onConnection(socket);
});

function onConnection(socket) {
    socket.on('username', (username) => {
        console.log('Player name :', username);
    });
    socket.on('disconnect', (username) => {
        console.log('A yser left the game');
    });
    socket.on('line', data => {
        socket.broadcast.emit('line', data);
    });
}