import uuid from 'uuid';
import Client from './client';
import { removeMatch } from './matchmakingmanager';
import { GetBestGameServer } from './gameserver';
import GameServerEntry from './gameserverentry';
import { randomInt } from './utils';

interface Player {
  client: Client;
  state: number;
  key: string | null;
}

export default class Match {
  hasStart = false;
  isFull = false;

  matchId: number;
  maxUser: number;
  minUser: number;
  map: string;
  password: string;
  users: Player[];
  gameServer: GameServerEntry | null;

  constructor(maxUser: number, minUser: number, map: string, password: string) {
    this.matchId = randomInt(1, 10000000);
    this.maxUser = maxUser;
    this.minUser = minUser;
    this.map = map;
    this.password = password;
    this.users = [];
    this.gameServer = null;
  }

  onPlayerJoin = (client: Client, password: string = ''): number => {
    if (this.users.length < this.maxUser) {
      if (!this.password || this.password === password) {
        this.users.push({ client, state: 0, key: null });
        this.checkIfFull();
        return this.users.length;
      }
    }
    return 0;
  };

  onPlayerJoinLobby = (client: Client) => {
    const player = this.users.find(u => u.client === client);
    if (player) {
      player.state = 1;
      player.client.send('matchlobbyjoined', {
        matchId: this.matchId,
        userId: player.client.userIndex,
      });
      this.broadcast('playerjoinedlobby', {
        id: player.client.userIndex,
        ready: false,
      });
      this.users.forEach((u: Player, index: number) => {
        if (u !== player) {
          player.client.send('playerjoinedlobby', {
            id: index + 1,
            ready: u.state === 2,
          });
        }
      });
      return true;
    }
    return false;
  };

  onPlayerReadyLobby = (client: Client) => {
    const player = this.users.find(u => u.client === client);
    if (player) {
      const index = this.users.indexOf(player);
      player.state = 2;
      this.broadcast('playerreadylobby', { id: index + 1 });
      this.checkIfWeCanStart();
      return true;
    }
    return false;
  };

  onPlayerLeave = (client: Client) => {
    const player = this.users.find(u => u.client === client);
    if (player) {
      const index = this.users.indexOf(player);
      this.users.splice(index, 1);
      this.isFull = false;
      if (player.state !== 0) {
        this.broadcast('playerleaved', { id: index + 1 });
      }
      if (this.hasStart && this.gameServer) {
        this.gameServer.send('removeuserfrommatch', {
          matchId: this.matchId,
          userKey: player.key,
        });
      }
      if (this.users.length === 0) {
        if (this.hasStart && this.gameServer) {
          this.gameServer.send('deletematch', { matchId: this.matchId });
        }
        removeMatch(this);
      }
    }
  };

  private startGame = () => {
    this.gameServer = GetBestGameServer();
    if (!this.gameServer) return;
    const keys = [];
    for (const u of this.users) {
      u.key = uuid.v4();
      keys.push(u.key);
    }
    this.gameServer.send('creatematch', {
      keys,
      matchId: this.matchId,
      map: this.map,
    });
    for (const u of this.users) {
      u.client.send('startmatch', { key: u.key, map: this.map });
    }
    this.hasStart = true;
  };

  private checkIfWeCanStart = () => {
    if (this.users.length < this.minUser) return;
    const players = this.users.filter(u => u.state !== 2);
    if (players.length === 0) {
      this.startGame();
    }
  };

  private checkIfFull = () => {
    if (this.users.length === this.maxUser) {
      this.isFull = true;
    } else {
      this.isFull = false;
    }
  };

  private broadcast = (type: string, data: any) => {
    this.users.forEach((player: Player) => {
      player.client.send(type, data);
    });
  };
}
