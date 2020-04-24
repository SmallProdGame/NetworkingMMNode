/// <reference types="node" />
import { Socket } from 'net';
import { Match } from './match';
import Player from './player';
import GameServerEntry from './gameserver';
export declare const matchs: Match[];
export declare const waitingTeams: MatchTeam[];
export declare const addMatch: (match: Match) => void;
export declare const removeMatch: (match: Match) => void;
export declare const setClientCreator: (creator: (socket: Socket) => Player) => void;
export declare const setGameServerCreator: (creator: (socket: Socket) => GameServerEntry) => void;
export declare const createClient: (socket: Socket) => Player;
export declare const createGameServer: (socket: Socket) => GameServerEntry;
export interface MatchPlayer {
    client: Player;
    state: number;
    key: string | null;
}
export interface MatchTeam {
    players: MatchPlayer[];
    grade: number;
    id: string;
    state: number;
}
