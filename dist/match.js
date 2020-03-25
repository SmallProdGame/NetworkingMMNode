"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const uuid_1 = __importDefault(require("uuid"));
const matchmakingmanager_1 = require("./matchmakingmanager");
const gameserver_1 = __importDefault(require("./gameserver"));
const utils_1 = __importDefault(require("./utils"));
class Match {
    constructor(maxUser, minUser, map, type, password, nbPlayersPerTeam, allowedGap) {
        this.hasStart = false;
        this.isFull = false;
        this.async = false;
        this.onTeamJoin = (team, affectedTeam = null) => {
            if (affectedTeam) {
                team.players.forEach(player => {
                    affectedTeam.players.push(player);
                });
                affectedTeam.grade += team.grade;
            }
            else {
                this.teams.push(team);
            }
            team.players.forEach(player => {
                player.client.userIndex = `Player ${uuid_1.default.v1()}`;
            });
            this.checkIfFull();
        };
        this.onPlayerJoinLobby = (client) => {
            const player = this.players().find(u => u.client === client);
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
                return true;
            }
            return false;
        };
        this.onPlayerReadyLobby = (client) => {
            const player = this.players().find(u => u.client === client);
            if (player) {
                player.state = 2;
                this.broadcast('playerreadylobby', { id: player.client.userIndex });
                this.checkIfWeCanStart();
                return true;
            }
            return false;
        };
        this.onPlayerLeave = (client, fromGameServer = false) => {
            let player;
            let team;
            this.teams.forEach(potentialTeam => {
                player = potentialTeam.players.find(u => u.client === client);
                if (player) {
                    team = potentialTeam;
                }
            });
            if (player && team) {
                const index = team.players.indexOf(player);
                team.players.splice(index, 1);
                this.isFull = false;
                player.client.match = undefined;
                if (player.state !== 0) {
                    this.broadcast('playerleaved', { id: player.client.userIndex });
                }
                if (this.hasStart && this.gameServer && !fromGameServer) {
                    this.gameServer.send('removeuserfrommatch', {
                        matchId: this.matchId,
                        userKey: player.key,
                    });
                }
                if (this.teams.length === 0) {
                    if (this.hasStart && this.gameServer) {
                        this.gameServer.send('deletematch', { matchId: this.matchId });
                    }
                    matchmakingmanager_1.removeMatch(this);
                }
            }
        };
        this.checkPassword = (password) => !this.password || this.password === password;
        this.players = () => {
            const players = [];
            this.teams.forEach(team => {
                team.players.forEach(player => {
                    players.push(player);
                });
            });
            return players;
        };
        this.startGame = () => {
            this.gameServer = this.getBestGameServer();
            if (!this.gameServer)
                return;
            const keys = [];
            for (const u of this.players()) {
                u.key = uuid_1.default.v4();
                keys.push(u.key);
            }
            this.gameServer.send('creatematch', {
                keys,
                matchId: this.matchId,
                map: this.map,
                type: this.type,
            });
            for (const u of this.players()) {
                u.client.send('startmatch', {
                    key: u.key,
                    map: this.map,
                    type: this.type,
                });
            }
            this.hasStart = true;
        };
        this.getBestGameServer = () => {
            if (gameserver_1.default.length > 0) {
                return gameserver_1.default[0];
            }
            return null;
        };
        this.checkIfWeCanStart = () => {
            if (this.players().length < this.minUser)
                return;
            const players = this.players().filter(u => u.state !== 2);
            if (players.length === 0) {
                this.startGame();
            }
        };
        this.checkIfFull = () => {
            if (this.players().length === this.maxUser) {
                this.isFull = true;
            }
            else {
                this.isFull = false;
            }
        };
        this.broadcast = (type, data) => {
            this.teams.forEach((team) => {
                team.players.forEach((player) => {
                    player.client.send(type, data);
                });
            });
        };
        this.matchId = utils_1.default.randomInt(1, 10000000);
        this.maxUser = maxUser;
        this.minUser = minUser;
        this.nbPlayersPerTeam = nbPlayersPerTeam;
        this.allowedGap = allowedGap;
        this.map = map;
        this.type = type;
        this.password = password;
        this.teams = [];
        this.gameServer = null;
    }
}
exports.default = Match;
