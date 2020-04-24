import serverutil from './serverutil';
import { onUserConnect } from './player.server.manager';
import { onServerConnect, setMatchServerKey } from './game.server.manager';
import * as match from './matchmakingmanager';

export const startServers = (serverPort: number, clientPort: number) => {
  try {
    const userServer = serverutil(onUserConnect).on('error', (err) => {
      console.error(err);
    });

    const gameServer = serverutil(onServerConnect).on('error', (err) => {
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
  match,
  gameServer: {
    setMatchServerKey,
  },
};

export * as Player from './player';
export * as GameServer from './gameserver';
export * as Match from './match';
