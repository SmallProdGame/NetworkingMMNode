import { Socket } from 'net';
import Match from './match';
import Client from './client';

export const matchs: Match[] = [];

export const addMatch = (match: Match) => {
  matchs.push(match);
};

export const removeMatch = (match: Match) => {
  const index = matchs.indexOf(match);
  matchs.splice(index, 1);
};

let clientCreator = (socket: Socket): Client => {
  return new Client(socket);
};

export const setClientCreator = (creator: (socket: Socket) => Client) => {
  clientCreator = creator;
};

export const createClient = (socket: Socket): Client => {
  return clientCreator(socket);
};
