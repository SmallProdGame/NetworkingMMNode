"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const uuid_1 = __importDefault(require("uuid"));
const matchmakingmanager_1 = require("./matchmakingmanager");
const gameserver_1 = require("./gameserver");
const utils_1 = require("./utils");
class Match {
    constructor(maxUser, minUser, map, password) {
        this.hasStart = false;
        this.isFull = false;
        this.onPlayerJoin = (client, password = '') => {
            if (this.users.length < this.maxUser) {
                if (!this.password || this.password === password) {
                    this.users.push({ client, state: 0, key: null });
                    this.checkIfFull();
                    return this.users.length;
                }
            }
            return 0;
        };
        this.onPlayerJoinLobby = (client) => {
            const player = this.users.find(u => u.client === client);
            if (player) {
                player.state = 1;
                player.client.send('matchlobbyjoined', {
                    matchId: this.matchId,
                    userId: player.client.userIndex,
                });
                this.broadcast('playerjoinedlobby', {
                    id: player.client.userIndex,
                    ready: false,
                });
                this.users.forEach((u, index) => {
                    if (u !== player) {
                        player.client.send('playerjoinedlobby', {
                            id: index + 1,
                            ready: u.state === 2,
                        });
                    }
                });
                return true;
            }
            return false;
        };
        this.onPlayerReadyLobby = (client) => {
            const player = this.users.find(u => u.client === client);
            if (player) {
                const index = this.users.indexOf(player);
                player.state = 2;
                this.broadcast('playerreadylobby', { id: index + 1 });
                this.checkIfWeCanStart();
                return true;
            }
            return false;
        };
        this.onPlayerLeave = (client) => {
            const player = this.users.find(u => u.client === client);
            if (player) {
                const index = this.users.indexOf(player);
                this.users.splice(index, 1);
                this.isFull = false;
                if (player.state !== 0) {
                    this.broadcast('playerleaved', { id: index + 1 });
                }
                if (this.hasStart && this.gameServer) {
                    this.gameServer.send('removeuserfrommatch', {
                        matchId: this.matchId,
                        userKey: player.key,
                    });
                }
                if (this.users.length === 0) {
                    if (this.hasStart && this.gameServer) {
                        this.gameServer.send('deletematch', { matchId: this.matchId });
                    }
                    matchmakingmanager_1.removeMatch(this);
                }
            }
        };
        this.startGame = () => {
            this.gameServer = gameserver_1.GetBestGameServer();
            if (!this.gameServer)
                return;
            const keys = [];
            for (const u of this.users) {
                u.key = uuid_1.default.v4();
                keys.push(u.key);
            }
            this.gameServer.send('creatematch', {
                keys,
                matchId: this.matchId,
                map: this.map,
            });
            for (const u of this.users) {
                u.client.send('startmatch', { key: u.key, map: this.map });
            }
            this.hasStart = true;
        };
        this.checkIfWeCanStart = () => {
            if (this.users.length < this.minUser)
                return;
            const players = this.users.filter(u => u.state !== 2);
            if (players.length === 0) {
                this.startGame();
            }
        };
        this.checkIfFull = () => {
            if (this.users.length === this.maxUser) {
                this.isFull = true;
            }
            else {
                this.isFull = false;
            }
        };
        this.broadcast = (type, data) => {
            this.users.forEach((player) => {
                player.client.send(type, data);
            });
        };
        this.matchId = utils_1.randomInt(1, 10000000);
        this.maxUser = maxUser;
        this.minUser = minUser;
        this.map = map;
        this.password = password;
        this.users = [];
        this.gameServer = null;
    }
}
exports.default = Match;
