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
            this.on('match_created', this.onMatchCreated);
            this.on('match_deleted', this.onMatchDeleted);
            this.on('user_removed', this.onUserRemoved);
            this.on('player_leaved', this.onPlayerLeaved);
            this.on('match_end', this.onMatchEnd);
        };
        this.onMatchCreated = (data) => {
            const match = matchmakingmanager_1.matchs.find((m) => m.matchId === data.matchId);
            if (match) {
                match.startMatch();
            }
        };
        this.onMatchDeleted = (data) => {
        };
        this.onUserRemoved = (data) => {
        };
        this.onPlayerLeaved = (data) => {
            const match = matchmakingmanager_1.matchs.find((m) => m.matchId === data.matchId);
            if (match) {
                const player = match.players().find((u) => u.key === data.key);
                if (player) {
                    match.onPlayerLeave(player.client, true);
                }
            }
        };
        this.onMatchEnd = (data) => {
            const match = matchmakingmanager_1.matchs.find((m) => m.matchId === data.matchId);
            if (match) {
                match.endMatch();
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
