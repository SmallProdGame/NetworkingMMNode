import { Socket } from 'net';
import uuid from 'uuid';
import Match, { Team } from './match';
import { matchs, addMatch, waitingTeams } from './matchmakingmanager';
import EventHandler from './eventhandler';

export default class Client extends EventHandler {
  match: Match | undefined = undefined;
  socket: Socket;
  userIndex = '';
  findingMatch = false;

  constructor(socket: Socket) {
    super();
    this.socket = socket;
    this.registerEvents();
  }

  registerEvents = () => {
    this.on('find_match', this.onFindMatch);
    this.on('cancel_find_match', this.onCancelFindMatch);
    this.on('create_match', this.onCreateMatch);
    this.on('join_match', this.onJoinMatch);
    this.on('refuse_match', this.onRefuseMatch);
    this.on('ready_match', this.onReadyMatch);
    this.on('leave_match', this.onLeaveMatch);
    this.on('disconnection', this.onDisconnect);
  };

  onFindMatch = (data: any) => {
    if (this.match) return;
    this.findingMatch = true;
    const match = this.findMatchSync(
      data.maxUser,
      data.minUser,
      data.map,
      data.type,
      [this],
      1,
      0,
      0,
    );
    if (!this.findingMatch) return;
    this.send('match_found', {
      matchId: match.matchId,
    });
    this.match = match;
  };

  onCancelFindMatch = (data: any) => {
    this.findingMatch = false;
  };

  onCreateMatch = (data: any) => {
    if (this.match) return;
    const match = this.createMatch(
      data.maxUser,
      data.minUser,
      data.map,
      data.type,
      data.password,
      data.nbPlayersPerTeam,
      data.allowedGap,
    );
    addMatch(match);
    this.send('match_created', {
      matchId: match.matchId,
    });
    match.onTeamJoin(this.createTeam(0, [this]));
    match.onPlayerJoinLobby(this);
    this.match = match;
  };

  onJoinMatch = (data: any) => {
    let match = this.match;
    if (!match) {
      match = matchs.find(ma => ma.matchId === data.matchId);
      if (!match) {
        this.send('match_notfound', {});
        return;
      }
      if (!match.checkPassword(data.password)) {
        this.send('match_wrongpassword', {});
      }
      match.onTeamJoin(this.createTeam(0, [this]));
      this.match = match;
    }
    if (!this.match) return;
    this.match.onPlayerJoinLobby(this);
  };

  onRefuseMatch = (data: any) => {
    if (!this.match) return;
    this.match.onPlayerLeave(this);
  };

  onReadyMatch = (data: any) => {
    if (!this.match) return;
    this.match.onPlayerReadyLobby(this);
  };

  onLeaveMatch = (data: any) => {
    if (!this.match) return;
    this.match.onPlayerLeave(this);
  };

  onDisconnect = () => {
    if (this.match) {
      this.match.onPlayerLeave(this);
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

  protected findMatchSync = (
    maxUser: number,
    minUser: number,
    map: string,
    type: string,
    players: Client[],
    nbPlayersPerTeam: number,
    teamGrade: number,
    allowedGap: number,
  ): Match => {
    // * Error handling ...
    if (nbPlayersPerTeam !== players.length) {
      throw new Error(
        'Cannot find a match synchronously with an incomplete team!',
      );
    }
    // * ... END
    // * Create the new team ...
    const team = this.createTeam(teamGrade, players);
    // * ... END
    // * Get potentials match ...
    const potentialMatchs = this.getPotentialMatches(
      type,
      map,
      nbPlayersPerTeam,
      players.length,
    );
    // * ... END
    // * Get a compatible match ...
    const neededPlayers = nbPlayersPerTeam - players.length;
    let match: Match | null = null;
    let currentAverage = 0;
    potentialMatchs.forEach(potentialMatch => {
      let problem = false;
      let gradeAverage = 0;
      // * Test grade ...
      for (const matchTeam of potentialMatch.teams) {
        gradeAverage += matchTeam.grade;
        if (
          matchTeam.grade - potentialMatch.allowedGap > teamGrade ||
          matchTeam.grade + potentialMatch.allowedGap < teamGrade
        ) {
          problem = true;
          break;
        }
      }
      // * ... END
      if (!problem) {
        gradeAverage /= potentialMatch.teams.length;
        if (
          !match ||
          Math.abs(currentAverage - teamGrade) >
            Math.abs(gradeAverage - teamGrade)
        ) {
          currentAverage = gradeAverage;
          match = potentialMatch;
        }
      }
    });
    // * ... END

    // * Create match if needed ...
    if (!match) {
      match = this.createMatch(
        maxUser,
        minUser,
        map,
        type,
        '',
        nbPlayersPerTeam,
        allowedGap,
      );
      addMatch(match);
    }
    // * ... END

    // * Add team in the match ...
    match.onTeamJoin(team);
    // * ... END
    return match;
  };

  /*
  protected findMatchAsync = (
    maxUser: number,
    minUser: number,
    map: string,
    type: string,
    players: Client[],
    nbPlayersPerTeam: number,
    teamGrade: number,
    allowedGap: number,
    method: 'bestfit' | 'firstfit',
  ) => {
    // * Create the new team ...
    const team = this.createTeam(teamGrade, players);
    // * ... END
    const potentialTeams = waitingTeams;
    const teams = [team];
    const neededPlayers = nbPlayersPerTeam - players.length;
    if (neededPlayers > 0) {
      const playerGradeAvg = teamGrade / players.length;

      for (const potentialTeam of potentialTeams) {
        if (potentialTeam.players.length <= neededPlayers && playerGradeAvg - allowedGap > ) {

        }
      }
    }
  };
  */

  protected getPotentialMatches = (
    type: string,
    map: string,
    nbPlayersPerTeam: number,
    nbPlayers: number,
  ) => {
    return matchs.filter(
      m =>
        !m.hasStart &&
        !m.isFull &&
        m.type === type &&
        m.map === map &&
        m.nbPlayersPerTeam === nbPlayersPerTeam &&
        m.players().length + nbPlayers < m.maxUser &&
        !m.password,
    );
  };

  protected createTeam = (teamGrade: number, players: Client[]) => {
    const team: Team = {
      players: [],
      grade: teamGrade,
      id: uuid.v4(),
    };
    players.forEach(player => {
      team.players.push({
        client: player,
        key: null,
        state: 0,
      });
    });
    return team;
  };

  protected createMatch = (
    maxUser: number,
    minUser: number,
    map: string,
    type: string,
    password: string,
    nbPlayersPerTeam: number,
    allowedGap: number,
  ) => {
    return new Match(
      maxUser,
      minUser,
      map,
      type,
      password,
      nbPlayersPerTeam,
      allowedGap,
    );
  };
}
