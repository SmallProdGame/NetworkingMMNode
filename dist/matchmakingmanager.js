"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = __importDefault(require("./client"));
const gameserverentry_1 = __importDefault(require("./gameserverentry"));
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
    return new client_1.default(socket);
};
let gameServerCreator = (socket) => {
    return new gameserverentry_1.default(socket);
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
exports.default = {
    matchs: exports.matchs,
    addMatch: exports.addMatch,
    removeMatch: exports.removeMatch,
    setClientCreator: exports.setClientCreator,
    createClient: exports.createClient,
    setGameServerCreator: exports.setGameServerCreator,
    createGameServer: exports.createGameServer,
};
