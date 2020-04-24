/// <reference types="node" />
import { Socket } from 'net';
export declare const setMatchServerKey: (key: string) => void;
export declare const onServerConnect: (socket: Socket) => void;
