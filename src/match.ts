import { v4 as uuidv4, v1 as uuidv1 } from 'uuid';
import Player from './player';
import { removeMatch, MatchTeam, MatchPlayer } from './matchmakingmanager';
import GameServer from './gameserver';
import utils from './utils';

export class Match {
  public hasStart = false;
  public isFull = false;
  public nbPlayersPerTeam: number;
  public allowedGap: number;
  public matchId: number;
  public maxUser: number;
  public minUser: number;
  public map: string;
  public type: string;
  public password: string;
  public teams: MatchTeam[];
  protected gameServer: GameServer | null;
  protected async = false;

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

  public onTeamJoin = (
    team: MatchTeam,
    affectedTeam: MatchTeam | null = null,
  ) => {
    if (affectedTeam) {
      team.players.forEach((player) => {
        affectedTeam.players.push(player);
      });
      affectedTeam.grade += team.grade;
    } else {
      this.teams.push(team);
    }
    team.players.forEach((player) => {
      player.client.userIndex = this.getPlayerIndex(player.client);
    });
    this.checkIfFull();
  };

  public onPlayerJoinLobby = (client: Player) => {
    let player: MatchPlayer | undefined;
    let team: MatchTeam | undefined;
    this.teams.forEach((potentialTeam) => {
      player = potentialTeam.players.find((u) => u.client === client);
      if (player) {
        team = potentialTeam;
      }
    });
    if (player && team) {
      team.state = 1;
      team.players.forEach((pla) => {
        pla.state = 1;
        pla.client.send('match_joined', {
          matchId: this.matchId,
          userId: pla.client.userIndex,
          teamId: team?.id,
        });
      });
      this.broadcast('match_team_joined', {
        players: team.players.map((pla) => ({
          userId: pla.client.userIndex,
          ready: false,
        })),
        teamId: team.id,
      });
      this.teams.forEach((otherTeam) => {
        if (!team) return;
        if (otherTeam.state !== 0) {
          team.players.forEach((pla) => {
            pla.client.send('match_team_joined', {
              players: otherTeam.players.map((p) => ({
                userId: p.client.userIndex,
                ready: p.state === 2,
              })),
              teamId: otherTeam.id,
            });
          });
        }
      });
      return true;
    }
    return false;
  };

  public onPlayerReadyLobby = (client: Player) => {
    const player = this.players().find((u) => u.client === client);
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

  public onPlayerLeave = (client: Player, fromGameServer: boolean = false) => {
    let player: MatchPlayer | undefined;
    let team: MatchTeam | undefined;
    this.teams.forEach((potentialTeam) => {
      player = potentialTeam.players.find((u) => u.client === client);
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
        if (team.state !== 0) {
          this.broadcast('match_player_leaved', {
            userId: player.client.userIndex,
          });
        }
      } else {
        // Remove the whole team if match has not started
        const index = this.teams.indexOf(team);
        this.teams.splice(index, 1);
        if (team.state !== 0) {
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

  public checkPassword = (password: string) =>
    !this.password || this.password === password;

  public players = () => {
    const players: MatchPlayer[] = [];
    this.teams.forEach((team) => {
      team.players.forEach((player) => {
        players.push(player);
      });
    });
    return players;
  };

  public startMatch = () => {
    for (const u of this.players()) {
      u.client.send('match_start', {
        key: u.key,
        map: this.map,
        type: this.type,
      });
    }
  };

  public endMatch = () => {
    this.teams.forEach((team) => {
      team.players.forEach((player) => {
        player.client.match = undefined;
      });
    });
    removeMatch(this);
  };

  protected getPlayerIndex = (client: Player) => {
    return `Player ${uuidv1()}`;
  };

  protected createMatch = () => {
    this.gameServer = this.getBestGameServer();
    if (!this.gameServer) return;
    const keys = [];
    for (const u of this.players()) {
      u.key = uuidv4();
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

  protected getBestGameServer = (): GameServer | null => {
    // TODO improve this
    if (GameServer.gameServers.length > 0) {
      const nb: number = utils.randomInt(0, GameServer.gameServers.length - 1);
      return GameServer.gameServers[nb];
    }
    return null;
  };

  protected checkIfWeCanStart = () => {
    if (this.players().length < this.minUser) return;
    const players = this.players().filter((u) => u.state !== 2);
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
    this.teams.forEach((team: MatchTeam) => {
      team.players.forEach((player: MatchPlayer) => {
        player.client.send(type, data);
      });
    });
  };
}
