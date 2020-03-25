/// <reference types="node" />
import { Socket } from 'net';
import Match, { Team } from './match';
import Client from './client';
import GameServerEntry from './gameserverentry';
export declare const matchs: Match[];
export declare const waitingTeams: Team[];
export declare const addMatch: (match: Match) => void;
export declare const removeMatch: (match: Match) => void;
export declare const setClientCreator: (creator: (socket: Socket) => Client) => void;
export declare const setGameServerCreator: (creator: (socket: Socket) => GameServerEntry) => void;
export declare const createClient: (socket: Socket) => Client;
export declare const createGameServer: (socket: Socket) => GameServerEntry;
declare const _default: {
    matchs: Match[];
    addMatch: (match: Match) => void;
    removeMatch: (match: Match) => void;
    setClientCreator: (creator: (socket: Socket) => Client) => void;
    createClient: (socket: Socket) => Client;
    setGameServerCreator: (creator: (socket: Socket) => GameServerEntry) => void;
    createGameServer: (socket: Socket) => GameServerEntry;
};
export default _default;
