const express = require('express');
const MatchService = require('../services/matches');

function matches(app) {
  const router = express.Router();
  app.use("/api/matches", router);

  const matchService = new MatchService();

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

  router.get("/:teamId", async function (req, res, next) { // obtain team matches.
    const { teamId } = req.params;
    try {
      const match = await matchService.getTeamMatches({ teamId });
      res.status(200).json({
        data: match,
        message: 'matches retrieved'
      });
    } catch (err) {
      next(err);
    }
  })

  router.post("/", async function (req, res, next) { // create
    const { body: match } = req;
    try {
      const createdmatchId = await matchService.createMatch({ match });
      res.status(201).json({
        data: createdmatchId,
        message: 'match created'
      });
    } catch (err) {
      next(err);
    }
  })

  router.put("/:matchId", async function (req, res, next) { // update
    const { matchId } = req.params;
    const { body: match } = req;
    try {
      const updatedmatchId = await matchService.updateMatch({ matchId, match });
      res.status(200).json({
        data: updatedmatchId,
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
