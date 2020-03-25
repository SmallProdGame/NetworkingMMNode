import { Socket } from 'net';

import Client from './client';
import { createClient } from './matchmakingmanager';

const onUserData = (client: Client, data: string) => {
  try {
    const d = JSON.parse(data);
    if (d.type && d.data) {
      const da = JSON.parse(d.data);
      client.emit(d.type, da);
    }
  } catch (err) {
    console.error(`An error occured while handling client request !`);
    console.error(data);
    console.error(err);
  }
};

const onUserEnd = (client: Client) => {
  console.log('User disconnected !');
  client.emit('disconnection', {});
};

export const onUserConnect = (socket: Socket) => {
  const client: Client = createClient(socket);
  client.emit('connection', {});
  socket.on('data', (data: string) => onUserData(client, data));
  socket.on('end', () => onUserEnd(client));
  socket.on('error', err => console.error(err));
};
