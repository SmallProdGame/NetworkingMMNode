/// <reference types="node" />
import { Socket } from 'net';
import Match from './match';
import Client from './client';
export declare const matchs: Match[];
export declare const addMatch: (match: Match) => void;
export declare const removeMatch: (match: Match) => void;
export declare const setClientCreator: (creator: (socket: Socket) => Client) => void;
export declare const createClient: (socket: Socket) => Client;
