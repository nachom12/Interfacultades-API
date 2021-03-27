const express = require('express');
const TeamsService = require('../services/teams.js');

function teams(app) {
  const router = express.Router();
  app.use("/api/teams", router);

  const teamsService = new TeamsService();

  router.get("/", async function (req, res, next) { // list all
    try {
      const teams = await teamsService.getTeams();
      res.status(200).json({
        data: teams,
        message: 'teams listed'
      });
    } catch (err) {
      next(err);
    }
  })

  router.get("/:teamId", async function (req, res, next) { // obtain by id
    const { teamId } = req.params;
    try {
      const team = await teamsService.getTeam({ teamId });
      res.status(200).json({
        data: team,
        message: 'team retrieved'
      });
    } catch (err) {
      next(err);
    }
  })

  router.post("/", async function (req, res, next) { // create
    const { body: team } = req;
    try {
      const createdTeamId = await teamsService.createTeam({ team });
      res.status(201).json({
        data: createdTeamId,
        message: 'team created'
      });
    } catch (err) {
      next(err);
    }
  })

  router.put("/:teamId", async function (req, res, next) { // update
    const { teamId } = req.params;
    const { body: team } = req;
    try {
      const updatedTeamId = await teamsService.updateTeam({ teamId, team });
      res.status(200).json({
        data: updatedTeamId,
        message: 'team updated'
      });
    } catch (err) {
      next(err);
    }
  })

  router.delete("/:teamId", async function (req, res, next) { // delete
    const { teamId } = req.params;
    try {
      const deletedTeamId = await teamsService.deleteTeam({ teamId });
      res.status(200).json({
        data: deletedTeamId,
        message: 'team deleted'
      });
    } catch (err) {
      next(err);
    }
  })

}

module.exports = { teams };
