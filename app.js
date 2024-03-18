const express = require('express');
const socketIo = require('socket.io');
const http = require('http');
const { IgApiClient } = require('instagram-private-api');


const app = express();
const server = http.createServer(app);
const io = socketIo(server);




const ig = new IgApiClient();

( async () => {
    ig.state.generateDevice(process.env.IGUSER);

    const auth = await ig.account.login(process.env.IG_USERNAME, process.env.IG_PASSWORD);

    ig.realtime.on('message', (message) => {
        console.log(`New message received:\n ${message}`);
    });
    
})();

app.get('/', (req, res) => {
    res.send("Server is running");
});


io.on('connection', (socket) => {
    console.log('Client connected');

    socket.on('disconnect', () => {
        console.log('User disconnect');
    })
});


const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});