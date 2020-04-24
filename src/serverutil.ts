import net, { Socket } from 'net';

export default (onConnect: (socket: Socket) => void) => {
  return net.createServer((socket) => {
    onConnect(socket);
  });
};
