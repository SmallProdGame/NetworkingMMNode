import { Socket } from 'net';
import Match, { Team } from './match';
import Client from './client';
import GameServerEntry from './gameserverentry';

export const matchs: Match[] = [];
export const waitingTeams: Team[] = [];

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

let gameServerCreator = (socket: Socket): GameServerEntry => {
  return new GameServerEntry(socket);
};

export const setClientCreator = (creator: (socket: Socket) => Client) => {
  clientCreator = creator;
};

export const setGameServerCreator = (
  creator: (socket: Socket) => GameServerEntry,
) => {
  gameServerCreator = creator;
};

export const createClient = (socket: Socket): Client => {
  return clientCreator(socket);
};

export const createGameServer = (socket: Socket): GameServerEntry => {
  return gameServerCreator(socket);
};

export default {
  matchs,
  addMatch,
  removeMatch,
  setClientCreator,
  createClient,
  setGameServerCreator,
  createGameServer,
};
