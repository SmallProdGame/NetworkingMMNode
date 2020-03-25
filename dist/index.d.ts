/// <reference types="node" />
import Client from './client';
import GameServerEntry from './gameserverentry';
import Match from './match';
export declare const startServers: (serverPort: number, clientPort: number) => void;
declare const _default: {
    startServers: (serverPort: number, clientPort: number) => void;
    Client: typeof Client;
    GameServerEntry: typeof GameServerEntry;
    Match: typeof Match;
    MatchMakingManager: {
        matchs: Match[];
        addMatch: (match: Match) => void;
        removeMatch: (match: Match) => void;
        setClientCreator: (creator: (socket: import("net").Socket) => Client) => void;
        createClient: (socket: import("net").Socket) => Client;
        setGameServerCreator: (creator: (socket: import("net").Socket) => GameServerEntry) => void;
        createGameServer: (socket: import("net").Socket) => GameServerEntry;
    };
};
export default _default;
export { Player } from './match';
