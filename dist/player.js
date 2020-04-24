"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const uuid_1 = require("uuid");
const match_1 = require("./match");
const matchmakingmanager_1 = require("./matchmakingmanager");
const eventhandler_1 = __importDefault(require("./eventhandler"));
class Player extends eventhandler_1.default {
    constructor(socket) {
        super();
        this.match = undefined;
        this.userIndex = '';
        this.findingMatch = false;
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
        this.registerEvents = () => {
            this.on('find_match', this.onFindMatch);
            this.on('cancel_find_match', this.onCancelFindMatch);
            this.on('create_match', this.onCreateMatch);
            this.on('join_match', this.onJoinMatch);
            this.on('refuse_match', this.onRefuseMatch);
            this.on('ready_match', this.onReadyMatch);
            this.on('leave_match', this.onLeaveMatch);
            this.on('disconnection', this.onDisconnect);
        };
        this.onFindMatch = (data) => {
            if (this.match)
                return;
            this.findingMatch = true;
            const match = this.findMatchSync(data.maxUser, data.minUser, data.map, data.type, [this], 1, 0, 0);
            if (!this.findingMatch)
                return;
            this.send('match_found', {
                matchId: match.matchId,
            });
            this.match = match;
        };
        this.onCancelFindMatch = (data) => {
            this.findingMatch = false;
        };
        this.onCreateMatch = (data) => {
            if (this.match)
                return;
            const match = this.createMatch(data.maxUser, data.minUser, data.map, data.type, data.password, data.nbPlayersPerTeam, data.allowedGap);
            matchmakingmanager_1.addMatch(match);
            this.send('match_created', {
                matchId: match.matchId,
            });
            match.onTeamJoin(this.createTeam(0, [this]));
            match.onPlayerJoinLobby(this);
            this.match = match;
        };
        this.onJoinMatch = (data) => {
            let match = this.match;
            if (!match) {
                match = matchmakingmanager_1.matchs.find((ma) => ma.matchId === data.matchId);
                if (!match) {
                    this.send('match_notfound', {});
                    return;
                }
                if (!match.checkPassword(data.password)) {
                    this.send('match_wrongpassword', {});
                }
                match.onTeamJoin(this.createTeam(0, [this]));
                this.match = match;
            }
            if (!this.match)
                return;
            this.match.onPlayerJoinLobby(this);
        };
        this.onRefuseMatch = (data) => {
            if (!this.match)
                return;
            this.match.onPlayerLeave(this);
        };
        this.onReadyMatch = (data) => {
            if (!this.match)
                return;
            this.match.onPlayerReadyLobby(this);
        };
        this.onLeaveMatch = (data) => {
            if (!this.match)
                return;
            this.match.onPlayerLeave(this);
        };
        this.onDisconnect = () => {
            if (this.match) {
                this.match.onPlayerLeave(this);
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
            potentialMatchs.forEach((potentialMatch) => {
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
            return matchmakingmanager_1.matchs.filter((m) => !m.hasStart &&
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
                id: uuid_1.v4(),
                state: 0,
            };
            players.forEach((player) => {
                team.players.push({
                    client: player,
                    key: null,
                    state: 0,
                });
            });
            return team;
        };
        this.createMatch = (maxUser, minUser, map, type, password, nbPlayersPerTeam, allowedGap) => {
            return new match_1.Match(maxUser, minUser, map, type, password, nbPlayersPerTeam, allowedGap);
        };
        this.socket = socket;
        this.registerEvents();
    }
}
exports.default = Player;
