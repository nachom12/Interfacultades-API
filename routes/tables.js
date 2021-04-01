const express = require('express');
const TablesService = require('../services/tables.js');

function tables(app) {
  const router = express.Router();
  app.use("/api/tables", router);

  const tablesService = new TablesService();

  router.get("/", async function (req, res, next) { // list all
    try {
      const tables = await tablesService.getTables();
      res.status(200).json({
        data: tables,
        message: 'tables listed'
      });
    } catch (err) {
      next(err);
    }
  })

  router.get("/:tableId", async function (req, res, next) { // obtain by id
    const { tableId } = req.params;
    try {
      const table = await tablesService.getTable({ tableId });
      res.status(200).json({
        data: table,
        message: 'table retrieved'
      });
    } catch (err) {
      next(err);
    }
  })

  router.post("/", async function (req, res, next) { // create
    const { body: table } = req;
    try {
      const createdTableId = await tablesService.createTable({ table });
      res.status(201).json({
        data: createdTableId,
        message: 'table created'
      });
    } catch (err) {
      next(err);
    }
  })

  /*PUT COMES FROM ./routes/matches */

  router.delete("/:tableId", async function (req, res, next) { // delete
    const { tableId } = req.params;
    try {
      const deletedTableId = await tablesService.deleteTable({ tableId });
      res.status(200).json({
        data: deletedTableId,
        message: 'table deleted'
      });
    } catch (err) {
      next(err);
    }
  })

}

module.exports = { tables };
