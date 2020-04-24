"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const player_1 = __importDefault(require("./player"));
const gameserver_1 = __importDefault(require("./gameserver"));
exports.matchs = [];
exports.waitingTeams = [];
exports.addMatch = (match) => {
    exports.matchs.push(match);
};
exports.removeMatch = (match) => {
    const index = exports.matchs.indexOf(match);
    exports.matchs.splice(index, 1);
};
let clientCreator = (socket) => {
    return new player_1.default(socket);
};
let gameServerCreator = (socket) => {
    return new gameserver_1.default(socket);
};
exports.setClientCreator = (creator) => {
    clientCreator = creator;
};
exports.setGameServerCreator = (creator) => {
    gameServerCreator = creator;
};
exports.createClient = (socket) => {
    return clientCreator(socket);
};
exports.createGameServer = (socket) => {
    return gameServerCreator(socket);
};
