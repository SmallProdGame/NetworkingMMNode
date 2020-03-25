import { Socket } from 'net';
import GameServerEntry from './gameserverentry';
import { createGameServer } from './matchmakingmanager';

const matchServerKey = 'kujyrhtezd852jy7h7r8451d20cj8y45th1bgf2';

const gameServers: GameServerEntry[] = [];

export default gameServers;

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
          server.emit(d.type, da);
        }
      }
    }
  } catch (err) {
    console.error('An error occured while handling match server request !');
    console.error(data);
    console.error(err);
  }
};

const onServerEnd = (server: GameServerEntry) => {
  console.log('Game server disconnection !');
  const index = gameServers.indexOf(server);
  gameServers.splice(index, 1);
  server.emit('disconnection', {});
  console.log('Nb: ', gameServers.length);
};

export const onServerConnect = (socket: Socket) => {
  const server: GameServerEntry = createGameServer(socket);
  server.emit('connection', {});
  socket.on('data', (data: string) => onServerData(server, data));
  socket.on('end', () => onServerEnd(server));
  socket.on('error', err => console.error(err));
};
