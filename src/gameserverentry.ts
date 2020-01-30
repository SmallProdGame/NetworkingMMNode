import EventHandler from './eventhandler';
import { Socket } from 'net';

export default class GameServerEntry extends EventHandler {
  socket: Socket;
  authenticated = false;

  constructor(socket: Socket) {
    super();
    this.socket = socket;
    this.registerEvents();
  }

  registerEvents = () => {
    // TODO this
  };

  send = (type: string, data: any) => {
    try {
      this.socket.write(
        JSON.stringify({
          type,
          data: JSON.stringify(data),
        }),
      );
    } catch (err) {
      console.error(err);
    }
  };
}
