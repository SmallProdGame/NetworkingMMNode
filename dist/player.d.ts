/// <reference types="node" />
import { Socket } from 'net';
import { Match } from './match';
import { MatchTeam } from './matchmakingmanager';
import EventHandler from './eventhandler';
export default class Player extends EventHandler {
    match: Match | undefined;
    socket: Socket;
    userIndex: string;
    findingMatch: boolean;
    constructor(socket: Socket);
    send: (type: string, data: any) => void;
    protected registerEvents: () => void;
    protected onFindMatch: (data: any) => void;
    protected onCancelFindMatch: (data: any) => void;
    protected onCreateMatch: (data: any) => void;
    protected onJoinMatch: (data: any) => void;
    protected onRefuseMatch: (data: any) => void;
    protected onReadyMatch: (data: any) => void;
    protected onLeaveMatch: (data: any) => void;
    protected onDisconnect: () => void;
    protected findMatchSync: (maxUser: number, minUser: number, map: string, type: string, players: Player[], nbPlayersPerTeam: number, teamGrade: number, allowedGap: number) => Match;
    protected getPotentialMatches: (type: string, map: string, nbPlayersPerTeam: number, nbPlayers: number) => Match[];
    protected createTeam: (teamGrade: number, players: Player[]) => MatchTeam;
    protected createMatch: (maxUser: number, minUser: number, map: string, type: string, password: string, nbPlayersPerTeam: number, allowedGap: number) => Match;
}
