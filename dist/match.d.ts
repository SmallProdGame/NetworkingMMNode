import Client from './client';
import GameServerEntry from './gameserverentry';
export interface Player {
    client: Client;
    state: number;
    key: string | null;
}
export interface Team {
    players: Player[];
    grade: number;
}
export default class Match {
    hasStart: boolean;
    isFull: boolean;
    nbPlayersPerTeam: number;
    allowedGap: number;
    matchId: number;
    maxUser: number;
    minUser: number;
    map: string;
    type: string;
    password: string;
    teams: Team[];
    gameServer: GameServerEntry | null;
    async: boolean;
    constructor(maxUser: number, minUser: number, map: string, type: string, password: string, nbPlayersPerTeam: number, allowedGap: number);
    onTeamJoin: (team: Team, affectedTeam?: Team | null) => void;
    onPlayerJoinLobby: (client: Client) => boolean;
    onPlayerReadyLobby: (client: Client) => boolean;
    onPlayerLeave: (client: Client, fromGameServer?: boolean) => void;
    checkPassword: (password: string) => boolean;
    players: () => Player[];
    protected getPlayerIndex: (client: Client) => string;
    protected startGame: () => void;
    protected getBestGameServer: () => GameServerEntry | null;
    protected checkIfWeCanStart: () => void;
    protected checkIfFull: () => void;
    protected broadcast: (type: string, data: any) => void;
}
