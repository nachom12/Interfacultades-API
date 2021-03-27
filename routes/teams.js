const express = require('express');
const { teamsMock } = require('../utils/mocks/teamsMock');

function teams(app) {
  const router = express.Router();
  app.use("/api/teams", router);

  router.get("/", async function (req, res, next) { // list all
    try {
      const teams = await Promise.resolve(teamsMock);
      res.status(200).json({
        data: teams,
        message: 'teams listed'
      });
    } catch (err) {
      next(err);
    }
  })

  router.get("/:teamId", async function (req, res, next) { // obtain by id
    try {
      const team = await Promise.resolve(teamsMock[0]);
      res.status(200).json({
        data: team,
        message: 'team retrieved'
      });
    } catch (err) {
      next(err);
    }
  })

  router.post("/:teamId", async function (req, res, next) { // create
    try {
      const createdTeamId = await Promise.resolve(teamsMock[0].id);
      res.status(201).json({
        data: createdTeamId,
        message: 'team created'
      });
    } catch (err) {
      next(err);
    }
  })

  router.put("/:teamId", async function (req, res, next) { // update
    try {
      const updatedTeamId = await Promise.resolve(teamsMock[0].id);
      res.status(200).json({
        data: updatedTeamId,
        message: 'team created'
      });
    } catch (err) {
      next(err);
    }
  })

  router.delete("/:teamId", async function (req, res, next) { // delete
    try {
      const deletedMovieId = await Promise.resolve(teamsMock[1].id);
      res.status(200).json({
        data: deletedMovieId,
        message: 'team deleted'
      });
    } catch (err) {
      next(err);
    }
  })

}

module.exports = { teams };
