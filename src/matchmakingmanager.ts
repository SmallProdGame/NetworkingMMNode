import { Socket } from 'net';
import { Match } from './match';
import Player from './player';
import GameServerEntry from './gameserver';

export const matchs: Match[] = [];
export const waitingTeams: MatchTeam[] = [];

export const addMatch = (match: Match) => {
  matchs.push(match);
};

export const removeMatch = (match: Match) => {
  const index = matchs.indexOf(match);
  matchs.splice(index, 1);
};

let clientCreator = (socket: Socket): Player => {
  return new Player(socket);
};

let gameServerCreator = (socket: Socket): GameServerEntry => {
  return new GameServerEntry(socket);
};

export const setClientCreator = (creator: (socket: Socket) => Player) => {
  clientCreator = creator;
};

export const setGameServerCreator = (
  creator: (socket: Socket) => GameServerEntry,
) => {
  gameServerCreator = creator;
};

export const createClient = (socket: Socket): Player => {
  return clientCreator(socket);
};

export const createGameServer = (socket: Socket): GameServerEntry => {
  return gameServerCreator(socket);
};

export interface MatchPlayer {
  client: Player;
  state: number;
  key: string | null;
}

export interface MatchTeam {
  players: MatchPlayer[];
  grade: number;
  id: string;
  state: number;
}
