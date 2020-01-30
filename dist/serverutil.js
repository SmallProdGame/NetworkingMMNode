"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const net_1 = __importDefault(require("net"));
exports.default = (onConnect) => {
    return net_1.default.createServer(socket => {
        onConnect(socket);
    });
};
