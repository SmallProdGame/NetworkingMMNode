import { Socket } from 'net';

import Player from './player';
import { createClient } from './matchmakingmanager';

const onUserData = (player: Player, data: string) => {
  try {
    const d = JSON.parse(data);
    if (d.type && d.data) {
      const da = JSON.parse(d.data);
      player.emit(d.type, da);
    }
  } catch (err) {
    console.error(`An error occured while handling player request !`);
    console.error(data);
    console.error(err);
  }
};

const onUserEnd = (player: Player) => {
  console.log('Player disconnected !');
  player.emit('disconnection', {});
};

export const onUserConnect = (socket: Socket) => {
  const player: Player = createClient(socket);
  player.emit('connection', {});
  socket.on('data', (data: string) => onUserData(player, data));
  socket.on('end', () => onUserEnd(player));
  socket.on('error', (err) => console.error(err));
};
