import uuid from 'uuid';
import Client from './client';
import { removeMatch } from './matchmakingmanager';
import gameServers from './gameserver';
import GameServerEntry from './gameserverentry';
import utils from './utils';

export interface Player {
  client: Client;
  state: number;
  key: string | null;
}

export interface Team {
  players: Player[];
  grade: number;
}

export default class Match {
  hasStart = false;
  isFull = false;
  nbPlayersPerTeam: number;
  allowedGap: number;
  matchId: number;
  maxUser: number;
  minUser: number;
  map: string;
  type: string;
  password: string;
  teams: Team[];
  gameServer: GameServerEntry | null;
  async = false;

  constructor(
    maxUser: number,
    minUser: number,
    map: string,
    type: string,
    password: string,
    nbPlayersPerTeam: number,
    allowedGap: number,
  ) {
    this.matchId = utils.randomInt(1, 10000000);
    this.maxUser = maxUser;
    this.minUser = minUser;
    this.nbPlayersPerTeam = nbPlayersPerTeam;
    this.allowedGap = allowedGap;
    this.map = map;
    this.type = type;
    this.password = password;
    this.teams = [];
    this.gameServer = null;
  }

  onTeamJoin = (team: Team, affectedTeam: Team | null = null) => {
    if (affectedTeam) {
      team.players.forEach(player => {
        affectedTeam.players.push(player);
      });
      affectedTeam.grade += team.grade;
    } else {
      this.teams.push(team);
    }
    team.players.forEach(player => {
      player.client.userIndex = `Player ${uuid.v1()}`;
    });
    this.checkIfFull();
  };

  onPlayerJoinLobby = (client: Client) => {
    const player = this.players().find(u => u.client === client);
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
      return true;
    }
    return false;
  };

  onPlayerReadyLobby = (client: Client) => {
    const player = this.players().find(u => u.client === client);
    if (player) {
      player.state = 2;
      this.broadcast('playerreadylobby', { id: player.client.userIndex });
      this.checkIfWeCanStart();
      return true;
    }
    return false;
  };

  onPlayerLeave = (client: Client, fromGameServer: boolean = false) => {
    let player: Player | undefined;
    let team: Team | undefined;
    this.teams.forEach(potentialTeam => {
      player = potentialTeam.players.find(u => u.client === client);
      if (player) {
        team = potentialTeam;
      }
    });
    if (player && team) {
      const index = team.players.indexOf(player);
      team.players.splice(index, 1);
      this.isFull = false;
      player.client.match = undefined;
      if (player.state !== 0) {
        this.broadcast('playerleaved', { id: player.client.userIndex });
      }
      if (this.hasStart && this.gameServer && !fromGameServer) {
        this.gameServer.send('removeuserfrommatch', {
          matchId: this.matchId,
          userKey: player.key,
        });
      }
      if (this.teams.length === 0) {
        if (this.hasStart && this.gameServer) {
          this.gameServer.send('deletematch', { matchId: this.matchId });
        }
        removeMatch(this);
      }
    }
  };

  checkPassword = (password: string) =>
    !this.password || this.password === password;

  players = () => {
    const players: Player[] = [];
    this.teams.forEach(team => {
      team.players.forEach(player => {
        players.push(player);
      });
    });
    return players;
  };

  protected startGame = () => {
    this.gameServer = this.getBestGameServer();
    if (!this.gameServer) return;
    const keys = [];
    for (const u of this.players()) {
      u.key = uuid.v4();
      keys.push(u.key);
    }
    this.gameServer.send('creatematch', {
      keys,
      matchId: this.matchId,
      map: this.map,
      type: this.type,
    });
    for (const u of this.players()) {
      u.client.send('startmatch', {
        key: u.key,
        map: this.map,
        type: this.type,
      });
    }
    this.hasStart = true;
  };

  protected getBestGameServer = (): GameServerEntry | null => {
    // TODO improve this
    if (gameServers.length > 0) {
      return gameServers[0];
    }
    return null;
  };

  protected checkIfWeCanStart = () => {
    if (this.players().length < this.minUser) return;
    const players = this.players().filter(u => u.state !== 2);
    if (players.length === 0) {
      this.startGame();
    }
  };

  protected checkIfFull = () => {
    if (this.players().length === this.maxUser) {
      this.isFull = true;
    } else {
      this.isFull = false;
    }
  };

  protected broadcast = (type: string, data: any) => {
    this.teams.forEach((team: Team) => {
      team.players.forEach((player: Player) => {
        player.client.send(type, data);
      });
    });
  };
}
