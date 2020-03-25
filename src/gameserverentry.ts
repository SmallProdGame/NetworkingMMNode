import EventHandler from './eventhandler';
import { Socket } from 'net';
import { matchs } from './matchmakingmanager';

export default class GameServerEntry extends EventHandler {
  socket: Socket;
  authenticated = false;

  constructor(socket: Socket) {
    super();
    this.socket = socket;
    this.registerEvents();
  }

  registerEvents = () => {
    this.on('playerleave', this.onPlayerLeave);
  };

  onPlayerLeave = (data: any) => {
    const match = matchs.find(m => m.matchId === data.matchId);
    if (match) {
      const player = match.players().find(u => u.key === data.key);
      if (player) {
        match.onPlayerLeave(player.client, true);
      }
    }
  };

  send = (type: string, data: any) => {
    try {
      if (!this.socket.writable) return;
      this.socket.write(
        `${JSON.stringify({
          type,
          data: JSON.stringify(data),
        })}\\n`,
      );
    } catch (err) {
      console.error(err);
    }
  };
}
