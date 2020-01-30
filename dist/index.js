"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const serverutil_1 = __importDefault(require("./serverutil"));
const userserver_1 = require("./userserver");
const gameserver_1 = require("./gameserver");
try {
    const userServer = serverutil_1.default(userserver_1.onUserConnect).on('error', err => {
        console.error(err);
    });
    const gameServer = serverutil_1.default(gameserver_1.onServerConnect).on('error', err => {
        console.error(err);
    });
    userServer.listen({ port: 8080 }, () => {
        console.log(`User server is listenning on the address ${userServer.address()} !`);
    });
    gameServer.listen({ port: 8081 }, () => {
        console.log(`Game server is listenning on the address ${gameServer.address()}`);
    });
}
catch (err) {
    console.error(err);
}
