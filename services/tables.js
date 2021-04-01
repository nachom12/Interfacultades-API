const MongoLib = require('../lib/mongo');

class TablesService {
  constructor() {
    this.collection = 'tables';
    this.mongoDB = new MongoLib();
  }


  async getTables() {
    const tables = await this.mongoDB.getAll(this.collection);
    return tables || [];
  }

  async getTable({ tableId }) {
    const table = await this.mongoDB.get(this.collection, tableId);
    return table || {};
  }

  async createTable({ table }) {
    const createdTableId = await this.mongoDB.create(this.collection, table);
    return createdTableId || {};
  }

  async updateTable({ tournamentId ,  matchScore } = {}) {
    const updatedTableId = await this.mongoDB.updateTableByScore(this.collection, tournamentId, matchScore);
    return updatedTableId || {};
  }

  async deleteTable({ tableId }) {
    const deletedTableId = await this.mongoDB.delete(this.collection, tableId)
    return deletedTableId || {};
  }

}

module.exports = TablesService;
