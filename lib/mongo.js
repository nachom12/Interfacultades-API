/* eslint-disable no-console */
// eslint-disable-next-line no-unused-vars
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
            console.log('Successfully conected to MongoDB ');
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

  createMatch(collection, tournamentId, match) {
    return this.connect().then(db => {
      return db.collection(collection).insertOne(
        {
          team_1_id: ObjectId(match.team_1_id),
          team_1_score: 0,
          team_2_id: ObjectId(match.team_2_id),
          team_2_score: 0,
          state: "not played",
          description: match.description,
          tournament_id: ObjectId(tournamentId)
        }
      )
    }).then(result => result.insertedId);
  }

  getTournament(collection, id) {
    return this.connect().then(db => {
      return db.collection(collection).aggregate(
        [
          {
            $match: { _id: ObjectId(id) }
          },
          {
            $lookup: {
              from: 'teams',
              localField: 'table.team_id',
              foreignField: '_id',
              as: 'teamData'
            }
          },
        ]
      ).toArray();
    });
  }

  getTournamentInfo(collection, tournamentId) {
    return this.connect().then(db => {
      return db.collection(collection).aggregate(
        [
          { $match: { _id: ObjectId(tournamentId) } },
          { $project: { lastMatchDayPlayed: 1, type: 1, _id: 0 } }
        ]
      ).toArray();
    })
  }

  isTournamentLeague(collection, tournamentId) {
    return this.connect().then(db => {
      return db.collection(collection).aggregate(
        [
          { $match: { _id: ObjectId(tournamentId) } },
          { $project: { type: 1, _id: 0 } }
        ]
      ).toArray();
    })
  }

  // db.students.find( { semester: 1, grades: { $gte: 85 } },
  // { "grades.$": 1 } )

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
      ).toArray();
    });
  }

  getTeamMatches(collection, teamId) {
    return this.connect().then(db => {
      return db.collection(collection).aggregate(
        [
          {
            $match: { $or: [{ team_1_id: ObjectId(teamId) }, { team_2_id: ObjectId(teamId) }] }
          },
          {
            $lookup: {
              from: 'teams',
              localField: 'team_1_id',
              foreignField: '_id',
              as: 'team_1_data'
            }
          },
          {
            $lookup: {
              from: 'teams',
              localField: 'team_2_id',
              foreignField: '_id',
              as: 'team_2_data'
            }
          }
        ]).toArray();
    });
  }

  getTeamMatchesInTournament(collection, teamId, tournament_id) {
    return this.connect().then(db => {
      return db.collection(collection).aggregate(
        [
          {
            $match: { $and: [{ tournament_id: ObjectId(tournament_id) }, { $or: [{ team_1_id: ObjectId(teamId) }, { team_2_id: ObjectId(teamId) }] }] }
          },
          {
            $lookup: {
              from: 'teams',
              localField: 'team_1_id',
              foreignField: '_id',
              as: 'team_1_data'
            }
          },
          {
            $lookup: {
              from: 'teams',
              localField: 'team_2_id',
              foreignField: '_id',
              as: 'team_2_data'
            }
          }
        ]).toArray();
    });
  }

  getTournamentMatches(collection, tournamentId) {
    return this.connect().then(db => {
      return db.collection(collection).aggregate(
        [
          {
            $match: { tournament_id: ObjectId(tournamentId) }
          },
          {
            $lookup: {
              from: 'teams',
              localField: 'team_1_id',
              foreignField: '_id',
              as: 'team_1_data'
            }
          },
          {
            $lookup: {
              from: 'teams',
              localField: 'team_2_id',
              foreignField: '_id',
              as: 'team_2_data'
            }
          }
        ]
      ).toArray();
    })
  }

  getTournamentMatchesByMatchDay(collection, tournamentId, matchDescription) {
    return this.connect().then(db => {
      return db.collection(collection).aggregate(
        [
          {
            $match: { $and: [{ description: matchDescription }, { tournament_id: ObjectId(tournamentId) }] }
          },
          {
            $lookup: {
              from: 'teams',
              localField: 'team_1_id',
              foreignField: '_id',
              as: 'team_1_data'
            }
          },
          {
            $lookup: {
              from: 'teams',
              localField: 'team_2_id',
              foreignField: '_id',
              as: 'team_2_data'
            }
          }
        ]
      ).toArray();
    });
  }

  updateMatch(collection, matchId, data) {
    return this.connect().then(db => {
      return db.collection(collection).updateOne(
        { _id: ObjectId(matchId) },
        { $set: { ...data } }
      )
    }).then(result => result.upsertedId || matchId);
  }

  updateTournamentByScore(collection, tournamentId, matchScore) {
    const { team_1_id, team_1_score, team_2_id, team_2_score } = matchScore;
    if (team_1_score > team_2_score) {  // team 1 wins
      this.connect().then(db => { // update team 1
        db.collection(collection).updateOne(
          { _id: ObjectId(tournamentId), "table.team_id": ObjectId(team_1_id) },
          { $inc: { "table.$.points": 3, "table.$.gf": team_1_score, "table.$.gc": team_2_score, "table.$.gd": team_1_score - team_2_score, "table.$.pm": 1 } }
        )
      })
        .then(
          this.connect().then(db => {  // update team 2
            db.collection(collection).updateOne(
              { _id: ObjectId(tournamentId), "table.team_id": ObjectId(team_2_id) },
              { $inc: { "table.$.points": 0, "table.$.gf": team_2_score, "table.$.gc": team_1_score, "table.$.gd": team_2_score - team_1_score, "table.$.pm": 1 } }
            )
          })
        );
    }
    else if (team_1_score < team_2_score) { // team 2 wins
      this.connect().then(db => { // update team 1
        db.collection(collection).updateOne(
          { _id: ObjectId(tournamentId), "table.team_id": ObjectId(team_1_id) },
          { $inc: { "table.$.points": 0, "table.$.gf": team_1_score, "table.$.gc": team_2_score, "table.$.gd": team_1_score - team_2_score, "table.$.pm": 1 } }
        )
      })
        .then(
          this.connect().then(db => { // update team 2
            db.collection(collection).updateOne(
              { _id: ObjectId(tournamentId), "table.team_id": ObjectId(team_2_id) },
              { $inc: { "table.$.points": 3, "table.$.gf": team_2_score, "table.$.gc": team_1_score, "table.$.gd": team_2_score - team_1_score, "table.$.pm": 1 } }
            )
          })
        );
    }
    else {
      this.connect().then(db => { // update team 1
        db.collection(collection).updateOne(
          { _id: ObjectId(tournamentId), "table.team_id": ObjectId(team_1_id) },
          { $inc: { "table.$.points": 1, "table.$.gf": team_1_score, "table.$.gc": team_2_score, "table.$.gd": team_1_score - team_2_score, "table.$.pm": 1 } }
        )
      })
        .then(
          this.connect().then(db => { // update team 2
            db.collection(collection).updateOne(
              { _id: ObjectId(tournamentId), "table.team_id": ObjectId(team_2_id) },
              { $inc: { "table.$.points": 1, "table.$.gf": team_2_score, "table.$.gc": team_1_score, "table.$.gd": team_2_score - team_1_score, "table.$.pm": 1 } }
            )
          })
        );
    }
    return tournamentId;
  }

  eraseResult(collection, matchId, match) {
    return this.connect().then(db => {
      return db.collection(collection).updateOne({ _id: ObjectId(matchId) }, { $set: match }, { upsert: false });
    }).then(result => result.upsertedId || matchId);
  }

  fixPositionsByErasedResult(collection, match, tournamentId) {
    const { team_1_id, team_1_score, team_2_id, team_2_score } = match;
    if (team_1_score > team_2_score) {  // team 1 won
      this.connect().then(db => { // update team 1
        db.collection(collection).updateOne(
          { _id: ObjectId(tournamentId), "table.team_id": ObjectId(team_1_id) },
          { $inc: { "table.$.points": -3, "table.$.gf": -team_1_score, "table.$.gc": -team_2_score, "table.$.gd": -(team_1_score - team_2_score), "table.$.pm": -1 } }
        )
      })
        .then(
          this.connect().then(db => {  // update team 2
            db.collection(collection).updateOne(
              { _id: ObjectId(tournamentId), "table.team_id": ObjectId(team_2_id) },
              { $inc: { "table.$.points": 0, "table.$.gf": -team_2_score, "table.$.gc": -team_1_score, "table.$.gd": -(team_2_score - team_1_score), "table.$.pm": -1 } }
            )
          })
        );
    } else if (team_1_score < team_2_score) {
      this.connect().then(db => { // update team 1
        db.collection(collection).updateOne(
          { _id: ObjectId(tournamentId), "table.team_id": ObjectId(team_1_id) },
          { $inc: { "table.$.points": 0, "table.$.gf": -team_1_score, "table.$.gc": -team_2_score, "table.$.gd": -(team_1_score - team_2_score), "table.$.pm": -1 } }
        )
      })
        .then(
          this.connect().then(db => { // update team 2
            db.collection(collection).updateOne(
              { _id: ObjectId(tournamentId), "table.team_id": ObjectId(team_2_id) },
              { $inc: { "table.$.points": -3, "table.$.gf": -team_2_score, "table.$.gc": -team_1_score, "table.$.gd": -(team_2_score - team_1_score), "table.$.pm": -1 } }
            )
          })
        );
    } else {
      this.connect().then(db => { // update team 1
        db.collection(collection).updateOne(
          { _id: ObjectId(tournamentId), "table.team_id": ObjectId(team_1_id) },
          { $inc: { "table.$.points": -1, "table.$.gf": -team_1_score, "table.$.gc": -team_2_score, "table.$.gd": -(team_1_score - team_2_score), "table.$.pm": -1 } }
        )
      })
        .then(
          this.connect().then(db => { // update team 2
            db.collection(collection).updateOne(
              { _id: ObjectId(tournamentId), "table.team_id": ObjectId(team_2_id) },
              { $inc: { "table.$.points": -1, "table.$.gf": -team_2_score, "table.$.gc": -team_1_score, "table.$.gd": -(team_2_score - team_1_score), "table.$.pm": -1 } }
            )
          })
        );
    }
  }

}

module.exports = MongoLib;
