import { Socket } from 'net';
import Match from './match';
import { matchs, addMatch } from './matchmakingmanager';
import EventHandler from './eventhandler';

export default class Client extends EventHandler {
  match: Match | undefined = undefined;
  socket: Socket;
  userIndex = '';

  constructor(socket: Socket) {
    super();
    this.socket = socket;
    this.registerEvents();
  }

  registerEvents = () => {
    this.on('findmatch', this.onFindMatch);
    this.on('creatematch', this.onCreateMatch);
    this.on('joinmatchlobby', this.onJoinMatchLobby);
    this.on('readymatchlobby', this.onReadyMatchLobby);
    this.on('disconnection', this.onLeave);
  };

  onFindMatch = (data: any) => {
    if (this.match) return;
    let m: Match | undefined = matchs.find(
      ma => !ma.isFull && !ma.hasStart && !ma.password,
    );
    if (!m) {
      m = new Match(data.maxUser, data.minUser, data.map, '');
      addMatch(m);
    }
    const index: number = m.onPlayerJoin(this, '');
    if (index) {
      this.userIndex = `Player ${index}`;
      this.send('matchfound', { matchId: m.matchId, userId: this.userIndex });
      this.match = m;
    } else {
      console.error('This should not happend ! Error while finding a match');
    }
  };

  onCreateMatch = (data: any) => {
    if (this.match) return;
    const match = new Match(
      data.maxUser,
      data.minUser,
      data.map,
      data.password,
    );
    addMatch(match);
    const index = match.onPlayerJoin(this, data.password);
    match.onPlayerJoinLobby(this);
    this.userIndex = `Player ${index}`;
    this.match = match;
  };

  onJoinMatchLobby = (data: any) => {
    let match = this.match;
    if (!match) {
      match = matchs.find(ma => ma.matchId === data.matchId);
      if (!match) {
        this.send('matchnotfound', {});
        return;
      }
      const index = match.onPlayerJoin(this, data.password);
      if (!index) {
        this.send('matchwrongpassword', {});
        return;
      }
      this.userIndex = `Player ${index}`;
      this.match = match;
    }
    if (!this.match) return;
    this.match.onPlayerJoinLobby(this);
  };

  onReadyMatchLobby = (data: any) => {
    if (!this.match) return;
    this.match.onPlayerReadyLobby(this);
  };

  onLeave = () => {
    if (this.match) {
      this.match.onPlayerLeave(this);
    }
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
