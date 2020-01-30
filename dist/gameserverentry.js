"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const eventhandler_1 = __importDefault(require("./eventhandler"));
class GameServerEntry extends eventhandler_1.default {
    constructor(socket) {
        super();
        this.authenticated = false;
        this.registerEvents = () => {
        };
        this.send = (type, data) => {
            try {
                this.socket.write(JSON.stringify({
                    type,
                    data: JSON.stringify(data),
                }));
            }
            catch (err) {
                console.error(err);
            }
        };
        this.socket = socket;
        this.registerEvents();
    }
}
exports.default = GameServerEntry;
