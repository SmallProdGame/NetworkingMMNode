"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const matchmakingmanager_1 = require("./matchmakingmanager");
const onUserData = (player, data) => {
    try {
        const d = JSON.parse(data);
        if (d.type && d.data) {
            const da = JSON.parse(d.data);
            player.emit(d.type, da);
        }
    }
    catch (err) {
        console.error(`An error occured while handling player request !`);
        console.error(data);
        console.error(err);
    }
};
const onUserEnd = (player) => {
    console.log('Player disconnected !');
    player.emit('disconnection', {});
};
exports.onUserConnect = (socket) => {
    const player = matchmakingmanager_1.createClient(socket);
    player.emit('connection', {});
    socket.on('data', (data) => onUserData(player, data));
    socket.on('end', () => onUserEnd(player));
    socket.on('error', (err) => console.error(err));
};
