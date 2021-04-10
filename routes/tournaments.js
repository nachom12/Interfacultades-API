const express = require('express');
const TournamentsService = require('../services/tournaments.js');

function tournaments(app) {
  const router = express.Router();
  app.use("/api/tournaments", router);

  const tournamentsService = new TournamentsService();

  router.get("/", async function (req, res, next) { // list all
    try {
      const tournaments = await tournamentsService.getTournaments();
      res.status(200).json({
        data: tournaments,
        message: 'tournaments listed'
      });
    } catch (err) {
      next(err);
    }
  })

  router.get("/:tournamentId", async function (req, res, next) { // obtain by id
    const { tournamentId } = req.params;
    try {
      const tournament = await tournamentsService.getTournament({ tournamentId });
      res.status(200).json({
        data: tournament,
        message: 'tournament retrieved'
      });
    } catch (err) {
      next(err);
    }
  })

  router.post("/", async function (req, res, next) { // create
    const { body: tournament } = req;
    try {
      let createdTournamentId;
      if (tournament.type === 'League'){
        createdTournamentId = await tournamentsService.createTournamentLeague({ tournament });
      }
      else {
        createdTournamentId = await tournamentsService.createTournament({ tournament });
      }
      res.status(201).json({
        data: createdTournamentId,
        message: 'tournament created'
      });
    } catch (err) {
      next(err);
    }
  })

  /*PUT COMES FROM ./routes/matches */

  router.delete("/:tournamentId", async function (req, res, next) { // delete
    const { tournamentId } = req.params;
    try {
      const deletedTournamentId = await tournamentsService.deleteTournament({ tournamentId });
      res.status(200).json({
        data: deletedTournamentId,
        message: 'tournament deleted'
      });
    } catch (err) {
      next(err);
    }
  })

}

module.exports = { tournaments };
