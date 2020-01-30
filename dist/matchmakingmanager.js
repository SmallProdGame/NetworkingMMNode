"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = __importDefault(require("./client"));
exports.matchs = [];
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
exports.setClientCreator = (creator) => {
    clientCreator = creator;
};
exports.createClient = (socket) => {
    return clientCreator(socket);
};
