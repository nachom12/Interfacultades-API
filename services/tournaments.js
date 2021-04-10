const { ObjectId } = require('mongodb');
const MongoLib = require('../lib/mongo');

class TournamentsService {
  constructor() {
    this.collection = 'tournaments';
    this.mongoDB = new MongoLib();
  }


  async getTournaments() {
    const tournaments = await this.mongoDB.getAll(this.collection);
    return tournaments || [];
  }

  async getTournament({ tournamentId }) {
    const tournament = await this.mongoDB.getTournament(this.collection, tournamentId);
    return tournament || {};
  }

  async createTournament({ tournament }) {
    const createdTournamentId = await this.mongoDB.create(this.collection, tournament);
    return createdTournamentId || {};
  }

  async createTournamentLeague({ tournament }) {
    let tournamentLeague = {};
    tournamentLeague.name = tournament.name;
    tournamentLeague.type = tournament.type;
    tournamentLeague.table = tournament.teams.map((team) => ({ team_id: new ObjectId(team), points: 0, gf: 0, gc: 0, gd: 0 }))
    
    const createdTournamentId = await this.mongoDB.create(this.collection, tournamentLeague);
    return createdTournamentId || {};
  }

  async updateTournament({ tournamentId, matchScore } = {}) {
    const updatedTournamentId = await this.mongoDB.updateTournamentByScore(this.collection, tournamentId, matchScore);
    return updatedTournamentId || {};
  }

  async deleteTournament({ tournamentId }) {
    const deletedTournamentId = await this.mongoDB.delete(this.collection, tournamentId)
    return deletedTournamentId || {};
  }

}

module.exports = TournamentsService;
