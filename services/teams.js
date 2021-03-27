const MongoLib = require('../lib/mongo');

class TeamsService {
  constructor() {
    this.collection = 'teams';
    this.mongoDB = new MongoLib();
  }


  async getTeams() {
    const teams = await this.mongoDB.getAll(this.collection);
    return teams || [];
  }

  async getTeam({ teamId }) { 
    const team = await this.mongoDB.get(this.collection, teamId);
    return team || {};
  }

  async createTeam({team}) {
    const createdTeamId = await this.mongoDB.create(this.collection, team);
    return createdTeamId || {};
  }

  async updateTeam({teamId, team} = {}) {
    const updatedTeamId = await this.mongoDB.update(this.collection, teamId,team);
    return updatedTeamId || {};
  }

  async deleteTeam({teamId}) {
    const deletedMovieId = await this.mongoDB.delete(this.collection, teamId)
    return deletedMovieId || {};
  }

}

module.exports = TeamsService;
