"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const gameserverentry_1 = __importDefault(require("./gameserverentry"));
const matchServerKey = 'kujyrhtezd852jy7h7r8451d20cj8y45th1bgf2';
const gameServers = [];
exports.default = gameServers;
exports.GetBestGameServer = () => {
    if (gameServers.length > 0) {
        return gameServers[0];
    }
    return null;
};
exports.onServerConnect = (socket) => {
    const server = new gameserverentry_1.default(socket);
    socket.on('data', (data) => onServerData(server, data));
    socket.on('end', () => onServerEnd(server));
};
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
                }
            }
        }
    }
    catch (err) {
        console.error('An error occured while handling match server request !');
        console.error(err);
    }
};
const onServerEnd = (server) => {
    console.log('Game server disconnection !');
    const index = gameServers.indexOf(server);
    gameServers.splice(index, 1);
    console.log('Nb: ', gameServers.length);
};
