import { Socket } from 'net';
import GameServer from './gameserver';
import { createGameServer } from './matchmakingmanager';

let matchServerKey = 'secret';

export const setMatchServerKey = (key: string) => {
  matchServerKey = key;
};

const onServerData = (server: GameServer, data: string) => {
  try {
    const d = JSON.parse(data);
    if (d.type && d.data) {
      const da = JSON.parse(d.data);
      if (d.type === 'connection') {
        if (da.key === matchServerKey) {
          server.authenticated = true;
          GameServer.gameServers.push(server);
        }
      } else {
        if (server.authenticated) {
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

const onServerEnd = (server: GameServer) => {
  console.log('Game server disconnection !');
  const index = GameServer.gameServers.indexOf(server);
  GameServer.gameServers.splice(index, 1);
  server.emit('disconnection', {});
};

export const onServerConnect = (socket: Socket) => {
  const server: GameServer = createGameServer(socket);
  server.emit('connection', {});
  socket.on('data', (data: string) => onServerData(server, data));
  socket.on('end', () => onServerEnd(server));
  socket.on('error', (err) => console.error(err));
};
