const TournamentsService = require('../services/tournaments');
const MatchesService = require('../services/matches');
const MongoLib = require('../lib/mongo');

const tournamentsService = new TournamentsService();
const matchesService = new MatchesService();

class StatsService {
  constructor() {
    this.tournamentCollection = 'tournaments'
    this.mongoDB = new MongoLib();
  };

  generateAllMatchDays(lastMatchDayPlayed) {
    let res = [];
    for (let i = 1; i <= lastMatchDayPlayed; i++) {
      res.push("Fecha " + i);
    }
    return res;
  }

  async getTeamPointsInEachMatchday({ tournamentId }) {
    const tournamentInfo = await this.mongoDB.getTournamentInfo(this.tournamentCollection, tournamentId);
    const { lastMatchDayPlayed } = tournamentInfo[0];
    const matchDays = this.generateAllMatchDays(lastMatchDayPlayed);

    let tournamentTeams = await tournamentsService.getTeamsInTournament({ tournamentId });
    let tournamentMatches = await matchesService.getTournamentMatches({ tournamentId });
    let filteredMatches = tournamentMatches.filter((match) => matchDays.indexOf(match.description) >= 0);

    tournamentTeams.map((team) => {
      let accumulatedPoints = 0;
      let points = [];
      filteredMatches.map((match) => {
        if (match.team_1_data[0].name == team.name) {  //  el team es el team1
          if (Number(match.team_1_score) > Number(match.team_2_score) && match.state == 'played') {
            accumulatedPoints += 3;
          } else if (Number(match.team_1_score) == Number(match.team_2_score) && match.state == 'played') {
            accumulatedPoints += 1;
          }
          points.push({ description: match.description, accumulatedPoints });
        }
        else if (match.team_2_data[0].name == team.name) { // el team es el team2
          if (Number(match.team_2_score) > Number(match.team_1_score) && match.state == 'played') {
            accumulatedPoints += 3;
          } else if (Number(match.team_2_score) == Number(match.team_1_score) && match.state == 'played') {
            accumulatedPoints += 1;
          }
          points.push({ description: match.description, accumulatedPoints });
        }
      });
      team.points = points;
    });
    return tournamentTeams;
  }

  async getTeamStatsInTournament(teamId, tournamentId) {
    const teamMatches = await matchesService.getTeamMatchesInTournament({ teamId, tournamentId });

    let streak = [];
    let playedMatches = 0;
    let wonMatches = 0;
    let lostMatches = 0;
    let tiedMatches = 0;
    let points = 0;
    let gd = 0;
    let gf = 0;
    let gc = 0;
    let goalsAverage = 0;
    let currentCleanSheets = 0;
    let totalCleanSheets = 0;
    let receivedGoalsAverage = 0;

    teamMatches.map((match) => {
      if (match.state === 'played') {
        playedMatches += 1;
        let team1id = match.team_1_id.toString();
        let stringTeamId = teamId.toString();

        if (team1id == stringTeamId) { // team = team_1
          gf += Number(Number(match.team_1_score));
          gc += Number(Number(match.team_2_score));
          if (Number(match.team_1_score) > Number(match.team_2_score)) {
            streak.push('w');
            wonMatches += 1;
          } else if (Number(match.team_1_score) == Number(match.team_2_score)) {
            streak.push('d');
            tiedMatches += 1;
          } else {
            streak.push('l');
            lostMatches += 1;
          }
          if (Number(match.team_2_score) == 0) {
            totalCleanSheets++;
            currentCleanSheets++;
          } else {
            currentCleanSheets = 0;
          }
        }
        else { // team == team_2
          gf += Number(match.team_2_score);
          gc += Number(match.team_1_score);
          if (Number(match.team_2_score) > Number(match.team_1_score)) {
            streak.push('w');
            wonMatches += 1;
          } else if (Number(match.team_1_score) == Number(match.team_2_score)) {
            streak.push('d');
            tiedMatches += 1;
          } else {
            streak.push('l');
            lostMatches += 1;
          }
          if (Number(match.team_1_score) == 0) {
            currentCleanSheets++;
            totalCleanSheets++;
          } else {
            currentCleanSheets = 0;
          }
        }
      }
      goalsAverage = Number((gf / playedMatches).toFixed(2));
      receivedGoalsAverage = Number((gc / playedMatches).toFixed(2));
      gd = gf - gc;
      points = (wonMatches * 3) + tiedMatches
    });
    let stats =
    {
      streak,
      playedMatches,
      wonMatches,
      tiedMatches,
      lostMatches,
      points,
      gd,
      gf,
      gc,
      goalsAverage,
      totalCleanSheets,
      currentCleanSheets,
      receivedGoalsAverage
    }
    return stats;
  }

  async getTournamentPositionsWithStats(tournamentTeams, tournamentId) {
    let resProm = await Promise.all(
      await tournamentTeams.map(async (team) => {
        let stats = await this.getTeamStatsInTournament(team.id, tournamentId);
        team.stats = stats;
        return team;
      })
    );
    resProm.sort((teamA, teamB) => teamB.stats.points - teamA.stats.points || teamB.stats.gd - teamB.stats.gd || teamB.stats.gf - teamB.stats.gf || teamB.stats.gc - teamB.stats.gc);
    return resProm;
  }

}

module.exports = StatsService;
