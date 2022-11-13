import { Router } from "express";
import { getSettings, updateSettings } from "../controllers/settings";
import loki from 'lokijs';

const router = Router();

function init(db: loki) {
  router.route('/settings')
    .get((req, res, next) => {
      const settings = getSettings(db);
      res.json(settings);
    })
    .put((req, res, next) => {
      updateSettings(db, req.body);
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
