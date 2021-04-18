const express = require('express');
const MatchService = require('../services/matches');
const TournamentsService = require('../services/tournaments');

function matches(app) {
  const router = express.Router();
  app.use("/api/matches", router);

  const matchService = new MatchService();
  const tournamentsService = new TournamentsService();

  router.get("/", async function (req, res, next) { // list all 
    try {
      const matches = await matchService.getMatches();
      res.status(200).json({
        data: matches,
        message: 'matches listed'
      });
    } catch (err) {
      next(err);
    }
  })

  router.get("/team/:teamId", async function (req, res, next) { // obtain team matches.
    const { teamId: teamId } = req.params;
    try {
      const data = await matchService.getTeamMatches({ teamId });
      res.status(200).json({
        data: data,
        message: 'team matches retrieved '
      });

    } catch (err) {
      next(err);
    }
  })

  router.get("/tournament/:tournamentId", async function (req, res, next) { // obtain tournament matches.
    const { tournamentId: tournamentId } = req.params;
    try {
      const data = await matchService.getTournamentMatches({ tournamentId });
      res.status(200).json({
        data: data,
        message: 'tournament matches retrieved'
      });

    } catch (err) {
      next(err);
    }
  })

  router.get("/matchday/:tournamentId/", async function (req, res, next) { // obtain tournament matches by matchday.
    const { tournamentId: tournamentId } = req.params;
    const matchDescription = req.query.matchDescription;
    try {
      const data = await matchService.getTournamentMatchesByMatchDay({ tournamentId, matchDescription });
      res.status(200).json({
        data: data,
        message: 'tournament matches retrieved by matchday'
      });

    } catch (err) {
      next(err);
    }
  })

  router.post("/:tournamentId", async function (req, res, next) { // create
    const { tournamentId } = req.params;
    const { body: match } = req;
    try {
      const createdmatchId = await matchService.createMatch({ tournamentId, match});
      res.status(201).json({
        data: createdmatchId,
        message: 'match created'
      });
    } catch (err) {
      next(err);
    }
  })

  router.put("/:matchId", async function (req, res, next) { // update => only match score.
    const { matchId } = req.params;
    const { body: matchScore } = req;
    try {
      const updatedmatchId = await matchService.updateMatch({ matchId, matchScore });
      res.status(200).json({
        data: updatedmatchId,
        message: 'match updated'
      });
    } catch (err) {
      next(err);
    }
  })

  router.put("/:matchId/:tournamentId", async function (req, res, next) { // update => match score and positions if it's appropriate.
    const { matchId: matchId, tournamentId: tournamentId } = req.params;
    const { body: matchScore } = req;
    try {
      const updatedMatchId = await matchService.updateMatch({ matchId, matchScore });
      if (matchId.match_type === 'league'){
        const updatedTournamentId = await tournamentsService.updateTournament({ tournamentId, matchScore });
      }
      res.status(200).json({
        data: { updatedMatchId },
        message: 'match updated'
      });
    } catch (err) {
      next(err);
    }
  })

  router.delete("/:matchId", async function (req, res, next) { // delete
    const { matchId } = req.params;
    try {
      const deletedmatchId = await matchService.deleteMatch({ matchId });
      res.status(200).json({
        data: deletedmatchId,
        message: 'match deleted'
      });
    } catch (err) {
      next(err);
    }
  })

}

module.exports = { matches };
