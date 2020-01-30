"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const matchmakingmanager_1 = require("./matchmakingmanager");
const onUserData = (client, data) => {
    try {
        const d = JSON.parse(data);
        if (d.type && d.data) {
            const da = JSON.parse(d.data);
            client.emit(d.type, da);
        }
    }
    catch (err) {
        console.error(`An error occured while handling client request !`);
        console.error(err);
    }
};
const onUserEnd = (client) => {
    console.log('User disconnected !');
    client.emit('disconnection', {});
};
exports.onUserConnect = (socket) => {
    const client = matchmakingmanager_1.createClient(socket);
    client.emit('connection', {});
    socket.on('data', (data) => onUserData(client, data));
    socket.on('end', () => onUserEnd(client));
};
