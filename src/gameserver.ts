import EventHandler from './eventhandler';
import { Socket } from 'net';
import { matchs } from './matchmakingmanager';

export default class GameServer extends EventHandler {
  public static gameServers: GameServer[] = [];
  public authenticated = false;
  protected socket: Socket;

  constructor(socket: Socket) {
    super();
    this.socket = socket;
    this.registerEvents();
  }

  public send = (type: string, data: any) => {
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

  protected registerEvents = () => {
    this.on('match_created', this.onMatchCreated);
    this.on('match_deleted', this.onMatchDeleted);
    this.on('user_removed', this.onUserRemoved);
    this.on('player_leaved', this.onPlayerLeaved);
    this.on('match_end', this.onMatchEnd);
  };

  protected onMatchCreated = (data: any) => {
    const match = matchs.find((m) => m.matchId === data.matchId);
    if (match) {
      match.startMatch();
    }
  };

  protected onMatchDeleted = (data: any) => {
    // Do nothing here
  };

  protected onUserRemoved = (data: any) => {
    // Do nothing here
  };

  protected onPlayerLeaved = (data: any) => {
    const match = matchs.find((m) => m.matchId === data.matchId);
    if (match) {
      const player = match.players().find((u) => u.key === data.key);
      if (player) {
        match.onPlayerLeave(player.client, true);
      }
    }
  };

  protected onMatchEnd = (data: any) => {
    const match = matchs.find((m) => m.matchId === data.matchId);
    if (match) {
      match.endMatch();
    }
  };
}
