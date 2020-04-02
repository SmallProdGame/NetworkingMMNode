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
  id: string;
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
      player.client.userIndex = this.getPlayerIndex(player.client);
    });
    this.checkIfFull();
  };

  onPlayerJoinLobby = (client: Client) => {
    let player: Player | undefined;
    let team: Team | undefined;
    this.teams.forEach(potentialTeam => {
      player = potentialTeam.players.find(u => u.client === client);
      if (player) {
        team = potentialTeam;
      }
    });
    if (player && team) {
      team.players.forEach(pla => {
        pla.state = 1;
        pla.client.send('match_joined', {
          matchId: this.matchId,
          userId: pla.client.userIndex,
        });
      });
      this.broadcast('match_team_joined', {
        players: team.players.map(pla => ({
          userId: pla.client.userIndex,
          ready: false,
        })),
        teamId: team.id,
      });
      this.teams.forEach(otherTeam => {
        if (!team) return;
        team.players.forEach(pla => {
          pla.client.send('match_team_joined', {
            players: otherTeam.players.map(p => ({
              userId: p.client.userIndex,
              ready: p.state === 2,
            })),
            teamId: otherTeam.id,
          });
        });
      });
      return true;
    }
    return false;
  };

  onPlayerReadyLobby = (client: Client) => {
    const player = this.players().find(u => u.client === client);
    if (player) {
      player.state = 2;
      player.client.send('match_ready', {
        matchId: this.matchId,
      });
      this.broadcast('match_player_ready', { userId: player.client.userIndex });
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
      this.isFull = false;

      if (this.hasStart) {
        // Only remove player if match has start
        player.client.match = undefined;
        const index = team.players.indexOf(player);
        team.players.splice(index, 1);
        if (player.state !== 0) {
          this.broadcast('match_player_leaved', {
            userId: player.client.userIndex,
          });
        }
      } else {
        // Remove the whole team if match has not started
        const index = this.teams.indexOf(team);
        this.teams.splice(index, 1);
        if (player.state !== 0) {
          this.broadcast('match_team_leaved', { teamId: team.id });
        }
      }
      if (this.hasStart && this.gameServer && !fromGameServer) {
        this.gameServer.send('remove_user', {
          matchId: this.matchId,
          userKey: player.key,
        });
      }
      if (this.teams.length === 0) {
        if (this.hasStart && this.gameServer) {
          this.gameServer.send('delete_match', { matchId: this.matchId });
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

  startMatch = () => {
    for (const u of this.players()) {
      u.client.send('match_start', {
        key: u.key,
        map: this.map,
        type: this.type,
      });
    }
  };

  endMatch = () => {
    this.teams.forEach(team => {
      team.players.forEach(player => {
        player.client.match = undefined;
      });
    });
    removeMatch(this);
  };

  protected getPlayerIndex = (client: Client) => {
    return `Player ${uuid.v1()}`;
  };

  protected createMatch = () => {
    this.gameServer = this.getBestGameServer();
    if (!this.gameServer) return;
    const keys = [];
    for (const u of this.players()) {
      u.key = uuid.v4();
      keys.push(u.key);
    }
    this.gameServer.send('create_match', {
      keys,
      matchId: this.matchId,
      map: this.map,
      type: this.type,
    });
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
      this.createMatch();
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
