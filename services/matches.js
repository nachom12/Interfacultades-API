const { ObjectId } = require('mongodb');
const MongoLib = require('../lib/mongo');

class MatchesService {
  constructor() {
    this.collection = 'matches';
    this.mongoDB = new MongoLib();
  }


  async getMatches() {
    const matches = await this.mongoDB.getAll(this.collection);
    return matches || [];
  }

  async getTeamMatches({ teamId }) {
    const matches = await this.mongoDB.getTeamMatches(this.collection, teamId);
    return matches || [];
  }

  async getTeamMatchesInTournament({teamId , tournamentId}){
    const matches = await this.mongoDB.getTeamMatchesInTournament(this.collection, teamId, tournamentId);
    return matches || [];
  }

  async getTournamentMatches({ tournamentId }) {
    const matches = await this.mongoDB.getTournamentMatches(this.collection, tournamentId);
    return matches || [];
  }

  async getTournamentMatchesByMatchDay({tournamentId, matchDescription}){
    const matches = await this.mongoDB.getTournamentMatchesByMatchDay(this.collection, tournamentId ,matchDescription);
    return matches || [];
  }

  async createMatch({ tournamentId, match }) {
    const createdMatchId = await this.mongoDB.createMatch(this.collection, tournamentId ,match);
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

}

module.exports = MatchesService;
