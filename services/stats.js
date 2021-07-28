// const matchService = require('../services/matches');
const statsMock = require('../utils/mocks/statsMock');
const TournamentsService = require('../services/tournaments');
const MatchesService = require('../services/matches');

const tournamentsService = new TournamentsService();
const matchesService = new MatchesService();

class StatsService {
  constructor() { };

  generateAllMatchDays(currentMatchDay) {
    let res = [];
    for (let i = 1; i <= currentMatchDay; i++) {
      res.push("Fecha " + i);
    }
    return res;
  }

  async getTeamPointsInEachMatchday(tournamentId) {
    // To do : a new endpoint with this info.
    const currentMatchday = 5;

    const matchDays = this.generateAllMatchDays(currentMatchday);

    // Tournament matches.
    const matchesRAW = await statsMock;
    let tournamentMatches = matchesRAW.statsMock[0].data;
    let filteredMatches = tournamentMatches.filter((match) => matchDays.indexOf(match.description) >= 0);

    let tournamentTeams = await tournamentsService.getTeamsInTournament({ tournamentId });

    tournamentTeams.map((team) => {
      let accumulatedPoints = 0;
      let points = [];
      filteredMatches.map((match) => {
        if (match.team_1_id == team.id) {  //  el team es el team1
          if (match.team_1_score > match.team_2_score) {
            accumulatedPoints += 3;
          } else if (match.team_1_score == match.team_2_score) {
            accumulatedPoints += 1;
          }
          points.push({ description: match.description, accumulatedPoints });
        }
        else if (match.team_2_id == team.id) { // el team es el team2
          if (match.team_2_score > match.team_1_score) {
            accumulatedPoints += 3;
          } else if (match.team_2_score == match.team_1_score) {
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
    // const teamMatches = await matchesService.getTeamMatchesInTournament({ teamId, tournamentId });

    // we can avoid this with the line above :)
    const matchesRAW = await statsMock;
    let tournamentMatches = matchesRAW.statsMock[0].data;
    let teamMatches = tournamentMatches.filter((match) => match.team_1_id == teamId || match.team_2_id == teamId)
    //
    let streak = [];
    let playedMatches = 0;
    let gf = 0;
    let gc = 0;
    let goalsAverage = 0;
    let currentCleanSheets = 0;
    let receivedGoalsAverage = 0;

    teamMatches.map((match) => {
      if (match.state === 'played') {
        playedMatches += 1;
        if (match.team_1_id == teamId) { // team = team_1
          gf += match.team_1_score;
          gc += match.team_2_score;
          if (match.team_1_score > match.team_2_score) {
            streak.push('w');
          } else if (match.team_1_score == match.team_2_score) {
            streak.push('l');
          } else {
            streak.push('d');
          }
          if (match.team_2_score == 0) {
            currentCleanSheets++;
          } else {
            currentCleanSheets = 0;
          }
        }
        else { // team == team_2
          gf += match.team_2_score;
          gc += match.team_1_score;
          if (match.team_2_score > match.team_1_score) {
            streak.push('w');
          } else if (match.team_1_score == match.team_2_score) {
            streak.push('l');
          } else {
            streak.push('d');
          }
          if (match.team_1_score == 0) {
            currentCleanSheets++;
          } else {
            currentCleanSheets = 0;
          }
        }
      }
      goalsAverage = gf/playedMatches;
      receivedGoalsAverage = gc/playedMatches;
    });
    let stats = [{streak: streak},{playedMatches: playedMatches}, {gf: gf}, {gc:gc}, {goalsAverage: goalsAverage}, {currentCleanSheets:currentCleanSheets}, {receivedGoalsAverage:receivedGoalsAverage}]
    return stats;
  }

}

module.exports = StatsService;
