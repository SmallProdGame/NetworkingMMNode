/// <reference types="node" />
import { Socket } from 'net';
import Match from './match';
import EventHandler from './eventhandler';
export default class Client extends EventHandler {
    match: Match | undefined;
    socket: Socket;
    userIndex: string;
    constructor(socket: Socket);
    registerEvents: () => void;
    onFindMatch: (data: any) => void;
    onCreateMatch: (data: any) => void;
    onJoinMatchLobby: (data: any) => void;
    onReadyMatchLobby: (data: any) => void;
    onLeave: () => void;
    send: (type: string, data: any) => void;
}
