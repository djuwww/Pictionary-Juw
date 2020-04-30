'use strict';

const express = require('express');
const socketIO = require('socket.io');

const port = process.env.PORT || 3000;
const index = '/pictionary.html';

const server = express()
    .use((req, res) => res.sendFile(index, { root: __dirname }))
    .listen(port, () => console.log('Server started on port', port));

const io = socketIO(server);

let users = [];
let currentPlayer = null;
let timeout = null;
const words = ['Apple', 'Pear', 'Cherry', 'Orange']

io.on('connection', (socket) => {
    console.log('A new user joined the game');

    onConnection(socket);
});

function onConnection(socket) {
    socket.on('username', (username) => {
        console.log('Player name :', username);
        socket.username = username;

        if (users.length === 0) {
            currentPlayer = socket;
            users.push(socket);
            switchPlayer();
        } else {
            users.push(socket);
            sendUsers();
        }
    });
    socket.on('disconnect', (username) => {
        console.log('A user left the game');
        users = users.filter(user => {
            return user !== socket;
        });
        sendUsers();

        if(users.length === 0) {
            timeout = clearTimeout(timeout);
        }
    });
    socket.on('line', data => {
        socket.broadcast.emit('line', data);
    });
}

function sendUsers () {
    io.emit('users', users.map(user => {
        return {
            username: user.username,
            isActive: currentPlayer === user
        };
    }));
}

function switchPlayer() {

    const indexCurrentPlayer = users.indexOf(currentPlayer);
    currentPlayer = users[(indexCurrentPlayer + 1) % users.length];

    sendUsers();

    const newWord = words[Math.floor(Math.random() * words.length)];
    currentPlayer.emit('word', newWord);
    io.emit('clear');

    timeout = setTimeout(switchPlayer, 20000);
}