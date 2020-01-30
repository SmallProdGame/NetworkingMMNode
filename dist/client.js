"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const match_1 = __importDefault(require("./match"));
const matchmakingmanager_1 = require("./matchmakingmanager");
const eventhandler_1 = __importDefault(require("./eventhandler"));
class Client extends eventhandler_1.default {
    constructor(socket) {
        super();
        this.match = undefined;
        this.userIndex = '';
        this.registerEvents = () => {
            this.on('findmatch', this.onFindMatch);
            this.on('creatematch', this.onCreateMatch);
            this.on('joinmatchlobby', this.onJoinMatchLobby);
            this.on('readymatchlobby', this.onReadyMatchLobby);
            this.on('disconnection', this.onLeave);
        };
        this.onFindMatch = (data) => {
            if (this.match)
                return;
            let m = matchmakingmanager_1.matchs.find(ma => !ma.isFull && !ma.hasStart && !ma.password);
            if (!m) {
                m = new match_1.default(data.maxUser, data.minUser, data.map, '');
                matchmakingmanager_1.addMatch(m);
            }
            const index = m.onPlayerJoin(this, '');
            if (index) {
                this.userIndex = `Player ${index}`;
                this.send('matchfound', { matchId: m.matchId, userId: this.userIndex });
                this.match = m;
            }
            else {
                console.error('This should not happend ! Error while finding a match');
            }
        };
        this.onCreateMatch = (data) => {
            if (this.match)
                return;
            const match = new match_1.default(data.maxUser, data.minUser, data.map, data.password);
            matchmakingmanager_1.addMatch(match);
            const index = match.onPlayerJoin(this, data.password);
            match.onPlayerJoinLobby(this);
            this.userIndex = `Player ${index}`;
            this.match = match;
        };
        this.onJoinMatchLobby = (data) => {
            let match = this.match;
            if (!match) {
                match = matchmakingmanager_1.matchs.find(ma => ma.matchId === data.matchId);
                if (!match) {
                    this.send('matchnotfound', {});
                    return;
                }
                const index = match.onPlayerJoin(this, data.password);
                if (!index) {
                    this.send('matchwrongpassword', {});
                    return;
                }
                this.userIndex = `Player ${index}`;
                this.match = match;
            }
            if (!this.match)
                return;
            this.match.onPlayerJoinLobby(this);
        };
        this.onReadyMatchLobby = (data) => {
            if (!this.match)
                return;
            this.match.onPlayerReadyLobby(this);
        };
        this.onLeave = () => {
            if (this.match) {
                this.match.onPlayerLeave(this);
            }
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
exports.default = Client;
