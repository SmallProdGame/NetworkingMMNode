/// <reference types="node" />
import EventHandler from './eventhandler';
import { Socket } from 'net';
export default class GameServerEntry extends EventHandler {
    socket: Socket;
    authenticated: boolean;
    constructor(socket: Socket);
    registerEvents: () => void;
    onPlayerLeave: (data: any) => void;
    send: (type: string, data: any) => void;
}
