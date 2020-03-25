/// <reference types="node" />
import { Socket } from 'net';
import Match, { Team } from './match';
import EventHandler from './eventhandler';
export default class Client extends EventHandler {
    match: Match | undefined;
    socket: Socket;
    userIndex: string;
    constructor(socket: Socket);
    registerEvents: () => void;
    onFindMatch: (data: any) => void;
    onCreateMatch: (data: any) => void;
    onJoinMatchLobby: (data: any) => void;
    onReadyMatchLobby: (data: any) => void;
    onLeave: () => void;
    send: (type: string, data: any) => void;
    protected findMatchSync: (maxUser: number, minUser: number, map: string, type: string, players: Client[], nbPlayersPerTeam: number, teamGrade: number, allowedGap: number) => Match;
    protected getPotentialMatches: (type: string, map: string, nbPlayersPerTeam: number, nbPlayers: number) => Match[];
    protected createTeam: (teamGrade: number, players: Client[]) => Team;
    protected createMatch: (maxUser: number, minUser: number, map: string, type: string, password: string, nbPlayersPerTeam: number, allowedGap: number) => Match;
}
