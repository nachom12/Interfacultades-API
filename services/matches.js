// eslint-disable-next-line no-unused-vars
const { ObjectId } = require('mongodb');
const MongoLib = require('../lib/mongo');

class MatchesService {
  constructor() {
    this.collection = 'matches';
    this.tournamentCollection = 'tournaments';
    this.mongoDB = new MongoLib();
  }

  async getMatch({ matchId }) {
    const match = await this.mongoDB.get(this.collection, matchId);
    return match || [];
  }

  async getMatches() {
    const matches = await this.mongoDB.getAll(this.collection);
    return matches || [];
  }

  async getTeamMatches({ teamId }) {
    const matches = await this.mongoDB.getTeamMatches(this.collection, teamId);
    return matches || [];
  }

  async getTeamMatchesInTournament({ teamId, tournamentId }) {
    const matches = await this.mongoDB.getTeamMatchesInTournament(this.collection, teamId, tournamentId);
    const isTournamentLeague = await this.mongoDB.isTournamentLeague(this.tournamentCollection, tournamentId);
    const { type } = isTournamentLeague[0];
    if (type === 'League') {
      let matchesSorted = matches.sort((a, b) => parseInt(a.description.replace(/^\D+/g, ''), 10) - parseInt(b.description.replace(/^\D+/g, ''), 10)) 
      return matchesSorted;
    } else {
      return matches || [];
    }
  }

  async getTournamentMatches({ tournamentId }) {
    const matches = await this.mongoDB.getTournamentMatches(this.collection, tournamentId);
    const tournamentInfo = await this.mongoDB.getTournamentInfo(this.tournamentCollection, tournamentId);
    const { type } = tournamentInfo[0] || [];
    if (type === 'League') {
      let matchesSorted = matches.sort((a, b) => parseInt(a.description.replace(/^\D+/g, ''), 10) - parseInt(b.description.replace(/^\D+/g, ''), 10)) 
      return matchesSorted;
    } else {
      return matches || [];
    }
  }

  async getTournamentMatchesByMatchDay({ tournamentId, matchDescription }) {
    const matches = await this.mongoDB.getTournamentMatchesByMatchDay(this.collection, tournamentId, matchDescription);
    const { tournamentInfo } = await this.mongoDB.getTournamentInfo({ tournamentId });
    const { type } = tournamentInfo[0];
    if (type === 'League') {
      let matchesSorted = matches.sort((a, b) => parseInt(a.description.replace(/^\D+/g, ''), 10) - parseInt(b.description.replace(/^\D+/g, ''), 10))
      return matchesSorted;
    } else {
      return matches || [];
    }
  }

  async createMatch({ tournamentId, match }) {
    const createdMatchId = await this.mongoDB.createMatch(this.collection, tournamentId, match);
    return createdMatchId || {};
  }

  async updateMatch({ matchId, matchScore } = {}) {
    const updatedMatchId = await this.mongoDB.updateMatch(this.collection, matchId, matchScore);
    return updatedMatchId || {};
  }

  async deleteMatch({ matchId }) {
    const deletedMatchId = await this.mongoDB.delete(this.collection, matchId)
    return deletedMatchId || {};
  }

  async eraseResult({ matchId, match }) {
    match.team_1_score = null;
    match.team_2_score = null;
    match.state = 'not played';
    await this.mongoDB.eraseResult(this.collection, matchId, match);
    return match;
  }

}

module.exports = MatchesService;
