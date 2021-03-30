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
    const match = await this.mongoDB.getTeamMatches(this.collection, teamId);
    return match || {};
  }

  async createMatch({match}) {
    const createdMatchId = await this.mongoDB.create(this.collection, match);
    return createdMatchId || {};
  }

  async updateMatch({matchId, match} = {}) {
    const updatedMatchId = await this.mongoDB.update(this.collection, matchId,match);
    return updatedMatchId || {};
  }

  async deleteMatch({matchId}) {
    const deletedMatchId = await this.mongoDB.delete(this.collection, matchId)
    return deletedMatchId || {};
  }

}

module.exports = MatchesService;
