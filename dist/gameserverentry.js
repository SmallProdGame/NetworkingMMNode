"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const eventhandler_1 = __importDefault(require("./eventhandler"));
const matchmakingmanager_1 = require("./matchmakingmanager");
class GameServerEntry extends eventhandler_1.default {
    constructor(socket) {
        super();
        this.authenticated = false;
        this.registerEvents = () => {
            this.on('playerleave', this.onPlayerLeave);
        };
        this.onPlayerLeave = (data) => {
            const match = matchmakingmanager_1.matchs.find(m => m.matchId === data.matchId);
            if (match) {
                const player = match.players().find(u => u.key === data.key);
                if (player) {
                    match.onPlayerLeave(player.client, true);
                }
            }
        };
        this.send = (type, data) => {
            try {
                if (!this.socket.writable)
                    return;
                this.socket.write(`${JSON.stringify({
                    type,
                    data: JSON.stringify(data),
                })}\\n`);
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
