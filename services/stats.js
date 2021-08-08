// const matchService = require('../services/matches');
const statsMock = require('../utils/mocks/statsMock');
const TournamentsService = require('../services/tournaments');
const MatchesService = require('../services/matches');
const MongoLib = require('../lib/mongo');

const tournamentsService = new TournamentsService();
const matchesService = new MatchesService();

class StatsService {
  constructor() {
    this.tournaMentCollection = 'tournaments'
    this.mongoDB = new MongoLib();
  };

  generateAllMatchDays(currentMatchDay) {
    let res = [];
    for (let i = 1; i <= currentMatchDay; i++) {
      res.push("Fecha " + i);
    }
    return res;
  }

  async getTeamPointsInEachMatchday(tournamentId) {
    // const tournament = await this.mongoDB.getLastplayedMatchDayInTournament(this.tournaMentCollection, tournamentId);
    // let currentMatchday = tournament.lastMatchDayplayed;

    let currentMatchDay = 3;

    const matchDays = this.generateAllMatchDays(currentMatchDay);

    let tournamentTeams = await tournamentsService.getTeamsInTournament(tournamentId);
    let tournamentMatches = await matchesService.getTournamentMatches(tournamentId);
    let filteredMatches = tournamentMatches.filter((match) => matchDays.indexOf(match.description) >= 0);
    // console.log(filteredMatches);

    tournamentTeams.map((team) => {
      // console.log(team);
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
    const teamMatches = await matchesService.getTeamMatchesInTournament({ teamId, tournamentId }); //sort

    let streak = [];
    let playedMatches = 0;
    let gf = 0;
    let gc = 0;
    let goalsAverage = 0;
    let currentCleanSheets = 0;
    let totalCleanSheets = 0;
    let receivedGoalsAverage = 0;

    teamMatches.map((match) => {
      if (match.state === 'played') {
        playedMatches += 1;
        if (match.team_1_id == teamId) { // team = team_1
          gf += Number(Number(match.team_1_score));
          gc += Number(Number(match.team_2_score));
          if (Number(match.team_1_score) > Number(match.team_2_score)) {
            streak.push('w');
          } else if (Number(match.team_1_score) == Number(match.team_2_score)) {
            streak.push('d');
          } else {
            streak.push('l');
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
          } else if (Number(match.team_1_score) == Number(match.team_2_score)) {
            streak.push('d');
          } else {
            streak.push('l');
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
    });
    let stats = [
      { streak: streak },
      { playedMatches: playedMatches },
      { gf: gf },
      { gc: gc },
      { goalsAverage: goalsAverage },
      { totalCleanSheets: totalCleanSheets },
      { currentCleanSheets: currentCleanSheets },
      { receivedGoalsAverage: receivedGoalsAverage }
    ]
    return stats;
  }

}

module.exports = StatsService;
