/// <reference types="node" />
import EventHandler from './eventhandler';
import { Socket } from 'net';
export default class GameServer extends EventHandler {
    static gameServers: GameServer[];
    authenticated: boolean;
    protected socket: Socket;
    constructor(socket: Socket);
    send: (type: string, data: any) => void;
    protected registerEvents: () => void;
    protected onMatchCreated: (data: any) => void;
    protected onMatchDeleted: (data: any) => void;
    protected onUserRemoved: (data: any) => void;
    protected onPlayerLeaved: (data: any) => void;
    protected onMatchEnd: (data: any) => void;
}
