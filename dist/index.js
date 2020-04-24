"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const serverutil_1 = __importDefault(require("./serverutil"));
const player_server_manager_1 = require("./player.server.manager");
const game_server_manager_1 = require("./game.server.manager");
const match = __importStar(require("./matchmakingmanager"));
exports.startServers = (serverPort, clientPort) => {
    try {
        const userServer = serverutil_1.default(player_server_manager_1.onUserConnect).on('error', (err) => {
            console.error(err);
        });
        const gameServer = serverutil_1.default(game_server_manager_1.onServerConnect).on('error', (err) => {
            console.error(err);
        });
        userServer.listen({ port: clientPort }, () => {
            console.log(`User server is running!`);
        });
        gameServer.listen({ port: serverPort }, () => {
            console.log(`Game server is running!`);
        });
    }
    catch (err) {
        console.error(err);
    }
};
exports.default = {
    startServers: exports.startServers,
    match,
    gameServer: {
        setMatchServerKey: game_server_manager_1.setMatchServerKey,
    },
};
exports.Player = __importStar(require("./player"));
exports.GameServer = __importStar(require("./gameserver"));
exports.Match = __importStar(require("./match"));
