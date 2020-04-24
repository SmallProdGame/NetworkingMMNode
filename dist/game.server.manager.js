"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const gameserver_1 = __importDefault(require("./gameserver"));
const matchmakingmanager_1 = require("./matchmakingmanager");
let matchServerKey = 'secret';
exports.setMatchServerKey = (key) => {
    matchServerKey = key;
};
const onServerData = (server, data) => {
    try {
        const d = JSON.parse(data);
        if (d.type && d.data) {
            const da = JSON.parse(d.data);
            if (d.type === 'connection') {
                if (da.key === matchServerKey) {
                    server.authenticated = true;
                    gameserver_1.default.gameServers.push(server);
                }
            }
            else {
                if (server.authenticated) {
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
    const index = gameserver_1.default.gameServers.indexOf(server);
    gameserver_1.default.gameServers.splice(index, 1);
    server.emit('disconnection', {});
};
exports.onServerConnect = (socket) => {
    const server = matchmakingmanager_1.createGameServer(socket);
    server.emit('connection', {});
    socket.on('data', (data) => onServerData(server, data));
    socket.on('end', () => onServerEnd(server));
    socket.on('error', (err) => console.error(err));
};
