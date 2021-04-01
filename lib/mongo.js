/* eslint-disable no-console */
const { Mongo, MongoClient, ObjectId } = require('mongodb');
const { config } = require('../config/index.js');

const USER = encodeURIComponent(config.dbUser);
const PASSWORD = encodeURIComponent(config.dbPassword);
const DB_NAME = config.dbName;

const MONGO_URI = `mongodb+srv://${USER}:${PASSWORD}@${config.dbHost}:${config.dbPort}/${DB_NAME}?retryWrites=true&w=majority`;


class MongoLib {
  constructor() {
    this.client = new MongoClient(MONGO_URI, { useNewUrlParser: true });
    this.dbName = DB_NAME;
  }

  connect() {
    if (!MongoLib.connection) {
      MongoLib.connection = new Promise((resolve, reject) => {
        this.client.connect(err => {
          if (err) {
            reject(err);
          }
          else {
            console.log('Successfully conected to Mongo');
            resolve(this.client.db(this.dbName));
          }
        })
      })
    }
    return MongoLib.connection;
  }

  getAll(collection) {
    return this.connect().then(db => {
      return db.collection(collection).find({}).toArray();
    })
  }

  get(collection, id) {
    return this.connect().then(db => {
      return db.collection(collection).findOne({ _id: ObjectId(id) });
    })
  }

  create(collection, data) {
    return this.connect().then(db => {
      return db.collection(collection).insertOne(data);
    }).then(result => result.insertedId);
  }

  update(collection, id, data) {
    return this.connect().then(db => {
      return db.collection(collection).updateOne({ _id: ObjectId(id) }, { $set: data }, { upsert: false });
    }).then(result => result.upsertedId || id);
  }

  delete(collection, id) {
    return this.connect().then(db => {
      return db.collection(collection).deleteOne({ _id: ObjectId(id) });
    }).then(() => id)
  }

  getChampionsTeams(collection) {
    return this.connect().then(db => {
      return db.collection(collection).aggregate(
        [
          {
            $project: { team_id: { $toObjectId: '$team_id' }, year: '$year', cup: '$cup' }
          },
          {
            $lookup:
            {
              from: 'teams',
              localField: 'team_id',
              foreignField: '_id',
              as: 'teamData'
            }
          }
        ]
      ).toArray()
    });
  }

  getTeamMatches(collection, teamId) {
    return this.connect().then(db => {
      return db.collection(collection).find({ $or: [{ team_1_id: ObjectId(teamId) }, { team_2_id: ObjectId(teamId) }] }).toArray();
    });
  }

  getTournamentMatches(collection, tournamentId) {
    return this.connect().then(db => {
      return db.collection(collection).find({ tournament_id: ObjectId(tournamentId) }).toArray();
    });
  }

  getTournamentMatchesByMatchDay(collection, tournamentId ,matchday){
    const { matchDescription } = matchday;
    return this.connect().then(db =>{
      return db.collection(collection).find( { $and:  [{ description : matchDescription } , {tournament_id: ObjectId(tournamentId)}]}).toArray();
    });
  }

  updateMatch(collection, matchId, data) {
    return this.connect().then(db => {
      return db.collection(collection).updateOne(
        { _id: ObjectId(matchId) },
        { $set: { team_1_score: data.team_1_score, team_2_score: data.team_2_score, state: data.state } }
      )
    }).then(result => result.upsertedId || matchId);
  }

  updateTournamentByScore(collection, tournamentId, matchScore) {
    const { team_1_id, team_1_score, team_2_id, team_2_score } = matchScore;
    if (team_1_score > team_2_score) {  // team 1 wins
      this.connect().then(db => { // update team 1
        db.collection(collection).updateOne(
          { _id: ObjectId(tournamentId), "table.team_id": ObjectId(team_1_id) },
          { $inc: { "table.$.points": 3, "table.$.gf": team_1_score, "table.$.gc": team_2_score, "table.$.gd": team_1_score - team_2_score } }
        )
      })
        .then(
          this.connect().then(db => {  // update team 2
            db.collection(collection).updateOne(
              { _id: ObjectId(tournamentId), "table.team_id": ObjectId(team_2_id) },
              { $inc: { "table.$.points": 0, "table.$.gf": team_2_score, "table.$.gc": team_1_score, "table.$.gd": team_2_score - team_1_score } }
            )
          })
        );
    }
    else if (team_1_score < team_2_score) { // team 2 wins
      this.connect().then(db => { // update team 1
        db.collection(collection).updateOne(
          { _id: ObjectId(tournamentId), "table.team_id": ObjectId(team_1_id) },
          { $inc: { "table.$.points": 0, "table.$.gf": team_1_score, "table.$.gc": team_2_score, "table.$.gd": team_1_score - team_2_score } }
        )
      })
        .then(
          this.connect().then(db => { // update team 2
            db.collection(collection).updateOne(
              { _id: ObjectId(tournamentId), "table.team_id": ObjectId(team_2_id) },
              { $inc: { "table.$.points": 3, "table.$.gf": team_2_score, "table.$.gc": team_1_score, "table.$.gd": team_2_score - team_1_score } }
            )
          })
        );
    }
    else {
      this.connect().then(db => { // update team 1
        db.collection(collection).updateOne(
          { _id: ObjectId(tournamentId), "table.team_id": ObjectId(team_1_id) },
          { $inc: { "table.$.points": 1, "table.$.gf": team_1_score, "table.$.gc": team_2_score, "table.$.gd": team_1_score - team_2_score } }
        )
      })
        .then(
          this.connect().then(db => { // update team 2
            db.collection(collection).updateOne(
              { _id: ObjectId(tournamentId), "table.team_id": ObjectId(team_2_id) },
              { $inc: { "table.$.points": 1, "table.$.gf": team_2_score, "table.$.gc": team_1_score, "table.$.gd": team_2_score - team_1_score } }
            )
          })
        );
    }
    return tournamentId;
  }
}

module.exports = MongoLib;
