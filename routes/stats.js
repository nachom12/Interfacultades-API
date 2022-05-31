const express = require('express');
const StatsService = require('../services/stats');

function stats(app) {
  const router = express.Router();
  app.use("/api/stats", router);

  const statsService = new StatsService();

  router.get("/:tournamentId", async function (req, res, next) {
    const { tournamentId } = req.params;
    try {
      const matches = await statsService.getTeamPointsInEachMatchday({ tournamentId });
      res.status(200).json({
        data: matches,
        message: 'Stats retrieved'
      });
    } catch (err) {
      next(err);
    }
  })

  router.get("/team/:teamId/:tournamentId", async function (req, res, next) {
    const { teamId: teamId, tournamentId: tournamentId } = req.params;
    try {
      const stats = await statsService.getTeamStatsInTournament(teamId, tournamentId);
      res.status(200).json({
        data: stats,
        message: 'Team stats retrieved'
      });
    }
    catch (err) {
      next(err);
    }
  })

}

module.exports = { stats }