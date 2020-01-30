/// <reference types="node" />
import { Socket } from 'net';
import GameServerEntry from './gameserverentry';
declare const gameServers: GameServerEntry[];
export default gameServers;
export declare const GetBestGameServer: () => GameServerEntry | null;
export declare const onServerConnect: (socket: Socket) => void;
