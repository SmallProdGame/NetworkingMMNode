"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const uuid_1 = require("uuid");
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
                team.players.forEach((player) => {
                    affectedTeam.players.push(player);
                });
                affectedTeam.grade += team.grade;
            }
            else {
                this.teams.push(team);
            }
            team.players.forEach((player) => {
                player.client.userIndex = this.getPlayerIndex(player.client);
            });
            this.checkIfFull();
        };
        this.onPlayerJoinLobby = (client) => {
            let player;
            let team;
            this.teams.forEach((potentialTeam) => {
                player = potentialTeam.players.find((u) => u.client === client);
                if (player) {
                    team = potentialTeam;
                }
            });
            if (player && team) {
                team.state = 1;
                team.players.forEach((pla) => {
                    pla.state = 1;
                    pla.client.send('match_joined', {
                        matchId: this.matchId,
                        userId: pla.client.userIndex,
                        teamId: team === null || team === void 0 ? void 0 : team.id,
                    });
                });
                this.broadcast('match_team_joined', {
                    players: team.players.map((pla) => ({
                        userId: pla.client.userIndex,
                        ready: false,
                    })),
                    teamId: team.id,
                });
                this.teams.forEach((otherTeam) => {
                    if (!team)
                        return;
                    if (otherTeam.state !== 0) {
                        team.players.forEach((pla) => {
                            pla.client.send('match_team_joined', {
                                players: otherTeam.players.map((p) => ({
                                    userId: p.client.userIndex,
                                    ready: p.state === 2,
                                })),
                                teamId: otherTeam.id,
                            });
                        });
                    }
                });
                return true;
            }
            return false;
        };
        this.onPlayerReadyLobby = (client) => {
            const player = this.players().find((u) => u.client === client);
            if (player) {
                player.state = 2;
                player.client.send('match_ready', {
                    matchId: this.matchId,
                });
                this.broadcast('match_player_ready', { userId: player.client.userIndex });
                this.checkIfWeCanStart();
                return true;
            }
            return false;
        };
        this.onPlayerLeave = (client, fromGameServer = false) => {
            let player;
            let team;
            this.teams.forEach((potentialTeam) => {
                player = potentialTeam.players.find((u) => u.client === client);
                if (player) {
                    team = potentialTeam;
                }
            });
            if (player && team) {
                this.isFull = false;
                if (this.hasStart) {
                    player.client.match = undefined;
                    const index = team.players.indexOf(player);
                    team.players.splice(index, 1);
                    if (team.state !== 0) {
                        this.broadcast('match_player_leaved', {
                            userId: player.client.userIndex,
                        });
                    }
                }
                else {
                    const index = this.teams.indexOf(team);
                    this.teams.splice(index, 1);
                    if (team.state !== 0) {
                        this.broadcast('match_team_leaved', { teamId: team.id });
                    }
                }
                if (this.hasStart && this.gameServer && !fromGameServer) {
                    this.gameServer.send('remove_user', {
                        matchId: this.matchId,
                        userKey: player.key,
                    });
                }
                if (this.teams.length === 0) {
                    if (this.hasStart && this.gameServer) {
                        this.gameServer.send('delete_match', { matchId: this.matchId });
                    }
                    matchmakingmanager_1.removeMatch(this);
                }
            }
        };
        this.checkPassword = (password) => !this.password || this.password === password;
        this.players = () => {
            const players = [];
            this.teams.forEach((team) => {
                team.players.forEach((player) => {
                    players.push(player);
                });
            });
            return players;
        };
        this.startMatch = () => {
            for (const u of this.players()) {
                u.client.send('match_start', {
                    key: u.key,
                    map: this.map,
                    type: this.type,
                });
            }
        };
        this.endMatch = () => {
            this.teams.forEach((team) => {
                team.players.forEach((player) => {
                    player.client.match = undefined;
                });
            });
            matchmakingmanager_1.removeMatch(this);
        };
        this.getPlayerIndex = (client) => {
            return `Player ${uuid_1.v1()}`;
        };
        this.createMatch = () => {
            this.gameServer = this.getBestGameServer();
            if (!this.gameServer)
                return;
            const keys = [];
            for (const u of this.players()) {
                u.key = uuid_1.v4();
                keys.push(u.key);
            }
            this.gameServer.send('create_match', {
                keys,
                matchId: this.matchId,
                map: this.map,
                type: this.type,
            });
            this.hasStart = true;
        };
        this.getBestGameServer = () => {
            if (gameserver_1.default.gameServers.length > 0) {
                const nb = utils_1.default.randomInt(0, gameserver_1.default.gameServers.length - 1);
                return gameserver_1.default.gameServers[nb];
            }
            return null;
        };
        this.checkIfWeCanStart = () => {
            if (this.players().length < this.minUser)
                return;
            const players = this.players().filter((u) => u.state !== 2);
            if (players.length === 0) {
                this.createMatch();
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
exports.Match = Match;
