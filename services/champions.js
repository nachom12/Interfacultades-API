const MongoLib = require('../lib/mongo');

class ChampionsService {
  constructor() {
    this.collection = 'champions';
    this.mongoDB = new MongoLib();
  }


  async getChampionsTeams() {
    const champions = await this.mongoDB.getChampionsTeams(this.collection);
    return champions || [];
  }

  async getChampion({ championId }) {
    const champion = await this.mongoDB.get(this.collection, championId);
    return champion || {};
  }

  async createChampion({ champion }) {
    const createdchampionId = await this.mongoDB.create(this.collection, champion);
    return createdchampionId || {};
  }

  async updateChampion({ championId, champion } = {}) {
    const updatedchampionId = await this.mongoDB.update(this.collection, championId, champion);
    return updatedchampionId || {};
  }

  async deleteChampion({ championId }) {
    const deletedChampionId = await this.mongoDB.delete(this.collection, championId)
    return deletedChampionId || {};
  }

}

module.exports = ChampionsService;