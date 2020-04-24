import { Socket } from 'net';
import { v4 as uuidv4 } from 'uuid';
import { Match } from './match';
import { matchs, addMatch, MatchTeam } from './matchmakingmanager';
import EventHandler from './eventhandler';

export default class Player extends EventHandler {
  public userIndex = '';
  public match: Match | undefined = undefined;
  protected findingMatch = false;
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
    this.on('find_match', this.onFindMatch);
    this.on('cancel_find_match', this.onCancelFindMatch);
    this.on('create_match', this.onCreateMatch);
    this.on('join_match', this.onJoinMatch);
    this.on('refuse_match', this.onRefuseMatch);
    this.on('ready_match', this.onReadyMatch);
    this.on('leave_match', this.onLeaveMatch);
    this.on('disconnection', this.onDisconnect);
  };

  protected onFindMatch = (data: any) => {
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

  protected onCancelFindMatch = (data: any) => {
    this.findingMatch = false;
  };

  protected onCreateMatch = (data: any) => {
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

  protected onJoinMatch = (data: any) => {
    let match = this.match;
    if (!match) {
      match = matchs.find((ma) => ma.matchId === data.matchId);
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

  protected onRefuseMatch = (data: any) => {
    if (!this.match) return;
    this.match.onPlayerLeave(this);
  };

  protected onReadyMatch = (data: any) => {
    if (!this.match) return;
    this.match.onPlayerReadyLobby(this);
  };

  protected onLeaveMatch = (data: any) => {
    if (!this.match) return;
    this.match.onPlayerLeave(this);
  };

  protected onDisconnect = () => {
    if (this.match) {
      this.match.onPlayerLeave(this);
    }
  };

  protected findMatchSync = (
    maxUser: number,
    minUser: number,
    map: string,
    type: string,
    players: Player[],
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
    potentialMatchs.forEach((potentialMatch) => {
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
      (m) =>
        !m.hasStart &&
        !m.isFull &&
        m.type === type &&
        m.map === map &&
        m.nbPlayersPerTeam === nbPlayersPerTeam &&
        m.players().length + nbPlayers < m.maxUser &&
        !m.password,
    );
  };

  protected createTeam = (teamGrade: number, players: Player[]) => {
    const team: MatchTeam = {
      players: [],
      grade: teamGrade,
      id: uuidv4(),
      state: 0,
    };
    players.forEach((player) => {
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
