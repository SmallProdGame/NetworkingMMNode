"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const serverutil_1 = __importDefault(require("./serverutil"));
const userserver_1 = require("./userserver");
const gameserver_1 = require("./gameserver");
exports.default = (serverPort, clientPort) => {
    try {
        const userServer = serverutil_1.default(userserver_1.onUserConnect).on('error', err => {
            console.error(err);
        });
        const gameServer = serverutil_1.default(gameserver_1.onServerConnect).on('error', err => {
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
