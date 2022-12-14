import { Router } from "express";
import loki from 'lokijs';
import { getCommands, createCommand, updateCommand, deleteCommand } from "../controllers/commands";

const router = Router();

function init(db: loki) {
  router.route('/commands')
    .get((req, res, next) => {
      const commands = getCommands();
      res.json(commands);
    })
    .post((req, res, next) => {
      createCommand(db, req.body);
      res.status(201).send();
    })
    .put((req, res, next) => {
      updateCommand(db, req.body);
      res.status(204).send();
    });
  router.route('/commands/:commandId')
    .delete((req, res, next) => {
      deleteCommand(req.params.commandId);
      res.status(204).send();
    });
}

function getRouter() {
  return router;
}

export default {
  init,
  getRouter,
};
