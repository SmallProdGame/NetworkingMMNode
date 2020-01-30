import Client from './client';
import GameServerEntry from './gameserverentry';
interface Player {
    client: Client;
    state: number;
    key: string | null;
}
export default class Match {
    hasStart: boolean;
    isFull: boolean;
    matchId: number;
    maxUser: number;
    minUser: number;
    map: string;
    password: string;
    users: Player[];
    gameServer: GameServerEntry | null;
    constructor(maxUser: number, minUser: number, map: string, password: string);
    onPlayerJoin: (client: Client, password?: string) => number;
    onPlayerJoinLobby: (client: Client) => boolean;
    onPlayerReadyLobby: (client: Client) => boolean;
    onPlayerLeave: (client: Client) => void;
    private startGame;
    private checkIfWeCanStart;
    private checkIfFull;
    private broadcast;
}
export {};
