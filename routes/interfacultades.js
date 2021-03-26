const express = require('express');
const { teamsMock } = require('../utils/mocks/teamsMock');

function interfacultadesAPI(app) {
  const router = express.Router();
  app.use("/api/interfacultades", router);

  router.get("/", async function (req, res, next) { // list all
    try {
      const interfacultades = await Promise.resolve(teamsMock);
      res.status(200).json({
        data: interfacultades,
        message: 'teams listed'
      });
    } catch (err) {
      next(err);
    }
  })

  router.get("/:teamId", async function (req, res, next) { // obtain by id
    try {
      const interfacultades = await Promise.resolve(teamsMock[0]);
      res.status(200).json({
        data: interfacultades,
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

module.exports = { interfacultadesAPI };
