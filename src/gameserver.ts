import uuid from 'uuid';
import { Socket } from 'net';
import GameServerEntry from './gameserverentry';

const matchServerKey = 'kujyrhtezd852jy7h7r8451d20cj8y45th1bgf2';

const gameServers: GameServerEntry[] = [];

export default gameServers;

export const GetBestGameServer = () => {
  // TODO improve this
  if (gameServers.length > 0) {
    return gameServers[0];
  }
  return null;
};

export const onServerConnect = (socket: Socket) => {
  const server = new GameServerEntry(socket);
  socket.on('data', (data: string) => onServerData(server, data));
  socket.on('end', () => onServerEnd(server));
};

const onServerData = (server: GameServerEntry, data: string) => {
  try {
    const d = JSON.parse(data);
    if (d.type && d.data) {
      const da = JSON.parse(d.data);
      if (d.type === 'connection') {
        if (da.key === matchServerKey) {
          console.log('New connection on game server !');
          server.authenticated = true;
          gameServers.push(server);
        } else {
          server.socket.end();
        }
      } else {
        if (!server.authenticated) {
          server.socket.end();
        } else {
          // event.emit(`gameserver_${d.type}`, da);
        }
      }
    }
  } catch (err) {
    console.error('An error occured while handling match server request !');
    console.error(err);
  }
};

const onServerEnd = (server: GameServerEntry) => {
  console.log('Game server disconnection !');
  const index = gameServers.indexOf(server);
  gameServers.splice(index, 1);
  // event.emit('gameserver_disconnection', socket);
  console.log('Nb: ', gameServers.length);
};
