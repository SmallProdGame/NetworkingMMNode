"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const matchmakingmanager_1 = require("./matchmakingmanager");
const matchServerKey = 'kujyrhtezd852jy7h7r8451d20cj8y45th1bgf2';
const gameServers = [];
exports.default = gameServers;
const onServerData = (server, data) => {
    try {
        const d = JSON.parse(data);
        if (d.type && d.data) {
            const da = JSON.parse(d.data);
            if (d.type === 'connection') {
                if (da.key === matchServerKey) {
                    console.log('New connection on game server !');
                    server.authenticated = true;
                    gameServers.push(server);
                }
                else {
                    server.socket.end();
                }
            }
            else {
                if (!server.authenticated) {
                    server.socket.end();
                }
                else {
                    server.emit(d.type, da);
                }
            }
        }
    }
    catch (err) {
        console.error('An error occured while handling match server request !');
        console.error(data);
        console.error(err);
    }
};
const onServerEnd = (server) => {
    console.log('Game server disconnection !');
    const index = gameServers.indexOf(server);
    gameServers.splice(index, 1);
    server.emit('disconnection', {});
    console.log('Nb: ', gameServers.length);
};
exports.onServerConnect = (socket) => {
    const server = matchmakingmanager_1.createGameServer(socket);
    server.emit('connection', {});
    socket.on('data', (data) => onServerData(server, data));
    socket.on('end', () => onServerEnd(server));
    socket.on('error', err => console.error(err));
};
