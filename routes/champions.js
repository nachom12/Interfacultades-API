const express = require('express');
const ChampionsService = require('../services/champions');


function champions(app) {
  const router = express.Router();
  app.use("/api/champions", router);
  const championsService = new ChampionsService();

  router.get("/", async function (req, res, next) {
    try {
      const champions = await championsService.getChampions();
      res.status(200).json({
        data: champions,
        message: 'champions listed'
      });
    }
    catch (err) {
      next(err);
    }
  });

  router.get("/:id", async function (req, res, next) {
    const { championId } = req.params;
    try {
      const champions = await championsService.getChampion({ championId });
      res.status(200).json({
        data: champions,
        message: 'champion retrieved'
      });
    }
    catch (err) {
      next(err);
    }
  });

  router.post("/", async function (req, res, next) {
    const { body: champion } = req;
    try {
      const champions = await championsService.createChampion({ champion });
      res.status(201).json({
        data: champions,
        message: 'champion created'
      });
    }
    catch (err) {
      next(err);
    }
  });

  router.put("/:id", async function (req, res, next) {
    const championId = req.params;
    const { body: champion } = req;
    try {
      const champions = await championsService.updateChampion({ championId, champion });
      res.status(200).json({
        data: champions,
        message: 'champion updated'
      });
    }
    catch (err) {
      next(err);
    }
  });

  router.delete("/:id", async function (req, res, next) {
    const championId = req.params;
    try {
      const champions = await championsService.deleteChampion({ championId });
      res.status(200).json({
        data: champions,
        message: 'champion deleted'
      });
    }
    catch (err) {
      next(err);
    }
  });
}


module.exports = { champions }