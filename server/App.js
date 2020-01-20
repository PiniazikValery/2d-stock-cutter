const express = require('express');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const http = require("http");
const path = require('path');
const config = require('config');
const process = require('process');
const { fork } = require('child_process');
const socketIo = require("socket.io");

const port = process.env.PORT || config.get('application_port');

const app = express();

app.use(express.static(path.join(__dirname, '/../client/build')));

app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const server = http.createServer(app);
const io = socketIo(server);
app.set('io', io);

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname + '/../client/build/index.html'));
});

app.post('/chromosome', (req, res) => {
    const { socketId, genCollection, width, height } = req.body.params;
    const io = req.app.get('io');

    const process = fork('./models/population/run_evolution.js');

    process.send({ gens: genCollection, chrWidth: width, chrHeight: height });

    io.sockets.connected[socketId].on('disconnect', () => {
        process.kill('SIGINT');
    });

    process.on('message', (result) => {
        io.in(socketId).emit('successResult', result);
    });
    res.status(200).json({
        message: 'solution calculation has been started',
    });
});

server.listen(port); 
