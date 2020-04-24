import * as match from './matchmakingmanager';
export declare const startServers: (serverPort: number, clientPort: number) => void;
declare const _default: {
    startServers: (serverPort: number, clientPort: number) => void;
    match: typeof match;
    gameServer: {
        setMatchServerKey: (key: string) => void;
    };
};
export default _default;
export * as Player from './player';
export * as GameServer from './gameserver';
export * as Match from './match';
