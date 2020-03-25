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
            const match = this.findMatchSync(data.maxUser, data.minUser, data.map, data.type, [this], 1, 0, 0);
            this.send('matchfound', { matchId: match.matchId, userId: this.userIndex });
            this.match = match;
        };
        this.onCreateMatch = (data) => {
            if (this.match)
                return;
            const match = this.createMatch(data.maxUser, data.minUser, data.map, data.type, data.password, data.nbPlayersPerTeam, data.allowedGap);
            matchmakingmanager_1.addMatch(match);
            match.onTeamJoin(this.createTeam(0, [this]));
            match.onPlayerJoinLobby(this);
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
                if (!match.checkPassword(data.password)) {
                    this.send('matchwrongpassword', {});
                }
                match.onTeamJoin(this.createTeam(0, [this]));
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
        this.findMatchSync = (maxUser, minUser, map, type, players, nbPlayersPerTeam, teamGrade, allowedGap) => {
            if (nbPlayersPerTeam !== players.length) {
                throw new Error('Cannot find a match synchronously with an incomplete team!');
            }
            const team = this.createTeam(teamGrade, players);
            const potentialMatchs = this.getPotentialMatches(type, map, nbPlayersPerTeam, players.length);
            const neededPlayers = nbPlayersPerTeam - players.length;
            let match = null;
            let currentAverage = 0;
            potentialMatchs.forEach(potentialMatch => {
                let problem = false;
                let gradeAverage = 0;
                for (const matchTeam of potentialMatch.teams) {
                    gradeAverage += matchTeam.grade;
                    if (matchTeam.grade - potentialMatch.allowedGap > teamGrade ||
                        matchTeam.grade + potentialMatch.allowedGap < teamGrade) {
                        problem = true;
                        break;
                    }
                }
                if (!problem) {
                    gradeAverage /= potentialMatch.teams.length;
                    if (!match ||
                        Math.abs(currentAverage - teamGrade) >
                            Math.abs(gradeAverage - teamGrade)) {
                        currentAverage = gradeAverage;
                        match = potentialMatch;
                    }
                }
            });
            if (!match) {
                match = this.createMatch(maxUser, minUser, map, type, '', nbPlayersPerTeam, allowedGap);
                matchmakingmanager_1.addMatch(match);
            }
            match.onTeamJoin(team);
            return match;
        };
        this.getPotentialMatches = (type, map, nbPlayersPerTeam, nbPlayers) => {
            return matchmakingmanager_1.matchs.filter(m => !m.hasStart &&
                !m.isFull &&
                m.type === type &&
                m.map === map &&
                m.nbPlayersPerTeam === nbPlayersPerTeam &&
                m.players().length + nbPlayers < m.maxUser &&
                !m.password);
        };
        this.createTeam = (teamGrade, players) => {
            const team = {
                players: [],
                grade: teamGrade,
            };
            players.forEach(player => {
                team.players.push({
                    client: player,
                    key: null,
                    state: 0,
                });
            });
            return team;
        };
        this.createMatch = (maxUser, minUser, map, type, password, nbPlayersPerTeam, allowedGap) => {
            return new match_1.default(maxUser, minUser, map, type, password, nbPlayersPerTeam, allowedGap);
        };
        this.socket = socket;
        this.registerEvents();
    }
}
exports.default = Client;
