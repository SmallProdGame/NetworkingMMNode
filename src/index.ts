import serverutil from './serverutil';
import { onUserConnect } from './userserver';
import { onServerConnect } from './gameserver';
import Client from './client';
import GameServerEntry from './gameserverentry';
import MatchMakingManager from './matchmakingmanager';
import Match from './match';

export const startServers = (serverPort: number, clientPort: number) => {
  try {
    const userServer = serverutil(onUserConnect).on('error', err => {
      console.error(err);
    });

    const gameServer = serverutil(onServerConnect).on('error', err => {
      console.error(err);
    });
    userServer.listen({ port: clientPort }, () => {
      console.log(`User server is running!`);
    });
    gameServer.listen({ port: serverPort }, () => {
      console.log(`Game server is running!`);
    });
  } catch (err) {
    console.error(err);
  }
};

export default {
  startServers,
  Client,
  GameServerEntry,
  Match,
  MatchMakingManager,
};

export { Player } from './match';
